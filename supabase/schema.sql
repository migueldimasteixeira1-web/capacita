create table if not exists roles (
  id text primary key,
  name text not null unique
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  registration_number text not null unique,
  cpf text not null unique,
  full_name text not null,
  email text not null,
  role_id text not null references roles(id),
  secretariat text not null,
  created_at timestamptz not null default now()
);

create table if not exists instructors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  full_name text not null,
  cpf text not null unique,
  email text not null,
  specialty text not null,
  created_at timestamptz not null default now()
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  modality text not null,
  status text not null,
  workload_hours integer not null,
  spots integer not null,
  enrollment_start timestamptz not null,
  enrollment_end timestamptz not null,
  minimum_attendance_percent integer not null default 75,
  location text not null,
  display_date date not null,
  display_time_range text not null,
  owner_secretariat text not null,
  created_at timestamptz not null default now()
);

create table if not exists instructor_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  instructor_id uuid not null references instructors(id) on delete restrict,
  assignment_status text not null default 'ativa',
  assigned_at timestamptz not null default now(),
  unique (course_id, instructor_id)
);

create table if not exists course_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  label text not null,
  session_date date not null,
  start_time text not null,
  end_time text not null
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  course_id uuid not null references courses(id) on delete cascade,
  participant_id uuid not null references profiles(id) on delete cascade,
  status text not null,
  indeferimento_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  session_id uuid not null references course_sessions(id) on delete cascade,
  status text not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  manual_adjustment boolean not null default false
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references enrollments(id) on delete cascade,
  code text not null unique,
  issued_at timestamptz not null default now(),
  workload_hours_snapshot integer not null
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  course_id uuid references courses(id) on delete set null,
  instructor_id uuid references instructors(id) on delete set null,
  body text not null,
  generated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'nao_lida',
  created_at timestamptz not null default now()
);

alter table roles enable row level security;
alter table profiles enable row level security;
alter table instructors enable row level security;
alter table courses enable row level security;
alter table instructor_assignments enable row level security;
alter table course_sessions enable row level security;
alter table enrollments enable row level security;
alter table attendance_records enable row level security;
alter table certificates enable row level security;
alter table documents enable row level security;
alter table notifications enable row level security;

create policy "read roles" on roles for select using (true);
create policy "read profiles" on profiles for select using (true);
create policy "read instructors" on instructors for select using (true);
create policy "read courses" on courses for select using (true);
create policy "read assignments" on instructor_assignments for select using (true);
create policy "read sessions" on course_sessions for select using (true);
create policy "read enrollments" on enrollments for select using (true);
create policy "read attendance" on attendance_records for select using (true);
create policy "read certificates" on certificates for select using (true);
create policy "read documents" on documents for select using (true);
create policy "read notifications" on notifications for select using (true);
