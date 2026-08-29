-- 학급 저축: 학생 저축 잔액, 일주일 이자율 (선생님 조정)
alter table settings add column if not exists savings_rate numeric(6, 2) not null default 5;

alter table students add column if not exists savings numeric(14, 2) not null default 0;
alter table students add column if not exists last_interest_on date;
