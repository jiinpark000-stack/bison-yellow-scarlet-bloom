-- 선생님이 세금 종류(건강세, 환경세 등)를 직접 만들고 관리
create table if not exists tax_kinds (
  id serial primary key,
  name text not null unique,
  applies_on text not null,
  charge text not null,
  rate numeric(6, 2) not null default 0,
  amount numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists tax_bills (
  id serial primary key,
  student_id integer not null references students (id) on delete cascade,
  tax_kind_id integer references tax_kinds (id) on delete set null,
  kind_name text not null,
  amount numeric(14, 2) not null,
  paid numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tax_bills_student_idx on tax_bills (student_id, id);

insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
select '월급세', 'income', 'percent', coalesce((select income_tax_rate from settings where id = 1), 10), 0, true, 1
where not exists (select 1 from tax_kinds where name = '월급세');

insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
select '건강세', 'income', 'percent', 5, 0, true, 2
where not exists (select 1 from tax_kinds where name = '건강세');

insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
select '주식 양도세', 'gain', 'percent', coalesce((select gain_tax_rate from settings where id = 1), 10), 0, true, 3
where not exists (select 1 from tax_kinds where name = '주식 양도세');

insert into tax_kinds (name, applies_on, charge, rate, amount, is_active, sort_order)
select '간식세', 'snack', 'percent', coalesce((select snack_tax_rate from settings where id = 1), 0), 0, true, 4
where not exists (select 1 from tax_kinds where name = '간식세');
