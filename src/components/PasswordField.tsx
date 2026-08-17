import React, { useState } from 'react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ label, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{label}</label>
      <div className="input-wrapper">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={toggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
        </button>
      </div>
      {error && (
        <span className="input-error-msg">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </span>
      )}
    </div>
  );
};
