export interface StudentProfile {
  studentId: string;
  department: string;
  yearSection: string;
  semester: string;
  email: string;
  avatarInitials: string;
}

export interface StatItem {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  status: string;
  statusType: 'good' | 'excellent' | 'due' | 'active';
  progress?: number;
  colorVariant: 'primary' | 'cyan' | 'green' | 'red';
}

export interface AttendanceSubject {
  name: string;
  percentage: number;
  status: 'safe' | 'warning' | 'critical' | 'danger';
}

export interface PerformanceSem {
  semester: string;
  cgpa: number;
}

export interface TimetableClass {
  time: string;
  duration: string;
  subject: string;
  room: string;
  faculty: string;
  isActive: boolean;
}

export interface PendingAssignment {
  subject: string;
  title: string;
  due: string;
  status: 'Pending' | 'Due Soon' | 'Submitted' | 'Late';
  priority: 'High' | 'Medium' | 'Low';
}

export interface UpcomingExam {
  subject: string;
  date: string;
  time: string;
  room: string;
  daysLeft: number;
}

export interface ExamResult {
  subject: string;
  internal: number;
  external: number;
  total: number;
  grade: string;
}

export interface LibraryBook {
  title: string;
  author: string;
  due: string;
  status: 'active' | 'due-soon' | 'overdue';
}

export interface PlacementOpportunity {
  role: string;
  company: string;
  package: string;
  eligibility: string;
  deadline: string;
}

export interface AnnouncementItem {
  title: string;
  category: string;
  time: string;
  desc: string;
}

export interface NotificationItem {
  id: number;
  icon: string;
  title: string;
  time: string;
  unread: boolean;
}

export interface ActivityEvent {
  title: string;
  detail: string;
  time: string;
  icon: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  stats: StatItem[];
  overallAttendance: number;
  attendanceSubjects: AttendanceSubject[];
  performanceHistory: PerformanceSem[];
  timetable: TimetableClass[];
  assignments: PendingAssignment[];
  exams: UpcomingExam[];
  results: ExamResult[];
  fees: {
    total: number;
    paid: number;
    pending: number;
    dueDate: string;
  };
  library: {
    issued: number;
    dueSoonCount: number;
    overdueCount: number;
    books: LibraryBook[];
  };
  placements: PlacementOpportunity[];
  announcements: AnnouncementItem[];
  notifications: NotificationItem[];
  activities: ActivityEvent[];
}

export const studentDashboardData: StudentDashboardData = {
  profile: {
    studentId: '236F1A0551',
    department: 'Computer Science & Engineering',
    yearSection: 'IV Year • CSE-A',
    semester: '8th Semester',
    email: 'student@campushub.com',
    avatarInitials: 'AS'
  },
  stats: [
    { icon: 'fa-user-check', title: 'Attendance', value: '86%', description: 'Overall Attendance', status: 'Good', statusType: 'good', progress: 86, colorVariant: 'primary' },
    { icon: 'fa-award', title: 'CGPA', value: '8.6', description: 'Current CGPA', status: 'Excellent', statusType: 'excellent', colorVariant: 'cyan' },
    { icon: 'fa-file-invoice', title: 'Assignments', value: '4', description: 'Pending Assignments', status: 'Due Soon', statusType: 'due', colorVariant: 'green' },
    { icon: 'fa-receipt', title: 'Exams', value: '3', description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
    { icon: 'fa-wallet', title: 'Pending Fees', value: '₹12,500', description: 'Pending Tuition', status: 'Due Soon', statusType: 'due', colorVariant: 'red' },
    { icon: 'fa-book-open', title: 'Library Books', value: '3', description: 'Books Issued', status: 'Active', statusType: 'active', colorVariant: 'cyan' }
  ],
  overallAttendance: 86,
  attendanceSubjects: [
    { name: 'Data Structures', percentage: 92, status: 'safe' },
    { name: 'Database Management', percentage: 88, status: 'safe' },
    { name: 'Computer Networks', percentage: 76, status: 'warning' },
    { name: 'Operating Systems', percentage: 84, status: 'safe' },
    { name: 'Software Engineering', percentage: 90, status: 'safe' }
  ],
  performanceHistory: [
    { semester: 'Semester 1', cgpa: 7.2 },
    { semester: 'Semester 2', cgpa: 7.5 },
    { semester: 'Semester 3', cgpa: 7.8 },
    { semester: 'Semester 4', cgpa: 8.0 },
    { semester: 'Semester 5', cgpa: 8.3 },
    { semester: 'Semester 6', cgpa: 8.5 },
    { semester: 'Current Sem', cgpa: 8.6 }
  ],
  timetable: [
    { time: '09:00 AM', duration: '1h', subject: 'Data Structures (CS301)', room: 'Room: CSE-204', faculty: 'Dr. Kumar', isActive: false },
    { time: '10:00 AM', duration: '1.5h', subject: 'Database Management (CS302)', room: 'Room: CSE-202', faculty: 'Prof. Priya', isActive: true },
    { time: '11:30 AM', duration: '1h', subject: 'Computer Networks (CS304)', room: 'Room: CSE-301', faculty: 'Prof. Ravi', isActive: false },
    { time: '01:30 PM', duration: '1h', subject: 'Operating Systems (CS303)', room: 'Room: CSE-205', faculty: 'Dr. Anitha', isActive: false },
    { time: '03:00 PM', duration: '1h', subject: 'Software Engineering (CS305)', room: 'Room: CSE-204', faculty: 'Prof. Suresh', isActive: false }
  ],
  assignments: [
    { subject: 'Database Management', title: 'ER Diagram & Normalization', due: 'Tomorrow', status: 'Due Soon', priority: 'High' },
    { subject: 'Computer Networks', title: 'TCP/IP Assignment', due: '25 Aug', status: 'Pending', priority: 'Medium' },
    { subject: 'Software Engineering', title: 'SRS Documentation', due: '28 Aug', status: 'Pending', priority: 'Low' },
    { subject: 'Operating Systems', title: 'Process Scheduling', due: '30 Aug', status: 'Pending', priority: 'Medium' }
  ],
  exams: [
    { subject: 'Data Structures', date: '25 Aug 2026', time: '10:00 AM', room: 'Room CSE-204', daysLeft: 9 },
    { subject: 'Database Management', date: '28 Aug 2026', time: '10:00 AM', room: 'Room CSE-202', daysLeft: 12 },
    { subject: 'Computer Networks', date: '30 Aug 2026', time: '02:00 PM', room: 'Room CSE-301', daysLeft: 14 }
  ],
  results: [
    { subject: 'Data Structures', internal: 28, external: 62, total: 90, grade: 'A+' },
    { subject: 'Database Management', internal: 26, external: 58, total: 84, grade: 'A' },
    { subject: 'Computer Networks', internal: 25, external: 55, total: 80, grade: 'A' },
    { subject: 'Operating Systems', internal: 27, external: 57, total: 84, grade: 'A' }
  ],
  fees: {
    total: 85000,
    paid: 72500,
    pending: 12500,
    dueDate: '30 Aug 2026'
  },
  library: {
    issued: 3,
    dueSoonCount: 1,
    overdueCount: 0,
    books: [
      { title: 'Clean Code', author: 'Robert C. Martin', due: '28 Aug 2026', status: 'due-soon' },
      { title: 'Database System Concepts', author: 'Silberschatz', due: '02 Sep 2026', status: 'active' },
      { title: 'Computer Networks', author: 'Tanenbaum', due: '10 Sep 2026', status: 'active' }
    ]
  },
  placements: [
    { role: 'Software Developer', company: 'TechNova', package: '₹8 LPA', eligibility: 'CGPA 7.5+', deadline: '30 Aug' },
    { role: 'Graduate Engineer Trainee', company: 'CloudCore', package: '₹6.5 LPA', eligibility: 'CSE / IT', deadline: '02 Sep' },
    { role: 'Frontend Developer', company: 'WebSphere', package: '₹7 LPA', eligibility: 'React / JavaScript', deadline: '05 Sep' }
  ],
  announcements: [
    { title: 'Semester Examination Timetable Released', category: 'Academic', time: '2 hours ago', desc: 'The complete mid-semester exam timetable is now live. Students can download schedules from the examinations catalog.' },
    { title: 'Campus Recruitment Drive Registration Open', category: 'Placement', time: '5 hours ago', desc: 'Microsoft and Amazon registration portals close this weekend. Please update resumes and confirm registration eligibility.' },
    { title: 'Technical Fest Registration Started', category: 'Events', time: 'Yesterday', desc: 'Registrations for the national-level college technical fest are open. Sign up for coding and design events.' },
    { title: 'Library Working Hours Extended', category: 'Library', time: 'Yesterday', desc: 'To support exam preparations, library study halls will operate under extended timings from August 15 onwards.' }
  ],
  notifications: [
    { id: 1, icon: 'fa-user-check', title: 'Attendance dropped below 80% in Computer Networks.', time: '10m ago', unread: true },
    { id: 2, icon: 'fa-file-invoice', title: 'New assignment posted for Database Management.', time: '2h ago', unread: true },
    { id: 3, icon: 'fa-briefcase', title: 'Placement drive registration closes tomorrow.', time: '1d ago', unread: true },
    { id: 4, icon: 'fa-receipt', title: 'Exam timetable has been updated.', time: '2d ago', unread: false }
  ],
  activities: [
    { title: 'Assignment submitted', detail: 'Database Management assignment uploaded.', time: '2 hours ago', icon: 'fa-file-circle-check' },
    { title: 'Exam timetable updated', detail: 'Seating slots updated for Computer Science subjects.', time: '1 PM', icon: 'fa-calendar-day' },
    { title: 'New placement drive added', detail: 'TechNova hiring registration is now active.', time: 'Yesterday', icon: 'fa-briefcase' },
    { title: 'Library book issued', detail: '"Clean Code" issued by Aditya Sharma.', time: 'Yesterday', icon: 'fa-book' }
  ]
};
