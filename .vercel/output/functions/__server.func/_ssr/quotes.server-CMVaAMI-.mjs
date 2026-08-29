import { f as roundMoney } from "./utils-gSYKWV4o.mjs";
import { n as PRICE_SCALE } from "./types-CAoddweu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes.server-CMVaAMI-.js
var STOCK_CATALOG = [
	{
		symbol: "005930.KS",
		name: "삼성전자",
		market: "KOSPI"
	},
	{
		symbol: "000660.KS",
		name: "SK하이닉스",
		market: "KOSPI"
	},
	{
		symbol: "373220.KS",
		name: "LG에너지솔루션",
		market: "KOSPI"
	},
	{
		symbol: "207940.KS",
		name: "삼성바이오로직스",
		market: "KOSPI"
	},
	{
		symbol: "005380.KS",
		name: "현대차",
		market: "KOSPI"
	},
	{
		symbol: "000270.KS",
		name: "기아",
		market: "KOSPI"
	},
	{
		symbol: "068270.KS",
		name: "셀트리온",
		market: "KOSPI"
	},
	{
		symbol: "035420.KS",
		name: "NAVER",
		market: "KOSPI"
	},
	{
		symbol: "035720.KS",
		name: "카카오",
		market: "KOSPI"
	},
	{
		symbol: "105560.KS",
		name: "KB금융",
		market: "KOSPI"
	},
	{
		symbol: "055550.KS",
		name: "신한지주",
		market: "KOSPI"
	},
	{
		symbol: "012330.KS",
		name: "현대모비스",
		market: "KOSPI"
	},
	{
		symbol: "051910.KS",
		name: "LG화학",
		market: "KOSPI"
	},
	{
		symbol: "006400.KS",
		name: "삼성SDI",
		market: "KOSPI"
	},
	{
		symbol: "028260.KS",
		name: "삼성물산",
		market: "KOSPI"
	},
	{
		symbol: "066570.KS",
		name: "LG전자",
		market: "KOSPI"
	},
	{
		symbol: "003670.KS",
		name: "포스코퓨처엠",
		market: "KOSPI"
	},
	{
		symbol: "096770.KS",
		name: "SK이노베이션",
		market: "KOSPI"
	},
	{
		symbol: "034730.KS",
		name: "SK",
		market: "KOSPI"
	},
	{
		symbol: "003550.KS",
		name: "LG",
		market: "KOSPI"
	},
	{
		symbol: "032830.KS",
		name: "삼성생명",
		market: "KOSPI"
	},
	{
		symbol: "086790.KS",
		name: "하나금융지주",
		market: "KOSPI"
	},
	{
		symbol: "015760.KS",
		name: "한국전력",
		market: "KOSPI"
	},
	{
		symbol: "017670.KS",
		name: "SK텔레콤",
		market: "KOSPI"
	},
	{
		symbol: "030200.KS",
		name: "KT",
		market: "KOSPI"
	},
	{
		symbol: "033780.KS",
		name: "KT&G",
		market: "KOSPI"
	},
	{
		symbol: "009150.KS",
		name: "삼성전기",
		market: "KOSPI"
	},
	{
		symbol: "010130.KS",
		name: "고려아연",
		market: "KOSPI"
	},
	{
		symbol: "011200.KS",
		name: "HMM",
		market: "KOSPI"
	},
	{
		symbol: "018260.KS",
		name: "삼성에스디에스",
		market: "KOSPI"
	},
	{
		symbol: "009830.KS",
		name: "한화솔루션",
		market: "KOSPI"
	},
	{
		symbol: "010950.KS",
		name: "S-Oil",
		market: "KOSPI"
	},
	{
		symbol: "024110.KS",
		name: "기업은행",
		market: "KOSPI"
	},
	{
		symbol: "316140.KS",
		name: "우리금융지주",
		market: "KOSPI"
	},
	{
		symbol: "003490.KS",
		name: "대한항공",
		market: "KOSPI"
	},
	{
		symbol: "047050.KS",
		name: "포스코인터내셔널",
		market: "KOSPI"
	},
	{
		symbol: "034020.KS",
		name: "두산에너빌리티",
		market: "KOSPI"
	},
	{
		symbol: "259960.KS",
		name: "크래프톤",
		market: "KOSPI"
	},
	{
		symbol: "352820.KS",
		name: "하이브",
		market: "KOSPI"
	},
	{
		symbol: "036570.KS",
		name: "엔씨소프트",
		market: "KOSPI"
	},
	{
		symbol: "251270.KS",
		name: "넷마블",
		market: "KOSPI"
	},
	{
		symbol: "035900.KQ",
		name: "JYP Ent.",
		market: "KOSDAQ"
	},
	{
		symbol: "041510.KQ",
		name: "에스엠",
		market: "KOSDAQ"
	},
	{
		symbol: "122870.KQ",
		name: "와이지엔터테인먼트",
		market: "KOSDAQ"
	},
	{
		symbol: "263750.KQ",
		name: "펄어비스",
		market: "KOSDAQ"
	},
	{
		symbol: "293490.KQ",
		name: "카카오게임즈",
		market: "KOSDAQ"
	},
	{
		symbol: "112040.KQ",
		name: "위메이드",
		market: "KOSDAQ"
	},
	{
		symbol: "247540.KQ",
		name: "에코프로비엠",
		market: "KOSDAQ"
	},
	{
		symbol: "086520.KQ",
		name: "에코프로",
		market: "KOSDAQ"
	},
	{
		symbol: "196170.KQ",
		name: "알테오젠",
		market: "KOSDAQ"
	},
	{
		symbol: "028300.KQ",
		name: "HLB",
		market: "KOSDAQ"
	},
	{
		symbol: "058470.KQ",
		name: "리노공업",
		market: "KOSDAQ"
	},
	{
		symbol: "039030.KQ",
		name: "이오테크닉스",
		market: "KOSDAQ"
	},
	{
		symbol: "141080.KQ",
		name: "리가켐바이오",
		market: "KOSDAQ"
	},
	{
		symbol: "323410.KS",
		name: "카카오뱅크",
		market: "KOSPI"
	},
	{
		symbol: "377300.KS",
		name: "카카오페이",
		market: "KOSPI"
	},
	{
		symbol: "035250.KS",
		name: "강원랜드",
		market: "KOSPI"
	},
	{
		symbol: "161390.KS",
		name: "한국타이어앤테크놀로지",
		market: "KOSPI"
	},
	{
		symbol: "090430.KS",
		name: "아모레퍼시픽",
		market: "KOSPI"
	},
	{
		symbol: "004170.KS",
		name: "신세계",
		market: "KOSPI"
	},
	{
		symbol: "139480.KS",
		name: "이마트",
		market: "KOSPI"
	},
	{
		symbol: "282330.KS",
		name: "BGF리테일",
		market: "KOSPI"
	},
	{
		symbol: "271560.KS",
		name: "오리온",
		market: "KOSPI"
	},
	{
		symbol: "004370.KS",
		name: "농심",
		market: "KOSPI"
	},
	{
		symbol: "097950.KS",
		name: "CJ제일제당",
		market: "KOSPI"
	},
	{
		symbol: "005490.KS",
		name: "POSCO홀딩스",
		market: "KOSPI"
	},
	{
		symbol: "010140.KS",
		name: "삼성중공업",
		market: "KOSPI"
	},
	{
		symbol: "042660.KS",
		name: "한화오션",
		market: "KOSPI"
	},
	{
		symbol: "009540.KS",
		name: "HD한국조선해양",
		market: "KOSPI"
	},
	{
		symbol: "267260.KS",
		name: "HD현대일렉트릭",
		market: "KOSPI"
	},
	{
		symbol: "000810.KS",
		name: "삼성화재",
		market: "KOSPI"
	},
	{
		symbol: "006800.KS",
		name: "미래에셋증권",
		market: "KOSPI"
	},
	{
		symbol: "071050.KS",
		name: "한국금융지주",
		market: "KOSPI"
	},
	{
		symbol: "003230.KS",
		name: "삼양식품",
		market: "KOSPI"
	},
	{
		symbol: "000100.KS",
		name: "유한양행",
		market: "KOSPI"
	},
	{
		symbol: "128940.KS",
		name: "한미약품",
		market: "KOSPI"
	},
	{
		symbol: "326030.KS",
		name: "SK바이오팜",
		market: "KOSPI"
	},
	{
		symbol: "068760.KS",
		name: "셀트리온제약",
		market: "KOSPI"
	},
	{
		symbol: "AAPL",
		name: "애플",
		market: "NASDAQ"
	},
	{
		symbol: "MSFT",
		name: "마이크로소프트",
		market: "NASDAQ"
	},
	{
		symbol: "NVDA",
		name: "엔비디아",
		market: "NASDAQ"
	},
	{
		symbol: "GOOGL",
		name: "구글",
		market: "NASDAQ"
	},
	{
		symbol: "AMZN",
		name: "아마존",
		market: "NASDAQ"
	},
	{
		symbol: "META",
		name: "메타",
		market: "NASDAQ"
	},
	{
		symbol: "TSLA",
		name: "테슬라",
		market: "NASDAQ"
	},
	{
		symbol: "NFLX",
		name: "넷플릭스",
		market: "NASDAQ"
	},
	{
		symbol: "AVGO",
		name: "브로드컴",
		market: "NASDAQ"
	},
	{
		symbol: "AMD",
		name: "AMD",
		market: "NASDAQ"
	},
	{
		symbol: "INTC",
		name: "인텔",
		market: "NASDAQ"
	},
	{
		symbol: "QCOM",
		name: "퀄컴",
		market: "NASDAQ"
	},
	{
		symbol: "ADBE",
		name: "어도비",
		market: "NASDAQ"
	},
	{
		symbol: "ORCL",
		name: "오라클",
		market: "NYSE"
	},
	{
		symbol: "CRM",
		name: "세일즈포스",
		market: "NYSE"
	},
	{
		symbol: "CSCO",
		name: "시스코",
		market: "NASDAQ"
	},
	{
		symbol: "IBM",
		name: "IBM",
		market: "NYSE"
	},
	{
		symbol: "DIS",
		name: "디즈니",
		market: "NYSE"
	},
	{
		symbol: "NKE",
		name: "나이키",
		market: "NYSE"
	},
	{
		symbol: "SBUX",
		name: "스타벅스",
		market: "NASDAQ"
	},
	{
		symbol: "MCD",
		name: "맥도날드",
		market: "NYSE"
	},
	{
		symbol: "KO",
		name: "코카콜라",
		market: "NYSE"
	},
	{
		symbol: "PEP",
		name: "펩시",
		market: "NASDAQ"
	},
	{
		symbol: "WMT",
		name: "월마트",
		market: "NYSE"
	},
	{
		symbol: "COST",
		name: "코스트코",
		market: "NASDAQ"
	},
	{
		symbol: "JPM",
		name: "JP모건",
		market: "NYSE"
	},
	{
		symbol: "V",
		name: "비자",
		market: "NYSE"
	},
	{
		symbol: "MA",
		name: "마스터카드",
		market: "NYSE"
	},
	{
		symbol: "BAC",
		name: "뱅크오브아메리카",
		market: "NYSE"
	},
	{
		symbol: "GS",
		name: "골드만삭스",
		market: "NYSE"
	},
	{
		symbol: "BA",
		name: "보잉",
		market: "NYSE"
	},
	{
		symbol: "CAT",
		name: "캐터필러",
		market: "NYSE"
	},
	{
		symbol: "GE",
		name: "GE",
		market: "NYSE"
	},
	{
		symbol: "PFE",
		name: "화이자",
		market: "NYSE"
	},
	{
		symbol: "JNJ",
		name: "존슨앤존슨",
		market: "NYSE"
	},
	{
		symbol: "UNH",
		name: "유나이티드헬스",
		market: "NYSE"
	},
	{
		symbol: "LLY",
		name: "일라이릴리",
		market: "NYSE"
	},
	{
		symbol: "ABNB",
		name: "에어비앤비",
		market: "NASDAQ"
	},
	{
		symbol: "UBER",
		name: "우버",
		market: "NYSE"
	},
	{
		symbol: "SHOP",
		name: "쇼피파이",
		market: "NYSE"
	},
	{
		symbol: "SPOT",
		name: "스포티파이",
		market: "NYSE"
	},
	{
		symbol: "SONY",
		name: "소니",
		market: "NYSE"
	},
	{
		symbol: "TSM",
		name: "TSMC",
		market: "NYSE"
	},
	{
		symbol: "BABA",
		name: "알리바바",
		market: "NYSE"
	},
	{
		symbol: "PDD",
		name: "핀둬둬",
		market: "NASDAQ"
	},
	{
		symbol: "PLTR",
		name: "팔란티어",
		market: "NASDAQ"
	},
	{
		symbol: "COIN",
		name: "코인베이스",
		market: "NASDAQ"
	},
	{
		symbol: "RIVN",
		name: "리비안",
		market: "NASDAQ"
	},
	{
		symbol: "NIO",
		name: "니오",
		market: "NYSE"
	},
	{
		symbol: "MU",
		name: "마이크론",
		market: "NASDAQ"
	},
	{
		symbol: "ARM",
		name: "암홀딩스",
		market: "NASDAQ"
	},
	{
		symbol: "ASML",
		name: "ASML",
		market: "NASDAQ"
	},
	{
		symbol: "SAP",
		name: "SAP",
		market: "NYSE"
	}
];
var FEATURED_SYMBOLS = [
	"005930.KS",
	"000660.KS",
	"005380.KS",
	"000270.KS",
	"035420.KS",
	"035720.KS",
	"352820.KS",
	"373220.KS",
	"323410.KS",
	"259960.KS",
	"207940.KS",
	"068270.KS",
	"035900.KQ",
	"041510.KQ",
	"122870.KQ",
	"036570.KS",
	"293490.KQ",
	"005490.KS",
	"066570.KS",
	"006400.KS",
	"003230.KS",
	"004370.KS",
	"003490.KS",
	"086520.KQ",
	"377300.KS",
	"015760.KS",
	"AAPL",
	"NVDA",
	"TSLA",
	"MSFT",
	"AMZN",
	"GOOGL",
	"META",
	"NFLX",
	"DIS",
	"NKE",
	"SBUX",
	"MCD",
	"KO",
	"SONY",
	"SPOT",
	"TSM"
];
var bySymbol = new Map(STOCK_CATALOG.map((s) => [s.symbol, s]));
function catalogName(symbol) {
	return bySymbol.get(symbol)?.name;
}
function searchCatalog(query) {
	const q = query.trim().toLowerCase().replace(/\s+/g, "");
	if (!q) return [];
	return STOCK_CATALOG.filter((s) => {
		const name = s.name.toLowerCase().replace(/\s+/g, "");
		const sym = s.symbol.toLowerCase();
		const code = s.symbol.replace(/\.(KS|KQ)$/i, "");
		return name.includes(q) || sym.includes(q) || code.includes(q);
	}).slice(0, 24);
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
var globalRef = globalThis;
function cache() {
	globalRef.__quoteCache__ ??= /* @__PURE__ */ new Map();
	return globalRef.__quoteCache__;
}
function inflight() {
	globalRef.__quoteInflight__ ??= /* @__PURE__ */ new Map();
	return globalRef.__quoteInflight__;
}
var QUOTE_TTL = 6e3;
var FX_TTL = 6e4;
var HISTORY_POINTS = 48;
async function fetchJson(url, timeoutMs = 5e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: {
				"User-Agent": UA,
				Accept: "application/json,text/plain,*/*"
			}
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
async function fetchChart(symbol, interval = "1m", range = "1d") {
	return await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=true`);
}
async function getUsdKrw() {
	const now = Date.now();
	if (globalRef.__fxCache__ && now - globalRef.__fxCache__.at < FX_TTL) return globalRef.__fxCache__.usdKrw;
	try {
		const price = livePrice((await fetchChart("KRW=X", "5m", "5d")).chart?.result?.[0]);
		const usdKrw = typeof price === "number" && price > 0 ? price : 1380;
		globalRef.__fxCache__ = {
			at: now,
			usdKrw
		};
		return usdKrw;
	} catch {
		return globalRef.__fxCache__?.usdKrw ?? 1380;
	}
}
function toKrw(price, currency, usdKrw) {
	const cur = (currency || "USD").toUpperCase();
	if (cur === "KRW") return price;
	if (cur === "USD") return price * usdKrw;
	if (cur === "GBp") return price / 100 * usdKrw;
	return price * usdKrw;
}
function toGamePrice(realKrw) {
	return roundMoney(realKrw / PRICE_SCALE);
}
function displayName(symbol, meta) {
	return catalogName(symbol) || meta.shortName || meta.longName || symbol;
}
function livePrice(result) {
	if (!result) return null;
	const closes = result.indicators?.quote?.[0]?.close ?? [];
	const timestamps = result.timestamp ?? [];
	let lastBar = null;
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
function downsample(rows, max) {
	if (rows.length <= max) return rows;
	const out = [];
	const step = (rows.length - 1) / (max - 1);
	for (let i = 0; i < max; i += 1) out.push(rows[Math.round(i * step)]);
	return out;
}
function parseQuote(symbol, data, usdKrw) {
	const result = data.chart?.result?.[0];
	if (!result) return null;
	const meta = result.meta;
	const realPrice = livePrice(result);
	if (typeof realPrice !== "number" || realPrice <= 0) return null;
	const prev = typeof meta.previousClose === "number" && meta.previousClose > 0 && meta.previousClose || typeof meta.chartPreviousClose === "number" && meta.chartPreviousClose || realPrice;
	const changePercent = prev > 0 ? (realPrice - prev) / prev * 100 : 0;
	const currency = meta.currency || "USD";
	const closes = result.indicators?.quote?.[0]?.close ?? [];
	const timestamps = result.timestamp ?? [];
	const history = [];
	for (let i = 0; i < closes.length; i += 1) {
		const close = closes[i];
		const t = timestamps[i];
		if (typeof close === "number" && close > 0 && typeof t === "number") history.push({
			t,
			game: toGamePrice(toKrw(close, currency, usdKrw))
		});
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
		history: downsample(history, HISTORY_POINTS)
	};
}
async function fetchParsed(symbol, usdKrw) {
	let quote = null;
	try {
		quote = parseQuote(symbol, await fetchChart(symbol, "5m", "1d"), usdKrw);
	} catch {
		quote = null;
	}
	if (quote) return quote;
	return parseQuote(symbol, await fetchChart(symbol, "1d", "5d"), usdKrw);
}
async function loadOne(symbol, usdKrw) {
	const now = Date.now();
	const hit = cache().get(symbol);
	if (hit && now - hit.at < QUOTE_TTL) return hit.quote;
	const pending = inflight().get(symbol);
	if (pending) return pending;
	const job = (async () => {
		try {
			const quote = await fetchParsed(symbol, usdKrw);
			if (quote) cache().set(symbol, {
				at: Date.now(),
				quote
			});
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
async function getQuotes(symbols) {
	const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
	if (unique.length === 0) return [];
	const usdKrw = await getUsdKrw();
	return (await Promise.all(unique.map((s) => loadOne(s, usdKrw)))).filter((row) => Boolean(row));
}
async function getQuote(symbol) {
	return (await getQuotes([symbol]))[0] ?? null;
}
async function searchRemote(query) {
	const q = query.trim();
	if (q.length < 1) return [];
	try {
		return ((await fetchJson(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=12&newsCount=0&enableFuzzyQuery=true`)).quotes ?? []).filter((hit) => {
			const type = (hit.quoteType || "").toUpperCase();
			return type === "EQUITY" || type === "ETF";
		}).map((hit) => ({
			symbol: hit.symbol,
			name: catalogName(hit.symbol) || hit.shortname || hit.longname || hit.symbol,
			market: hit.exchDisp || hit.exchange || ""
		}));
	} catch {
		return [];
	}
}
function resolveSymbol(input) {
	const raw = input.trim();
	const upper = raw.toUpperCase();
	const exact = STOCK_CATALOG.find((s) => s.symbol.toUpperCase() === upper);
	if (exact) return exact.symbol;
	if (/^\d{6}$/.test(raw)) return STOCK_CATALOG.find((s) => s.symbol.startsWith(raw))?.symbol ?? `${raw}.KS`;
	return raw;
}
//#endregion
export { searchCatalog as a, resolveSymbol as i, getQuote as n, searchRemote as o, getQuotes as r, FEATURED_SYMBOLS as t };
