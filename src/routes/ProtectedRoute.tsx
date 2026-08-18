import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { AuthLoading } from '../components/AuthLoading';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
  allowedRoles?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
  allowedRoles
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // 1. Show loading state while verifying persistent session
  if (loading) {
    return <AuthLoading message="Validating campus session..." />;
  }

  // 2. Redirect unauthenticated users to login, storing attempted destination
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Normalize role checks
  const targetRoles: UserRole[] = [];
  if (allowedRole) {
    targetRoles.push(allowedRole);
  }
  if (allowedRoles) {
    if (Array.isArray(allowedRoles)) {
      targetRoles.push(...allowedRoles);
    } else {
      targetRoles.push(allowedRoles);
    }
  }

  // 4. If specific roles are required, verify that user's profile role satisfies them
  if (targetRoles.length > 0) {
    const isAuthorized = targetRoles.includes(user.role);
    if (!isAuthorized) {
      return <UnauthorizedPage requiredRole={targetRoles.join(', ')} />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
