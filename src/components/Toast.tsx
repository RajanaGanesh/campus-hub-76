import React from 'react';

export interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose
}) => {
  if (!message) return null;

  const iconMap = {
    info: 'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    error: 'fa-circle-exclamation'
  };

  return (
    <div className={`toast-msg toast-${type}`} role="status">
      <i className={`fa-solid ${iconMap[type]}`}></i>
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};
