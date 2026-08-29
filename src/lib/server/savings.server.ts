import { getSql } from "@/lib/db";
import { formatWon, interestOn, num, todayKst, weekStartKst } from "@/lib/utils";

export { interestOn };

export async function getSavingsRate(): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ savings_rate: unknown }>`select savings_rate from settings where id = 1`;
  return num(rows[0]?.savings_rate);
}

export async function setSavingsRate(rate: number): Promise<number> {
  const sql = await getSql();
  await sql`update settings set savings_rate = ${rate}, updated_at = now() where id = 1`;
  return rate;
}

export async function moveSavings(
  studentId: number,
  amount: number,
): Promise<{ cash: number; savings: number }> {
  const amt = Math.round(amount);
  if (!Number.isFinite(amt) || amt === 0) throw new Error("금액을 입력해 주세요.");
  const sql = await getSql();
  const rows = await sql<{ cash: unknown; savings: unknown }>`
    select cash, savings from students where id = ${studentId}
  `;
  const row = rows[0];
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
  const next = await sql<{ cash: unknown; savings: unknown }>`
    select cash, savings from students where id = ${studentId}
  `;
  return { cash: num(next[0]?.cash), savings: num(next[0]?.savings) };
}

export async function payDueInterest(studentId: number): Promise<{ paid: number } | null> {
  const sql = await getSql();
  const today = todayKst();
  const weekStart = weekStartKst(today);
  const rate = await getSavingsRate();
  const rows = await sql<{ savings: unknown; last_interest_on: string | null }>`
    select savings, last_interest_on from students where id = ${studentId}
  `;
  const row = rows[0];
  if (!row) return null;
  const lastOn = row.last_interest_on ? String(row.last_interest_on).slice(0, 10) : null;
  if (lastOn && lastOn >= weekStart) return null;
  const savings = num(row.savings);
  if (savings <= 0) return null;
  const paid = interestOn(savings, rate);
  const updated = await sql<{ savings: unknown }>`
    update students
    set savings = savings + ${paid}, last_interest_on = ${today}
    where id = ${studentId}
      and savings > 0
      and (last_interest_on is null or last_interest_on < ${weekStart})
    returning savings
  `;
  if (updated.length === 0) return null;
  if (paid > 0) {
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'interest', ${paid}, ${`저축 일주일 이자 ${rate}%`})
    `;
  }
  return { paid };
}

export async function payAllDueInterest(): Promise<{ count: number; paid: number }> {
  const sql = await getSql();
  const ids = await sql<{ id: number }>`select id from students`;
  let count = 0;
  let paid = 0;
  for (const row of ids) {
    const result = await payDueInterest(row.id);
    if (result && result.paid > 0) {
      count += 1;
      paid += result.paid;
    }
  }
  return { count, paid };
}
