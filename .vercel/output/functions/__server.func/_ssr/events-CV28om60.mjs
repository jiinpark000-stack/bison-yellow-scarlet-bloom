import { t as createServerFn } from "./ssr.mjs";
import { h as requireVaultOpen, m as requireTeacher, o as getSql, p as requireStudent, r as createServerRpc } from "./session.server-C3UH2SEm.mjs";
import { i as joinEvent, o as listStudentEvents, r as joinAllStudents, s as payEventRewards, t as cancelEventJoin } from "./events.server-mPenqCdf.mjs";
import { a as number, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events-CV28om60.js
var tokenSchema = object({ token: string().optional() });
var upsertEventFn_createServerFn_handler = createServerRpc({
	id: "c8d2fd324e4be2bbc41c2485534b6114a0017b07ed7a9fc2b31678e4290d84ce",
	name: "upsertEventFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => upsertEventFn.__executeServer(opts));
var upsertEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(30),
	description: string().max(120).optional(),
	fee: number().min(0).max(1e5),
	reward: number().min(0).max(1e5),
	eventOn: string().optional(),
	openNow: boolean().optional()
}).parse(d)).handler(upsertEventFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	const name = data.name.trim();
	const description = (data.description ?? "").trim();
	const eventOn = data.eventOn && /^\d{4}-\d{2}-\d{2}$/.test(data.eventOn) ? data.eventOn : null;
	const status = data.openNow ? "open" : "draft";
	if (data.id) {
		await sql`
        update events
        set name = ${name},
            description = ${description},
            fee = ${data.fee},
            reward = ${data.reward},
            event_on = ${eventOn}
        where id = ${data.id}
      `;
		return {
			ok: true,
			id: data.id
		};
	}
	return {
		ok: true,
		id: (await sql`
      insert into events (name, description, fee, reward, status, event_on)
      values (${name}, ${description}, ${data.fee}, ${data.reward}, ${status}, ${eventOn})
      returning id
    `)[0]?.id ?? 0
	};
});
var setEventStatusFn_createServerFn_handler = createServerRpc({
	id: "804d111d2b1294fb9097e71d98a041828059cbb0089f8e5f10e96832233bc286",
	name: "setEventStatusFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => setEventStatusFn.__executeServer(opts));
var setEventStatusFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int(),
	status: _enum([
		"draft",
		"open",
		"closed"
	])
}).parse(d)).handler(setEventStatusFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`update events set status = ${data.status} where id = ${data.id}`;
	return { ok: true };
});
var deleteEventFn_createServerFn_handler = createServerRpc({
	id: "e2561243f50514b3ae5f8c78537b7204f604e650b2a43d3ca0261ad7cdd35066",
	name: "deleteEventFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => deleteEventFn.__executeServer(opts));
var deleteEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(deleteEventFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`delete from events where id = ${data.id}`;
	return { ok: true };
});
var teacherJoinEventFn_createServerFn_handler = createServerRpc({
	id: "d91a8dfb9af0ad49956bf45f147fbcde91926f92096ec61bd8b1340452b28bc4",
	name: "teacherJoinEventFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => teacherJoinEventFn.__executeServer(opts));
var teacherJoinEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int(),
	studentId: number().int()
}).parse(d)).handler(teacherJoinEventFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return joinEvent(data.studentId, data.eventId);
});
var teacherCancelEventFn_createServerFn_handler = createServerRpc({
	id: "84150c9443884163455548a5607a082891e530c4225eabb165ee4b83ae2ae9bf",
	name: "teacherCancelEventFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => teacherCancelEventFn.__executeServer(opts));
var teacherCancelEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int(),
	studentId: number().int()
}).parse(d)).handler(teacherCancelEventFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return cancelEventJoin(data.studentId, data.eventId);
});
var teacherJoinAllFn_createServerFn_handler = createServerRpc({
	id: "ac079925e5ef7977cdbdf517dff61859b8ab63dc6f0ef8a6aba7cfc9b6aaa3b0",
	name: "teacherJoinAllFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => teacherJoinAllFn.__executeServer(opts));
var teacherJoinAllFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(teacherJoinAllFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return joinAllStudents(data.eventId);
});
var payEventRewardsFn_createServerFn_handler = createServerRpc({
	id: "bb78d89cc1887717c1d46fbbaa4da6cfc20a2982dc5db8d21463c2eafa7c1f81",
	name: "payEventRewardsFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => payEventRewardsFn.__executeServer(opts));
var payEventRewardsFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(payEventRewardsFn_createServerFn_handler, async ({ data }) => {
	await requireVaultOpen(data.token);
	return payEventRewards(data.eventId);
});
var studentEventsFn_createServerFn_handler = createServerRpc({
	id: "abf6b354369f78106087dc28ccb974752837bf574fde8ed371bba89a54ef8192",
	name: "studentEventsFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => studentEventsFn.__executeServer(opts));
var studentEventsFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(studentEventsFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return listStudentEvents(session.student.id);
});
var joinEventFn_createServerFn_handler = createServerRpc({
	id: "91676114b4d8233cad65fbc774569a9a27a8d2dea9291135ebc17283dd7b4f74",
	name: "joinEventFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => joinEventFn.__executeServer(opts));
var joinEventFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(joinEventFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return joinEvent(session.student.id, data.eventId);
});
var cancelJoinFn_createServerFn_handler = createServerRpc({
	id: "8ec5fd2a5ecf520cd9e13498d6a757c62bf03fb58d2e2a833f5878a32ac5eefa",
	name: "cancelJoinFn",
	filename: "src/lib/fn/events.ts"
}, (opts) => cancelJoinFn.__executeServer(opts));
var cancelJoinFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	eventId: number().int()
}).parse(d)).handler(cancelJoinFn_createServerFn_handler, async ({ data }) => {
	const session = await requireStudent(data.token);
	return cancelEventJoin(session.student.id, data.eventId);
});
//#endregion
export { cancelJoinFn_createServerFn_handler, deleteEventFn_createServerFn_handler, joinEventFn_createServerFn_handler, payEventRewardsFn_createServerFn_handler, setEventStatusFn_createServerFn_handler, studentEventsFn_createServerFn_handler, teacherCancelEventFn_createServerFn_handler, teacherJoinAllFn_createServerFn_handler, teacherJoinEventFn_createServerFn_handler, upsertEventFn_createServerFn_handler };
