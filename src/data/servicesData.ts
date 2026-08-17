export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  availability: 'Available' | 'Issued' | 'Reserved';
  rating: number;
  isbn: string;
  publisher: string;
  publicationYear: number;
  description: string;
  shelfNumber: string;
  dueDate?: string;
  reservationDate?: string;
}

export interface BorrowLog {
  bookTitle: string;
  borrowedDate: string;
  returnedDate?: string;
  status: 'Active' | 'Returned' | 'Overdue' | 'Reserved';
}

export interface FeeItem {
  category: string;
  amount: number;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface CampusServiceItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  category: 'Documents' | 'Academic' | 'Student Support' | 'Technical' | 'Campus';
  icon: string;
}

export interface RequestTimelineEvent {
  date: string;
  statusText: string;
}

export interface ServiceRequest {
  id: string;
  serviceType: string;
  subject: string;
  description: string;
  createdDate: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';
  lastUpdated: string;
  priority: 'High' | 'Medium' | 'Low';
  timeline: RequestTimelineEvent[];
}

export interface ServicesData {
  books: LibraryBook[];
  borrowHistory: BorrowLog[];
  fees: FeeItem[];
  payments: PaymentTransaction[];
  services: CampusServiceItem[];
  requests: ServiceRequest[];
}

export const servicesData: ServicesData = {
  books: [
    {
      id: 'bk-clean-code',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Software Engineering',
      availability: 'Available',
      rating: 4.8,
      isbn: '978-0132350884',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      shelfNumber: 'SE-302',
      description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Clean Code is divided into three parts: structural writing details, case studies, and heuristics.'
    },
    {
      id: 'bk-db-concepts',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      category: 'Database Management',
      availability: 'Issued',
      rating: 4.5,
      isbn: '978-0073523323',
      publisher: 'McGraw-Hill',
      publicationYear: 2010,
      shelfNumber: 'DB-104',
      dueDate: '14 Sep 2026',
      description: 'Presents the fundamental concepts of database management. Relational databases, SQL, database design, transaction control, indexing, and system architectures.'
    },
    {
      id: 'bk-comp-networks',
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      category: 'Computer Networks',
      availability: 'Available',
      rating: 4.6,
      isbn: '978-0132126953',
      publisher: 'Pearson',
      publicationYear: 2011,
      shelfNumber: 'CN-201',
      description: 'Describes the network structure and operations: Physical layer cabling, Link protocol, TCP sliding window, IP routers, and HTTP transport layers.'
    },
    {
      id: 'bk-os-concepts',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz',
      category: 'Operating Systems',
      availability: 'Available',
      rating: 4.4,
      isbn: '978-1118063330',
      publisher: 'Wiley',
      publicationYear: 2012,
      shelfNumber: 'OS-204',
      description: 'Introduces operating system designs: process scheduling, threads, CPU memory management, virtual memory, file systems, and system synchronization.'
    }
  ],
  borrowHistory: [
    { bookTitle: 'Clean Code', borrowedDate: '10 Jul 2026', returnedDate: '05 Aug 2026', status: 'Returned' },
    { bookTitle: 'Database System Concepts', borrowedDate: '15 Aug 2026', status: 'Active' }
  ],
  fees: [
    { category: 'Tuition Fee', amount: 60000 },
    { category: 'Library Fee', amount: 5000 },
    { category: 'Laboratory Fee', amount: 8000 },
    { category: 'Hostel Fee', amount: 7000 },
    { category: 'Transport Fee', amount: 5000 }
  ],
  payments: [
    { id: 'CH2026PAY001120', date: '05 Jun 2026', description: 'Admission Deposit', amount: 25000, method: 'Net Banking', status: 'Paid' },
    { id: 'CH2026PAY001210', date: '15 Jul 2026', description: 'Tuition Fee (Part 1)', amount: 47500, method: 'UPI', status: 'Paid' }
  ],
  services: [
    { id: 'srv-digital-id', title: 'Student ID Card', description: 'View and download your digital student ID badge.', actionText: 'Open ID', category: 'Campus', icon: 'fa-id-card' },
    { id: 'srv-bonafide', title: 'Bonafide Certificate', description: 'Request a digital certificate confirming enrollment.', actionText: 'Request Cert', category: 'Documents', icon: 'fa-file-signature' },
    { id: 'srv-nodue', title: 'No Due Certificate', description: 'Request a no-due clearance form for academic terms.', actionText: 'Apply No Due', category: 'Documents', icon: 'fa-clipboard-check' },
    { id: 'srv-course-cert', title: 'Course Certificate', description: 'Apply for completed curriculum modules certificates.', actionText: 'Request Doc', category: 'Academic', icon: 'fa-award' },
    { id: 'srv-leave', title: 'Leave Request', description: 'Submit leave request notes directly to department.', actionText: 'Apply Leave', category: 'Academic', icon: 'fa-calendar-minus' },
    { id: 'srv-grievance', title: 'Grievance Form', description: 'Submit institutional feedback or support tickets.', actionText: 'Create Grievance', category: 'Student Support', icon: 'fa-hand-holding-hand' },
    { id: 'srv-tech-support', title: 'Technical Support', description: 'Log network errors, login issues, or system crashes.', actionText: 'Open Ticket', category: 'Technical', icon: 'fa-screwdriver-wrench' },
    { id: 'srv-help-desk', title: 'Help Desk', description: 'Contact campus support administrators or counselors.', actionText: 'Call Support', category: 'Student Support', icon: 'fa-circle-question' }
  ],
  requests: [
    {
      id: 'REQ-1001',
      serviceType: 'Bonafide Certificate',
      subject: 'Certificate Request',
      description: 'Requesting bonafide certificate for passport application processing.',
      createdDate: '15 Aug 2026',
      status: 'Under Review',
      lastUpdated: '16 Aug 2026',
      priority: 'Medium',
      timeline: [
        { date: '15 Aug 2026 10:00 AM', statusText: 'Request submitted' },
        { date: '15 Aug 2026 02:00 PM', statusText: 'Request assigned to administration' },
        { date: '16 Aug 2026 11:30 AM', statusText: 'Request under review' }
      ]
    }
  ]
};
export default servicesData;
