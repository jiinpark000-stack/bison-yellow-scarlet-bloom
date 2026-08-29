import { catalogName, STOCK_CATALOG } from "@/lib/catalog";
import { PRICE_SCALE, type Quote } from "@/lib/types";
import { roundMoney } from "@/lib/utils";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type CacheEntry = { at: number; quote: Quote };
const globalRef = globalThis as typeof globalThis & {
  __quoteCache__?: Map<string, CacheEntry>;
  __quoteInflight__?: Map<string, Promise<Quote | null>>;
  __fxCache__?: { at: number; usdKrw: number };
};

function cache() {
  globalRef.__quoteCache__ ??= new Map();
  return globalRef.__quoteCache__;
}

function inflight() {
  globalRef.__quoteInflight__ ??= new Map();
  return globalRef.__quoteInflight__;
}

const QUOTE_TTL = 6_000;
const FX_TTL = 60_000;
const HISTORY_POINTS = 48;

async function fetchJson(url: string, timeoutMs = 5000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "application/json,text/plain,*/*",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

type ChartMeta = {
  currency?: string;
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketTime?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  shortName?: string;
  longName?: string;
  exchangeName?: string;
  instrumentType?: string;
};

type ChartPayload = {
  chart?: {
    result?: {
      meta: ChartMeta;
      timestamp?: number[];
      indicators?: { quote?: { close?: (number | null)[] }[] };
    }[];
    error?: { description?: string } | null;
  };
};

async function fetchChart(
  symbol: string,
  interval = "1m",
  range = "1d",
): Promise<ChartPayload> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=true`;
  return (await fetchJson(url)) as ChartPayload;
}

async function getUsdKrw(): Promise<number> {
  const now = Date.now();
  if (globalRef.__fxCache__ && now - globalRef.__fxCache__.at < FX_TTL) {
    return globalRef.__fxCache__.usdKrw;
  }
  try {
    const data = await fetchChart("KRW=X", "5m", "5d");
    const price = livePrice(data.chart?.result?.[0]);
    const usdKrw = typeof price === "number" && price > 0 ? price : 1380;
    globalRef.__fxCache__ = { at: now, usdKrw };
    return usdKrw;
  } catch {
    return globalRef.__fxCache__?.usdKrw ?? 1380;
  }
}

function toKrw(price: number, currency: string, usdKrw: number): number {
  const cur = (currency || "USD").toUpperCase();
  if (cur === "KRW") return price;
  if (cur === "USD") return price * usdKrw;
  if (cur === "GBp") return (price / 100) * usdKrw;
  return price * usdKrw;
}

function toGamePrice(realKrw: number): number {
  return roundMoney(realKrw / PRICE_SCALE);
}

function displayName(symbol: string, meta: ChartMeta): string {
  return catalogName(symbol) || meta.shortName || meta.longName || symbol;
}

function livePrice(result: {
  meta: ChartMeta;
  timestamp?: number[];
  indicators?: { quote?: { close?: (number | null)[] }[] };
} | undefined): number | null {
  if (!result) return null;
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result.timestamp ?? [];
  let lastBar: number | null = null;
  let lastT = 0;
  for (let i = closes.length - 1; i >= 0; i -= 1) {
    const close = closes[i];
    if (typeof close === "number" && close > 0) {
      lastBar = close;
      lastT = timestamps[i] ?? 0;
      break;
    }
  }
  const market = result.meta.regularMarketPrice;
  const marketT = result.meta.regularMarketTime ?? 0;
  if (lastBar != null && lastT > marketT) return lastBar;
  if (typeof market === "number" && market > 0) return market;
  return lastBar;
}

function downsample<T>(rows: T[], max: number): T[] {
  if (rows.length <= max) return rows;
  const out: T[] = [];
  const step = (rows.length - 1) / (max - 1);
  for (let i = 0; i < max; i += 1) {
    out.push(rows[Math.round(i * step)]!);
  }
  return out;
}

function parseQuote(symbol: string, data: ChartPayload, usdKrw: number): Quote | null {
  const result = data.chart?.result?.[0];
  if (!result) return null;
  const meta = result.meta;
  const realPrice = livePrice(result);
  if (typeof realPrice !== "number" || realPrice <= 0) return null;
  const prev =
    (typeof meta.previousClose === "number" && meta.previousClose > 0 && meta.previousClose) ||
    (typeof meta.chartPreviousClose === "number" && meta.chartPreviousClose) ||
    realPrice;
  const changePercent = prev > 0 ? ((realPrice - prev) / prev) * 100 : 0;
  const currency = meta.currency || "USD";
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result.timestamp ?? [];
  const history: { t: number; game: number }[] = [];
  for (let i = 0; i < closes.length; i += 1) {
    const close = closes[i];
    const t = timestamps[i];
    if (typeof close === "number" && close > 0 && typeof t === "number") {
      history.push({ t, game: toGamePrice(toKrw(close, currency, usdKrw)) });
    }
  }
  return {
    symbol,
    name: displayName(symbol, meta),
    market: meta.exchangeName || "",
    currency,
    realPrice,
    realPrevClose: prev,
    gamePrice: toGamePrice(toKrw(realPrice, currency, usdKrw)),
    changePercent,
    history: downsample(history, HISTORY_POINTS),
  };
}

async function fetchParsed(symbol: string, usdKrw: number): Promise<Quote | null> {
  let quote: Quote | null = null;
  try {
    quote = parseQuote(symbol, await fetchChart(symbol, "5m", "1d"), usdKrw);
  } catch {
    quote = null;
  }
  if (quote) return quote;
  return parseQuote(symbol, await fetchChart(symbol, "1d", "5d"), usdKrw);
}

async function loadOne(symbol: string, usdKrw: number): Promise<Quote | null> {
  const now = Date.now();
  const hit = cache().get(symbol);
  if (hit && now - hit.at < QUOTE_TTL) return hit.quote;

  const pending = inflight().get(symbol);
  if (pending) return pending;

  const job = (async () => {
    try {
      const quote = await fetchParsed(symbol, usdKrw);
      if (quote) cache().set(symbol, { at: Date.now(), quote });
      return quote ?? hit?.quote ?? null;
    } catch {
      return hit?.quote ?? null;
    } finally {
      inflight().delete(symbol);
    }
  })();

  inflight().set(symbol, job);
  return job;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) return [];
  const usdKrw = await getUsdKrw();
  const rows = await Promise.all(unique.map((s) => loadOne(s, usdKrw)));
  return rows.filter((row): row is Quote => Boolean(row));
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const rows = await getQuotes([symbol]);
  return rows[0] ?? null;
}

type SearchHit = {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
  exchDisp?: string;
  exchange?: string;
};

export async function searchRemote(query: string): Promise<
  { symbol: string; name: string; market: string }[]
> {
  const q = query.trim();
  if (q.length < 1) return [];
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=12&newsCount=0&enableFuzzyQuery=true`;
    const data = (await fetchJson(url)) as { quotes?: SearchHit[] };
    const quotes = data.quotes ?? [];
    return quotes
      .filter((hit) => {
        const type = (hit.quoteType || "").toUpperCase();
        return type === "EQUITY" || type === "ETF";
      })
      .map((hit) => ({
        symbol: hit.symbol,
        name: catalogName(hit.symbol) || hit.shortname || hit.longname || hit.symbol,
        market: hit.exchDisp || hit.exchange || "",
      }));
  } catch {
    return [];
  }
}

export function resolveSymbol(input: string): string {
  const raw = input.trim();
  const upper = raw.toUpperCase();
  const exact = STOCK_CATALOG.find((s) => s.symbol.toUpperCase() === upper);
  if (exact) return exact.symbol;
  if (/^\d{6}$/.test(raw)) {
    const ks = STOCK_CATALOG.find((s) => s.symbol.startsWith(raw));
    return ks?.symbol ?? `${raw}.KS`;
  }
  return raw;
}
