import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface NavLinkItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface NavGroup {
  label: string;
  links: NavLinkItem[];
}

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, isMobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'student';

  // Role aware links mapper
  const getSidebarData = (): NavGroup[] => {
    switch (userRole) {
      case 'faculty':
        return [
          {
            label: 'Faculty',
            links: [
              { id: 'faculty-dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/faculty' },
              { id: 'faculty-courses', label: 'My Courses', icon: 'fa-book', path: '/faculty/courses' },
              { id: 'faculty-students', label: 'Students', icon: 'fa-users', path: '/faculty/students' },
              { id: 'faculty-attendance', label: 'Attendance', icon: 'fa-user-check', path: '/faculty/attendance' },
              { id: 'faculty-assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/faculty/assignments' },
              { id: 'faculty-exams', label: 'Examinations', icon: 'fa-receipt', path: '/faculty/exams' },
              { id: 'faculty-announcements', label: 'Announcements', icon: 'fa-bullhorn', path: '/faculty/announcements' },
              { id: 'faculty-ai', label: 'Campus AI', icon: 'fa-wand-magic-sparkles', path: '/assistant' }
            ]
          }
        ];

      case 'admin':
        return [
          {
            label: 'Core Admin',
            links: [
              { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/admin/dashboard' },
              { id: 'admin-students', label: 'Students', icon: 'fa-user-graduate', path: '/admin/students' },
              { id: 'admin-faculty', label: 'Faculty', icon: 'fa-chalkboard-user', path: '/admin/faculty' },
              { id: 'admin-courses', label: 'Courses', icon: 'fa-book-open', path: '/admin/courses' },
              { id: 'admin-departments', label: 'Departments', icon: 'fa-building-columns', path: '/admin/departments' }
            ]
          },
          {
            label: 'Academics',
            links: [
              { id: 'admin-attendance', label: 'Attendance', icon: 'fa-clipboard-user', path: '/admin/attendance' },
              { id: 'admin-assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/admin/assignments' },
              { id: 'admin-exams', label: 'Examinations', icon: 'fa-receipt', path: '/admin/exams' },
              { id: 'admin-results', label: 'Results & GPA', icon: 'fa-award', path: '/admin/results' }
            ]
          },
          {
            label: 'Campus Services',
            links: [
              { id: 'admin-fees', label: 'Fees & Finance', icon: 'fa-wallet', path: '/admin/fees' },
              { id: 'admin-library', label: 'Library', icon: 'fa-book-bookmark', path: '/admin/library' },
              { id: 'admin-hostel', label: 'Hostel', icon: 'fa-hotel', path: '/admin/hostel' },
              { id: 'admin-transport', label: 'Transport', icon: 'fa-bus', path: '/admin/transport' },
              { id: 'admin-placements', label: 'Placements', icon: 'fa-briefcase', path: '/admin/placements' }
            ]
          },
          {
            label: 'System & Reports',
            links: [
              { id: 'admin-notices', label: 'Notices & Circulars', icon: 'fa-bullhorn', path: '/admin/notices' },
              { id: 'admin-notifications', label: 'Notifications', icon: 'fa-bell', path: '/admin/notifications' },
              { id: 'admin-users', label: 'User Accounts', icon: 'fa-users-gear', path: '/admin/users' },
              { id: 'admin-reports', label: 'Reports & Export', icon: 'fa-file-chart-column', path: '/admin/reports' },
              { id: 'admin-settings', label: 'Settings', icon: 'fa-sliders', path: '/admin/settings' }
            ]
          }
        ];

      case 'parent':
        return [
          {
            label: 'Monitoring',
            links: [
              { id: 'parent-dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/parent/dashboard' },
              { id: 'parent-attendance', label: 'Attendance', icon: 'fa-user-check', path: '/parent/attendance' },
              { id: 'parent-academics', label: 'Academics & Grades', icon: 'fa-award', path: '/parent/academics' },
              { id: 'parent-assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/parent/assignments' },
              { id: 'parent-exams', label: 'Examinations', icon: 'fa-receipt', path: '/parent/exams' }
            ]
          },
          {
            label: 'Campus Services',
            links: [
              { id: 'parent-fees', label: 'Fee Receipts', icon: 'fa-wallet', path: '/parent/fees' },
              { id: 'parent-library', label: 'Library Status', icon: 'fa-book-bookmark', path: '/parent/library' },
              { id: 'parent-hostel', label: 'Hostel Residency', icon: 'fa-hotel', path: '/parent/hostel' },
              { id: 'parent-placements', label: 'Placements', icon: 'fa-briefcase', path: '/parent/placements' }
            ]
          },
          {
            label: 'Communication',
            links: [
              { id: 'parent-notices', label: 'Notices & Circulars', icon: 'fa-bullhorn', path: '/parent/notices' },
              { id: 'parent-notifications', label: 'Notifications', icon: 'fa-bell', path: '/parent/notifications' },
              { id: 'parent-settings', label: 'Profile & Settings', icon: 'fa-user-gear', path: '/parent/settings' }
            ]
          }
        ];

      case 'student':
      default:
        return [
          {
            label: 'Main',
            links: [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/student/dashboard' }]
          },
          {
            label: 'Academic',
            links: [
              { id: 'attendance', label: 'Attendance', icon: 'fa-user-check', path: '/student/attendance' },
              { id: 'timetable', label: 'Timetable', icon: 'fa-calendar-days', path: '/student/timetable' },
              { id: 'assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/student/assignments' },
              { id: 'exams', label: 'Examinations', icon: 'fa-receipt', path: '/student/exams' },
              { id: 'results', label: 'Results & GPA', icon: 'fa-award', path: '/student/results' },
              { id: 'learning', label: 'LMS Learning', icon: 'fa-graduation-cap', path: '/student/lms' }
            ]
          },
          {
            label: 'Services',
            links: [
              { id: 'library', label: 'Library', icon: 'fa-book-open', path: '/student/library' },
              { id: 'fees', label: 'Fees & Payments', icon: 'fa-wallet', path: '/student/fees' },
              { id: 'services', label: 'Campus Services', icon: 'fa-screwdriver-wrench', path: '/student/services' },
              { id: 'requests', label: 'Service Requests', icon: 'fa-list-check', path: '/student/requests' }
            ]
          },
          {
            label: 'Campus Life',
            links: [
              { id: 'hostel', label: 'Hostel', icon: 'fa-hotel', path: '/student/hostel' },
              { id: 'mess', label: 'Mess & Dining', icon: 'fa-utensils', path: '/student/mess' },
              { id: 'transport', label: 'Transport', icon: 'fa-bus', path: '/student/transport' }
            ]
          },
          {
            label: 'Career',
            links: [
              { id: 'placements', label: 'Placements', icon: 'fa-briefcase', path: '/student/placements' }
            ]
          },
          {
            label: 'Communication',
            links: [
              { id: 'notices', label: 'Notice Board', icon: 'fa-bullhorn', path: '/student/notices' },
              { id: 'notifications', label: 'Notifications', icon: 'fa-bell', path: '/student/notifications' }
            ]
          },
          {
            label: 'Intelligence',
            links: [
              { id: 'ai-assistant', label: 'Campus AI', icon: 'fa-wand-magic-sparkles', path: '/student/ai-assistant' }
            ]
          },
          {
            label: 'Account',
            links: [
              { id: 'profile', label: 'Profile', icon: 'fa-user-gear', path: '/student/profile' },
              { id: 'settings', label: 'Settings', icon: 'fa-sliders', path: '/student/settings' }
            ]
          }
        ];
    }
  };

  const navGroups = getSidebarData();

  // Close sidebar drawer overlay on mobile link click
  const handleNavClick = () => {
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <Logo size="sm" showText={false} />
          <div className="brand-text">
            <h1>CampusOne</h1>
            <span>Smart Campus Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.links.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <i className={`fa-solid ${link.icon}`}></i>
                  {!isCollapsed && <span>{link.label}</span>}
                  {isCollapsed && <span className="sidebar-tooltip">{link.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of CampusOne"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && <span className="sidebar-tooltip">Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 998
          }}
          onClick={onMobileClose}
        />
      )}
    </>
  );
};
