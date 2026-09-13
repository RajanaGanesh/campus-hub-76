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
  presentCount?: number;
  absentCount?: number;
  totalClasses?: number;
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
    studentId: '',
    department: 'Computer Science & Engineering',
    yearSection: '1st Year • CSE-A',
    semester: '1st Semester',
    email: '',
    avatarInitials: 'ST'
  },
  stats: [
    { icon: 'fa-user-check', title: 'Attendance', value: '0%', description: 'Overall Attendance', status: 'Active', statusType: 'active', progress: 0, colorVariant: 'primary' },
    { icon: 'fa-award', title: 'CGPA', value: '0.0', description: 'Current CGPA', status: 'Active', statusType: 'active', colorVariant: 'cyan' },
    { icon: 'fa-file-invoice', title: 'Assignments', value: '0', description: 'Pending Assignments', status: 'None', statusType: 'good', colorVariant: 'green' },
    { icon: 'fa-receipt', title: 'Exams', value: '0', description: 'Upcoming Exams', status: 'None', statusType: 'active', colorVariant: 'red' },
    { icon: 'fa-wallet', title: 'Pending Fees', value: '₹0', description: 'Pending Tuition', status: 'Paid', statusType: 'good', colorVariant: 'green' },
    { icon: 'fa-book-open', title: 'Library Books', value: '0', description: 'Books Issued', status: 'None', statusType: 'active', colorVariant: 'cyan' }
  ],
  overallAttendance: 0,
  attendanceSubjects: [],
  performanceHistory: [],
  timetable: [],
  assignments: [],
  exams: [],
  results: [],
  fees: {
    total: 0,
    paid: 0,
    pending: 0,
    dueDate: 'No dues'
  },
  library: {
    issued: 0,
    dueSoonCount: 0,
    overdueCount: 0,
    books: []
  },
  placements: [],
  announcements: [],
  notifications: [],
  activities: []
};
