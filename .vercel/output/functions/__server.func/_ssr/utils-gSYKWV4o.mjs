import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-gSYKWV4o.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function num(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string" && value.trim()) {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
function todayKst() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
/** Monday of the KST calendar week for a YYYY-MM-DD date. */
function weekStartKst(ymd = todayKst()) {
	const [y, m, d] = ymd.slice(0, 10).split("-").map(Number);
	const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
	const dow = utc.getUTCDay();
	const offset = dow === 0 ? 6 : dow - 1;
	utc.setUTCDate(utc.getUTCDate() - offset);
	return utc.toISOString().slice(0, 10);
}
function paidThisWeek(lastSalaryOn) {
	if (!lastSalaryOn) return false;
	return weekStartKst(lastSalaryOn) === weekStartKst();
}
function formatWon(value, digits = 0) {
	const formatted = Math.abs(value).toLocaleString("ko-KR", {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	});
	if (value < 0) return `-${formatted}원`;
	return `${formatted}원`;
}
function formatPct(value) {
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function roundMoney(value) {
	return Math.round(value * 100) / 100;
}
function interestOn(balance, ratePct) {
	if (balance <= 0 || ratePct <= 0) return 0;
	return Math.round(balance * ratePct / 100);
}
function changeTone(pct) {
	if (pct > 0) return "text-up";
	if (pct < 0) return "text-down";
	return "text-muted";
}
function kindLabel(kind) {
	switch (kind) {
		case "salary": return "월급";
		case "buy": return "주식 매수";
		case "sell": return "주식 매도";
		case "snack": return "간식";
		case "tax": return "세금 납부";
		case "event": return "행사";
		case "save": return "저축";
		case "interest": return "이자";
		case "donate": return "기부";
		case "send": return "이체";
		case "recv": return "이체 입금";
		case "adjust": return "조정";
		default: return kind;
	}
}
function vaultKindLabel(kind) {
	switch (kind) {
		case "tax": return "세금";
		case "donate": return "기부";
		case "event": return "행사 참가";
		case "event_out": return "행사 지출";
		default: return kind;
	}
}
function taxAppliesLabel(appliesOn) {
	switch (appliesOn) {
		case "income": return "월급 받을 때";
		case "gain": return "주식 이익 날 때";
		case "snack": return "간식 살 때";
		case "manual": return "선생님이 고지할 때";
		default: return appliesOn;
	}
}
function taxRuleLabel(kind) {
	if (kind.charge === "fixed") return formatWon(kind.amount);
	return `${kind.rate}%`;
}
function eventStatusLabel(status) {
	switch (status) {
		case "draft": return "준비";
		case "open": return "개최 중";
		case "closed": return "종료";
		default: return status;
	}
}
function formatDay(ymd) {
	const day = ymd.slice(0, 10);
	const [, m, d] = day.split("-").map(Number);
	if (!m || !d) return day;
	return `${m}월 ${d}일`;
}
function formatWhen(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat("ko-KR", {
		timeZone: "Asia/Seoul",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(d);
}
//#endregion
export { weekStartKst as _, formatPct as a, interestOn as c, paidThisWeek as d, roundMoney as f, vaultKindLabel as g, todayKst as h, formatDay as i, kindLabel as l, taxRuleLabel as m, cn as n, formatWhen as o, taxAppliesLabel as p, eventStatusLabel as r, formatWon as s, changeTone as t, num as u };
