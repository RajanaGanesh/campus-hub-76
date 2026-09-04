import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { Badge } from '../components/Badge';

export interface RoleDashboardPlaceholderProps {
  roleName: 'student' | 'faculty' | 'admin';
}

export const RoleDashboardPlaceholder: React.FC<RoleDashboardPlaceholderProps> = ({ roleName }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleMeta = {
    student: {
      title: 'Student Portal Dashboard',
      stepInfo: 'Student dashboard modules (Attendance, Timetable, Assignments, Exams, Results, LMS) will be implemented in Step 3.',
      icon: 'fa-graduation-cap',
      badgeVariant: 'primary' as const
    },
    faculty: {
      title: 'Faculty Portal Dashboard',
      stepInfo: 'Faculty management modules (Attendance, Grading, Courses, Exams) will be implemented in subsequent stages.',
      icon: 'fa-chalkboard-user',
      badgeVariant: 'purple' as const
    },
    admin: {
      title: 'Institutional Admin Dashboard',
      stepInfo: 'Campus-wide Administration modules (Students, Faculty, Fees, Placements, Hostel) will be implemented in subsequent stages.',
      icon: 'fa-user-shield',
      badgeVariant: 'cyan' as const
    }
  };

  const meta = roleMeta[roleName];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Top App Bar Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px'
        }}
      >
        <Logo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</span>
          </div>
          <Badge variant={meta.badgeVariant}>
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </Badge>
          <button
            type="button"
            className="c1-btn c1-btn-secondary"
            onClick={handleLogout}
            style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Log Out</span>
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Role Welcome Hero */}
        <div
          className="c1-card"
          style={{
            padding: '36px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              color: 'var(--accent-blue)',
              flexShrink: 0
            }}
          >
            <i className={`fa-solid ${meta.icon}`}></i>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {meta.title}
              </h2>
              <span className="c1-badge c1-badge-success">
                <i className="fa-solid fa-circle-check"></i> Step 2: Auth Active
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '16px' }}>
              {meta.stepInfo}
            </p>

            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)'
              }}
            >
              <i className="fa-solid fa-lock" style={{ color: 'var(--color-success)' }}></i>
              <span>Active session secured with role-based access controls for <strong>{user?.email}</strong></span>
            </div>
          </div>
        </div>

        {/* Security & Access Verification Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* User Profile Card */}
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-id-badge" style={{ color: 'var(--accent-blue)' }}></i>
              Session Identity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Institutional Email</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.email}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Assigned Security Role</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
            </div>
          </div>

          {/* Test Security Access Card */}
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-warning)' }}></i>
              Role Boundary Verification
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Test route isolation by attempting to access protected endpoints outside your role clearance:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roleName !== 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="c1-btn c1-btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '8px 12px', justifyContent: 'flex-start' }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: 'var(--color-error)' }}></i>
                  <span>Test Unauthorized: /admin/dashboard</span>
                </Link>
              )}
              {roleName !== 'faculty' && (
                <Link
                  to="/faculty/dashboard"
                  className="c1-btn c1-btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '8px 12px', justifyContent: 'flex-start' }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: 'var(--color-error)' }}></i>
                  <span>Test Unauthorized: /faculty/dashboard</span>
                </Link>
              )}
              {roleName !== 'student' && (
                <Link
                  to="/student/dashboard"
                  className="c1-btn c1-btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '8px 12px', justifyContent: 'flex-start' }}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{ color: 'var(--color-error)' }}></i>
                  <span>Test Unauthorized: /student/dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
