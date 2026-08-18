import React from 'react';

export const StudentDashboardSkeleton: React.FC = () => {
  return (
    <div className="student-dashboard-skeleton" aria-label="Loading student dashboard data...">
      {/* Banner Skeleton */}
      <div className="skeleton-box skeleton-banner"></div>

      {/* 4 Stats Grid Skeleton */}
      <div className="skeleton-stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-box skeleton-stat-card"></div>
        ))}
      </div>

      {/* Main 2-Column Grid Skeleton */}
      <div className="skeleton-main-grid">
        <div className="skeleton-col-left">
          <div className="skeleton-box skeleton-gauge-card"></div>
          <div className="skeleton-box skeleton-chart-card"></div>
          <div className="skeleton-box skeleton-list-card"></div>
        </div>
        <div className="skeleton-col-right">
          <div className="skeleton-box skeleton-events-card"></div>
          <div className="skeleton-box skeleton-summary-card"></div>
          <div className="skeleton-box skeleton-summary-card"></div>
        </div>
      </div>
    </div>
  );
};

export interface StudentEmptyStateProps {
  title?: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

export const StudentEmptyState: React.FC<StudentEmptyStateProps> = ({
  title = 'No records found',
  description = "You're all caught up! No pending items in this category.",
  icon = 'fa-folder-open',
  actionText,
  onAction
}) => {
  return (
    <div className="student-empty-state">
      <div className="empty-icon-wrap">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {actionText && onAction && (
        <button type="button" className="c1-btn c1-btn-secondary btn-empty-action" onClick={onAction}>
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export interface StudentErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const StudentErrorState: React.FC<StudentErrorStateProps> = ({
  message = 'Unable to synchronize student dashboard records.',
  onRetry
}) => {
  return (
    <div className="c1-card student-error-card" role="alert">
      <div className="error-card-icon">
        <i className="fa-solid fa-circle-exclamation"></i>
      </div>
      <div className="error-card-text">
        <h3 className="error-card-title">Data Synchronization Error</h3>
        <p className="error-card-message">{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="c1-btn c1-btn-gradient btn-retry-error" onClick={onRetry}>
          <i className="fa-solid fa-rotate-right"></i>
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
