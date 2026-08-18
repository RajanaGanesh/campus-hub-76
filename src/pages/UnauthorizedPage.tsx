import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';

export interface UnauthorizedPageProps {
  requiredRole?: string;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ requiredRole }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleReturnDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/${user.role}/dashboard`);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}
    >
      <div
        className="c1-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          padding: '44px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          borderRadius: '24px'
        }}
      >
        <Logo size="md" />

        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            fontSize: '36px',
            marginTop: '8px',
            boxShadow: '0 0 24px rgba(244, 63, 94, 0.2)'
          }}
        >
          <i className="fa-solid fa-shield-halved"></i>
        </div>

        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Access Denied
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            You do not have administrative or role permissions to access this section.
            {requiredRole && (
              <span style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>
                Required clearance: <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>{requiredRole}</strong>
              </span>
            )}
          </p>
        </div>

        {user && (
          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</div>
            </div>
            <Badge variant="primary">
              <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </Badge>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
          <button
            type="button"
            className="c1-btn c1-btn-gradient"
            onClick={handleReturnDashboard}
            style={{ width: '100%' }}
          >
            <i className="fa-solid fa-house"></i>
            <span>Return to My Dashboard</span>
          </button>

          <button
            type="button"
            className="c1-btn c1-btn-secondary"
            onClick={handleSignOut}
            style={{ width: '100%' }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
