export interface ParentLinkedStudent {
  id: string; // Roll Number e.g. 236F1A0551
  name: string;
  department: string;
  degree: string;
  year: string;
  semester: string;
  section: string;
  cgpa: number;
  attendancePercent: number;
  totalClasses: number;
  attendedClasses: number;
  absentClasses: number;
  academicStanding: 'Excellent' | 'Good' | 'Needs Attention';
  hostelInfo?: {
    block: string;
    room: string;
    bed: string;
    warden: string;
    wardenPhone: string;
    messPlan: string;
  };
  libraryInfo: {
    booksBorrowed: number;
    booksDueSoon: number;
    overdueBooks: number;
    fines: number;
    borrowedList: Array<{
      title: string;
      isbn: string;
      borrowDate: string;
      dueDate: string;
      status: 'On Loan' | 'Due Soon' | 'Overdue';
    }>;
  };
  placementInfo?: {
    eligible: boolean;
    appliedCount: number;
    shortlistedCount: number;
    interviewsCount: number;
    offersCount: number;
    latestOffer?: {
      company: string;
      role: string;
      packageStr: string;
      status: string;
    };
  };
  courseAttendance: Array<{
    code: string;
    name: string;
    faculty: string;
    conducted: number;
    attended: number;
    absent: number;
    percentage: number;
  }>;
  academics: {
    cumulativeGpa: number;
    currentSemesterGpa: number;
    totalCredits: number;
    passedCredits: number;
    backlogs: number;
    courses: Array<{
      code: string;
      name: string;
      internalMarks: number;
      examMarks: number;
      totalMarks: number;
      grade: string;
      gradePoints: number;
      status: 'Passed' | 'Pending';
    }>;
  };
  assignments: Array<{
    id: string;
    title: string;
    courseCode: string;
    courseName: string;
    assignedDate: string;
    dueDate: string;
    status: 'Submitted' | 'Pending' | 'Graded' | 'Late';
    marks: number | null;
    maxMarks: number;
    feedback?: string;
  }>;
  exams: Array<{
    id: string;
    name: string;
    courseCode: string;
    courseName: string;
    date: string;
    time: string;
    room: string;
    maxMarks: number;
    instructions: string;
  }>;
  feeDetails: {
    totalInvoiced: string;
    paidAmount: string;
    pendingBalance: string;
    dueDate: string;
    status: 'Paid in Full' | 'Pending Balance' | 'Overdue';
    transactions: Array<{
      id: string;
      date: string;
      amount: string;
      type: string;
      mode: string;
      status: 'Verified' | 'Pending';
    }>;
  };
}

export const PARENT_LINKED_STUDENTS: ParentLinkedStudent[] = [
  {
    id: '236F1A0551',
    name: 'Aditya Sharma',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech Computer Science & Engineering',
    year: '4',
    semester: 'Semester 8',
    section: 'A',
    cgpa: 8.60,
    attendancePercent: 87,
    totalClasses: 120,
    attendedClasses: 104,
    absentClasses: 16,
    academicStanding: 'Excellent',
    hostelInfo: {
      block: 'Block A (Boys Senior Hostel)',
      room: 'Room A-204 (Double Occupancy AC)',
      bed: 'Bed A-1',
      warden: 'Mr. K. Sharma',
      wardenPhone: '+91 98765 11111',
      messPlan: 'Special Non-Veg / North Indian Plan'
    },
    libraryInfo: {
      booksBorrowed: 2,
      booksDueSoon: 1,
      overdueBooks: 0,
      fines: 0,
      borrowedList: [
        { title: 'Introduction to Algorithms (CLRS)', isbn: '978-0262033848', borrowDate: '01 Aug 2026', dueDate: '22 Aug 2026', status: 'Due Soon' },
        { title: 'Database System Concepts (7th Ed)', isbn: '978-0078022159', borrowDate: '05 Aug 2026', dueDate: '26 Aug 2026', status: 'On Loan' }
      ]
    },
    placementInfo: {
      eligible: true,
      appliedCount: 8,
      shortlistedCount: 3,
      interviewsCount: 2,
      offersCount: 1,
      latestOffer: {
        company: 'TechNova Solutions',
        role: 'Associate Software Engineer',
        packageStr: '₹8.5 LPA',
        status: 'Offer Accepted'
      }
    },
    courseAttendance: [
      { code: 'CSE-301', name: 'Advanced Data Structures & Algorithms', faculty: 'Dr. Suresh Kumar', conducted: 32, attended: 29, absent: 3, percentage: 91 },
      { code: 'CSE-302', name: 'Database Management Systems', faculty: 'Dr. Priya Menon', conducted: 30, attended: 26, absent: 4, percentage: 87 },
      { code: 'CSE-401', name: 'Cloud Computing & Distributed Systems', faculty: 'Dr. Anil Gupta', conducted: 28, attended: 24, absent: 4, percentage: 86 },
      { code: 'CSE-402', name: 'Software Engineering & Agile Methodologies', faculty: 'Dr. Vikram Singh', conducted: 30, attended: 25, absent: 5, percentage: 83 }
    ],
    academics: {
      cumulativeGpa: 8.60,
      currentSemesterGpa: 8.75,
      totalCredits: 160,
      passedCredits: 160,
      backlogs: 0,
      courses: [
        { code: 'CSE-301', name: 'Advanced Data Structures & Algorithms', internalMarks: 28, examMarks: 64, totalMarks: 92, grade: 'A+', gradePoints: 10.0, status: 'Passed' },
        { code: 'CSE-302', name: 'Database Management Systems', internalMarks: 26, examMarks: 60, totalMarks: 86, grade: 'A', gradePoints: 9.0, status: 'Passed' },
        { code: 'CSE-401', name: 'Cloud Computing Architecture', internalMarks: 25, examMarks: 58, totalMarks: 83, grade: 'A', gradePoints: 9.0, status: 'Passed' },
        { code: 'CSE-402', name: 'Software Engineering', internalMarks: 27, examMarks: 61, totalMarks: 88, grade: 'A', gradePoints: 9.0, status: 'Passed' }
      ]
    },
    assignments: [
      { id: 'asg-1', title: 'Binary Search Trees & AVL Balancing', courseCode: 'CSE-301', courseName: 'Advanced Data Structures', assignedDate: '02 Aug 2026', dueDate: '15 Aug 2026', status: 'Graded', marks: 95, maxMarks: 100, feedback: 'Excellent time complexity proofs and recursive balance analysis.' },
      { id: 'asg-2', title: 'Relational Schema Normalization (BCNF)', courseCode: 'CSE-302', courseName: 'DBMS', assignedDate: '06 Aug 2026', dueDate: '18 Aug 2026', status: 'Graded', marks: 88, maxMarks: 100, feedback: 'Good dependency preservation explanation.' },
      { id: 'asg-3', title: 'Microservices Deployment on Kubernetes', courseCode: 'CSE-401', courseName: 'Cloud Computing', assignedDate: '12 Aug 2026', dueDate: '25 Aug 2026', status: 'Pending', marks: null, maxMarks: 100 }
    ],
    exams: [
      { id: 'ex-1', name: 'Mid-Semester Theory Examination 1', courseCode: 'CSE-301', courseName: 'Advanced Data Structures', date: '25 Aug 2026', time: '10:00 AM – 12:00 PM', room: 'Room CSE-204', maxMarks: 30, instructions: 'Closed book exam. Calculators permitted.' },
      { id: 'ex-2', name: 'DBMS End-Semester Practical & Viva', courseCode: 'CSE-302', courseName: 'Database Management Systems', date: '28 Aug 2026', time: '02:00 PM – 05:00 PM', room: 'Computer Lab 3', maxMarks: 70, instructions: 'Hands-on SQL schema and stored procedure coding assessment.' }
    ],
    feeDetails: {
      totalInvoiced: '₹85,000',
      paidAmount: '₹85,000',
      pendingBalance: '₹0',
      dueDate: '10 Aug 2026',
      status: 'Paid in Full',
      transactions: [
        { id: 'REC-2026-8901', date: '08 Aug 2026', amount: '₹85,000', type: 'Annual Tuition & Lab Fees', mode: 'HDFC NetBanking / UPI', status: 'Verified' }
      ]
    }
  },
  {
    id: '256F1A0512',
    name: 'Ananya Sharma',
    department: 'Electronics & Communication',
    degree: 'B.Tech Electronics & Communication Engineering',
    year: '2',
    semester: 'Semester 4',
    section: 'B',
    cgpa: 9.10,
    attendancePercent: 94,
    totalClasses: 110,
    attendedClasses: 103,
    absentClasses: 7,
    academicStanding: 'Excellent',
    hostelInfo: {
      block: 'Block C (Girls Senior Hostel)',
      room: 'Room C-302 (Single Occupancy Non-AC)',
      bed: 'Bed C-1',
      warden: 'Dr. Sunita Rao',
      wardenPhone: '+91 98765 33333',
      messPlan: 'Pure Vegetarian / South Indian Meal Plan'
    },
    libraryInfo: {
      booksBorrowed: 1,
      booksDueSoon: 0,
      overdueBooks: 0,
      fines: 0,
      borrowedList: [
        { title: 'Electronic Devices and Circuit Theory', isbn: '978-0137692828', borrowDate: '10 Aug 2026', dueDate: '30 Aug 2026', status: 'On Loan' }
      ]
    },
    placementInfo: {
      eligible: false,
      appliedCount: 0,
      shortlistedCount: 0,
      interviewsCount: 0,
      offersCount: 0
    },
    courseAttendance: [
      { code: 'ECE-201', name: 'Digital Electronics & Logic Design', faculty: 'Dr. Rajesh Verma', conducted: 30, attended: 29, absent: 1, percentage: 97 },
      { code: 'ECE-202', name: 'Signals & Analog Communication', faculty: 'Dr. Priya Menon', conducted: 28, attended: 26, absent: 2, percentage: 93 },
      { code: 'ECE-203', name: 'Microprocessors & Microcontrollers', faculty: 'Dr. K. Ramesh', conducted: 26, attended: 24, absent: 2, percentage: 92 },
      { code: 'ECE-204', name: 'Electromagnetic Field Theory', faculty: 'Dr. S. N. Roy', conducted: 26, attended: 24, absent: 2, percentage: 92 }
    ],
    academics: {
      cumulativeGpa: 9.10,
      currentSemesterGpa: 9.25,
      totalCredits: 80,
      passedCredits: 80,
      backlogs: 0,
      courses: [
        { code: 'ECE-201', name: 'Digital Electronics & Logic Design', internalMarks: 29, examMarks: 67, totalMarks: 96, grade: 'A+', gradePoints: 10.0, status: 'Passed' },
        { code: 'ECE-202', name: 'Signals & Analog Communication', internalMarks: 28, examMarks: 65, totalMarks: 93, grade: 'A+', gradePoints: 10.0, status: 'Passed' },
        { code: 'ECE-203', name: 'Microprocessors & Microcontrollers', internalMarks: 27, examMarks: 62, totalMarks: 89, grade: 'A', gradePoints: 9.0, status: 'Passed' },
        { code: 'ECE-204', name: 'Electromagnetic Field Theory', internalMarks: 28, examMarks: 63, totalMarks: 91, grade: 'A+', gradePoints: 10.0, status: 'Passed' }
      ]
    },
    assignments: [
      { id: 'asg-ece-1', title: 'FPGA Verilog State Machine Design', courseCode: 'ECE-201', courseName: 'Digital Electronics', assignedDate: '05 Aug 2026', dueDate: '19 Aug 2026', status: 'Submitted', marks: null, maxMarks: 100 },
      { id: 'asg-ece-2', title: 'Fourier Transform Spectrum Analysis', courseCode: 'ECE-202', courseName: 'Signals & Systems', assignedDate: '10 Aug 2026', dueDate: '26 Aug 2026', status: 'Pending', marks: null, maxMarks: 100 }
    ],
    exams: [
      { id: 'ex-ece-1', name: 'Digital Electronics Midterm Assessment', courseCode: 'ECE-201', courseName: 'Digital Electronics', date: '26 Aug 2026', time: '10:00 AM – 12:00 PM', room: 'Seminar Hall 1', maxMarks: 30, instructions: 'Standard scientific calculators permitted.' }
    ],
    feeDetails: {
      totalInvoiced: '₹75,000',
      paidAmount: '₹63,000',
      pendingBalance: '₹12,000',
      dueDate: '30 Aug 2026',
      status: 'Pending Balance',
      transactions: [
        { id: 'REC-2026-7201', date: '04 Aug 2026', amount: '₹63,000', type: 'Semester 4 Tuition Installment', mode: 'Credit Card', status: 'Verified' }
      ]
    }
  }
];

export const getParentLinkedStudents = (): ParentLinkedStudent[] => {
  return PARENT_LINKED_STUDENTS;
};
