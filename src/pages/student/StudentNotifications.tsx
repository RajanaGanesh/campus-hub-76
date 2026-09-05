import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';
import { getStudentNotifications, saveStudentNotifications, StudentNotificationItem } from '../../services/storageService';

export const StudentNotifications: React.FC = () => {
  const navigate = useNavigate();

  // Notifications State loaded from persistent storage
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>(() => getStudentNotifications());
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Action Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const categories = ['All', 'Assignment', 'Exam', 'Fee', 'Library', 'Hostel', 'Transport'];

  // Derived counts
  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const totalCount = notifications.length;

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'All' || n.category === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [notifications, searchQuery, categoryFilter]);

  // Mark single as read
  const handleToggleRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n));
    setNotifications(updated);
    saveStudentNotifications(updated);
  };

  // Mark all read
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, isUnread: false }));
    setNotifications(updated);
    saveStudentNotifications(updated);
    showToast('All notifications marked as read.', 'info');
  };

  // Delete notification
  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveStudentNotifications(updated);
    showToast('Notification removed.', 'info');
  };

  // Clear read notifications
  const handleClearRead = () => {
    const remaining = notifications.filter((n) => n.isUnread);
    setNotifications(remaining);
    saveStudentNotifications(remaining);
    showToast('Cleared read notifications.', 'info');
  };

  const getCategoryIcon = (category: StudentNotificationItem['category']) => {
    switch (category) {
      case 'Assignment':
        return { icon: 'fa-file-invoice', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)' };
      case 'Exam':
        return { icon: 'fa-receipt', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)' };
      case 'Fee':
        return { icon: 'fa-wallet', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'Library':
        return { icon: 'fa-book-open', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'Hostel':
        return { icon: 'fa-hotel', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'Transport':
        return { icon: 'fa-bus', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' };
      default:
        return { icon: 'fa-bell', color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.08)' };
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Communication</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Notifications Inbox</span>
            </div>
            <h1 className="module-title">Notifications Inbox</h1>
            <p className="module-subtitle">
              Live student activity alerts, assignment deadlines, examination releases, fee due notices, and service updates.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={handleMarkAllRead}
                >
                  <i className="fa-solid fa-check-double"></i>
                  <span>Mark All as Read</span>
                </button>
              )}
              {totalCount > unreadCount && (
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={handleClearRead}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Clear Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stat Summary Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalCount}</span>
              <span className="stat-label">Total Notifications</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{unreadCount}</span>
              <span className="stat-label">Unread Alerts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalCount - unreadCount}</span>
              <span className="stat-label">Read / Acknowledged</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Real-Time</span>
              <span className="stat-label">Instant Gateway Sync</span>
            </div>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="notice-category-tabs-scroll">
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            const count = cat === 'All' ? notifications.length : notifications.filter((n) => n.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                className={`category-tab-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <span>{cat === 'All' ? 'All Categories' : cat}</span>
                <span className="tab-count-tag">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '20px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search notifications by keyword, title, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="notifications-inbox-stack">
            {filteredNotifications.map((notif) => {
              const iconMeta = getCategoryIcon(notif.category);

              return (
                <div
                  key={notif.id}
                  className={`c1-card notif-inbox-card ${notif.isUnread ? 'inbox-unread' : ''}`}
                  onClick={() => handleToggleRead(notif.id)}
                >
                  <div
                    className="notif-inbox-icon-box"
                    style={{ background: iconMeta.bg, color: iconMeta.color }}
                  >
                    <i className={`fa-solid ${iconMeta.icon}`}></i>
                  </div>

                  <div className="notif-inbox-body">
                    <div className="notif-inbox-top-row">
                      <div className="notif-title-badge-group">
                        <span className="course-code-tag">{notif.category}</span>
                        <h3 className="notif-inbox-title">{notif.title}</h3>
                        {notif.isUnread && <span className="unread-dot-badge">UNREAD</span>}
                      </div>
                      <span className="notif-inbox-time">{notif.time}</span>
                    </div>

                    <p className="notif-inbox-msg">{notif.message}</p>

                    <div className="notif-inbox-actions-row">
                      {notif.targetRoute && (
                        <button
                          type="button"
                          className="c1-btn c1-btn-gradient notif-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(notif.targetRoute!);
                          }}
                        >
                          <span>{notif.actionLabel || 'Open Page'}</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </button>
                      )}

                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary btn-icon-only notif-del-btn"
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        title="Delete notification"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="c1-card academic-empty-card">
            <i className="fa-solid fa-bell-slash empty-card-icon"></i>
            <h4>You're all caught up!</h4>
            <p>No new notifications match your current category filter.</p>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => navigate('/student/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Need Help or Support?</h4>
            <p>Access your timetable schedule or explore the digital library collection.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/timetable')}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>Class Timetable</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/library')}
            >
              <i className="fa-solid fa-book-open"></i>
              <span>Digital Library</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentNotifications;
