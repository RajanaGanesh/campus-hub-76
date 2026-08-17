import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';

interface TopNavbarProps {
  onSidebarToggle: () => void;
  onSearchOpen: () => void;
  unreadNotifCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (val: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (val: boolean) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onSidebarToggle,
  onSearchOpen,
  unreadNotifCount,
  isNotificationsOpen,
  setIsNotificationsOpen,
  isProfileOpen,
  setIsProfileOpen
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbMap: Record<string, string[]> = {
    '/': ['Main', 'Dashboard'],
    '/dashboard': ['Main', 'Dashboard'],
    '/attendance': ['Academic', 'Attendance'],
    '/timetable': ['Academic', 'Timetable'],
    '/assignments': ['Academic', 'Assignments'],
    '/exams': ['Academic', 'Examinations'],
    '/results': ['Academic', 'Results'],
    '/learning': ['Academic', 'LMS Learning'],
    '/students': ['Users', 'Students List'],
    '/faculty': ['Users', 'Faculty List'],
    '/departments': ['Academic', 'Departments'],
    '/courses': ['Academic', 'Courses'],
    '/library': ['Services', 'Library'],
    '/fees': ['Services', 'Fees & Payments'],
    '/placements': ['Services', 'Placements'],
    '/hostel': ['Services', 'Hostel Mess'],
    '/transport': ['Services', 'Transport'],
    '/announcements': ['Communication', 'Announcements'],
    '/notifications': ['Communication', 'Notifications'],
    '/ai': ['Intelligence', 'Campus AI'],
    '/analytics': ['Intelligence', 'Analytics'],
    '/profile': ['Account', 'Profile'],
    '/settings': ['Account', 'Settings'],
  };

  const currentPath = location.pathname;
  const breadcrumbs = breadcrumbMap[currentPath] || ['Campus Hub', 'Page'];
  const pageTitle = breadcrumbs[breadcrumbs.length - 1];

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  // Get user initials
  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'CH';
    const parts = nameStr.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="btn-sidebar-toggle"
          onClick={onSidebarToggle}
          aria-label="Toggle Sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="page-title-area">
          <div className="breadcrumb">
            <span>{breadcrumbs[0]}</span>
            {breadcrumbs.length > 1 && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span>{breadcrumbs[1]}</span>
              </>
            )}
          </div>
          <h2>{pageTitle}</h2>
        </div>
      </div>

      <div className="navbar-search" onClick={onSearchOpen}>
        <div className="search-trigger-input">
          <i className="fa-solid fa-magnifying-glass search-icon-nav"></i>
          <span>Search Campus Hub...</span>
          <kbd className="search-kbd-shortcut">Ctrl+K</kbd>
        </div>
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="btn-nav-action btn-ai-shortcut"
          onClick={() => navigate('/ai')}
          aria-label="Open AI Assistant"
        >
          <i className="fa-solid fa-robot"></i>
        </button>

        <button
          type="button"
          className="btn-nav-action"
          onClick={handleNotificationsClick}
          aria-label="Notifications"
        >
          <i className="fa-solid fa-bell"></i>
          {unreadNotifCount > 0 && <span className="badge-dot" />}
        </button>

        <div
          className={`user-menu-trigger ${isProfileOpen ? 'active' : ''}`}
          onClick={handleProfileClick}
        >
          <div className="user-avatar">{getInitials(user?.name || 'Ganesh')}</div>
          <div className="user-info-text">
            <span className="user-name">{user?.name || 'Ganesh'}</span>
            <span className="user-role">{user?.role || 'student'}</span>
          </div>
          <i className="fa-solid fa-chevron-down"></i>
          
          <UserProfileMenu
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};
