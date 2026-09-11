import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EffectiveProfile } from '../utils/userProfile';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: EffectiveProfile;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ isOpen, onClose, profile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const displayName = profile?.name || user?.name || 'Student';
  const displayEmail = profile?.email || user?.email || 'student@campushub.edu';
  const userRole = profile?.role || user?.role || 'student';
  const profilePath = userRole === 'admin' ? '/admin/settings' : userRole === 'faculty' ? '/faculty/profile' : '/student/profile';
  const settingsPath = userRole === 'admin' ? '/admin/settings' : '/student/settings';

  return (
    <div className="dropdown-menu user-dropdown-panel" style={{ display: 'block' }}>
      <div className="dropdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={displayName}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #6C4BFF' }}
            />
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C4BFF 0%, #2196F3 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                flexShrink: 0
              }}
            >
              {profile?.initials || displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div className="profile-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
              {displayName}
            </div>
            <div className="profile-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '11px', color: '#64748B' }}>
              {displayEmail}
            </div>
          </div>
        </div>
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
          <span>My Profile & Digital ID</span>
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

