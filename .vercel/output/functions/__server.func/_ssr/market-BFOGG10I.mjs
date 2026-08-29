import { t as createServerFn } from "./ssr.mjs";
import { f as roundMoney, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql, p as requireStudent, r as createServerRpc } from "./session.server-C3UH2SEm.mjs";
import { a as number, o as object, s as string } from "../_libs/zod.mjs";
import { a as searchCatalog, i as resolveSymbol, n as getQuote, o as searchRemote, r as getQuotes, t as FEATURED_SYMBOLS } from "./quotes.server-CMVaAMI-.mjs";
import { t as accrueTriggerTax } from "./tax.server-Z8B_vN0K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-BFOGG10I.js
object({ token: string().optional() });
var getFeaturedQuotes_createServerFn_handler = createServerRpc({
	id: "d411df3b32c76c5df0137843b6d0b43288c8de6612eb6e041632239c2f478ff1",
	name: "getFeaturedQuotes",
	filename: "src/lib/fn/market.ts"
}, (opts) => getFeaturedQuotes.__executeServer(opts));
var getFeaturedQuotes = createServerFn({ method: "GET" }).handler(getFeaturedQuotes_createServerFn_handler, async () => {
	return getQuotes([...FEATURED_SYMBOLS]);
});
var searchStocksFn_createServerFn_handler = createServerRpc({
	id: "88cbc5aabe5bfe8503b656045ad7052fb249437cc2f9570fb62541e8fd842d05",
	name: "searchStocksFn",
	filename: "src/lib/fn/market.ts"
}, (opts) => searchStocksFn.__executeServer(opts));
var searchStocksFn = createServerFn({ method: "GET" }).validator((d) => object({ q: string() }).parse(d)).handler(searchStocksFn_createServerFn_handler, async ({ data }) => {
	const q = data.q.trim();
	if (!q) return [];
	const local = searchCatalog(q);
	const remote = await searchRemote(q);
	const seen = /* @__PURE__ */ new Set();
	const merged = [];
	for (const item of [...local, ...remote]) {
		const key = item.symbol.toUpperCase();
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(item);
	}
	const quotes = await getQuotes(merged.slice(0, 16).map((m) => m.symbol));
	const qmap = new Map(quotes.map((x) => [x.symbol.toUpperCase(), x]));
	return merged.slice(0, 16).map((item) => {
		const quote = qmap.get(item.symbol.toUpperCase());
		return {
			symbol: item.symbol,
			name: quote?.name ?? item.name,
			market: quote?.market || item.market,
			gamePrice: quote?.gamePrice ?? null,
			changePercent: quote?.changePercent ?? null
		};
	});
});
var getStockFn_createServerFn_handler = createServerRpc({
	id: "317bc04b5d2c4d2dad44863d251d1ace4a6daca44e78f502e109d7c527a21903",
	name: "getStockFn",
	filename: "src/lib/fn/market.ts"
}, (opts) => getStockFn.__executeServer(opts));
var getStockFn = createServerFn({ method: "GET" }).validator((d) => object({ symbol: string().min(1) }).parse(d)).handler(getStockFn_createServerFn_handler, async ({ data }) => {
	const symbol = resolveSymbol(data.symbol);
	const quote = await getQuote(symbol);
	if (!quote) throw new Error("종목을 찾지 못했어요. 티커를 확인해 주세요.");
	return quote;
});
var buyStockFn_createServerFn_handler = createServerRpc({
	id: "489b46c5eb01fc77aada28989ceb2838a763c46058f7bed8ed558933a806c0ef",
	name: "buyStockFn",
	filename: "src/lib/fn/market.ts"
}, (opts) => buyStockFn.__executeServer(opts));
var buyStockFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	symbol: string().min(1),
	qty: number().int().positive()
}).parse(d)).handler(buyStockFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	const symbol = resolveSymbol(data.symbol);
	const quote = await getQuote(symbol);
	if (!quote) throw new Error("지금은 시세를 가져올 수 없어요.");
	const cost = roundMoney(quote.gamePrice * data.qty);
	if (cost <= 0) throw new Error("가격 정보가 올바르지 않아요.");
	const sql = await getSql();
	const cashRows = await sql`
      select cash from students where id = ${session.student.id}
    `;
	if (num(cashRows[0]?.cash) < cost) throw new Error("잔액이 부족해요.");
	const holding = await sql`
      select qty, avg_cost from holdings
      where student_id = ${session.student.id} and symbol = ${quote.symbol}
    `;
	await sql`
      update students set cash = cash - ${cost} where id = ${session.student.id}
    `;
	if (holding[0]) {
		const oldQty = holding[0].qty;
		const oldAvg = num(holding[0].avg_cost);
		const avg = roundMoney((oldQty * oldAvg + cost) / (oldQty + data.qty));
		await sql`
        update holdings
        set qty = qty + ${data.qty}, avg_cost = ${avg}, name = ${quote.name}
        where student_id = ${session.student.id} and symbol = ${quote.symbol}
      `;
	} else await sql`
        insert into holdings (student_id, symbol, name, qty, avg_cost)
        values (${session.student.id}, ${quote.symbol}, ${quote.name}, ${data.qty}, ${quote.gamePrice})
      `;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${session.student.id},
        'buy',
        ${-cost},
        ${`${quote.name} ${data.qty}주 매수`}
      )
    `;
	return {
		ok: true,
		cost,
		gamePrice: quote.gamePrice
	};
});
var sellStockFn_createServerFn_handler = createServerRpc({
	id: "2f514835d38468a1a8dfaa98ee02a3129aa28ebeb5c3cc8b2fad37abd1c3a5e6",
	name: "sellStockFn",
	filename: "src/lib/fn/market.ts"
}, (opts) => sellStockFn.__executeServer(opts));
var sellStockFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	symbol: string().min(1),
	qty: number().int().positive()
}).parse(d)).handler(sellStockFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	const symbol = resolveSymbol(data.symbol);
	const quote = await getQuote(symbol);
	if (!quote) throw new Error("지금은 시세를 가져올 수 없어요.");
	const sql = await getSql();
	const holding = await sql`
      select qty, name, avg_cost from holdings
      where student_id = ${session.student.id} and symbol = ${quote.symbol}
    `;
	if (!holding[0] || holding[0].qty < data.qty) throw new Error("가진 주식보다 많이 팔 수 없어요.");
	const proceeds = roundMoney(quote.gamePrice * data.qty);
	const avgCost = num(holding[0].avg_cost);
	const profit = roundMoney((quote.gamePrice - avgCost) * data.qty);
	await sql`
      update students set cash = cash + ${proceeds} where id = ${session.student.id}
    `;
	if (holding[0].qty === data.qty) await sql`
        delete from holdings
        where student_id = ${session.student.id} and symbol = ${quote.symbol}
      `;
	else await sql`
        update holdings set qty = qty - ${data.qty}
        where student_id = ${session.student.id} and symbol = ${quote.symbol}
      `;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${session.student.id},
        'sell',
        ${proceeds},
        ${`${quote.name} ${data.qty}주 매도`}
      )
    `;
	const tax = profit > 0 ? await accrueTriggerTax(session.student.id, "gain", profit) : 0;
	return {
		ok: true,
		proceeds,
		gamePrice: quote.gamePrice,
		tax,
		profit
	};
});
//#endregion
export { buyStockFn_createServerFn_handler, getFeaturedQuotes_createServerFn_handler, getStockFn_createServerFn_handler, searchStocksFn_createServerFn_handler, sellStockFn_createServerFn_handler };
