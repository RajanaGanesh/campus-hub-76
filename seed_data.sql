-- ============================================================================
-- CAMPUS HUB — INITIAL SEED DATA FOR SUPABASE
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. COURSES
insert into public.courses (code, name, department, credits) values
('CS301', 'Data Structures & Algorithms', 'Computer Science & Engineering', 4),
('CS302', 'Database Management Systems', 'Computer Science & Engineering', 4),
('CS303', 'Operating Systems', 'Computer Science & Engineering', 3),
('CS304', 'Computer Networks & Security', 'Computer Science & Engineering', 3),
('CS305', 'Web Technologies & Cloud Computing', 'Computer Science & Engineering', 4),
('AI201', 'Artificial Intelligence & Machine Learning', 'Artificial Intelligence & Data Science', 4),
('EC201', 'Digital Signal Processing', 'Electronics & Communication', 3),
('ME101', 'Engineering Thermodynamics', 'Mechanical Engineering', 3)
on conflict (code) do nothing;

-- 2. LIBRARY BOOKS
insert into public.library_books (title, author, isbn, total_copies, available_copies) values
('Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 12, 8),
('Database System Concepts', 'Abraham Silberschatz, Henry F. Korth', '978-0073523323', 10, 5),
('Computer Networking: A Top-Down Approach', 'James F. Kurose, Keith W. Ross', '978-0133594140', 8, 3),
('Operating System Concepts (Dinosaur Book)', 'Abraham Silberschatz, Peter B. Galvin', '978-1118063330', 15, 11),
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 7, 2),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell, Peter Norvig', '978-0136042594', 9, 6),
('Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 6, 4)
on conflict (isbn) do nothing;

-- 3. HOSTEL ROOMS
insert into public.hostel_rooms (block_name, room_number, capacity, occupants_count) values
('Block A (Aryabhata)', 'A-101', 2, 2),
('Block A (Aryabhata)', 'A-102', 2, 1),
('Block A (Aryabhata)', 'A-201', 3, 2),
('Block A (Aryabhata)', 'A-202', 3, 3),
('Block B (Bhaskara)', 'B-101', 2, 0),
('Block B (Bhaskara)', 'B-102', 2, 2),
('Block B (Bhaskara)', 'B-201', 4, 3),
('Block C (Gargi)', 'C-101', 2, 1),
('Block C (Gargi)', 'C-102', 2, 2),
('Block D (Maitreyi)', 'D-101', 2, 0)
on conflict do nothing;

-- 4. PLACEMENT JOBS
insert into public.placement_jobs (company, role, package, cutoff_cgpa, deadline) values
('Google', 'Software Engineer (L3)', '₹ 32.0 LPA', 8.50, now() + interval '30 days'),
('Microsoft', 'Software Development Engineer', '₹ 28.5 LPA', 8.00, now() + interval '25 days'),
('Amazon', 'SDE 1 - AWS Cloud', '₹ 26.0 LPA', 7.75, now() + interval '20 days'),
('Oracle', 'Database Systems Engineer', '₹ 19.5 LPA', 7.50, now() + interval '15 days'),
('Cisco Systems', 'Network Software Engineer', '₹ 18.0 LPA', 7.50, now() + interval '12 days'),
('Goldman Sachs', 'Analyst - Technology', '₹ 24.0 LPA', 8.00, now() + interval '18 days'),
('Deloitte', 'Technology Consultant', '₹ 12.0 LPA', 7.00, now() + interval '10 days'),
('TCS Innovation Lab', 'Research Associate', '₹ 9.0 LPA', 6.50, now() + interval '7 days')
on conflict do nothing;

-- 5. TIMETABLE SCHEDULES
do $$
declare
  dsa_id uuid;
  dbms_id uuid;
  os_id uuid;
  cn_id uuid;
  web_id uuid;
begin
  select id into dsa_id from public.courses where code = 'CS301' limit 1;
  select id into dbms_id from public.courses where code = 'CS302' limit 1;
  select id into os_id from public.courses where code = 'CS303' limit 1;
  select id into cn_id from public.courses where code = 'CS304' limit 1;
  select id into web_id from public.courses where code = 'CS305' limit 1;

  if dsa_id is not null then
    insert into public.timetable (course_id, day_of_week, start_time, end_time, classroom) values
    (dsa_id, 'Monday', '09:00:00', '10:00:00', 'LH-101'),
    (dsa_id, 'Wednesday', '11:15:00', '12:15:00', 'LH-101'),
    (dsa_id, 'Friday', '14:00:00', '16:00:00', 'CS Lab-2');
  end if;

  if dbms_id is not null then
    insert into public.timetable (course_id, day_of_week, start_time, end_time, classroom) values
    (dbms_id, 'Monday', '10:00:00', '11:00:00', 'LH-102'),
    (dbms_id, 'Thursday', '09:00:00', '10:00:00', 'LH-102'),
    (dbms_id, 'Tuesday', '14:00:00', '16:00:00', 'DB Lab-1');
  end if;

  if os_id is not null then
    insert into public.timetable (course_id, day_of_week, start_time, end_time, classroom) values
    (os_id, 'Tuesday', '09:00:00', '10:00:00', 'LH-103'),
    (os_id, 'Thursday', '11:15:00', '12:15:00', 'LH-103');
  end if;

  if cn_id is not null then
    insert into public.timetable (course_id, day_of_week, start_time, end_time, classroom) values
    (cn_id, 'Wednesday', '09:00:00', '10:00:00', 'LH-104'),
    (cn_id, 'Friday', '10:00:00', '11:00:00', 'LH-104');
  end if;

  if web_id is not null then
    insert into public.timetable (course_id, day_of_week, start_time, end_time, classroom) values
    (web_id, 'Tuesday', '11:15:00', '12:15:00', 'LH-101'),
    (web_id, 'Thursday', '14:00:00', '16:00:00', 'Web Lab');
  end if;
end $$;

-- 6. ASSIGNMENTS
do $$
declare
  dsa_id uuid;
  dbms_id uuid;
  os_id uuid;
  web_id uuid;
begin
  select id into dsa_id from public.courses where code = 'CS301' limit 1;
  select id into dbms_id from public.courses where code = 'CS302' limit 1;
  select id into os_id from public.courses where code = 'CS303' limit 1;
  select id into web_id from public.courses where code = 'CS305' limit 1;

  if dsa_id is not null then
    insert into public.assignments (course_id, title, description, due_date, max_marks) values
    (dsa_id, 'Assignment 1: Red-Black Tree Implementation', 'Implement Red-Black tree insertion, deletion, and rotation routines in C++ with test cases.', now() + interval '5 days', 25),
    (dsa_id, 'Assignment 2: Graph Algorithms & Dijkstra', 'Solve dynamic pathfinding benchmark scenarios using Dijkstra and A* search algorithms.', now() + interval '12 days', 30);
  end if;

  if dbms_id is not null then
    insert into public.assignments (course_id, title, description, due_date, max_marks) values
    (dbms_id, 'Coursework 1: Normalization & E-R Modeling', 'Design an enterprise retail management schema up to 3NF/BCNF with relational algebra proofs.', now() + interval '7 days', 20),
    (dbms_id, 'Coursework 2: Complex SQL & Query Optimization', 'Write and optimize queries using EXPLAIN ANALYZE on a 100,000 row dataset.', now() + interval '14 days', 25);
  end if;

  if os_id is not null then
    insert into public.assignments (course_id, title, description, due_date, max_marks) values
    (os_id, 'Lab 1: CPU Scheduling Simulator', 'Simulate FCFS, SJF, and Round Robin scheduling algorithms with average waiting time metrics.', now() + interval '9 days', 20);
  end if;

  if web_id is not null then
    insert into public.assignments (course_id, title, description, due_date, max_marks) values
    (web_id, 'Project Milestone 1: Full-Stack Authentication', 'Create JWT & OAuth2 authenticated student dashboard using React & Supabase.', now() + interval '10 days', 50);
  end if;
end $$;

-- 7. EXAMINATIONS SCHEDULE
do $$
declare
  dsa_id uuid;
  dbms_id uuid;
  os_id uuid;
  cn_id uuid;
begin
  select id into dsa_id from public.courses where code = 'CS301' limit 1;
  select id into dbms_id from public.courses where code = 'CS302' limit 1;
  select id into os_id from public.courses where code = 'CS303' limit 1;
  select id into cn_id from public.courses where code = 'CS304' limit 1;

  if dsa_id is not null then
    insert into public.exams (course_id, title, date, time, classroom, max_marks) values
    (dsa_id, 'Midterm Examination: Data Structures', current_date + 15, '09:30:00', 'Auditorium Hall A', 50);
  end if;

  if dbms_id is not null then
    insert into public.exams (course_id, title, date, time, classroom, max_marks) values
    (dbms_id, 'Midterm Examination: Database Systems', current_date + 17, '09:30:00', 'Auditorium Hall B', 50);
  end if;

  if os_id is not null then
    insert into public.exams (course_id, title, date, time, classroom, max_marks) values
    (os_id, 'Midterm Examination: Operating Systems', current_date + 19, '09:30:00', 'Exam Hall 3', 50);
  end if;

  if cn_id is not null then
    insert into public.exams (course_id, title, date, time, classroom, max_marks) values
    (cn_id, 'Midterm Examination: Computer Networks', current_date + 21, '09:30:00', 'Exam Hall 4', 50);
  end if;
end $$;
