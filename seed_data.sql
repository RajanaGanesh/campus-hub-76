-- ============================================================================
-- CAMPUSONE / CAMPUS HUB - COMPLETE SEED & DEMO DATASET
-- Execute this script in your Supabase SQL Editor after running database_schema.sql
-- ============================================================================

-- 0. SEED DEMO AUTH USERS IN auth.users (With encrypted demo passwords)
-- Passwords:
--   student@campushub.edu -> student123
--   faculty@campushub.edu -> faculty123
--   admin@campushub.edu   -> admin123

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@campushub.edu',
    crypt('student123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alex Vance","role":"student","department":"Computer Science & Engineering","student_id":"2023CSE01042"}',
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'faculty@campushub.edu',
    crypt('faculty123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Dr. Elena Rostova","role":"faculty","department":"Computer Science & Engineering","faculty_id":"FAC-CSE-104"}',
    now(),
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@campushub.edu',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Marcus Sterling","role":"admin","admin_id":"ADM-CH-001"}',
    now(),
    now()
  )
on conflict (id) do update set
  encrypted_password = excluded.encrypted_password,
  raw_user_meta_data = excluded.raw_user_meta_data;

-- 1. DEPARTMENTS
insert into public.departments (id, code, name, head_of_department, building, contact_email, total_students, total_faculty)
values
  ('11111111-1111-1111-1111-111111111101', 'CSE', 'Computer Science & Engineering', 'Dr. Ramesh Sundaram', 'Ramanujan Tech Block (Floor 3)', 'hod.cse@campushub.edu', 480, 28),
  ('11111111-1111-1111-1111-111111111102', 'IT', 'Information Technology', 'Dr. Kavitha Selvan', 'Turing Academic Wing (Floor 2)', 'hod.it@campushub.edu', 360, 22),
  ('11111111-1111-1111-1111-111111111103', 'ECE', 'Electronics & Communication', 'Dr. Rajesh Khanna', 'Tesla Science Block (Floor 1)', 'hod.ece@campushub.edu', 320, 20),
  ('11111111-1111-1111-1111-111111111104', 'AI&DS', 'Artificial Intelligence & Data Science', 'Dr. Sneha Paul', 'Shannon AI Labs (Floor 4)', 'hod.aids@campushub.edu', 240, 16),
  ('11111111-1111-1111-1111-111111111105', 'MECH', 'Mechanical Engineering', 'Dr. A. K. Verma', 'Bhabha Engineering Complex', 'hod.mech@campushub.edu', 200, 14)
on conflict (code) do update set name = excluded.name;

-- 2. PROFILES
insert into public.profiles (id, email, name, role, phone, gender, blood_group, address)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'student@campushub.edu', 'Alex Vance', 'student', '+91 98765 43210', 'Male', 'O+', 'Campus Hostel Block A, Room 304'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'faculty@campushub.edu', 'Dr. Elena Rostova', 'faculty', '+91 98765 43211', 'Female', 'A+', 'Faculty Quarters Q-12, Green Campus'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'admin@campushub.edu', 'Marcus Sterling', 'admin', '+91 98765 43212', 'Male', 'B+', 'Admin Tower Level 4')
on conflict (id) do update set name = excluded.name, role = excluded.role;

-- 3. STUDENTS TABLE
insert into public.students (id, student_id, department, department_id, batch, semester, year_section, cgpa, credits_earned)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023CSE01042', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', '2022-2026', 8, 'IV Year • CSE-A', 8.60, 142)
on conflict (id) do update set cgpa = excluded.cgpa;

-- 4. FACULTY TABLE
insert into public.faculty (id, faculty_id, department, department_id, designation, qualification, specialization, office_room)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'FAC-CSE-104', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 'Associate Professor', 'Ph.D in Distributed Systems, M.Tech (IIT)', 'Cloud Computing & High-Performance Distributed Systems', 'Tech Block 308')
on conflict (id) do update set designation = excluded.designation;

-- 5. ADMINS
insert into public.admins (id, admin_id, designation, office_location)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ADM-CH-001', 'Chief Academic Registrar & Director of IT', 'Main Admin Tower 402')
on conflict (id) do nothing;

-- 7. COURSES
insert into public.courses (id, code, name, department, department_id, semester, credits, course_type, faculty_id, syllabus)
values
  ('22222222-2222-2222-2222-222222222201', 'CS801', 'Distributed Systems & Cloud Computing', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 8, 4, 'Core', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Microservices architecture, Consensus algorithms (Raft, Paxos), Kubernetes orchestration, Serverless frameworks, MapReduce & Spark.'),
  ('22222222-2222-2222-2222-222222222202', 'CS802', 'Deep Learning & Generative AI', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 8, 4, 'Core', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CNNs, Transformers, Self-attention, Diffusion models, LLM fine-tuning, RAG pipelines, PyTorch.'),
  ('22222222-2222-2222-2222-222222222203', 'CS803', 'Enterprise Cybersecurity & Cryptography', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 8, 3, 'Core', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Public key infrastructure, Zero-trust architectures, OWASP top 10, Penetration testing, Blockchain security.'),
  ('22222222-2222-2222-2222-222222222204', 'CS804', 'Full-Stack DevOps & Microservices', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 8, 3, 'Core', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CI/CD with GitHub Actions, Terraform Infrastructure-as-Code, Docker, Observability with Prometheus and Grafana.'),
  ('22222222-2222-2222-2222-222222222205', 'CS805', 'Quantum Computing Fundamentals', 'Computer Science & Engineering', '11111111-1111-1111-1111-111111111101', 8, 3, 'Elective', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Qubits, Quantum gates, Shor algorithm, Grover search, Qiskit framework.')
on conflict (code) do update set name = excluded.name;

-- 8. COURSE ENROLLMENTS
insert into public.course_enrollments (student_id, course_id, semester, academic_year, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222201', 8, '2026-2027', 'Enrolled'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222202', 8, '2026-2027', 'Enrolled'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222203', 8, '2026-2027', 'Enrolled'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222204', 8, '2026-2027', 'Enrolled'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222205', 8, '2026-2027', 'Enrolled')
on conflict (student_id, course_id, semester, academic_year) do nothing;

-- 9. TIMETABLE SCHEDULE
insert into public.timetable (course_id, faculty_id, day_of_week, start_time, end_time, classroom, batch_section, semester)
values
  ('22222222-2222-2222-2222-222222222201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Monday', '09:00', '10:00', 'LH-301', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222202', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Monday', '10:15', '11:15', 'Lab 4', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222203', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Monday', '11:30', '12:30', 'LH-301', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222204', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tuesday', '09:00', '10:00', 'Lab 2', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222205', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tuesday', '10:15', '11:15', 'LH-302', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222201', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Wednesday', '09:00', '11:00', 'Cloud Lab 304', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222202', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Thursday', '10:15', '12:15', 'AI Lab 102', 'CSE-A', 8),
  ('22222222-2222-2222-2222-222222222204', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Friday', '09:00', '11:00', 'DevOps Lab 201', 'CSE-A', 8);

-- 10. ATTENDANCE SEED DATA
insert into public.attendance (student_id, course_id, date, status, marked_by, remarks)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222201', current_date - interval '1 day', 'Present', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'On time'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222202', current_date - interval '1 day', 'Present', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Active participation'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222203', current_date - interval '2 days', 'Present', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lab completed'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222204', current_date - interval '3 days', 'Present', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'On time'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222205', current_date - interval '4 days', 'Late', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '10 mins late')
on conflict (student_id, course_id, date) do nothing;

-- 11. ASSIGNMENTS & SUBMISSIONS
insert into public.assignments (id, course_id, title, description, due_date, max_marks, created_by)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Kubernetes Helm Deployment Pipeline', 'Build and deploy a scalable 3-tier microservice architecture using Helm charts and ingress controllers.', now() + interval '3 days', 100, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 'Transformer Attention Mechanism from Scratch', 'Implement multi-head self-attention and positional encoding using PyTorch with benchmark evaluations.', now() + interval '5 days', 100, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222203', 'Zero-Trust Network Protocol Analysis', 'Simulate Man-In-The-Middle and Replay attacks, and implement Mutual TLS (mTLS) authentication verification.', now() + interval '9 days', 50, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
on conflict (id) do nothing;

insert into public.assignment_submissions (assignment_id, student_id, submission_file_url, submitted_at, grade_marks, feedback, status)
values
  ('33333333-3333-3333-3333-333333333301', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://campushub.edu/storage/submissions/k8s-helm-alex.zip', now() - interval '1 day', 95.00, 'Exceptional deployment architecture with high test coverage.', 'Graded'),
  ('33333333-3333-3333-3333-333333333302', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://campushub.edu/storage/submissions/transformer-alex.ipynb', now() - interval '2 hours', null, null, 'Submitted')
on conflict (assignment_id, student_id) do nothing;

-- 12. EXAMS & RESULTS
insert into public.exams (id, course_id, title, exam_type, date, start_time, end_time, classroom, max_marks, passing_marks, semester)
values
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 'Distributed Systems End-Semester Exam', 'Final', current_date + interval '9 days', '09:30', '12:30', 'Exam Hall A-102', 100, 40, 8),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222202', 'Deep Learning & GenAI Theory Exam', 'Final', current_date + interval '12 days', '09:30', '12:30', 'Exam Hall B-201', 100, 40, 8),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222203', 'Cybersecurity Midterm Assessment', 'Midterm', current_date + interval '15 days', '14:00', '16:00', 'LH-304', 50, 20, 8)
on conflict (id) do nothing;

insert into public.results (student_id, course_id, exam_title, marks_obtained, max_marks, grade, grade_points, semester)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222201', 'Mid-Term Evaluation', 92.50, 100.00, 'O', 10.0, 8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222202', 'Practical Lab Exam', 88.00, 100.00, 'A+', 9.0, 8),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222203', 'Internal Assessment', 44.00, 50.00, 'A+', 9.0, 8)
on conflict (student_id, course_id, exam_title) do nothing;

-- 13. LMS STUDY MATERIALS & VIDEO LECTURES
insert into public.study_materials (course_id, title, description, module_number, material_type, file_url, file_size, uploaded_by)
values
  ('22222222-2222-2222-2222-222222222201', 'Cloud Architecture & Paxos Consensus Notes', 'Comprehensive lecture notes covering state machine replication and consensus protocols.', 1, 'Notes', 'https://campushub.edu/lms/cloud-notes-mod1.pdf', '4.2 MB', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('22222222-2222-2222-2222-222222222202', 'Transformer Architecture & Attention Mechanisms', 'Detailed presentation slides on multi-head attention and BERT vs GPT architectures.', 2, 'Slides', 'https://campushub.edu/lms/transformer-slides.pdf', '8.5 MB', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

insert into public.video_lectures (course_id, title, description, duration_minutes, video_url, thumbnail_url, module_number, faculty_id)
values
  ('22222222-2222-2222-2222-222222222201', 'Raft Consensus Protocol & Leader Election Demo', 'Hands-on live walkthrough of Raft cluster leader election and log synchronization.', 48, 'https://campushub.edu/video/raft-demo.mp4', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', 1, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- 14. CENTRAL LIBRARY
insert into public.library_books (id, title, author, isbn, category, total_copies, available_copies, shelf_location)
values
  ('55555555-5555-5555-5555-555555555501', 'Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Computer Science', 12, 8, 'Rack CS-04'),
  ('55555555-5555-5555-5555-555555555502', 'Deep Learning with Python (2nd Edition)', 'François Chollet', '978-1617296864', 'Artificial Intelligence', 10, 5, 'Rack AI-02'),
  ('55555555-5555-5555-5555-555555555503', 'Site Reliability Engineering', 'Betsy Beyer et al. (Google)', '978-1491929124', 'DevOps & Cloud', 8, 4, 'Rack CS-08')
on conflict (id) do nothing;

insert into public.library_borrows (book_id, student_id, borrow_date, due_date, status)
values
  ('55555555-5555-5555-5555-555555555501', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', current_date - interval '10 days', current_date + interval '4 days', 'Issued')
on conflict (id) do nothing;

-- 15. FEES & PAYMENTS
insert into public.fees (id, student_id, title, fee_type, amount, due_date, status, academic_year)
values
  ('66666666-6666-6666-6666-666666666601', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tuition Fee - VIII Semester', 'Tuition', 65000.00, '2026-08-30', 'Paid', '2026-2027'),
  ('66666666-6666-6666-6666-666666666602', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hostel & Mess Accommodation (Even Sem)', 'Hostel', 45000.00, '2026-09-15', 'Paid', '2026-2027'),
  ('66666666-6666-6666-6666-666666666603', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Final Semester Examination & Degree Fee', 'Examination', 4500.00, '2026-10-15', 'Unpaid', '2026-2027')
on conflict (id) do nothing;

insert into public.fee_payments (fee_id, student_id, amount_paid, payment_method, transaction_ref, receipt_number, payment_date, status)
values
  ('66666666-6666-6666-6666-666666666601', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 65000.00, 'UPI', 'UPI-TXN-984128914', 'REC-2026-8941', now() - interval '15 days', 'Success'),
  ('66666666-6666-6666-6666-666666666602', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 45000.00, 'Online Banking', 'NETB-TXN-1092841', 'REC-2026-8942', now() - interval '10 days', 'Success')
on conflict (transaction_ref) do nothing;

-- 16. HOSTEL BLOCKS & ALLOCATION
insert into public.hostel_blocks (id, name, block_type, total_rooms, warden_name, warden_contact)
values
  ('77777777-7777-7777-7777-777777777701', 'Aryabhatta Boys Hostel (Block A)', 'Boys', 120, 'Col. Sanjeev Nair', '+91 94441 22891'),
  ('77777777-7777-7777-7777-777777777702', 'Kalpana Chawla Girls Hostel (Block B)', 'Girls', 100, 'Dr. Meenakshi Sundaram', '+91 94441 22892')
on conflict (name) do nothing;

insert into public.hostel_rooms (id, block_id, block_name, room_number, floor, capacity, occupants_count, is_ac, fee_per_semester)
values
  ('77777777-7777-7777-7777-777777777710', '77777777-7777-7777-7777-777777777701', 'Aryabhatta Boys Hostel (Block A)', '304', 3, 2, 2, true, 45000.00)
on conflict (block_name, room_number) do nothing;

insert into public.hostel_allocations (room_id, student_id, bed_number, status)
values
  ('77777777-7777-7777-7777-777777777710', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bed A', 'Active')
on conflict (student_id) do nothing;

-- 17. CAMPUS TRANSPORT
insert into public.transport_routes (id, route_number, route_name, vehicle_number, driver_name, driver_phone, total_capacity, occupied_seats)
values
  ('88888888-8888-8888-8888-888888888801', 'Route 04', 'Tambaram Junction to Campus Hub (Direct Express)', 'TN-09-CB-4821', 'K. Murugan', '+91 98401 55219', 54, 48)
on conflict (route_number) do nothing;

insert into public.transport_stops (id, route_id, stop_name, pickup_time, drop_time, stop_order, landmark)
values
  ('88888888-8888-8888-8888-888888888811', '88888888-8888-8888-8888-888888888801', 'Tambaram Railway Station Bus Bay', '07:15', '17:45', 1, 'Near Platform 1 Exit'),
  ('88888888-8888-8888-8888-888888888812', '88888888-8888-8888-8888-888888888801', 'Chromepet Grand Southern Trunk Road', '07:30', '17:30', 2, 'MIT Flyover Pillar 24'),
  ('88888888-8888-8888-8888-888888888813', '88888888-8888-8888-8888-888888888801', 'Campus Hub Main Academic Gate', '08:15', '16:45', 3, 'Security Gate 1')
on conflict (id) do nothing;

-- 18. PLACEMENT DRIVES
insert into public.placement_jobs (id, company, role, package, location, job_type, cutoff_cgpa, eligible_departments, skills_required, drive_date, deadline, vacancies, status)
values
  ('99999999-9999-9999-9999-999999999901', 'Google Cloud', 'Cloud Systems Engineer (SRE)', '₹ 28.5 LPA', 'Bangalore / Hyderabad', 'Full Time', 8.00, array['CSE', 'IT'], array['Distributed Systems', 'Kubernetes', 'Go/Python', 'Networking'], now() + interval '10 days', now() + interval '5 days', 15, 'Active'),
  ('99999999-9999-9999-9999-999999999902', 'Microsoft', 'Software Development Engineer II (AI Platforms)', '₹ 32.0 LPA', 'Bangalore / Remote', 'Full Time', 8.25, array['CSE', 'AI&DS', 'IT'], array['PyTorch', 'Transformers', 'C++', 'System Design'], now() + interval '14 days', now() + interval '7 days', 12, 'Active'),
  ('99999999-9999-9999-9999-999999999903', 'Amazon AWS', 'DevOps & Platform Security Engineer', '₹ 24.0 LPA', 'Chennai / Bangalore', 'Full Time', 7.50, array['CSE', 'IT', 'ECE'], array['AWS', 'Terraform', 'CI/CD', 'Security'], now() + interval '18 days', now() + interval '12 days', 20, 'Active')
on conflict (id) do nothing;

insert into public.placement_applications (job_id, student_id, resume_url, status, round_reached)
values
  ('99999999-9999-9999-9999-999999999901', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://campushub.edu/resumes/alex-vance-cv.pdf', 'Interviewing', 'Technical Round 2'),
  ('99999999-9999-9999-9999-999999999902', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://campushub.edu/resumes/alex-vance-cv.pdf', 'Shortlisted', 'Online Assessment')
on conflict (job_id, student_id) do nothing;

-- 19. NOTICES & NOTIFICATIONS
insert into public.notices (title, content, category, priority, target_audience, publisher_name, publish_date, is_active)
values
  ('Final Semester Graduation Schedule & Capstone Submission', 'All 8th semester students are hereby notified that the final Capstone Project repository submissions close on April 15, 2026. External evaluations will commence from April 20th.', 'Academic', 'High', 'Students', 'Office of Academic Affairs', now() - interval '2 days', true),
  ('Campus Placement Drive: Google Cloud & Microsoft Registration Open', 'Registrations are active for 2026 batch recruitment. Eligible students with CGPA >= 8.0 must submit resumes via the Placement portal before Sunday 11:59 PM.', 'Placement', 'Urgent', 'Students', 'Career Development Center', now() - interval '1 day', true),
  ('Faculty Research Grant Applications for Q3', 'Faculty members are invited to submit interdisciplinary AI & Sustainable Computing grant proposals through the Dean of Research portal.', 'Administrative', 'Normal', 'Faculty', 'Office of the Dean (R&D)', now() - interval '3 days', true);

insert into public.notifications (user_id, title, description, type, unread)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Assignment Graded: Kubernetes Helm Pipeline', 'Dr. Elena Rostova graded your assignment. Score: 95/100 (Exceptional Work)', 'Academic', false),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Interview Call: Google Cloud Technical Round 2', 'Your technical interview has been scheduled for tomorrow at 11:00 AM IST via Google Meet.', 'Placement', true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Attendance Verified: 86.4% Safe Zone', 'Monthly institutional attendance threshold validated. You are eligible for all final semester exams.', 'Attendance', false);

-- ============================================================================
-- SEED DATA INSERTION COMPLETE
-- ============================================================================
