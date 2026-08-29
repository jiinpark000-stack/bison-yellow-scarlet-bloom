import { _ as weekStartKst, h as todayKst, u as num } from "./utils-gSYKWV4o.mjs";
import { o as getSql } from "./session.server-C3UH2SEm.mjs";
import { t as accrueTriggerTax } from "./tax.server-Z8B_vN0K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/salary.server-Ch6yjk45.js
async function payDueSalary(studentId) {
	const sql = await getSql();
	const today = todayKst();
	const weekStart = weekStartKst(today);
	const row = (await sql`
    select s.id, s.cash, s.last_salary_on, j.salary, j.name as job_name
    from students s
    left join jobs j on j.id = s.job_id
    where s.id = ${studentId}
  `)[0];
	if (!row) return null;
	const salary = num(row.salary);
	if (salary <= 0) return null;
	const lastOn = row.last_salary_on ? String(row.last_salary_on).slice(0, 10) : null;
	if (lastOn && lastOn >= weekStart) return null;
	if ((await sql`
    update students
    set cash = cash + ${salary}, last_salary_on = ${today}
    where id = ${studentId}
      and (last_salary_on is null or last_salary_on < ${weekStart})
    returning cash
  `).length === 0) return null;
	await sql`
    insert into ledger (student_id, kind, amount, memo)
    values (${studentId}, 'salary', ${salary}, ${`${row.job_name ?? "직업"} 일주일 월급`})
  `;
	await accrueTriggerTax(studentId, "income", salary);
	return { paid: salary };
}
async function payAllDueSalaries() {
	const ids = await (await getSql())`select id from students`;
	let count = 0;
	for (const row of ids) if (await payDueSalary(row.id)) count += 1;
	return count;
}
//#endregion
export { payAllDueSalaries, payDueSalary };
