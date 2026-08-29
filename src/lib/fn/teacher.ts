import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { hashSecret } from "@/lib/server/crypto.server";
import { getQuotes } from "@/lib/server/quotes.server";
import { payAllDueSalaries } from "@/lib/server/salary.server";
import { getSavingsRate, payAllDueInterest, setSavingsRate } from "@/lib/server/savings.server";
import { listDonors } from "@/lib/server/donate.server";
import { requireTeacher, requireVaultOpen } from "@/lib/server/session.server";
import { assessKind, collectFromStudent, getTaxVault, listTaxKinds, reverseTriggerTax } from "@/lib/server/tax.server";
import { listEventsDetailed } from "@/lib/server/events.server";
import { listVaultLedger, hasVaultFace, listFaces } from "@/lib/server/vault.server";
import { hasFingerprint, listFingerprints } from "@/lib/server/webauthn.server";
import { studentFaceCounts, studentPrintCounts } from "@/lib/server/student-bio.server";
import { STARTING_CASH } from "@/lib/types";
import { num } from "@/lib/utils";
import type { Job, Product, SnackOrder, StudentRow } from "@/lib/types";

const tokenSchema = z.object({ token: z.string().optional() });

async function listJobs(): Promise<Job[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    name: string;
    salary: unknown;
    sort_order: number;
  }>`select id, name, salary, sort_order from jobs order by sort_order, id`;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    salary: num(r.salary),
    sortOrder: r.sort_order,
  }));
}

export const teacherOverviewFn = createServerFn({ method: "GET" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const session = await requireTeacher(data.token);
    const sql = await getSql();
    const [
      jobs,
      students,
      holdings,
      billRows,
      donors,
      products,
      orderRows,
      events,
      taxKinds,
      taxVault,
      savingsRate,
      vaultLedger,
      vaultFaceRegistered,
      printReady,
      faces,
      prints,
      faceCounts,
      printCounts,
    ] = await Promise.all([
      listJobs(),
      sql<{
        id: number;
        name: string;
        job_id: number | null;
        cash: unknown;
        savings: unknown;
        last_salary_on: string | null;
        last_interest_on: string | null;
        tax_due: unknown;
        job_name: string | null;
        salary: unknown;
      }>`
        select s.id, s.name, s.job_id, s.cash, s.savings, s.last_salary_on, s.last_interest_on,
               s.tax_due, j.name as job_name, j.salary
        from students s
        left join jobs j on j.id = s.job_id
        order by s.name
      `,
      sql<{ student_id: number; symbol: string; qty: number; avg_cost: unknown }>`
        select student_id, symbol, qty, avg_cost from holdings
      `,
      sql<{ student_id: number; kind_name: string; due: unknown }>`
        select student_id, kind_name, sum(amount - paid) as due
        from tax_bills
        where amount > paid
        group by student_id, kind_name
      `,
      listDonors(),
      sql<{
        id: number;
        name: string;
        price: unknown;
        description: string;
        is_active: boolean;
        sort_order: number;
      }>`select id, name, price, description, is_active, sort_order from products order by sort_order, id`,
      sql<{
        id: number;
        student_id: number;
        student_name: string;
        product_id: number;
        product_name: string;
        qty: number;
        unit_price: unknown;
        status: string;
        created_at: string;
      }>`
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
      hasVaultFace(),
      hasFingerprint(),
      listFaces(),
      listFingerprints(),
      studentFaceCounts(),
      studentPrintCounts(),
    ]);
    const symbols = [...new Set(holdings.map((h) => h.symbol))];
    const quotes = symbols.length ? await getQuotes(symbols) : [];
    const qmap = new Map(quotes.map((q) => [q.symbol, q]));
    const valueByStudent = new Map<number, number>();
    for (const h of holdings) {
      const price = qmap.get(h.symbol)?.gamePrice ?? num(h.avg_cost);
      valueByStudent.set(h.student_id, (valueByStudent.get(h.student_id) ?? 0) + price * h.qty);
    }
    const partsByStudent = new Map<number, { name: string; due: number }[]>();
    for (const r of billRows) {
      const list = partsByStudent.get(r.student_id) ?? [];
      list.push({ name: r.kind_name, due: num(r.due) });
      partsByStudent.set(r.student_id, list);
    }
    const donatedByStudent = new Map(donors.map((d) => [d.studentId, d.donated]));
    const studentRows: StudentRow[] = students.map((s) => {
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
        taxParts: partsByStudent.get(s.id) ?? [],
        faceCount: faceCounts.get(s.id) ?? 0,
        printCount: printCounts.get(s.id) ?? 0,
      };
    });
    const productRows: Product[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: num(p.price),
      description: p.description,
      isActive: p.is_active,
      sortOrder: p.sort_order,
    }));
    const orders: SnackOrder[] = orderRows.map((o) => ({
      id: o.id,
      studentId: o.student_id,
      studentName: o.student_name,
      productId: o.product_id,
      productName: o.product_name,
      qty: o.qty,
      unitPrice: num(o.unit_price),
      total: num(o.unit_price) * o.qty,
      status: o.status as SnackOrder["status"],
      createdAt: o.created_at,
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
      vaultFaceRegistered,
      hasFingerprint: printReady,
      faces,
      prints,
    };
  });

export const addStudentFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        name: z.string().min(1).max(20),
        pin: z.string().regex(/^\d{4}$/, "비밀번호는 숫자 4자리예요."),
        jobId: z.number().int().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    const name = data.name.trim();
    const exists = await sql<{ id: number }>`select id from students where name = ${name}`;
    if (exists.length) throw new Error("이미 같은 이름이 있어요.");
    const pinHash = await hashSecret(data.pin);
    let jobId = data.jobId ?? null;
    if (jobId == null) {
      const fallback = await sql<{ id: number }>`select id from jobs where name = '학생' limit 1`;
      jobId = fallback[0]?.id ?? null;
    }
    await sql`
      insert into students (name, pin_hash, job_id, cash)
      values (${name}, ${pinHash}, ${jobId}, ${STARTING_CASH})
    `;
    await sql`
      insert into ledger (student_id, kind, amount, memo)
      select id, 'adjust', ${STARTING_CASH}, '시작 용돈'
      from students where name = ${name}
    `;
    return { ok: true as const };
  });

export const addStudentsBulkFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        rows: z.array(z.object({ name: z.string().min(1).max(20), pin: z.string().regex(/^\d{4}$/) })),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    const job = await sql<{ id: number }>`select id from jobs where name = '학생' limit 1`;
    const jobId = job[0]?.id ?? null;
    let added = 0;
    for (const row of data.rows) {
      const name = row.name.trim();
      if (!name) continue;
      const exists = await sql<{ id: number }>`select id from students where name = ${name}`;
      if (exists.length) continue;
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

export const updateStudentFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        studentId: z.number().int(),
        name: z.string().min(1).max(20).optional(),
        pin: z.string().regex(/^\d{4}$/).optional(),
        jobId: z.number().int().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    if (data.name) await sql`update students set name = ${data.name.trim()} where id = ${data.studentId}`;
    if (data.pin) await sql`update students set pin_hash = ${await hashSecret(data.pin)} where id = ${data.studentId}`;
    if (data.jobId !== undefined) {
      await sql`update students set job_id = ${data.jobId} where id = ${data.studentId}`;
    }
    return { ok: true as const };
  });

export const adjustCashFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        studentId: z.number().int(),
        amount: z.number(),
        memo: z.string().max(40).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    if (data.amount === 0) throw new Error("금액을 입력해 주세요.");
    const sql = await getSql();
    const rows = await sql<{ cash: unknown }>`select cash from students where id = ${data.studentId}`;
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
    return { ok: true as const };
  });

export const removeStudentFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), studentId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`delete from students where id = ${data.studentId}`;
    return { ok: true as const };
  });

export const upsertJobFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        id: z.number().int().optional(),
        name: z.string().min(1).max(20),
        salary: z.number().min(0),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    if (data.id) {
      await sql`
        update jobs set name = ${data.name.trim()}, salary = ${data.salary}
        where id = ${data.id}
      `;
    } else {
      const max = await sql<{ n: number }>`select coalesce(max(sort_order), 0)::int as n from jobs`;
      await sql`
        insert into jobs (name, salary, sort_order)
        values (${data.name.trim()}, ${data.salary}, ${(max[0]?.n ?? 0) + 1})
      `;
    }
    return { ok: true as const };
  });

export const deleteJobFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`delete from jobs where id = ${data.id}`;
    return { ok: true as const };
  });

export const upsertProductFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        id: z.number().int().optional(),
        name: z.string().min(1).max(20),
        price: z.number().positive(),
        description: z.string().max(80).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    if (data.id) {
      await sql`
        update products
        set name = ${data.name.trim()},
            price = ${data.price},
            description = ${data.description?.trim() ?? ""},
            is_active = ${data.isActive ?? true}
        where id = ${data.id}
      `;
    } else {
      const max = await sql<{ n: number }>`select coalesce(max(sort_order), 0)::int as n from products`;
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
    return { ok: true as const };
  });

export const deleteProductFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`update products set is_active = false where id = ${data.id}`;
    return { ok: true as const };
  });

export const fulfillOrderFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), orderId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`
      update orders set status = 'done', fulfilled_at = now()
      where id = ${data.orderId} and status = 'waiting'
    `;
    return { ok: true as const };
  });

export const refundOrderFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), orderId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    const order = (
      await sql<{
        student_id: number;
        qty: number;
        unit_price: unknown;
        product_name: string;
        status: string;
      }>`
        select student_id, qty, unit_price, product_name, status
        from orders where id = ${data.orderId}
      `
    )[0];
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
    return { ok: true as const };
  });

export const paySalariesFn = createServerFn({ method: "POST" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return { count: await payAllDueSalaries() };
  });

export const setSavingsRateFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), rate: z.number().min(0).max(100) }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return { rate: await setSavingsRate(data.rate) };
  });

export const payInterestFn = createServerFn({ method: "POST" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return payAllDueInterest();
  });

export const renameClassFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z.object({ token: z.string().optional(), className: z.string().min(1).max(30) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`
      update settings set class_name = ${data.className.trim()}, updated_at = now()
      where id = 1
    `;
    return { ok: true as const };
  });

export const upsertTaxKindFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        id: z.number().int().optional(),
        name: z.string().min(1).max(20),
        appliesOn: z.enum(["income", "gain", "snack", "manual"]),
        charge: z.enum(["percent", "fixed"]),
        value: z.number().min(0).max(1_000_000),
        isActive: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    if (data.charge === "percent" && data.value > 100) throw new Error("세율은 100%까지예요.");
    const sql = await getSql();
    const name = data.name.trim();
    if (!name) throw new Error("세금 이름을 적어 주세요.");
    const dup = data.id
      ? await sql<{ id: number }>`select id from tax_kinds where name = ${name} and id <> ${data.id}`
      : await sql<{ id: number }>`select id from tax_kinds where name = ${name}`;
    if (dup.length) throw new Error("이미 같은 이름이에요.");
    const rate = data.charge === "percent" ? data.value : 0;
    const amount = data.charge === "fixed" ? data.value : 0;
    if (data.id) {
      await sql`
        update tax_kinds
        set name = ${name},
            applies_on = ${data.appliesOn},
            charge = ${data.charge},
            rate = ${rate},
            amount = ${amount},
            is_active = ${data.isActive ?? true}
        where id = ${data.id}
      `;
    } else {
      const max = await sql<{ n: unknown }>`select coalesce(max(sort_order), 0) as n from tax_kinds`;
      const sort = num(max[0]?.n) + 1;
      await sql`
        insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
        values (${name}, ${data.appliesOn}, ${data.charge}, ${rate}, ${amount}, true, ${sort})
      `;
    }
    return { ok: true as const };
  });

export const deleteTaxKindFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), id: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    const sql = await getSql();
    await sql`delete from tax_kinds where id = ${data.id}`;
    return { ok: true as const };
  });

export const assessTaxKindFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        kindId: z.number().int(),
        studentId: z.number().int().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireTeacher(data.token);
    return assessKind(data.kindId, data.studentId);
  });

export const collectTaxFn = createServerFn({ method: "POST" })
  .validator((d) => z.object({ token: z.string().optional(), studentId: z.number().int() }).parse(d))
  .handler(async ({ data }) => {
    await requireVaultOpen(data.token);
    return collectFromStudent(data.studentId);
  });

export const collectAllTaxFn = createServerFn({ method: "POST" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    await requireVaultOpen(data.token);
    const sql = await getSql();
    const ids = await sql<{ id: number }>`select id from students where tax_due > 0`;
    let paid = 0;
    let count = 0;
    for (const row of ids) {
      try {
        const result = await collectFromStudent(row.id);
        if (result.paid > 0) {
          paid += result.paid;
          count += 1;
        }
      } catch {
        continue;
      }
    }
    return { paid, count };
  });
