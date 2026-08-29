import { getSql } from "@/lib/db";
import { creditVault } from "@/lib/server/vault.server";
import { formatWon, num } from "@/lib/utils";

export type Donor = {
  studentId: number;
  name: string;
  donated: number;
};

export async function listDonors(): Promise<Donor[]> {
  const sql = await getSql();
  const rows = await sql<{ student_id: number; name: string; donated: unknown }>`
    select s.id as student_id, s.name, coalesce(sum(-l.amount), 0) as donated
    from students s
    join ledger l on l.student_id = s.id and l.kind = 'donate'
    group by s.id, s.name
    having coalesce(sum(-l.amount), 0) > 0
    order by coalesce(sum(-l.amount), 0) desc, s.name
  `;
  return rows.map((r) => ({
    studentId: r.student_id,
    name: r.name,
    donated: num(r.donated),
  }));
}

export async function donate(
  studentId: number,
  amount: number,
): Promise<{ amount: number; cash: number; vault: number; myTotal: number; isTop: boolean; topName: string | null }> {
  const amt = Math.round(amount);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error("기부할 금액을 입력해 주세요.");
  const sql = await getSql();
  const rows = await sql<{ cash: unknown; name: string }>`
    select cash, name from students where id = ${studentId}
  `;
  const row = rows[0];
  if (!row) throw new Error("학생을 찾을 수 없어요.");
  const cash = num(row.cash);
  if (cash < amt) throw new Error(`쓸 수 있는 돈이 ${formatWon(cash)}이에요.`);
  await sql`update students set cash = cash - ${amt} where id = ${studentId}`;
  await creditVault(amt, "donate", `${row.name} 기부`);
  await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${studentId}, 'donate', ${-amt}, '학급 금고 기부')
  `;
  const next = await sql<{ cash: unknown }>`select cash from students where id = ${studentId}`;
  const vaultRows = await sql<{ tax_vault: unknown }>`select tax_vault from settings where id = 1`;
  const donors = await listDonors();
  const mine = donors.find((d) => d.studentId === studentId);
  const top = donors[0] ?? null;
  return {
    amount: amt,
    cash: num(next[0]?.cash),
    vault: num(vaultRows[0]?.tax_vault),
    myTotal: mine?.donated ?? amt,
    isTop: Boolean(top && top.studentId === studentId),
    topName: top?.name ?? null,
  };
}
