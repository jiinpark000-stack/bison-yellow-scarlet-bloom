create table if not exists student_faces (
  id serial primary key,
  student_id integer not null references students (id) on delete cascade,
  label text not null default '',
  descriptor text not null,
  created_at timestamptz not null default now()
);
create index if not exists student_faces_student_idx on student_faces (student_id);

create table if not exists student_webauthn (
  id serial primary key,
  student_id integer not null references students (id) on delete cascade,
  cred_id text not null unique,
  label text not null default '',
  public_key text not null,
  counter integer not null default 0,
  transports text,
  created_at timestamptz not null default now()
);
create index if not exists student_webauthn_student_idx on student_webauthn (student_id);

alter table settings add column if not exists student_webauthn_challenge text;
