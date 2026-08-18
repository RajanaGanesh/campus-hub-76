import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/AppLayout';
import { dbService } from '../../services/dbService';
import { studentDashboardData, StudentDashboardData } from '../../data/studentDashboardData';
import { Toast } from '../../components/Toast';

// Modular Student Dashboard Components
import { StudentWelcomeCard } from '../../components/student/StudentWelcomeCard';
import { StudentStatGrid } from '../../components/student/StudentStatGrid';
import { AttendanceOverviewCard } from '../../components/student/AttendanceOverviewCard';
import { StudentPerformanceChart } from '../../components/student/StudentPerformanceChart';
import { RecentAssignmentsList } from '../../components/student/RecentAssignmentsList';
import { UpcomingExamsList } from '../../components/student/UpcomingExamsList';
import { QuickActionsGrid } from '../../components/student/QuickActionsGrid';
import { UpcomingEventsList } from '../../components/student/UpcomingEventsList';
import { FeeSummaryCard } from '../../components/student/FeeSummaryCard';
import { LibrarySummaryCard } from '../../components/student/LibrarySummaryCard';
import { PlacementSummaryCard } from '../../components/student/PlacementSummaryCard';
import { NotificationsPreview } from '../../components/student/NotificationsPreview';
import { CampusAnnouncements } from '../../components/student/CampusAnnouncements';
import { AIAssistantPreview } from '../../components/student/AIAssistantPreview';
import { StudentDashboardSkeleton, StudentErrorState } from '../../components/student/StudentStates';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<StudentDashboardData>(studentDashboardData);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchDashboardData = useCallback(async (showSyncToast = false) => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMsg(null);
      if (showSyncToast) setIsRefreshing(true);

      const res = await dbService.getStudentDashboardData(user.email);
      if (res) {
        setData(res);
        if (showSyncToast) {
          showToast('Student academic records synced successfully.', 'success');
        }
      }
    } catch (err: any) {
      console.error('Failed to query student dashboard data:', err);
      setErrorMsg('Unable to synchronize data from the institutional database. Showing cached records.');
      showToast('Operating in local cached mode.', 'warning');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <AppLayout>
      <div className="student-dashboard-page">
        {isLoading ? (
          <StudentDashboardSkeleton />
        ) : errorMsg && !data ? (
          <StudentErrorState message={errorMsg} onRetry={() => fetchDashboardData(true)} />
        ) : (
          <div className="student-dashboard-content">
            {/* 1. Header Welcome Banner */}
            <StudentWelcomeCard
              department={user?.department || data.profile.department}
              semester={data.profile.semester}
              onRefresh={() => fetchDashboardData(true)}
              isRefreshing={isRefreshing}
            />

            {/* 2. Four Major Statistics Cards */}
            <StudentStatGrid
              attendancePercentage={data.overallAttendance}
              presentDays={142}
              totalDays={165}
              cgpa={8.6}
              pendingAssignmentsCount={data.assignments?.length || 4}
              upcomingExamsCount={data.exams?.length || 3}
            />

            {/* 3. Main Two-Column Analytics & Operational Layout */}
            <div className="student-dashboard-columns">
              {/* Primary Column (65% width on desktop) */}
              <div className="dashboard-column-main">
                {/* Overall Attendance Progress Ring Card (No subject-wise breakdown) */}
                <AttendanceOverviewCard
                  overallPercentage={data.overallAttendance}
                  presentCount={142}
                  absentCount={23}
                  totalClasses={165}
                />

                {/* Academic Performance CGPA Progression Chart */}
                <StudentPerformanceChart
                  data={data.performanceHistory}
                  currentCgpa={8.6}
                />

                {/* Recent Assignments Preview */}
                <RecentAssignmentsList
                  assignments={data.assignments}
                />

                {/* Upcoming Examinations Schedule */}
                <UpcomingExamsList
                  exams={data.exams}
                />

                {/* 8 Quick Action Tiles */}
                <QuickActionsGrid />
              </div>

              {/* Secondary Column (35% width on desktop) */}
              <div className="dashboard-column-side">
                {/* Upcoming Events Timeline */}
                <UpcomingEventsList />

                {/* Fee Status Card */}
                <FeeSummaryCard
                  total={data.fees?.total || 85000}
                  paid={data.fees?.paid || 72500}
                  pending={data.fees?.pending || 12500}
                  dueDate={data.fees?.dueDate || '30 Aug 2026'}
                />

                {/* Digital Library Summary */}
                <LibrarySummaryCard
                  issuedCount={data.library?.issued || 3}
                  dueSoonCount={data.library?.dueSoonCount || 1}
                  overdueCount={data.library?.overdueCount || 0}
                  fineAmount={0}
                />

                {/* Placement Opportunities Card */}
                <PlacementSummaryCard
                  availableJobsCount={12}
                  applicationsCount={3}
                  shortlistedCount={1}
                  upcomingDrivesCount={2}
                />

                {/* CampusOne AI Assistant Preview */}
                <AIAssistantPreview />

                {/* Recent Notifications Preview */}
                <NotificationsPreview />

                {/* Campus Announcements & Notices */}
                <CampusAnnouncements
                  announcements={data.announcements}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Toast Feedback */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
