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
  const { user } = useAuth();
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
            label: 'Administration',
            links: [
              { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/admin' },
              { id: 'admin-students', label: 'Students', icon: 'fa-users', path: '/admin/students' },
              { id: 'admin-faculty', label: 'Faculty', icon: 'fa-chalkboard-user', path: '/admin/faculty' },
              { id: 'admin-courses', label: 'Courses', icon: 'fa-book', path: '/admin/courses' },
              { id: 'admin-fees', label: 'Fees', icon: 'fa-wallet', path: '/admin/fees' },
              { id: 'admin-placements', label: 'Placements', icon: 'fa-briefcase', path: '/admin/placements' },
              { id: 'admin-hostel', label: 'Hostel', icon: 'fa-hotel', path: '/admin/hostel' },
              { id: 'admin-transport', label: 'Transport', icon: 'fa-bus', path: '/admin/transport' },
              { id: 'admin-requests', label: 'Requests', icon: 'fa-list-check', path: '/admin/requests' },
              { id: 'admin-announcements', label: 'Announcements', icon: 'fa-bullhorn', path: '/admin/announcements' },
              { id: 'admin-ai', label: 'Campus AI', icon: 'fa-wand-magic-sparkles', path: '/assistant' }
            ]
          }
        ];

      case 'parent':
        return [
          {
            label: 'Main',
            links: [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/dashboard' }]
          },
          {
            label: 'Academic',
            links: [
              { id: 'attendance', label: 'Attendance logs', icon: 'fa-user-check', path: '/attendance' },
              { id: 'performance', label: 'Performance', icon: 'fa-chart-bar', path: '/performance' },
              { id: 'results', label: 'Exams Results', icon: 'fa-award', path: '/results' },
              { id: 'assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/assignments' }
            ]
          },
          {
            label: 'Services',
            links: [{ id: 'fees', label: 'Fees Portal', icon: 'fa-wallet', path: '/fees' }]
          },
          {
            label: 'Communication',
            links: [
              { id: 'announcements', label: 'Announcements', icon: 'fa-bullhorn', path: '/announcements' },
              { id: 'notifications', label: 'Notifications', icon: 'fa-bell', path: '/notifications' }
            ]
          },
          {
            label: 'Account',
            links: [
              { id: 'profile', label: 'Profile', icon: 'fa-user-gear', path: '/profile' },
              { id: 'settings', label: 'Settings', icon: 'fa-sliders', path: '/settings' }
            ]
          }
        ];

      case 'student':
      default:
        return [
          {
            label: 'Main',
            links: [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-simple', path: '/dashboard' }]
          },
          {
            label: 'Academic',
            links: [
              { id: 'attendance', label: 'Attendance', icon: 'fa-user-check', path: '/attendance' },
              { id: 'timetable', label: 'Timetable', icon: 'fa-calendar-days', path: '/timetable' },
              { id: 'assignments', label: 'Assignments', icon: 'fa-file-invoice', path: '/assignments' },
              { id: 'exams', label: 'Examinations', icon: 'fa-receipt', path: '/exams' },
              { id: 'results', label: 'Results', icon: 'fa-award', path: '/results' },
              { id: 'learning', label: 'LMS Learning', icon: 'fa-graduation-cap', path: '/learning' }
            ]
          },
          {
            label: 'Services',
            links: [
              { id: 'library', label: 'Library', icon: 'fa-book-open', path: '/library' },
              { id: 'fees', label: 'Fees & Payments', icon: 'fa-wallet', path: '/fees' },
              { id: 'services', label: 'Campus Services', icon: 'fa-screwdriver-wrench', path: '/services' },
              { id: 'requests', label: 'Service Requests', icon: 'fa-list-check', path: '/services/requests' }
            ]
          },
          {
            label: 'Campus Life',
            links: [
              { id: 'hostel', label: 'Hostel', icon: 'fa-hotel', path: '/hostel' },
              { id: 'mess', label: 'Mess & Dining', icon: 'fa-utensils', path: '/hostel/mess' },
              { id: 'transport', label: 'Transport', icon: 'fa-bus', path: '/transport' },
              { id: 'mobility', label: 'Campus Mobility', icon: 'fa-location-dot', path: '/mobility' }
            ]
          },
          {
            label: 'Career',
            links: [
              { id: 'placements', label: 'Placements', icon: 'fa-briefcase', path: '/placements' },
              { id: 'applications', label: 'My Applications', icon: 'fa-paper-plane', path: '/placements/applications' },
              { id: 'saved', label: 'Saved Jobs', icon: 'fa-bookmark', path: '/placements/saved' },
              { id: 'calendar', label: 'Placement Calendar', icon: 'fa-calendar-days', path: '/placements/calendar' },
              { id: 'career-profile', label: 'Career Profile', icon: 'fa-user-tie', path: '/placements/profile' },
              { id: 'prep', label: 'Interview Preparation', icon: 'fa-book-open-reader', path: '/placements/prep' }
            ]
          },
          {
            label: 'Communication',
            links: [{ id: 'notifications', label: 'Notifications', icon: 'fa-bell', path: '/notifications' }]
          },
          {
            label: 'Intelligence',
            links: [
              { id: 'ai-assistant', label: 'Campus AI', icon: 'fa-wand-magic-sparkles', path: '/assistant' },
              { id: 'insights', label: 'Insights', icon: 'fa-chart-pie', path: '/insights' },
              { id: 'help-center', label: 'Help Center', icon: 'fa-circle-question', path: '/help' }
            ]
          },
          {
            label: 'Account',
            links: [
              { id: 'profile', label: 'Profile', icon: 'fa-user-gear', path: '/profile' },
              { id: 'settings', label: 'Settings', icon: 'fa-sliders', path: '/settings' }
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

  return (
    <>
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <Logo />
          <div className="brand-text">
            <h1>Campus Hub</h1>
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
