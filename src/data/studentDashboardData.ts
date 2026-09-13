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
    { icon: 'fa-receipt', title: 'Exams', value: '3', description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
    { icon: 'fa-wallet', title: 'Pending Fees', value: '₹0', description: 'Pending Tuition', status: 'Paid', statusType: 'good', colorVariant: 'green' },
    { icon: 'fa-book-open', title: 'Library Books', value: '2', description: 'Books Issued', status: 'Active', statusType: 'active', colorVariant: 'cyan' }
  ],
  overallAttendance: 86.4,
  presentCount: 216,
  absentCount: 34,
  totalClasses: 250,
  labAttendancePercentage: 88.9,
  labPresentCount: 32,
  labAbsentCount: 4,
  labTotalClasses: 36,
  attendanceSubjects: [
    { name: 'Distributed Systems & Cloud Computing', percentage: 92, status: 'safe' },
    { name: 'Database Management Systems', percentage: 88, status: 'safe' },
    { name: 'Computer Networks & Security', percentage: 84, status: 'safe' },
    { name: 'Artificial Intelligence & Machine Learning', percentage: 80, status: 'safe' },
    { name: 'Systems Programming & Operating Systems', percentage: 76, status: 'warning' },
    { name: 'Distributed Systems & Cloud Lab', percentage: 94, status: 'safe' },
    { name: 'Computer Networks & Security Lab', percentage: 86, status: 'safe' }
  ],
  performanceHistory: [
    { semester: 'Sem 1', cgpa: 8.2 },
    { semester: 'Sem 2', cgpa: 8.4 },
    { semester: 'Sem 3', cgpa: 8.5 },
    { semester: 'Sem 4', cgpa: 8.35 },
    { semester: 'Sem 5', cgpa: 8.7 },
    { semester: 'Sem 6', cgpa: 8.6 },
    { semester: 'Sem 7', cgpa: 8.85 }
  ],
  timetable: [
    { time: '09:00 AM - 10:00 AM', duration: '60 min', subject: 'Distributed Systems & Cloud Computing', room: 'Hall CSE-204', faculty: 'Dr. Sandeep Kumar', isActive: true },
    { time: '10:00 AM - 11:00 AM', duration: '60 min', subject: 'Database Management Systems', room: 'Hall CSE-202', faculty: 'Prof. Rajesh Sharma', isActive: false },
    { time: '11:15 AM - 12:15 PM', duration: '60 min', subject: 'Computer Networks & Security', room: 'Hall CSE-301', faculty: 'Dr. Anita Verma', isActive: false },
    { time: '01:30 PM - 04:30 PM', duration: '3 hours', subject: 'Distributed Systems & Cloud Lab', room: 'Cloud Computing Lab 2', faculty: 'Dr. Sandeep Kumar', isActive: false }
  ],
  assignments: [
    { subject: 'Distributed Systems (CSE-301)', title: 'Distributed Consensus & Raft Protocol Simulation', due: '3 days left', status: 'Pending', priority: 'High' },
    { subject: 'Database Systems (CSE-302)', title: 'Relational Database Normalization & BCNF Design', due: '5 days left', status: 'Pending', priority: 'Medium' },
    { subject: 'Computer Networks (CSE-304)', title: 'TCP Congestion Control & Flow Simulation', due: '7 days left', status: 'Pending', priority: 'Low' },
    { subject: 'Operating Systems (CSE-303)', title: 'Multi-threaded IPC & Kernel Synchronization', due: 'Submitted', status: 'Submitted', priority: 'Medium' }
  ],
  exams: [
    { subject: 'Data Structures & Algorithms (CS301)', date: '18 Sep 2026', time: '10:00 AM', room: 'Hall CSE-204', daysLeft: 5 },
    { subject: 'Database Management Systems (CS302)', date: '21 Sep 2026', time: '10:00 AM', room: 'Hall CSE-202', daysLeft: 8 },
    { subject: 'Computer Networks & Security (CS304)', date: '24 Sep 2026', time: '02:00 PM', room: 'Hall CSE-301', daysLeft: 11 },
    { subject: 'Operating Systems Lab Practical (CS303-L)', date: '28 Sep 2026', time: '09:00 AM', room: 'Systems Lab 2', daysLeft: 15 }
  ],
  results: [
    { subject: 'Distributed Systems & Cloud Computing', internal: 28, external: 64, total: 92, grade: 'A+' },
    { subject: 'Database Management Systems', internal: 26, external: 61, total: 87, grade: 'A' },
    { subject: 'Computer Networks & Security', internal: 25, external: 58, total: 83, grade: 'A' },
    { subject: 'Artificial Intelligence & Machine Learning', internal: 27, external: 63, total: 90, grade: 'A+' },
    { subject: 'Systems Programming & Operating Systems', internal: 24, external: 56, total: 80, grade: 'B+' }
  ],
  fees: {
    total: 85000,
    paid: 85000,
    pending: 0,
    dueDate: 'All dues clear'
  },
  library: {
    issued: 2,
    dueSoonCount: 1,
    overdueCount: 0,
    books: [
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', due: '22 Sep 2026', status: 'active' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'James F. Kurose, Keith W. Ross', due: '16 Sep 2026', status: 'due-soon' }
    ]
  },
  placements: [
    { role: 'Cloud Systems Engineer', company: 'Google India', package: '₹34.0 LPA', eligibility: 'CGPA 8.0+', deadline: '20 Sep' },
    { role: 'Software Development Engineer I', company: 'Microsoft IDC', package: '₹28.5 LPA', eligibility: 'CGPA 7.5+', deadline: '25 Sep' },
    { role: 'Network Infrastructure Specialist', company: 'Cisco Systems', package: '₹22.0 LPA', eligibility: 'CGPA 7.0+', deadline: '30 Sep' },
    { role: 'AI Research Associate', company: 'Amazon AWS', package: '₹32.0 LPA', eligibility: 'CGPA 8.5+', deadline: '05 Oct' }
  ],
  announcements: [
    { title: 'End-Semester Examination Schedule Announced', category: 'Examinations', time: '2 hours ago', desc: 'The comprehensive examination schedule for 8th Semester B.Tech Theory & Lab Practicals has been finalized.' },
    { title: 'Campus Placement Recruitment Drive: Tier-1 Technology Cohort', category: 'Placements', time: '1 day ago', desc: 'Phase 1 recruitment drives for Google, Microsoft, Amazon, and Cisco commence next week. Verify portal details.' },
    { title: 'National Hackathon 2026: Cloud Native & GenAI Challenge', category: 'Events', time: '3 days ago', desc: 'Registrations are open for the 48-Hour Inter-College Hackathon with total prize pool ₹3,00,000.' }
  ],
  notifications: [
    { id: 1, icon: 'fa-file-signature', title: 'Assignment Graded: CNN Image Classification scored 95/100', time: '1 hour ago', unread: true },
    { id: 2, icon: 'fa-calendar-check', title: 'Lab Attendance Recorded: Present for Cloud Systems Lab', time: 'Yesterday', unread: true },
    { id: 3, icon: 'fa-bullhorn', title: 'Exam Hall Tickets are now available for download', time: '2 days ago', unread: false },
    { id: 4, icon: 'fa-book-open', title: 'Library reminder: Due date approaching for Computer Networking', time: '3 days ago', unread: false }
  ],
  activities: [
    { title: 'Assignment Submitted', detail: 'Submitted CS303: Multi-threaded IPC & Kernel Synchronization', time: 'Today, 11:30 AM', icon: 'fa-file-upload' },
    { title: 'Lab Attendance Checked-in', detail: 'Marked Present in Distributed Systems & Cloud Lab', time: 'Yesterday, 02:15 PM', icon: 'fa-fingerprint' },
    { title: 'Exam Hall Ticket Downloaded', detail: 'Downloaded Mid-term hall ticket for 8th Semester', time: '11 Sep, 04:00 PM', icon: 'fa-id-card' },
    { title: 'Library Book Issued', detail: 'Checked out Designing Data-Intensive Applications', time: '08 Sep, 10:45 AM', icon: 'fa-book' }
  ]
};
