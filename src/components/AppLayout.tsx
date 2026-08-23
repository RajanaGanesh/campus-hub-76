import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel, NotificationItem } from './NotificationPanel';
import { CampusAIAssistant } from './CampusAIAssistant';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Persistence of sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('campushub_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Demo Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      category: 'academic',
      title: 'Attendance Notice',
      desc: 'Overall attendance compliance verified for current term.',
      time: '10m ago',
      unread: true
    },
    {
      id: 2,
      category: 'academic',
      title: 'Assignment Deadline',
      desc: 'Upcoming coursework task submission due soon.',
      time: '2h ago',
      unread: true
    },
    {
      id: 3,
      category: 'academic',
      title: 'Exam Timetable Published',
      desc: 'Mid-Semester Theory exam schedules are available.',
      time: '1d ago',
      unread: true
    },
    {
      id: 4,
      category: 'placement',
      title: 'Placement Opportunity',
      desc: 'TechNova recruitment registration deadline approaching.',
      time: '2d ago',
      unread: false
    }
  ]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const nextVal = !isCollapsed;
      setIsCollapsed(nextVal);
      localStorage.setItem('campushub_sidebar_collapsed', String(nextVal));
    }
  };

  // Close dropdowns on page body click
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
    };

    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="app-layout">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="main-content">
        <TopNavbar
          onSidebarToggle={toggleSidebar}
          onSearchOpen={() => setIsSearchOpen(true)}
          unreadNotifCount={unreadNotifCount}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />

        <main className="page-container">{children}</main>
      </div>

      {/* Dropdown Notification panel placement */}
      {isNotificationsOpen && (
        <div className="notifications-portal-wrapper" onClick={(e) => e.stopPropagation()}>
          <NotificationPanel
            isOpen={isNotificationsOpen}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>
      )}

      {/* Universal Command Search Window Popup */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Floating CampusOne AI Assistant */}
      <CampusAIAssistant />
    </div>
  );
};

export default AppLayout;
