import React from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <div className={`input-wrapper ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''}`}>
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
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
