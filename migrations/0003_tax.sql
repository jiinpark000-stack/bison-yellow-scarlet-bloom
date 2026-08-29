-- 학급 세금: 세율, 학급 금고, 학생 미납
alter table settings add column if not exists income_tax_rate numeric(6, 2) not null default 10;
alter table settings add column if not exists gain_tax_rate numeric(6, 2) not null default 10;
alter table settings add column if not exists snack_tax_rate numeric(6, 2) not null default 0;
alter table settings add column if not exists tax_vault numeric(14, 2) not null default 0;

alter table students add column if not exists tax_due numeric(14, 2) not null default 0;
