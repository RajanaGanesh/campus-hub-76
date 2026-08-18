import React from 'react';

export interface AlertProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onDismiss,
  className = ''
}) => {
  const iconMap = {
    error: 'fa-circle-exclamation',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  return (
    <div className={`c1-alert c1-alert-${type} ${className}`} role="alert">
      <i className={`fa-solid ${iconMap[type]} c1-alert-icon`}></i>
      <div className="c1-alert-content">
        {title && <h4 className="c1-alert-title">{title}</h4>}
        <div className="c1-alert-message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="c1-alert-close"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};
