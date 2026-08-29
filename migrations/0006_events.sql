-- 학급 이벤트: 선생님이 등록·개최, 학생이 참가비 내고 참여
create table if not exists events (
  id serial primary key,
  name text not null,
  description text not null default '',
  fee numeric(14, 2) not null default 0,
  reward numeric(14, 2) not null default 0,
  status text not null default 'draft',
  event_on date,
  created_at timestamptz not null default now()
);

create table if not exists event_signups (
  event_id integer not null references events (id) on delete cascade,
  student_id integer not null references students (id) on delete cascade,
  paid numeric(14, 2) not null default 0,
  rewarded numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (event_id, student_id)
);

create index if not exists event_signups_student_idx on event_signups (student_id);
create index if not exists events_status_idx on events (status, id desc);
