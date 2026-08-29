import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { getQuotes } from "@/lib/server/quotes.server";
import { payDueSalary } from "@/lib/server/salary.server";
import { getSavingsRate, moveSavings, payDueInterest } from "@/lib/server/savings.server";
import { donate, listDonors } from "@/lib/server/donate.server";
import { requireStudent } from "@/lib/server/session.server";
import { transfer } from "@/lib/server/transfer.server";
import { countOpenEvents } from "@/lib/server/events.server";
import { collectFromStudent, listTaxKinds, listUnpaidBills } from "@/lib/server/tax.server";
import { listStudentFaces, listStudentPrints } from "@/lib/server/student-bio.server";
import { num } from "@/lib/utils";
import type { Holding, LedgerRow } from "@/lib/types";

const tokenSchema = z.object({ token: z.string().optional() });

export const getStudentHome = createServerFn({ method: "GET" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    await Promise.all([payDueSalary(session.student.id), payDueInterest(session.student.id)]);
    const sql = await getSql();
    const studentRows = await sql<{
      id: number;
      name: string;
      cash: unknown;
      savings: unknown;
      last_salary_on: string | null;
      last_interest_on: string | null;
      tax_due: unknown;
      job_name: string | null;
      salary: unknown;
    }>`
      select s.id, s.name, s.cash, s.savings, s.last_salary_on, s.last_interest_on,
             s.tax_due, j.name as job_name, j.salary
      from students s
      left join jobs j on j.id = s.job_id
      where s.id = ${session.student.id}
    `;
    const s = studentRows[0];
    if (!s) throw new Error("학생 정보를 찾을 수 없어요.");

    const [holdingRows, classmates, waiting, kinds, bills, openEventCount, savingsRate, donors, peers, faces, prints] =
      await Promise.all([
        sql<{ symbol: string; name: string; qty: number; avg_cost: unknown }>`
          select symbol, name, qty, avg_cost from holdings where student_id = ${s.id}
        `,
        sql<{
          id: number;
          cash: unknown;
          savings: unknown;
          symbol: string | null;
          qty: number | null;
          avg_cost: unknown;
        }>`
          select s.id, s.cash, s.savings, h.symbol, h.qty, h.avg_cost
          from students s
          left join holdings h on h.student_id = s.id
        `,
        sql<{ n: number }>`
          select count(*)::int as n from orders
          where student_id = ${s.id} and status = 'waiting'
        `,
        listTaxKinds(true),
        listUnpaidBills(s.id),
        countOpenEvents(),
        getSavingsRate(),
        listDonors(),
        sql<{ id: number; name: string }>`
          select id, name from students where id <> ${s.id} order by name
        `,
        listStudentFaces(s.id),
        listStudentPrints(s.id),
      ]);
    const allSymbols = [
      ...new Set(
        [...holdingRows.map((h) => h.symbol), ...classmates.map((r) => r.symbol)].filter(
          (x): x is string => Boolean(x),
        ),
      ),
    ];
    const quotes = allSymbols.length ? await getQuotes(allSymbols) : [];
    const qmap = new Map(quotes.map((q) => [q.symbol, q]));
    const holdings: Holding[] = holdingRows.map((h) => {
      const q = qmap.get(h.symbol);
      const gamePrice = q?.gamePrice ?? num(h.avg_cost);
      const avgCost = num(h.avg_cost);
      const value = gamePrice * h.qty;
      const pnl = (gamePrice - avgCost) * h.qty;
      const pnlPercent = avgCost > 0 ? ((gamePrice - avgCost) / avgCost) * 100 : 0;
      return {
        symbol: h.symbol,
        name: q?.name ?? h.name,
        qty: h.qty,
        avgCost,
        gamePrice,
        changePercent: q?.changePercent ?? 0,
        value,
        pnl,
        pnlPercent,
      };
    });
    const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const cash = num(s.cash);
    const savings = num(s.savings);
    const total = cash + savings + holdingsValue;

    const totals = new Map<number, number>();
    for (const row of classmates) {
      const current = totals.get(row.id) ?? num(row.cash) + num(row.savings);
      if (row.symbol && row.qty) {
        const price = qmap.get(row.symbol)?.gamePrice ?? num(row.avg_cost);
        totals.set(row.id, current + price * row.qty);
      } else if (!totals.has(row.id)) {
        totals.set(row.id, current);
      }
    }
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const rank = ranked.findIndex(([id]) => id === s.id) + 1;
    const myDonated = donors.find((d) => d.studentId === s.id)?.donated ?? 0;

    return {
      className: session.className,
      student: {
        id: s.id,
        name: s.name,
        jobName: s.job_name,
        salary: num(s.salary),
        cash,
        savings,
        lastSalaryOn: s.last_salary_on,
        lastInterestOn: s.last_interest_on,
        taxDue: num(s.tax_due),
      },
      holdings,
      holdingsValue,
      total,
      rank,
      classSize: ranked.length,
      waitingOrders: waiting[0]?.n ?? 0,
      taxKinds: kinds,
      taxBills: bills,
      openEventCount,
      savingsRate,
      donors,
      myDonated,
      classmates: peers,
      faces,
      prints,
    };
  });

export const getLedger = createServerFn({ method: "GET" })
  .validator((d) => tokenSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      kind: string;
      amount: unknown;
      memo: string;
      created_at: string;
    }>`
      select id, kind, amount, memo, created_at::text as created_at
      from ledger
      where student_id = ${session.student.id}
      order by id desc
      limit 40
    `;
    const items: LedgerRow[] = rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      amount: num(r.amount),
      memo: r.memo,
      createdAt: r.created_at,
    }));
    return items;
  });

export const payTaxFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        amount: z.number().positive().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return collectFromStudent(session.student.id, data.amount);
  });

export const moveSavingsFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        amount: z.number(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return moveSavings(session.student.id, data.amount);
  });

export const donateFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        amount: z.number().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return donate(session.student.id, data.amount);
  });

export const transferFn = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        token: z.string().optional(),
        toStudentId: z.number().int().positive(),
        amount: z.number().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const session = await requireStudent(data.token);
    return transfer(session.student.id, data.toStudentId, data.amount);
  });
