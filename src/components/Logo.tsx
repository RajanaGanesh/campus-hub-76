import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  return (
    <div className={`c1-logo-container ${className}`}>
      <div className={`logo-badge logo-badge-${size}`}>
        C1
      </div>
      {showText && (
        <span className={`c1-brand-name c1-brand-${size}`}>
          CampusOne
        </span>
      )}
    </div>
  );
};

