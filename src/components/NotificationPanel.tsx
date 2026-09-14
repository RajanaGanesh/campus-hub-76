import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItem {
  id: string | number;
  category: 'academic' | 'placement' | 'announcement' | 'Assignment' | 'Exam' | 'Fee' | 'Library' | 'Hostel' | 'Transport' | 'Academic' | 'General' | 'System' | string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  targetRoute?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  notifications: NotificationItem[];
  onMarkRead: (id: string | number) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
  viewAllRoute?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
  viewAllRoute = '/student/notifications'
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const categoryIcons: Record<string, string> = {
    academic: 'fa-graduation-cap',
    Academic: 'fa-graduation-cap',
    placement: 'fa-briefcase',
    Placement: 'fa-briefcase',
    announcement: 'fa-bullhorn',
    General: 'fa-bullhorn',
    Assignment: 'fa-file-invoice',
    Exam: 'fa-receipt',
    Fee: 'fa-wallet',
    Library: 'fa-book-open',
    Hostel: 'fa-hotel',
    Transport: 'fa-bus',
    System: 'fa-shield-halved'
  };

  const handleViewAll = () => {
    onClose();
    navigate(viewAllRoute);
  };

  const handleItemClick = (notif: NotificationItem) => {
    onMarkRead(notif.id);
    if (notif.targetRoute) {
      onClose();
      navigate(notif.targetRoute);
    }
  };

  return (
    <div className="dropdown-menu notifications-dropdown" style={{ display: 'block' }}>
      <div className="notif-header-row">
        <h3>Notifications</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {notifications.some((n) => n.unread) && (
            <button type="button" className="btn-notif-clear" onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
          <button type="button" className="btn-notif-clear" onClick={onClose} aria-label="Close notifications" style={{ color: 'var(--text-secondary)', padding: '4px' }}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="notif-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const icon = categoryIcons[notif.category] || 'fa-bell';
            const catClass = notif.category.toLowerCase();
            return (
              <div
                key={notif.id}
                className={`notif-item ${notif.unread ? 'unread' : ''}`}
                onClick={() => handleItemClick(notif)}
              >
                <div className={`notif-icon-box ${catClass}`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                <div className="notif-details">
                  <span className="notif-title">{notif.title}</span>
                  <span className="notif-desc">{notif.desc}</span>
                  <span className="notif-time">{notif.time}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-bell-slash" style={{ fontSize: '20px', opacity: 0.4, marginBottom: '8px' }}></i>
            <p style={{ fontSize: '12px' }}>All caught up! No notifications.</p>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <button
          type="button"
          className="c1-btn c1-btn-secondary"
          style={{ width: '100%', fontSize: '0.8125rem', padding: '8px 0' }}
          onClick={handleViewAll}
        >
          <span>View All Notifications Inbox</span>
          <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
        </button>
      </div>
    </div>
  );
};
