import { supabase } from '../lib/supabase';
import { studentDashboardData, StudentDashboardData } from '../data/studentDashboardData';

export const dbService = {
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
  }
};
