import { u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql } from "./session.server-C3UH2SEm.mjs";
import { n as debitVault, t as creditVault } from "./vault.server-BhJ7xgqC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events.server-mPenqCdf.js
function mapEvent(row) {
	return {
		id: row.id,
		name: row.name,
		description: row.description,
		fee: num(row.fee),
		reward: num(row.reward),
		status: row.status,
		eventOn: row.event_on ? String(row.event_on).slice(0, 10) : null,
		createdAt: row.created_at
	};
}
async function listEventsDetailed() {
	const sql = await getSql();
	const rows = await sql`
    select id, name, description, fee, reward, status, event_on::text as event_on,
           created_at::text as created_at
    from events
    order by case status when 'open' then 0 when 'draft' then 1 else 2 end, id desc
  `;
	const signupRows = await sql`
    select e.event_id, e.student_id, s.name as student_name, e.paid, e.rewarded,
           e.created_at::text as created_at
    from event_signups e
    join students s on s.id = e.student_id
    order by s.name
  `;
	const byEvent = /* @__PURE__ */ new Map();
	for (const r of signupRows) {
		const list = byEvent.get(r.event_id) ?? [];
		list.push({
			studentId: r.student_id,
			studentName: r.student_name,
			paid: num(r.paid),
			rewarded: num(r.rewarded),
			createdAt: r.created_at
		});
		byEvent.set(r.event_id, list);
	}
	return rows.map((row) => {
		const signups = byEvent.get(row.id) ?? [];
		return {
			...mapEvent(row),
			signupCount: signups.length,
			signups
		};
	});
}
async function countOpenEvents() {
	return (await (await getSql())`select count(*)::int as n from events where status = 'open'`)[0]?.n ?? 0;
}
async function listStudentEvents(studentId) {
	return (await (await getSql())`
    select e.id, e.name, e.description, e.fee, e.reward, e.status,
           e.event_on::text as event_on,
           coalesce(s.paid, 0) as paid,
           coalesce(s.rewarded, 0) as rewarded,
           (s.student_id is not null) as joined
    from events e
    left join event_signups s on s.event_id = e.id and s.student_id = ${studentId}
    where e.status = 'open' or s.student_id is not null
    order by case e.status when 'open' then 0 else 1 end, e.id desc
  `).map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		fee: num(r.fee),
		reward: num(r.reward),
		status: r.status,
		eventOn: r.event_on ? String(r.event_on).slice(0, 10) : null,
		joined: Boolean(r.joined),
		paid: num(r.paid),
		rewarded: num(r.rewarded)
	}));
}
async function joinEvent(studentId, eventId) {
	const sql = await getSql();
	const event = (await sql`select id, name, fee, status from events where id = ${eventId}`)[0];
	if (!event) throw new Error("행사를 찾을 수 없어요.");
	if (event.status !== "open") throw new Error("지금은 참가할 수 없어요. 선생님이 개최한 뒤에 신청해요.");
	if ((await sql`
    select student_id from event_signups where event_id = ${eventId} and student_id = ${studentId}
  `).length) throw new Error("이미 참가했어요.");
	const fee = num(event.fee);
	const cashRows = await sql`select cash from students where id = ${studentId}`;
	if (num(cashRows[0]?.cash) < fee) throw new Error("잔액이 부족해요.");
	if (fee > 0) {
		await sql`update students set cash = cash - ${fee} where id = ${studentId}`;
		await creditVault(fee, "event", `${event.name} 참가비`);
	}
	await sql`
    insert into event_signups (event_id, student_id, paid)
    values (${eventId}, ${studentId}, ${fee})
  `;
	if (fee > 0) await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'event', ${-fee}, ${`${event.name} 참가비 · 학급 금고`})
    `;
	else await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (${studentId}, 'event', 0, ${`${event.name} 참가`})
    `;
	return { paid: fee };
}
async function cancelEventJoin(studentId, eventId) {
	const sql = await getSql();
	const event = (await sql`select name, status from events where id = ${eventId}`)[0];
	if (!event) throw new Error("행사를 찾을 수 없어요.");
	if (event.status !== "open") throw new Error("끝난 행사는 취소할 수 없어요.");
	const row = (await sql`
    select paid, rewarded from event_signups where event_id = ${eventId} and student_id = ${studentId}
  `)[0];
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
async function payEventRewards(eventId) {
	const sql = await getSql();
	const event = (await sql`
    select name, reward, status from events where id = ${eventId}
  `)[0];
	if (!event) throw new Error("행사를 찾을 수 없어요.");
	const reward = num(event.reward);
	if (reward <= 0) throw new Error("이 행사는 보상이 없어요.");
	const due = await sql`
    select student_id from event_signups where event_id = ${eventId} and rewarded = 0
  `;
	if (due.length === 0) return {
		paid: 0,
		count: 0
	};
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
	return {
		paid: total,
		count: due.length
	};
}
async function joinAllStudents(eventId) {
	const sql = await getSql();
	const events = await sql`select status from events where id = ${eventId}`;
	if (!events[0]) throw new Error("행사를 찾을 수 없어요.");
	if (events[0].status !== "open") throw new Error("개최 중인 행사만 전원 참가시킬 수 있어요.");
	const students = await sql`select id, name from students order by name`;
	const skipped = [];
	let joined = 0;
	for (const student of students) try {
		await joinEvent(student.id, eventId);
		joined += 1;
	} catch (err) {
		const reason = err instanceof Error ? err.message : "참가하지 못했어요.";
		if (reason === "이미 참가했어요.") continue;
		skipped.push({
			name: student.name,
			reason
		});
	}
	return {
		joined,
		skipped
	};
}
//#endregion
export { listEventsDetailed as a, joinEvent as i, countOpenEvents as n, listStudentEvents as o, joinAllStudents as r, payEventRewards as s, cancelEventJoin as t };
