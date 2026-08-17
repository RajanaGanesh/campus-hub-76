import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardPlaceholderProps {
  roleName: 'Student' | 'Faculty' | 'Admin' | 'Parent';
  stepDetail: string;
}

const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ roleName, stepDetail }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="logo-badge" style={{ margin: '0 auto' }}>C1</div>
        <h1>Campus Hub</h1>
        <h2 style={{ fontSize: '20px', color: 'var(--accent-highlight)', margin: '12px 0 20px 0' }}>
          {roleName} Dashboard
        </h2>
        
        <p>
          Logged in as: <strong style={{ color: 'white' }}>{user?.name}</strong> ({user?.email})
        </p>
        
        <p style={{ marginTop: '10px' }}>
          {stepDetail}
        </p>

        <button className="btn-logout" onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '8px' }}></i>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export const StudentDashboard: React.FC = () => (
  <DashboardPlaceholder roleName="Student" stepDetail="Student Dashboard will be implemented in Step 3." />
);

export const FacultyDashboard: React.FC = () => (
  <DashboardPlaceholder roleName="Faculty" stepDetail="Faculty Dashboard will be implemented in Step 3." />
);

export const AdminDashboard: React.FC = () => (
  <DashboardPlaceholder roleName="Admin" stepDetail="Admin Dashboard will be implemented in Step 3." />
);

export const ParentDashboard: React.FC = () => (
  <DashboardPlaceholder roleName="Parent" stepDetail="Parent Dashboard will be implemented in Step 3." />
);
