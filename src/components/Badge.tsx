import React from 'react';

export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'cyan' | 'purple' | 'default';
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  icon,
  className = ''
}) => {
  return (
    <span className={`c1-badge c1-badge-${variant} ${className}`}>
      {icon && <i className={`fa-solid ${icon} c1-badge-icon`}></i>}
      <span>{children}</span>
    </span>
  );
};
