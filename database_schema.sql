-- ============================================================================
-- CAMPUSONE / CAMPUS HUB - COMPLETE SUPABASE DATABASE SCHEMA (IDEMPOTENT & ORDER-SAFE)
-- Enterprise Higher Education ERP & Multi-Portal Management Architecture
-- Supports: Student, Faculty, and Admin Portals with Full RLS & Auth Triggers
-- ============================================================================

-- ============================================================================
-- 0. EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. CORE IDENTITY & USER DIRECTORY TABLES
-- ============================================================================

-- 1.1 Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('student', 'faculty', 'admin')),
  avatar_url text,
  phone text,
  gender text check (gender in ('Male', 'Female', 'Other')),
  date_of_birth date,
  blood_group text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.2 Academic Departments Table
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. 'CSE', 'ECE', 'MECH', 'IT', 'AI&DS'
  name text not null,
  head_of_department text,
  building text,
  contact_email text,
  total_students integer default 0,
  total_faculty integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.3 Students Table
create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  student_id text not null unique default ('STU' || upper(substring(gen_random_uuid()::text from 1 for 6))), -- e.g. 'STU2026A1'
  department text not null,
  department_id uuid references public.departments(id) on delete set null,
  batch text not null default '2022-2026',
  semester integer not null default 1,
  year_section text not null default '1st Year',
  cgpa numeric(4,2) default 0.00 check (cgpa >= 0.00 and cgpa <= 10.00),
  credits_earned integer default 0,
  admission_date date default current_date,
  academic_status text not null check (academic_status in ('Active', 'Graduated', 'Suspended', 'On Leave')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.4 Faculty Table
create table if not exists public.faculty (
  id uuid primary key references public.profiles(id) on delete cascade,
  faculty_id text not null unique default ('FAC' || upper(substring(gen_random_uuid()::text from 1 for 6))), -- e.g. 'FAC-CSE-104'
  department text not null,
  department_id uuid references public.departments(id) on delete set null,
  designation text not null default 'Assistant Professor',
  qualification text,
  specialization text,
  office_room text,
  joining_date date default current_date,
  status text not null check (status in ('Active', 'On Leave', 'Retired')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.5 Institutional Administrators Table
create table if not exists public.admins (
  id uuid primary key references public.profiles(id) on delete cascade,
  admin_id text not null unique default ('ADM' || upper(substring(gen_random_uuid()::text from 1 for 6))),
  designation text not null default 'Administrator',
  office_location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 2. ACADEMIC & CURRICULUM MANAGEMENT TABLES
-- ============================================================================

-- 2.1 Courses Table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique, -- e.g. 'CS801'
  name text not null,
  department text not null,
  department_id uuid references public.departments(id) on delete set null,
  semester integer not null default 1,
  credits integer not null check (credits > 0),
  course_type text not null check (course_type in ('Core', 'Elective', 'Lab', 'Seminar', 'Project')) default 'Core',
  faculty_id uuid references public.faculty(id) on delete set null,
  syllabus text,
  academic_year text not null default '2026-2027',
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.2 Student Course Enrollments
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  semester integer not null,
  academic_year text not null default '2026-2027',
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('Enrolled', 'Completed', 'Dropped', 'Withdrawn')) default 'Enrolled',
  unique (student_id, course_id, semester, academic_year)
);

-- 2.3 Class Timetable Schedule
create table if not exists public.timetable (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  faculty_id uuid references public.faculty(id) on delete set null,
  day_of_week text not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time time not null,
  end_time time not null,
  classroom text not null,
  batch_section text not null, -- e.g. 'CSE-A'
  semester integer not null default 8,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.4 Attendance Records
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  date date not null default current_date,
  status text not null check (status in ('Present', 'Absent', 'Late', 'Excused')),
  marked_by uuid references public.faculty(id) on delete set null,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, course_id, date)
);

-- 2.5 Course Assignments
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone not null,
  max_marks integer not null default 100 check (max_marks > 0),
  attachment_url text,
  created_by uuid references public.faculty(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.6 Assignment Submissions
create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  submission_file_url text,
  submission_text text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade_marks numeric(5,2) check (grade_marks >= 0),
  feedback text,
  graded_by uuid references public.faculty(id) on delete set null,
  graded_at timestamp with time zone,
  status text not null check (status in ('Pending', 'Submitted', 'Graded', 'Late', 'Resubmitted')) default 'Pending',
  unique (assignment_id, student_id)
);

-- 2.7 Examinations Schedule
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  exam_type text not null check (exam_type in ('Internal', 'Midterm', 'Final', 'Practical', 'Quiz')) default 'Final',
  date date not null,
  start_time time not null,
  end_time time not null,
  classroom text not null,
  max_marks integer not null default 100 check (max_marks > 0),
  passing_marks integer not null default 40,
  semester integer not null default 8,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.8 Academic Examination Results & Grades
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete set null,
  exam_title text not null,
  marks_obtained numeric(5,2) not null check (marks_obtained >= 0),
  max_marks numeric(5,2) not null default 100.00,
  percentage numeric(5,2) generated always as ((marks_obtained / max_marks) * 100.0) stored,
  grade text not null check (grade in ('O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'AB')),
  grade_points numeric(3,1) default 0.0,
  semester integer not null default 8,
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  remarks text,
  unique (student_id, course_id, exam_title)
);

-- ============================================================================
-- 3. LMS & DIGITAL LEARNING HUB TABLES
-- ============================================================================

-- 3.1 Course Study Materials
create table if not exists public.study_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  module_number integer not null default 1,
  material_type text not null check (material_type in ('Notes', 'Slides', 'QuestionBank', 'LabManual', 'Code', 'ReferenceBook')) default 'Notes',
  file_url text not null,
  file_size text default '2.4 MB',
  uploaded_by uuid references public.faculty(id) on delete set null,
  download_count integer default 0,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3.2 Video Lectures
create table if not exists public.video_lectures (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer not null default 45,
  video_url text not null,
  thumbnail_url text,
  module_number integer not null default 1,
  faculty_id uuid references public.faculty(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3.3 Quizzes & Self-Assessments
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  duration_minutes integer not null default 30,
  total_questions integer not null default 10,
  passing_score integer not null default 60,
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  score integer not null,
  max_score integer not null default 100,
  passed boolean not null default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 4. CAMPUS SERVICES (LIBRARY, FEES, HOSTEL, TRANSPORT) TABLES
-- ============================================================================

-- 4.1 Central Library Catalog
create table if not exists public.library_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text unique,
  category text not null default 'Computer Science',
  publisher text,
  total_copies integer not null default 1 check (total_copies >= 0),
  available_copies integer not null default 1 check (available_copies >= 0),
  shelf_location text default 'Rack CS-04',
  cover_image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.2 Library Borrowing Records
create table if not exists public.library_borrows (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.library_books(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  borrow_date date default current_date not null,
  due_date date not null,
  return_date date,
  fine_amount numeric(6,2) default 0.00 not null,
  status text not null check (status in ('Issued', 'Returned', 'Overdue', 'Lost')) default 'Issued',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.3 Student Fee Dues
create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  fee_type text not null check (fee_type in ('Tuition', 'Hostel', 'Transport', 'Examination', 'Library', 'Laboratory', 'Special')) default 'Tuition',
  amount numeric(10,2) not null check (amount > 0),
  due_date date not null,
  status text not null check (status in ('Paid', 'Unpaid', 'Partial', 'Overdue')) default 'Unpaid',
  academic_year text not null default '2026-2027',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.4 Fee Payments & Receipts
create table if not exists public.fee_payments (
  id uuid primary key default gen_random_uuid(),
  fee_id uuid not null references public.fees(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  amount_paid numeric(10,2) not null check (amount_paid > 0),
  payment_method text not null check (payment_method in ('Online Banking', 'UPI', 'Credit/Debit Card', 'Bank Transfer', 'Cash Counter', 'Demand Draft')),
  transaction_ref text not null unique,
  receipt_number text not null unique,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('Success', 'Pending', 'Failed', 'Refunded')) default 'Success'
);

-- 4.5 Hostel Blocks
create table if not exists public.hostel_blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  block_type text not null check (block_type in ('Boys', 'Girls', 'Faculty')),
  total_rooms integer not null default 50,
  warden_name text not null,
  warden_contact text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.6 Hostel Rooms
create table if not exists public.hostel_rooms (
  id uuid primary key default gen_random_uuid(),
  block_id uuid references public.hostel_blocks(id) on delete cascade,
  block_name text not null,
  room_number text not null,
  floor integer not null default 1,
  capacity integer not null default 2 check (capacity > 0),
  occupants_count integer not null default 0 check (occupants_count <= capacity),
  is_ac boolean default false not null,
  fee_per_semester numeric(8,2) not null default 45000.00,
  unique (block_name, room_number)
);

-- 4.7 Student Hostel Allocations
create table if not exists public.hostel_allocations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.hostel_rooms(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade unique,
  bed_number text default 'Bed 1',
  allocated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('Active', 'Vacated', 'Transferred')) default 'Active'
);

-- 4.8 Hostel Requests & Outpasses
create table if not exists public.hostel_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  request_type text not null check (request_type in ('Outpass', 'Maintenance', 'RoomChange', 'MessFeedback')),
  title text not null,
  description text not null,
  start_date date,
  end_date date,
  status text not null check (status in ('Pending', 'Approved', 'Rejected', 'Resolved')) default 'Pending',
  reviewed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.9 Transport Routes
create table if not exists public.transport_routes (
  id uuid primary key default gen_random_uuid(),
  route_number text not null unique,
  route_name text not null,
  vehicle_number text not null,
  driver_name text not null,
  driver_phone text not null,
  total_capacity integer not null default 50,
  occupied_seats integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4.10 Transport Stops
create table if not exists public.transport_stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.transport_routes(id) on delete cascade,
  stop_name text not null,
  pickup_time time not null,
  drop_time time not null,
  stop_order integer not null,
  landmark text,
  unique (route_id, stop_order)
);

-- 4.11 Transport Subscriptions
create table if not exists public.transport_allocations (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.transport_routes(id) on delete cascade,
  stop_id uuid not null references public.transport_stops(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade unique,
  pass_number text not null unique,
  valid_until date not null,
  status text not null check (status in ('Active', 'Expired', 'Cancelled')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- 5. PLACEMENT & CAREER PORTAL TABLES
-- ============================================================================

-- 5.1 Placement Job Drives
create table if not exists public.placement_jobs (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  package text not null,
  location text not null default 'Bangalore / Remote',
  job_type text not null check (job_type in ('Full Time', 'Internship', 'FTE + Internship')) default 'Full Time',
  cutoff_cgpa numeric(4,2) not null default 7.00,
  eligible_departments text[] not null default array['CSE', 'IT', 'ECE'],
  skills_required text[] not null default array['Data Structures', 'Python', 'System Design'],
  description text,
  drive_date timestamp with time zone not null,
  deadline timestamp with time zone not null,
  vacancies integer default 10,
  status text not null check (status in ('Active', 'Upcoming', 'Closed')) default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5.2 Placement Applications
create table if not exists public.placement_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.placement_jobs(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  resume_url text,
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null check (status in ('Applied', 'Shortlisted', 'OA Passed', 'Interviewing', 'Selected', 'Rejected')) default 'Applied',
  round_reached text default 'Online Assessment',
  feedback text,
  unique (job_id, student_id)
);

-- 5.3 Placement Interviews
create table if not exists public.placement_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.placement_applications(id) on delete cascade,
  round_name text not null,
  interview_date date not null,
  interview_time time not null,
  meeting_link_or_venue text not null,
  interviewer_notes text,
  status text not null check (status in ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled')) default 'Scheduled',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5.4 Career Preparation Resources
create table if not exists public.placement_prep_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('Aptitude', 'Coding', 'System Design', 'Core CS', 'HR Interviews')),
  resource_type text not null check (resource_type in ('PDF', 'Video', 'Cheatsheet', 'Practice Link')),
  content_url text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5.5 Saved Jobs
create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  job_id uuid not null references public.placement_jobs(id) on delete cascade,
  saved_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (student_id, job_id)
);

-- ============================================================================
-- 6. COMMUNICATION, NOTICES & TICKETING TABLES
-- ============================================================================

-- 6.1 Notices & Announcements
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null check (category in ('Academic', 'Examination', 'Placement', 'Administrative', 'Hostel', 'Events', 'Emergency')) default 'Academic',
  priority text not null check (priority in ('Normal', 'High', 'Urgent')) default 'Normal',
  target_audience text not null check (target_audience in ('All', 'Students', 'Faculty', 'Admins')) default 'All',
  department text,
  attachment_url text,
  published_by uuid references public.profiles(id) on delete set null,
  publisher_name text not null default 'Office of the Registrar',
  publish_date timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true not null
);

-- 6.2 Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null check (type in ('Academic', 'Attendance', 'Fee', 'Exam', 'Placement', 'Notice', 'System')) default 'Academic',
  unread boolean default true not null,
  action_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6.3 Helpdesk Service Requests
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticket_number text not null unique,
  category text not null check (category in ('IT Support', 'Hostel', 'Academics', 'Accounts', 'Transport', 'Library', 'General')),
  subject text not null,
  description text not null,
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Critical')) default 'Medium',
  status text not null check (status in ('Open', 'In Progress', 'Resolved', 'Closed')) default 'Open',
  assigned_to uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- ============================================================================
-- 7. SECURITY FUNCTIONS & TRIGGERS (Created After All Tables Exist)
-- ============================================================================

-- 7.1 Role Helpers
create or replace function public.get_auth_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'anon');
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_faculty()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'faculty'
  );
$$;

create or replace function public.is_faculty_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'admin')
  );
$$;

-- 7.2 Updated At Handler
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 7.3 Triggers for updated_at
drop trigger if exists tr_profiles_updated_at on public.profiles;
create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_students_updated_at on public.students;
create trigger tr_students_updated_at
  before update on public.students
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_faculty_updated_at on public.faculty;
create trigger tr_faculty_updated_at
  before update on public.faculty
  for each row execute function public.handle_updated_at();

-- 7.4 Auth User Creation Trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_name text;
  v_dept text;
  v_student_id text;
  v_faculty_id text;
  v_admin_id text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  v_name := coalesce(new.raw_user_meta_data->>'name', 'New User');
  v_dept := coalesce(new.raw_user_meta_data->>'department', 'Computer Science & Engineering');

  -- 1. Insert/Update Profile
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, v_name, v_role)
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        role = excluded.role;

  -- 2. Role-specific provisioning
  if v_role = 'student' then
    v_student_id := coalesce(new.raw_user_meta_data->>'student_id', 'STU' || upper(substring(new.id::text from 1 for 6)));
    insert into public.students (id, student_id, department, batch, semester, year_section, cgpa)
    values (
      new.id,
      v_student_id,
      v_dept,
      '2022-2026',
      8,
      'IV Year • CSE-A',
      8.60
    )
    on conflict (id) do nothing;

  elsif v_role = 'faculty' then
    v_faculty_id := coalesce(new.raw_user_meta_data->>'faculty_id', 'FAC' || upper(substring(new.id::text from 1 for 6)));
    insert into public.faculty (id, faculty_id, department, designation, qualification)
    values (
      new.id,
      v_faculty_id,
      v_dept,
      'Assistant Professor',
      'M.Tech, Ph.D'
    )
    on conflict (id) do nothing;

  elsif v_role = 'admin' then
    v_admin_id := coalesce(new.raw_user_meta_data->>'admin_id', 'ADM' || upper(substring(new.id::text from 1 for 6)));
    insert into public.admins (id, admin_id, designation)
    values (
      new.id,
      v_admin_id,
      'Campus Administrator'
    )
    on conflict (id) do nothing;
  end if;

  -- 3. Welcome Notification
  insert into public.notifications (user_id, title, description, type, unread)
  values (
    new.id,
    'Welcome to CampusOne',
    'Your institutional profile is active. Access your courses, attendance, and campus services.',
    'System',
    true
  );

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 8. PERFORMANCE INDEXES
-- ============================================================================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_students_dept on public.students(department);
create index if not exists idx_students_cgpa on public.students(cgpa);
create index if not exists idx_faculty_dept on public.faculty(department);
create index if not exists idx_courses_dept on public.courses(department);
create index if not exists idx_attendance_student_course on public.attendance(student_id, course_id);
create index if not exists idx_attendance_date on public.attendance(date);
create index if not exists idx_timetable_day on public.timetable(day_of_week);
create index if not exists idx_assignments_course on public.assignments(course_id);
create index if not exists idx_submissions_student on public.assignment_submissions(student_id);
create index if not exists idx_results_student on public.results(student_id);
create index if not exists idx_fees_student on public.fees(student_id);
create index if not exists idx_notices_target on public.notices(target_audience, is_active);
create index if not exists idx_notifications_user on public.notifications(user_id, unread);

-- ============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.students enable row level security;
alter table public.faculty enable row level security;
alter table public.admins enable row level security;
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.timetable enable row level security;
alter table public.attendance enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;
alter table public.study_materials enable row level security;
alter table public.video_lectures enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.library_books enable row level security;
alter table public.library_borrows enable row level security;
alter table public.fees enable row level security;
alter table public.fee_payments enable row level security;
alter table public.hostel_blocks enable row level security;
alter table public.hostel_rooms enable row level security;
alter table public.hostel_allocations enable row level security;
alter table public.hostel_requests enable row level security;
alter table public.transport_routes enable row level security;
alter table public.transport_stops enable row level security;
alter table public.transport_allocations enable row level security;
alter table public.placement_jobs enable row level security;
alter table public.placement_applications enable row level security;
alter table public.placement_interviews enable row level security;
alter table public.placement_prep_resources enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.notices enable row level security;
alter table public.notifications enable row level security;
alter table public.service_requests enable row level security;

-- Drop existing policies if any to prevent conflicts on rerun
drop policy if exists "Users can view own profile or public directory" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins full management on profiles" on public.profiles;
drop policy if exists "Anyone authenticated can view departments" on public.departments;
drop policy if exists "Admins can manage departments" on public.departments;
drop policy if exists "Students view own profile, Faculty/Admins view all" on public.students;
drop policy if exists "Admins can manage students" on public.students;
drop policy if exists "Anyone authenticated can view faculty" on public.faculty;
drop policy if exists "Faculty can update own details" on public.faculty;
drop policy if exists "Admins can manage faculty" on public.faculty;
drop policy if exists "Anyone authenticated can view courses" on public.courses;
drop policy if exists "Faculty can update their assigned courses" on public.courses;
drop policy if exists "Admins can manage courses" on public.courses;
drop policy if exists "Students view own enrollments, Faculty/Admins view all" on public.course_enrollments;
drop policy if exists "Admins manage course enrollments" on public.course_enrollments;
drop policy if exists "Anyone authenticated can view timetable" on public.timetable;
drop policy if exists "Faculty and Admins can manage timetable" on public.timetable;
drop policy if exists "View attendance policy" on public.attendance;
drop policy if exists "Faculty and Admins can manage attendance" on public.attendance;
drop policy if exists "View assignments policy" on public.assignments;
drop policy if exists "Faculty and Admins can manage assignments" on public.assignments;
drop policy if exists "Students view/submit own assignments" on public.assignment_submissions;
drop policy if exists "View exams policy" on public.exams;
drop policy if exists "Faculty and Admins can manage exams" on public.exams;
drop policy if exists "View results policy" on public.results;
drop policy if exists "Faculty and Admins can manage results" on public.results;
drop policy if exists "View study materials policy" on public.study_materials;
drop policy if exists "Faculty and Admins can manage study materials" on public.study_materials;
drop policy if exists "View video lectures policy" on public.video_lectures;
drop policy if exists "Faculty and Admins can manage video lectures" on public.video_lectures;
drop policy if exists "View quizzes policy" on public.quizzes;
drop policy if exists "Students can attempt and view own quiz scores" on public.quiz_attempts;
drop policy if exists "View library catalog" on public.library_books;
drop policy if exists "Admins and Librarians manage books" on public.library_books;
drop policy if exists "View library borrows" on public.library_borrows;
drop policy if exists "Manage library borrows" on public.library_borrows;
drop policy if exists "View fees policy" on public.fees;
drop policy if exists "Admins manage fees" on public.fees;
drop policy if exists "View fee payments policy" on public.fee_payments;
drop policy if exists "Insert fee payments" on public.fee_payments;
drop policy if exists "View hostel rooms" on public.hostel_rooms;
drop policy if exists "View hostel allocations" on public.hostel_allocations;
drop policy if exists "Manage hostel requests" on public.hostel_requests;
drop policy if exists "View transport routes and stops" on public.transport_routes;
drop policy if exists "View transport stops" on public.transport_stops;
drop policy if exists "View transport allocations" on public.transport_allocations;
drop policy if exists "View placement drives" on public.placement_jobs;
drop policy if exists "Admins manage placement drives" on public.placement_jobs;
drop policy if exists "Manage placement applications" on public.placement_applications;
drop policy if exists "Manage saved jobs" on public.saved_jobs;
drop policy if exists "View prep resources" on public.placement_prep_resources;
drop policy if exists "View notices" on public.notices;
drop policy if exists "Admins and Faculty create notices" on public.notices;
drop policy if exists "Manage own notifications" on public.notifications;
drop policy if exists "Manage service requests" on public.service_requests;

-- 9.1 Profiles
create policy "Users can view own profile or public directory" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins full management on profiles" on public.profiles
  for all using (public.is_admin());

-- 9.2 Departments
create policy "Anyone authenticated can view departments" on public.departments
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage departments" on public.departments
  for all using (public.is_admin());

-- 9.3 Students
create policy "Students view own profile, Faculty/Admins view all" on public.students
  for select using (
    auth.uid() = id or
    public.is_faculty_or_admin()
  );

create policy "Admins can manage students" on public.students
  for all using (public.is_admin());

-- 9.4 Faculty
create policy "Anyone authenticated can view faculty" on public.faculty
  for select using (auth.role() = 'authenticated');

create policy "Faculty can update own details" on public.faculty
  for update using (auth.uid() = id);

create policy "Admins can manage faculty" on public.faculty
  for all using (public.is_admin());

-- 9.5 Courses
create policy "Anyone authenticated can view courses" on public.courses
  for select using (auth.role() = 'authenticated');

create policy "Faculty can update their assigned courses" on public.courses
  for update using (auth.uid() = faculty_id or public.is_admin());

create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- 9.6 Course Enrollments
create policy "Students view own enrollments, Faculty/Admins view all" on public.course_enrollments
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

create policy "Admins manage course enrollments" on public.course_enrollments
  for all using (public.is_admin());

-- 9.7 Timetable
create policy "Anyone authenticated can view timetable" on public.timetable
  for select using (auth.role() = 'authenticated');

create policy "Faculty and Admins can manage timetable" on public.timetable
  for all using (public.is_faculty_or_admin());

-- 9.8 Attendance
create policy "View attendance policy" on public.attendance
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

create policy "Faculty and Admins can manage attendance" on public.attendance
  for all using (public.is_faculty_or_admin());

-- 9.9 Assignments & Submissions
create policy "View assignments policy" on public.assignments
  for select using (auth.role() = 'authenticated');

create policy "Faculty and Admins can manage assignments" on public.assignments
  for all using (public.is_faculty_or_admin());

create policy "Students view/submit own assignments" on public.assignment_submissions
  for all using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

-- 9.10 Exams & Results
create policy "View exams policy" on public.exams
  for select using (auth.role() = 'authenticated');

create policy "Faculty and Admins can manage exams" on public.exams
  for all using (public.is_faculty_or_admin());

create policy "View results policy" on public.results
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

create policy "Faculty and Admins can manage results" on public.results
  for all using (public.is_faculty_or_admin());

-- 9.11 LMS
create policy "View study materials policy" on public.study_materials
  for select using (auth.role() = 'authenticated');

create policy "Faculty and Admins can manage study materials" on public.study_materials
  for all using (public.is_faculty_or_admin());

create policy "View video lectures policy" on public.video_lectures
  for select using (auth.role() = 'authenticated');

create policy "Faculty and Admins can manage video lectures" on public.video_lectures
  for all using (public.is_faculty_or_admin());

create policy "View quizzes policy" on public.quizzes
  for select using (auth.role() = 'authenticated');

create policy "Students can attempt and view own quiz scores" on public.quiz_attempts
  for all using (auth.uid() = student_id or public.is_faculty_or_admin());

-- 9.12 Library
create policy "View library catalog" on public.library_books
  for select using (auth.role() = 'authenticated');

create policy "Admins and Librarians manage books" on public.library_books
  for all using (public.is_faculty_or_admin());

create policy "View library borrows" on public.library_borrows
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

create policy "Manage library borrows" on public.library_borrows
  for all using (public.is_faculty_or_admin());

-- 9.13 Fees
create policy "View fees policy" on public.fees
  for select using (
    auth.uid() = student_id or
    public.is_admin()
  );

create policy "Admins manage fees" on public.fees
  for all using (public.is_admin());

create policy "View fee payments policy" on public.fee_payments
  for select using (
    auth.uid() = student_id or
    public.is_admin()
  );

create policy "Insert fee payments" on public.fee_payments
  for insert with check (auth.uid() = student_id or public.is_admin());

-- 9.14 Hostel
create policy "View hostel rooms" on public.hostel_rooms
  for select using (auth.role() = 'authenticated');

create policy "View hostel allocations" on public.hostel_allocations
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

create policy "Manage hostel requests" on public.hostel_requests
  for all using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

-- 9.15 Transport
create policy "View transport routes and stops" on public.transport_routes
  for select using (auth.role() = 'authenticated');

create policy "View transport stops" on public.transport_stops
  for select using (auth.role() = 'authenticated');

create policy "View transport allocations" on public.transport_allocations
  for select using (
    auth.uid() = student_id or
    public.is_faculty_or_admin()
  );

-- 9.16 Placements
create policy "View placement drives" on public.placement_jobs
  for select using (auth.role() = 'authenticated');

create policy "Admins manage placement drives" on public.placement_jobs
  for all using (public.is_admin());

create policy "Manage placement applications" on public.placement_applications
  for all using (auth.uid() = student_id or public.is_admin());

create policy "Manage saved jobs" on public.saved_jobs
  for all using (auth.uid() = student_id);

create policy "View prep resources" on public.placement_prep_resources
  for select using (auth.role() = 'authenticated');

-- 9.17 Notices, Notifications & Service Requests
create policy "View notices" on public.notices
  for select using (is_active = true and auth.role() = 'authenticated');

create policy "Admins and Faculty create notices" on public.notices
  for all using (public.is_faculty_or_admin());

create policy "Manage own notifications" on public.notifications
  for all using (auth.uid() = user_id);

create policy "Manage service requests" on public.service_requests
  for all using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- END OF SUPABASE SCHEMA
-- ============================================================================
