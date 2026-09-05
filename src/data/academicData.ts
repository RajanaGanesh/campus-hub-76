export interface AttendanceLog {
  date: string;
  subject: string;
  time: string;
  faculty: string;
  status: 'Present' | 'Absent';
}



export interface TimetableSlot {
  time: string;
  duration: string;
  subject: string;
  room: string;
  faculty: string;
}

export interface AssignmentItem {
  id: string;
  subject: string;
  title: string;
  faculty: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue' | 'Late';
  description: string;
  instructions: string;
  createdDate: string;
  maxMarks: number;
  comments?: string;
  submittedFile?: string;
}

export interface AcademicData {
  attendance: {
    overall: number;
    presentCount: number;
    absentCount: number;
    totalCount: number;
  };
  attendanceHistory: AttendanceLog[];
  timetable: Record<string, TimetableSlot[]>;
  assignments: AssignmentItem[];
}

export const academicData: AcademicData = {
  attendance: {
    overall: 86,
    presentCount: 142,
    absentCount: 23,
    totalCount: 165
  },
  attendanceHistory: [
    { date: '15 Aug 2026', subject: 'Data Structures', time: '09:00 AM', faculty: 'Dr. Kumar', status: 'Present' },
    { date: '15 Aug 2026', subject: 'Database Management', time: '10:00 AM', faculty: 'Prof. Priya', status: 'Present' },
    { date: '14 Aug 2026', subject: 'Computer Networks', time: '11:30 AM', faculty: 'Prof. Ravi', status: 'Absent' },
    { date: '14 Aug 2026', subject: 'Operating Systems', time: '01:30 PM', faculty: 'Dr. Anitha', status: 'Present' },
    { date: '13 Aug 2026', subject: 'Software Engineering', time: '03:00 PM', faculty: 'Prof. Suresh', status: 'Present' },
    { date: '13 Aug 2026', subject: 'Data Structures', time: '09:00 AM', faculty: 'Dr. Kumar', status: 'Present' },
    { date: '12 Aug 2026', subject: 'Database Management', time: '10:00 AM', faculty: 'Prof. Priya', status: 'Present' },
    { date: '12 Aug 2026', subject: 'Computer Networks', time: '11:30 AM', faculty: 'Prof. Ravi', status: 'Present' },
    { date: '11 Aug 2026', subject: 'Operating Systems', time: '01:30 PM', faculty: 'Dr. Anitha', status: 'Present' },
    { date: '11 Aug 2026', subject: 'Software Engineering', time: '03:00 PM', faculty: 'Prof. Suresh', status: 'Absent' },
    { date: '10 Aug 2026', subject: 'Data Structures', time: '09:00 AM', faculty: 'Dr. Kumar', status: 'Present' },
    { date: '10 Aug 2026', subject: 'Database Management', time: '10:00 AM', faculty: 'Prof. Priya', status: 'Absent' },
    { date: '09 Aug 2026', subject: 'Computer Networks', time: '11:30 AM', faculty: 'Prof. Ravi', status: 'Present' }
  ],
  timetable: {
    Monday: [
      { time: '09:00 AM', duration: '1h', subject: 'Data Structures', room: 'CSE-204', faculty: 'Dr. Kumar' },
      { time: '10:00 AM', duration: '1.5h', subject: 'Database Management', room: 'CSE-202', faculty: 'Prof. Priya' },
      { time: '11:30 AM', duration: '1h', subject: 'Computer Networks', room: 'CSE-301', faculty: 'Prof. Ravi' },
      { time: '01:30 PM', duration: '1h', subject: 'Operating Systems', room: 'CSE-205', faculty: 'Dr. Anitha' },
      { time: '03:00 PM', duration: '1h', subject: 'Software Engineering', room: 'CSE-204', faculty: 'Prof. Suresh' }
    ],
    Tuesday: [
      { time: '09:00 AM', duration: '1h', subject: 'Operating Systems', room: 'CSE-205', faculty: 'Dr. Anitha' },
      { time: '10:00 AM', duration: '1h', subject: 'Data Structures', room: 'CSE-204', faculty: 'Dr. Kumar' },
      { time: '11:30 AM', duration: '1.5h', subject: 'Software Engineering', room: 'CSE-204', faculty: 'Prof. Suresh' },
      { time: '01:30 PM', duration: '1h', subject: 'Database Management', room: 'CSE-202', faculty: 'Prof. Priya' },
      { time: '03:00 PM', duration: '1h', subject: 'Computer Networks', room: 'CSE-301', faculty: 'Prof. Ravi' }
    ],
    Wednesday: [
      { time: '09:00 AM', duration: '1h', subject: 'Database Management', room: 'CSE-202', faculty: 'Prof. Priya' },
      { time: '10:00 AM', duration: '1h', subject: 'Computer Networks', room: 'CSE-301', faculty: 'Prof. Ravi' },
      { time: '11:30 AM', duration: '1h', subject: 'Operating Systems', room: 'CSE-205', faculty: 'Dr. Anitha' },
      { time: '01:30 PM', duration: '1.5h', subject: 'Data Structures', room: 'CSE-204', faculty: 'Dr. Kumar' },
      { time: '03:00 PM', duration: '1h', subject: 'Software Engineering', room: 'CSE-204', faculty: 'Prof. Suresh' }
    ],
    Thursday: [
      { time: '09:00 AM', duration: '1.5h', subject: 'Software Engineering', room: 'CSE-204', faculty: 'Prof. Suresh' },
      { time: '10:00 AM', duration: '1h', subject: 'Operating Systems', room: 'CSE-205', faculty: 'Dr. Anitha' },
      { time: '11:30 AM', duration: '1h', subject: 'Data Structures', room: 'CSE-204', faculty: 'Dr. Kumar' },
      { time: '01:30 PM', duration: '1h', subject: 'Database Management', room: 'CSE-202', faculty: 'Prof. Priya' },
      { time: '03:00 PM', duration: '1h', subject: 'Computer Networks', room: 'CSE-301', faculty: 'Prof. Ravi' }
    ],
    Friday: [
      { time: '09:00 AM', duration: '1h', subject: 'Computer Networks', room: 'CSE-301', faculty: 'Prof. Ravi' },
      { time: '10:00 AM', duration: '1h', subject: 'Database Management', room: 'CSE-202', faculty: 'Prof. Priya' },
      { time: '11:30 AM', duration: '1h', subject: 'Software Engineering', room: 'CSE-204', faculty: 'Prof. Suresh' },
      { time: '01:30 PM', duration: '1.5h', subject: 'Operating Systems', room: 'CSE-205', faculty: 'Dr. Anitha' },
      { time: '03:00 PM', duration: '1h', subject: 'Data Structures', room: 'CSE-204', faculty: 'Dr. Kumar' }
    ],
    Saturday: [
      { time: '09:00 AM', duration: '1.5h', subject: 'Data Structures Lab', room: 'Lab 1', faculty: 'Dr. Kumar' },
      { time: '11:00 AM', duration: '1.5h', subject: 'Database Systems Lab', room: 'Lab 2', faculty: 'Prof. Priya' },
      { time: '01:30 PM', duration: '1.5h', subject: 'Operating Systems Lab', room: 'Lab 3', faculty: 'Dr. Anitha' }
    ]
  },
  assignments: [
    {
      id: 'db-er',
      subject: 'Database Management',
      title: 'ER Diagram & Normalization',
      faculty: 'Prof. Priya',
      due: '25 Aug 2026',
      priority: 'High',
      status: 'Pending',
      description: 'Draw the complete Entity-Relationship diagram for an E-commerce system and normalize it to 3NF/BCNF.',
      instructions: 'Submit a single PDF containing the diagram and schema explanation. Include relation lists and key declarations.',
      createdDate: '10 Aug 2026',
      maxMarks: 20
    },
    {
      id: 'cn-tcp',
      subject: 'Computer Networks',
      title: 'TCP/IP Assignment',
      faculty: 'Prof. Ravi',
      due: '25 Aug 2026',
      priority: 'Medium',
      status: 'Pending',
      description: 'Analyze TCP sliding window flow control operations and calculate latency timings.',
      instructions: 'Submit a PDF report solving the numerical queries on subnets, IP routing tables, and transmission latency.',
      createdDate: '11 Aug 2026',
      maxMarks: 15
    },
    {
      id: 'se-srs',
      subject: 'Software Engineering',
      title: 'SRS Documentation',
      faculty: 'Prof. Suresh',
      due: '28 Aug 2026',
      priority: 'Low',
      status: 'Pending',
      description: 'Write the complete IEEE Software Requirements Specification (SRS) document for a Online Canteen System.',
      instructions: 'Document all functional and non-functional requirements, use-case models, and system actors list.',
      createdDate: '12 Aug 2026',
      maxMarks: 30
    },
    {
      id: 'os-proc',
      subject: 'Operating Systems',
      title: 'Process Scheduling',
      faculty: 'Dr. Anitha',
      due: '30 Aug 2026',
      priority: 'Medium',
      status: 'Pending',
      description: 'Simulate CPU scheduling policies (FCFS, SJF, SRTF, and Round Robin) and compute turnaround times.',
      instructions: 'Write a program in C/Java/Python or create numerical charts showcasing Gantt chart operations and statistics.',
      createdDate: '13 Aug 2026',
      maxMarks: 20
    }
  ]
};

export const getAcademicAssignments = (): AssignmentItem[] => {
  try {
    const stored = localStorage.getItem('campushub_academic_assignments');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
    return academicData.assignments;
  } catch {
    return academicData.assignments;
  }
};

export const saveAcademicAssignments = (assignments: AssignmentItem[]) => {
  try {
    localStorage.setItem('campushub_academic_assignments', JSON.stringify(assignments));
  } catch (err) {
    console.warn('Error saving academic assignments:', err);
  }
};

