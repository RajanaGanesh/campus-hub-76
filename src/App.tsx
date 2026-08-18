import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// STEP 3: Student Dashboard & Module Placeholders
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentModulePlaceholder } from './pages/student/StudentModulePlaceholder';

// STEP 4: Student Academic Modules
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentExaminations } from './pages/student/StudentExaminations';
import { StudentResults } from './pages/student/StudentResults';
import { StudentLMS } from './pages/student/StudentLMS';

// STEP 5: Student Campus Services
import { StudentLibrary } from './pages/student/StudentLibrary';
import { StudentFees } from './pages/student/StudentFees';
import { StudentHostel } from './pages/student/StudentHostel';
import { StudentTransport } from './pages/student/StudentTransport';
import { StudentNotices } from './pages/student/StudentNotices';
import { StudentNotifications } from './pages/student/StudentNotifications';

// STEP 6: Student Placement & Career Portal
import { StudentPlacements } from './pages/student/StudentPlacements';

// STEP 7: Faculty Portal Modules
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyCourses } from './pages/faculty/FacultyCourses';
import { FacultyStudents } from './pages/faculty/FacultyStudents';
import { FacultyAttendance } from './pages/faculty/FacultyAttendance';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments';
import { FacultyExams } from './pages/faculty/FacultyExams';
import { FacultyResults } from './pages/faculty/FacultyResults';
import { FacultyMaterials } from './pages/faculty/FacultyMaterials';
import { FacultyNotices } from './pages/faculty/FacultyNotices';
import { FacultyNotifications } from './pages/faculty/FacultyNotifications';

// STEP 8: Admin Portal Modules
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminAttendance } from './pages/admin/AdminAttendance';
import { AdminAssignments } from './pages/admin/AdminAssignments';
import { AdminExams } from './pages/admin/AdminExams';
import { AdminResults } from './pages/admin/AdminResults';
import { AdminFees } from './pages/admin/AdminFees';
import { AdminLibrary } from './pages/admin/AdminLibrary';
import { AdminHostel } from './pages/admin/AdminHostel';
import { AdminTransport } from './pages/admin/AdminTransport';
import { AdminPlacements } from './pages/admin/AdminPlacements';
import { AdminNotices } from './pages/admin/AdminNotices';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// STEP 9: Parent Portal Modules
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentAttendance } from './pages/parent/ParentAttendance';
import { ParentAcademics } from './pages/parent/ParentAcademics';
import { ParentAssignments } from './pages/parent/ParentAssignments';
import { ParentExams } from './pages/parent/ParentExams';
import { ParentFees } from './pages/parent/ParentFees';
import { ParentLibrary } from './pages/parent/ParentLibrary';
import { ParentHostel } from './pages/parent/ParentHostel';
import { ParentPlacements } from './pages/parent/ParentPlacements';
import { ParentNotices } from './pages/parent/ParentNotices';
import { ParentNotifications } from './pages/parent/ParentNotifications';
import { ParentSettings } from './pages/parent/ParentSettings';

import './styles/theme.css';
import './styles/login.css';
import './styles/dashboard.css';

// Central Home Redirection Route
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Navigate to="/login" replace />;
};

// Login Route Guard - redirects authenticated users to their role dashboard
const LoginRouteWrapper: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  return <Login />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginRouteWrapper />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ==========================================================
              STEP 3: COMPLETE FUNCTIONAL STUDENT DASHBOARD ROUTE
              ========================================================== */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ==========================================================
              STEP 4: COMPLETE ACADEMIC MODULES ROUTES
              ========================================================== */}
          {/* 1. Timetable */}
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentTimetable />
              </ProtectedRoute>
            }
          />

          {/* 2. Assignments */}
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentAssignments />
              </ProtectedRoute>
            }
          />

          {/* 3. Examinations */}
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentExaminations />
              </ProtectedRoute>
            }
          />

          {/* 4. Results */}
          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentResults />
              </ProtectedRoute>
            }
          />

          {/* 5. LMS / Learning Center */}
          <Route
            path="/student/lms"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentLMS />
              </ProtectedRoute>
            }
          />

          {/* ==========================================================
              STEP 5: COMPLETE CAMPUS SERVICES ROUTES
              ========================================================== */}
          {/* 1. Digital Library */}
          <Route
            path="/student/library"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentLibrary />
              </ProtectedRoute>
            }
          />

          {/* 2. Fee Management */}
          <Route
            path="/student/fees"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentFees />
              </ProtectedRoute>
            }
          />

          {/* 3. Hostel Management */}
          <Route
            path="/student/hostel"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentHostel />
              </ProtectedRoute>
            }
          />

          {/* 4. Campus Transport */}
          <Route
            path="/student/transport"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentTransport />
              </ProtectedRoute>
            }
          />

          {/* 5. Campus Notices */}
          <Route
            path="/student/notices"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentNotices />
              </ProtectedRoute>
            }
          />

          {/* 6. Notifications */}
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentNotifications />
              </ProtectedRoute>
            }
          />

          {/* ==========================================================
              STUDENT SUB-MODULE CONNECTED ROUTES (STEP 6+ PREVIEWS)
              ========================================================== */}
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Attendance Management"
                  category="Academic"
                  stepNumber={6}
                  icon="fa-user-check"
                  description="Subject-wise attendance logs, leave applications, biometrics integration, and low attendance risk alerts will be implemented in Step 6."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/services"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Campus Services & Helpdesk"
                  category="Services"
                  stepNumber={6}
                  icon="fa-screwdriver-wrench"
                  description="Facility requests, ID card re-issues, certificates, and student grievances will be implemented in Step 6."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/requests"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Service Requests"
                  category="Services"
                  stepNumber={6}
                  icon="fa-list-check"
                  description="Track ticket statuses, responses from campus admin, and service history will be implemented in Step 6."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/mess"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Mess & Dining Services"
                  category="Campus Life"
                  stepNumber={6}
                  icon="fa-utensils"
                  description="Weekly dining menu, dietary preferences, meal feedback, and mess rebates will be implemented in Step 6."
                />
              </ProtectedRoute>
            }
          />
          {/* ==========================================================
              STEP 6: COMPLETE PLACEMENT & CAREER PORTAL ROUTES
              ========================================================== */}
          <Route
            path="/student/placements"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements/applications"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements/drives"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements/saved"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements/job/:id"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/placements/applications/:id"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/ai-assistant"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="CampusOne AI Assistant"
                  category="Intelligence"
                  stepNumber={9}
                  icon="fa-wand-magic-sparkles"
                  description="Intelligent LLM assistant for instant queries, schedule summaries, and campus guidance will be implemented in Step 9."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Student Profile & ID"
                  category="Account"
                  stepNumber={4}
                  icon="fa-user-gear"
                  description="Personal details, academic enrollment info, guardian contact, and security settings will be implemented in Step 4."
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentModulePlaceholder
                  moduleName="Account Settings"
                  category="Account"
                  stepNumber={4}
                  icon="fa-sliders"
                  description="Theme preferences, notification options, password updates, and privacy controls will be implemented in Step 4."
                />
              </ProtectedRoute>
            }
          />

          {/* ==========================================================
              STEP 7: COMPLETE FACULTY PORTAL ROUTES
              ========================================================== */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/courses"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/courses/:id"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/students"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/students/:id"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments/:id"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments/:id/submissions"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/exams"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/exams/:id"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/results"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/materials"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyMaterials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/notices"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/announcements"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/notifications"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/profile"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/settings"
            element={
              <ProtectedRoute allowedRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          {/* ==========================================================
              STEP 8: COMPLETE ADMIN PORTAL ROUTES
              ========================================================== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/:id"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty/:id"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminFaculty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses/:id"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDepartments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams/:id"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminFees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/library"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hostel"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminHostel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transport"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminTransport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/placements"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          {/* ==========================================================
              STEP 9: COMPLETE PARENT PORTAL ROUTES
              ========================================================== */}
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/attendance"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/academics"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentAcademics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/results"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentAcademics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/assignments"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentAssignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/exams"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/fees"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentFees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/library"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentLibrary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/hostel"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentHostel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/placements"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentPlacements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notices"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/announcements"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentNotices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/notifications"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/profile"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/settings"
            element={
              <ProtectedRoute allowedRole="parent">
                <ParentSettings />
              </ProtectedRoute>
            }
          />

          {/* Convenience Direct Aliases */}
          <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/parent" element={<Navigate to="/parent/dashboard" replace />} />

          {/* Global Fallback Entry Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
