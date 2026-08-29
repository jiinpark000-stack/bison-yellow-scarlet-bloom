import { t as createServerFn } from "./ssr.mjs";
import { s as formatWon, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql, p as requireStudent, r as createServerRpc } from "./session.server-C3UH2SEm.mjs";
import { n as countOpenEvents } from "./events.server-mPenqCdf.mjs";
import { a as number, o as object, s as string } from "../_libs/zod.mjs";
import { r as getQuotes } from "./quotes.server-CMVaAMI-.mjs";
import { a as listTaxKinds, o as listUnpaidBills, r as collectFromStudent } from "./tax.server-Z8B_vN0K.mjs";
import { payDueSalary } from "./salary.server-Ch6yjk45.mjs";
import { i as moveSavings, n as getSavingsRate, o as payDueInterest, r as listDonors, t as donate } from "./donate.server-BNSshI-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/student-D-jqYieK.js
async function transfer(fromId, toId, amount) {
	const amt = Math.round(amount);
	if (!Number.isFinite(amt) || amt <= 0) throw new Error("보낼 금액을 입력해 주세요.");
	if (fromId === toId) throw new Error("내 통장으로는 보낼 수 없어요.");
	const sql = await getSql();
	const fromRows = await sql`
    select cash, name from students where id = ${fromId}
  `;
	const toRows = await sql`
    select name from students where id = ${toId}
  `;
	const from = fromRows[0];
	const to = toRows[0];
	if (!from) throw new Error("학생을 찾을 수 없어요.");
	if (!to) throw new Error("받는 친구를 찾을 수 없어요.");
	const cash = num(from.cash);
	if (cash < amt) throw new Error(`쓸 수 있는 돈이 ${formatWon(cash)}이에요.`);
	await sql`update students set cash = cash - ${amt} where id = ${fromId}`;
	await sql`update students set cash = cash + ${amt} where id = ${toId}`;
	await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${fromId}, 'send', ${-amt}, ${`${to.name}에게 이체`})
  `;
	await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${toId}, 'recv', ${amt}, ${`${from.name}에게서 입금`})
  `;
	return {
		amount: amt,
		toName: to.name,
		fromName: from.name
	};
}
var tokenSchema = object({ token: string().optional() });
var getStudentHome_createServerFn_handler = createServerRpc({
	id: "974d111813c155e69c1e297d71ba8820f4aa6e45a146a238c5b7b05060da4397",
	name: "getStudentHome",
	filename: "src/lib/fn/student.ts"
}, (opts) => getStudentHome.__executeServer(opts));
var getStudentHome = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(getStudentHome_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	await Promise.all([payDueSalary(session.student.id), payDueInterest(session.student.id)]);
	const sql = await getSql();
	const s = (await sql`
      select s.id, s.name, s.cash, s.savings, s.last_salary_on, s.last_interest_on,
             s.tax_due, j.name as job_name, j.salary
      from students s
      left join jobs j on j.id = s.job_id
      where s.id = ${session.student.id}
    `)[0];
	if (!s) throw new Error("학생 정보를 찾을 수 없어요.");
	const [holdingRows, classmates, waiting, kinds, bills, openEventCount, savingsRate, donors, peers] = await Promise.all([
		sql`
          select symbol, name, qty, avg_cost from holdings where student_id = ${s.id}
        `,
		sql`
          select s.id, s.cash, s.savings, h.symbol, h.qty, h.avg_cost
          from students s
          left join holdings h on h.student_id = s.id
        `,
		sql`
          select count(*)::int as n from orders
          where student_id = ${s.id} and status = 'waiting'
        `,
		listTaxKinds(true),
		listUnpaidBills(s.id),
		countOpenEvents(),
		getSavingsRate(),
		listDonors(),
		sql`
          select id, name from students where id <> ${s.id} order by name
        `
	]);
	const allSymbols = [...new Set([...holdingRows.map((h) => h.symbol), ...classmates.map((r) => r.symbol)].filter((x) => Boolean(x)))];
	const quotes = allSymbols.length ? await getQuotes(allSymbols) : [];
	const qmap = new Map(quotes.map((q) => [q.symbol, q]));
	const holdings = holdingRows.map((h) => {
		const q = qmap.get(h.symbol);
		const gamePrice = q?.gamePrice ?? num(h.avg_cost);
		const avgCost = num(h.avg_cost);
		const value = gamePrice * h.qty;
		const pnl = (gamePrice - avgCost) * h.qty;
		const pnlPercent = avgCost > 0 ? (gamePrice - avgCost) / avgCost * 100 : 0;
		return {
			symbol: h.symbol,
			name: q?.name ?? h.name,
			qty: h.qty,
			avgCost,
			gamePrice,
			changePercent: q?.changePercent ?? 0,
			value,
			pnl,
			pnlPercent
		};
	});
	const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
	const cash = num(s.cash);
	const savings = num(s.savings);
	const total = cash + savings + holdingsValue;
	const totals = /* @__PURE__ */ new Map();
	for (const row of classmates) {
		const current = totals.get(row.id) ?? num(row.cash) + num(row.savings);
		if (row.symbol && row.qty) {
			const price = qmap.get(row.symbol)?.gamePrice ?? num(row.avg_cost);
			totals.set(row.id, current + price * row.qty);
		} else if (!totals.has(row.id)) totals.set(row.id, current);
	}
	const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
	const rank = ranked.findIndex(([id]) => id === s.id) + 1;
	const myDonated = donors.find((d) => d.studentId === s.id)?.donated ?? 0;
	return {
		className: session.className,
		student: {
			id: s.id,
			name: s.name,
			jobName: s.job_name,
			salary: num(s.salary),
			cash,
			savings,
			lastSalaryOn: s.last_salary_on,
			lastInterestOn: s.last_interest_on,
			taxDue: num(s.tax_due)
		},
		holdings,
		holdingsValue,
		total,
		rank,
		classSize: ranked.length,
		waitingOrders: waiting[0]?.n ?? 0,
		taxKinds: kinds,
		taxBills: bills,
		openEventCount,
		savingsRate,
		donors,
		myDonated,
		classmates: peers
	};
});
var getLedger_createServerFn_handler = createServerRpc({
	id: "32a79d81f642c7cc6752fa6fe9cb286ae7a1970039242f8b3cfaabb1ab217b0c",
	name: "getLedger",
	filename: "src/lib/fn/student.ts"
}, (opts) => getLedger.__executeServer(opts));
var getLedger = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(getLedger_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return (await (await getSql())`
      select id, kind, amount, memo, created_at::text as created_at
      from ledger
      where student_id = ${session.student.id}
      order by id desc
      limit 40
    `).map((r) => ({
		id: r.id,
		kind: r.kind,
		amount: num(r.amount),
		memo: r.memo,
		createdAt: r.created_at
	}));
});
var payTaxFn_createServerFn_handler = createServerRpc({
	id: "d1e166d30218e0474af17ec663b6f89947274e8617fc6ba6724e0b1e7c7a495c",
	name: "payTaxFn",
	filename: "src/lib/fn/student.ts"
}, (opts) => payTaxFn.__executeServer(opts));
var payTaxFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number().positive().optional()
}).parse(d ?? {})).handler(payTaxFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return collectFromStudent(session.student.id, data.amount);
});
var moveSavingsFn_createServerFn_handler = createServerRpc({
	id: "2ef4aafd49e66a07f41112237fff4e3f8fdcd78a401730453490897bffdda5bc",
	name: "moveSavingsFn",
	filename: "src/lib/fn/student.ts"
}, (opts) => moveSavingsFn.__executeServer(opts));
var moveSavingsFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number()
}).parse(d)).handler(moveSavingsFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return moveSavings(session.student.id, data.amount);
});
var donateFn_createServerFn_handler = createServerRpc({
	id: "9d6da70d3d87b9cf67e88f58b94847244c6838b02b8177a7a37ce286d9f73a59",
	name: "donateFn",
	filename: "src/lib/fn/student.ts"
}, (opts) => donateFn.__executeServer(opts));
var donateFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	amount: number().positive()
}).parse(d)).handler(donateFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return donate(session.student.id, data.amount);
});
var transferFn_createServerFn_handler = createServerRpc({
	id: "e7c5061cf32fc2092039bff105d140e5780f673792af0e9a29f1fd138c260a84",
	name: "transferFn",
	filename: "src/lib/fn/student.ts"
}, (opts) => transferFn.__executeServer(opts));
var transferFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	toStudentId: number().int().positive(),
	amount: number().positive()
}).parse(d)).handler(transferFn_createServerFn_handler, async ({ data }) => {
	return transfer((await requireStudent(data.token)).student.id, data.toStudentId, data.amount);
});
//#endregion
export { donateFn_createServerFn_handler, getLedger_createServerFn_handler, getStudentHome_createServerFn_handler, moveSavingsFn_createServerFn_handler, payTaxFn_createServerFn_handler, transferFn_createServerFn_handler };
