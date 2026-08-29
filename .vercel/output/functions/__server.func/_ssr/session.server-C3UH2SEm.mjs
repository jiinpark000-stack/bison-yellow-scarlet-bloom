import { r as __exportAll$1 } from "../_runtime.mjs";
import { a as getCookie, i as deleteCookie$1, n as TSS_SERVER_FUNCTION, o as setCookie$1 } from "./ssr.mjs";
import { u as num } from "./utils-gSYKWV4o.mjs";
import { t as DEFAULT_TEACHER_PASSWORD } from "./types-CAoddweu.mjs";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-C3UH2SEm.js
var session_server_C3UH2SEm_exports = /* @__PURE__ */ __exportAll$1({
	_: () => createServerRpc,
	a: () => loginStudent,
	c: () => requireStudent,
	d: () => session_server_exports,
	f: () => unlockVaultWithFace,
	g: () => getSql,
	h: () => hashSecret,
	i: () => lockVault,
	l: () => requireTeacher,
	m: () => ensureSeeded,
	n: () => destroySession,
	o: () => loginTeacher,
	p: () => unlockVaultWithPassword,
	r: () => loadSession,
	s: () => readToken,
	t: () => changeTeacherPassword,
	u: () => requireVaultOpen,
	v: () => __exportAll
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_classroom_default = "-- 6학년 5반 모이뱅크 — classroom finance play\ncreate table if not exists settings (\n  id integer primary key check (id = 1),\n  class_name text not null default '6학년 5반',\n  teacher_password_hash text not null,\n  password_changed boolean not null default false,\n  starting_cash numeric(14, 2) not null default 1000,\n  price_scale integer not null default 1000,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists jobs (\n  id serial primary key,\n  name text not null unique,\n  salary numeric(14, 2) not null,\n  sort_order integer not null default 0\n);\n\ncreate table if not exists students (\n  id serial primary key,\n  name text not null unique,\n  pin_hash text not null,\n  job_id integer references jobs (id) on delete set null,\n  cash numeric(14, 2) not null default 1000,\n  last_salary_on date,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists products (\n  id serial primary key,\n  name text not null,\n  price numeric(14, 2) not null,\n  description text not null default '',\n  is_active boolean not null default true,\n  sort_order integer not null default 0\n);\n\ncreate table if not exists orders (\n  id serial primary key,\n  student_id integer not null references students (id) on delete cascade,\n  product_id integer not null references products (id),\n  product_name text not null,\n  qty integer not null check (qty > 0),\n  unit_price numeric(14, 2) not null,\n  status text not null default 'waiting',\n  created_at timestamptz not null default now(),\n  fulfilled_at timestamptz\n);\n\ncreate index if not exists orders_status_idx on orders (status, created_at desc);\ncreate index if not exists orders_student_idx on orders (student_id, created_at desc);\n\ncreate table if not exists holdings (\n  student_id integer not null references students (id) on delete cascade,\n  symbol text not null,\n  name text not null,\n  qty integer not null check (qty > 0),\n  avg_cost numeric(14, 2) not null,\n  primary key (student_id, symbol)\n);\n\ncreate table if not exists ledger (\n  id serial primary key,\n  student_id integer not null references students (id) on delete cascade,\n  kind text not null,\n  amount numeric(14, 2) not null,\n  memo text not null default '',\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists ledger_student_idx on ledger (student_id, created_at desc);\n\ncreate table if not exists sessions (\n  token text primary key,\n  role text not null,\n  student_id integer references students (id) on delete cascade,\n  expires_at timestamptz not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists sessions_expires_idx on sessions (expires_at);\n";
var _0003_tax_default = "-- 학급 세금: 세율, 학급 금고, 학생 미납\nalter table settings add column if not exists income_tax_rate numeric(6, 2) not null default 10;\nalter table settings add column if not exists gain_tax_rate numeric(6, 2) not null default 10;\nalter table settings add column if not exists snack_tax_rate numeric(6, 2) not null default 0;\nalter table settings add column if not exists tax_vault numeric(14, 2) not null default 0;\n\nalter table students add column if not exists tax_due numeric(14, 2) not null default 0;\n";
var _0004_tax_kinds_default = "-- 선생님이 세금 종류(건강세, 환경세 등)를 직접 만들고 관리\ncreate table if not exists tax_kinds (\n  id serial primary key,\n  name text not null unique,\n  applies_on text not null,\n  charge text not null,\n  rate numeric(6, 2) not null default 0,\n  amount numeric(14, 2) not null default 0,\n  is_active boolean not null default true,\n  sort_order integer not null default 0\n);\n\ncreate table if not exists tax_bills (\n  id serial primary key,\n  student_id integer not null references students (id) on delete cascade,\n  tax_kind_id integer references tax_kinds (id) on delete set null,\n  kind_name text not null,\n  amount numeric(14, 2) not null,\n  paid numeric(14, 2) not null default 0,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists tax_bills_student_idx on tax_bills (student_id, id);\n\ninsert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)\nselect '월급세', 'income', 'percent', coalesce((select income_tax_rate from settings where id = 1), 10), 0, true, 1\nwhere not exists (select 1 from tax_kinds where name = '월급세');\n\ninsert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)\nselect '건강세', 'income', 'percent', 5, 0, true, 2\nwhere not exists (select 1 from tax_kinds where name = '건강세');\n\ninsert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)\nselect '주식 양도세', 'gain', 'percent', coalesce((select gain_tax_rate from settings where id = 1), 10), 0, true, 3\nwhere not exists (select 1 from tax_kinds where name = '주식 양도세');\n\ninsert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)\nselect '간식세', 'snack', 'percent', coalesce((select snack_tax_rate from settings where id = 1), 0), 0, true, 4\nwhere not exists (select 1 from tax_kinds where name = '간식세');\n";
var _0005_weekly_salary_default = "-- 월급을 하루가 아니라 일주일 단위로 지급. 기존 하루 월급은 7배로 맞춤.\nalter table settings add column if not exists weekly_salary_applied boolean not null default false;\n\nupdate jobs\nset salary = salary * 7\nwhere (select coalesce(weekly_salary_applied, false) from settings where id = 1) = false;\n\nupdate settings\nset weekly_salary_applied = true\nwhere id = 1 and weekly_salary_applied = false;\n";
var _0006_events_default = "-- 학급 이벤트: 선생님이 등록·개최, 학생이 참가비 내고 참여\ncreate table if not exists events (\n  id serial primary key,\n  name text not null,\n  description text not null default '',\n  fee numeric(14, 2) not null default 0,\n  reward numeric(14, 2) not null default 0,\n  status text not null default 'draft',\n  event_on date,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists event_signups (\n  event_id integer not null references events (id) on delete cascade,\n  student_id integer not null references students (id) on delete cascade,\n  paid numeric(14, 2) not null default 0,\n  rewarded numeric(14, 2) not null default 0,\n  created_at timestamptz not null default now(),\n  primary key (event_id, student_id)\n);\n\ncreate index if not exists event_signups_student_idx on event_signups (student_id);\ncreate index if not exists events_status_idx on events (status, id desc);\n";
var _0007_savings_default = "-- 학급 저축: 학생 저축 잔액, 일주일 이자율 (선생님 조정)\nalter table settings add column if not exists savings_rate numeric(6, 2) not null default 5;\n\nalter table students add column if not exists savings numeric(14, 2) not null default 0;\nalter table students add column if not exists last_interest_on date;\n";
var _0008_vault_security_default = "alter table settings add column if not exists teacher_fail_count integer not null default 0;\nalter table settings add column if not exists teacher_locked_until timestamptz;\n\nalter table students add column if not exists pin_fail_count integer not null default 0;\nalter table students add column if not exists pin_locked_until timestamptz;\n\nalter table sessions add column if not exists vault_until timestamptz;\n\ncreate table if not exists vault_ledger (\n  id serial primary key,\n  kind text not null,\n  amount numeric(14, 2) not null,\n  memo text not null default '',\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists vault_ledger_id_idx on vault_ledger (id desc);\n";
var _0009_vault_face_default = "alter table settings add column if not exists vault_face text;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef$1 = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef$1.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef$1.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef$1.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef$1.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef$1.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef$1.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_classroom.sql": _0002_classroom_default,
			"/migrations/0003_tax.sql": _0003_tax_default,
			"/migrations/0004_tax_kinds.sql": _0004_tax_kinds_default,
			"/migrations/0005_weekly_salary.sql": _0005_weekly_salary_default,
			"/migrations/0006_events.sql": _0006_events_default,
			"/migrations/0007_savings.sql": _0007_savings_default,
			"/migrations/0008_vault_security.sql": _0008_vault_security_default,
			"/migrations/0009_vault_face.sql": _0009_vault_face_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef$1.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef$1.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var scryptAsync = promisify(scrypt);
async function hashSecret(secret) {
	const salt = randomBytes(16);
	const key = await scryptAsync(secret, salt, 32);
	return `${salt.toString("hex")}:${key.toString("hex")}`;
}
async function verifySecret(secret, stored) {
	const [saltHex, keyHex] = stored.split(":");
	if (!saltHex || !keyHex) return false;
	const salt = Buffer.from(saltHex, "hex");
	const key = Buffer.from(keyHex, "hex");
	const next = await scryptAsync(secret, salt, 32);
	if (next.length !== key.length) return false;
	return timingSafeEqual(next, key);
}
function randomToken() {
	return randomBytes(32).toString("hex");
}
var globalRef = globalThis;
function ensureSeeded() {
	globalRef.__moibankSeed__ ??= seed().catch((err) => {
		globalRef.__moibankSeed__ = void 0;
		throw err;
	});
	return globalRef.__moibankSeed__;
}
async function seed() {
	const sql = await getSql();
	if ((await sql`select id from settings where id = 1`).length === 0) await sql`
      insert into settings (id, class_name, teacher_password_hash, password_changed)
      values (1, '6학년 5반', ${await hashSecret(DEFAULT_TEACHER_PASSWORD)}, false)
    `;
	if (((await sql`select count(*)::int as n from jobs`)[0]?.n ?? 0) === 0) for (const [name, salary, sort] of [
		[
			"학급회장",
			700,
			1
		],
		[
			"부회장",
			560,
			2
		],
		[
			"환경부장",
			490,
			3
		],
		[
			"체육부장",
			490,
			4
		],
		[
			"학습부장",
			490,
			5
		],
		[
			"급식도우미",
			420,
			6
		],
		[
			"칠판담당",
			350,
			7
		],
		[
			"학생",
			280,
			8
		]
	]) await sql`
        insert into jobs (name, salary, sort_order)
        values (${name}, ${salary}, ${sort})
      `;
	if (((await sql`select count(*)::int as n from products`)[0]?.n ?? 0) === 0) for (const [name, price, description, sort] of [
		[
			"초코파이",
			80,
			"달콤한 초코파이 1개",
			1
		],
		[
			"새우깡",
			70,
			"바삭한 새우깡 한 봉",
			2
		],
		[
			"젤리",
			50,
			"과일맛 젤리",
			3
		],
		[
			"주스",
			100,
			"과일 주스 한 잔",
			4
		],
		[
			"초콜릿",
			90,
			"우유 초콜릿",
			5
		],
		[
			"아이스크림",
			120,
			"학교 오는 날 받는 아이스크림",
			6
		]
	]) await sql`
        insert into products (name, price, description, sort_order)
        values (${name}, ${price}, ${description}, ${sort})
      `;
}
var session_server_exports = /* @__PURE__ */ __exportAll({
	changeTeacherPassword: () => changeTeacherPassword,
	createSession: () => createSession,
	destroySession: () => destroySession,
	loadSession: () => loadSession,
	lockVault: () => lockVault,
	loginStudent: () => loginStudent,
	loginTeacher: () => loginTeacher,
	readToken: () => readToken,
	requireStudent: () => requireStudent,
	requireTeacher: () => requireTeacher,
	requireVaultOpen: () => requireVaultOpen,
	unlockVaultWithFace: () => unlockVaultWithFace,
	unlockVaultWithPassword: () => unlockVaultWithPassword
});
var COOKIE = "mb_session";
var TTL_MS = 2592e6;
async function readToken(bodyToken) {
	const fromBody = bodyToken?.trim();
	if (fromBody) return fromBody;
	return getCookie(COOKIE) ?? "";
}
function writeCookie(token) {
	setCookie$1(COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 2592e3
	});
}
function clearCookie() {
	deleteCookie$1(COOKIE, { path: "/" });
}
async function studentPublic(id) {
	const row = (await (await getSql())`
    select s.id, s.name, s.cash, s.savings, s.last_salary_on, s.last_interest_on, s.tax_due, j.name as job_name, j.salary
    from students s
    left join jobs j on j.id = s.job_id
    where s.id = ${id}
  `)[0];
	if (!row) return null;
	return {
		id: row.id,
		name: row.name,
		jobName: row.job_name,
		salary: num(row.salary),
		cash: num(row.cash),
		savings: num(row.savings),
		lastSalaryOn: row.last_salary_on,
		lastInterestOn: row.last_interest_on,
		taxDue: num(row.tax_due)
	};
}
async function createSession(role, studentId) {
	const sql = await getSql();
	const token = randomToken();
	const expires = new Date(Date.now() + TTL_MS).toISOString();
	await sql`
    insert into sessions (token, role, student_id, expires_at)
    values (${token}, ${role}, ${studentId ?? null}, ${expires})
  `;
	writeCookie(token);
	return token;
}
async function destroySession(token) {
	if (!token) return;
	await (await getSql())`delete from sessions where token = ${token}`;
	clearCookie();
}
async function loadSession(bodyToken) {
	await ensureSeeded();
	const token = await readToken(bodyToken);
	if (!token) return null;
	const sql = await getSql();
	const row = (await sql`
    select token, role, student_id, expires_at::text as expires_at, vault_until::text as vault_until
    from sessions
    where token = ${token}
  `)[0];
	if (!row) return null;
	if (new Date(row.expires_at).getTime() < Date.now()) {
		await sql`delete from sessions where token = ${token}`;
		return null;
	}
	const settings = await sql`
    select class_name, password_changed from settings where id = 1
  `;
	const className = settings[0]?.class_name ?? "6학년 5반";
	if (row.role === "teacher") {
		const vaultUntil = row.vault_until ? new Date(row.vault_until).getTime() : 0;
		return {
			role: "teacher",
			className,
			passwordChanged: Boolean(settings[0]?.password_changed),
			vaultUnlocked: Boolean(row.vault_until) && !Number.isNaN(vaultUntil)
		};
	}
	if (!row.student_id) return null;
	const student = await studentPublic(row.student_id);
	if (!student) return null;
	return {
		role: "student",
		className,
		student
	};
}
async function requireTeacher(bodyToken) {
	const session = await loadSession(bodyToken);
	if (!session || session.role !== "teacher") throw new Error("선생님으로 로그인해 주세요.");
	return session;
}
async function requireStudent(bodyToken) {
	const session = await loadSession(bodyToken);
	if (!session || session.role !== "student") throw new Error("학생으로 로그인해 주세요.");
	return session;
}
async function requireVaultOpen(bodyToken) {
	const session = await requireTeacher(bodyToken);
	if (!session.vaultUnlocked) throw new Error("학급 창고가 잠겨 있어요. 세금 탭에서 얼굴이나 비밀번호로 열어 주세요.");
	return session;
}
async function loginTeacher(password) {
	await ensureSeeded();
	const hash = (await (await getSql())`
    select teacher_password_hash from settings where id = 1
  `)[0]?.teacher_password_hash;
	if (!hash || !await verifySecret(password, hash)) throw new Error("비밀번호가 올바르지 않아요.");
	const token = await createSession("teacher");
	return {
		token,
		session: await loadSession(token)
	};
}
async function openVaultSession(bodyToken) {
	const token = await readToken(bodyToken);
	await (await getSql())`update sessions set vault_until = now() where token = ${token}`;
	return { ok: true };
}
async function unlockVaultWithFace(bodyToken, descriptor) {
	await requireTeacher(bodyToken);
	const { matchVaultFace } = await import("./vault.server-BhJ7xgqC.mjs").then((n) => n.a).then((n) => n.a);
	if (!await matchVaultFace(descriptor)) throw new Error("등록한 얼굴과 달라요. 다시 카메라를 맞춰 주세요.");
	return openVaultSession(bodyToken);
}
async function unlockVaultWithPassword(bodyToken, password) {
	await requireTeacher(bodyToken);
	const hash = (await (await getSql())`
    select teacher_password_hash from settings where id = 1
  `)[0]?.teacher_password_hash;
	if (!hash || !await verifySecret(password, hash)) throw new Error("비밀번호가 올바르지 않아요.");
	return openVaultSession(bodyToken);
}
async function lockVault(bodyToken) {
	await requireTeacher(bodyToken);
	const token = await readToken(bodyToken);
	await (await getSql())`update sessions set vault_until = null where token = ${token}`;
	return { ok: true };
}
async function changeTeacherPassword(token, current, next) {
	await requireTeacher(token);
	if (next.trim().length < 4) throw new Error("새 비밀번호는 4자 이상이어야 해요.");
	const sql = await getSql();
	const hash = (await sql`
    select teacher_password_hash from settings where id = 1
  `)[0]?.teacher_password_hash;
	if (!hash || !await verifySecret(current, hash)) throw new Error("지금 비밀번호가 올바르지 않아요.");
	await sql`
    update settings
    set teacher_password_hash = ${await hashSecret(next.trim())}, password_changed = true, updated_at = now()
    where id = 1
  `;
	return { ok: true };
}
async function loginStudent(studentId, pin) {
	await ensureSeeded();
	const row = (await (await getSql())`
    select id, pin_hash from students where id = ${studentId}
  `)[0];
	if (!row || !await verifySecret(pin, row.pin_hash)) throw new Error("이름 또는 비밀번호가 올바르지 않아요.");
	const token = await createSession("student", row.id);
	const { payDueSalary } = await import("./salary.server-Ch6yjk45.mjs");
	await payDueSalary(row.id);
	return {
		token,
		session: await loadSession(token)
	};
}
//#endregion
export { unlockVaultWithFace as _, ensureSeeded as a, loadSession as c, loginTeacher as d, readToken as f, session_server_C3UH2SEm_exports as g, requireVaultOpen as h, destroySession as i, lockVault as l, requireTeacher as m, changeTeacherPassword as n, getSql as o, requireStudent as p, createServerRpc as r, hashSecret as s, __exportAll as t, loginStudent as u, unlockVaultWithPassword as v };
