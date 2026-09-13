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
  facultyName?: string;
  priority?: 'High' | 'Medium' | 'Low';
  instructions?: string;
  createdDate?: string;
}

export interface AssignmentSubmission {
  id: string; // submission-ID
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedDate: string;
  status: 'Submitted' | 'Pending' | 'Late' | 'Graded';
  marks: number | null;
  fileName?: string;
  fileUrl?: string;
  comments?: string;
  feedback?: string;
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

export interface LabRecord {
  id: string; // e.g. LAB-101
  code: string; // e.g. CSE-301L
  name: string; // e.g. Distributed Systems & Cloud Lab
  courseCode: string; // parent course e.g. CSE-301
  courseName: string;
  department: string;
  semester: string;
  facultyId: string;
  facultyName: string;
  labRoom: string; // e.g. CS Lab 2 (Cloud Systems Hub)
  batch: string; // e.g. 'Batch A (Roll 1-30)', 'Batch B (Roll 31-60)', 'All Batches'
  scheduleDay: string; // e.g. 'Tuesday'
  scheduleTime: string; // e.g. '02:00 PM - 04:30 PM'
  studentsCount: number;
  status: 'Active' | 'Inactive';
}

export interface LabSessionRecord {
  id: string;
  labId: string;
  labCode: string;
  labName: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  date: string; // '2026-09-13'
  day: string; // 'Tuesday'
  batch: string;
  labRoom: string;
  experimentTitle: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendancePct: number;
  records: {
    studentId: string;
    studentName: string;
    workstationNo: string;
    status: 'Present' | 'Absent' | 'Late' | 'On-Duty';
    marks?: number;
    remarks?: string;
  }[];
  timestamp: string;
}

export interface ManagementData {
  students: StudentRecord[];
  faculty: FacultyRecord[];
  courses: CourseRecord[];
  labs?: LabRecord[];
  assignments: ManagementAssignment[];
  submissions: AssignmentSubmission[];
  examMarks: ExamMarkRecord[];
  announcements: ManagementAnnouncement[];
}

export const initialManagementData: ManagementData = {
  students: [
    {
      id: '236F1A0551',
      name: 'Alex Vance',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 8.65,
      email: 'student@campushub.edu',
      phone: '+91 98765 43210',
      status: 'Active',
      attendancePercent: 88,
      assignmentsCompleted: 10,
      performance: 'Excellent'
    },
    {
      id: '236F1A0501',
      name: 'Aarav Sharma',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 8.92,
      email: 'aarav.s@campushub.edu',
      phone: '+91 98765 43201',
      status: 'Active',
      attendancePercent: 92,
      assignmentsCompleted: 11,
      performance: 'Excellent'
    },
    {
      id: '236F1A0502',
      name: 'Ananya Iyer',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 9.15,
      email: 'ananya.i@campushub.edu',
      phone: '+91 98765 43202',
      status: 'Active',
      attendancePercent: 95,
      assignmentsCompleted: 12,
      performance: 'Excellent'
    },
    {
      id: '236F1A0503',
      name: 'Rohan Patel',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 7.84,
      email: 'rohan.p@campushub.edu',
      phone: '+91 98765 43203',
      status: 'Active',
      attendancePercent: 71,
      assignmentsCompleted: 8,
      performance: 'Needs Improvement'
    },
    {
      id: '236F1A0504',
      name: 'Sneha Reddy',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 8.45,
      email: 'sneha.r@campushub.edu',
      phone: '+91 98765 43204',
      status: 'Active',
      attendancePercent: 84,
      assignmentsCompleted: 9,
      performance: 'Good'
    },
    {
      id: '236F1A0505',
      name: 'Vikramaditya Rao',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'A',
      cgpa: 7.20,
      email: 'vikram.r@campushub.edu',
      phone: '+91 98765 43205',
      status: 'Active',
      attendancePercent: 68,
      assignmentsCompleted: 7,
      performance: 'Needs Improvement'
    },
    {
      id: '236F1A0506',
      name: 'Pooja Hegde',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'B',
      cgpa: 8.70,
      email: 'pooja.h@campushub.edu',
      phone: '+91 98765 43206',
      status: 'Active',
      attendancePercent: 89,
      assignmentsCompleted: 10,
      performance: 'Excellent'
    },
    {
      id: '236F1A0507',
      name: 'Karthik Menon',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'B',
      cgpa: 8.10,
      email: 'karthik.m@campushub.edu',
      phone: '+91 98765 43207',
      status: 'Active',
      attendancePercent: 82,
      assignmentsCompleted: 9,
      performance: 'Good'
    },
    {
      id: '236F1A0508',
      name: 'Divya Nair',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'B',
      cgpa: 9.30,
      email: 'divya.n@campushub.edu',
      phone: '+91 98765 43208',
      status: 'Active',
      attendancePercent: 96,
      assignmentsCompleted: 12,
      performance: 'Excellent'
    },
    {
      id: '236F1A0509',
      name: 'Rahul Verma',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'B',
      cgpa: 7.15,
      email: 'rahul.v@campushub.edu',
      phone: '+91 98765 43209',
      status: 'Active',
      attendancePercent: 64,
      assignmentsCompleted: 6,
      performance: 'Needs Improvement'
    },
    {
      id: '236F1A0510',
      name: 'Meera Joshi',
      department: 'Computer Science & Engineering',
      year: 'IV Year',
      section: 'B',
      cgpa: 8.55,
      email: 'meera.j@campushub.edu',
      phone: '+91 98765 43210',
      status: 'Active',
      attendancePercent: 87,
      assignmentsCompleted: 10,
      performance: 'Good'
    }
  ],
  faculty: [
    {
      id: 'FAC-101',
      name: 'Dr. Sandeep Kumar',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      email: 'sandeepsgec@gmail.com',
      courses: ['CSE-301', 'CSE-304'],
      status: 'Active'
    },
    {
      id: 'FAC-102',
      name: 'Dr. Rajesh Varma',
      department: 'Computer Science & Engineering',
      designation: 'Professor',
      email: 'rajesh.varma@campushub.edu',
      courses: ['CSE-301'],
      status: 'Active'
    },
    {
      id: 'FAC-103',
      name: 'Prof. Ananya Sen',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      email: 'ananya.sen@campushub.edu',
      courses: ['CSE-302'],
      status: 'Active'
    },
    {
      id: 'FAC-104',
      name: 'Dr. Elena Rostova',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      email: 'faculty@campushub.edu',
      courses: ['CSE-303'],
      status: 'Active'
    },
    {
      id: 'FAC-105',
      name: 'Dr. Suresh Kumar',
      department: 'Computer Science & Engineering',
      designation: 'Professor & HOD',
      email: 'suresh.kumar@campushub.edu',
      courses: ['CSE-303'],
      status: 'Active'
    },
    {
      id: 'FAC-106',
      name: 'Prof. Vikram Malhotra',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      email: 'vikram.m@campushub.edu',
      courses: ['CSE-304'],
      status: 'Active'
    },
    {
      id: 'FAC-107',
      name: 'Dr. Priya Murthy',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      email: 'priya.m@campushub.edu',
      courses: ['CSE-305'],
      status: 'Active'
    }
  ],
  courses: [
    {
      code: 'CSE-301',
      name: 'Distributed Systems & Cloud Architecture',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-101',
      facultyName: 'Dr. Sandeep Kumar',
      studentsCount: 60,
      status: 'Active',
      progress: 65,
      nextClass: 'Mon, Wed 09:00 AM'
    },
    {
      code: 'CSE-302',
      name: 'Machine Learning & Neural Networks',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-103',
      facultyName: 'Prof. Ananya Sen',
      studentsCount: 60,
      status: 'Active',
      progress: 58,
      nextClass: 'Tue, Thu 10:00 AM'
    },
    {
      code: 'CSE-303',
      name: 'Information & Network Security',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-105',
      facultyName: 'Dr. Suresh Kumar',
      studentsCount: 60,
      status: 'Active',
      progress: 70,
      nextClass: 'Mon, Fri 11:15 AM'
    },
    {
      code: 'CSE-304',
      name: 'Full Stack Cloud Native Development',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-101',
      facultyName: 'Dr. Sandeep Kumar',
      studentsCount: 60,
      status: 'Active',
      progress: 60,
      nextClass: 'Tue, Thu 02:00 PM'
    },
    {
      code: 'CSE-305',
      name: 'Natural Language Processing & LLMs',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-107',
      facultyName: 'Dr. Priya Murthy',
      studentsCount: 60,
      status: 'Active',
      progress: 52,
      nextClass: 'Wed, Fri 02:00 PM'
    }
  ],
  labs: [
    {
      id: 'LAB-101',
      code: 'CSE-301L',
      name: 'Distributed Systems & Cloud Computing Lab',
      courseCode: 'CSE-301',
      courseName: 'Distributed Systems & Cloud Architecture',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-101',
      facultyName: 'Dr. Sandeep Kumar',
      labRoom: 'CS Lab 2 (Cloud & Network Systems)',
      batch: 'Batch A (Roll 1-30)',
      scheduleDay: 'Tuesday',
      scheduleTime: '02:00 PM - 04:30 PM',
      studentsCount: 30,
      status: 'Active'
    },
    {
      id: 'LAB-102',
      code: 'CSE-302L',
      name: 'Neural Networks & Deep Learning Lab',
      courseCode: 'CSE-302',
      courseName: 'Machine Learning & Neural Networks',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-103',
      facultyName: 'Prof. Ananya Sen',
      labRoom: 'AI & Data Science Lab 1',
      batch: 'Batch B (Roll 31-60)',
      scheduleDay: 'Thursday',
      scheduleTime: '02:00 PM - 04:30 PM',
      studentsCount: 30,
      status: 'Active'
    },
    {
      id: 'LAB-103',
      code: 'CSE-304L',
      name: 'Full Stack Cloud Native Practical Lab',
      courseCode: 'CSE-304',
      courseName: 'Full Stack Cloud Native Development',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-101',
      facultyName: 'Dr. Sandeep Kumar',
      labRoom: 'Web Development & Cloud Lab 4',
      batch: 'Batch A (Roll 1-30)',
      scheduleDay: 'Wednesday',
      scheduleTime: '02:00 PM - 04:30 PM',
      studentsCount: 30,
      status: 'Active'
    },
    {
      id: 'LAB-104',
      code: 'CSE-303L',
      name: 'Network Security & Cryptography Lab',
      courseCode: 'CSE-303',
      courseName: 'Information & Network Security',
      department: 'Computer Science & Engineering',
      semester: '5th Semester',
      facultyId: 'FAC-105',
      facultyName: 'Dr. Suresh Kumar',
      labRoom: 'Cybersecurity Research Center',
      batch: 'All Batches',
      scheduleDay: 'Friday',
      scheduleTime: '02:00 PM - 04:30 PM',
      studentsCount: 60,
      status: 'Active'
    }
  ],
  assignments: [
    {
      id: 'asg-101',
      title: 'Distributed Cloud Architecture & gRPC Microservices',
      courseCode: 'CSE-301',
      courseName: 'Distributed Systems & Cloud Architecture',
      facultyName: 'Dr. Sandeep Kumar',
      dueDate: '2026-09-24',
      createdDate: '10 Sep 2026',
      maxMarks: 100,
      priority: 'High',
      submissionsCount: 42,
      description: 'Design and deploy high-throughput distributed microservices using gRPC, Protocol Buffers, and Docker Compose with circuit breaking and client-side load balancing.',
      instructions: 'Submit a PDF report detailing service architecture, protobuf schemas, benchmarking latency graphs, and GitHub repository link.'
    },
    {
      id: 'asg-102',
      title: 'Deep Neural Network Architecture & MNIST Classifier',
      courseCode: 'CSE-302',
      courseName: 'Machine Learning & Neural Networks',
      facultyName: 'Prof. Ananya Sen',
      dueDate: '2026-09-28',
      createdDate: '12 Sep 2026',
      maxMarks: 100,
      priority: 'High',
      submissionsCount: 38,
      description: 'Implement a multi-layer perceptron from scratch in Python/NumPy with custom forward pass, backpropagation, and cross-entropy loss functions on the MNIST dataset.',
      instructions: 'Upload a Jupyter Notebook (.ipynb) containing mathematical derivations, convergence loss curves, confusion matrix, and accuracy analysis.'
    },
    {
      id: 'asg-103',
      title: 'Cryptographic Protocols & Public Key Infrastructure Audit',
      courseCode: 'CSE-303',
      courseName: 'Information & Network Security',
      facultyName: 'Dr. Suresh Kumar',
      dueDate: '2026-10-04',
      createdDate: '08 Sep 2026',
      maxMarks: 100,
      priority: 'Medium',
      submissionsCount: 51,
      description: 'Perform a comprehensive security audit of asymmetric RSA-2048 key exchange, SHA-256 integrity checks, and TLS 1.3 certificate validation handshakes.',
      instructions: 'Submit Wireshark packet capture analysis (.pcapng) along with a vulnerability assessment documentation in PDF format.'
    },
    {
      id: 'asg-104',
      title: 'Full Stack Cloud Native Application with Kubernetes Deployment',
      courseCode: 'CSE-304',
      courseName: 'Full Stack Cloud Native Development',
      facultyName: 'Dr. Sandeep Kumar',
      dueDate: '2026-10-10',
      createdDate: '05 Sep 2026',
      maxMarks: 100,
      priority: 'Medium',
      submissionsCount: 48,
      description: 'Construct a multi-tier web application using React, Node.js, and PostgreSQL. Containerize all layers and write Kubernetes manifests with Ingress controllers and autoscaling.',
      instructions: 'Submit Kubernetes YAML manifest files, deployment screenshots, and live application access endpoints.'
    },
    {
      id: 'asg-105',
      title: 'Transformer Attention Mechanism & BERT Sentiment Fine-Tuning',
      courseCode: 'CSE-305',
      courseName: 'Natural Language Processing & LLMs',
      facultyName: 'Dr. Priya Murthy',
      dueDate: '2026-10-18',
      createdDate: '14 Sep 2026',
      maxMarks: 100,
      priority: 'Low',
      submissionsCount: 29,
      description: 'Implement scaled dot-product multi-head attention and fine-tune a pre-trained BERT/DistilBERT model for multi-class domain sentiment classification.',
      instructions: 'Submit Python source code with training loss logs, hyperparameter tuning tables, and validation F1-score report.'
    }
  ],
  submissions: [
    {
      id: 'sub-101',
      assignmentId: 'asg-101',
      studentId: '236F1A0551',
      studentName: 'Alex Vance',
      submittedDate: '2026-09-11',
      status: 'Graded',
      marks: 95,
      fileName: 'Distributed_Systems_gRPC_Report_AlexVance.pdf',
      comments: 'All 4 microservices deployed and verified with load balancing.',
      feedback: 'Outstanding architectural design, clean protocol buffer definitions, and comprehensive latency benchmarking graphs.'
    },
    {
      id: 'sub-102',
      assignmentId: 'asg-102',
      studentId: '236F1A0551',
      studentName: 'Alex Vance',
      submittedDate: '2026-09-13',
      status: 'Submitted',
      marks: null,
      fileName: 'Neural_Network_MNIST_Scratch_AlexVance.ipynb',
      comments: 'Backpropagation implemented from scratch. Achieved 98.2% test accuracy.',
      feedback: 'Submission received successfully. Evaluation in progress.'
    },
    {
      id: 'sub-104',
      assignmentId: 'asg-104',
      studentId: '236F1A0551',
      studentName: 'Alex Vance',
      submittedDate: '2026-09-09',
      status: 'Graded',
      marks: 92,
      fileName: 'K8s_FullStack_Deployment_AlexVance.zip',
      comments: 'Minikube cluster deployment with Ingress NGINX controller and PVC.',
      feedback: 'Great work! Manifests follow best practices with proper readiness and liveness probes.'
    }
  ],
  examMarks: [
    { studentId: '236F1A0551', studentName: 'Alex Vance', courseCode: 'CSE-301', examName: 'Midterm 1', internalMarks: 28, externalMarks: 64 },
    { studentId: '236F1A0551', studentName: 'Alex Vance', courseCode: 'CSE-302', examName: 'Midterm 1', internalMarks: 29, externalMarks: 66 },
    { studentId: '236F1A0551', studentName: 'Alex Vance', courseCode: 'CSE-303', examName: 'Midterm 1', internalMarks: 27, externalMarks: 59 },
    { studentId: '236F1A0551', studentName: 'Alex Vance', courseCode: 'CSE-304', examName: 'Midterm 1', internalMarks: 28, externalMarks: 65 },
    { studentId: '236F1A0551', studentName: 'Alex Vance', courseCode: 'CSE-305', examName: 'Midterm 1', internalMarks: 26, externalMarks: 61 }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'End Semester Examination Schedule & Admit Card Distribution',
      message: 'Admit cards for Winter 2026 End Semester Theory and Practical Examinations are now available for download. Please verify your registered course codes and examination hall allocations.',
      publishedBy: 'Controller of Examinations',
      audience: 'All Students',
      priority: 'High',
      publishDate: '12 Sep 2026',
      status: 'Published'
    },
    {
      id: 'ann-2',
      title: 'Campus Placement Recruitment Drive: Tier-1 Technology Cohort',
      message: 'Phase 1 Campus Recruitment Drives for Google, Microsoft, Amazon, and Cisco commence next week. All eligible students with CGPA >= 7.5 are requested to verify their placement portal profiles.',
      publishedBy: 'Career Placement & Training Cell',
      audience: 'All Students',
      priority: 'High',
      publishDate: '10 Sep 2026',
      status: 'Published'
    },
    {
      id: 'ann-3',
      title: 'National Hackathon 2026: Cloud Native & GenAI Challenge',
      message: 'Registrations are open for the 48-Hour Inter-College Hackathon. Teams can register up to 4 members. Total prize pool ₹3,00,000 with industry mentorship from top tech leaders.',
      publishedBy: 'Department of Computer Science',
      audience: 'All Students',
      priority: 'Medium',
      publishDate: '08 Sep 2026',
      status: 'Published'
    }
  ]
};

export const getManagementData = (): ManagementData => {
  try {
    const stored = localStorage.getItem('campushub_management_data');
    if (!stored) {
      try {
        localStorage.setItem('campushub_management_data', JSON.stringify(initialManagementData));
      } catch {}
      return initialManagementData;
    }
    const parsed = JSON.parse(stored);

    const rawAssignments: ManagementAssignment[] = Array.isArray(parsed.assignments) && parsed.assignments.length > 0
      ? parsed.assignments
      : initialManagementData.assignments;
    const mergedAssignments = rawAssignments;

    const rawSubmissions: AssignmentSubmission[] = Array.isArray(parsed.submissions) && parsed.submissions.length > 0
      ? parsed.submissions
      : initialManagementData.submissions;
    const mergedSubmissions = rawSubmissions;

    const rawStudents: StudentRecord[] = Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : initialManagementData.students;
    const storedStudents = rawStudents;

    // Compute up-to-date assignmentsCompleted for each student from stored submissions
    const mergedStudents = storedStudents.map((stu) => {
      const sId = (stu.id || '').toLowerCase().trim();
      const sName = (stu.name || '').toLowerCase().trim();
      const sEmail = (stu.email || '').toLowerCase().trim();

      const studentSubs = mergedSubmissions.filter((sub) => {
        const subStuId = (sub.studentId || '').toLowerCase().trim();
        const subStuName = (sub.studentName || '').toLowerCase().trim();
        const matches =
          subStuId === sId ||
          subStuName === sName ||
          subStuId === sEmail ||
          (sName.length >= 3 && subStuName.includes(sName)) ||
          (subStuId.length >= 4 && sId.includes(subStuId));
        return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
      });

      return {
        ...stu,
        assignmentsCompleted: studentSubs.length
      };
    });

    const rawFacultyList: FacultyRecord[] = Array.isArray(parsed.faculty) && parsed.faculty.length > 0 ? parsed.faculty : initialManagementData.faculty;
    
    // Ensure sandeepsgec@gmail.com is in faculty list
    if (!rawFacultyList.some(f => (f.email || '').toLowerCase() === 'sandeepsgec@gmail.com')) {
      rawFacultyList.unshift({
        id: 'FAC-101',
        name: 'Dr. Sandeep Kumar',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        email: 'sandeepsgec@gmail.com',
        courses: ['CSE-301', 'CSE-304'],
        status: 'Active'
      });
    }

    const rawFaculty = rawFacultyList;

    const rawCoursesList: CourseRecord[] = Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : initialManagementData.courses;
    const rawCourses = rawCoursesList;

    // Cross-synchronize faculty courses and courses list
    const syncedCourses = [...rawCourses];
    const syncedFaculty = rawFaculty.map((fac) => {
      const assignedCodes = new Set(fac.courses || []);

      // 1. Any course in courses table assigned to this faculty
      syncedCourses.forEach((c) => {
        if (
          (c.facultyId && c.facultyId.toLowerCase() === fac.id.toLowerCase()) ||
          (c.facultyName && c.facultyName.toLowerCase() === fac.name.toLowerCase())
        ) {
          assignedCodes.add(c.code);
        }
      });

      // 2. Any course in faculty.courses that does not exist in courses table -> synthesize it
      Array.from(assignedCodes).forEach((code) => {
        const exists = syncedCourses.some((c) => c.code.toUpperCase() === code.toUpperCase());
        if (!exists) {
          syncedCourses.push({
            code: code.toUpperCase(),
            name: `${code.toUpperCase()} Course`,
            department: fac.department || 'Computer Science & Engineering',
            semester: '5th Semester',
            facultyId: fac.id,
            facultyName: fac.name,
            studentsCount: 60,
            status: 'Active',
            progress: 0,
            nextClass: 'Mon, Wed 09:00 AM'
          });
        }
      });

      return {
        ...fac,
        courses: Array.from(assignedCodes)
      };
    });

    const rawExamMarks: ExamMarkRecord[] = Array.isArray(parsed.examMarks) && parsed.examMarks.length > 0
      ? parsed.examMarks
      : initialManagementData.examMarks;
    const mergedExamMarks = rawExamMarks;

    const rawAnnouncements: ManagementAnnouncement[] = Array.isArray(parsed.announcements) && parsed.announcements.length > 0
      ? parsed.announcements
      : initialManagementData.announcements;
    const mergedAnnouncements = rawAnnouncements;

    const rawLabs: LabRecord[] = Array.isArray(parsed.labs) && parsed.labs.length > 0 ? parsed.labs : (initialManagementData.labs || []);

    return {
      students: mergedStudents,
      faculty: syncedFaculty,
      courses: syncedCourses,
      labs: rawLabs,
      assignments: mergedAssignments,
      submissions: mergedSubmissions,
      examMarks: mergedExamMarks,
      announcements: mergedAnnouncements
    };
  } catch {
    return initialManagementData;
  }
};

export const saveManagementData = (data: ManagementData) => {
  try {
    // Ensure two-way consistency between faculty courses and courses table before saving
    const coursesCopy = [...(data.courses || [])];
    const facultyCopy = (data.faculty || []).map((fac) => {
      const assignedCodes = new Set(fac.courses || []);

      // If a course has this faculty ID or Name, ensure it's in the faculty's assigned courses
      coursesCopy.forEach((c) => {
        if (
          (c.facultyId && c.facultyId.toLowerCase() === fac.id.toLowerCase()) ||
          (c.facultyName && c.facultyName.toLowerCase() === fac.name.toLowerCase())
        ) {
          assignedCodes.add(c.code);
        }
      });

      // For every assigned code, ensure the course in coursesCopy has the facultyId & facultyName assigned
      Array.from(assignedCodes).forEach((code) => {
        const existingIdx = coursesCopy.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
        if (existingIdx >= 0) {
          coursesCopy[existingIdx] = {
            ...coursesCopy[existingIdx],
            facultyId: fac.id,
            facultyName: fac.name
          };
        } else {
          coursesCopy.push({
            code: code.toUpperCase(),
            name: `${code.toUpperCase()} Course`,
            department: fac.department || 'Computer Science & Engineering',
            semester: '5th Semester',
            facultyId: fac.id,
            facultyName: fac.name,
            studentsCount: 60,
            status: 'Active',
            progress: 0,
            nextClass: 'Mon, Wed 09:00 AM'
          });
        }
      });

      return {
        ...fac,
        courses: Array.from(assignedCodes)
      };
    });

    const normalizedData: ManagementData = {
      ...data,
      faculty: facultyCopy,
      courses: coursesCopy,
      labs: data.labs || []
    };

    localStorage.setItem('campushub_management_data', JSON.stringify(normalizedData));
  } catch (err) {
    console.warn('Error saving management data:', err);
  }
};

/**
 * Returns the assigned courses for a given faculty user (or active session).
 * Checks faculty ID, email, name, and faculty course assignments.
 */
export const getFacultyAssignedCourses = (authUser?: any): CourseRecord[] => {
  const mgmt = getManagementData();

  // Try to find matching faculty from authUser
  let activeFaculty: FacultyRecord | undefined;

  if (authUser) {
    const uId = (authUser.id || '').toLowerCase().trim();
    const uEmail = (authUser.email || '').toLowerCase().trim();
    const uName = (authUser.name || '').toLowerCase().trim();

    activeFaculty = mgmt.faculty.find(
      (f) =>
        (uId && f.id.toLowerCase() === uId) ||
        (uEmail && f.email.toLowerCase() === uEmail) ||
        (uName && f.name.toLowerCase() === uName)
    );
  }

  // Fallback to active session in localStorage if not found
  if (!activeFaculty) {
    try {
      const sessionRaw = localStorage.getItem('campusone_auth_session');
      if (sessionRaw) {
        const sessionUser = JSON.parse(sessionRaw);
        const sId = (sessionUser.id || '').toLowerCase().trim();
        const sEmail = (sessionUser.email || '').toLowerCase().trim();
        const sName = (sessionUser.name || '').toLowerCase().trim();

        activeFaculty = mgmt.faculty.find(
          (f) =>
            (sId && f.id.toLowerCase() === sId) ||
            (sEmail && f.email.toLowerCase() === sEmail) ||
            (sName && f.name.toLowerCase() === sName)
        );
      }
    } catch {}
  }

  // If still not found and in faculty portal, default to first faculty member
  if (!activeFaculty && mgmt.faculty.length > 0) {
    activeFaculty = mgmt.faculty[0];
  }

  if (!activeFaculty) {
    return mgmt.courses;
  }

  const facId = activeFaculty.id.toLowerCase();
  const facName = activeFaculty.name.toLowerCase();
  const assignedCodes = (activeFaculty.courses || []).map((c) => c.toUpperCase());

  const matched = mgmt.courses.filter((c) => {
    const cFacId = (c.facultyId || '').toLowerCase();
    const cFacName = (c.facultyName || '').toLowerCase();
    const cCode = (c.code || '').toUpperCase();

    return (
      cFacId === facId ||
      cFacName === facName ||
      assignedCodes.includes(cCode)
    );
  });

  // If no courses matched for this faculty yet, return any course where faculty is not set or default courses
  if (matched.length === 0 && mgmt.courses.length > 0) {
    return mgmt.courses;
  }

  return matched;
};

/**
 * Returns all configured labs belonging to a specific parent course code.
 */
export const getCourseLabs = (courseCode: string): LabRecord[] => {
  const mgmt = getManagementData();
  const cleanCode = (courseCode || '').toUpperCase().trim();
  return (mgmt.labs || []).filter((l) => (l.courseCode || '').toUpperCase().trim() === cleanCode);
};

/**
 * Returns all labs assigned to a given faculty user or their courses.
 */
export const getFacultyAssignedLabs = (authUser?: any): LabRecord[] => {
  const mgmt = getManagementData();
  const assignedCourses = getFacultyAssignedCourses(authUser);
  const courseCodes = new Set(assignedCourses.map((c) => c.code.toUpperCase()));

  let activeFaculty: FacultyRecord | undefined;
  if (authUser) {
    const uId = (authUser.id || '').toLowerCase().trim();
    const uEmail = (authUser.email || '').toLowerCase().trim();
    const uName = (authUser.name || '').toLowerCase().trim();

    activeFaculty = mgmt.faculty.find(
      (f) =>
        (uId && f.id.toLowerCase() === uId) ||
        (uEmail && f.email.toLowerCase() === uEmail) ||
        (uName && f.name.toLowerCase() === uName)
    );
  }

  const facId = (activeFaculty?.id || '').toLowerCase();
  const facName = (activeFaculty?.name || '').toLowerCase();

  const matchedLabs = (mgmt.labs || []).filter((lab) => {
    const lFacId = (lab.facultyId || '').toLowerCase();
    const lFacName = (lab.facultyName || '').toLowerCase();
    const lCourseCode = (lab.courseCode || '').toUpperCase();

    return (
      (facId && lFacId === facId) ||
      (facName && lFacName === facName) ||
      courseCodes.has(lCourseCode)
    );
  });

  if (matchedLabs.length === 0 && (mgmt.labs || []).length > 0) {
    return mgmt.labs || [];
  }

  return matchedLabs;
};

/**
 * Persists a new or updated lab record in management data.
 */
export const saveLabRecord = (lab: LabRecord): void => {
  const mgmt = getManagementData();
  const labsList = [...(mgmt.labs || [])];
  const existingIdx = labsList.findIndex((l) => l.id === lab.id || l.code.toUpperCase() === lab.code.toUpperCase());

  if (existingIdx >= 0) {
    labsList[existingIdx] = lab;
  } else {
    labsList.unshift(lab);
  }

  saveManagementData({
    ...mgmt,
    labs: labsList
  });
};

/**
 * Deletes a lab record by ID.
 */
export const deleteLabRecord = (labId: string): void => {
  const mgmt = getManagementData();
  const updated = (mgmt.labs || []).filter((l) => l.id !== labId);
  saveManagementData({
    ...mgmt,
    labs: updated
  });
};

const LAB_SESSIONS_STORAGE_KEY = 'campushub_faculty_lab_sessions';

/**
 * Gets recorded lab attendance sessions from localStorage.
 */
export const getLabSessions = (): LabSessionRecord[] => {
  try {
    const raw = localStorage.getItem(LAB_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Persists a newly conducted/marked lab attendance session record.
 */
export const saveLabSession = (session: LabSessionRecord): void => {
  try {
    const existing = getLabSessions();
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    localStorage.setItem(LAB_SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('campushub_lab_session_saved'));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Error saving lab session:', err);
  }
};



