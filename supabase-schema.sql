-- =============================================
-- KOOsca 관리형 독서실 Supabase 스키마
-- =============================================

-- 1. profiles 테이블 (auth.users 확장)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'student', 'parent')),
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. students 테이블
create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  grade text,
  seat_number integer,
  status text not null default 'away' check (status in ('study', 'outing', 'sleep', 'away')),
  parent_id uuid references public.profiles(id),
  memo text,
  created_at timestamptz default now()
);

alter table public.students enable row level security;

create policy "Admins can manage students"
  on public.students for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Students can view own record"
  on public.students for select
  using (profile_id = auth.uid());

create policy "Parents can view child record"
  on public.students for select
  using (parent_id = auth.uid());

-- 3. study_sessions 테이블
create table if not exists public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  total_seconds integer not null default 0,
  created_at timestamptz default now()
);

alter table public.study_sessions enable row level security;

create policy "Students can manage own sessions"
  on public.study_sessions for all
  using (
    exists (
      select 1 from public.students
      where id = student_id and profile_id = auth.uid()
    )
  );

create policy "Admins can view all sessions"
  on public.study_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. daily_plans 테이블
create table if not exists public.daily_plans (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  date date not null default current_date,
  tasks jsonb not null default '[]',
  reflection text default '',
  created_at timestamptz default now(),
  unique(student_id, date)
);

alter table public.daily_plans enable row level security;

create policy "Students can manage own plans"
  on public.daily_plans for all
  using (
    exists (
      select 1 from public.students
      where id = student_id and profile_id = auth.uid()
    )
  );

create policy "Admins can view all plans"
  on public.daily_plans for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. notices 테이블
create table if not exists public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id),
  pinned boolean default false,
  created_at timestamptz default now()
);

alter table public.notices enable row level security;

create policy "Anyone authenticated can view notices"
  on public.notices for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage notices"
  on public.notices for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. reports 테이블
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  date date not null default current_date,
  study_seconds integer not null default 0,
  completed_tasks integer not null default 0,
  total_tasks integer not null default 0,
  reflection text default '',
  teacher_comment text default '',
  sent boolean default false,
  created_at timestamptz default now(),
  unique(student_id, date)
);

alter table public.reports enable row level security;

create policy "Admins can manage reports"
  on public.reports for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Students can view own reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.students
      where id = student_id and profile_id = auth.uid()
    )
  );

create policy "Parents can view child reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.students
      where id = student_id and parent_id = auth.uid()
    )
  );

-- 7. caretalk_messages 테이블
create table if not exists public.caretalk_messages (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  sender_role text not null check (sender_role in ('admin', 'parent')),
  text text not null,
  created_at timestamptz default now()
);

alter table public.caretalk_messages enable row level security;

create policy "Admins can manage caretalk"
  on public.caretalk_messages for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Parents can view and send caretalk for their child"
  on public.caretalk_messages for all
  using (
    exists (
      select 1 from public.students
      where id = student_id and parent_id = auth.uid()
    )
  );

-- 8. 자동 프로필 생성 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
