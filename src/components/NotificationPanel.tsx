import React from 'react';

export interface NotificationItem {
  id: number;
  category: 'academic' | 'placement' | 'announcement';
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose
}) => {
  if (!isOpen) return null;

  const categoryIcons = {
    academic: 'fa-user-gradient fa-graduation-cap',
    placement: 'fa-briefcase',
    announcement: 'fa-bullhorn',
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
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item ${notif.unread ? 'unread' : ''}`}
              onClick={() => onMarkRead(notif.id)}
            >
              <div className={`notif-icon-box ${notif.category}`}>
                <i className={`fa-solid ${categoryIcons[notif.category]}`}></i>
              </div>
              <div className="notif-details">
                <span className="notif-title">{notif.title}</span>
                <span className="notif-desc">{notif.desc}</span>
                <span className="notif-time">{notif.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-bell-slash" style={{ fontSize: '20px', opacity: 0.4, marginBottom: '8px' }}></i>
            <p style={{ fontSize: '12px' }}>All caught up! No notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};
