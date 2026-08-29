import { getSql } from "@/lib/db";
import { creditVault, debitVault } from "@/lib/server/vault.server";
import type { ClassEvent, EventSignup, EventStatus, StudentEvent } from "@/lib/types";
import { num } from "@/lib/utils";

function mapEvent(row: {
  id: number;
  name: string;
  description: string;
  fee: unknown;
  reward: unknown;
  status: string;
  event_on: string | null;
  created_at: string;
}): Omit<ClassEvent, "signupCount" | "signups"> {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    fee: num(row.fee),
    reward: num(row.reward),
    status: row.status as EventStatus,
    eventOn: row.event_on ? String(row.event_on).slice(0, 10) : null,
    createdAt: row.created_at,
  };
}

export async function listEventsDetailed(): Promise<ClassEvent[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    description: string;
    fee: unknown;
    reward: unknown;
    status: string;
    event_on: string | null;
    created_at: string;
  }>`
    select id, name, description, fee, reward, status, event_on::text as event_on,
           created_at::text as created_at
    from events
    order by case status when 'open' then 0 when 'draft' then 1 else 2 end, id desc
  `;
  const signupRows = await sql<{
    event_id: number;
    student_id: number;
    student_name: string;
    paid: unknown;
    rewarded: unknown;
    created_at: string;
  }>`
    select e.event_id, e.student_id, s.name as student_name, e.paid, e.rewarded,
           e.created_at::text as created_at
    from event_signups e
    join students s on s.id = e.student_id
    order by s.name
  `;
  const byEvent = new Map<number, EventSignup[]>();
  for (const r of signupRows) {
    const list = byEvent.get(r.event_id) ?? [];
    list.push({
      studentId: r.student_id,
      studentName: r.student_name,
      paid: num(r.paid),
      rewarded: num(r.rewarded),
      createdAt: r.created_at,
    });
    byEvent.set(r.event_id, list);
  }
  return rows.map((row) => {
    const signups = byEvent.get(row.id) ?? [];
    return { ...mapEvent(row), signupCount: signups.length, signups };
  });
}

export async function countOpenEvents(): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ n: number }>`select count(*)::int as n from events where status = 'open'`;
  return rows[0]?.n ?? 0;
}

export async function listStudentEvents(studentId: number): Promise<StudentEvent[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    description: string;
    fee: unknown;
    reward: unknown;
    status: string;
    event_on: string | null;
    paid: unknown;
    rewarded: unknown;
    joined: boolean;
  }>`
    select e.id, e.name, e.description, e.fee, e.reward, e.status,
           e.event_on::text as event_on,
           coalesce(s.paid, 0) as paid,
           coalesce(s.rewarded, 0) as rewarded,
           (s.student_id is not null) as joined
    from events e
    left join event_signups s on s.event_id = e.id and s.student_id = ${studentId}
    where e.status = 'open' or s.student_id is not null
    order by case e.status when 'open' then 0 else 1 end, e.id desc
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    fee: num(r.fee),
    reward: num(r.reward),
    status: r.status as EventStatus,
    eventOn: r.event_on ? String(r.event_on).slice(0, 10) : null,
    joined: Boolean(r.joined),
    paid: num(r.paid),
    rewarded: num(r.rewarded),
  }));
}

export async function joinEvent(studentId: number, eventId: number): Promise<{ paid: number }> {
  const sql = await getSql();
  const events = await sql<{
    id: number;
    name: string;
    fee: unknown;
    status: string;
  }>`select id, name, fee, status from events where id = ${eventId}`;
  const event = events[0];
  if (!event) throw new Error("행사를 찾을 수 없어요.");
  if (event.status !== "open") throw new Error("지금은 참가할 수 없어요. 선생님이 개최한 뒤에 신청해요.");
  const exists = await sql<{ student_id: number }>`
    select student_id from event_signups where event_id = ${eventId} and student_id = ${studentId}
  `;
  if (exists.length) throw new Error("이미 참가했어요.");
  const fee = num(event.fee);
  const cashRows = await sql<{ cash: unknown }>`select cash from students where id = ${studentId}`;
  if (num(cashRows[0]?.cash) < fee) throw new Error("잔액이 부족해요.");
  if (fee > 0) {
    await sql`update students set cash = cash - ${fee} where id = ${studentId}`;
    await creditVault(fee, "event", `${event.name} 참가비`);
  }
  await sql`
    insert into event_signups (event_id, student_id, paid)
    values (${eventId}, ${studentId}, ${fee})
  `;
  if (fee > 0) {
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'event', ${-fee}, ${`${event.name} 참가비 · 학급 금고`})
    `;
  } else {
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'event', 0, ${`${event.name} 참가`})
    `;
  }
  return { paid: fee };
}

export async function cancelEventJoin(studentId: number, eventId: number): Promise<{ refunded: number }> {
  const sql = await getSql();
  const events = await sql<{ name: string; status: string }>`select name, status from events where id = ${eventId}`;
  const event = events[0];
  if (!event) throw new Error("행사를 찾을 수 없어요.");
  if (event.status !== "open") throw new Error("끝난 행사는 취소할 수 없어요.");
  const rows = await sql<{ paid: unknown; rewarded: unknown }>`
    select paid, rewarded from event_signups where event_id = ${eventId} and student_id = ${studentId}
  `;
  const row = rows[0];
  if (!row) throw new Error("참가 기록이 없어요.");
  if (num(row.rewarded) > 0) throw new Error("보상을 받은 뒤에는 취소할 수 없어요.");
  const paid = num(row.paid);
  await sql`delete from event_signups where event_id = ${eventId} and student_id = ${studentId}`;
  if (paid > 0) {
    await sql`update students set cash = cash + ${paid} where id = ${studentId}`;
    await debitVault(paid, "event_out", `${event.name} 참가 취소 환불`);
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'event', ${paid}, ${`${event.name} 참가 취소 환불`})
    `;
  }
  return { refunded: paid };
}

export async function payEventRewards(eventId: number): Promise<{ paid: number; count: number }> {
  const sql = await getSql();
  const events = await sql<{ name: string; reward: unknown; status: string }>`
    select name, reward, status from events where id = ${eventId}
  `;
  const event = events[0];
  if (!event) throw new Error("행사를 찾을 수 없어요.");
  const reward = num(event.reward);
  if (reward <= 0) throw new Error("이 행사는 보상이 없어요.");
  const due = await sql<{ student_id: number }>`
    select student_id from event_signups where event_id = ${eventId} and rewarded = 0
  `;
  if (due.length === 0) return { paid: 0, count: 0 };
  const total = reward * due.length;
  await debitVault(total, "event_out", `${event.name} 참여 보상 ${due.length}명`);
  for (const row of due) {
    await sql`update students set cash = cash + ${reward} where id = ${row.student_id}`;
    await sql`
      update event_signups set rewarded = ${reward}
      where event_id = ${eventId} and student_id = ${row.student_id}
    `;
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${row.student_id}, 'event', ${reward}, ${`${event.name} 참여 보상`})
    `;
  }
  return { paid: total, count: due.length };
}

export async function joinAllStudents(
  eventId: number,
): Promise<{ joined: number; skipped: { name: string; reason: string }[] }> {
  const sql = await getSql();
  const events = await sql<{ status: string }>`select status from events where id = ${eventId}`;
  if (!events[0]) throw new Error("행사를 찾을 수 없어요.");
  if (events[0].status !== "open") throw new Error("개최 중인 행사만 전원 참가시킬 수 있어요.");
  const students = await sql<{ id: number; name: string }>`select id, name from students order by name`;
  const skipped: { name: string; reason: string }[] = [];
  let joined = 0;
  for (const student of students) {
    try {
      await joinEvent(student.id, eventId);
      joined += 1;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "참가하지 못했어요.";
      if (reason === "이미 참가했어요.") continue;
      skipped.push({ name: student.name, reason });
    }
  }
  return { joined, skipped };
}
