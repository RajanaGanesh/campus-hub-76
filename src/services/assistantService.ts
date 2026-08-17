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

export const detectIntentAndRespond = (
  query: string,
  role: 'student' | 'faculty' | 'admin' | 'parent',
  lastIntent: string | null
): { response: string; intent: string; actionButton?: { label: string; path: string } } => {
  const clean = query.toLowerCase().trim();

  // Role checks
  if (role === 'student') {
    // 1. Attendance
    if (clean.includes('attendance') || clean.includes('present') || clean.includes('absent')) {
      return {
        response: 'Your overall attendance average is 86%. Data Structures is good at 85%, and Database Management (DBMS) is currently your lowest at 72% (which is below the recommended 75% threshold).',
        intent: 'attendance',
        actionButton: { label: 'View Attendance Details', path: '/attendance' }
      };
    }

    // 2. Assignments
    if (clean.includes('assignment') || clean.includes('pending') || clean.includes('due') || clean.includes('homework')) {
      return {
        response: 'You have 2 pending assignments due soon:\n1. "Binary Tree Implementation" (Data Structures) due 25 Aug 2026\n2. "Normal Form Normalization" (Database Management) due 28 Aug 2026.',
        intent: 'assignments',
        actionButton: { label: 'Open Assignments Desk', path: '/assignments' }
      };
    }

    // 3. Exams
    if (clean.includes('exam') || clean.includes('test') || clean.includes('schedule') || clean.includes('midterm')) {
      return {
        response: 'Your next exam is "Database Midterms Theory" (CSE-302) scheduled for 21 Aug 2026. You also have "Computer Networks Lab" (CSE-303) on 25 Aug 2026.',
        intent: 'exams',
        actionButton: { label: 'View Exam Schedules', path: '/exams' }
      };
    }

    // 4. Results
    if (clean.includes('result') || clean.includes('grade') || clean.includes('marks') || clean.includes('score')) {
      return {
        response: 'Your Midterm 1 results are published:\n- Data Structures: Internal 26/30, External 58/70 (Grade A)\n- Database Management: Internal 28/30, External 62/70 (Grade A+).',
        intent: 'results',
        actionButton: { label: 'Open Academic Results', path: '/results' }
      };
    }

    // 5. Library
    if (clean.includes('book') || clean.includes('library') || clean.includes('borrow')) {
      return {
        response: 'You have 2 books currently issued. "Introduction to Algorithms" (CLRS) is due soon on 18th Aug. Avoid overdue fees by returning it on time.',
        intent: 'library',
        actionButton: { label: 'Open Library Catalog', path: '/library' }
      };
    }

    // 6. Fees
    if (clean.includes('fee') || clean.includes('bill') || clean.includes('pay') || clean.includes('pending fee')) {
      return {
        response: 'Your total fee is ₹2,45,000. You have paid ₹1,80,000, leaving a pending balance of ₹65,000. Next due date is 24th Aug 2026.',
        intent: 'fees',
        actionButton: { label: 'Open Fees & Payments', path: '/fees' }
      };
    }

    // 7. Placements
    if (clean.includes('job') || clean.includes('placement') || clean.includes('company') || clean.includes('eligible')) {
      return {
        response: 'You are eligible for 5 new opportunities. Your CGPA (8.6) matches TechNova Software Developer (required 7.5). The application deadline is 22nd Aug.',
        intent: 'placements',
        actionButton: { label: 'Open Placements Portal', path: '/placements' }
      };
    }

    // 8. Hostel / Mess
    if (clean.includes('hostel') || clean.includes('room') || clean.includes('roommate') || clean.includes('mess') || clean.includes('lunch') || clean.includes('dinner')) {
      if (clean.includes('mess') || clean.includes('lunch') || clean.includes('dinner') || clean.includes('food')) {
        return {
          response: 'Hostel mess is active. Lunch is between 12:30 PM and 2:00 PM. Dinner is between 7:30 PM and 9:00 PM. Today\'s dinner features Roti, Paneer Butter Masala, and Dal Fry.',
          intent: 'mess',
          actionButton: { label: 'View Mess Dining Menu', path: '/hostel/mess' }
        };
      }
      return {
        response: 'You are assigned to Krishna Boys Hostel (B Block), Room B-204 (4 Sharing). Your active roommates are Arun Kumar, Rahul Kumar, and Amit Patel.',
        intent: 'hostel',
        actionButton: { label: 'Open Hostel Dashboard', path: '/hostel' }
      };
    }

    // 9. Transport / Bus
    if (clean.includes('bus') || clean.includes('transport') || clean.includes('route') || clean.includes('track') || clean.includes('pass')) {
      return {
        response: 'You are assigned to Route 12 (Miyapur bus AP 39 AB 1234). The scheduled morning pickup time is 08:05 AM. Your digital transport pass is Active.',
        intent: 'transport',
        actionButton: { label: 'Track Shuttle Bus', path: '/transport' }
      };
    }

    // 10. Timetable
    if (clean.includes('timetable') || clean.includes('class') || clean.includes('schedule') || clean.includes('next class')) {
      return {
        response: 'Your next scheduled class today is "Database Management Systems" in Room CSE-202 at 10:30 AM.',
        intent: 'timetable',
        actionButton: { label: 'View Timetable Schedule', path: '/timetable' }
      };
    }

    // 11. Follow-ups
    if (lastIntent === 'attendance' && (clean.includes('lowest') || clean.includes('low') || clean.includes('attention'))) {
      return {
        response: 'Your lowest attendance is in Database Management (CSE-302) at 72%. It is recommended to attend the next 3 lectures to cross the 75% bar.',
        intent: 'attendance',
        actionButton: { label: 'View Attendance Details', path: '/attendance' }
      };
    }

    if (lastIntent === 'attendance' && (clean.includes('detail') || clean.includes('show') || clean.includes('more'))) {
      return {
        response: 'Opening your detailed attendance profile.',
        intent: 'attendance',
        actionButton: { label: 'Open Attendance Dashboard', path: '/attendance' }
      };
    }
  }

  if (role === 'faculty') {
    if (clean.includes('student') || clean.includes('roll') || clean.includes('roster')) {
      return {
        response: 'You have 124 total students registered across your 4 active course sections.',
        intent: 'students',
        actionButton: { label: 'Open Students Roster', path: '/faculty/students' }
      };
    }

    if (clean.includes('course') || clean.includes('subject') || clean.includes('class') || clean.includes('schedule')) {
      return {
        response: 'You are teaching 2 courses this semester:\n- CSE-301 (Data Structures, Section A)\n- CSE-302 (Database Management, Section B).',
        intent: 'courses',
        actionButton: { label: 'Manage My Courses', path: '/faculty/courses' }
      };
    }

    if (clean.includes('assignment') || clean.includes('submission') || clean.includes('grade') || clean.includes('mark')) {
      return {
        response: 'You have 12 ungraded assignment submissions for "Binary Tree Implementation" (ASSIGN-101) pending your review.',
        intent: 'assignments',
        actionButton: { label: 'Open Grading Portal', path: '/faculty/assignments' }
      };
    }

    if (clean.includes('attendance') || clean.includes('roll call')) {
      return {
        response: 'Your classes show an average presence of 86%. You can mark today\'s attendance for CSE-302 now.',
        intent: 'attendance',
        actionButton: { label: 'Open Attendance Sheet', path: '/faculty/attendance' }
      };
    }
  }

  if (role === 'admin') {
    if (clean.includes('student') || clean.includes('enroll')) {
      return {
        response: 'Total enrollment stands at 2,450 students. You can register new students or suspend accounts in the Student center.',
        intent: 'students',
        actionButton: { label: 'Manage Students', path: '/admin/students' }
      };
    }

    if (clean.includes('faculty') || clean.includes('teacher') || clean.includes('professor')) {
      return {
        response: 'The campus has 142 registered faculty members. You can review designations or assign courses in the Faculty center.',
        intent: 'faculty',
        actionButton: { label: 'Manage Faculty', path: '/admin/faculty' }
      };
    }

    if (clean.includes('request') || clean.includes('complaint') || clean.includes('ticket')) {
      return {
        response: 'There are 34 pending support tickets, including 12 hostel maintenance issues that require your review.',
        intent: 'requests',
        actionButton: { label: 'Manage Service Requests', path: '/admin/requests' }
      };
    }

    if (clean.includes('fee') || clean.includes('collection')) {
      return {
        response: 'Overall fee collection collection percentage is at 85% (Total collected: ₹2.97 Cr, Pending dues: ₹37.5L).',
        intent: 'fees',
        actionButton: { label: 'Open Fee Analytics', path: '/admin/fees' }
      };
    }

    // Security check - student stats requested by non-admin?
    if (clean.includes('passwords') || clean.includes('token') || clean.includes('secret')) {
      return {
        response: 'Access Denied: Exposing credentials or private authentication tokens is strictly forbidden for security reasons.',
        intent: 'security'
      };
    }
  }

  // Fallback
  return {
    response: "I'm not sure about that yet in Campus AI Demo Mode. Try asking about attendance, assignments, exams, results, library, fees, placements, hostel or transport.",
    intent: 'fallback',
    actionButton: { label: 'Open Help Center', path: '/help' }
  };
};
