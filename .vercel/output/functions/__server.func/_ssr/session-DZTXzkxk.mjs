import { t as createServerFn } from "./ssr.mjs";
import { _ as unlockVaultWithFace, a as ensureSeeded, c as loadSession, d as loginTeacher, f as readToken, i as destroySession, l as lockVault, n as changeTeacherPassword, o as getSql, r as createServerRpc, u as loginStudent, v as unlockVaultWithPassword } from "./session.server-C3UH2SEm.mjs";
import { a as number, n as array, o as object, s as string } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-DZTXzkxk.js
var getPublicClass_createServerFn_handler = createServerRpc({
	id: "a8622b7af66e42719b4b3d7ffcac8c7460d901d720ff4aab5ce2be2b6e0b8c31",
	name: "getPublicClass",
	filename: "src/lib/fn/session.ts"
}, (opts) => getPublicClass.__executeServer(opts));
var getPublicClass = createServerFn({ method: "GET" }).handler(getPublicClass_createServerFn_handler, async () => {
	await ensureSeeded();
	const sql = await getSql();
	const settings = await sql`
    select class_name, password_changed from settings where id = 1
  `;
	const students = await sql`
    select id, name from students order by name
  `;
	return {
		className: settings[0]?.class_name ?? "6학년 5반",
		passwordChanged: Boolean(settings[0]?.password_changed),
		students
	};
});
var getSession_createServerFn_handler = createServerRpc({
	id: "801f088297d1080a06a0b54e47f0b96dcacbf20c2d639cb444d86435bd1c903a",
	name: "getSession",
	filename: "src/lib/fn/session.ts"
}, (opts) => getSession.__executeServer(opts));
var getSession = createServerFn({ method: "GET" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(getSession_createServerFn_handler, async ({ data }) => {
	return loadSession(data.token);
});
var teacherLoginFn_createServerFn_handler = createServerRpc({
	id: "22448c90f61f0b387df36c22b061542ec0903fea38aa0170b83a155350ce2bac",
	name: "teacherLoginFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => teacherLoginFn.__executeServer(opts));
var teacherLoginFn = createServerFn({ method: "POST" }).validator((d) => object({ password: string().min(1) }).parse(d)).handler(teacherLoginFn_createServerFn_handler, async ({ data }) => loginTeacher(data.password));
var studentLoginFn_createServerFn_handler = createServerRpc({
	id: "ad51bbe8e1f6ffcedaf185f65ed2b36774e394d393a8b27fc1a060718a9320b5",
	name: "studentLoginFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => studentLoginFn.__executeServer(opts));
var studentLoginFn = createServerFn({ method: "POST" }).validator((d) => object({
	studentId: number().int(),
	pin: string().min(1)
}).parse(d)).handler(studentLoginFn_createServerFn_handler, async ({ data }) => loginStudent(data.studentId, data.pin));
var logoutFn_createServerFn_handler = createServerRpc({
	id: "aa73b4bee0703fcee0aee313d64c867e06644f6e1c392cb1add3a30a055bfa2f",
	name: "logoutFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => logoutFn.__executeServer(opts));
var logoutFn = createServerFn({ method: "POST" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(logoutFn_createServerFn_handler, async ({ data }) => {
	const token = await readToken(data.token);
	await destroySession(token);
	return { ok: true };
});
var changeTeacherPasswordFn_createServerFn_handler = createServerRpc({
	id: "80185e4ca8c459161626aaead59f329802da31c04f280b5c16d6dbdce7ba4930",
	name: "changeTeacherPasswordFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => changeTeacherPasswordFn.__executeServer(opts));
var changeTeacherPasswordFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	current: string().min(1),
	next: string().min(4)
}).parse(d)).handler(changeTeacherPasswordFn_createServerFn_handler, async ({ data }) => changeTeacherPassword(data.token ?? "", data.current, data.next));
var registerVaultFaceFn_createServerFn_handler = createServerRpc({
	id: "747bff290e422be6144da8725acf4dcb2c652687e452f3f5ce8b2ebbc7f79c0f",
	name: "registerVaultFaceFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => registerVaultFaceFn.__executeServer(opts));
var registerVaultFaceFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	descriptor: array(number())
}).parse(d)).handler(registerVaultFaceFn_createServerFn_handler, async ({ data }) => {
	const { requireTeacher } = await import("./session.server-C3UH2SEm.mjs").then((n) => n.g).then((n) => n.d);
	const { saveVaultFace } = await import("./vault.server-BhJ7xgqC.mjs").then((n) => n.a).then((n) => n.a);
	await requireTeacher(data.token);
	await saveVaultFace(data.descriptor);
	return { ok: true };
});
var unlockVaultFaceFn_createServerFn_handler = createServerRpc({
	id: "82decfb02566a954ca67a14a520d5ef6635fffa160b8a367da22e01e379bb3cc",
	name: "unlockVaultFaceFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => unlockVaultFaceFn.__executeServer(opts));
var unlockVaultFaceFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	descriptor: array(number())
}).parse(d)).handler(unlockVaultFaceFn_createServerFn_handler, async ({ data }) => unlockVaultWithFace(data.token, data.descriptor));
var unlockVaultPasswordFn_createServerFn_handler = createServerRpc({
	id: "fc139d0ad9542ff10ead20d3559575f7a2f85ec06982e457d15f5bf04c0d8e1d",
	name: "unlockVaultPasswordFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => unlockVaultPasswordFn.__executeServer(opts));
var unlockVaultPasswordFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	password: string().min(1)
}).parse(d)).handler(unlockVaultPasswordFn_createServerFn_handler, async ({ data }) => unlockVaultWithPassword(data.token, data.password));
var lockVaultFn_createServerFn_handler = createServerRpc({
	id: "1ce12fe8abec48c34d3e5ea658216ca02ec72a760e2f52541b7a9341053de156",
	name: "lockVaultFn",
	filename: "src/lib/fn/session.ts"
}, (opts) => lockVaultFn.__executeServer(opts));
var lockVaultFn = createServerFn({ method: "POST" }).validator((d) => object({ token: string().optional() }).parse(d ?? {})).handler(lockVaultFn_createServerFn_handler, async ({ data }) => lockVault(data.token));
//#endregion
export { changeTeacherPasswordFn_createServerFn_handler, getPublicClass_createServerFn_handler, getSession_createServerFn_handler, lockVaultFn_createServerFn_handler, logoutFn_createServerFn_handler, registerVaultFaceFn_createServerFn_handler, studentLoginFn_createServerFn_handler, teacherLoginFn_createServerFn_handler, unlockVaultFaceFn_createServerFn_handler, unlockVaultPasswordFn_createServerFn_handler };
