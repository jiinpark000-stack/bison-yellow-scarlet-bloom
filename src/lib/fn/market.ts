import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FEATURED_SYMBOLS, searchCatalog } from "@/lib/catalog";
import { getSql } from "@/lib/db";
import { getQuote, getQuotes, resolveSymbol, searchRemote } from "@/lib/server/quotes.server";
import { requireStudent } from "@/lib/server/session.server";
import { accrueTriggerTax } from "@/lib/server/tax.server";
import { num, roundMoney } from "@/lib/utils";

const tokenSchema = z.object({ token: z.string().optional() });

export const getFeaturedQuotes = createServerFn({ method: "GET" }).handler(async () => {
  return getQuotes([...FEATURED_SYMBOLS]);
});

export const searchStocksFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ q: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [];
    const local = searchCatalog(q);
    const remote = await searchRemote(q);
    const seen = new Set<string>();
    const merged: { symbol: string; name: string; market: string }[] = [];
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
        changePercent: quote?.changePercent ?? null,
      };
    });
  });

export const getStockFn = createServerFn({ method: "GET" })
  .validator((d) => z.object({ symbol: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const symbol = resolveSymbol(data.symbol);
    const quote = await getQuote(symbol);
    if (!quote) throw new Error("종목을 찾지 못했어요. 티커를 확인해 주세요.");
    return quote;
  });

export const buyStockFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        symbol: z.string().min(1),
        qty: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    const symbol = resolveSymbol(data.symbol);
    const quote = await getQuote(symbol);
    if (!quote) throw new Error("지금은 시세를 가져올 수 없어요.");
    const cost = roundMoney(quote.gamePrice * data.qty);
    if (cost <= 0) throw new Error("가격 정보가 올바르지 않아요.");
    const sql = await getSql();
    const cashRows = await sql<{ cash: unknown }>`
      select cash from students where id = ${session.student.id}
    `;
    const cash = num(cashRows[0]?.cash);
    if (cash < cost) throw new Error("잔액이 부족해요.");
    const holding = await sql<{ qty: number; avg_cost: unknown }>`
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
    } else {
      await sql`
        insert into holdings (student_id, symbol, name, qty, avg_cost)
        values (${session.student.id}, ${quote.symbol}, ${quote.name}, ${data.qty}, ${quote.gamePrice})
      `;
    }
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${session.student.id},
        'buy',
        ${-cost},
        ${`${quote.name} ${data.qty}주 매수`}
      )
    `;
    return { ok: true as const, cost, gamePrice: quote.gamePrice };
  });

export const sellStockFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        symbol: z.string().min(1),
        qty: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    const symbol = resolveSymbol(data.symbol);
    const quote = await getQuote(symbol);
    if (!quote) throw new Error("지금은 시세를 가져올 수 없어요.");
    const sql = await getSql();
    const holding = await sql<{ qty: number; name: string; avg_cost: unknown }>`
      select qty, name, avg_cost from holdings
      where student_id = ${session.student.id} and symbol = ${quote.symbol}
    `;
    if (!holding[0] || holding[0].qty < data.qty) {
      throw new Error("가진 주식보다 많이 팔 수 없어요.");
    }
    const proceeds = roundMoney(quote.gamePrice * data.qty);
    const avgCost = num(holding[0].avg_cost);
    const profit = roundMoney((quote.gamePrice - avgCost) * data.qty);
    await sql`
      update students set cash = cash + ${proceeds} where id = ${session.student.id}
    `;
    if (holding[0].qty === data.qty) {
      await sql`
        delete from holdings
        where student_id = ${session.student.id} and symbol = ${quote.symbol}
      `;
    } else {
      await sql`
        update holdings set qty = qty - ${data.qty}
        where student_id = ${session.student.id} and symbol = ${quote.symbol}
      `;
    }
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
    return { ok: true as const, proceeds, gamePrice: quote.gamePrice, tax, profit };
  });
