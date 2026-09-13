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
  students: [],
  faculty: [],
  courses: [],
  assignments: [],
  submissions: [],
  examMarks: [],
  announcements: []
};

// Legacy sample data ID blacklist to purge stale localStorage caches
const SAMPLE_IDS = new Set([
  '236F1A0551', '236F1A0502', '236F1A0503', '236F1A0412', '236F1A0522',
  'FAC-101', 'FAC-102', 'FAC-103',
  'CSE-301', 'CSE-302', 'CSE-303', 'ECE-304', 'CSE-304', 'CSE-305',
  'ASSIGN-101', 'ASSIGN-102', 'ASSIGN-103', 'ASSIGN-104', 'ASSIGN-105',
  'SUB-201', 'SUB-202', 'SUB-203', 'SUB-204', 'SUB-205', 'SUB-206', 'SUB-207',
  'ANN-101', 'ANN-102', 'ANN-103'
]);

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

    const rawAssignments: ManagementAssignment[] = Array.isArray(parsed.assignments) ? parsed.assignments : [];
    const mergedAssignments = rawAssignments.filter(a => !SAMPLE_IDS.has(a.id) && !SAMPLE_IDS.has(a.courseCode));

    const rawSubmissions: AssignmentSubmission[] = Array.isArray(parsed.submissions) ? parsed.submissions : [];
    const mergedSubmissions = rawSubmissions.filter(s => !SAMPLE_IDS.has(s.id) && !SAMPLE_IDS.has(s.assignmentId) && !SAMPLE_IDS.has(s.studentId));

    const rawStudents: StudentRecord[] = Array.isArray(parsed.students) ? parsed.students : [];
    const storedStudents = rawStudents.filter(s => !SAMPLE_IDS.has(s.id) && s.email !== 'student@campushub.com');

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

    const rawFacultyList: FacultyRecord[] = Array.isArray(parsed.faculty) ? parsed.faculty : [];
    const rawFaculty = rawFacultyList.filter(f => !SAMPLE_IDS.has(f.id) && f.email !== 'faculty@campushub.com');

    const rawCoursesList: CourseRecord[] = Array.isArray(parsed.courses) ? parsed.courses : [];
    const rawCourses = rawCoursesList.filter(c => !SAMPLE_IDS.has(c.code));

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

    const rawExamMarks: ExamMarkRecord[] = Array.isArray(parsed.examMarks) ? parsed.examMarks : [];
    const mergedExamMarks = rawExamMarks.filter(e => !SAMPLE_IDS.has(e.studentId) && !SAMPLE_IDS.has(e.courseCode));

    const rawAnnouncements: ManagementAnnouncement[] = Array.isArray(parsed.announcements) ? parsed.announcements : [];
    const mergedAnnouncements = rawAnnouncements.filter(a => !SAMPLE_IDS.has(a.id));

    return {
      students: mergedStudents,
      faculty: syncedFaculty,
      courses: syncedCourses,
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
      courses: coursesCopy
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


