import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel, NotificationItem } from './NotificationPanel';
import { CampusAIAssistant } from './CampusAIAssistant';
import { useAuth } from '../context/AuthContext';
import { useEffectiveUserProfile } from '../utils/userProfile';
import {
  getStudentNotificationsForUser,
  toggleStudentNotificationRead,
  markAllStudentNotificationsAsRead
} from '../services/storageService';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const effectiveProfile = useEffectiveUserProfile();

  const userRole = user?.role || 'student';
  const studentId = user?.id || '';
  const studentEmail = user?.email || effectiveProfile.email || '';
  const studentName = user?.name || effectiveProfile.name || '';

  // Persistence of sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('campushub_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dynamic User Scoped Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(() => {
    if (userRole === 'student') {
      const studentNotifs = getStudentNotificationsForUser(studentId, studentEmail, studentName);
      setNotifications(
        studentNotifs.map((n) => ({
          id: n.id,
          category: n.category,
          title: n.title,
          desc: n.message,
          time: n.time,
          unread: n.isUnread,
          targetRoute: n.targetRoute || '/student/notifications'
        }))
      );
    } else if (userRole === 'faculty') {
      setNotifications([
        { id: 'fn-1', category: 'Assignment', title: 'New Submissions', desc: '5 students submitted solutions for Binary Search Trees.', time: '20m ago', unread: true, targetRoute: '/faculty/assignments' },
        { id: 'fn-2', category: 'Class', title: 'Upcoming Lecture', desc: 'CSE-302 (DBMS) Section B lecture begins at 11:00 AM.', time: '30m ago', unread: true, targetRoute: '/faculty/dashboard' },
        { id: 'fn-3', category: 'Attendance', title: 'Roll Call Pending', desc: 'Attendance for CSE-401 Section A is pending roll call.', time: '2h ago', unread: false, targetRoute: '/faculty/attendance' }
      ]);
    } else {
      setNotifications([
        { id: 'an-1', category: 'Hostel', title: 'Hostel Maintenance Request', desc: 'Plumbing repair request submitted by student in Room A-204.', time: '15m ago', unread: true, targetRoute: '/admin/hostel' },
        { id: 'an-2', category: 'Exam', title: 'Exam Seating Roster Approved', desc: 'COE Controller has approved room allocations for Midterm 1.', time: '1h ago', unread: true, targetRoute: '/admin/exams' },
        { id: 'an-3', category: 'Fee', title: 'Fee Settlement Completed', desc: 'Razorpay settlement batch of ₹4,25,000 transferred.', time: '3h ago', unread: false, targetRoute: '/admin/fees' }
      ]);
    }
  }, [userRole, studentId, studentEmail, studentName]);

  useEffect(() => {
    loadNotifications();
    window.addEventListener('campushub_student_notifications_updated', loadNotifications);
    window.addEventListener('campushub_shortage_email_sent', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    return () => {
      window.removeEventListener('campushub_student_notifications_updated', loadNotifications);
      window.removeEventListener('campushub_shortage_email_sent', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
    };
  }, [loadNotifications]);

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

  const handleMarkRead = (id: string | number) => {
    if (userRole === 'student') {
      toggleStudentNotificationRead(String(id), studentId);
      loadNotifications();
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
    }
  };

  const handleMarkAllRead = () => {
    if (userRole === 'student') {
      markAllStudentNotificationsAsRead(studentId, studentEmail, studentName);
      loadNotifications();
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;
  const viewAllRoute = userRole === 'admin' ? '/admin/notifications' : (userRole === 'faculty' ? '/faculty/notifications' : '/student/notifications');

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
            viewAllRoute={viewAllRoute}
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
