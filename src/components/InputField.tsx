import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={props.id}>{label}</label>
      <div className="input-wrapper">
        <input {...props} />
      </div>
      {error && (
        <span className="input-error-msg">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </span>
      )}
    </div>
  );
};
