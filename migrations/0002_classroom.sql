-- 6학년 5반 모이뱅크 — classroom finance play
create table if not exists settings (
  id integer primary key check (id = 1),
  class_name text not null default '6학년 5반',
  teacher_password_hash text not null,
  password_changed boolean not null default false,
  starting_cash numeric(14, 2) not null default 1000,
  price_scale integer not null default 1000,
  updated_at timestamptz not null default now()
);

create table if not exists jobs (
  id serial primary key,
  name text not null unique,
  salary numeric(14, 2) not null,
  sort_order integer not null default 0
);

create table if not exists students (
  id serial primary key,
  name text not null unique,
  pin_hash text not null,
  job_id integer references jobs (id) on delete set null,
  cash numeric(14, 2) not null default 1000,
  last_salary_on date,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  name text not null,
  price numeric(14, 2) not null,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists orders (
  id serial primary key,
  student_id integer not null references students (id) on delete cascade,
  product_id integer not null references products (id),
  product_name text not null,
  qty integer not null check (qty > 0),
  unit_price numeric(14, 2) not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  fulfilled_at timestamptz
);

create index if not exists orders_status_idx on orders (status, created_at desc);
create index if not exists orders_student_idx on orders (student_id, created_at desc);

create table if not exists holdings (
  student_id integer not null references students (id) on delete cascade,
  symbol text not null,
  name text not null,
  qty integer not null check (qty > 0),
  avg_cost numeric(14, 2) not null,
  primary key (student_id, symbol)
);

create table if not exists ledger (
  id serial primary key,
  student_id integer not null references students (id) on delete cascade,
  kind text not null,
  amount numeric(14, 2) not null,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists ledger_student_idx on ledger (student_id, created_at desc);

create table if not exists sessions (
  token text primary key,
  role text not null,
  student_id integer references students (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_expires_idx on sessions (expires_at);
