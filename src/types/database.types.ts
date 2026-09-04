export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'faculty' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          gender: 'Male' | 'Female' | 'Other' | null;
          date_of_birth: string | null;
          blood_group: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          date_of_birth?: string | null;
          blood_group?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          phone?: string | null;
          gender?: 'Male' | 'Female' | 'Other' | null;
          date_of_birth?: string | null;
          blood_group?: string | null;
          address?: string | null;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          code: string;
          name: string;
          head_of_department: string | null;
          building: string | null;
          contact_email: string | null;
          total_students: number;
          total_faculty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          head_of_department?: string | null;
          building?: string | null;
          contact_email?: string | null;
          total_students?: number;
          total_faculty?: number;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          head_of_department?: string | null;
          building?: string | null;
          contact_email?: string | null;
          total_students?: number;
          total_faculty?: number;
        };
      };
      students: {
        Row: {
          id: string;
          student_id: string;
          department: string;
          department_id: string | null;
          batch: string;
          semester: number;
          year_section: string;
          cgpa: number;
          credits_earned: number;
          admission_date: string;
          academic_status: 'Active' | 'Graduated' | 'Suspended' | 'On Leave';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          student_id: string;
          department: string;
          department_id?: string | null;
          batch: string;
          semester?: number;
          year_section: string;
          cgpa?: number;
          credits_earned?: number;
          admission_date?: string;
          academic_status?: 'Active' | 'Graduated' | 'Suspended' | 'On Leave';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          student_id?: string;
          department?: string;
          department_id?: string | null;
          batch?: string;
          semester?: number;
          year_section?: string;
          cgpa?: number;
          credits_earned?: number;
          academic_status?: 'Active' | 'Graduated' | 'Suspended' | 'On Leave';
          updated_at?: string;
        };
      };
      faculty: {
        Row: {
          id: string;
          faculty_id: string;
          department: string;
          department_id: string | null;
          designation: string;
          qualification: string | null;
          specialization: string | null;
          office_room: string | null;
          joining_date: string;
          status: 'Active' | 'On Leave' | 'Retired';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          faculty_id: string;
          department: string;
          department_id?: string | null;
          designation: string;
          qualification?: string | null;
          specialization?: string | null;
          office_room?: string | null;
          joining_date?: string;
          status?: 'Active' | 'On Leave' | 'Retired';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          faculty_id?: string;
          department?: string;
          department_id?: string | null;
          designation?: string;
          qualification?: string | null;
          specialization?: string | null;
          office_room?: string | null;
          status?: 'Active' | 'On Leave' | 'Retired';
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          department: string;
          department_id: string | null;
          semester: number;
          credits: number;
          course_type: 'Core' | 'Elective' | 'Lab' | 'Seminar' | 'Project';
          faculty_id: string | null;
          syllabus: string | null;
          academic_year: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          department: string;
          department_id?: string | null;
          semester?: number;
          credits: number;
          course_type?: 'Core' | 'Elective' | 'Lab' | 'Seminar' | 'Project';
          faculty_id?: string | null;
          syllabus?: string | null;
          academic_year?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          department?: string;
          department_id?: string | null;
          semester?: number;
          credits?: number;
          course_type?: 'Core' | 'Elective' | 'Lab' | 'Seminar' | 'Project';
          faculty_id?: string | null;
          syllabus?: string | null;
          is_active?: boolean;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          date: string;
          status: 'Present' | 'Absent' | 'Late' | 'Excused';
          marked_by: string | null;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          date?: string;
          status: 'Present' | 'Absent' | 'Late' | 'Excused';
          marked_by?: string | null;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'Present' | 'Absent' | 'Late' | 'Excused';
          remarks?: string | null;
        };
      };
      timetable: {
        Row: {
          id: string;
          course_id: string;
          faculty_id: string | null;
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
          start_time: string;
          end_time: string;
          classroom: string;
          batch_section: string;
          semester: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          faculty_id?: string | null;
          day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
          start_time: string;
          end_time: string;
          classroom: string;
          batch_section: string;
          semester?: number;
          created_at?: string;
        };
        Update: {
          day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
          start_time?: string;
          end_time?: string;
          classroom?: string;
          batch_section?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          due_date: string;
          max_marks: number;
          attachment_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          due_date: string;
          max_marks?: number;
          attachment_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          due_date?: string;
          max_marks?: number;
          attachment_url?: string | null;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submission_file_url: string | null;
          submission_text: string | null;
          submitted_at: string;
          grade_marks: number | null;
          feedback: string | null;
          graded_by: string | null;
          graded_at: string | null;
          status: 'Pending' | 'Submitted' | 'Graded' | 'Late' | 'Resubmitted';
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submission_file_url?: string | null;
          submission_text?: string | null;
          submitted_at?: string;
          grade_marks?: number | null;
          feedback?: string | null;
          graded_by?: string | null;
          graded_at?: string | null;
          status?: 'Pending' | 'Submitted' | 'Graded' | 'Late' | 'Resubmitted';
        };
        Update: {
          submission_file_url?: string | null;
          submission_text?: string | null;
          grade_marks?: number | null;
          feedback?: string | null;
          graded_by?: string | null;
          graded_at?: string | null;
          status?: 'Pending' | 'Submitted' | 'Graded' | 'Late' | 'Resubmitted';
        };
      };
      exams: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          exam_type: 'Internal' | 'Midterm' | 'Final' | 'Practical' | 'Quiz';
          date: string;
          start_time: string;
          end_time: string;
          classroom: string;
          max_marks: number;
          passing_marks: number;
          semester: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          exam_type?: 'Internal' | 'Midterm' | 'Final' | 'Practical' | 'Quiz';
          date: string;
          start_time: string;
          end_time: string;
          classroom: string;
          max_marks?: number;
          passing_marks?: number;
          semester?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          classroom?: string;
          max_marks?: number;
          passing_marks?: number;
        };
      };
      results: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          exam_id: string | null;
          exam_title: string;
          marks_obtained: number;
          max_marks: number;
          percentage: number;
          grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | 'AB';
          grade_points: number;
          semester: number;
          published_at: string;
          remarks: string | null;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          exam_id?: string | null;
          exam_title: string;
          marks_obtained: number;
          max_marks?: number;
          grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | 'AB';
          grade_points?: number;
          semester?: number;
          published_at?: string;
          remarks?: string | null;
        };
        Update: {
          marks_obtained?: number;
          max_marks?: number;
          grade?: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F' | 'AB';
          grade_points?: number;
          remarks?: string | null;
        };
      };
      library_books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string | null;
          category: string;
          publisher: string | null;
          total_copies: number;
          available_copies: number;
          shelf_location: string | null;
          cover_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          isbn?: string | null;
          category?: string;
          publisher?: string | null;
          total_copies?: number;
          available_copies?: number;
          shelf_location?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          author?: string;
          total_copies?: number;
          available_copies?: number;
          shelf_location?: string | null;
        };
      };
      fees: {
        Row: {
          id: string;
          student_id: string;
          title: string;
          fee_type: 'Tuition' | 'Hostel' | 'Transport' | 'Examination' | 'Library' | 'Laboratory' | 'Special';
          amount: number;
          due_date: string;
          status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          title: string;
          fee_type?: 'Tuition' | 'Hostel' | 'Transport' | 'Examination' | 'Library' | 'Laboratory' | 'Special';
          amount: number;
          due_date: string;
          status?: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
          academic_year?: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          amount?: number;
          due_date?: string;
          status?: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
        };
      };
      placement_jobs: {
        Row: {
          id: string;
          company: string;
          role: string;
          package: string;
          location: string;
          job_type: 'Full Time' | 'Internship' | 'FTE + Internship';
          cutoff_cgpa: number;
          eligible_departments: string[];
          skills_required: string[];
          description: string | null;
          drive_date: string;
          deadline: string;
          vacancies: number;
          status: 'Active' | 'Upcoming' | 'Closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          company: string;
          role: string;
          package: string;
          location?: string;
          job_type?: 'Full Time' | 'Internship' | 'FTE + Internship';
          cutoff_cgpa?: number;
          eligible_departments?: string[];
          skills_required?: string[];
          description?: string | null;
          drive_date: string;
          deadline: string;
          vacancies?: number;
          status?: 'Active' | 'Upcoming' | 'Closed';
          created_at?: string;
        };
        Update: {
          company?: string;
          role?: string;
          package?: string;
          status?: 'Active' | 'Upcoming' | 'Closed';
          deadline?: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: 'Academic' | 'Examination' | 'Placement' | 'Administrative' | 'Hostel' | 'Events' | 'Emergency';
          priority: 'Normal' | 'High' | 'Urgent';
          target_audience: 'All' | 'Students' | 'Faculty' | 'Parents' | 'Admins';
          department: string | null;
          attachment_url: string | null;
          published_by: string | null;
          publisher_name: string;
          publish_date: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: 'Academic' | 'Examination' | 'Placement' | 'Administrative' | 'Hostel' | 'Events' | 'Emergency';
          priority?: 'Normal' | 'High' | 'Urgent';
          target_audience?: 'All' | 'Students' | 'Faculty' | 'Parents' | 'Admins';
          department?: string | null;
          attachment_url?: string | null;
          published_by?: string | null;
          publisher_name?: string;
          publish_date?: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          content?: string;
          priority?: 'Normal' | 'High' | 'Urgent';
          is_active?: boolean;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          type: 'Academic' | 'Attendance' | 'Fee' | 'Exam' | 'Placement' | 'Notice' | 'System';
          unread: boolean;
          action_link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          type?: 'Academic' | 'Attendance' | 'Fee' | 'Exam' | 'Placement' | 'Notice' | 'System';
          unread?: boolean;
          action_link?: string | null;
          created_at?: string;
        };
        Update: {
          unread?: boolean;
        };
      };
    };
  };
}
