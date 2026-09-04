import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const userRole = user?.role || 'student';
  const profilePath = userRole === 'admin' ? '/admin/settings' : userRole === 'faculty' ? '/faculty/dashboard' : '/student/profile';
  const settingsPath = userRole === 'admin' ? '/admin/settings' : '/student/settings';

  return (
    <div className="dropdown-menu user-dropdown-panel" style={{ display: 'block' }}>
      <div className="dropdown-header">
        <div className="profile-name">{user?.name || 'Ganesh'}</div>
        <div className="profile-email">{user?.email || 'ganesh@campushub.com'}</div>
        <div className="profile-role-badge">
          <span className="role-tag">{userRole.toUpperCase()}</span>
          <span className="account-status-dot"></span> Active
        </div>
      </div>

      <div className="dropdown-list">
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            onClose();
            navigate(profilePath);
          }}
        >
          <i className="fa-regular fa-user"></i>
          <span>My Profile</span>
        </button>
        <button
          type="button"
          className="dropdown-item"
          onClick={() => {
            onClose();
            navigate(settingsPath);
          }}
        >
          <i className="fa-solid fa-sliders"></i>
          <span>Settings</span>
        </button>
        <button
          type="button"
          className="dropdown-item danger"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileMenu;
