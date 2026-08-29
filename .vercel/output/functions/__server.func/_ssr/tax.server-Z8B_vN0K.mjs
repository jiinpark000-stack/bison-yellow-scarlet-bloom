import { s as formatWon, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql } from "./session.server-C3UH2SEm.mjs";
import { t as creditVault } from "./vault.server-BhJ7xgqC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tax.server-Z8B_vN0K.js
function mapKind(row) {
	return {
		id: row.id,
		name: row.name,
		appliesOn: row.applies_on,
		charge: row.charge,
		rate: num(row.rate),
		amount: num(row.amount),
		isActive: row.is_active,
		sortOrder: row.sort_order
	};
}
async function getTaxVault() {
	const rows = await (await getSql())`select tax_vault from settings where id = 1`;
	return num(rows[0]?.tax_vault);
}
async function listTaxKinds(activeOnly = false) {
	const sql = await getSql();
	return (activeOnly ? await sql`
        select id, name, applies_on, charge, rate, amount, is_active, sort_order
        from tax_kinds
        where is_active = true
        order by sort_order, id
      ` : await sql`
        select id, name, applies_on, charge, rate, amount, is_active, sort_order
        from tax_kinds
        order by sort_order, id
      `).map(mapKind);
}
async function listUnpaidBills(studentId) {
	return (await (await getSql())`
    select id, tax_kind_id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id
  `).map((r) => ({
		id: r.id,
		kindId: r.tax_kind_id,
		kindName: r.kind_name,
		amount: num(r.amount),
		paid: num(r.paid),
		due: num(r.amount) - num(r.paid)
	}));
}
/** Whole-won tax. Any positive taxable amount bills at least 1원. */
function taxOn(base, ratePct) {
	if (base <= 0 || ratePct <= 0) return 0;
	const raw = base * ratePct / 100;
	return Math.max(1, Math.round(raw));
}
function chargeOn(kind, base) {
	if (!kind.isActive) return 0;
	if (kind.charge === "fixed") return kind.amount > 0 ? Math.round(kind.amount) : 0;
	return taxOn(base, kind.rate);
}
async function accrueTax(studentId, amount, kind) {
	if (amount <= 0) return 0;
	const sql = await getSql();
	await sql`update students set tax_due = tax_due + ${amount} where id = ${studentId}`;
	if (kind) await sql`
      insert into tax_bills (student_id, tax_kind_id, kind_name, amount)
      values (${studentId}, ${kind.id}, ${kind.name}, ${amount})
    `;
	return amount;
}
async function accrueTriggerTax(studentId, appliesOn, base) {
	const kinds = (await listTaxKinds(true)).filter((k) => k.appliesOn === appliesOn);
	let total = 0;
	for (const kind of kinds) {
		const amt = chargeOn(kind, base);
		if (amt > 0) total += await accrueTax(studentId, amt, kind);
	}
	return total;
}
async function reduceTaxDue(studentId, amount) {
	if (amount <= 0) return;
	await (await getSql())`
    update students
    set tax_due = greatest(tax_due - ${amount}, 0)
    where id = ${studentId}
  `;
}
async function reverseTriggerTax(studentId, appliesOn, base) {
	const kinds = (await listTaxKinds(true)).filter((k) => k.appliesOn === appliesOn);
	const want = kinds.reduce((sum, kind) => sum + chargeOn(kind, base), 0);
	if (want <= 0) return 0;
	const kindIds = new Set(kinds.map((k) => k.id));
	const names = new Set(kinds.map((k) => k.name));
	const sql = await getSql();
	const bills = await sql`
    select id, tax_kind_id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id desc
  `;
	let left = want;
	let reduced = 0;
	for (const bill of bills) {
		if (left <= 0) break;
		if (!(bill.tax_kind_id != null && kindIds.has(bill.tax_kind_id) || names.has(bill.kind_name))) continue;
		const open = num(bill.amount) - num(bill.paid);
		const take = Math.min(open, left);
		const nextAmount = num(bill.amount) - take;
		if (nextAmount <= num(bill.paid)) await sql`delete from tax_bills where id = ${bill.id}`;
		else await sql`update tax_bills set amount = ${nextAmount} where id = ${bill.id}`;
		left -= take;
		reduced += take;
	}
	const cut = reduced > 0 ? reduced : want;
	await reduceTaxDue(studentId, cut);
	return cut;
}
async function assessKind(kindId, studentId) {
	const kind = (await listTaxKinds()).find((k) => k.id === kindId);
	if (!kind) throw new Error("세금을 찾을 수 없어요.");
	if (!kind.isActive) throw new Error("꺼 둔 세금은 고지할 수 없어요.");
	const sql = await getSql();
	const students = studentId ? await sql`
        select s.id, s.cash, j.salary
        from students s
        left join jobs j on j.id = s.job_id
        where s.id = ${studentId}
      ` : await sql`
        select s.id, s.cash, j.salary
        from students s
        left join jobs j on j.id = s.job_id
      `;
	let billed = 0;
	let count = 0;
	for (const s of students) {
		const amt = chargeOn(kind, kind.charge === "fixed" ? 0 : kind.appliesOn === "income" ? num(s.salary) : num(s.cash));
		if (amt <= 0) continue;
		await accrueTax(s.id, amt, kind);
		billed += amt;
		count += 1;
	}
	return {
		billed,
		count
	};
}
async function collectFromStudent(studentId, requested) {
	const sql = await getSql();
	const row = (await sql`
    select cash, tax_due, name from students where id = ${studentId}
  `)[0];
	if (!row) throw new Error("학생을 찾을 수 없어요.");
	const cash = num(row.cash);
	const due = num(row.tax_due);
	if (due <= 0) return {
		paid: 0,
		left: 0
	};
	const paid = Math.min(requested != null && requested > 0 ? Math.min(requested, due) : due, cash);
	if (paid <= 0) throw new Error("낼 돈이 부족해요. 먼저 통장 잔액을 채워 주세요.");
	await sql`
    update students
    set cash = cash - ${paid}, tax_due = tax_due - ${paid}
    where id = ${studentId}
  `;
	await creditVault(paid, "tax", `${row.name} 세금`);
	const bills = await sql`
    select id, kind_name, amount, paid
    from tax_bills
    where student_id = ${studentId} and amount > paid
    order by id
  `;
	let leftPay = paid;
	const parts = [];
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
	return {
		paid,
		left: due - paid
	};
}
//#endregion
export { listTaxKinds as a, getTaxVault as i, assessKind as n, listUnpaidBills as o, collectFromStudent as r, reverseTriggerTax as s, accrueTriggerTax as t };
