export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  faculty: string;
  type: 'Theory' | 'Practical / Lab';
  credits: number;
  totalConducted: number;
  totalAttended: number;
  percentage: number;
  requiredPercentage: number;
  marginClasses: number; // positive = can skip without dropping below 75%, negative = must attend consecutively to reach 75%
  status: 'Safe' | 'Warning' | 'Critical';
  room: string;
  syllabusCovered: number; // in %
}

export interface AttendanceSessionLog {
  id: string;
  date: string;
  day: string;
  time: string;
  subjectCode: string;
  subjectName: string;
  period: string;
  faculty: string;
  topic: string;
  status: 'Present' | 'Absent' | 'Late' | 'On-Duty';
  mode: 'Biometric RFID' | 'Smart Portal' | 'Faculty Roll-Call';
}

export interface LeaveApplication {
  id: string;
  type: 'Medical Leave' | 'On-Duty (OD) Academic' | 'On-Duty (OD) Sports' | 'Casual Leave';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  appliedDate: string;
  status: 'Approved' | 'Pending Advisor Review' | 'Rejected';
  advisorName: string;
  remarks?: string;
  documentName?: string;
}

export interface AttendanceSummary {
  overallPercentage: number;
  totalHeld: number;
  totalAttended: number;
  totalAbsent: number;
  totalOnDuty: number;
  minRequiredPercentage: number;
  examEligibility: 'Eligible' | 'Conditional' | 'Detained';
  consecutivePresentStreak: number;
  lastUpdated: string;
}

export const initialAttendanceSummary: AttendanceSummary = {
  overallPercentage: 86.4,
  totalHeld: 250,
  totalAttended: 216,
  totalAbsent: 28,
  totalOnDuty: 6,
  minRequiredPercentage: 75.0,
  examEligibility: 'Eligible',
  consecutivePresentStreak: 12,
  lastUpdated: 'Today at 04:30 PM (Synced with Biometric Gateway)'
};

export const subjectAttendanceData: SubjectAttendance[] = [
  {
    id: 'SUB-ATT-01',
    code: 'CS801',
    name: 'Distributed Systems & Cloud Architecture',
    faculty: 'Dr. Rajesh Varma',
    type: 'Theory',
    credits: 4,
    totalConducted: 42,
    totalAttended: 38,
    percentage: 90.5,
    requiredPercentage: 75,
    marginClasses: 8,
    status: 'Safe',
    room: 'LH-302 (Auditorium Block)',
    syllabusCovered: 88
  },
  {
    id: 'SUB-ATT-02',
    code: 'CS802',
    name: 'Machine Learning & Neural Networks',
    faculty: 'Prof. Ananya Sen',
    type: 'Theory',
    credits: 4,
    totalConducted: 40,
    totalAttended: 35,
    percentage: 87.5,
    requiredPercentage: 75,
    marginClasses: 6,
    status: 'Safe',
    room: 'CS-Lab 4 / Seminar Hall',
    syllabusCovered: 82
  },
  {
    id: 'SUB-ATT-03',
    code: 'CS803',
    name: 'Information & Network Security',
    faculty: 'Dr. Suresh Kumar (HOD)',
    type: 'Theory',
    credits: 3,
    totalConducted: 38,
    totalAttended: 32,
    percentage: 84.2,
    requiredPercentage: 75,
    marginClasses: 4,
    status: 'Safe',
    room: 'LH-105 (CSE Wing)',
    syllabusCovered: 79
  },
  {
    id: 'SUB-ATT-04',
    code: 'CS804',
    name: 'Full Stack Cloud Native Development',
    faculty: 'Prof. Vikram Malhotra',
    type: 'Theory',
    credits: 3,
    totalConducted: 36,
    totalAttended: 33,
    percentage: 91.7,
    requiredPercentage: 75,
    marginClasses: 7,
    status: 'Safe',
    room: 'Tech Hub Smart Room 2',
    syllabusCovered: 90
  },
  {
    id: 'SUB-ATT-05',
    code: 'CS805',
    name: 'Natural Language Processing & LLMs',
    faculty: 'Dr. Priya Murthy',
    type: 'Theory',
    credits: 3,
    totalConducted: 34,
    totalAttended: 27,
    percentage: 79.4,
    requiredPercentage: 75,
    marginClasses: 2,
    status: 'Warning',
    room: 'LH-201',
    syllabusCovered: 75
  },
  {
    id: 'SUB-ATT-06',
    code: 'CS806',
    name: 'Engineering Economics & Project Finance',
    faculty: 'Prof. Ramesh Iyer',
    type: 'Theory',
    credits: 2,
    totalConducted: 24,
    totalAttended: 19,
    percentage: 79.2,
    requiredPercentage: 75,
    marginClasses: 1,
    status: 'Warning',
    room: 'Management Hall B',
    syllabusCovered: 70
  },
  {
    id: 'SUB-ATT-07',
    code: 'CS807P',
    name: 'Deep Learning & GPU Computing Lab',
    faculty: 'Prof. Ananya Sen & Lab Staff',
    type: 'Practical / Lab',
    credits: 2,
    totalConducted: 18,
    totalAttended: 16,
    percentage: 88.9,
    requiredPercentage: 75,
    marginClasses: 3,
    status: 'Safe',
    room: 'High-Performance Computing Lab',
    syllabusCovered: 95
  },
  {
    id: 'SUB-ATT-08',
    code: 'CS808P',
    name: 'Major Capstone Project Review & Viva',
    faculty: 'Project Review Committee',
    type: 'Practical / Lab',
    credits: 6,
    totalConducted: 18,
    totalAttended: 16,
    percentage: 88.9,
    requiredPercentage: 75,
    marginClasses: 3,
    status: 'Safe',
    room: 'Conference Room 1',
    syllabusCovered: 85
  }
];

export const initialSessionLogs: AttendanceSessionLog[] = [
  {
    id: 'LOG-001',
    date: '09 Sep 2026',
    day: 'Wednesday',
    time: '09:00 AM - 10:00 AM',
    subjectCode: 'CS801',
    subjectName: 'Distributed Systems & Cloud Architecture',
    period: 'Period 1',
    faculty: 'Dr. Rajesh Varma',
    topic: 'Kubernetes Pod Scheduling & Raft Consensus Mechanisms',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-002',
    date: '09 Sep 2026',
    day: 'Wednesday',
    time: '10:00 AM - 11:00 AM',
    subjectCode: 'CS802',
    subjectName: 'Machine Learning & Neural Networks',
    period: 'Period 2',
    faculty: 'Prof. Ananya Sen',
    topic: 'Backpropagation Through Time & Transformer Attention Heads',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-003',
    date: '09 Sep 2026',
    day: 'Wednesday',
    time: '11:15 AM - 12:15 PM',
    subjectCode: 'CS803',
    subjectName: 'Information & Network Security',
    period: 'Period 3',
    faculty: 'Dr. Suresh Kumar',
    topic: 'Zero-Trust Architecture & Elliptic-Curve Cryptography',
    status: 'Present',
    mode: 'Smart Portal'
  },
  {
    id: 'LOG-004',
    date: '08 Sep 2026',
    day: 'Tuesday',
    time: '02:00 PM - 04:00 PM',
    subjectCode: 'CS807P',
    subjectName: 'Deep Learning & GPU Computing Lab',
    period: 'Lab Session',
    faculty: 'Prof. Ananya Sen',
    topic: 'CUDA Kernel Tuning & PyTorch Distributed Data Parallelism',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-005',
    date: '08 Sep 2026',
    day: 'Tuesday',
    time: '11:15 AM - 12:15 PM',
    subjectCode: 'CS804',
    subjectName: 'Full Stack Cloud Native Development',
    period: 'Period 3',
    faculty: 'Prof. Vikram Malhotra',
    topic: 'Micro-Frontend Federation & WebSocket Event Streaming',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-006',
    date: '08 Sep 2026',
    day: 'Tuesday',
    time: '09:00 AM - 10:00 AM',
    subjectCode: 'CS805',
    subjectName: 'Natural Language Processing & LLMs',
    period: 'Period 1',
    faculty: 'Dr. Priya Murthy',
    topic: 'Quantization & LoRA Fine-Tuning Benchmarks',
    status: 'Late',
    mode: 'Smart Portal'
  },
  {
    id: 'LOG-007',
    date: '05 Sep 2026',
    day: 'Saturday',
    time: '09:00 AM - 01:00 PM',
    subjectCode: 'CS808P',
    subjectName: 'Major Capstone Project Review & Viva',
    period: 'Review Session',
    faculty: 'Project Review Committee',
    topic: 'Phase II Architecture Milestone & API Mock Review',
    status: 'Present',
    mode: 'Faculty Roll-Call'
  },
  {
    id: 'LOG-008',
    date: '04 Sep 2026',
    day: 'Friday',
    time: '02:00 PM - 03:00 PM',
    subjectCode: 'CS806',
    subjectName: 'Engineering Economics & Project Finance',
    period: 'Period 5',
    faculty: 'Prof. Ramesh Iyer',
    topic: 'Capital Asset Pricing Model (CAPM) & Net Present Value',
    status: 'Absent',
    mode: 'Faculty Roll-Call'
  },
  {
    id: 'LOG-009',
    date: '04 Sep 2026',
    day: 'Friday',
    time: '10:00 AM - 11:00 AM',
    subjectCode: 'CS802',
    subjectName: 'Machine Learning & Neural Networks',
    period: 'Period 2',
    faculty: 'Prof. Ananya Sen',
    topic: 'Diffusion Models & Latent Vector Space Sampling',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-010',
    date: '03 Sep 2026',
    day: 'Thursday',
    time: '09:00 AM - 04:00 PM',
    subjectCode: 'CS801',
    subjectName: 'National Smart India Hackathon Grand Finale',
    period: 'Full Day Event',
    faculty: 'Dean of Student Affairs',
    topic: 'Inter-University Coding Championship (Official University OD)',
    status: 'On-Duty',
    mode: 'Smart Portal'
  },
  {
    id: 'LOG-011',
    date: '02 Sep 2026',
    day: 'Wednesday',
    time: '11:15 AM - 12:15 PM',
    subjectCode: 'CS803',
    subjectName: 'Information & Network Security',
    period: 'Period 3',
    faculty: 'Dr. Suresh Kumar',
    topic: 'SQL Injection Defense & OWASP Top 10 Mitigation Strategies',
    status: 'Present',
    mode: 'Biometric RFID'
  },
  {
    id: 'LOG-012',
    date: '01 Sep 2026',
    day: 'Tuesday',
    time: '09:00 AM - 10:00 AM',
    subjectCode: 'CS805',
    subjectName: 'Natural Language Processing & LLMs',
    period: 'Period 1',
    faculty: 'Dr. Priya Murthy',
    topic: 'Vector Database Embeddings & Retrieval-Augmented Generation',
    status: 'Present',
    mode: 'Biometric RFID'
  }
];

export const initialLeaveApplications: LeaveApplication[] = [
  {
    id: 'LEV-2026-089',
    type: 'On-Duty (OD) Academic',
    fromDate: '03 Sep 2026',
    toDate: '03 Sep 2026',
    totalDays: 1,
    reason: 'Representing University at Smart India Hackathon Regional Finals at IIT Hyderabad.',
    appliedDate: '01 Sep 2026',
    status: 'Approved',
    advisorName: 'Dr. Suresh Kumar (Professor & HOD)',
    remarks: 'Approved with full academic attendance credit. Outstanding achievement!',
    documentName: 'Hackathon_Selection_Letter.pdf'
  },
  {
    id: 'LEV-2026-064',
    type: 'Medical Leave',
    fromDate: '18 Aug 2026',
    toDate: '20 Aug 2026',
    totalDays: 3,
    reason: 'Viral fever and respiratory infection as per doctor prescription and bed rest order.',
    appliedDate: '17 Aug 2026',
    status: 'Approved',
    advisorName: 'Dr. Suresh Kumar (Professor & HOD)',
    remarks: 'Medical certificate verified and excused in institutional attendance register.',
    documentName: 'Medical_Prescription_CareHospital.pdf'
  },
  {
    id: 'LEV-2026-102',
    type: 'On-Duty (OD) Sports',
    fromDate: '14 Sep 2026',
    toDate: '16 Sep 2026',
    totalDays: 3,
    reason: 'Inter-Collegiate Table Tennis Championship state round delegation.',
    appliedDate: '08 Sep 2026',
    status: 'Pending Advisor Review',
    advisorName: 'Dr. Suresh Kumar (Professor & HOD)',
    remarks: 'Awaiting Dean of Physical Education endorsement signature.',
    documentName: 'Sports_Council_Nomination.pdf'
  }
];
