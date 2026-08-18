import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glow' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'c1-card-padding-sm',
    md: 'c1-card-padding-md',
    lg: 'c1-card-padding-lg'
  };

  const hasHeader = title || subtitle || headerAction;

  return (
    <div className={`c1-card c1-card-${variant} ${paddingClasses[padding]} ${className}`} {...props}>
      {hasHeader && (
        <div className="c1-card-header">
          <div className="c1-card-header-titles">
            {title && (typeof title === 'string' ? <h3 className="c1-card-title">{title}</h3> : title)}
            {subtitle && (typeof subtitle === 'string' ? <p className="c1-card-subtitle">{subtitle}</p> : subtitle)}
          </div>
          {headerAction && <div className="c1-card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="c1-card-body">{children}</div>
      {footer && <div className="c1-card-footer">{footer}</div>}
    </div>
  );
};
