-- ============================================================================
-- CAMPUS HUB — FIX RLS INFINITE RECURSION POLICIES
-- Run this in Supabase Dashboard -> SQL Editor to fix the 500 errors!
-- ============================================================================

-- 1. Helper security functions (bypasses RLS recursion using SECURITY DEFINER)
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

-- 2. Fix Profiles Table Policies
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Admins can manage all profiles" on public.profiles
  for all using (public.is_admin());

-- 3. Fix Students Table Policies
drop policy if exists "Faculty can view student details" on public.students;
create policy "Faculty can view student details" on public.students
  for select using (public.is_faculty_or_admin());

-- 4. Fix Courses Table Policies
drop policy if exists "Admins can manage courses" on public.courses;
create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- 5. Fix Attendance Table Policies
drop policy if exists "Faculty can manage attendance" on public.attendance;
create policy "Faculty can manage attendance" on public.attendance
  for all using (public.is_faculty_or_admin());

-- 6. Fix Assignments & Submissions Policies
drop policy if exists "Faculty can manage assignments" on public.assignments;
create policy "Faculty can manage assignments" on public.assignments
  for all using (public.is_faculty_or_admin());

drop policy if exists "Faculty can manage all submissions" on public.assignment_submissions;
create policy "Faculty can manage all submissions" on public.assignment_submissions
  for all using (public.is_faculty_or_admin());

-- 7. Fix Results Policies
drop policy if exists "Faculty can manage results" on public.results;
create policy "Faculty can manage results" on public.results
  for all using (public.is_faculty_or_admin());

-- 8. Fix Fees Policies
drop policy if exists "Admins can manage fees" on public.fees;
create policy "Admins can manage fees" on public.fees
  for all using (public.is_admin());
