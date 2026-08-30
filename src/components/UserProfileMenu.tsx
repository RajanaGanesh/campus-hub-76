import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <div className="dropdown-menu" style={{ display: 'block' }}>
      <div className="dropdown-header">
        <div className="profile-name">{user?.name || 'Ganesh'}</div>
        <div className="profile-email">{user?.email || 'ganesh@campushub.com'}</div>
        <div className="profile-role">{user?.role || 'student'}</div>
      </div>

      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Theme Mode
        </span>
        <ThemeToggle variant="segmented" />
      </div>

      <div className="dropdown-list">
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            onClose();
            navigate('/profile');
          }}
        >
          <i className="fa-solid fa-circle-user"></i>
          My Profile
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
        >
          <i className="fa-solid fa-sliders"></i>
          Settings
        </button>
        <button
          type="button"
          className="dropdown-item danger"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          Sign Out
        </button>
      </div>
    </div>
  );
};
