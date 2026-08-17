import React from 'react';

// Loading Spinner
export const LoadingSpinner: React.FC = () => {
  return (
    <div className="spinner-box">
      <div className="spinner-ring"></div>
    </div>
  );
};

// Skeleton Card Loader
export const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-text title"></div>
      <div className="skeleton-text long"></div>
      <div className="skeleton-text short"></div>
    </div>
  );
};

// Reusable Empty State
interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fa-folder-open',
  title = 'No records found',
  description = 'There is currently no data loaded in this section.',
}) => {
  return (
    <div className="empty-state-box">
      <i className={`fa-solid ${icon}`}></i>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
};

// Reusable Error State
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'Unable to fetch data. Please try reloading the panel.',
  onRetry,
}) => {
  return (
    <div className="error-state-box">
      <i className="fa-solid fa-triangle-exclamation"></i>
      <h4>{title}</h4>
      <p>{description}</p>
      {onRetry && (
        <button type="button" className="btn-retry-err" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};
