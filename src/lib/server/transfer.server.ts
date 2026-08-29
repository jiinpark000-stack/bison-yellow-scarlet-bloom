import { getSql } from "@/lib/db";
import { formatWon, num } from "@/lib/utils";

export async function transfer(fromId: number, toId: number, amount: number) {
  const amt = Math.round(amount);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error("보낼 금액을 입력해 주세요.");
  if (fromId === toId) throw new Error("내 통장으로는 보낼 수 없어요.");
  const sql = await getSql();
  const fromRows = await sql<{ cash: unknown; name: string }>`
    select cash, name from students where id = ${fromId}
  `;
  const toRows = await sql<{ name: string }>`
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
  return { amount: amt, toName: to.name, fromName: from.name };
}
