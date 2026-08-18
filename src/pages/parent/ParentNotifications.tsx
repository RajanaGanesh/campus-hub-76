import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export interface ParentNotifItem {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  isUnread: boolean;
}

export const ParentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ParentNotifItem[]>([
    {
      id: 'pn-1',
      title: 'Mid-Semester Examination Schedule Published',
      message: 'Examination timetable for Mid-Semester Assessment 1 has been uploaded. First exam on 25 August 2026.',
      type: 'Exam Notice',
      time: '2 hours ago',
      isUnread: true
    },
    {
      id: 'pn-2',
      title: 'Fee Payment Receipt Generated (#REC-2026-8901)',
      message: 'Official payment receipt for ₹85,000 tuition fee is now available for download.',
      type: 'Fee Receipt',
      time: '1 day ago',
      isUnread: true
    },
    {
      id: 'pn-3',
      title: 'Attendance Report: Satisfactory (87%)',
      message: 'Monthly attendance compliance verified for Semester 8. No attendance penalties applicable.',
      type: 'Attendance Notice',
      time: '3 days ago',
      isUnread: false
    }
  ]);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    showToast('All notifications marked as read.', 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Notifications</span>
            </div>
            <h1 className="module-title">Parent Notification Center</h1>
            <p className="module-subtitle">
              Live updates regarding attendance, examination schedules, fee receipts, and academic milestones.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleMarkAllRead}
            >
              <i className="fa-solid fa-check-double"></i>
              <span>Mark All as Read</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{notifications.length}</span>
              <span className="stat-label">Total Notifications</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>
                {notifications.filter((n) => n.isUnread).length}
              </span>
              <span className="stat-label">Unread Messages</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-envelope-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>Instant SMS & Email</span>
              <span className="stat-label">Alert Channels Active</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Live Sync</span>
              <span className="stat-label">Real-Time Event Stream</span>
            </div>
          </div>
        </div>

        {/* Notifications Stack */}
        <div className="notifications-inbox-stack">
          {notifications.map((notif) => (
            <div key={notif.id} className={`c1-card notif-inbox-card ${notif.isUnread ? 'inbox-unread' : ''}`}>
              <div className="notif-inbox-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <i className="fa-solid fa-bell"></i>
              </div>

              <div className="notif-inbox-body">
                <div className="notif-inbox-top-row">
                  <div className="notif-title-badge-group">
                    <span className="course-code-tag">{notif.type}</span>
                    <h3 className="notif-inbox-title">{notif.title}</h3>
                    {notif.isUnread && <span className="unread-dot-badge">NEW</span>}
                  </div>
                  <span className="notif-inbox-time">{notif.time}</span>
                </div>

                <p className="notif-inbox-msg">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ParentNotifications;
