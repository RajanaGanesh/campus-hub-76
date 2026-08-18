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
  attendancePercentage = 86,
  presentDays = 142,
  totalDays = 165,
  cgpa = 8.6,
  pendingAssignmentsCount = 4,
  upcomingExamsCount = 3
}) => {
  const navigate = useNavigate();

  const isAttendanceSafe = attendancePercentage >= 75;

  const stats = [
    {
      id: 'stat-attendance',
      icon: 'fa-user-check',
      title: 'Overall Attendance',
      value: `${attendancePercentage}%`,
      subtitle: `${presentDays} / ${totalDays} Total Days Present`,
      statusText: isAttendanceSafe ? 'Good Standing' : 'Action Required',
      statusVariant: isAttendanceSafe ? 'success' : 'error',
      colorClass: 'stat-accent-purple',
      route: '/student/attendance'
    },
    {
      id: 'stat-cgpa',
      icon: 'fa-award',
      title: 'Current CGPA',
      value: cgpa.toFixed(1),
      subtitle: '8th Semester • Top 5% Tier',
      statusText: 'Excellent',
      statusVariant: 'success',
      colorClass: 'stat-accent-cyan',
      route: '/student/results'
    },
    {
      id: 'stat-assignments',
      icon: 'fa-file-invoice',
      title: 'Pending Assignments',
      value: pendingAssignmentsCount.toString(),
      subtitle: '2 submissions due this week',
      statusText: 'Due Soon',
      statusVariant: 'warning',
      colorClass: 'stat-accent-blue',
      route: '/student/assignments'
    },
    {
      id: 'stat-exams',
      icon: 'fa-receipt',
      title: 'Upcoming Exams',
      value: upcomingExamsCount.toString(),
      subtitle: 'Next: Data Structures (9d left)',
      statusText: 'Scheduled',
      statusVariant: 'primary',
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
