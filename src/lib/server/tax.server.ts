import { getSql } from "@/lib/db";
import { creditVault } from "@/lib/server/vault.server";
import type { TaxAppliesOn, TaxBill, TaxCharge, TaxKind } from "@/lib/types";
import { formatWon, num } from "@/lib/utils";

export type { TaxAppliesOn, TaxCharge, TaxKind, TaxBill };

function mapKind(row: {
  id: number;
  name: string;
  applies_on: string;
  charge: string;
  rate: unknown;
  amount: unknown;
  is_active: boolean;
  sort_order: number;
}): TaxKind {
  return {
    id: row.id,
    name: row.name,
    appliesOn: row.applies_on as TaxAppliesOn,
    charge: row.charge as TaxCharge,
    rate: num(row.rate),
    amount: num(row.amount),
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function getTaxVault(): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ tax_vault: unknown }>`select tax_vault from settings where id = 1`;
  return num(rows[0]?.tax_vault);
}

export async function listTaxKinds(activeOnly = false): Promise<TaxKind[]> {
  const sql = await getSql();
  const rows = activeOnly
    ? await sql<{
        id: number;
        name: string;
        applies_on: string;
        charge: string;
        rate: unknown;
        amount: unknown;
        is_active: boolean;
        sort_order: number;
      }>`
        select id, name, applies_on, charge, rate, amount, is_active, sort_order
        from tax_kinds
        where is_active = true
        order by sort_order, id
      `
    : await sql<{
        id: number;
        name: string;
        applies_on: string;
        charge: string;
        rate: unknown;
        amount: unknown;
        is_active: boolean;
        sort_order: number;
      }>`
        select id, name, applies_on, charge, rate, amount, is_active, sort_order
        from tax_kinds
        order by sort_order, id
      `;
  return rows.map(mapKind);
}

export async function listUnpaidBills(studentId: number): Promise<TaxBill[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    tax_kind_id: number | null;
    kind_name: string;
    amount: unknown;
    paid: unknown;
  }>`
    select id, tax_kind_id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id
  `;
  return rows.map((r) => ({
    id: r.id,
    kindId: r.tax_kind_id,
    kindName: r.kind_name,
    amount: num(r.amount),
    paid: num(r.paid),
    due: num(r.amount) - num(r.paid),
  }));
}

/** Whole-won tax. Any positive taxable amount bills at least 1원. */
export function taxOn(base: number, ratePct: number): number {
  if (base <= 0 || ratePct <= 0) return 0;
  const raw = (base * ratePct) / 100;
  return Math.max(1, Math.round(raw));
}

export function chargeOn(kind: TaxKind, base: number): number {
  if (!kind.isActive) return 0;
  if (kind.charge === "fixed") return kind.amount > 0 ? Math.round(kind.amount) : 0;
  return taxOn(base, kind.rate);
}

export async function accrueTax(
  studentId: number,
  amount: number,
  kind?: Pick<TaxKind, "id" | "name">,
): Promise<number> {
  if (amount <= 0) return 0;
  const sql = await getSql();
  await sql`update students set tax_due = tax_due + ${amount} where id = ${studentId}`;
  if (kind) {
    await sql`
      insert into tax_bills (student_id, tax_kind_id, kind_name, amount)
      values (${studentId}, ${kind.id}, ${kind.name}, ${amount})
    `;
  }
  return amount;
}

export async function accrueTriggerTax(
  studentId: number,
  appliesOn: TaxAppliesOn,
  base: number,
): Promise<number> {
  const kinds = (await listTaxKinds(true)).filter((k) => k.appliesOn === appliesOn);
  let total = 0;
  for (const kind of kinds) {
    const amt = chargeOn(kind, base);
    if (amt > 0) total += await accrueTax(studentId, amt, kind);
  }
  return total;
}

export async function reduceTaxDue(studentId: number, amount: number): Promise<void> {
  if (amount <= 0) return;
  const sql = await getSql();
  await sql`
    update students
    set tax_due = greatest(tax_due - ${amount}, 0)
    where id = ${studentId}
  `;
}

export async function reverseTriggerTax(
  studentId: number,
  appliesOn: TaxAppliesOn,
  base: number,
): Promise<number> {
  const kinds = (await listTaxKinds(true)).filter((k) => k.appliesOn === appliesOn);
  const want = kinds.reduce((sum, kind) => sum + chargeOn(kind, base), 0);
  if (want <= 0) return 0;
  const kindIds = new Set(kinds.map((k) => k.id));
  const names = new Set(kinds.map((k) => k.name));
  const sql = await getSql();
  const bills = await sql<{
    id: number;
    tax_kind_id: number | null;
    kind_name: string;
    amount: unknown;
    paid: unknown;
  }>`
    select id, tax_kind_id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id desc
  `;
  let left = want;
  let reduced = 0;
  for (const bill of bills) {
    if (left <= 0) break;
    const match =
      (bill.tax_kind_id != null && kindIds.has(bill.tax_kind_id)) || names.has(bill.kind_name);
    if (!match) continue;
    const open = num(bill.amount) - num(bill.paid);
    const take = Math.min(open, left);
    const nextAmount = num(bill.amount) - take;
    if (nextAmount <= num(bill.paid)) {
      await sql`delete from tax_bills where id = ${bill.id}`;
    } else {
      await sql`update tax_bills set amount = ${nextAmount} where id = ${bill.id}`;
    }
    left -= take;
    reduced += take;
  }
  const cut = reduced > 0 ? reduced : want;
  await reduceTaxDue(studentId, cut);
  return cut;
}

export async function assessKind(
  kindId: number,
  studentId?: number,
): Promise<{ billed: number; count: number }> {
  const kind = (await listTaxKinds()).find((k) => k.id === kindId);
  if (!kind) throw new Error("세금을 찾을 수 없어요.");
  if (!kind.isActive) throw new Error("꺼 둔 세금은 고지할 수 없어요.");
  const sql = await getSql();
  const students = studentId
    ? await sql<{ id: number; cash: unknown; salary: unknown }>`
        select s.id, s.cash, j.salary
        from students s
        left join jobs j on j.id = s.job_id
        where s.id = ${studentId}
      `
    : await sql<{ id: number; cash: unknown; salary: unknown }>`
        select s.id, s.cash, j.salary
        from students s
        left join jobs j on j.id = s.job_id
      `;
  let billed = 0;
  let count = 0;
  for (const s of students) {
    const base = kind.charge === "fixed" ? 0 : kind.appliesOn === "income" ? num(s.salary) : num(s.cash);
    const amt = chargeOn(kind, base);
    if (amt <= 0) continue;
    await accrueTax(s.id, amt, kind);
    billed += amt;
    count += 1;
  }
  return { billed, count };
}

export async function collectFromStudent(
  studentId: number,
  requested?: number,
): Promise<{ paid: number; left: number }> {
  const sql = await getSql();
  const rows = await sql<{ cash: unknown; tax_due: unknown; name: string }>`
    select cash, tax_due, name from students where id = ${studentId}
  `;
  const row = rows[0];
  if (!row) throw new Error("학생을 찾을 수 없어요.");
  const cash = num(row.cash);
  const due = num(row.tax_due);
  if (due <= 0) return { paid: 0, left: 0 };
  const want = requested != null && requested > 0 ? Math.min(requested, due) : due;
  const paid = Math.min(want, cash);
  if (paid <= 0) throw new Error("낼 돈이 부족해요. 먼저 통장 잔액을 채워 주세요.");
  await sql`
    update students
    set cash = cash - ${paid}, tax_due = tax_due - ${paid}
    where id = ${studentId}
  `;
  await creditVault(paid, "tax", `${row.name} 세금`);

  const bills = await sql<{
    id: number;
    kind_name: string;
    amount: unknown;
    paid: unknown;
  }>`
    select id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id
  `;
  let leftPay = paid;
  const parts: string[] = [];
  for (const bill of bills) {
    if (leftPay <= 0) break;
    const open = num(bill.amount) - num(bill.paid);
    const take = Math.min(open, leftPay);
    await sql`update tax_bills set paid = paid + ${take} where id = ${bill.id}`;
    parts.push(`${bill.kind_name} ${formatWon(take)}`);
    leftPay -= take;
  }
  const memo = parts.length ? `세금 납부 · ${parts.join(", ")}` : "세금 납부 · 학급 금고";
  await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${studentId}, 'tax', ${-paid}, ${memo})
  `;
  return { paid, left: due - paid };
}
