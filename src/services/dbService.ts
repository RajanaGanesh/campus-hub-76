import { supabase } from '../lib/supabase';
import { studentDashboardData, StudentDashboardData } from '../data/studentDashboardData';
import {
  StudentRecord,
  FacultyRecord,
  AssignmentSubmission,
  getManagementData,
  saveManagementData
} from '../data/managementData';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const dbService = {
  /**
   * Fetch all students from Supabase database with fallback to local management data
   */
  async getStudents(): Promise<StudentRecord[]> {
    const mgmt = getManagementData();
    const localSubmissions = mgmt.submissions || [];
    const localStudents = mgmt.students || [];
    const localStudentsMap = new Map(localStudents.map(s => [(s.id || '').toUpperCase(), s]));

    if (!supabase) {
      return localStudents.map(s => {
        const sId = (s.id || '').toLowerCase().trim();
        const sName = (s.name || '').toLowerCase().trim();
        const sEmail = (s.email || '').toLowerCase().trim();

        const matchingSubs = localSubmissions.filter(
          sub => {
            const subStuId = (sub.studentId || '').toLowerCase().trim();
            const subStuName = (sub.studentName || '').toLowerCase().trim();
            const matches =
              subStuId === sId ||
              subStuName === sName ||
              subStuId === sEmail ||
              (sName.length >= 3 && subStuName.includes(sName)) ||
              (subStuId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          }
        );
        return {
          ...s,
          assignmentsCompleted: matchingSubs.length
        };
      });
    }

    try {
      const [studentsRes, profilesRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('profiles').select('*')
      ]);

      if (studentsRes.error) {
        console.warn('Could not query students from Supabase:', studentsRes.error);
        return localStudents;
      }

      const studentsData = studentsRes.data || [];
      if (studentsData.length === 0) {
        return localStudents;
      }

      const profilesMap = new Map<string, any>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.id) profilesMap.set(p.id, p);
        if (p.email) profilesMap.set(p.email.toLowerCase(), p);
      });

      return studentsData.map((row: any) => {
        const profile = profilesMap.get(row.id) || {};
        const yearSectionParts = (row.year_section || '4 - A').split('-');
        const yearVal = yearSectionParts[0]?.trim() || '4';
        const sectionVal = yearSectionParts[1]?.trim() || 'A';
        const stuId = row.student_id || row.id;
        const stuName = profile.name || row.name || 'Student Candidate';
        const stuEmail = profile.email || `${(row.student_id || row.id).toLowerCase()}@campushub.edu`;

        const localStu = localStudentsMap.get((stuId || '').toUpperCase());

        const sId = (stuId || '').toLowerCase().trim();
        const sName = stuName.toLowerCase().trim();
        const sEmail = stuEmail.toLowerCase().trim();

        const matchingSubs = localSubmissions.filter(
          sub => {
            const subStuId = (sub.studentId || '').toLowerCase().trim();
            const subStuName = (sub.studentName || '').toLowerCase().trim();
            const matches =
              subStuId === sId ||
              subStuName === sName ||
              subStuId === sEmail ||
              (sName.length >= 3 && subStuName.includes(sName)) ||
              (subStuId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          }
        );

        const assignmentsCount = matchingSubs.length;

        return {
          id: stuId,
          name: stuName,
          email: stuEmail,
          phone: profile.phone || localStu?.phone || '+91 9876543210',
          department: row.department || localStu?.department || 'CSE',
          year: yearVal.includes('Year') ? yearVal : `${yearVal} Year`,
          section: sectionVal.replace(/^Sec\s*/i, ''),
          cgpa: Number(row.cgpa) || localStu?.cgpa || 8.0,
          attendancePercent: localStu?.attendancePercent || 88,
          assignmentsCompleted: assignmentsCount,
          performance: (Number(row.cgpa) >= 8.5 ? 'Excellent' : Number(row.cgpa) >= 7.5 ? 'Good' : 'Average') as any,
          status: 'Active'
        };
      });
    } catch (err) {
      console.warn('Supabase getStudents failed:', err);
      return localStudents;
    }
  },

  /**
   * Add a new student to Supabase (Auth + profiles + students tables)
   */
  async addStudent(student: StudentRecord): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const email = student.email.toLowerCase().trim();
      const studentId = student.id.toUpperCase().trim();
      const yearSection = `${student.year} - Sec ${student.section}`;

      // 1. Attempt Auth registration to auto-provision user in auth.users and trigger profiles & students creation
      let userId: string | null = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: 'student123',
          options: {
            data: {
              name: student.name.trim(),
              role: 'student',
              student_id: studentId,
              department: student.department || 'Computer Science & Engineering',
              year_section: yearSection
            }
          }
        });

        if (!authError && authData.user?.id) {
          userId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Auth signup notice (may already exist):', authErr);
      }

      // 2. Check if profile ID exists in profiles table
      if (!userId) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile?.id) {
          userId = existingProfile.id;
        }
      }

      // 3. Update/upsert profiles record
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name: student.name.trim(),
            role: 'student',
            updated_at: new Date().toISOString()
          } as any);

        // 4. Update/upsert students record
        const { error: stuError } = await supabase
          .from('students')
          .upsert({
            id: userId,
            student_id: studentId,
            department: student.department || 'Computer Science & Engineering',
            year_section: yearSection,
            cgpa: Number(student.cgpa) || 8.0
          } as any, { onConflict: 'id' });

        if (stuError) {
          console.warn('Error inserting students record:', stuError);
        }
      } else {
        // Fallback direct insert if profiles allows standalone UUIDs
        const generatedId = generateUUID();
        await supabase.from('profiles').insert({
          id: generatedId,
          email,
          name: student.name.trim(),
          role: 'student'
        } as any);

        await supabase.from('students').insert({
          id: generatedId,
          student_id: studentId,
          department: student.department || 'Computer Science & Engineering',
          year_section: yearSection,
          cgpa: Number(student.cgpa) || 8.0
        } as any);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception storing student to Supabase:', err);
      return { success: false, error: err?.message || 'Database connection error' };
    }
  },

  /**
   * Update student details in Supabase
   */
  async updateStudent(student: StudentRecord): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const studentId = student.id.toUpperCase().trim();
      const email = student.email.toLowerCase().trim();
      const yearSection = `${student.year} - Sec ${student.section}`;

      // 1. Locate student row by student_id or email
      const { data: stuRecord } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', studentId)
        .maybeSingle();

      if (stuRecord?.id) {
        await supabase
          .from('profiles')
          .update({
            name: student.name.trim(),
            email,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', stuRecord.id);

        await supabase
          .from('students')
          .update({
            department: student.department,
            year_section: yearSection,
            cgpa: Number(student.cgpa) || 8.0
          } as any)
          .eq('id', stuRecord.id);
      } else {
        return await this.addStudent(student);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception updating student in Supabase:', err);
      return { success: false, error: err?.message };
    }
  },

  /**
   * Delete student from Supabase
   */
  async deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const { data: stuRecord } = await supabase
        .from('students')
        .select('id')
        .eq('student_id', studentId.toUpperCase().trim())
        .maybeSingle();

      if (stuRecord?.id) {
        await supabase.from('students').delete().eq('id', stuRecord.id);
        await supabase.from('profiles').delete().eq('id', stuRecord.id);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception deleting student in Supabase:', err);
      return { success: false, error: err?.message };
    }
  },

  /**
   * Fetch all faculty members from Supabase database
   */
  async getFaculty(): Promise<FacultyRecord[]> {
    if (!supabase) {
      return getManagementData().faculty;
    }

    try {
      const [facultyRes, profilesRes] = await Promise.all([
        supabase.from('faculty').select('*'),
        supabase.from('profiles').select('*')
      ]);

      if (facultyRes.error) {
        console.warn('Could not query faculty from Supabase:', facultyRes.error);
        return getManagementData().faculty;
      }

      const facultyData = facultyRes.data || [];
      if (facultyData.length === 0) {
        return getManagementData().faculty;
      }

      const profilesMap = new Map<string, any>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.id) profilesMap.set(p.id, p);
        if (p.email) profilesMap.set(p.email.toLowerCase(), p);
      });

      return facultyData.map((row: any) => {
        const profile = profilesMap.get(row.id) || {};
        return {
          id: row.faculty_id || row.id,
          name: profile.name || row.name || 'Faculty Member',
          email: profile.email || `${(row.faculty_id || row.id).toLowerCase()}@campushub.edu`,
          department: row.department || 'CSE',
          designation: row.designation || 'Assistant Professor',
          courses: ['CSE-301', 'CSE-302'],
          status: 'Active'
        };
      });
    } catch (err) {
      console.warn('Supabase getFaculty failed:', err);
      return getManagementData().faculty;
    }
  },

  /**
   * Add a new faculty member to Supabase (Auth + profiles + faculty tables)
   */
  async addFaculty(faculty: FacultyRecord): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const email = faculty.email.toLowerCase().trim();
      const facultyId = faculty.id.toUpperCase().trim();

      // 1. Attempt Auth registration to auto-provision user in auth.users and trigger profiles & faculty creation
      let userId: string | null = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: 'faculty123',
          options: {
            data: {
              name: faculty.name.trim(),
              role: 'faculty',
              faculty_id: facultyId,
              department: faculty.department || 'Computer Science & Engineering',
              designation: faculty.designation || 'Assistant Professor'
            }
          }
        });

        if (!authError && authData.user?.id) {
          userId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Auth signup notice (may already exist):', authErr);
      }

      // 2. Check if profile ID exists in profiles table
      if (!userId) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (existingProfile?.id) {
          userId = existingProfile.id;
        }
      }

      // 3. Update/upsert profiles record
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email,
            name: faculty.name.trim(),
            role: 'faculty',
            updated_at: new Date().toISOString()
          } as any);

        // 4. Update/upsert faculty record
        const { error: facError } = await supabase
          .from('faculty')
          .upsert({
            id: userId,
            faculty_id: facultyId,
            department: faculty.department || 'Computer Science & Engineering',
            designation: faculty.designation || 'Assistant Professor'
          } as any, { onConflict: 'id' });

        if (facError) {
          console.warn('Error inserting faculty record:', facError);
        }
      } else {
        // Fallback direct insert if profiles allows standalone UUIDs
        const generatedId = generateUUID();
        await supabase.from('profiles').insert({
          id: generatedId,
          email,
          name: faculty.name.trim(),
          role: 'faculty'
        } as any);

        await supabase.from('faculty').insert({
          id: generatedId,
          faculty_id: facultyId,
          department: faculty.department || 'Computer Science & Engineering',
          designation: faculty.designation || 'Assistant Professor'
        } as any);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception storing faculty to Supabase:', err);
      return { success: false, error: err?.message || 'Database connection error' };
    }
  },

  /**
   * Update faculty details in Supabase
   */
  async updateFaculty(faculty: FacultyRecord): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const facultyId = faculty.id.toUpperCase().trim();
      const email = faculty.email.toLowerCase().trim();

      const { data: facRecord } = await supabase
        .from('faculty')
        .select('id')
        .eq('faculty_id', facultyId)
        .maybeSingle();

      if (facRecord?.id) {
        await supabase
          .from('profiles')
          .update({
            name: faculty.name.trim(),
            email,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', facRecord.id);

        await supabase
          .from('faculty')
          .update({
            department: faculty.department,
            designation: faculty.designation
          } as any)
          .eq('id', facRecord.id);
      } else {
        return await this.addFaculty(faculty);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception updating faculty in Supabase:', err);
      return { success: false, error: err?.message };
    }
  },

  /**
   * Delete faculty from Supabase
   */
  async deleteFaculty(facultyId: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const { data: facRecord } = await supabase
        .from('faculty')
        .select('id')
        .eq('faculty_id', facultyId.toUpperCase().trim())
        .maybeSingle();

      if (facRecord?.id) {
        await supabase.from('faculty').delete().eq('id', facRecord.id);
        await supabase.from('profiles').delete().eq('id', facRecord.id);
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Exception deleting faculty in Supabase:', err);
      return { success: false, error: err?.message };
    }
  },
  async getStudentDashboardData(email: string): Promise<StudentDashboardData> {
    if (!supabase) {
      return studentDashboardData;
    }

    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profileData) throw new Error(profileError?.message || 'Profile not found');

      // 2. Fetch student details
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', profileData.id)
        .single();

      if (studentError || !studentData) throw new Error(studentError?.message || 'Student details not found');

      // 3. Fetch attendance summaries
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*, courses(name)')
        .eq('student_id', profileData.id);

      let attendanceSubjects = studentDashboardData.attendanceSubjects;
      if (attendanceData && attendanceData.length > 0) {
        const coursesMap: Record<string, { present: number; total: number }> = {};
        attendanceData.forEach((att: any) => {
          const courseName = att.courses?.name || 'Unspecified';
          if (!coursesMap[courseName]) {
            coursesMap[courseName] = { present: 0, total: 0 };
          }
          coursesMap[courseName].total += 1;
          if (att.status === 'Present' || att.status === 'Late') {
            coursesMap[courseName].present += 1;
          }
        });

        attendanceSubjects = Object.keys(coursesMap).map(name => {
          const { present, total } = coursesMap[name];
          const percentage = Math.round((present / total) * 100);
          const status = percentage >= 85 ? 'safe' : (percentage >= 75 ? 'warning' : 'critical');
          return { name, percentage, status };
        });
      }

      const overallAttendance = attendanceSubjects.length > 0
        ? Math.round(attendanceSubjects.reduce((acc, s) => acc + s.percentage, 0) / attendanceSubjects.length)
        : 86;

      // 4. Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(*, courses(name))')
        .eq('student_id', profileData.id);

      let assignmentsList = studentDashboardData.assignments;
      if (assignmentsData && assignmentsData.length > 0) {
        assignmentsList = assignmentsData.map((sub: any) => {
          const assignment = sub.assignments || {};
          const course = assignment.courses || {};
          const daysLeft = assignment.due_date ? Math.ceil((new Date(assignment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
          return {
            subject: course.name || 'General',
            title: assignment.title || 'Untitled',
            due: daysLeft > 0 ? `${daysLeft} days left` : 'Expired',
            status: sub.status as any,
            priority: daysLeft <= 2 ? 'High' as const : (daysLeft <= 5 ? 'Medium' as const : 'Low' as const)
          };
        });
      }

      // 5. Fetch upcoming exams
      const { data: examsData } = await supabase
        .from('exams')
        .select('*, courses(name)')
        .order('date', { ascending: true })
        .limit(5);

      let examsList = studentDashboardData.exams;
      if (examsData && examsData.length > 0) {
        examsList = examsData.map((ex: any) => {
          const daysLeft = Math.ceil((new Date(ex.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return {
            subject: ex.courses?.name || 'General',
            date: new Date(ex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: ex.time || '10:00 AM',
            room: ex.classroom || 'Room Main',
            daysLeft: daysLeft > 0 ? daysLeft : 0
          };
        });
      }

      // 6. Fetch results
      const { data: resultsData } = await supabase
        .from('results')
        .select('*, courses(name)')
        .eq('student_id', profileData.id);

      let resultsList = studentDashboardData.results;
      if (resultsData && resultsData.length > 0) {
        resultsList = resultsData.map((res: any) => ({
          subject: res.courses?.name || 'Subject',
          internal: 25,
          external: res.marks_obtained,
          total: res.marks_obtained + 25,
          grade: res.grade || 'A'
        }));
      }

      // 7. Fetch fees
      const { data: feesData } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', profileData.id);

      let feesSummary = studentDashboardData.fees;
      if (feesData && feesData.length > 0) {
        const total = feesData.reduce((acc: number, f: any) => acc + Number(f.amount), 0);
        const paid = feesData.filter((f: any) => f.status === 'Paid').reduce((acc: number, f: any) => acc + Number(f.amount), 0);
        const pending = total - paid;
        const upcomingOverdue = feesData.find((f: any) => f.status !== 'Paid');
        feesSummary = {
          total,
          paid,
          pending,
          dueDate: upcomingOverdue ? new Date(upcomingOverdue.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No dues'
        };
      }

      // 8. Fetch library issued books
      const { data: libraryData } = await supabase
        .from('library_borrows')
        .select('*, library_books(*)')
        .eq('student_id', profileData.id)
        .is('return_date', null);

      let librarySummary = studentDashboardData.library;
      if (libraryData && libraryData.length > 0) {
        const books = libraryData.map((borrow: any) => {
          const book = borrow.library_books || {};
          const daysLeft = Math.ceil((new Date(borrow.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const status = daysLeft < 0 ? 'overdue' as const : (daysLeft <= 3 ? 'due-soon' as const : 'active' as const);
          return {
            title: book.title || 'Untitled',
            author: book.author || 'Unknown',
            due: new Date(borrow.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            status
          };
        });

        const dueSoonCount = books.filter(b => b.status === 'due-soon').length;
        const overdueCount = books.filter(b => b.status === 'overdue').length;

        librarySummary = {
          issued: books.length,
          dueSoonCount,
          overdueCount,
          books
        };
      }

      // 9. Fetch placements
      const { data: placementsData } = await supabase
        .from('placement_jobs')
        .select('*')
        .order('deadline', { ascending: true })
        .limit(5);

      let placementsList = studentDashboardData.placements;
      if (placementsData && placementsData.length > 0) {
        placementsList = placementsData.map((job: any) => ({
          role: job.role,
          company: job.company,
          package: job.package,
          eligibility: `CGPA ${job.cutoff_cgpa}+`,
          deadline: new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        }));
      }

      // 10. Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      let notificationsList = studentDashboardData.notifications;
      if (notificationsData && notificationsData.length > 0) {
        notificationsList = notificationsData.map((not: any) => ({
          id: not.id,
          icon: not.unread ? 'fa-bell' : 'fa-envelope-open',
          title: not.title + ': ' + not.description,
          time: new Date(not.created_at).toLocaleDateString('en-IN'),
          unread: not.unread
        }));
      }

      return {
        profile: {
          studentId: studentData.student_id,
          department: studentData.department,
          yearSection: studentData.year_section,
          semester: '8th Semester',
          email: profileData.email,
          avatarInitials: profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'US'
        },
        stats: [
          { icon: 'fa-user-check', title: 'Attendance', value: `${overallAttendance}%`, description: 'Overall Attendance', status: overallAttendance >= 75 ? 'Good' : 'Critical', statusType: overallAttendance >= 85 ? 'good' : 'due', progress: overallAttendance, colorVariant: overallAttendance >= 75 ? 'primary' : 'red' },
          { icon: 'fa-award', title: 'CGPA', value: studentData.cgpa ? studentData.cgpa.toString() : '8.6', description: 'Current CGPA', status: 'Excellent', statusType: 'excellent', colorVariant: 'cyan' },
          { icon: 'fa-file-invoice', title: 'Assignments', value: assignmentsList.filter(a => a.status === 'Pending').length.toString(), description: 'Pending Assignments', status: 'Due Soon', statusType: 'due', colorVariant: 'green' },
          { icon: 'fa-receipt', title: 'Exams', value: examsList.length.toString(), description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
          { icon: 'fa-wallet', title: 'Pending Fees', value: `₹${feesSummary.pending.toLocaleString('en-IN')}`, description: 'Pending Tuition', status: feesSummary.pending > 0 ? 'Due Soon' : 'Paid', statusType: feesSummary.pending > 0 ? 'due' : 'good', colorVariant: feesSummary.pending > 0 ? 'red' : 'green' },
          { icon: 'fa-book-open', title: 'Library Books', value: librarySummary.issued.toString(), description: 'Books Issued', status: 'Active', statusType: 'active', colorVariant: 'cyan' }
        ],
        overallAttendance,
        attendanceSubjects,
        performanceHistory: studentDashboardData.performanceHistory,
        timetable: studentDashboardData.timetable,
        assignments: assignmentsList,
        exams: examsList,
        results: resultsList,
        fees: feesSummary,
        library: librarySummary,
        placements: placementsList,
        announcements: studentDashboardData.announcements,
        notifications: notificationsList,
        activities: studentDashboardData.activities
      };
    } catch (err) {
      console.warn('Supabase query failed, using local fallback state:', err);
      return studentDashboardData;
    }
  },

  /**
   * Submit an assignment for a student (syncs locally and to Supabase)
   */
  async submitAssignment(submission: AssignmentSubmission, userEmail?: string): Promise<{ success: boolean; error?: string }> {
    // 1. Update local management data storage
    const mgmt = getManagementData();
    const cleanStudentId = (submission.studentId || '').toLowerCase().trim();
    const cleanStudentName = (submission.studentName || '').toLowerCase().trim();
    const cleanEmail = (userEmail || '').toLowerCase().trim();

    const existingIdx = (mgmt.submissions || []).findIndex(
      (s) =>
        s.assignmentId === submission.assignmentId &&
        ((cleanStudentId && s.studentId.toLowerCase().trim() === cleanStudentId) ||
         (cleanStudentName && s.studentName.toLowerCase().trim() === cleanStudentName) ||
         (cleanEmail && s.studentId.toLowerCase().trim() === cleanEmail))
    );

    let updatedSubmissions = [...(mgmt.submissions || [])];
    if (existingIdx >= 0) {
      updatedSubmissions[existingIdx] = submission;
    } else {
      updatedSubmissions = [submission, ...updatedSubmissions];
    }

    // Compute updated completed assignments count for this student
    const studentCompletedCount = updatedSubmissions.filter(
      (s) => {
        const subStuId = (s.studentId || '').toLowerCase().trim();
        const subStuName = (s.studentName || '').toLowerCase().trim();
        const matches =
          (cleanStudentId && subStuId === cleanStudentId) ||
          (cleanStudentName && subStuName === cleanStudentName) ||
          (cleanEmail && subStuId === cleanEmail) ||
          (cleanStudentName.length >= 3 && subStuName.includes(cleanStudentName));
        return matches && (s.status === 'Submitted' || s.status === 'Graded' || s.status === 'Late');
      }
    ).length;

    // Update student's assignmentsCompleted in management students
    const updatedStudents = (mgmt.students || []).map((stu) => {
      const sId = (stu.id || '').toLowerCase().trim();
      const sName = (stu.name || '').toLowerCase().trim();
      const sEmail = (stu.email || '').toLowerCase().trim();

      const matches =
        (cleanStudentId && (sId === cleanStudentId || cleanStudentId.includes(sId))) ||
        (cleanStudentName && (sName === cleanStudentName || sName.includes(cleanStudentName))) ||
        (cleanEmail && sEmail === cleanEmail);

      if (matches) {
        return {
          ...stu,
          assignmentsCompleted: studentCompletedCount
        };
      }
      return stu;
    });

    // Update submissionsCount on the assignment
    const updatedAssignments = (mgmt.assignments || []).map((a) => {
      if (a.id === submission.assignmentId) {
        const count = updatedSubmissions.filter((s) => s.assignmentId === a.id).length;
        return { ...a, submissionsCount: count };
      }
      return a;
    });

    saveManagementData({
      ...mgmt,
      assignments: updatedAssignments,
      submissions: updatedSubmissions,
      students: updatedStudents
    });

    // 2. Sync to Supabase if connected
    if (supabase) {
      try {
        // Find profile / student ID in Supabase
        let studentUuid: string | null = null;

        // Try direct lookup in students by student_id or id
        const { data: stuRecord } = await supabase
          .from('students')
          .select('id, student_id')
          .or(`student_id.eq.${submission.studentId.toUpperCase().trim()},id.eq.${submission.studentId}`)
          .maybeSingle();

        if (stuRecord?.id) {
          studentUuid = stuRecord.id;
        } else {
          // Lookup via profiles table by email
          const targetEmail = cleanEmail || (submission.studentId.includes('@') ? cleanStudentId : `${cleanStudentId}@campushub.edu`);
          const { data: profRecord } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', targetEmail)
            .maybeSingle();

          if (profRecord?.id) {
            studentUuid = profRecord.id;
            // Ensure student entry exists in students table
            await supabase.from('students').upsert({
              id: profRecord.id,
              student_id: submission.studentId.toUpperCase().trim(),
              department: 'Computer Science & Engineering',
              semester: 8,
              year_section: 'IV Year • CSE-A',
              cgpa: 8.6,
              credits_earned: 140
            } as any);
          }
        }

        // Fallback to first available student if local dev demo
        if (!studentUuid) {
          const { data: firstStu } = await supabase.from('students').select('id').limit(1).maybeSingle();
          studentUuid = firstStu?.id || null;
        }

        // Find matching assignment in Supabase
        let assignmentUuid: string | null = null;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submission.assignmentId);

        if (isUuid) {
          const { data: asgById } = await supabase.from('assignments').select('id').eq('id', submission.assignmentId).maybeSingle();
          if (asgById?.id) assignmentUuid = asgById.id;
        }

        if (!assignmentUuid) {
          const localAsg = mgmt.assignments.find((a) => a.id === submission.assignmentId);
          if (localAsg) {
            const { data: asgByTitle } = await supabase
              .from('assignments')
              .select('id')
              .ilike('title', `%${localAsg.title}%`)
              .maybeSingle();
            if (asgByTitle?.id) assignmentUuid = asgByTitle.id;
          }
        }

        if (!assignmentUuid) {
          const { data: firstAsg } = await supabase.from('assignments').select('id').limit(1).maybeSingle();
          assignmentUuid = firstAsg?.id || null;
        }

        if (studentUuid && assignmentUuid) {
          await supabase.from('assignment_submissions').upsert({
            assignment_id: assignmentUuid,
            student_id: studentUuid,
            submission_file_url: submission.fileName || 'Assignment_Submission.pdf',
            submission_text: submission.comments || '',
            submitted_at: new Date().toISOString(),
            status: 'Submitted'
          } as any, { onConflict: 'assignment_id,student_id' });
        }
      } catch (err) {
        console.warn('Supabase submission sync notice:', err);
      }
    }

    return { success: true };
  },

  /**
   * Grade an assignment submission
   */
  async gradeAssignmentSubmission(
    submissionId: string,
    marks: number,
    feedback: string
  ): Promise<{ success: boolean; error?: string }> {
    const mgmt = getManagementData();
    let targetSub: AssignmentSubmission | null = null;

    const updatedSubmissions = (mgmt.submissions || []).map((sub) => {
      if (sub.id === submissionId) {
        targetSub = {
          ...sub,
          marks,
          feedback,
          status: 'Graded' as const
        };
        return targetSub;
      }
      return sub;
    });

    saveManagementData({
      ...mgmt,
      submissions: updatedSubmissions
    });

    // Sync grade to Supabase if connected
    if (supabase && targetSub) {
      try {
        const sub: AssignmentSubmission = targetSub;
        const { data: asgRecord } = await supabase
          .from('assignments')
          .select('id')
          .ilike('title', `%${sub.assignmentId}%`)
          .maybeSingle();

        if (asgRecord?.id) {
          await supabase
            .from('assignment_submissions')
            .update({
              grade_marks: marks,
              feedback,
              status: 'Graded',
              graded_at: new Date().toISOString()
            } as any)
            .eq('assignment_id', asgRecord.id);
        }
      } catch (err) {
        console.warn('Supabase grade sync notice:', err);
      }
    }

    return { success: true };
  }
};

