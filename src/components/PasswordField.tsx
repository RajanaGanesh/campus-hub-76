import React, { useState } from 'react';

export interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className="input-wrapper has-right-icon">
        <input
          id={inputId}
          {...props}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={toggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
        >
          <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
        </button>
      </div>
      {error ? (
        <span id={`${inputId}-error`} className="input-error-msg" role="alert">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </span>
      ) : helperText ? (
        <span className="input-helper-msg">{helperText}</span>
      ) : null}
    </div>
  );
};
