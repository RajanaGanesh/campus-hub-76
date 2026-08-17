export interface ExamItem {
  id: string;
  subject: string;
  dateStr: string; // ISO String or parsable date
  time: string;
  room: string;
  duration: string;
  type: string;
  status: 'Upcoming' | 'Completed' | 'In Progress';
}

export interface SemesterResultDetail {
  subject: string;
  code: string;
  internal: number;
  external: number;
  total: number;
  grade: string;
  gradePoint: number;
  credits: number;
  status: 'Pass' | 'Fail';
}

export interface SemesterResult {
  gpa: number;
  creditsEarned: number;
  subjects: SemesterResultDetail[];
}

export interface LMSModule {
  id: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Locked';
  description: string;
}

export interface LMSCourse {
  id: string;
  title: string;
  faculty: string;
  progress: number;
  moduleCount: number;
  completedModulesCount: number;
  icon: string;
  description: string;
  modules: LMSModule[];
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'PDF' | 'Notes' | 'Presentation' | 'Document' | 'Video';
  size: string;
  uploadedDate: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  course: string;
  duration: string;
  progress: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface QuizItem {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  timeLimit: number;
  bestScore: string | null;
  status: 'Attempted' | 'Not Attempted';
  questions: QuizQuestion[];
}

export interface LMSDashboardProgress {
  overall: number;
  coursesCount: number;
  completedCoursesCount: number;
  quizAverage: number;
  studyStreak: number;
}

export interface LMSData {
  exams: ExamItem[];
  results: Record<string, SemesterResult>;
  courses: LMSCourse[];
  materials: StudyMaterial[];
  videos: VideoLesson[];
  quizzes: QuizItem[];
  progress: LMSDashboardProgress;
}

export const lmsData: LMSData = {
  exams: [
    {
      id: 'ds-mid',
      subject: 'Data Structures',
      dateStr: '2026-08-25T10:00:00+05:30', // Near future
      time: '10:00 AM — 12:00 PM',
      room: 'CSE-204',
      duration: '2 Hours',
      type: 'Mid-Semester Written',
      status: 'Upcoming'
    },
    {
      id: 'db-mid',
      subject: 'Database Management',
      dateStr: '2026-08-28T10:00:00+05:30',
      time: '10:00 AM — 12:00 PM',
      room: 'CSE-202',
      duration: '2 Hours',
      type: 'Mid-Semester Written',
      status: 'Upcoming'
    },
    {
      id: 'cn-mid',
      subject: 'Computer Networks',
      dateStr: '2026-08-30T14:00:00+05:30',
      time: '02:00 PM — 04:00 PM',
      room: 'CSE-301',
      duration: '2 Hours',
      type: 'Mid-Semester Written',
      status: 'Upcoming'
    }
  ],
  results: {
    'Semester 1': {
      gpa: 7.2,
      creditsEarned: 22,
      subjects: [
        { subject: 'Mathematics I', code: 'MA101', internal: 24, external: 48, total: 72, grade: 'B+', gradePoint: 8, credits: 4, status: 'Pass' },
        { subject: 'Applied Physics', code: 'PH102', internal: 22, external: 45, total: 67, grade: 'B', gradePoint: 7, credits: 4, status: 'Pass' },
        { subject: 'Basic Electrical Eng', code: 'EE103', internal: 21, external: 42, total: 63, grade: 'B', gradePoint: 7, credits: 3, status: 'Pass' },
        { subject: 'Programming in C', code: 'CS104', internal: 26, external: 55, total: 81, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' }
      ]
    },
    'Semester 2': {
      gpa: 7.5,
      creditsEarned: 22,
      subjects: [
        { subject: 'Mathematics II', code: 'MA201', internal: 23, external: 49, total: 72, grade: 'B+', gradePoint: 8, credits: 4, status: 'Pass' },
        { subject: 'Chemistry', code: 'CY202', internal: 25, external: 46, total: 71, grade: 'B+', gradePoint: 8, credits: 4, status: 'Pass' },
        { subject: 'Engineering Mechanics', code: 'ME203', internal: 20, external: 41, total: 61, grade: 'B', gradePoint: 7, credits: 3, status: 'Pass' },
        { subject: 'Object Oriented Prog', code: 'CS204', internal: 28, external: 56, total: 84, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' }
      ]
    },
    'Semester 3': {
      gpa: 7.8,
      creditsEarned: 24,
      subjects: [
        { subject: 'Discrete Mathematics', code: 'MA301', internal: 25, external: 51, total: 76, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Digital Logic Design', code: 'CS302', internal: 26, external: 52, total: 78, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Computer Architecture', code: 'CS303', internal: 22, external: 46, total: 68, grade: 'B', gradePoint: 7, credits: 3, status: 'Pass' },
        { subject: 'Data Structures', code: 'CS304', internal: 28, external: 62, total: 90, grade: 'A+', gradePoint: 10, credits: 4, status: 'Pass' }
      ]
    },
    'Semester 4': {
      gpa: 8.0,
      creditsEarned: 24,
      subjects: [
        { subject: 'Formal Languages', code: 'CS401', internal: 24, external: 48, total: 72, grade: 'B+', gradePoint: 8, credits: 4, status: 'Pass' },
        { subject: 'Operating Systems', code: 'CS402', internal: 27, external: 57, total: 84, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Design & Analysis of Alg', code: 'CS403', internal: 26, external: 56, total: 82, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Software Engineering', code: 'CS404', internal: 25, external: 55, total: 80, grade: 'A', gradePoint: 9, credits: 3, status: 'Pass' }
      ]
    },
    'Semester 5': {
      gpa: 8.3,
      creditsEarned: 20,
      subjects: [
        { subject: 'Database Management', code: 'CS501', internal: 26, external: 58, total: 84, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Computer Networks', code: 'CS502', internal: 25, external: 55, total: 80, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Theory of Computation', code: 'CS503', internal: 23, external: 52, total: 75, grade: 'B+', gradePoint: 8, credits: 3, status: 'Pass' },
        { subject: 'System Programming', code: 'CS504', internal: 27, external: 61, total: 88, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' }
      ]
    },
    'Semester 6': {
      gpa: 8.5,
      creditsEarned: 20,
      subjects: [
        { subject: 'Compiler Design', code: 'CS601', internal: 25, external: 60, total: 85, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Artificial Intelligence', code: 'CS602', internal: 28, external: 58, total: 86, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Web Technologies', code: 'CS603', internal: 26, external: 54, total: 80, grade: 'A', gradePoint: 9, credits: 3, status: 'Pass' },
        { subject: 'Cryptography Security', code: 'CS604', internal: 27, external: 55, total: 82, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' }
      ]
    },
    'Semester 7': {
      gpa: 8.8,
      creditsEarned: 20,
      subjects: [
        { subject: 'Cloud Computing', code: 'CS701', internal: 27, external: 61, total: 88, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' },
        { subject: 'Big Data Analytics', code: 'CS702', internal: 29, external: 63, total: 92, grade: 'A+', gradePoint: 10, credits: 4, status: 'Pass' },
        { subject: 'Mobile Application Dev', code: 'CS703', internal: 26, external: 55, total: 81, grade: 'A', gradePoint: 9, credits: 3, status: 'Pass' },
        { subject: 'Internet of Things', code: 'CS704', internal: 28, external: 58, total: 86, grade: 'A', gradePoint: 9, credits: 4, status: 'Pass' }
      ]
    }
  },
  courses: [
    {
      id: 'ds',
      title: 'Data Structures',
      faculty: 'Dr. Kumar',
      progress: 80,
      moduleCount: 10,
      completedModulesCount: 8,
      icon: 'fa-sitemap',
      description: 'Master core memory structure concepts: LinkedLists, Trees, Heaps, and graph operations.',
      modules: [
        { id: 1, title: 'Introduction to Data Structures', status: 'Completed', description: 'Basic storage, static vs dynamic vectors.' },
        { id: 2, title: 'Arrays & Matrix Operations', status: 'Completed', description: 'Row/column indices, search routines.' },
        { id: 3, title: 'Linked Lists operations', status: 'Completed', description: 'Single, double and circular traversal loops.' },
        { id: 4, title: 'Stacks (LIFO structure)', status: 'Completed', description: 'Push, pop and validation operations.' },
        { id: 5, title: 'Queues (FIFO structure)', status: 'Completed', description: 'Circular, double-ended, priority queues.' },
        { id: 6, title: 'Trees (Heaps & BST)', status: 'Completed', description: 'In-order, pre-order traversals and balancing.' },
        { id: 7, title: 'Graphs traversal', status: 'Completed', description: 'Breadth-First and Depth-First Search algorithms.' },
        { id: 8, title: 'Sorting algorithms', status: 'Completed', description: 'QuickSort, MergeSort, HeapSort operations.' },
        { id: 9, title: 'Searching metrics', status: 'In Progress', description: 'Binary Search, Hashing, and Hash map tables.' },
        { id: 10, title: 'Advanced Topics', status: 'Locked', description: 'AVL trees, Red-Black Trees, and Trie data structures.' }
      ]
    },
    {
      id: 'db',
      title: 'Database Management',
      faculty: 'Prof. Priya',
      progress: 60,
      moduleCount: 10,
      completedModulesCount: 6,
      icon: 'fa-database',
      description: 'Acquire database architecture credentials: ER models, SQL queries, and normalization schema.',
      modules: [
        { id: 1, title: 'Introduction to DBMS', status: 'Completed', description: 'Database vs File systems, Schemas.' },
        { id: 2, title: 'ER Modelling', status: 'Completed', description: 'Entities, Attributes, Relationships, Cardinality.' },
        { id: 3, title: 'Relational Model', status: 'Completed', description: 'Tables, Keys (Primary, Foreign), Referential Integrity.' },
        { id: 4, title: 'SQL Queries', status: 'Completed', description: 'SELECT, JOINs, Group By, Subqueries.' },
        { id: 5, title: 'Normalization Fundamentals', status: 'Completed', description: '1NF, 2NF, 3NF schema constraints.' },
        { id: 6, title: 'Advanced Normalization', status: 'Completed', description: 'BCNF, Multivalued Dependency (4NF).' },
        { id: 7, title: 'Transaction Control (ACID)', status: 'In Progress', description: 'Atomicity, Consistency, Isolation, Durability.' },
        { id: 8, title: 'Concurrency Control', status: 'Locked', description: 'Locks, 2PL, Deadlocks.' },
        { id: 9, title: 'Indexing & Hashing', status: 'Locked', description: 'B-Trees, B+ Trees indexing structures.' },
        { id: 10, title: 'NoSQL Databases', status: 'Locked', description: 'Key-Value, Document, Graph databases.' }
      ]
    },
    {
      id: 'cn',
      title: 'Computer Networks',
      faculty: 'Prof. Ravi',
      progress: 50,
      moduleCount: 10,
      completedModulesCount: 5,
      icon: 'fa-globe',
      description: 'Gain core computer networks telemetry: OSI models, TCP handshake, IP addressing, and routing.',
      modules: [
        { id: 1, title: 'Introduction to Networks', status: 'Completed', description: 'Topologies, OSI 7-layer vs TCP/IP models.' },
        { id: 2, title: 'Physical Layer', status: 'Completed', description: 'Cabling, signals, modulation, multiplexing.' },
        { id: 3, title: 'Data Link Layer (MAC)', status: 'Completed', description: 'Framing, Error control, CSMA/CD, Ethernet.' },
        { id: 4, title: 'Network Layer (IP Routing)', status: 'Completed', description: 'IPv4, IPv6, Subnetting, routing algorithms.' },
        { id: 5, title: 'Transport Layer (TCP/UDP)', status: 'Completed', description: 'Port numbers, TCP 3-way handshake, Flow control.' },
        { id: 6, title: 'Congestion Control', status: 'In Progress', description: 'TCP Reno, AIMD, Leaky/Token bucket.' },
        { id: 7, title: 'Application Layer (DNS/HTTP)', status: 'Locked', description: 'Domain Name System, Hypertext Transfer Protocol.' },
        { id: 8, title: 'Network Security', status: 'Locked', description: 'Symmetric/Asymmetric encryption, Firewalls.' },
        { id: 9, title: 'Wireless Networks', status: 'Locked', description: 'WiFi (802.11), Mobile routing networks.' },
        { id: 10, title: 'Software Defined Networks', status: 'Locked', description: 'SDN controllers, OpenFlow switches.' }
      ]
    }
  ],
  materials: [
    { id: 'mat-ds-u1', title: 'Data Structures Unit 1 Notes', subject: 'Data Structures', type: 'PDF', size: '2.4 MB', uploadedDate: '10 Aug 2026' },
    { id: 'mat-db-norm', title: 'Normalization Reference Guide', subject: 'Database Management', type: 'Notes', size: '1.8 MB', uploadedDate: '12 Aug 2026' },
    { id: 'mat-cn-ip', title: 'IPv4 Subnetting Guide sheet', subject: 'Computer Networks', type: 'Presentation', size: '4.2 MB', uploadedDate: '14 Aug 2026' },
    { id: 'mat-ds-tree', title: 'Binary Trees Lecture Slides', subject: 'Data Structures', type: 'Presentation', size: '3.1 MB', uploadedDate: '15 Aug 2026' }
  ],
  videos: [
    { id: 'vid-ds-intro', title: 'Introduction to Data Structures', course: 'Data Structures', duration: '18:24', progress: 65 },
    { id: 'vid-db-sql', title: 'SQL Joins & Grouping Explained', course: 'Database Management', duration: '24:15', progress: 30 },
    { id: 'vid-cn-tcp', title: 'TCP Three-Way Handshake analysis', course: 'Computer Networks', duration: '14:50', progress: 0 }
  ],
  quizzes: [
    {
      id: 'quiz-ds-arr',
      title: 'Data Structures — Arrays',
      subject: 'Data Structures',
      questionsCount: 3,
      timeLimit: 5, // minutes
      bestScore: '2/3',
      status: 'Attempted',
      questions: [
        {
          id: 1,
          question: 'Which of the following data structures follows the LIFO (Last In First Out) principle?',
          options: ['Queue', 'Stack', 'Array', 'Graph'],
          correctAnswerIndex: 1
        },
        {
          id: 2,
          question: 'What is the time complexity of accessing an element in an array by its index?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
          correctAnswerIndex: 0
        },
        {
          id: 3,
          question: 'Which data structure is typically used to implement recursion?',
          options: ['Queue', 'LinkedList', 'Stack', 'Tree'],
          correctAnswerIndex: 2
        }
      ]
    },
    {
      id: 'quiz-db-sql',
      title: 'DBMS — SQL Queries & Normalization',
      subject: 'Database Management',
      questionsCount: 3,
      timeLimit: 5,
      bestScore: null,
      status: 'Not Attempted',
      questions: [
        {
          id: 1,
          question: 'Which normal form guarantees the removal of partial functional dependency?',
          options: ['1NF', '2NF', '3NF', 'BCNF'],
          correctAnswerIndex: 1
        },
        {
          id: 2,
          question: 'Which SQL keyword is used to sort the result-set?',
          options: ['SORT BY', 'ALIGN BY', 'ORDER BY', 'GROUP BY'],
          correctAnswerIndex: 2
        },
        {
          id: 3,
          question: 'What type of key is used to establish relationship link constraints between tables?',
          options: ['Primary Key', 'Foreign Key', 'Candidate Key', 'Super Key'],
          correctAnswerIndex: 1
        }
      ]
    }
  ],
  progress: {
    overall: 63,
    coursesCount: 3,
    completedCoursesCount: 1,
    quizAverage: 84,
    studyStreak: 7
  }
};
