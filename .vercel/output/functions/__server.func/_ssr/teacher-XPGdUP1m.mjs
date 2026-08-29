import { t as createServerFn } from "./ssr.mjs";
import { u as num } from "./utils-gSYKWV4o.mjs";
import { r as STARTING_CASH } from "./types-CAoddweu.mjs";
import { h as requireVaultOpen, m as requireTeacher, o as getSql, r as createServerRpc, s as hashSecret } from "./session.server-C3UH2SEm.mjs";
import { i as listVaultLedger, r as hasVaultFace } from "./vault.server-BhJ7xgqC.mjs";
import { a as listEventsDetailed } from "./events.server-mPenqCdf.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { r as getQuotes } from "./quotes.server-CMVaAMI-.mjs";
import { a as listTaxKinds, i as getTaxVault, n as assessKind, r as collectFromStudent, s as reverseTriggerTax } from "./tax.server-Z8B_vN0K.mjs";
import { payAllDueSalaries } from "./salary.server-Ch6yjk45.mjs";
import { a as payAllDueInterest, n as getSavingsRate, r as listDonors, s as setSavingsRate } from "./donate.server-BNSshI-V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teacher-XPGdUP1m.js
var tokenSchema = object({ token: string().optional() });
async function listJobs() {
	return (await (await getSql())`select id, name, salary, sort_order from jobs order by sort_order, id`).map((r) => ({
		id: r.id,
		name: r.name,
		salary: num(r.salary),
		sortOrder: r.sort_order
	}));
}
var teacherOverviewFn_createServerFn_handler = createServerRpc({
	id: "9671f83f1f2d17f7e6d90431f92e2ccee5f6b257c171c5062ab8ee8f3c460ab3",
	name: "teacherOverviewFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => teacherOverviewFn.__executeServer(opts));
var teacherOverviewFn = createServerFn({ method: "GET" }).validator((d) => tokenSchema.parse(d ?? {})).handler(teacherOverviewFn_createServerFn_handler, async ({ data }) => {
	const session = await requireTeacher(data.token);
	const sql = await getSql();
	const [jobs, students, holdings, billRows, donors, products, orderRows, events, taxKinds, taxVault, savingsRate, vaultLedger, vaultFaceRegistered] = await Promise.all([
		listJobs(),
		sql`
        select s.id, s.name, s.job_id, s.cash, s.savings, s.last_salary_on, s.last_interest_on,
               s.tax_due, j.name as job_name, j.salary
        from students s
        left join jobs j on j.id = s.job_id
        order by s.name
      `,
		sql`
        select student_id, symbol, qty, avg_cost from holdings
      `,
		sql`
        select student_id, kind_name, sum(amount - paid) as due
        from tax_bills
        where amount > paid
        group by student_id, kind_name
      `,
		listDonors(),
		sql`select id, name, price, description, is_active, sort_order from products order by sort_order, id`,
		sql`
        select o.id, o.student_id, s.name as student_name, o.product_id, o.product_name,
               o.qty, o.unit_price, o.status, o.created_at::text as created_at
        from orders o
        join students s on s.id = o.student_id
        order by case when o.status = 'waiting' then 0 else 1 end, o.id desc
        limit 80
      `,
		listEventsDetailed(),
		listTaxKinds(),
		getTaxVault(),
		getSavingsRate(),
		listVaultLedger(24),
		hasVaultFace()
	]);
	const symbols = [...new Set(holdings.map((h) => h.symbol))];
	const quotes = symbols.length ? await getQuotes(symbols) : [];
	const qmap = new Map(quotes.map((q) => [q.symbol, q]));
	const valueByStudent = /* @__PURE__ */ new Map();
	for (const h of holdings) {
		const price = qmap.get(h.symbol)?.gamePrice ?? num(h.avg_cost);
		valueByStudent.set(h.student_id, (valueByStudent.get(h.student_id) ?? 0) + price * h.qty);
	}
	const partsByStudent = /* @__PURE__ */ new Map();
	for (const r of billRows) {
		const list = partsByStudent.get(r.student_id) ?? [];
		list.push({
			name: r.kind_name,
			due: num(r.due)
		});
		partsByStudent.set(r.student_id, list);
	}
	const donatedByStudent = new Map(donors.map((d) => [d.studentId, d.donated]));
	const studentRows = students.map((s) => {
		const cash = num(s.cash);
		const savings = num(s.savings);
		const holdingsValue = valueByStudent.get(s.id) ?? 0;
		return {
			id: s.id,
			name: s.name,
			jobName: s.job_name,
			jobId: s.job_id,
			salary: num(s.salary),
			cash,
			savings,
			lastSalaryOn: s.last_salary_on,
			lastInterestOn: s.last_interest_on,
			taxDue: num(s.tax_due),
			holdingsValue,
			total: cash + savings + holdingsValue,
			donated: donatedByStudent.get(s.id) ?? 0,
			taxParts: partsByStudent.get(s.id) ?? []
		};
	});
	const productRows = products.map((p) => ({
		id: p.id,
		name: p.name,
		price: num(p.price),
		description: p.description,
		isActive: p.is_active,
		sortOrder: p.sort_order
	}));
	const orders = orderRows.map((o) => ({
		id: o.id,
		studentId: o.student_id,
		studentName: o.student_name,
		productId: o.product_id,
		productName: o.product_name,
		qty: o.qty,
		unitPrice: num(o.unit_price),
		total: num(o.unit_price) * o.qty,
		status: o.status,
		createdAt: o.created_at
	}));
	return {
		className: session.className,
		passwordChanged: session.passwordChanged,
		vaultUnlocked: session.vaultUnlocked,
		jobs,
		students: studentRows,
		products: productRows,
		orders,
		events,
		openEventCount: events.filter((e) => e.status === "open").length,
		taxKinds,
		taxVault,
		savingsRate,
		donors,
		vaultLedger,
		vaultFaceRegistered
	};
});
var addStudentFn_createServerFn_handler = createServerRpc({
	id: "a2081b535932ff1e355f1a81c8b419896ac54ca41a14836cec7fd3010c5e55e3",
	name: "addStudentFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => addStudentFn.__executeServer(opts));
var addStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	name: string().min(1).max(20),
	pin: string().regex(/^\d{4}$/, "비밀번호는 숫자 4자리예요."),
	jobId: number().int().nullable().optional()
}).parse(d)).handler(addStudentFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	const name = data.name.trim();
	if ((await sql`select id from students where name = ${name}`).length) throw new Error("이미 같은 이름이 있어요.");
	const pinHash = await hashSecret(data.pin);
	let jobId = data.jobId ?? null;
	if (jobId == null) jobId = (await sql`select id from jobs where name = '학생' limit 1`)[0]?.id ?? null;
	await sql`
      insert into students (name, pin_hash, job_id, cash)
      values (${name}, ${pinHash}, ${jobId}, ${STARTING_CASH})
    `;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      select id, 'adjust', ${STARTING_CASH}, '시작 용돈'
      from students where name = ${name}
    `;
	return { ok: true };
});
var addStudentsBulkFn_createServerFn_handler = createServerRpc({
	id: "d65d1122ca75101a408751eeb22c58817fd805890e8981454f8f1678c77f3919",
	name: "addStudentsBulkFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => addStudentsBulkFn.__executeServer(opts));
var addStudentsBulkFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	rows: array(object({
		name: string().min(1).max(20),
		pin: string().regex(/^\d{4}$/)
	}))
}).parse(d)).handler(addStudentsBulkFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	const jobId = (await sql`select id from jobs where name = '학생' limit 1`)[0]?.id ?? null;
	let added = 0;
	for (const row of data.rows) {
		const name = row.name.trim();
		if (!name) continue;
		if ((await sql`select id from students where name = ${name}`).length) continue;
		await sql`
        insert into students (name, pin_hash, job_id, cash)
        values (${name}, ${await hashSecret(row.pin)}, ${jobId}, ${STARTING_CASH})
      `;
		await sql`
        insert into ledger (student_id, kind, amount, memo)
        select id, 'adjust', ${STARTING_CASH}, '시작 용돈'
        from students where name = ${name}
      `;
		added += 1;
	}
	return { added };
});
var updateStudentFn_createServerFn_handler = createServerRpc({
	id: "451cf54df15b408ebea43a3c3400e2a57b30baeff9061683c6f2a904c5bbc8a6",
	name: "updateStudentFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => updateStudentFn.__executeServer(opts));
var updateStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int(),
	name: string().min(1).max(20).optional(),
	pin: string().regex(/^\d{4}$/).optional(),
	jobId: number().int().nullable().optional()
}).parse(d)).handler(updateStudentFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	if (data.name) await sql`update students set name = ${data.name.trim()} where id = ${data.studentId}`;
	if (data.pin) await sql`update students set pin_hash = ${await hashSecret(data.pin)} where id = ${data.studentId}`;
	if (data.jobId !== void 0) await sql`update students set job_id = ${data.jobId} where id = ${data.studentId}`;
	return { ok: true };
});
var adjustCashFn_createServerFn_handler = createServerRpc({
	id: "7af0b6cc563f7fa81a0bfe3f2bff2d7b0dceba10df51ae6e9ae88ec8fe033b71",
	name: "adjustCashFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => adjustCashFn.__executeServer(opts));
var adjustCashFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int(),
	amount: number(),
	memo: string().max(40).optional()
}).parse(d)).handler(adjustCashFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	if (data.amount === 0) throw new Error("금액을 입력해 주세요.");
	const sql = await getSql();
	const rows = await sql`select cash from students where id = ${data.studentId}`;
	if (!rows[0]) throw new Error("학생을 찾을 수 없어요.");
	const next = num(rows[0].cash) + data.amount;
	if (next < 0) throw new Error("잔액보다 많이 뺄 수 없어요.");
	await sql`update students set cash = ${next} where id = ${data.studentId}`;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${data.studentId},
        'adjust',
        ${data.amount},
        ${data.memo?.trim() || (data.amount > 0 ? "선생님 지급" : "선생님 회수")}
      )
    `;
	return { ok: true };
});
var removeStudentFn_createServerFn_handler = createServerRpc({
	id: "3d74a56617e5b57d563de4272cddb6b5a8d0b3c640f1e19f150fb68cae98cbd7",
	name: "removeStudentFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => removeStudentFn.__executeServer(opts));
var removeStudentFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int()
}).parse(d)).handler(removeStudentFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`delete from students where id = ${data.studentId}`;
	return { ok: true };
});
var upsertJobFn_createServerFn_handler = createServerRpc({
	id: "0a6010a392f9761f7edd7cdd13d220e93ff0310ba5df86234ca354465a4eb8e9",
	name: "upsertJobFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => upsertJobFn.__executeServer(opts));
var upsertJobFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	salary: number().min(0)
}).parse(d)).handler(upsertJobFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	if (data.id) await sql`
        update jobs set name = ${data.name.trim()}, salary = ${data.salary}
        where id = ${data.id}
      `;
	else {
		const max = await sql`select coalesce(max(sort_order), 0)::int as n from jobs`;
		await sql`
        insert into jobs (name, salary, sort_order)
        values (${data.name.trim()}, ${data.salary}, ${(max[0]?.n ?? 0) + 1})
      `;
	}
	return { ok: true };
});
var deleteJobFn_createServerFn_handler = createServerRpc({
	id: "8ce164d8174dac95b4b2c6b179eb2a2d0f680a37abe02654546a82d7af8b2c75",
	name: "deleteJobFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => deleteJobFn.__executeServer(opts));
var deleteJobFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(deleteJobFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`delete from jobs where id = ${data.id}`;
	return { ok: true };
});
var upsertProductFn_createServerFn_handler = createServerRpc({
	id: "80e2e7b9c610a12d3bb9340ffaf690a6adaa9df5e2f63f9d3c2bd50fe27aaa04",
	name: "upsertProductFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => upsertProductFn.__executeServer(opts));
var upsertProductFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	price: number().positive(),
	description: string().max(80).optional(),
	isActive: boolean().optional()
}).parse(d)).handler(upsertProductFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	if (data.id) await sql`
        update products
        set name = ${data.name.trim()},
            price = ${data.price},
            description = ${data.description?.trim() ?? ""},
            is_active = ${data.isActive ?? true}
        where id = ${data.id}
      `;
	else {
		const max = await sql`select coalesce(max(sort_order), 0)::int as n from products`;
		await sql`
        insert into products (name, price, description, is_active, sort_order)
        values (
          ${data.name.trim()},
          ${data.price},
          ${data.description?.trim() ?? ""},
          ${data.isActive ?? true},
          ${(max[0]?.n ?? 0) + 1}
        )
      `;
	}
	return { ok: true };
});
var deleteProductFn_createServerFn_handler = createServerRpc({
	id: "7e9b54c439859b123f90087a755ff95574a83a0145be6cd389992a40945b575d",
	name: "deleteProductFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => deleteProductFn.__executeServer(opts));
var deleteProductFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(deleteProductFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`update products set is_active = false where id = ${data.id}`;
	return { ok: true };
});
var fulfillOrderFn_createServerFn_handler = createServerRpc({
	id: "e7b95a73ebe3f2050ec645f089b06eaa9a597574ee7bdc536e2aa48ce96fb100",
	name: "fulfillOrderFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => fulfillOrderFn.__executeServer(opts));
var fulfillOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	orderId: number().int()
}).parse(d)).handler(fulfillOrderFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`
      update orders set status = 'done', fulfilled_at = now()
      where id = ${data.orderId} and status = 'waiting'
    `;
	return { ok: true };
});
var refundOrderFn_createServerFn_handler = createServerRpc({
	id: "ceab3905aac7698b28ee3f339d0b07909e6bda77dfe03f98cf75ca0b932ae686",
	name: "refundOrderFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => refundOrderFn.__executeServer(opts));
var refundOrderFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	orderId: number().int()
}).parse(d)).handler(refundOrderFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	const sql = await getSql();
	const order = (await sql`
        select student_id, qty, unit_price, product_name, status
        from orders where id = ${data.orderId}
      `)[0];
	if (!order) throw new Error("주문을 찾을 수 없어요.");
	if (order.status !== "waiting") throw new Error("대기 중인 주문만 취소할 수 있어요.");
	const total = num(order.unit_price) * order.qty;
	await sql`update orders set status = 'refunded' where id = ${data.orderId}`;
	await sql`update students set cash = cash + ${total} where id = ${order.student_id}`;
	await sql`
      insert into ledger (student_id, kind, amount, memo)
      values (
        ${order.student_id},
        'adjust',
        ${total},
        ${`${order.product_name} 주문 취소 환불`}
      )
    `;
	await reverseTriggerTax(order.student_id, "snack", total);
	return { ok: true };
});
var paySalariesFn_createServerFn_handler = createServerRpc({
	id: "89ca50a2b7430c095c087370e52019725b8da11428402c69b668a3639e6d9291",
	name: "paySalariesFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => paySalariesFn.__executeServer(opts));
var paySalariesFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(paySalariesFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return { count: await payAllDueSalaries() };
});
var setSavingsRateFn_createServerFn_handler = createServerRpc({
	id: "e8f4f4d1a1520607dc44a7b79f52f0885705196371259406f2b0c6e1f3118c14",
	name: "setSavingsRateFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => setSavingsRateFn.__executeServer(opts));
var setSavingsRateFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	rate: number().min(0).max(100)
}).parse(d)).handler(setSavingsRateFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return { rate: await setSavingsRate(data.rate) };
});
var payInterestFn_createServerFn_handler = createServerRpc({
	id: "f1d5894739c1d47094a84e3d73636ca2579a183848aa639a4760d1d4410bc96e",
	name: "payInterestFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => payInterestFn.__executeServer(opts));
var payInterestFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(payInterestFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return payAllDueInterest();
});
var renameClassFn_createServerFn_handler = createServerRpc({
	id: "960be6621bc5e281fc4da338a5d5ab4f05cbf719fbbd3318b67fd850cdb708ec",
	name: "renameClassFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => renameClassFn.__executeServer(opts));
var renameClassFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	className: string().min(1).max(30)
}).parse(d)).handler(renameClassFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`
      update settings set class_name = ${data.className.trim()}, updated_at = now()
      where id = 1
    `;
	return { ok: true };
});
var upsertTaxKindFn_createServerFn_handler = createServerRpc({
	id: "3fb6b8d0ac59130d973f6bd38764f37f1926de9a5b4b750c38f5f83b3d093f91",
	name: "upsertTaxKindFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => upsertTaxKindFn.__executeServer(opts));
var upsertTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int().optional(),
	name: string().min(1).max(20),
	appliesOn: _enum([
		"income",
		"gain",
		"snack",
		"manual"
	]),
	charge: _enum(["percent", "fixed"]),
	value: number().min(0).max(1e6),
	isActive: boolean().optional()
}).parse(d)).handler(upsertTaxKindFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	if (data.charge === "percent" && data.value > 100) throw new Error("세율은 100%까지예요.");
	const sql = await getSql();
	const name = data.name.trim();
	if (!name) throw new Error("세금 이름을 적어 주세요.");
	if ((data.id ? await sql`select id from tax_kinds where name = ${name} and id <> ${data.id}` : await sql`select id from tax_kinds where name = ${name}`).length) throw new Error("이미 같은 이름이에요.");
	const rate = data.charge === "percent" ? data.value : 0;
	const amount = data.charge === "fixed" ? data.value : 0;
	if (data.id) await sql`
        update tax_kinds
        set name = ${name},
            applies_on = ${data.appliesOn},
            charge = ${data.charge},
            rate = ${rate},
            amount = ${amount},
            is_active = ${data.isActive ?? true}
        where id = ${data.id}
      `;
	else {
		const max = await sql`select coalesce(max(sort_order), 0) as n from tax_kinds`;
		const sort = num(max[0]?.n) + 1;
		await sql`
        insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
        values (${name}, ${data.appliesOn}, ${data.charge}, ${rate}, ${amount}, true, ${sort})
      `;
	}
	return { ok: true };
});
var deleteTaxKindFn_createServerFn_handler = createServerRpc({
	id: "9a496429b00f0b7e9d8188fb8dff6623621f8c381cc8c8e19f669deffad06268",
	name: "deleteTaxKindFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => deleteTaxKindFn.__executeServer(opts));
var deleteTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	id: number().int()
}).parse(d)).handler(deleteTaxKindFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	await (await getSql())`delete from tax_kinds where id = ${data.id}`;
	return { ok: true };
});
var assessTaxKindFn_createServerFn_handler = createServerRpc({
	id: "74360896bcb93518edd305fc4ccdca76033a8f222de6d0d20cedcb20a70a3a86",
	name: "assessTaxKindFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => assessTaxKindFn.__executeServer(opts));
var assessTaxKindFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	kindId: number().int(),
	studentId: number().int().optional()
}).parse(d)).handler(assessTaxKindFn_createServerFn_handler, async ({ data }) => {
	await requireTeacher(data.token);
	return assessKind(data.kindId, data.studentId);
});
var collectTaxFn_createServerFn_handler = createServerRpc({
	id: "17065cd4fa3faf9633d4005330a5c82164f6488cb9934293b3ecef19cdfd4af0",
	name: "collectTaxFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => collectTaxFn.__executeServer(opts));
var collectTaxFn = createServerFn({ method: "POST" }).validator((d) => object({
	token: string().optional(),
	studentId: number().int()
}).parse(d)).handler(collectTaxFn_createServerFn_handler, async ({ data }) => {
	await requireVaultOpen(data.token);
	return collectFromStudent(data.studentId);
});
var collectAllTaxFn_createServerFn_handler = createServerRpc({
	id: "95e17987211c57069e1e427597361959adfc1af1dba80da9f44e181a1b39adf1",
	name: "collectAllTaxFn",
	filename: "src/lib/fn/teacher.ts"
}, (opts) => collectAllTaxFn.__executeServer(opts));
var collectAllTaxFn = createServerFn({ method: "POST" }).validator((d) => tokenSchema.parse(d ?? {})).handler(collectAllTaxFn_createServerFn_handler, async ({ data }) => {
	await requireVaultOpen(data.token);
	const ids = await (await getSql())`select id from students where tax_due > 0`;
	let paid = 0;
	let count = 0;
	for (const row of ids) try {
		const result = await collectFromStudent(row.id);
		if (result.paid > 0) {
			paid += result.paid;
			count += 1;
		}
	} catch {
		continue;
	}
	return {
		paid,
		count
	};
});
//#endregion
export { addStudentFn_createServerFn_handler, addStudentsBulkFn_createServerFn_handler, adjustCashFn_createServerFn_handler, assessTaxKindFn_createServerFn_handler, collectAllTaxFn_createServerFn_handler, collectTaxFn_createServerFn_handler, deleteJobFn_createServerFn_handler, deleteProductFn_createServerFn_handler, deleteTaxKindFn_createServerFn_handler, fulfillOrderFn_createServerFn_handler, payInterestFn_createServerFn_handler, paySalariesFn_createServerFn_handler, refundOrderFn_createServerFn_handler, removeStudentFn_createServerFn_handler, renameClassFn_createServerFn_handler, setSavingsRateFn_createServerFn_handler, teacherOverviewFn_createServerFn_handler, updateStudentFn_createServerFn_handler, upsertJobFn_createServerFn_handler, upsertProductFn_createServerFn_handler, upsertTaxKindFn_createServerFn_handler };
