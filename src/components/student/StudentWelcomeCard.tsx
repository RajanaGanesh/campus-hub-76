import React from 'react';
import { useAuth } from '../../context/AuthContext';

export interface StudentWelcomeCardProps {
  department?: string;
  semester?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const StudentWelcomeCard: React.FC<StudentWelcomeCardProps> = ({
  department = 'Computer Science & Engineering',
  semester = '8th Semester • IV Year',
  onRefresh,
  isRefreshing = false
}) => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const studentName = user?.name || 'Student';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="student-welcome-banner c1-card">
      {/* Ambient background glow */}
      <div className="welcome-banner-glow"></div>

      <div className="welcome-banner-content">
        <div className="welcome-header-badge">
          <span className="live-indicator"></span>
          <span>{todayFormatted}</span>
          <span className="badge-dot">•</span>
          <span>{semester}</span>
        </div>

        <h1 className="welcome-title">
          {getGreeting()}, <span className="student-name-highlight">{studentName}</span> 👋
        </h1>

        <p className="welcome-subtitle">
          Here's what's happening with your campus life today. You have <strong style={{ color: 'var(--text-primary)' }}>4 assignments pending</strong> and your next exam starts in <strong style={{ color: 'var(--accent-blue)' }}>9 days</strong>.
        </p>

        <div className="welcome-meta-chips">
          <div className="meta-chip">
            <i className="fa-solid fa-graduation-cap"></i>
            <span>{department}</span>
          </div>
          <div className="meta-chip">
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-success)' }}></i>
            <span>Verified Student Account</span>
          </div>
        </div>
      </div>

      <div className="welcome-banner-visual">
        <div className="floating-badge-graphic">
          <div className="graphic-icon-wrap">
            <i className="fa-solid fa-laptop-code"></i>
          </div>
          <div className="graphic-mini-stat">
            <span className="mini-stat-label">Academic Status</span>
            <span className="mini-stat-val">Enrolled • Active</span>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            className="c1-btn c1-btn-secondary btn-refresh-banner"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard data"
          >
            <i className={`fa-solid fa-rotate-right ${isRefreshing ? 'fa-spin' : ''}`}></i>
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
