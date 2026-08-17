import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'student' | 'faculty' | 'admin' | 'parent';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user) {
    const userRoleLower = user.role.toLowerCase().trim();
    const allowedRoleLower = allowedRole.toLowerCase().trim();
    
    if (userRoleLower !== allowedRoleLower) {
      if (userRoleLower === 'student' || userRoleLower === 'parent') {
        return <Navigate to="/dashboard" replace />;
      } else if (userRoleLower === 'faculty') {
        return <Navigate to="/faculty" replace />;
      } else if (userRoleLower === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      
      // Fallback Access Denied panel (unrecognized roles)
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: '20px',
          textAlign: 'center',
          padding: '30px',
          color: 'white'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(217, 83, 79, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-error)',
            fontSize: '32px'
          }}>
            <i className="fa-solid fa-ban"></i>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900' }}>Access Denied</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '14px', lineHeight: '1.5' }}>
            You do not have permissions to view this section. If you think this is an error, please contact system administration.
          </p>
          <a
            href="/login"
            className="btn-signin"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '0 24px', height: '40px', marginTop: '10px', textDecoration: 'none', color: 'white', fontWeight: 'bold', borderRadius: '8px', background: 'var(--accent-primary)' }}
          >
            Return to My Dashboard
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
};
