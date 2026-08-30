import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { ThemeToggle } from './ThemeToggle';

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
    '/dashboard': ['Main', 'Student Dashboard'],
    '/student/dashboard': ['Student Portal', 'Student Dashboard'],
    '/student/attendance': ['Academic', 'Attendance Overview'],
    '/student/timetable': ['Academic', 'Weekly Timetable'],
    '/student/assignments': ['Academic', 'Assignments & Coursework'],
    '/student/exams': ['Academic', 'Examinations Schedule'],
    '/student/results': ['Academic', 'Results & Transcripts'],
    '/student/lms': ['Academic', 'LMS Learning Hub'],
    '/student/library': ['Services', 'Digital Library'],
    '/student/fees': ['Services', 'Fees & Payments'],
    '/student/services': ['Services', 'Campus Services'],
    '/student/requests': ['Services', 'Service Requests'],
    '/student/placements': ['Career', 'Placements Portal'],
    '/student/hostel': ['Campus Life', 'Hostel Accommodation'],
    '/student/mess': ['Campus Life', 'Mess & Dining'],
    '/student/transport': ['Campus Life', 'Transport Services'],
    '/student/notices': ['Communication', 'Notice Board'],
    '/student/notifications': ['Communication', 'Notifications Inbox'],
    '/student/ai-assistant': ['Intelligence', 'CampusOne AI Assistant'],
    '/student/profile': ['Account', 'Student Profile'],
    '/student/settings': ['Account', 'Settings'],
    // Faculty Portal
    '/faculty': ['Faculty Portal', 'Dashboard'],
    '/faculty/dashboard': ['Faculty Portal', 'Dashboard'],
    '/faculty/courses': ['Faculty Portal', 'My Courses'],
    '/faculty/students': ['Faculty Portal', 'Student Directory'],
    '/faculty/attendance': ['Faculty Portal', 'Mark Attendance'],
    '/faculty/assignments': ['Faculty Portal', 'Assignments & Grading'],
    '/faculty/exams': ['Faculty Portal', 'Examinations'],
    '/faculty/results': ['Faculty Portal', 'Marks Valuation'],
    '/faculty/materials': ['Faculty Portal', 'Study Materials'],
    '/faculty/notices': ['Faculty Portal', 'Academic Notices'],
    '/faculty/notifications': ['Faculty Portal', 'Notifications'],

    // Admin Portal
    '/admin': ['Admin Portal', 'Executive Dashboard'],
    '/admin/dashboard': ['Admin Portal', 'Executive Dashboard'],
    '/admin/students': ['Admin Portal', 'Student Admissions'],
    '/admin/faculty': ['Admin Portal', 'Faculty Roster'],
    '/admin/courses': ['Admin Portal', 'Course Management'],
    '/admin/departments': ['Admin Portal', 'Academic Departments'],
    '/admin/attendance': ['Admin Portal', 'Attendance Audit'],
    '/admin/assignments': ['Admin Portal', 'Assignments Overview'],
    '/admin/exams': ['Admin Portal', 'Examinations & Conflicts'],
    '/admin/results': ['Admin Portal', 'Results Ledger'],
    '/admin/fees': ['Admin Portal', 'Fee Realization'],
    '/admin/library': ['Admin Portal', 'Central Library Master'],
    '/admin/hostel': ['Admin Portal', 'Hostel Management'],
    '/admin/transport': ['Admin Portal', 'Transport Fleet'],
    '/admin/placements': ['Admin Portal', 'Placements & Corporate'],
    '/admin/notices': ['Admin Portal', 'Institutional Notices'],
    '/admin/notifications': ['Admin Portal', 'System Notifications'],
    '/admin/users': ['Admin Portal', 'User RBAC Accounts'],
    '/admin/reports': ['Admin Portal', 'Reports & Data Export'],
    '/admin/settings': ['Admin Portal', 'System Settings'],

    // Parent Portal
    '/parent': ['Parent Portal', 'Parent Dashboard'],
    '/parent/dashboard': ['Parent Portal', 'Parent Dashboard'],
    '/parent/attendance': ['Parent Portal', "Student's Attendance"],
    '/parent/academics': ['Parent Portal', 'Academic Results & GPA'],
    '/parent/results': ['Parent Portal', 'Academic Results & GPA'],
    '/parent/assignments': ['Parent Portal', 'Coursework & Homework'],
    '/parent/exams': ['Parent Portal', 'Examination Schedules'],
    '/parent/fees': ['Parent Portal', 'Tuition Fees & Receipts'],
    '/parent/library': ['Parent Portal', 'Library Book Loans'],
    '/parent/hostel': ['Parent Portal', 'Hostel Accommodation'],
    '/parent/placements': ['Parent Portal', 'Placements & Job Offers'],
    '/parent/notices': ['Parent Portal', 'Parent Circulars'],
    '/parent/notifications': ['Parent Portal', 'Notification Center'],
    '/parent/settings': ['Parent Portal', 'Guardian Profile & Alerts'],
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
          className="btn-nav-action btn-mobile-search"
          onClick={onSearchOpen}
          aria-label="Search Campus Hub"
        >
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>

        <button
          type="button"
          className="btn-nav-action btn-ai-shortcut"
          onClick={() => navigate('/ai')}
          aria-label="Open AI Assistant"
        >
          <i className="fa-solid fa-robot"></i>
        </button>

        <ThemeToggle variant="dropdown" />

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
