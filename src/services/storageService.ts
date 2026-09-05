/**
 * Platform-Wide Storage Service
 * Provides centralized, type-safe getters and setters to persist all portal data
 * into localStorage, ensuring full data retention across page reloads, logouts,
 * and browser restarts.
 */

// Safe localStorage helper
export function safeGetStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

export function safeSetStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error saving ${key} to storage:`, err);
  }
}

// ----------------------------------------------------------------------
// 1. Admin User Accounts & RBAC
// ----------------------------------------------------------------------
export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  status: 'Active' | 'Suspended';
  lastActive: string;
}

const DEFAULT_USERS: UserAccountItem[] = [
  { id: 'USR-01', name: 'Aditya Sharma', email: 'aditya.sharma@campushub.edu', role: 'student', status: 'Active', lastActive: 'Just now' },
  { id: 'USR-02', name: 'Dr. Suresh Kumar', email: 'suresh.kumar@campushub.edu', role: 'faculty', status: 'Active', lastActive: '10 mins ago' },
  { id: 'USR-03', name: 'System Administrator', email: 'admin@campushub.edu', role: 'admin', status: 'Active', lastActive: 'Active now' },
  { id: 'USR-04', name: 'Sneha Patel', email: 'sneha.patel@campushub.edu', role: 'student', status: 'Active', lastActive: '2 hours ago' },
  { id: 'USR-05', name: 'Dr. Priya Menon', email: 'priya.menon@campushub.edu', role: 'faculty', status: 'Active', lastActive: '1 day ago' },
  { id: 'USR-06', name: 'Rahul Verma', email: 'rahul.verma@campushub.edu', role: 'student', status: 'Active', lastActive: '3 hours ago' }
];

export const getUserAccounts = (): UserAccountItem[] =>
  safeGetStorage<UserAccountItem[]>('campushub_admin_users', DEFAULT_USERS);

export const saveUserAccounts = (users: UserAccountItem[]): void =>
  safeSetStorage('campushub_admin_users', users);

// ----------------------------------------------------------------------
// 2. Academic Departments
// ----------------------------------------------------------------------
export interface DepartmentItem {
  code: string;
  name: string;
  hod: string;
  students: number;
  faculty: number;
  labs: number;
  established: string;
  status: 'Active' | 'Under Review';
}

const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Suresh Kumar', students: 360, faculty: 24, labs: 12, established: '2008', status: 'Active' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', hod: 'Dr. Priya Menon', students: 280, faculty: 18, labs: 8, established: '2008', status: 'Active' },
  { code: 'IT', name: 'Information Technology', hod: 'Dr. Anil Gupta', students: 220, faculty: 14, labs: 6, established: '2012', status: 'Active' },
  { code: 'AI&DS', name: 'Artificial Intelligence & Data Science', hod: 'Dr. Vikram Singh', students: 160, faculty: 12, labs: 6, established: '2021', status: 'Active' },
  { code: 'MECH', name: 'Mechanical Engineering', hod: 'Dr. K. Ramesh', students: 120, faculty: 10, labs: 5, established: '2010', status: 'Active' },
  { code: 'CIVIL', name: 'Civil Engineering', hod: 'Dr. S. N. Roy', students: 100, faculty: 6, labs: 5, established: '2011', status: 'Active' }
];

export const getDepartments = (): DepartmentItem[] =>
  safeGetStorage<DepartmentItem[]>('campushub_admin_departments', DEFAULT_DEPARTMENTS);

export const saveDepartments = (depts: DepartmentItem[]): void =>
  safeSetStorage('campushub_admin_departments', depts);

// ----------------------------------------------------------------------
// 3. Admin Scheduled Examinations
// ----------------------------------------------------------------------
export interface AdminExamItem {
  id: string;
  name: string;
  courseCode: string;
  department: string;
  date: string;
  time: string;
  room: string;
  invigilator: string;
  studentCount: number;
  status: 'Scheduled' | 'Completed';
}

const DEFAULT_ADMIN_EXAMS: AdminExamItem[] = [
  { id: 'ex-1', name: 'Mid-Semester Theory Examination 1', courseCode: 'CSE-301', department: 'Computer Science', date: '2026-08-25', time: '10:00 AM – 12:00 PM', room: 'Room CSE-204', invigilator: 'Dr. Suresh Kumar', studentCount: 60, status: 'Scheduled' },
  { id: 'ex-2', name: 'DBMS End-Semester Practical Assessment', courseCode: 'CSE-302', department: 'Computer Science', date: '2026-08-28', time: '02:00 PM – 05:00 PM', room: 'Computer Lab 3', invigilator: 'Dr. Priya Menon', studentCount: 60, status: 'Scheduled' },
  { id: 'ex-3', name: 'VLSI Digital Signal Processing Midterm', courseCode: 'ECE-301', department: 'Electronics', date: '2026-08-26', time: '10:00 AM – 12:00 PM', room: 'Seminar Hall 1', invigilator: 'Dr. Rajesh Verma', studentCount: 60, status: 'Scheduled' }
];

export const getAdminExams = (): AdminExamItem[] =>
  safeGetStorage<AdminExamItem[]>('campushub_admin_exams', DEFAULT_ADMIN_EXAMS);

export const saveAdminExams = (exams: AdminExamItem[]): void =>
  safeSetStorage('campushub_admin_exams', exams);

// ----------------------------------------------------------------------
// 4. Admin Placement Job Postings
// ----------------------------------------------------------------------
export interface AdminJobItem {
  id: string;
  company: string;
  title: string;
  packageStr: string;
  type: string;
  location: string;
  cgpaRequired: number;
  deadline: string;
  applicationsCount: number;
  status: 'Active' | 'Closed';
}

const DEFAULT_ADMIN_JOBS: AdminJobItem[] = [
  { id: 'job-1', company: 'TechNova Solutions', title: 'Associate Software Engineer', packageStr: '₹8.5 LPA', type: 'Full Time', location: 'Bangalore / Hybrid', cgpaRequired: 7.5, deadline: '30 Aug 2026', applicationsCount: 42, status: 'Active' },
  { id: 'job-2', company: 'CloudCore Technologies', title: 'Cloud DevOps Associate', packageStr: '₹10.0 LPA', type: 'Full Time', location: 'Hyderabad', cgpaRequired: 8.0, deadline: '05 Sep 2026', applicationsCount: 38, status: 'Active' },
  { id: 'job-3', company: 'Quantum Dynamics', title: 'Full Stack Developer', packageStr: '₹14.0 LPA', type: 'Full Time', location: 'Bangalore', cgpaRequired: 8.5, deadline: '10 Sep 2026', applicationsCount: 56, status: 'Active' }
];

export const getAdminJobs = (): AdminJobItem[] =>
  safeGetStorage<AdminJobItem[]>('campushub_admin_jobs', DEFAULT_ADMIN_JOBS);

export const saveAdminJobs = (jobs: AdminJobItem[]): void =>
  safeSetStorage('campushub_admin_jobs', jobs);

// ----------------------------------------------------------------------
// 5. Faculty Study Materials
// ----------------------------------------------------------------------
export interface FacultyMaterialItem {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  type: 'PDF' | 'Notes' | 'Presentation' | 'Video' | 'Document';
  date: string;
  fileSize: string;
}

const DEFAULT_FACULTY_MATERIALS: FacultyMaterialItem[] = [
  { id: 'mat-1', title: 'Lecture 1: Binary Search Trees & AVL Balancing', courseCode: 'CSE-301', courseName: 'Advanced Data Structures', type: 'PDF', date: '12 Aug 2026', fileSize: '2.4 MB' },
  { id: 'mat-2', title: 'Chapter 3: ER-Model to Relational Schema Mapping', courseCode: 'CSE-302', courseName: 'Database Management Systems', type: 'Presentation', date: '14 Aug 2026', fileSize: '4.8 MB' },
  { id: 'mat-3', title: 'Red-Black Tree Insertion & Rotation Handout', courseCode: 'CSE-301', courseName: 'Advanced Data Structures', type: 'Notes', date: '15 Aug 2026', fileSize: '1.1 MB' },
  { id: 'mat-4', title: 'Microservices & Distributed Containers Overview', courseCode: 'CSE-401', courseName: 'Cloud Computing Architecture', type: 'PDF', date: '16 Aug 2026', fileSize: '3.6 MB' }
];

export const getFacultyMaterials = (): FacultyMaterialItem[] =>
  safeGetStorage<FacultyMaterialItem[]>('campushub_faculty_materials', DEFAULT_FACULTY_MATERIALS);

export const saveFacultyMaterials = (materials: FacultyMaterialItem[]): void =>
  safeSetStorage('campushub_faculty_materials', materials);

// ----------------------------------------------------------------------
// 6. Faculty Attendance History
// ----------------------------------------------------------------------
export interface AttendanceHistoryRecord {
  id: string;
  date: string;
  courseCode: string;
  section: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
  percentage: number;
}

const DEFAULT_ATTENDANCE_HISTORY: AttendanceHistoryRecord[] = [
  { id: 'att-hist-1', date: '17 Aug 2026', courseCode: 'CSE-301', section: 'Section A', presentCount: 54, absentCount: 6, totalStudents: 60, percentage: 90 },
  { id: 'att-hist-2', date: '15 Aug 2026', courseCode: 'CSE-302', section: 'Section B', presentCount: 52, absentCount: 8, totalStudents: 60, percentage: 86 },
  { id: 'att-hist-3', date: '14 Aug 2026', courseCode: 'CSE-401', section: 'Section A', presentCount: 58, absentCount: 2, totalStudents: 60, percentage: 96 }
];

export const getFacultyAttendanceHistory = (): AttendanceHistoryRecord[] =>
  safeGetStorage<AttendanceHistoryRecord[]>('campushub_faculty_attendance_history', DEFAULT_ATTENDANCE_HISTORY);

export const saveFacultyAttendanceHistory = (history: AttendanceHistoryRecord[]): void =>
  safeSetStorage('campushub_faculty_attendance_history', history);

// ----------------------------------------------------------------------
// 7. Student Fees Payments & Breakdown
// ----------------------------------------------------------------------
export interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: 'UPI' | 'Credit / Debit Card' | 'Net Banking' | 'Campus Cash Wallet';
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface FeeCategoryBreakdown {
  id: string;
  category: string;
  total: number;
  paid: number;
  pending: number;
  dueDate: string;
  status: 'Settled' | 'Partial' | 'Overdue';
}

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  { id: 'CH2026PAY001', date: '10 Aug 2026', description: 'Semester 7 Tuition Installment', amount: 45000, method: 'UPI', status: 'Paid' },
  { id: 'CH2026PAY002', date: '05 Jul 2026', description: 'Residential Hostel Block A & Mess Advance', amount: 35000, method: 'Net Banking', status: 'Paid' },
  { id: 'CH2026PAY003', date: '12 Jan 2026', description: 'Annual Laboratory & Computing Access Charge', amount: 8000, method: 'Credit / Debit Card', status: 'Paid' }
];

const DEFAULT_FEE_BREAKDOWN: FeeCategoryBreakdown[] = [
  { id: 'fee-1', category: 'Academic Tuition & Instruction Fee', total: 65000, paid: 45000, pending: 20000, dueDate: '15 Sep 2026', status: 'Partial' },
  { id: 'fee-2', category: 'Residential Hostel (Single Occupancy)', total: 35000, paid: 35000, pending: 0, dueDate: '01 Aug 2026', status: 'Settled' },
  { id: 'fee-3', category: 'Advanced Computing Lab & Wi-Fi', total: 8000, paid: 8000, pending: 0, dueDate: '01 Aug 2026', status: 'Settled' },
  { id: 'fee-4', category: 'University Examinations & Evaluation', total: 4500, paid: 0, pending: 4500, dueDate: '30 Aug 2026', status: 'Overdue' }
];

export const getStudentPaymentHistory = (): PaymentRecord[] =>
  safeGetStorage<PaymentRecord[]>('campushub_fees_payments', DEFAULT_PAYMENTS);

export const saveStudentPaymentHistory = (payments: PaymentRecord[]): void =>
  safeSetStorage('campushub_fees_payments', payments);

export const getStudentFeeBreakdown = (): FeeCategoryBreakdown[] =>
  safeGetStorage<FeeCategoryBreakdown[]>('campushub_fees_breakdown', DEFAULT_FEE_BREAKDOWN);

export const saveStudentFeeBreakdown = (breakdown: FeeCategoryBreakdown[]): void =>
  safeSetStorage('campushub_fees_breakdown', breakdown);

// ----------------------------------------------------------------------
// 8. Student Notifications & Notices
// ----------------------------------------------------------------------
export interface StudentNotificationItem {
  id: string;
  category: 'Assignment' | 'Exam' | 'Fee' | 'Library' | 'Hostel' | 'Transport' | 'Placement' | 'Academic' | 'General';
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  targetRoute?: string;
  actionLabel?: string;
}

const DEFAULT_STUDENT_NOTIFICATIONS: StudentNotificationItem[] = [
  { id: 'NOTIF-101', category: 'Assignment', title: 'Assignment Deadline Approaching', message: 'Database Management "ER Diagram & Normalization" coursework is due on 25th August.', time: '15 mins ago', isUnread: true, targetRoute: '/student/assignments', actionLabel: 'Submit Work' },
  { id: 'NOTIF-102', category: 'Exam', title: 'Mid-Semester Hall Ticket Released', message: 'Your official examination hall ticket for August 2026 is now available for download.', time: '2 hours ago', isUnread: true, targetRoute: '/student/exams', actionLabel: 'View Hall Ticket' },
  { id: 'NOTIF-103', category: 'Fee', title: 'Semester 8 Tuition Installment Reminder', message: 'Your pending installment of ₹20,000 is due by 15th September 2026 to avoid late charges.', time: '1 day ago', isUnread: true, targetRoute: '/student/fees', actionLabel: 'Pay Fees' },
  { id: 'NOTIF-104', category: 'Library', title: 'Library Book Due Soon', message: '"Database System Concepts" by Abraham Silberschatz is due for return in 27 days.', time: '2 days ago', isUnread: false, targetRoute: '/student/library', actionLabel: 'Renew Loan' },
  { id: 'NOTIF-105', category: 'Hostel', title: 'Hostel Maintenance Update', message: 'Your service request for bathroom tap repair has been assigned to maintenance supervisor.', time: '3 days ago', isUnread: false, targetRoute: '/student/hostel', actionLabel: 'View Request' }
];

export const getStudentNotifications = (): StudentNotificationItem[] =>
  safeGetStorage<StudentNotificationItem[]>('campushub_student_notifications', DEFAULT_STUDENT_NOTIFICATIONS);

export const saveStudentNotifications = (notifs: StudentNotificationItem[]): void =>
  safeSetStorage('campushub_student_notifications', notifs);
