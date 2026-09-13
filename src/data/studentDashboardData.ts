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
  labAttendancePercentage?: number;
  labPresentCount?: number;
  labAbsentCount?: number;
  labTotalClasses?: number;
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
    email: 'student@campushub.edu',
    avatarInitials: 'AV'
  },
  stats: [
    { icon: 'fa-user-check', title: 'Attendance', value: '86.4%', description: 'Overall Attendance (32/36 Labs)', status: 'Safe', statusType: 'good', progress: 86.4, colorVariant: 'primary' },
    { icon: 'fa-award', title: 'CGPA', value: '8.65', description: 'Current CGPA', status: 'Excellent', statusType: 'excellent', colorVariant: 'cyan' },
    { icon: 'fa-file-invoice', title: 'Assignments', value: '3', description: 'Pending Assignments', status: 'Due Soon', statusType: 'due', colorVariant: 'green' },
    { icon: 'fa-receipt', title: 'Exams', value: '2', description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
    { icon: 'fa-wallet', title: 'Pending Fees', value: '₹0', description: 'Pending Tuition', status: 'Paid', statusType: 'good', colorVariant: 'green' },
    { icon: 'fa-book-open', title: 'Library Books', value: '2', description: 'Books Issued', status: 'Active', statusType: 'active', colorVariant: 'cyan' }
  ],
  overallAttendance: 86.4,
  presentCount: 216,
  absentCount: 28,
  totalClasses: 250,
  labAttendancePercentage: 88.9,
  labPresentCount: 32,
  labAbsentCount: 4,
  labTotalClasses: 36,
  attendanceSubjects: [],
  performanceHistory: [
    { semester: 'Sem 1', cgpa: 8.2 },
    { semester: 'Sem 2', cgpa: 8.4 },
    { semester: 'Sem 3', cgpa: 8.5 },
    { semester: 'Sem 4', cgpa: 8.3 },
    { semester: 'Sem 5', cgpa: 8.7 },
    { semester: 'Sem 6', cgpa: 8.6 },
    { semester: 'Sem 7', cgpa: 8.8 }
  ],
  timetable: [],
  assignments: [],
  exams: [],
  results: [],
  fees: {
    total: 85000,
    paid: 85000,
    pending: 0,
    dueDate: 'All dues clear'
  },
  library: {
    issued: 2,
    dueSoonCount: 0,
    overdueCount: 0,
    books: []
  },
  placements: [],
  announcements: [],
  notifications: [],
  activities: []
};
