import React from 'react';

interface AuthAlertProps {
  message: string | null;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="login-error-box">
      <i className="fa-solid fa-circle-exclamation"></i>
      <span>{message}</span>
    </div>
  );
};
