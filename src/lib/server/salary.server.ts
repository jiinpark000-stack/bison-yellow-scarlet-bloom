import { getSql } from "@/lib/db";
import { accrueTriggerTax } from "@/lib/server/tax.server";
import { num, todayKst, weekStartKst } from "@/lib/utils";

export async function payDueSalary(studentId: number): Promise<{ paid: number } | null> {
  const sql = await getSql();
  const today = todayKst();
  const weekStart = weekStartKst(today);
  const rows = await sql<{
    id: number;
    cash: unknown;
    last_salary_on: string | null;
    salary: unknown;
    job_name: string | null;
  }>`
    select s.id, s.cash, s.last_salary_on, j.salary, j.name as job_name
    from students s
    left join jobs j on j.id = s.job_id
    where s.id = ${studentId}
  `;
  const row = rows[0];
  if (!row) return null;
  const salary = num(row.salary);
  if (salary <= 0) return null;
  const lastOn = row.last_salary_on ? String(row.last_salary_on).slice(0, 10) : null;
  if (lastOn && lastOn >= weekStart) return null;
  const updated = await sql<{ cash: unknown }>`
    update students
    set cash = cash + ${salary}, last_salary_on = ${today}
    where id = ${studentId}
      and (last_salary_on is null or last_salary_on < ${weekStart})
    returning cash
  `;
  if (updated.length === 0) return null;
  await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${studentId}, 'salary', ${salary}, ${`${row.job_name ?? "직업"} 일주일 월급`})
  `;
  await accrueTriggerTax(studentId, "income", salary);
  return { paid: salary };
}

export async function payAllDueSalaries(): Promise<number> {
  const sql = await getSql();
  const ids = await sql<{ id: number }>`select id from students`;
  let count = 0;
  for (const row of ids) {
    const result = await payDueSalary(row.id);
    if (result) count += 1;
  }
  return count;
}
