import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function num(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Monday of the KST calendar week for a YYYY-MM-DD date. */
export function weekStartKst(ymd: string = todayKst()): string {
  const day = ymd.slice(0, 10);
  const [y, m, d] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  const dow = utc.getUTCDay();
  const offset = dow === 0 ? 6 : dow - 1;
  utc.setUTCDate(utc.getUTCDate() - offset);
  return utc.toISOString().slice(0, 10);
}

export function paidThisWeek(lastSalaryOn: string | null | undefined): boolean {
  if (!lastSalaryOn) return false;
  return weekStartKst(lastSalaryOn) === weekStartKst();
}

export function formatWon(value: number, digits = 0): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  if (value < 0) return `-${formatted}원`;
  return `${formatted}원`;
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function interestOn(balance: number, ratePct: number): number {
  if (balance <= 0 || ratePct <= 0) return 0;
  return Math.round((balance * ratePct) / 100);
}

export function changeTone(pct: number): string {
  if (pct > 0) return "text-up";
  if (pct < 0) return "text-down";
  return "text-muted";
}

export function kindLabel(kind: string): string {
  switch (kind) {
    case "salary":
      return "월급";
    case "buy":
      return "주식 매수";
    case "sell":
      return "주식 매도";
    case "snack":
      return "간식";
    case "tax":
      return "세금 납부";
    case "event":
      return "행사";
    case "save":
      return "저축";
    case "interest":
      return "이자";
    case "donate":
      return "기부";
    case "send":
      return "이체";
    case "recv":
      return "이체 입금";
    case "adjust":
      return "조정";
    default:
      return kind;
  }
}

export function vaultKindLabel(kind: string): string {
  switch (kind) {
    case "tax":
      return "세금";
    case "donate":
      return "기부";
    case "event":
      return "행사 참가";
    case "event_out":
      return "행사 지출";
    default:
      return kind;
  }
}

export function taxAppliesLabel(appliesOn: string): string {
  switch (appliesOn) {
    case "income":
      return "월급 받을 때";
    case "gain":
      return "주식 이익 날 때";
    case "snack":
      return "간식 살 때";
    case "manual":
      return "선생님이 고지할 때";
    default:
      return appliesOn;
  }
}

export function taxRuleLabel(kind: { charge: string; rate: number; amount: number }): string {
  if (kind.charge === "fixed") return formatWon(kind.amount);
  return `${kind.rate}%`;
}

export function eventStatusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "준비";
    case "open":
      return "개최 중";
    case "closed":
      return "종료";
    default:
      return status;
  }
}

export function formatDay(ymd: string): string {
  const day = ymd.slice(0, 10);
  const [, m, d] = day.split("-").map(Number);
  if (!m || !d) return day;
  return `${m}월 ${d}일`;
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
