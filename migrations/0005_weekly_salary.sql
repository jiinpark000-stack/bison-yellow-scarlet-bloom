-- 월급을 하루가 아니라 일주일 단위로 지급. 기존 하루 월급은 7배로 맞춤.
alter table settings add column if not exists weekly_salary_applied boolean not null default false;

update jobs
set salary = salary * 7
where (select coalesce(weekly_salary_applied, false) from settings where id = 1) = false;

update settings
set weekly_salary_applied = true
where id = 1 and weekly_salary_applied = false;
