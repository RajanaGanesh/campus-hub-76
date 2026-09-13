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
              pendingAssignmentsCount={data.assignments?.filter(a => a.status === 'Pending' || a.status === 'Due Soon').length || 0}
              nextExamDays={data.exams && data.exams.length > 0 ? data.exams[0].daysLeft : null}
              onRefresh={() => fetchDashboardData(true)}
              isRefreshing={isRefreshing}
            />

            {/* 2. Four Major Statistics Cards */}
            <StudentStatGrid
              attendancePercentage={data.overallAttendance || 0}
              presentDays={data.presentCount || 0}
              totalDays={data.totalClasses || 0}
              cgpa={Number(data.stats?.find(s => s.title === 'CGPA')?.value) || 0}
              pendingAssignmentsCount={data.assignments?.filter(a => a.status === 'Pending' || a.status === 'Due Soon').length || 0}
              upcomingExamsCount={data.exams?.length || 0}
            />

            {/* 3. Main Two-Column Analytics & Operational Layout */}
            <div className="student-dashboard-columns">
              {/* Primary Column (65% width on desktop) */}
              <div className="dashboard-column-main">
                {/* Overall Attendance Progress Ring Card (No subject-wise breakdown) */}
                <AttendanceOverviewCard
                  overallPercentage={data.overallAttendance || 0}
                  presentCount={data.presentCount || 0}
                  absentCount={data.absentCount || 0}
                  totalClasses={data.totalClasses || 0}
                />

                {/* Academic Performance CGPA Progression Chart */}
                <StudentPerformanceChart
                  data={data.performanceHistory || []}
                  currentCgpa={Number(data.stats?.find(s => s.title === 'CGPA')?.value) || 0}
                />

                {/* Recent Assignments Preview */}
                <RecentAssignmentsList
                  assignments={data.assignments || []}
                />

                {/* Upcoming Examinations Schedule */}
                <UpcomingExamsList
                  exams={data.exams || []}
                />

                {/* 8 Quick Action Tiles */}
                <QuickActionsGrid />
              </div>

              {/* Secondary Column (35% width on desktop) */}
              <div className="dashboard-column-side">
                {/* Upcoming Events Timeline */}
                <UpcomingEventsList
                  events={data.exams && data.exams.length > 0 ? data.exams.map(e => ({
                    id: `ex-${e.subject}`,
                    title: `${e.subject} Exam`,
                    category: 'exam' as const,
                    date: e.date,
                    time: e.time
                  })) : []}
                />

                {/* Fee Status Card */}
                <FeeSummaryCard
                  total={data.fees?.total || 0}
                  paid={data.fees?.paid || 0}
                  pending={data.fees?.pending || 0}
                  dueDate={data.fees?.dueDate || 'No dues'}
                />

                {/* Digital Library Summary */}
                <LibrarySummaryCard
                  issuedCount={data.library?.issued || 0}
                  dueSoonCount={data.library?.dueSoonCount || 0}
                  overdueCount={data.library?.overdueCount || 0}
                  fineAmount={0}
                  recentBookTitle={data.library?.books && data.library.books.length > 0 ? data.library.books[0].title : undefined}
                  recentBookDue={data.library?.books && data.library.books.length > 0 ? data.library.books[0].due : undefined}
                />

                {/* Placement Opportunities Card */}
                <PlacementSummaryCard
                  availableJobsCount={data.placements?.length || 0}
                  applicationsCount={0}
                  shortlistedCount={0}
                  upcomingDrivesCount={data.placements?.length || 0}
                  featuredRole={data.placements && data.placements.length > 0 ? data.placements[0].role : undefined}
                  featuredCompany={data.placements && data.placements.length > 0 ? data.placements[0].company : undefined}
                  featuredMeta={data.placements && data.placements.length > 0 ? `${data.placements[0].company} • ${data.placements[0].package} • ${data.placements[0].deadline}` : undefined}
                />

                {/* CampusOne AI Assistant Preview */}
                <AIAssistantPreview />

                {/* Recent Notifications Preview */}
                <NotificationsPreview
                  notifications={data.notifications && data.notifications.length > 0 ? data.notifications.map(n => ({
                    id: n.id,
                    icon: n.icon || 'fa-bell',
                    title: n.title,
                    time: n.time,
                    unread: n.unread
                  })) : []}
                />

                {/* Campus Announcements & Notices */}
                <CampusAnnouncements
                  announcements={data.announcements || []}
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
