import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  actions,
  className = ''
}) => {
  return (
    <div className={`c1-page-container ${className}`}>
      {(title || subtitle || actions) && (
        <div className="c1-page-header">
          <div className="c1-page-header-text">
            {title && <h1 className="c1-page-title">{title}</h1>}
            {subtitle && <p className="c1-page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="c1-page-header-actions">{actions}</div>}
        </div>
      )}
      <div className="c1-page-content">{children}</div>
    </div>
  );
};
