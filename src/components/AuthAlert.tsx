import React from 'react';

export interface AuthAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="login-error-box" role="alert">
      <i className="fa-solid fa-circle-exclamation error-icon"></i>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="alert-dismiss-btn"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};
