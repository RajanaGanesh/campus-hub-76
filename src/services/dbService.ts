import { supabase } from '../lib/supabase';
import {
  studentDashboardData,
  StudentDashboardData,
  AttendanceSubject,
  PendingAssignment,
  UpcomingExam,
  ExamResult,
  AnnouncementItem
} from '../data/studentDashboardData';
import {
  StudentRecord,
  FacultyRecord,
  AssignmentSubmission,
  getManagementData,
  saveManagementData
} from '../data/managementData';
import { getStudentNotificationsForUser } from './storageService';

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
        return localStudents.map(s => {
          const sId = (s.id || '').toLowerCase().trim();
          const sName = (s.name || '').toLowerCase().trim();
          const sEmail = (s.email || '').toLowerCase().trim();
          const matchingSubs = localSubmissions.filter(sub => {
            const subStuId = (sub.studentId || '').toLowerCase().trim();
            const subStuName = (sub.studentName || '').toLowerCase().trim();
            const matches = subStuId === sId || subStuName === sName || subStuId === sEmail || (sName.length >= 3 && subStuName.includes(sName)) || (sId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          });
          return { ...s, assignmentsCompleted: matchingSubs.length };
        });
      }

      const studentsData = studentsRes.data || [];
      if (studentsData.length === 0) {
        return localStudents.map(s => {
          const sId = (s.id || '').toLowerCase().trim();
          const sName = (s.name || '').toLowerCase().trim();
          const sEmail = (s.email || '').toLowerCase().trim();
          const matchingSubs = localSubmissions.filter(sub => {
            const subStuId = (sub.studentId || '').toLowerCase().trim();
            const subStuName = (sub.studentName || '').toLowerCase().trim();
            const matches = subStuId === sId || subStuName === sName || subStuId === sEmail || (sName.length >= 3 && subStuName.includes(sName)) || (sId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          });
          return { ...s, assignmentsCompleted: matchingSubs.length };
        });
      }

      const profilesMap = new Map<string, any>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.id) profilesMap.set(p.id, p);
        if (p.email) profilesMap.set(p.email.toLowerCase(), p);
      });

      // Filter out admin, faculty, and system accounts that might be in students table
      const validStudentsData = studentsData.filter((row: any) => {
        const profile = profilesMap.get(row.id) || profilesMap.get((row.email || '').toLowerCase()) || {};
        
        // Exclude users with non-student role in profile
        if (profile.role && profile.role !== 'student') return false;

        const stuId = (row.student_id || row.id || '').toLowerCase();
        const stuName = (profile.name || row.name || '').toLowerCase().trim();
        const stuEmail = (profile.email || row.email || '').toLowerCase().trim();

        // Exclude admin or faculty accounts
        if (
          stuName === 'admin' ||
          stuName.includes('admincampushub') ||
          stuName.includes('system admin') ||
          stuName.includes('administrator') ||
          stuEmail.startsWith('admin@') ||
          stuEmail.includes('admincampushub') ||
          stuEmail.startsWith('faculty@') ||
          stuId.startsWith('adm') ||
          stuId.startsWith('fac')
        ) {
          return false;
        }

        return true;
      });

      if (validStudentsData.length === 0) {
        return localStudents.map(s => {
          const sId = (s.id || '').toLowerCase().trim();
          const sName = (s.name || '').toLowerCase().trim();
          const sEmail = (s.email || '').toLowerCase().trim();
          const matchingSubs = localSubmissions.filter(sub => {
            const subStuId = (sub.studentId || '').toLowerCase().trim();
            const subStuName = (sub.studentName || '').toLowerCase().trim();
            const matches = subStuId === sId || subStuName === sName || subStuId === sEmail || (sName.length >= 3 && subStuName.includes(sName)) || (sId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          });
          return { ...s, assignmentsCompleted: matchingSubs.length };
        });
      }

      return validStudentsData.map((row: any) => {
        const profile = profilesMap.get(row.id) || {};
        const yearSectionParts = (row.year_section || '1 - A').split('-');
        const yearVal = yearSectionParts[0]?.trim() || '1';
        const sectionVal = yearSectionParts[1]?.trim() || 'A';
        const stuId = row.student_id || row.id;
        let stuName = profile.name || row.name;
        const stuEmail = profile.email || `${stuId.toLowerCase()}@campushub.edu`;

        if (!stuName || stuName === 'New User' || stuName === 'Campus User') {
          const emailPrefix = stuEmail.split('@')[0].replace(/[._0-9-]+/g, ' ').trim();
          stuName = emailPrefix.replace(/\b\w/g, (c: string) => c.toUpperCase()) || stuId;
        }

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
              (sId.length >= 4 && sId.includes(subStuId));
            return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
          }
        );

        const assignmentsCount = matchingSubs.length;

        return {
          id: stuId,
          name: stuName,
          email: stuEmail,
          phone: profile.phone || localStu?.phone || '+91 9876543210',
          department: row.department || localStu?.department || 'Computer Science & Engineering',
          year: yearVal.includes('Year') ? yearVal : `${yearVal} Year`,
          section: sectionVal.replace(/^Sec\s*/i, ''),
          cgpa: Number(row.cgpa) || 8.0,
          attendancePercent: Number(row.attendance_percent) || (localStu?.attendancePercent || 85),
          assignmentsCompleted: assignmentsCount,
          performance: (Number(row.cgpa) >= 8.5 ? 'Excellent' : Number(row.cgpa) >= 7.5 ? 'Good' : 'Average') as any,
          status: 'Active'
        };
      });
    } catch (err) {
      console.warn('Supabase getStudents failed:', err);
      return localStudents.map(s => {
        const sId = (s.id || '').toLowerCase().trim();
        const sName = (s.name || '').toLowerCase().trim();
        const sEmail = (s.email || '').toLowerCase().trim();
        const matchingSubs = localSubmissions.filter(sub => {
          const subStuId = (sub.studentId || '').toLowerCase().trim();
          const subStuName = (sub.studentName || '').toLowerCase().trim();
          const matches = subStuId === sId || subStuName === sName || subStuId === sEmail || (sName.length >= 3 && subStuName.includes(sName)) || (sId.length >= 4 && sId.includes(subStuId));
          return matches && (sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late');
        });
        return { ...s, assignmentsCompleted: matchingSubs.length };
      });
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
      console.warn('Exception adding student to Supabase:', err);
      return { success: false, error: err?.message };
    }
  },

  /**
   * Update student details
   */
  async updateStudent(student: StudentRecord): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const email = student.email.toLowerCase().trim();
      const studentId = student.id.toUpperCase().trim();
      const yearSection = `${student.year} - Sec ${student.section}`;

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      const userId = existingProfile?.id;

      if (userId) {
        await supabase
          .from('profiles')
          .update({
            name: student.name.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        await supabase
          .from('students')
          .update({
            student_id: studentId,
            department: student.department || 'Computer Science & Engineering',
            year_section: yearSection,
            cgpa: Number(student.cgpa) || 8.0,
            attendance_percent: Number(student.attendancePercent) || 85
          })
          .eq('id', userId);
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
  async deleteStudent(studentIdOrEmail: string): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
      return { success: true };
    }

    try {
      const identifier = studentIdOrEmail.toLowerCase().trim();

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .or(`email.eq.${identifier},id.eq.${identifier}`)
        .maybeSingle();

      if (profile?.id) {
        await supabase.from('students').delete().eq('id', profile.id);
        await supabase.from('profiles').delete().eq('id', profile.id);
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
    const mgmt = getManagementData();
    const localFaculty = mgmt.faculty || [];
    const localFacultyMap = new Map<string, FacultyRecord>();
    localFaculty.forEach((f) => {
      if (f.id) localFacultyMap.set(f.id.toUpperCase(), f);
      if (f.email) localFacultyMap.set(f.email.toLowerCase(), f);
    });

    if (!supabase) {
      return localFaculty;
    }

    try {
      const [facultyRes, profilesRes, coursesRes] = await Promise.all([
        supabase.from('faculty').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('courses').select('*')
      ]);

      if (facultyRes.error) {
        console.warn('Could not query faculty from Supabase:', facultyRes.error);
        return localFaculty;
      }

      const facultyData = facultyRes.data || [];
      if (facultyData.length === 0) {
        return localFaculty;
      }

      const profilesMap = new Map<string, any>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.id) profilesMap.set(p.id, p);
        if (p.email) profilesMap.set(p.email.toLowerCase(), p);
      });

      const coursesData = coursesRes.data || [];

      return facultyData.map((row: any) => {
        const profile = profilesMap.get(row.id) || {};
        const facId = row.faculty_id || row.id;
        let facName = profile.name || row.name;
        if (!facName || facName === 'New User' || facName === 'Campus User') {
          const emailPrefix = (profile.email || `${facId}@campushub.edu`).split('@')[0].replace(/[._0-9-]+/g, ' ').trim();
          facName = emailPrefix.replace(/\b\w/g, (c: string) => c.toUpperCase()) || facId;
        }

        const localRecord = localFacultyMap.get(facId.toUpperCase()) || (profile.email ? localFacultyMap.get(profile.email.toLowerCase()) : null);

        // 1. Check assigned courses from database courses table
        const assignedFromDB = coursesData
          .filter((c: any) => c.faculty_id === row.id || c.faculty_id === facId)
          .map((c: any) => c.code);

        // 2. Combine with local recorded courses
        const combinedCourses = Array.from(new Set([
          ...assignedFromDB,
          ...(localRecord?.courses || [])
        ]));

        // 3. Fallback default department course if none assigned
        const defaultDeptCourses = row.department === 'ECE' ? ['ECE-304'] : row.department === 'MECH' ? ['ME-201'] : ['CSE-301'];
        const finalCourses = combinedCourses.length > 0 ? combinedCourses : defaultDeptCourses;

        return {
          id: facId,
          name: facName || 'Faculty Member',
          email: profile.email || localRecord?.email || `${facId.toLowerCase()}@campushub.edu`,
          department: row.department || localRecord?.department || 'Computer Science & Engineering',
          designation: row.designation || localRecord?.designation || 'Assistant Professor',
          courses: finalCourses,
          status: 'Active'
        };
      });
    } catch (err) {
      console.warn('Supabase getFaculty failed:', err);
      return localFaculty;
    }
  },

  /**
   * Fetch all courses from Supabase database
   */
  async getCourses(): Promise<any[]> {
    const mgmt = getManagementData();
    const localCourses = mgmt.courses || [];

    if (!supabase) {
      return localCourses;
    }

    try {
      const [coursesRes, facultyRes, profilesRes] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('faculty').select('*'),
        supabase.from('profiles').select('*')
      ]);

      if (coursesRes.error) {
        console.warn('Could not query courses from Supabase:', coursesRes.error);
        return localCourses;
      }

      const coursesData = coursesRes.data || [];
      if (coursesData.length === 0) return localCourses;

      const facultyMap = new Map<string, any>();
      const profilesMap = new Map<string, any>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.id) profilesMap.set(p.id, p);
      });
      (facultyRes.data || []).forEach((f: any) => {
        const prof = profilesMap.get(f.id) || {};
        let fName = prof.name || f.name;
        if (!fName || fName === 'New User') {
          const prefix = (prof.email || '').split('@')[0].replace(/[._0-9-]+/g, ' ').trim();
          fName = prefix.replace(/\b\w/g, (c: string) => c.toUpperCase()) || f.faculty_id;
        }
        facultyMap.set(f.id, { ...f, name: fName });
        if (f.faculty_id) facultyMap.set(f.faculty_id, { ...f, name: fName });
      });

      return coursesData.map((row: any) => {
        const fac = row.faculty_id ? facultyMap.get(row.faculty_id) : null;
        return {
          code: row.code,
          name: row.name,
          department: row.department || 'Computer Science & Engineering',
          semester: row.semester ? `${row.semester}th Semester` : '5th Semester',
          facultyId: row.faculty_id || '',
          facultyName: fac?.name || 'Department Faculty',
          studentsCount: 60,
          status: 'Active',
          progress: 0,
          nextClass: 'Schedule Active'
        };
      });
    } catch (err) {
      console.warn('Supabase getCourses failed:', err);
      return localCourses;
    }
  },

  /**
   * Fetch all assignments from Supabase database
   */
  async getAssignments(): Promise<any[]> {
    const mgmt = getManagementData();
    const localAssignments = mgmt.assignments || [];

    if (!supabase) {
      return localAssignments;
    }

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*, courses(name, code)');

      if (error) {
        console.warn('Could not query assignments from Supabase:', error);
        return localAssignments;
      }

      const asgData = data || [];
      if (asgData.length === 0) {
        return localAssignments;
      }

      return asgData.map((row: any) => {
        const course = row.courses || {};
        return {
          id: row.id,
          title: row.title,
          courseCode: course.code || 'CS',
          courseName: course.name || 'General',
          description: row.description || '',
          dueDate: row.due_date ? new Date(row.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible',
          maxMarks: row.max_marks || 100,
          submissionsCount: 0,
          createdDate: row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN'),
          priority: 'Medium'
        };
      });
    } catch (err) {
      console.warn('Supabase getAssignments failed:', err);
      return localAssignments;
    }
  },

  /**
   * Add a new faculty member to Supabase (Auth + profiles + faculty tables + course linkage)
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
        userId = generatedId;
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

      // 5. Link assigned courses in Supabase courses table
      if (faculty.courses && faculty.courses.length > 0 && userId) {
        for (const code of faculty.courses) {
          const cleanCode = code.toUpperCase().trim();
          try {
            const { data: existingCourse } = await supabase
              .from('courses')
              .select('id')
              .ilike('code', cleanCode)
              .maybeSingle();

            if (existingCourse?.id) {
              await supabase
                .from('courses')
                .update({ faculty_id: userId } as any)
                .eq('id', existingCourse.id);
            } else {
              await supabase.from('courses').insert({
                code: cleanCode,
                name: `${cleanCode} Course`,
                department: faculty.department || 'Computer Science & Engineering',
                faculty_id: userId,
                type: 'Theory',
                credits: 3
              } as any);
            }
          } catch (courseErr) {
            console.warn(`Course assignment sync error for ${cleanCode}:`, courseErr);
          }
        }
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

        // Update assigned courses linkage in Supabase
        if (faculty.courses && faculty.courses.length > 0) {
          for (const code of faculty.courses) {
            const cleanCode = code.toUpperCase().trim();
            const { data: existingCourse } = await supabase
              .from('courses')
              .select('id')
              .ilike('code', cleanCode)
              .maybeSingle();

            if (existingCourse?.id) {
              await supabase
                .from('courses')
                .update({ faculty_id: facRecord.id } as any)
                .eq('id', existingCourse.id);
            } else {
              await supabase.from('courses').insert({
                code: cleanCode,
                name: `${cleanCode} Course`,
                department: faculty.department || 'Computer Science & Engineering',
                faculty_id: facRecord.id,
                type: 'Theory',
                credits: 3
              } as any);
            }
          }
        }
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
    const mgmt = getManagementData();
    const cleanEmail = (email || '').toLowerCase().trim();
    const localStu = (mgmt.students || []).find(
      s => (s.email || '').toLowerCase().trim() === cleanEmail || (s.id || '').toLowerCase().trim() === cleanEmail
    ) || (mgmt.students || [])[0];

    const studentAttPercent = localStu?.attendancePercent || 86.4;
    const computedPresent = Math.round((studentAttPercent / 100) * 250);
    const computedAbsent = 250 - computedPresent;

    // Derived assignments from management records
    const mgmtStudentAssignments: PendingAssignment[] = (mgmt.assignments || []).map((asg) => {
      const sub = (mgmt.submissions || []).find(
        s => s.assignmentId === asg.id &&
             ((cleanEmail && s.studentId.toLowerCase() === cleanEmail) ||
              (localStu?.id && s.studentId.toLowerCase() === localStu.id.toLowerCase()) ||
              (localStu?.name && s.studentName.toLowerCase() === localStu.name.toLowerCase()))
      );
      return {
        subject: asg.courseName ? `${asg.courseName} (${asg.courseCode})` : asg.courseCode,
        title: asg.title,
        due: asg.dueDate || '3 days left',
        status: (sub?.status || 'Pending') as any,
        priority: asg.priority || 'High'
      };
    });

    const mgmtAnnouncements: AnnouncementItem[] = (mgmt.announcements || []).map((a) => ({
      title: a.title,
      category: a.audience || 'General',
      time: a.publishDate || 'Recent',
      desc: a.message
    }));

    const userScopedNotifs = getStudentNotificationsForUser(
      localStu?.id || '236F1A0551',
      localStu?.email || email,
      localStu?.name
    ).map((n, idx) => ({
      id: idx + 1,
      icon: n.category === 'Academic' ? 'fa-file-signature' : (n.category === 'Fee' ? 'fa-wallet' : (n.category === 'Exam' ? 'fa-receipt' : 'fa-bell')),
      title: n.title + ': ' + n.message,
      time: n.time,
      unread: n.isUnread
    }));

    const fallbackData: StudentDashboardData = {
      ...studentDashboardData,
      profile: {
        ...studentDashboardData.profile,
        studentId: localStu?.id || '236F1A0551',
        department: localStu?.department || 'Computer Science & Engineering',
        yearSection: localStu ? `${localStu.year} • Sec ${localStu.section}` : 'IV Year • CSE-A',
        email: localStu?.email || email || 'student@campushub.edu',
        avatarInitials: localStu?.name ? localStu.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AV'
      },
      overallAttendance: studentAttPercent,
      presentCount: computedPresent,
      absentCount: computedAbsent,
      totalClasses: 250,
      assignments: mgmtStudentAssignments.length > 0 ? mgmtStudentAssignments : studentDashboardData.assignments,
      announcements: mgmtAnnouncements.length > 0 ? mgmtAnnouncements : studentDashboardData.announcements,
      notifications: userScopedNotifs.length > 0 ? userScopedNotifs : studentDashboardData.notifications,
      stats: [
        { icon: 'fa-user-check', title: 'Attendance', value: `${studentAttPercent}%`, description: 'Overall Attendance (32/36 Labs)', status: studentAttPercent >= 75 ? 'Safe' : 'Warning', statusType: studentAttPercent >= 75 ? 'good' : 'due', progress: studentAttPercent, colorVariant: studentAttPercent >= 75 ? 'primary' : 'red' },
        { icon: 'fa-award', title: 'CGPA', value: localStu?.cgpa ? localStu.cgpa.toFixed(2) : '8.65', description: 'Current CGPA', status: (localStu?.cgpa || 8.65) >= 8.0 ? 'Excellent' : 'Good', statusType: 'excellent', colorVariant: 'cyan' },
        { icon: 'fa-file-invoice', title: 'Assignments', value: String(mgmtStudentAssignments.filter(a => a.status === 'Pending' || a.status === 'Due Soon').length || 3), description: 'Pending Assignments', status: 'Due Soon', statusType: 'due', colorVariant: 'green' },
        { icon: 'fa-receipt', title: 'Exams', value: '3', description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
        { icon: 'fa-wallet', title: 'Pending Fees', value: '₹0', description: 'Pending Tuition', status: 'Paid', statusType: 'good', colorVariant: 'green' },
        { icon: 'fa-book-open', title: 'Library Books', value: '2', description: 'Books Issued', status: 'Active', statusType: 'active', colorVariant: 'cyan' }
      ]
    };

    if (!supabase) {
      return fallbackData;
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

      let attendanceSubjects: AttendanceSubject[] = [];
      let presentCount = 0;
      let absentCount = 0;
      let totalClasses = 0;

      if (attendanceData && attendanceData.length > 0) {
        totalClasses = attendanceData.length;
        const coursesMap: Record<string, { present: number; total: number }> = {};
        attendanceData.forEach((att: any) => {
          const courseName = att.courses?.name || 'Unspecified';
          if (!coursesMap[courseName]) {
            coursesMap[courseName] = { present: 0, total: 0 };
          }
          coursesMap[courseName].total += 1;
          if (att.status === 'Present' || att.status === 'Late') {
            coursesMap[courseName].present += 1;
            presentCount += 1;
          } else {
            absentCount += 1;
          }
        });

        attendanceSubjects = Object.keys(coursesMap).map(name => {
          const { present, total } = coursesMap[name];
          const percentage = Math.round((present / total) * 100);
          const status = percentage >= 85 ? 'safe' : (percentage >= 75 ? 'warning' : 'critical');
          return { name, percentage, status };
        });
      }

      const overallAttendance = totalClasses > 0
        ? Math.round((presentCount / totalClasses) * 100)
        : (attendanceSubjects.length > 0
          ? Math.round(attendanceSubjects.reduce((acc, s) => acc + s.percentage, 0) / attendanceSubjects.length)
          : (Number(studentData.attendance_percent) || studentAttPercent));

      // 4. Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('assignment_submissions')
        .select('*, assignments(*, courses(name))')
        .eq('student_id', profileData.id);

      let assignmentsList: PendingAssignment[] = [];
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

      let examsList: UpcomingExam[] = [];
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

      let resultsList: ExamResult[] = [];
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

      let feesSummary = {
        total: 85000,
        paid: 85000,
        pending: 0,
        dueDate: 'All dues clear'
      };
      if (feesData && feesData.length > 0) {
        const total = feesData.reduce((acc: number, f: any) => acc + Number(f.amount), 0);
        const paid = feesData.filter((f: any) => f.status === 'Paid').reduce((acc: number, f: any) => acc + Number(f.amount), 0);
        const pending = total - paid;
        const upcomingOverdue = feesData.find((f: any) => f.status !== 'Paid');
        feesSummary = {
          total,
          paid,
          pending,
          dueDate: upcomingOverdue ? new Date(upcomingOverdue.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'All dues clear'
        };
      }

      // 8. Fetch library issued books
      const { data: libraryData } = await supabase
        .from('library_borrows')
        .select('*, library_books(*)')
        .eq('student_id', profileData.id)
        .is('return_date', null);

      let librarySummary = fallbackData.library;
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

      let placementsList = fallbackData.placements;
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

      let notificationsList = fallbackData.notifications;
      if (notificationsData && notificationsData.length > 0) {
        notificationsList = notificationsData.map((not: any) => ({
          id: not.id,
          icon: not.unread ? 'fa-bell' : 'fa-envelope-open',
          title: not.title + ': ' + not.description,
          time: new Date(not.created_at).toLocaleDateString('en-IN'),
          unread: not.unread
        }));
      }

      const finalAssignments = assignmentsList.length > 0 ? assignmentsList : fallbackData.assignments;
      const finalExams = examsList.length > 0 ? examsList : fallbackData.exams;
      const finalResults = resultsList.length > 0 ? resultsList : fallbackData.results;
      const finalAttendanceSubjects = attendanceSubjects.length > 0 ? attendanceSubjects : fallbackData.attendanceSubjects;
      const cgpaDisplay = studentData.cgpa ? Number(studentData.cgpa).toFixed(2) : (localStu?.cgpa ? localStu.cgpa.toFixed(2) : '8.65');

      return {
        profile: {
          studentId: studentData.student_id || localStu?.id || '236F1A0551',
          department: studentData.department || localStu?.department || 'Computer Science & Engineering',
          yearSection: studentData.year_section || (localStu ? `${localStu.year} • Sec ${localStu.section}` : 'IV Year • CSE-A'),
          semester: studentData.semester ? `${studentData.semester}th Semester` : '8th Semester',
          email: profileData.email || email,
          avatarInitials: profileData.name ? profileData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'AV'
        },
        stats: [
          { icon: 'fa-user-check', title: 'Attendance', value: `${overallAttendance}%`, description: 'Overall Attendance (32/36 Labs)', status: overallAttendance >= 75 ? 'Safe' : 'Warning', statusType: overallAttendance >= 75 ? 'good' : 'due', progress: overallAttendance, colorVariant: overallAttendance >= 75 ? 'primary' : 'red' },
          { icon: 'fa-award', title: 'CGPA', value: cgpaDisplay, description: 'Current CGPA', status: Number(cgpaDisplay) >= 8.0 ? 'Excellent' : 'Good', statusType: 'excellent', colorVariant: 'cyan' },
          { icon: 'fa-file-invoice', title: 'Assignments', value: String(finalAssignments.filter(a => a.status === 'Pending' || a.status === 'Due Soon').length || 3), description: 'Pending Assignments', status: 'Due Soon', statusType: 'due', colorVariant: 'green' },
          { icon: 'fa-receipt', title: 'Exams', value: String(finalExams.length || 3), description: 'Upcoming Exams', status: 'Prepare', statusType: 'active', colorVariant: 'red' },
          { icon: 'fa-wallet', title: 'Pending Fees', value: `₹${feesSummary.pending.toLocaleString('en-IN')}`, description: 'Pending Tuition', status: feesSummary.pending > 0 ? 'Due Soon' : 'Paid', statusType: feesSummary.pending > 0 ? 'due' : 'good', colorVariant: feesSummary.pending > 0 ? 'red' : 'green' },
          { icon: 'fa-book-open', title: 'Library Books', value: librarySummary.issued.toString(), description: 'Books Issued', status: librarySummary.issued > 0 ? 'Active' : 'None', statusType: 'active', colorVariant: 'cyan' }
        ],
        overallAttendance,
        presentCount: presentCount || computedPresent,
        absentCount: absentCount || computedAbsent,
        totalClasses: totalClasses || 250,
        labAttendancePercentage: fallbackData.labAttendancePercentage || 88.9,
        labPresentCount: fallbackData.labPresentCount || 32,
        labAbsentCount: fallbackData.labAbsentCount || 4,
        labTotalClasses: fallbackData.labTotalClasses || 36,
        attendanceSubjects: finalAttendanceSubjects,
        performanceHistory: fallbackData.performanceHistory,
        timetable: fallbackData.timetable,
        assignments: finalAssignments,
        exams: finalExams,
        results: finalResults,
        fees: feesSummary,
        library: librarySummary,
        placements: placementsList,
        announcements: fallbackData.announcements,
        notifications: notificationsList,
        activities: fallbackData.activities
      };
    } catch (err) {
      console.warn('Supabase student query fallback:', err);
      return fallbackData;
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
  },

  /**
   * Sync a batch of marked attendance records to Supabase public.attendance table
   */
  async syncAttendanceBatch(params: {
    courseCode: string;
    date: string; // YYYY-MM-DD
    records: Array<{
      studentId: string; // roll number or UUID
      status: 'Present' | 'Absent' | 'Late' | 'Excused';
      remarks?: string;
    }>;
    facultyId?: string;
  }): Promise<{ success: boolean; insertedCount?: number; error?: string }> {
    if (!supabase) {
      return { success: true, insertedCount: 0 };
    }

    try {
      const { courseCode, date, records, facultyId } = params;
      if (!records || records.length === 0) return { success: true, insertedCount: 0 };

      // 1. Resolve Course UUID
      let resolvedCourseId: string | null = null;
      const { data: courseRow } = await supabase
        .from('courses')
        .select('id')
        .or(`code.eq.${courseCode},id.eq.${courseCode}`)
        .maybeSingle();

      if (courseRow?.id) {
        resolvedCourseId = courseRow.id;
      } else {
        // Fallback: pick first available course
        const { data: firstCourse } = await supabase.from('courses').select('id').limit(1).maybeSingle();
        if (firstCourse?.id) resolvedCourseId = firstCourse.id;
      }

      if (!resolvedCourseId) {
        return { success: false, error: 'No matching course found in database.' };
      }

      // 2. Resolve Student UUIDs
      const { data: studentsList } = await supabase
        .from('students')
        .select('id, student_id');

      const studentIdMap = new Map<string, string>();
      (studentsList || []).forEach((s) => {
        if (s.id) studentIdMap.set(s.id.toLowerCase(), s.id);
        if (s.student_id) studentIdMap.set(s.student_id.toLowerCase(), s.id);
      });

      // 3. Construct rows for upsert
      const rowsToUpsert = records
        .map((r) => {
          const studentUUID =
            studentIdMap.get(r.studentId.toLowerCase()) ||
            (studentsList && studentsList.length > 0 ? studentsList[0].id : null);

          if (!studentUUID) return null;

          return {
            student_id: studentUUID,
            course_id: resolvedCourseId,
            date: date,
            status: r.status,
            marked_by: facultyId || null,
            remarks: r.remarks || null
          };
        })
        .filter(Boolean);

      if (rowsToUpsert.length === 0) {
        return { success: true, insertedCount: 0 };
      }

      const { error: upsertError } = await supabase
        .from('attendance')
        .upsert(rowsToUpsert as any, { onConflict: 'student_id,course_id,date' });

      if (upsertError) {
        console.warn('Supabase attendance upsert notice:', upsertError);
        return { success: false, error: upsertError.message };
      }

      return { success: true, insertedCount: rowsToUpsert.length };
    } catch (err: any) {
      console.warn('Exception syncing attendance to Supabase:', err);
      return { success: false, error: err?.message || 'Database error' };
    }
  },

  /**
   * Fetch attendance records for a specific course or student from Supabase
   */
  async getAttendanceRecords(params?: {
    courseId?: string;
    studentId?: string;
    date?: string;
  }): Promise<any[]> {
    if (!supabase) return [];

    try {
      let query = supabase.from('attendance').select(`
        id,
        date,
        status,
        remarks,
        created_at,
        student_id,
        course_id,
        students (student_id, department, year_section),
        courses (code, name)
      `);

      if (params?.courseId) query = query.eq('course_id', params.courseId);
      if (params?.studentId) query = query.eq('student_id', params.studentId);
      if (params?.date) query = query.eq('date', params.date);

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching attendance from Supabase:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('Exception getting attendance:', err);
      return [];
    }
  }
};


