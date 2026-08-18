import React from 'react';
import { Logo } from './Logo';
import { LoadingSpinner } from './LoadingSpinner';

export interface AuthLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = 'Verifying campus credentials...',
  fullScreen = true
}) => {
  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        gap: '24px'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: '20px',
        padding: '32px'
      };

  return (
    <div style={containerStyle} role="status" aria-live="polite">
      <Logo size="lg" showText={true} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LoadingSpinner size="md" color="var(--accent-primary)" />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
          {message}
        </span>
      </div>
    </div>
  );
};
