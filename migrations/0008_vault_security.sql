alter table settings add column if not exists teacher_fail_count integer not null default 0;
alter table settings add column if not exists teacher_locked_until timestamptz;

alter table students add column if not exists pin_fail_count integer not null default 0;
alter table students add column if not exists pin_locked_until timestamptz;

alter table sessions add column if not exists vault_until timestamptz;

create table if not exists vault_ledger (
  id serial primary key,
  kind text not null,
  amount numeric(14, 2) not null,
  memo text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists vault_ledger_id_idx on vault_ledger (id desc);
