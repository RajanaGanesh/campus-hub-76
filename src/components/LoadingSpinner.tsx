import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
  className = ''
}) => {
  const pixelSizes = {
    sm: 16,
    md: 20,
    lg: 28
  };

  const dim = pixelSizes[size];

  return (
    <svg
      className={`c1-spinner c1-spinner-${size} ${className}`}
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.415, 31.415"
        strokeDashoffset="10"
        opacity="0.3"
      />
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 14.6565 3.03361 17.0717 4.72876 18.8627"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
