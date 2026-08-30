-- ============================================================================
-- CAMPUS HUB — COMPLETE DATABASE SCHEMA & SECURITY POLICIES
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES / USERS TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('student', 'faculty', 'admin', 'parent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Helper security functions to avoid infinite RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_faculty_or_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'admin')
  );
$$;

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Admins can manage all profiles" on public.profiles
  for all using (public.is_admin());

-- 2. FACULTY TABLE
create table public.faculty (
  id uuid primary key references public.profiles(id) on delete cascade,
  faculty_id text not null unique,
  department text not null,
  designation text not null
);

alter table public.faculty enable row level security;

create policy "Faculty members can view their own details" on public.faculty
  for select using (auth.uid() = id);

create policy "Profiles can view faculty details" on public.faculty
  for select using (auth.role() = 'authenticated');

-- 3. STUDENTS TABLE
create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  student_id text not null unique,
  department text not null,
  year_section text not null,
  cgpa numeric(3,2) default 0.00
);

alter table public.students enable row level security;

create policy "Students can view their own details" on public.students
  for select using (auth.uid() = id);

create policy "Faculty can view student details" on public.students
  for select using (public.is_faculty_or_admin());

-- 4. COURSES TABLE
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name text not null,
  department text not null,
  credits integer not null,
  faculty_id uuid references public.faculty(id) on delete set null
);

alter table public.courses enable row level security;

create policy "Anyone authenticated can view courses" on public.courses
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- 5. ATTENDANCE TABLE
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.attendance enable row level security;

create policy "Students can view their own attendance" on public.attendance
  for select using (auth.uid() = student_id);

create policy "Faculty can manage attendance" on public.attendance
  for all using (public.is_faculty_or_admin());

-- 6. TIMETABLE TABLE
create table public.timetable (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time time not null,
  end_time time not null,
  classroom text not null
);

alter table public.timetable enable row level security;

create policy "Anyone authenticated can view timetable" on public.timetable
  for select using (auth.role() = 'authenticated');

-- 7. ASSIGNMENTS TABLE
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  due_date timestamp with time zone not null,
  max_marks integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Submissions Table
create table public.assignment_submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  file_url text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade_marks integer,
  feedback text,
  status text not null check (status in ('Pending', 'Submitted', 'Graded')) default 'Pending'
);

alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;

create policy "Authenticated users can view assignments" on public.assignments
  for select using (auth.role() = 'authenticated');

create policy "Faculty can manage assignments" on public.assignments
  for all using (public.is_faculty_or_admin());

create policy "Students can manage their own submissions" on public.assignment_submissions
  for all using (auth.uid() = student_id);

create policy "Faculty can manage all submissions" on public.assignment_submissions
  for all using (public.is_faculty_or_admin());

-- 8. EXAMS TABLE
create table public.exams (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  date date not null,
  time time not null,
  classroom text not null,
  max_marks integer not null
);

alter table public.exams enable row level security;

create policy "Authenticated users can view exams" on public.exams
  for select using (auth.role() = 'authenticated');

-- 9. RESULTS TABLE
create table public.results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  exam_title text not null,
  marks_obtained numeric(5,2) not null,
  grade text not null
);

alter table public.results enable row level security;

create policy "Students can view their own results" on public.results
  for select using (auth.uid() = student_id);

create policy "Faculty can manage results" on public.results
  for all using (public.is_faculty_or_admin());

-- 10. LIBRARY TABLE
create table public.library_books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  isbn text unique,
  total_copies integer not null,
  available_copies integer not null
);

create table public.library_borrows (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.library_books(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  borrow_date date default current_date not null,
  due_date date not null,
  return_date date,
  fine_amount numeric(6,2) default 0.00 not null
);

alter table public.library_books enable row level security;
alter table public.library_borrows enable row level security;

create policy "Anyone authenticated can view books" on public.library_books
  for select using (auth.role() = 'authenticated');

create policy "Students can view their borrows" on public.library_borrows
  for select using (auth.uid() = student_id);

-- 11. FEES TABLE
create table public.fees (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  title text not null,
  amount numeric(8,2) not null,
  due_date date not null,
  status text not null check (status in ('Paid', 'Unpaid', 'Overdue')) default 'Unpaid'
);

alter table public.fees enable row level security;

create policy "Students can view their own fees" on public.fees
  for select using (auth.uid() = student_id);

create policy "Admins can manage fees" on public.fees
  for all using (public.is_admin());

-- 12. PLACEMENTS TABLE
create table public.placement_jobs (
  id uuid default gen_random_uuid() primary key,
  company text not null,
  role text not null,
  package text not null,
  cutoff_cgpa numeric(3,2) not null,
  deadline timestamp with time zone not null
);

create table public.placement_applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.placement_jobs(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('Applied', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected')) default 'Applied'
);

alter table public.placement_jobs enable row level security;
alter table public.placement_applications enable row level security;

create policy "Anyone authenticated can view placement jobs" on public.placement_jobs
  for select using (auth.role() = 'authenticated');

create policy "Students can manage their own placement applications" on public.placement_applications
  for all using (auth.uid() = student_id);

-- 13. HOSTEL TABLE
create table public.hostel_rooms (
  id uuid default gen_random_uuid() primary key,
  block_name text not null,
  room_number text not null,
  capacity integer not null,
  occupants_count integer default 0 not null
);

create table public.hostel_allocations (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references public.hostel_rooms(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade unique not null,
  allocated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hostel_rooms enable row level security;
alter table public.hostel_allocations enable row level security;

create policy "Authenticated users can view rooms" on public.hostel_rooms
  for select using (auth.role() = 'authenticated');

create policy "Students can view their allocations" on public.hostel_allocations
  for select using (auth.uid() = student_id);

-- 14. NOTIFICATIONS TABLE
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  unread boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view and manage their own notifications" on public.notifications
  for all using (auth.uid() = user_id);

-- ============================================================================
-- PROFILE CREATION TRIGGER FOR AUTHENTICATION
-- ============================================================================

-- Function to handle auto profile inserts when auth.users is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  
  -- If the role is student, insert into students table
  if coalesce(new.raw_user_meta_data->>'role', 'student') = 'student' then
    insert into public.students (id, student_id, department, year_section, cgpa)
    values (
      new.id,
      'STU' || substring(new.id::text from 1 for 6),
      coalesce(new.raw_user_meta_data->>'department', 'Computer Science'),
      coalesce(new.raw_user_meta_data->>'year_section', '3rd Year Sec A'),
      8.45
    );
  -- If the role is faculty, insert into faculty table
  elsif coalesce(new.raw_user_meta_data->>'role', 'student') = 'faculty' then
    insert into public.faculty (id, faculty_id, department, designation)
    values (
      new.id,
      'FAC' || substring(new.id::text from 1 for 6),
      coalesce(new.raw_user_meta_data->>'department', 'Computer Science'),
      coalesce(new.raw_user_meta_data->>'designation', 'Assistant Professor')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute the function on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
