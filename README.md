# 🎓 CampusOne / Campus Hub — Institutional Super App

> A production-grade, unified Higher Education Management Platform engineered for Students, Faculty Members, University Administrators, and Parents/Guardians.

---

## 🌟 Key Features & Portals

### 1. 🛡️ Authentication & Role-Based Access Control (RBAC)
- **Role Isolation**: Strict frontend routing safeguards (`ProtectedRoute`) and backend row-level security ensuring users only access authorized domain data.
- **Roles Supported**: `student`, `faculty`, `admin`, `parent`.
- **Demo Accounts**:
  - **Student**: `student@campushub.com` / `student123`
  - **Faculty**: `faculty@campushub.com` / `faculty123`
  - **Admin**: `admin@campushub.com` / `admin123`
  - **Parent**: `parent@campushub.com` / `parent123`

---

### 2. 👨‍🎓 Student Portal (`/student/*`)
- **Dashboard**: Real-time CGPA meter, attendance compliance gauges, upcoming lectures, today's schedule, and service shortcuts.
- **Academic Modules**:
  - **Attendance & Timetable** (`/student/timetable`): Weekly timetable, period slots, attendance percentages.
  - **Coursework & Assignments** (`/student/assignments`): Homework submission desk, rubric scores, instructor feedback.
  - **Examinations** (`/student/exams`): Midterm and semester schedules, hall seatings, guidelines.
  - **Results & Transcripts** (`/student/results`): Grade points, semester transcripts, credit audits.
  - **LMS Study Materials** (`/student/lms`): Downloadable lecture notes, slides, video archives.
- **Campus Services**:
  - **Central Library** (`/student/library`): RFID book checkout ledger, due dates, fines.
  - **Tuition & Fees** (`/student/fees`): Invoices, payment receipts, balance settlement.
  - **Hostel Residency** (`/student/hostel`): Room allotment, warden contacts, mess dining menu.
  - **Transport Fleet** (`/student/transport`): Transit routes, bus schedules, stop waypoints.
  - **Notice Board** (`/student/notices`): University circulars and event alerts.
  - **Placement & Career Portal** (`/student/placements/*`): 7 sub-views including job listings, application tracker, resume builder, and interview prep.

---

### 3. 👩‍🏫 Faculty Portal (`/faculty/*`)
- **Dashboard**: Daily teaching schedule, active course sections, grading deadlines, and attendance shortcuts.
- **Course Management** (`/faculty/courses`): Syllabus tracking, student enrollment rosters.
- **Attendance Marking** (`/faculty/attendance`): Live roll call grid with quick-mark presets and validation.
- **Assignments & Grading** (`/faculty/assignments`): Publish coursework tasks and evaluate student submissions.
- **Exam Schedules** (`/faculty/exams`): Invigilation duties and hall seating plans.
- **Marks Valuation** (`/faculty/results`): Internal assessment scores and semester grade entries.
- **Study Materials** (`/faculty/materials`): Course syllabus, lecture slides, and reference uploads.
- **Notices & Circulars** (`/faculty/notices`): Publish academic advisories to class groups.

---

### 4. 🏛️ Centralized Admin Portal (`/admin/*`)
- **Executive Dashboard**: Institutional statistics, department enrollment progress bars, quick operations shortcuts.
- **Student Admissions & Directory** (`/admin/students`): Student registration, credential management, profile modal, deactivation safeguards.
- **Faculty & Staff Roster** (`/admin/faculty`): Teaching directory, designation filters, appointments.
- **Course Management** (`/admin/courses`): Master curriculum registry and faculty reassignments.
- **Academic Departments** (`/admin/departments`): Department chairs (HODs), laboratories, student capacity.
- **Campus Attendance Audit** (`/admin/attendance`): Campus attendance realization and low-attendance candidate alerts.
- **Coursework & Exams** (`/admin/assignments`, `/admin/exams`): Examination room conflict validator.
- **Financial Collections** (`/admin/fees`): Tuition fee realization ledger and verified gateway transaction receipts.
- **Campus Services Oversight** (`/admin/library`, `/admin/hostel`, `/admin/transport`): Full inventory, blocks A–D, transit routes 1–4.
- **Placement & Corporate Relations** (`/admin/placements`): Corporate recruitment partners and job opportunities.
- **User Accounts & RBAC** (`/admin/users`): Authentication directory and account state enforcement.
- **Institutional Reports** (`/admin/reports`): 9 datasets with CSV, PDF, and print view exports.
- **System Settings** (`/admin/settings`): Institutional profile and security policies.

---

### 5. 👨‍👩‍👧 Parent / Guardian Portal (`/parent/*`)
- **Dashboard**: Multi-student switcher (toggles reactively between multiple linked student wards), summary card, 6 statistics cards.
- **Student Attendance Logs** (`/parent/attendance`): Session roll call logs, subject percentages, low-rate alerts.
- **Academic Transcripts** (`/parent/academics` & `/parent/results`): GPA overview, internal scores, letter grades.
- **Homework Monitoring** (`/parent/assignments`): Coursework deadlines, evaluation status, instructor comments.
- **Exam Timetable** (`/parent/exams`): Midterm and final examination dates, exam halls.
- **Fee Invoices & Receipts** (`/parent/fees`): Verified payment receipt vouchers with PDF download action.
- **Campus Services for Student** (`/parent/library`, `/parent/hostel`, `/parent/placements`): Book loans, room details, placement offer letters.
- **Guardian Notices & Settings** (`/parent/notices`, `/parent/settings`): Parent-Teacher conference circulars, notification channel preferences.

---

### 6. 🤖 CampusOne AI Assistant & Universal Search
- **Floating AI Assistant**: Role-aware assistant bottom-right button with quick chips and direct navigation actions.
- **Universal Search**: Accessible via navbar or `Ctrl + K` / `Cmd + K`, providing instant search across pages, subjects, tasks, and services.
- **Error Boundaries**: Catches runtime errors gracefully without crashing the UI.

---

## 🛠️ Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 with `ProtectedRoute` guards
- **Styling**: CampusOne Design System (CSS custom properties, dark theme, fluid responsiveness)
- **Backend / Database**: Supabase Client + Fallback Mock Database Engine
- **Icons**: FontAwesome 6 Pro

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
