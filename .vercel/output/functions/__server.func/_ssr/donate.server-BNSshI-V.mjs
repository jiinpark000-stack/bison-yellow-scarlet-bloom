import { _ as weekStartKst, c as interestOn, h as todayKst, s as formatWon, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql } from "./session.server-C3UH2SEm.mjs";
import { t as creditVault } from "./vault.server-BhJ7xgqC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/donate.server-BNSshI-V.js
async function getSavingsRate() {
	const rows = await (await getSql())`select savings_rate from settings where id = 1`;
	return num(rows[0]?.savings_rate);
}
async function setSavingsRate(rate) {
	await (await getSql())`update settings set savings_rate = ${rate}, updated_at = now() where id = 1`;
	return rate;
}
async function moveSavings(studentId, amount) {
	const amt = Math.round(amount);
	if (!Number.isFinite(amt) || amt === 0) throw new Error("금액을 입력해 주세요.");
	const sql = await getSql();
	const row = (await sql`
    select cash, savings from students where id = ${studentId}
  `)[0];
	if (!row) throw new Error("학생을 찾을 수 없어요.");
	const cash = num(row.cash);
	const savings = num(row.savings);
	if (amt > 0) {
		if (cash < amt) throw new Error(`쓸 수 있는 돈이 ${formatWon(cash)}이에요.`);
		await sql`update students set cash = cash - ${amt}, savings = savings + ${amt} where id = ${studentId}`;
		await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'save', ${-amt}, ${`저축 넣기`})
    `;
	} else {
		const take = -amt;
		if (savings < take) throw new Error(`저축은 ${formatWon(savings)}이에요.`);
		await sql`update students set cash = cash + ${take}, savings = savings - ${take} where id = ${studentId}`;
		await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'save', ${take}, ${`저축 찾기`})
    `;
	}
	const next = await sql`
    select cash, savings from students where id = ${studentId}
  `;
	return {
		cash: num(next[0]?.cash),
		savings: num(next[0]?.savings)
	};
}
async function payDueInterest(studentId) {
	const sql = await getSql();
	const today = todayKst();
	const weekStart = weekStartKst(today);
	const rate = await getSavingsRate();
	const row = (await sql`
    select savings, last_interest_on from students where id = ${studentId}
  `)[0];
	if (!row) return null;
	const lastOn = row.last_interest_on ? String(row.last_interest_on).slice(0, 10) : null;
	if (lastOn && lastOn >= weekStart) return null;
	const savings = num(row.savings);
	if (savings <= 0) return null;
	const paid = interestOn(savings, rate);
	if ((await sql`
    update students
    set savings = savings + ${paid}, last_interest_on = ${today}
    where id = ${studentId}
      and savings > 0
      and (last_interest_on is null or last_interest_on < ${weekStart})
    returning savings
  `).length === 0) return null;
	if (paid > 0) await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'interest', ${paid}, ${`저축 일주일 이자 ${rate}%`})
    `;
	return { paid };
}
async function payAllDueInterest() {
	const ids = await (await getSql())`select id from students`;
	let count = 0;
	let paid = 0;
	for (const row of ids) {
		const result = await payDueInterest(row.id);
		if (result && result.paid > 0) {
			count += 1;
			paid += result.paid;
		}
	}
	return {
		count,
		paid
	};
}
async function listDonors() {
	return (await (await getSql())`
    select s.id as student_id, s.name, coalesce(sum(-l.amount), 0) as donated
    from students s
    join ledger l on l.student_id = s.id and l.kind = 'donate'
    group by s.id, s.name
    having coalesce(sum(-l.amount), 0) > 0
    order by coalesce(sum(-l.amount), 0) desc, s.name
  `).map((r) => ({
		studentId: r.student_id,
		name: r.name,
		donated: num(r.donated)
	}));
}
async function donate(studentId, amount) {
	const amt = Math.round(amount);
	if (!Number.isFinite(amt) || amt <= 0) throw new Error("기부할 금액을 입력해 주세요.");
	const sql = await getSql();
	const row = (await sql`
    select cash, name from students where id = ${studentId}
  `)[0];
	if (!row) throw new Error("학생을 찾을 수 없어요.");
	const cash = num(row.cash);
	if (cash < amt) throw new Error(`쓸 수 있는 돈이 ${formatWon(cash)}이에요.`);
	await sql`update students set cash = cash - ${amt} where id = ${studentId}`;
	await creditVault(amt, "donate", `${row.name} 기부`);
	await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${studentId}, 'donate', ${-amt}, '학급 금고 기부')
  `;
	const next = await sql`select cash from students where id = ${studentId}`;
	const vaultRows = await sql`select tax_vault from settings where id = 1`;
	const donors = await listDonors();
	const mine = donors.find((d) => d.studentId === studentId);
	const top = donors[0] ?? null;
	return {
		amount: amt,
		cash: num(next[0]?.cash),
		vault: num(vaultRows[0]?.tax_vault),
		myTotal: mine?.donated ?? amt,
		isTop: Boolean(top && top.studentId === studentId),
		topName: top?.name ?? null
	};
}
//#endregion
export { payAllDueInterest as a, moveSavings as i, getSavingsRate as n, payDueInterest as o, listDonors as r, setSavingsRate as s, donate as t };
