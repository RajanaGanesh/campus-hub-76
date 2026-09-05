export interface StudentRecord {
  id: string; // Roll Number e.g. 236F1A0551
  name: string;
  department: string;
  year: string;
  section: string;
  cgpa: number;
  email: string;
  phone: string;
  status: 'Active' | 'Deactivated';
  attendancePercent: number;
  assignmentsCompleted: number; // e.g. 10 of 12
  performance: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
}

export interface FacultyRecord {
  id: string; // Faculty ID
  name: string;
  department: string;
  designation: string;
  email: string;
  courses: string[]; // Assigned course codes
  status: 'Active' | 'Deactivated';
}

export interface CourseRecord {
  code: string;
  name: string;
  department: string;
  semester: string;
  facultyId: string;
  facultyName: string;
  studentsCount: number;
  status: 'Active' | 'Inactive';
  progress: number; // Course completion percentage e.g. 60
  nextClass: string; // Date or schedule timing
}

export interface ManagementAssignment {
  id: string;
  title: string;
  courseCode: string;
  courseName: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  attachments?: string;
  submissionsCount: number;
}

export interface AssignmentSubmission {
  id: string; // submission-ID
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedDate: string;
  status: 'Submitted' | 'Pending' | 'Late' | 'Graded';
  marks: number | null;
}

export interface ExamMarkRecord {
  studentId: string;
  studentName: string;
  courseCode: string;
  examName: string; // e.g. Midterm 1, Sem End
  internalMarks: number; // max 30
  externalMarks: number; // max 70
}

export interface ManagementAnnouncement {
  id: string;
  title: string;
  message: string;
  publishedBy: string; // e.g. 'Dr. S. Kumar' or 'Admin'
  audience: 'All Students' | 'Faculty' | 'Specific Department' | 'Specific Course' | 'Hostel Students' | 'Transport Users' | 'Placement Applicants';
  targetAudienceDetail?: string; // e.g. 'CSE Department'
  priority: 'Low' | 'Medium' | 'High';
  publishDate: string;
  status: 'Published' | 'Draft';
}

export interface AdminStats {
  totalStudents: number;
  totalFaculty: number;
  activeCourses: number;
  attendanceAverage: number;
  placementRate: number;
  pendingRequests: number;
}

export interface ManagementData {
  students: StudentRecord[];
  faculty: FacultyRecord[];
  courses: CourseRecord[];
  assignments: ManagementAssignment[];
  submissions: AssignmentSubmission[];
  examMarks: ExamMarkRecord[];
  announcements: ManagementAnnouncement[];
}

export const initialManagementData: ManagementData = {
  students: [
    { id: '236F1A0551', name: 'Aditya Sharma', department: 'CSE', year: 'IV Year', section: 'A', cgpa: 8.6, email: 'student@campushub.com', phone: '+91 9876543210', status: 'Active', attendancePercent: 85, assignmentsCompleted: 11, performance: 'Excellent' },
    { id: '236F1A0502', name: 'Arun Kumar', department: 'CSE', year: 'IV Year', section: 'A', cgpa: 8.1, email: 'arun@campushub.com', phone: '+91 9876543202', status: 'Active', attendancePercent: 88, assignmentsCompleted: 10, performance: 'Good' },
    { id: '236F1A0503', name: 'Amit Patel', department: 'CSE', year: 'IV Year', section: 'A', cgpa: 8.3, email: 'amit@campushub.com', phone: '+91 9876543203', status: 'Active', attendancePercent: 91, assignmentsCompleted: 12, performance: 'Excellent' },
    { id: '236F1A0412', name: 'Rahul Kumar', department: 'ECE', year: 'IV Year', section: 'B', cgpa: 7.9, email: 'rahul@campushub.com', phone: '+91 9876543204', status: 'Active', attendancePercent: 80, assignmentsCompleted: 9, performance: 'Average' },
    { id: '236F1A0522', name: 'Priya Reddy', department: 'CSE', year: 'IV Year', section: 'B', cgpa: 8.9, email: 'priya@campushub.com', phone: '+91 9876543205', status: 'Active', attendancePercent: 93, assignmentsCompleted: 12, performance: 'Excellent' }
  ],
  faculty: [
    { id: 'FAC-101', name: 'Dr. S. Kumar', department: 'CSE', designation: 'Professor', email: 'faculty@campushub.com', courses: ['CSE-301', 'CSE-302'], status: 'Active' },
    { id: 'FAC-102', name: 'Prof. A. Bose', department: 'CSE', designation: 'Associate Professor', email: 'bose@campushub.com', courses: ['CSE-303'], status: 'Active' },
    { id: 'FAC-103', name: 'Dr. M. Reddy', department: 'ECE', designation: 'Assistant Professor', email: 'reddy@campushub.com', courses: ['ECE-304'], status: 'Active' }
  ],
  courses: [
    { code: 'CSE-301', name: 'Data Structures & Algorithms', department: 'CSE', semester: '5th Semester', facultyId: 'FAC-101', facultyName: 'Dr. S. Kumar', studentsCount: 60, status: 'Active', progress: 65, nextClass: 'Tuesday 09:00 AM' },
    { code: 'CSE-302', name: 'Database Management Systems', department: 'CSE', semester: '5th Semester', facultyId: 'FAC-101', facultyName: 'Dr. S. Kumar', studentsCount: 58, status: 'Active', progress: 70, nextClass: 'Tuesday 10:30 AM' },
    { code: 'CSE-303', name: 'Computer Networks', department: 'CSE', semester: '5th Semester', facultyId: 'FAC-102', facultyName: 'Prof. A. Bose', studentsCount: 60, status: 'Active', progress: 50, nextClass: 'Wednesday 02:00 PM' },
    { code: 'ECE-304', name: 'Embedded Systems', department: 'ECE', semester: '7th Semester', facultyId: 'FAC-103', facultyName: 'Dr. M. Reddy', studentsCount: 45, status: 'Active', progress: 80, nextClass: 'Monday 11:30 AM' }
  ],
  assignments: [
    { id: 'ASSIGN-101', title: 'Binary Tree Implementation', courseCode: 'CSE-301', courseName: 'Data Structures & Algorithms', description: 'Implement Binary Search Tree traversals (Inorder, Preorder, Postorder) in Java/C++.', dueDate: '2026-08-25', maxMarks: 100, submissionsCount: 4 },
    { id: 'ASSIGN-102', title: 'Normal Form Normalization', courseCode: 'CSE-302', courseName: 'Database Management Systems', description: 'Decompose relation R into 3NF and BCNF according to functional dependencies.', dueDate: '2026-08-28', maxMarks: 50, submissionsCount: 3 }
  ],
  submissions: [
    { id: 'SUB-201', assignmentId: 'ASSIGN-101', studentId: '236F1A0551', studentName: 'Aditya Sharma', submittedDate: '2026-08-16', status: 'Graded', marks: 95 },
    { id: 'SUB-202', assignmentId: 'ASSIGN-101', studentId: '236F1A0502', studentName: 'Arun Kumar', submittedDate: '2026-08-16', status: 'Graded', marks: 88 },
    { id: 'SUB-203', assignmentId: 'ASSIGN-101', studentId: '236F1A0503', studentName: 'Amit Patel', submittedDate: '2026-08-16', status: 'Submitted', marks: null },
    { id: 'SUB-204', assignmentId: 'ASSIGN-101', studentId: '236F1A0522', studentName: 'Priya Reddy', submittedDate: '2026-08-17', status: 'Submitted', marks: null },
    
    { id: 'SUB-205', assignmentId: 'ASSIGN-102', studentId: '236F1A0551', studentName: 'Aditya Sharma', submittedDate: '2026-08-16', status: 'Graded', marks: 45 },
    { id: 'SUB-206', assignmentId: 'ASSIGN-102', studentId: '236F1A0502', studentName: 'Arun Kumar', submittedDate: '2026-08-16', status: 'Submitted', marks: null },
    { id: 'SUB-207', assignmentId: 'ASSIGN-102', studentId: '236F1A0503', studentName: 'Amit Patel', submittedDate: '2026-08-16', status: 'Submitted', marks: null }
  ],
  examMarks: [
    { studentId: '236F1A0551', studentName: 'Aditya Sharma', courseCode: 'CSE-301', examName: 'Midterm 1', internalMarks: 26, externalMarks: 58 },
    { studentId: '236F1A0551', studentName: 'Aditya Sharma', courseCode: 'CSE-302', examName: 'Midterm 1', internalMarks: 28, externalMarks: 62 },
    { studentId: '236F1A0502', studentName: 'Arun Kumar', courseCode: 'CSE-301', examName: 'Midterm 1', internalMarks: 22, externalMarks: 52 },
    { studentId: '236F1A0503', studentName: 'Amit Patel', courseCode: 'CSE-301', examName: 'Midterm 1', internalMarks: 25, externalMarks: 60 }
  ],
  announcements: [
    { id: 'ANN-101', title: 'End-Sem Lab Exam Schedules', message: 'The end semester practical labs exams are scheduled from 24th Aug to 30th Aug. Ensure record validation.', publishedBy: 'Admin', audience: 'All Students', priority: 'High', publishDate: '15 Aug 2026', status: 'Published' },
    { id: 'ANN-102', title: 'Midterm Marks Upload Deadline', message: 'All faculty members must complete upload of Midterm 1 marks in portal before 22nd Aug.', publishedBy: 'Admin', audience: 'Faculty', priority: 'Medium', publishDate: '14 Aug 2026', status: 'Published' },
    { id: 'ANN-103', title: 'DS Guest Lecture Seminar', message: 'A guest lecture on Graph Database optimization will take place in Seminar Hall A at 10:00 AM tomorrow.', publishedBy: 'Dr. S. Kumar', audience: 'Specific Course', targetAudienceDetail: 'CSE-301', priority: 'Low', publishDate: '16 Aug 2026', status: 'Published' }
  ]
};

export const getManagementData = (): ManagementData => {
  try {
    const stored = localStorage.getItem('campushub_management_data');
    if (!stored) return initialManagementData;
    const parsed = JSON.parse(stored);
    return {
      students: Array.isArray(parsed.students) ? parsed.students : initialManagementData.students,
      faculty: Array.isArray(parsed.faculty) ? parsed.faculty : initialManagementData.faculty,
      courses: Array.isArray(parsed.courses) ? parsed.courses : initialManagementData.courses,
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : initialManagementData.assignments,
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : initialManagementData.submissions,
      examMarks: Array.isArray(parsed.examMarks) ? parsed.examMarks : initialManagementData.examMarks,
      announcements: Array.isArray(parsed.announcements) ? parsed.announcements : initialManagementData.announcements
    };
  } catch {
    return initialManagementData;
  }
};

export const saveManagementData = (data: ManagementData) => {
  try {
    localStorage.setItem('campushub_management_data', JSON.stringify(data));
  } catch (err) {
    console.warn('Error saving management data:', err);
  }
};

