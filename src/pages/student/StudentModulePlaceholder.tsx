import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';

export interface StudentModulePlaceholderProps {
  moduleName: string;
  category: string;
  stepNumber: number | string;
  icon: string;
  description: string;
}

export const StudentModulePlaceholder: React.FC<StudentModulePlaceholderProps> = ({
  moduleName,
  category,
  stepNumber,
  icon,
  description
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <AppLayout>
      <div style={{ padding: '32px 24px', maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Module Header Card */}
        <div
          className="c1-card"
          style={{
            padding: '36px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              color: 'var(--accent-blue)',
              flexShrink: 0
            }}
          >
            <i className={`fa-solid ${icon}`}></i>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                {moduleName}
              </h1>
              <span className="c1-badge c1-badge-primary">
                {category}
              </span>
              <span className="c1-badge c1-badge-purple">
                Step {stepNumber} Target
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {description}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => navigate('/student/dashboard')}
              >
                <i className="fa-solid fa-house"></i>
                <span>Return to Student Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Informational Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-user-graduate" style={{ color: 'var(--accent-blue)' }}></i>
              Active Student Session
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Logged in as <strong style={{ color: '#ffffff' }}>{user?.name}</strong> ({user?.email}) with verified student role.
            </p>
          </div>

          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-diagram-project" style={{ color: 'var(--color-success)' }}></i>
              Development Roadmap
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Full deep-dive features for <strong>{moduleName}</strong> will be implemented in Step {stepNumber} according to the 10-stage architecture plan.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
