export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    path: string;
  };
}

export interface QuickPrompt {
  label: string;
  query: string;
}

export const getQuickPromptsForRole = (role: 'student' | 'faculty' | 'admin'): QuickPrompt[] => {
  switch (role) {
    case 'student':
      return [
        { label: 'My Attendance', query: 'What is my attendance percentage?' },
        { label: 'Upcoming Exams', query: 'When are my upcoming exams?' },
        { label: 'Pending Assignments', query: 'Show my pending assignments' },
        { label: 'My Fee Balance', query: 'What is my fee status?' },
        { label: 'Placement Drives', query: 'What placement opportunities am I eligible for?' }
      ];
    case 'faculty':
      return [
        { label: "Today's Schedule", query: 'What are my scheduled classes today?' },
        { label: 'My Courses', query: 'Show my assigned courses and student count' },
        { label: 'Pending Grading', query: 'How many assignments need evaluation?' },
        { label: 'Class Attendance', query: 'What is the attendance rate in my courses?' }
      ];
    case 'admin':
      return [
        { label: 'Campus Statistics', query: 'Show total campus student and faculty enrollment' },
        { label: 'Attendance Audit', query: 'What is the institutional attendance rate?' },
        { label: 'Fee Realization', query: 'Show university fee collection summary' },
        { label: 'Room Conflicts', query: 'Check examination hall conflict status' }
      ];
    default:
      return [
        { label: 'Campus Overview', query: 'Give me an overview of CampusOne' }
      ];
  }
};

export const detectIntentAndRespond = (
  query: string,
  role: 'student' | 'faculty' | 'admin',
  lastIntent: string | null
): { response: string; intent: string; actionButton?: { label: string; path: string } } => {
  const clean = query.toLowerCase().trim();

  // Security checks across all roles
  if (
    clean.includes('password') ||
    clean.includes('secret') ||
    clean.includes('token') ||
    clean.includes('api_key') ||
    clean.includes('database_url') ||
    clean.includes('service_role')
  ) {
    return {
      response: 'Security Policy Alert: Access to system credentials, database secrets, or private authentication tokens is strictly forbidden.',
      intent: 'security'
    };
  }

  // ----------------------------------------------------
  // ROLE 1: STUDENT
  // ----------------------------------------------------
  if (role === 'student') {
    if (clean.includes('attendance') || clean.includes('present') || clean.includes('absent') || clean.includes('classes')) {
      return {
        response: 'Your overall attendance average is 87% (104 of 120 lectures attended). All subjects are in good standing above the 75% threshold.',
        intent: 'attendance',
        actionButton: { label: 'Open Attendance Sheet', path: '/student/timetable' }
      };
    }

    if (clean.includes('assignment') || clean.includes('homework') || clean.includes('pending task') || clean.includes('due')) {
      return {
        response: 'You have 1 pending coursework assignment:\n- "Microservices Deployment on Kubernetes" (Cloud Computing CSE-401) due on 25 Aug 2026.\nTwo other assignments have been graded with an average score of 91.5/100.',
        intent: 'assignments',
        actionButton: { label: 'Open Assignments Desk', path: '/student/assignments' }
      };
    }

    if (clean.includes('exam') || clean.includes('timetable') || clean.includes('test') || clean.includes('midterm') || clean.includes('hall')) {
      return {
        response: 'Your upcoming examinations are:\n1. Mid-Semester Theory Exam 1 (CSE-301) on 25 Aug 2026 at 10:00 AM (Room CSE-204).\n2. DBMS Practical & Viva (CSE-302) on 28 Aug 2026 at 02:00 PM (Computer Lab 3).',
        intent: 'exams',
        actionButton: { label: 'View Exam Schedules', path: '/student/exams' }
      };
    }

    if (clean.includes('result') || clean.includes('gpa') || clean.includes('grade') || clean.includes('marks') || clean.includes('cgpa')) {
      return {
        response: 'Your academic transcript stands at Cumulative CGPA 8.60 / 10.0 and Semester 8 SGPA 8.75. You have completed 160/160 credits with 0 backlogs.',
        intent: 'results',
        actionButton: { label: 'Open Results & GPA', path: '/student/results' }
      };
    }

    if (clean.includes('fee') || clean.includes('bill') || clean.includes('tuition') || clean.includes('receipt') || clean.includes('dues')) {
      return {
        response: 'Your annual tuition fee of ₹85,000 is Paid in Full. Receipt #REC-2026-8901 was verified on 08 Aug 2026 with ₹0 outstanding balance.',
        intent: 'fees',
        actionButton: { label: 'Open Fee Receipts', path: '/student/fees' }
      };
    }

    if (clean.includes('book') || clean.includes('library') || clean.includes('borrow')) {
      return {
        response: 'You currently have 2 library volumes on loan:\n- "Introduction to Algorithms (CLRS)" (Due 22 Aug 2026)\n- "Database System Concepts" (Due 26 Aug 2026).\nOutstanding fine: ₹0.',
        intent: 'library',
        actionButton: { label: 'Open Central Library', path: '/student/library' }
      };
    }

    if (clean.includes('hostel') || clean.includes('room') || clean.includes('mess') || clean.includes('warden')) {
      return {
        response: 'You are resident in Block A (Boys Senior Hostel), Room A-204 (Double AC). Warden: Mr. K. Sharma (+91 98765 11111). Your mess plan is Active.',
        intent: 'hostel',
        actionButton: { label: 'Open Hostel Portal', path: '/student/hostel' }
      };
    }

    if (clean.includes('bus') || clean.includes('transport') || clean.includes('route')) {
      return {
        response: 'You are subscribed to Route 1 (KA-01-FA-1204, Silk Board – HSR – Campus). Morning pickup: 07:15 AM. Driver: Mr. Ramesh Babu (+91 98450 12345).',
        intent: 'transport',
        actionButton: { label: 'Open Transport Fleet', path: '/student/transport' }
      };
    }

    if (clean.includes('job') || clean.includes('placement') || clean.includes('interview') || clean.includes('offer') || clean.includes('company')) {
      return {
        response: 'Placement Status: 8 Applications Submitted, 3 Companies Shortlisted, 1 Confirmed Offer from TechNova Solutions (₹8.5 LPA Associate Software Engineer).',
        intent: 'placements',
        actionButton: { label: 'Open Placements Portal', path: '/student/placements' }
      };
    }

    if (clean.includes('notice') || clean.includes('circular') || clean.includes('holiday') || clean.includes('announcement')) {
      return {
        response: 'Recent Circular: Annual Parent-Teacher Conference (PTC) is scheduled for Saturday, 12 September 2026 in the Main Auditorium.',
        intent: 'notices',
        actionButton: { label: 'View Notice Board', path: '/student/notices' }
      };
    }
  }

  // ----------------------------------------------------
  // ROLE 2: FACULTY
  // ----------------------------------------------------
  if (role === 'faculty') {
    if (clean.includes('course') || clean.includes('class') || clean.includes('today') || clean.includes('schedule')) {
      return {
        response: 'You are teaching 2 active courses this term:\n- CSE-301 (Advanced Data Structures, 60 Students)\n- CSE-302 (Database Management Systems, 60 Students).\nNext class: CSE-301 at 09:00 AM in Room CSE-204.',
        intent: 'courses',
        actionButton: { label: 'Open My Courses', path: '/faculty/courses' }
      };
    }

    if (clean.includes('student') || clean.includes('roster') || clean.includes('enrolled')) {
      return {
        response: 'You have 120 total students registered across CSE-301 and CSE-302. All students have active RFID credentials.',
        intent: 'students',
        actionButton: { label: 'Open Student Roster', path: '/faculty/students' }
      };
    }

    if (clean.includes('attendance') || clean.includes('roll call') || clean.includes('present')) {
      return {
        response: 'Overall attendance in your courses is 86.4%. You can mark session attendance for CSE-301 Section A directly on the roll call grid.',
        intent: 'attendance',
        actionButton: { label: 'Mark Attendance', path: '/faculty/attendance' }
      };
    }

    if (clean.includes('assignment') || clean.includes('grading') || clean.includes('submission')) {
      return {
        response: 'You have published 3 coursework assignments. 54 submissions received for "Binary Search Trees" with 12 submissions awaiting your score valuation.',
        intent: 'assignments',
        actionButton: { label: 'Open Grading Desk', path: '/faculty/assignments' }
      };
    }

    if (clean.includes('exam') || clean.includes('invigilation') || clean.includes('hall')) {
      return {
        response: 'You are assigned as Faculty Invigilator for Mid-Semester Theory Exam 1 on 25 Aug 2026 (10:00 AM – 12:00 PM) in Room CSE-204.',
        intent: 'exams',
        actionButton: { label: 'Open Exam Schedules', path: '/faculty/exams' }
      };
    }
  }

  // ----------------------------------------------------
  // ROLE 3: ADMIN
  // ----------------------------------------------------
  if (role === 'admin') {
    if (clean.includes('statistic') || clean.includes('count') || clean.includes('student') || clean.includes('faculty') || clean.includes('overview')) {
      return {
        response: 'Campus Institutional Snapshot:\n- Total Students: 1,240\n- Faculty Members: 84\n- Active Courses: 48\n- Academic Departments: 8\n- Campus Attendance: 86.4%\n- Fee Realization: ₹1.84 Cr (92%)\n- Placement Offers: 142.',
        intent: 'stats',
        actionButton: { label: 'Open Admin Dashboard', path: '/admin/dashboard' }
      };
    }

    if (clean.includes('fee') || clean.includes('revenue') || clean.includes('collection') || clean.includes('finance')) {
      return {
        response: 'University Fee Ledger: Invoiced ₹2.00 Cr, Collected ₹1.84 Cr (92% Realization), Outstanding Balance ₹16.0 Lakhs across 84 students.',
        intent: 'fees',
        actionButton: { label: 'Manage Fee Collections', path: '/admin/fees' }
      };
    }

    if (clean.includes('exam') || clean.includes('conflict') || clean.includes('hall')) {
      return {
        response: 'Examination Master Schedule: 12 exam papers configured across 8 Halls. Room Conflict Validator reports 0 overlapping room schedules.',
        intent: 'exams',
        actionButton: { label: 'Manage Examinations', path: '/admin/exams' }
      };
    }

    if (clean.includes('report') || clean.includes('export') || clean.includes('csv') || clean.includes('naac')) {
      return {
        response: '9 Institutional Datasets are ready for export in CSV and PDF formats (Admissions, Workload, Attendance Audit, Financial Ledger, Library, Hostel, Transport, Placements).',
        intent: 'reports',
        actionButton: { label: 'Open Reports Center', path: '/admin/reports' }
      };
    }
  }


  // Fallback response
  return {
    response: "I couldn't find specific records matching your query in your CampusOne dataset. You can ask about attendance, assignments, examinations, results, fee receipts, library books, hostel, transport, or placement opportunities.",
    intent: lastIntent || 'general_help',
    actionButton: { label: 'Return to Dashboard', path: `/${role}/dashboard` }
  };
};
