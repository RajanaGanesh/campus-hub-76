import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface StudentStatGridProps {
  attendancePercentage?: number;
  presentDays?: number;
  totalDays?: number;
  cgpa?: number;
  pendingAssignmentsCount?: number;
  upcomingExamsCount?: number;
}

export const StudentStatGrid: React.FC<StudentStatGridProps> = ({
  attendancePercentage = 0,
  presentDays = 0,
  totalDays = 0,
  cgpa = 0,
  pendingAssignmentsCount = 0,
  upcomingExamsCount = 0
}) => {
  const navigate = useNavigate();

  const isAttendanceSafe = attendancePercentage >= 75;

  const stats = [
    {
      id: 'stat-attendance',
      icon: 'fa-user-check',
      title: 'Overall Attendance',
      value: `${attendancePercentage}%`,
      subtitle: totalDays > 0 ? `${presentDays} / ${totalDays} Total Days Present` : 'Institutional Attendance Register',
      statusText: attendancePercentage > 0 ? (isAttendanceSafe ? 'Good Standing' : 'Action Required') : 'Active',
      statusVariant: isAttendanceSafe ? 'success' : attendancePercentage > 0 ? 'error' : 'neutral',
      colorClass: 'stat-accent-purple',
      route: '/student/attendance'
    },
    {
      id: 'stat-cgpa',
      icon: 'fa-award',
      title: 'Current CGPA',
      value: cgpa > 0 ? cgpa.toFixed(1) : '0.0',
      subtitle: 'Academic Transcript Rating',
      statusText: cgpa >= 8.0 ? 'Excellent' : cgpa >= 6.5 ? 'Good' : 'Active',
      statusVariant: 'success',
      colorClass: 'stat-accent-cyan',
      route: '/student/results'
    },
    {
      id: 'stat-assignments',
      icon: 'fa-file-invoice',
      title: 'Pending Assignments',
      value: pendingAssignmentsCount.toString(),
      subtitle: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} pending submissions` : 'All caught up',
      statusText: pendingAssignmentsCount > 0 ? 'Due Soon' : 'Completed',
      statusVariant: pendingAssignmentsCount > 0 ? 'warning' : 'success',
      colorClass: 'stat-accent-blue',
      route: '/student/assignments'
    },
    {
      id: 'stat-exams',
      icon: 'fa-receipt',
      title: 'Upcoming Exams',
      value: upcomingExamsCount.toString(),
      subtitle: upcomingExamsCount > 0 ? `${upcomingExamsCount} scheduled tests` : 'No upcoming exams',
      statusText: upcomingExamsCount > 0 ? 'Scheduled' : 'None',
      statusVariant: upcomingExamsCount > 0 ? 'primary' : 'neutral',
      colorClass: 'stat-accent-indigo',
      route: '/student/exams'
    }
  ];

  return (
    <div className="student-stats-grid">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className={`student-stat-card c1-card ${stat.colorClass}`}
          onClick={() => navigate(stat.route)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(stat.route);
            }
          }}
        >
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <span className={`c1-badge c1-badge-${stat.statusVariant}`}>
              {stat.statusText}
            </span>
          </div>

          <div className="stat-card-body">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-subtitle">{stat.subtitle}</div>
          </div>

          <div className="stat-card-footer">
            <span>View details</span>
            <i className="fa-solid fa-arrow-right stat-arrow-icon"></i>
          </div>
        </div>
      ))}
    </div>
  );
};
