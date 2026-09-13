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

export interface NoticeItem {
  id: string;
  title: string;
  category: 'Academic' | 'Examination' | 'Placement' | 'Hostel' | 'Transport' | 'General' | 'Events';
  publishedDate: string;
  publisher: string;
  priority: 'High' | 'Medium' | 'Low';
  snippet: string;
  fullText: string;
  attachmentName?: string;
  isUnread: boolean;
}

const DEFAULT_STUDENT_NOTICES: NoticeItem[] = [
  {
    id: 'NOT-2026-081',
    title: 'Mid-Semester Examination Hall Allotment & Guidelines',
    category: 'Examination',
    publishedDate: '17 Aug 2026',
    publisher: 'Controller of Examinations',
    priority: 'High',
    snippet: 'Mid-semester examinations commence from 25th August 2026. Review your room and desk numbers.',
    fullText: 'All candidates appearing for the Mid-Semester Theoretical and Practical Examinations (August 2026) are hereby notified that the final seating arrangements and examination schedules are now finalized. Candidates must carry their printed CampusOne Hall Ticket and institutional Smart ID Card. Mobile phones and electronic gadgets are strictly banned inside examination halls.',
    attachmentName: 'Midterm_Exam_Schedule_Aug2026.pdf',
    isUnread: true
  },
  {
    id: 'NOT-2026-080',
    title: 'Google & Microsoft Campus Placement Drive Registration',
    category: 'Placement',
    publishedDate: '16 Aug 2026',
    publisher: 'Training & Placement Cell',
    priority: 'High',
    snippet: 'Final registration deadline for upcoming cloud and software engineering recruitment drives.',
    fullText: 'The Department of Placement & Career Development invites applications from final year B.Tech students (CSE/ECE/IT) with CGPA >= 7.5. Online screening assessments will be conducted on the CampusOne testing portal on Saturday, 29th August 2026. Ensure your resume and portfolio links are updated in the portal.',
    attachmentName: 'Placement_Drive_Eligibility_Criteria.pdf',
    isUnread: true
  },
  {
    id: 'NOT-2026-079',
    title: 'Hostel Maintenance & Water Supply Pipeline Upgrades',
    category: 'Hostel',
    publishedDate: '15 Aug 2026',
    publisher: 'Chief Residential Warden',
    priority: 'Medium',
    snippet: 'Scheduled water supply maintenance in Krishna and Godavari hostel blocks this Tuesday.',
    fullText: 'In order to replace central overhead water valves, water supply will be suspended in Krishna Hostel (Block A & B) on 18th August between 10:00 AM and 01:00 PM. Residents are requested to store adequate water for morning usage.',
    isUnread: false
  },
  {
    id: 'NOT-2026-078',
    title: 'Special Evening Bus Schedules During Examination Week',
    category: 'Transport',
    publishedDate: '14 Aug 2026',
    publisher: 'Campus Fleet In-Charge',
    priority: 'Medium',
    snippet: 'Additional departure shuttles at 01:30 PM and 05:30 PM for day scholars during exams.',
    fullText: 'To facilitate seamless commute for students appearing in staggered exam sessions, additional return buses will operate across all routes (Routes 1–6) at 01:30 PM following morning papers, as well as regular 05:30 PM departures.',
    isUnread: false
  },
  {
    id: 'NOT-2026-077',
    title: 'Annual TechFest "InnovateX 2026" Call for Hackathon Teams',
    category: 'Events',
    publishedDate: '12 Aug 2026',
    publisher: 'Student Affairs Council',
    priority: 'Low',
    snippet: 'Registration is now live for the 36-hour National Student Hackathon with ₹5,00,000 in prizes.',
    fullText: 'CampusOne is proud to present InnovateX 2026, our flagship inter-collegiate technical festival. Tracks include Artificial Intelligence, Autonomous Systems, Blockchain, and Green Energy. Register teams of 3–4 students before 31st August.',
    attachmentName: 'InnovateX_Hackathon_Brochure.pdf',
    isUnread: false
  },
  {
    id: 'NOT-2026-076',
    title: 'Submission of Elective Course Preferences for Next Term',
    category: 'Academic',
    publishedDate: '10 Aug 2026',
    publisher: 'Dean of Academic Affairs',
    priority: 'Medium',
    snippet: 'Online portal open for selecting Open Elective and Professional Elective coursework.',
    fullText: 'Students entering the upcoming academic semester must lock in their elective course preferences via the LMS course catalog before the cutoff date. Allocation is based on first-come-first-serve and cumulative CGPA ranking.',
    isUnread: false
  }
];

export const getStudentNotices = (): NoticeItem[] =>
  safeGetStorage<NoticeItem[]>('campushub_student_notices', DEFAULT_STUDENT_NOTICES);

export const saveStudentNotices = (notices: NoticeItem[]): void =>
  safeSetStorage('campushub_student_notices', notices);

// ----------------------------------------------------------------------
// 9. Campus Transport Fleet & Routes
// ----------------------------------------------------------------------
export interface TransportRouteItem {
  id: string;
  name: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedCount: number;
  morningTime: string;
  eveningTime: string;
  stops: string[];
  status?: 'Active' | 'Under Maintenance' | 'Suspended';
}

const DEFAULT_TRANSPORT_ROUTES: TransportRouteItem[] = [
  {
    id: 'RT-01',
    name: 'Route 1: Silk Board – HSR – Campus',
    busNumber: 'KA-01-FA-1204',
    driverName: 'Mr. Ramesh Babu',
    driverPhone: '+91 98450 12345',
    capacity: 45,
    assignedCount: 42,
    morningTime: '07:15 AM',
    eveningTime: '05:15 PM',
    stops: ['Silk Board Junction', 'HSR BDA Complex', 'Agara Lake', 'Campus Main Gate'],
    status: 'Active'
  },
  {
    id: 'RT-02',
    name: 'Route 2: Indiranagar – Koramangala – Campus',
    busNumber: 'KA-01-FA-1208',
    driverName: 'Mr. Manjunath Swamy',
    driverPhone: '+91 98450 23456',
    capacity: 45,
    assignedCount: 44,
    morningTime: '07:00 AM',
    eveningTime: '05:15 PM',
    stops: ['Indiranagar 100ft Rd', 'Domlur Flyover', 'Sony World Koramangala', 'Campus Main Gate'],
    status: 'Active'
  },
  {
    id: 'RT-03',
    name: 'Route 3: Whitefield – Marathahalli – Campus',
    busNumber: 'KA-01-FA-1212',
    driverName: 'Mr. Suresh Gowda',
    driverPhone: '+91 98450 34567',
    capacity: 45,
    assignedCount: 40,
    morningTime: '07:10 AM',
    eveningTime: '05:15 PM',
    stops: ['Whitefield TTMC', 'Kundalahalli Gate', 'Marathahalli Bridge', 'Campus Main Gate'],
    status: 'Active'
  },
  {
    id: 'RT-04',
    name: 'Route 4: Electronic City – Phase 1 & 2 – Campus',
    busNumber: 'KA-01-FA-1216',
    driverName: 'Mr. Venkatesh Rao',
    driverPhone: '+91 98450 45678',
    capacity: 45,
    assignedCount: 38,
    morningTime: '07:20 AM',
    eveningTime: '05:15 PM',
    stops: ['Infosys Gate 1', 'Wipro Gate', 'Electronic City Toll', 'Campus Main Gate'],
    status: 'Active'
  }
];

export const getTransportRoutes = (): TransportRouteItem[] =>
  safeGetStorage<TransportRouteItem[]>('campushub_transport_routes', DEFAULT_TRANSPORT_ROUTES);

export const saveTransportRoutes = (routes: TransportRouteItem[]): void =>
  safeSetStorage('campushub_transport_routes', routes);

// ----------------------------------------------------------------------
// 10. Campus Hostel Residency & Allocations
// ----------------------------------------------------------------------
export interface HostelBlockItem {
  code: string;
  name: string;
  rooms: number;
  occupied: number;
  vacant: number;
  maintenance: number;
  warden: string;
  phone: string;
  gender: 'Boys' | 'Girls' | 'Co-ed';
}

export interface HostelAllocationItem {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  year: string;
  phone: string;
  email: string;
  block: string;
  room: string;
  roomType: 'Single AC' | 'Double AC' | 'Single Non-AC' | 'Double Non-AC' | '3-Sharing Non-AC';
  bedNumber: string;
  joined: string;
  status: 'Active Occupant' | 'Temporary Leave' | 'Under Verification' | 'Vacated';
  messPlan: string;
  emergencyContact: string;
  remarks?: string;
}

const DEFAULT_HOSTEL_BLOCKS: HostelBlockItem[] = [
  { code: 'Block A', name: 'Boys Senior Hostel (Block A)', rooms: 100, occupied: 94, vacant: 4, maintenance: 2, warden: 'Mr. K. Sharma', phone: '+91 98765 11111', gender: 'Boys' },
  { code: 'Block B', name: 'Boys Junior Hostel (Block B)', rooms: 100, occupied: 92, vacant: 6, maintenance: 2, warden: 'Mr. R. Varma', phone: '+91 98765 22222', gender: 'Boys' },
  { code: 'Block C', name: 'Girls Senior Hostel (Block C)', rooms: 100, occupied: 96, vacant: 2, maintenance: 2, warden: 'Dr. Sunita Rao', phone: '+91 98765 33333', gender: 'Girls' },
  { code: 'Block D', name: 'Girls Junior Hostel (Block D)', rooms: 100, occupied: 78, vacant: 20, maintenance: 2, warden: 'Ms. Anita Nair', phone: '+91 98765 44444', gender: 'Girls' }
];

const DEFAULT_HOSTEL_ALLOCATIONS: HostelAllocationItem[] = [
  {
    id: 'HOSTEL-ALC-001',
    studentName: 'Aditya Sharma',
    rollNo: '236F1A0551',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    phone: '+91 98765 43210',
    email: 'aditya.sharma@campushub.edu',
    block: 'Block A',
    room: 'Room A-204',
    roomType: 'Double AC',
    bedNumber: 'Bed 1',
    joined: '15 Jul 2024',
    status: 'Active Occupant',
    messPlan: 'Standard Non-Veg',
    emergencyContact: '+91 98111 22334',
    remarks: 'Hostel representative for 2nd floor'
  },
  {
    id: 'HOSTEL-ALC-002',
    studentName: 'Rohan Gupta',
    rollNo: '236F1A0553',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    phone: '+91 98765 43212',
    email: 'rohan.gupta@campushub.edu',
    block: 'Block A',
    room: 'Room A-204',
    roomType: 'Double AC',
    bedNumber: 'Bed 2',
    joined: '15 Jul 2024',
    status: 'Active Occupant',
    messPlan: 'Standard Veg',
    emergencyContact: '+91 98222 33445',
    remarks: 'Roommate with Aditya Sharma'
  },
  {
    id: 'HOSTEL-ALC-003',
    studentName: 'Sneha Patel',
    rollNo: '236F1A0552',
    department: 'Electronics & Communication',
    year: '3rd Year',
    phone: '+91 98765 43211',
    email: 'sneha.patel@campushub.edu',
    block: 'Block C',
    room: 'Room C-302',
    roomType: 'Single Non-AC',
    bedNumber: 'Bed 1',
    joined: '18 Jul 2024',
    status: 'Active Occupant',
    messPlan: 'Special Veg',
    emergencyContact: '+91 98333 44556',
    remarks: 'Single room allotment on merit'
  },
  {
    id: 'HOSTEL-ALC-004',
    studentName: 'Pooja Reddy',
    rollNo: '236F1A0554',
    department: 'Information Technology',
    year: '3rd Year',
    phone: '+91 98765 43213',
    email: 'pooja.reddy@campushub.edu',
    block: 'Block C',
    room: 'Room C-108',
    roomType: 'Double Non-AC',
    bedNumber: 'Bed 1',
    joined: '20 Jul 2024',
    status: 'Active Occupant',
    messPlan: 'Standard Veg',
    emergencyContact: '+91 98444 55667',
    remarks: 'Ground floor accommodation'
  }
];

export const getHostelBlocks = (): HostelBlockItem[] =>
  safeGetStorage<HostelBlockItem[]>('campushub_hostel_blocks', DEFAULT_HOSTEL_BLOCKS);

export const saveHostelBlocks = (blocks: HostelBlockItem[]): void =>
  safeSetStorage('campushub_hostel_blocks', blocks);

export const getHostelAllocations = (): HostelAllocationItem[] =>
  safeGetStorage<HostelAllocationItem[]>('campushub_hostel_allocations', DEFAULT_HOSTEL_ALLOCATIONS);

export const saveHostelAllocations = (allocations: HostelAllocationItem[]): void =>
  safeSetStorage('campushub_hostel_allocations', allocations);

// ----------------------------------------------------------------------
// 11. Student & Faculty Authentication Login History Logs
// ----------------------------------------------------------------------
export interface LoginHistoryRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'student' | 'faculty' | 'admin';
  timestamp: string;
  ipAddress: string;
  deviceInfo: string;
  loginLocation: string;
  authMethod: 'Password' | 'SSO' | 'Google' | 'Session Token';
  status: 'Active Session' | 'Success' | 'Logged Out' | 'Failed' | 'Terminated by Admin';
}

const STORAGE_LOGIN_HISTORY_KEY = 'campushub_login_history';

const DEFAULT_LOGIN_HISTORY: LoginHistoryRecord[] = [
  {
    id: 'LOG-2026-9081',
    userId: '236F1A0504',
    userName: 'rohit',
    userEmail: 'rohit@campushub.com',
    role: 'student',
    timestamp: '12 Sep 2026 at 08:45 PM',
    ipAddress: '192.168.1.104 (Campus Wi-Fi)',
    deviceInfo: 'Chrome 128 / Windows 11',
    loginLocation: 'Boys Senior Hostel (Block A)',
    authMethod: 'Password',
    status: 'Active Session'
  },
  {
    id: 'LOG-2026-9080',
    userId: 'FAC-CSE-01',
    userName: 'Dr. Suresh Kumar',
    userEmail: 'suresh.kumar@campushub.edu',
    role: 'faculty',
    timestamp: '12 Sep 2026 at 08:10 PM',
    ipAddress: '172.16.10.5 (Faculty Network)',
    deviceInfo: 'Edge 128 / Windows 11',
    loginLocation: 'CSE Faculty Room (Cabin 204)',
    authMethod: 'Password',
    status: 'Active Session'
  },
  {
    id: 'LOG-2026-9079',
    userId: 'ADM-002',
    userName: 'Rajana Ganesh (Admin)',
    userEmail: 'grajana608@gmail.com',
    role: 'admin',
    timestamp: '12 Sep 2026 at 08:00 PM',
    ipAddress: '172.16.1.1 (Admin Gateway)',
    deviceInfo: 'Chrome 128 / Windows 11',
    loginLocation: 'Central Administration Block',
    authMethod: 'Password',
    status: 'Active Session'
  },
  {
    id: 'LOG-2026-9078',
    userId: '236F1A0551',
    userName: 'Aditya Sharma',
    userEmail: 'aditya.sharma@campushub.edu',
    role: 'student',
    timestamp: '12 Sep 2026 at 07:15 PM',
    ipAddress: '192.168.1.52 (Library Wi-Fi)',
    deviceInfo: 'Firefox 130 / macOS Sonoma',
    loginLocation: 'Central Digital Library 2nd Floor',
    authMethod: 'Password',
    status: 'Active Session'
  },
  {
    id: 'LOG-2026-9077',
    userId: 'FAC-ECE-01',
    userName: 'Dr. Priya Menon',
    userEmail: 'priya.menon@campushub.edu',
    role: 'faculty',
    timestamp: '12 Sep 2026 at 06:40 PM',
    ipAddress: '172.16.10.12 (ECE Dept Office)',
    deviceInfo: 'Chrome 128 / macOS Sequoia',
    loginLocation: 'ECE Department Complex',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9076',
    userId: '236F1A0552',
    userName: 'Sneha Patel',
    userEmail: 'sneha.patel@campushub.edu',
    role: 'student',
    timestamp: '12 Sep 2026 at 05:30 PM',
    ipAddress: '172.16.20.14 (Lab Network)',
    deviceInfo: 'Chrome 128 / Ubuntu 24.04',
    loginLocation: 'ECE Digital Systems Lab 3',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9075',
    userId: '236F1A0553',
    userName: 'Rohan Gupta',
    userEmail: 'rohan.gupta@campushub.edu',
    role: 'student',
    timestamp: '12 Sep 2026 at 04:10 PM',
    ipAddress: '192.168.1.88 (Mobile 5G Gateway)',
    deviceInfo: 'Safari Mobile / iOS 17.6',
    loginLocation: 'Campus Sports Complex',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9074',
    userId: 'FAC-IT-01',
    userName: 'Dr. Anil Gupta',
    userEmail: 'anil.gupta@campushub.edu',
    role: 'faculty',
    timestamp: '12 Sep 2026 at 03:15 PM',
    ipAddress: '172.16.10.22 (IT Server Lab)',
    deviceInfo: 'Chrome 128 / Windows 11',
    loginLocation: 'IT Data Center Wing',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9073',
    userId: '236F1A0554',
    userName: 'Pooja Reddy',
    userEmail: 'pooja.reddy@campushub.edu',
    role: 'student',
    timestamp: '12 Sep 2026 at 02:20 PM',
    ipAddress: '192.168.1.92 (Hostel C Wi-Fi)',
    deviceInfo: 'Chrome 128 / Windows 10',
    loginLocation: 'Girls Senior Hostel (Block C)',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9072',
    userId: 'FAC-AIDS-01',
    userName: 'Dr. Vikram Singh',
    userEmail: 'vikram.singh@campushub.edu',
    role: 'faculty',
    timestamp: '12 Sep 2026 at 11:05 AM',
    ipAddress: '172.16.10.35 (AI Lab Server)',
    deviceInfo: 'Chromium / Linux Debian',
    loginLocation: 'AI & Data Science Center',
    authMethod: 'Password',
    status: 'Success'
  },
  {
    id: 'LOG-2026-9071',
    userId: '236F1A0501',
    userName: 'Rahul Verma',
    userEmail: 'rahul.verma@campushub.edu',
    role: 'student',
    timestamp: '11 Sep 2026 at 09:45 AM',
    ipAddress: '192.168.1.66 (Student Lounge)',
    deviceInfo: 'Edge 128 / Windows 11',
    loginLocation: 'Student Activity Center',
    authMethod: 'Password',
    status: 'Logged Out'
  }
];

export const getLoginHistory = (): LoginHistoryRecord[] =>
  safeGetStorage<LoginHistoryRecord[]>(STORAGE_LOGIN_HISTORY_KEY, DEFAULT_LOGIN_HISTORY);

export const saveLoginHistory = (history: LoginHistoryRecord[]): void =>
  safeSetStorage(STORAGE_LOGIN_HISTORY_KEY, history);

export const recordLoginEvent = (
  params: Omit<LoginHistoryRecord, 'id' | 'timestamp'> & { timestamp?: string; id?: string }
): LoginHistoryRecord => {
  const current = getLoginHistory();
  const now = new Date();
  const timestampStr =
    params.timestamp ||
    now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' at ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const newLog: LoginHistoryRecord = {
    id: params.id || `LOG-2026-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
    userId: params.userId || 'USR-01',
    userName: params.userName || 'User',
    userEmail: params.userEmail || 'user@campushub.edu',
    role: params.role || 'student',
    timestamp: timestampStr,
    ipAddress: params.ipAddress || '192.168.1.100 (Campus Wi-Fi)',
    deviceInfo: params.deviceInfo || 'Chrome 128 / Windows 11',
    loginLocation: params.loginLocation || 'Campus Gateway',
    authMethod: params.authMethod || 'Password',
    status: params.status || 'Active Session'
  };

  const updated = [newLog, ...current].slice(0, 250);
  saveLoginHistory(updated);

  // Update user last active in user accounts table
  try {
    const users = getUserAccounts();
    const cleanEmail = (newLog.userEmail || '').toLowerCase().trim();
    const cleanName = (newLog.userName || '').toLowerCase().trim();
    const cleanId = (newLog.userId || '').toLowerCase().trim();

    const uIdx = users.findIndex(
      (u) =>
        u.email.toLowerCase().trim() === cleanEmail ||
        u.id.toLowerCase().trim() === cleanId ||
        u.name.toLowerCase().trim() === cleanName
    );

    if (uIdx >= 0) {
      users[uIdx].lastActive = 'Just now';
      saveUserAccounts(users);
    } else {
      // Add if new user account
      const newUserAcc: UserAccountItem = {
        id: newLog.userId,
        name: newLog.userName,
        email: newLog.userEmail,
        role: newLog.role,
        status: 'Active',
        lastActive: 'Just now'
      };
      saveUserAccounts([newUserAcc, ...users]);
    }
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campushub_login_history_updated', { detail: newLog }));
    window.dispatchEvent(new Event('storage'));
  }

  return newLog;
};

export const updateLoginSessionStatus = (
  id: string,
  status: 'Active Session' | 'Success' | 'Logged Out' | 'Terminated by Admin'
): void => {
  const current = getLoginHistory();
  const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
  saveLoginHistory(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('campushub_login_history_updated'));
    window.dispatchEvent(new Event('storage'));
  }
};

export const clearLoginHistory = (): void => {
  saveLoginHistory([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('campushub_login_history_updated'));
    window.dispatchEvent(new Event('storage'));
  }
};

export const recordLogoutEvent = (userIdOrEmail?: string): void => {
  if (!userIdOrEmail) return;
  const clean = userIdOrEmail.toLowerCase().trim();
  const current = getLoginHistory();
  let modified = false;
  const updated = current.map((log) => {
    if (
      !modified &&
      (log.userId.toLowerCase().trim() === clean || log.userEmail.toLowerCase().trim() === clean) &&
      (log.status === 'Active Session' || log.status === 'Success')
    ) {
      modified = true;
      return { ...log, status: 'Logged Out' as const };
    }
    return log;
  });
  if (modified) {
    saveLoginHistory(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('campushub_login_history_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  }
};




