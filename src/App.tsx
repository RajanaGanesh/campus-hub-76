import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Timetable } from './pages/Timetable';
import { Assignments } from './pages/Assignments';
import { Examinations } from './pages/Examinations';
import { Results } from './pages/Results';
import { LearningHub } from './pages/LearningHub';
import { CourseDetails } from './pages/CourseDetails';
import { Library } from './pages/Library';
import { Fees } from './pages/Fees';
import { CampusServices } from './pages/CampusServices';
import { ServiceRequests } from './pages/ServiceRequests';
import { Placements } from './pages/Placements';
import { JobDetails } from './pages/JobDetails';
import { MyApplications } from './pages/MyApplications';
import { SavedJobs } from './pages/SavedJobs';
import { PlacementCalendar } from './pages/PlacementCalendar';
import { CareerProfile } from './pages/CareerProfile';
import { PlacementPrep } from './pages/PlacementPrep';
import { Hostel } from './pages/Hostel';
import { HostelRequests } from './pages/HostelRequests';
import { Mess } from './pages/Mess';
import { Transport } from './pages/Transport';
import { CampusMobility } from './pages/CampusMobility';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { CampusAI } from './pages/CampusAI';
import { Insights } from './pages/Insights';
import { HelpCenter } from './pages/HelpCenter';

// Faculty dashboard views
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyAttendance } from './pages/faculty/FacultyAttendance';
import { FacultyStudents } from './pages/faculty/FacultyStudents';
import { FacultyAssignments } from './pages/faculty/FacultyAssignments';
import { FacultyGrading } from './pages/faculty/FacultyGrading';
import { FacultyCourses } from './pages/faculty/FacultyCourses';
import { FacultyExams } from './pages/faculty/FacultyExams';
import { FacultyAnnouncements } from './pages/faculty/FacultyAnnouncements';

// Admin dashboard views
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminFees } from './pages/admin/AdminFees';
import { AdminPlacements } from './pages/admin/AdminPlacements';
import { AdminHostel } from './pages/admin/AdminHostel';
import { AdminTransport } from './pages/admin/AdminTransport';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';

import './styles/theme.css';
import './styles/login.css';
import './styles/dashboard.css';

// Redirect route helper
const HomeRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'student' || user.role === 'parent') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Navigate to="/login" replace />;
};

const LoginRouteWrapper: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'student' || user.role === 'parent') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Login />;
};

export const App: React.FC = () => {
  // Lists of all remaining placeholder pathways to register
  const placeholderRoutes = [
    '/departments',
    '/announcements',
    '/notifications',
    '/ai',
    '/analytics',
    '/profile',
    '/settings',
    '/performance'
  ];

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login Route */}
          <Route path="/login" element={<LoginRouteWrapper />} />

          {/* Protected Main Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Core Academic Modules */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Attendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Timetable />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assignments"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Assignments />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Examinations Management */}
          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Examinations />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Academic Results */}
          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Results />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Learning Management System */}
          <Route
            path="/learning"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <LearningHub />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/learning/:courseId"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <CourseDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Digital Library Catalog */}
          <Route
            path="/library"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Library />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Fees Management & Payments */}
          <Route
            path="/fees"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Fees />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Campus Services */}
          <Route
            path="/services"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <CampusServices />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/services/requests"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <ServiceRequests />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Placements & Careers Portal */}
          <Route
            path="/placements"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Placements />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/jobs/:jobId"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <JobDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/applications"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <MyApplications />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/saved"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <SavedJobs />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/calendar"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <PlacementCalendar />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/profile"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <CareerProfile />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/placements/prep"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <PlacementPrep />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Hostel, Mess, & Campus Mobility */}
          <Route
            path="/hostel"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Hostel />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hostel/requests"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <HostelRequests />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hostel/mess"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Mess />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transport"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <Transport />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mobility"
            element={
              <ProtectedRoute allowedRole="student">
                <AppLayout>
                  <CampusMobility />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Faculty Section Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyAttendance />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/students"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyStudents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyAssignments />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/assignments/:assignmentId"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyGrading />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/courses"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyCourses />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/exams"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyExams />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/announcements"
            element={
              <ProtectedRoute allowedRole="faculty">
                <AppLayout>
                  <FacultyAnnouncements />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Section Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminStudents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminFaculty />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminCourses />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fees"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminFees />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/placements"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminPlacements />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hostel"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminHostel />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transport"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminTransport />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminRequests />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <ProtectedRoute allowedRole="admin">
                <AppLayout>
                  <AdminAnnouncements />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Assistant Page */}
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CampusAI />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Personalized Insights Page */}
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Insights />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Campus Help Center FAQ Page */}
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HelpCenter />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Dynamically register all placeholders */}
          {placeholderRoutes.map((path) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <PlaceholderPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Fallback Entry route redirection */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
