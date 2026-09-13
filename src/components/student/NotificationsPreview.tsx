import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItemData {
  id: number | string;
  icon: string;
  title: string;
  desc?: string;
  time: string;
  unread: boolean;
}

export interface NotificationsPreviewProps {
  notifications?: NotificationItemData[];
}

export const NotificationsPreview: React.FC<NotificationsPreviewProps> = ({
  notifications = []
}) => {
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="c1-card notifications-preview-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Recent Notifications</h3>
          <p className="c1-card-subtitle">Activity feed and academic updates</p>
        </div>
        {unreadCount > 0 && (
          <span className="c1-badge c1-badge-error">
            <span className="unread-dot"></span> {unreadCount} New
          </span>
        )}
      </div>

      <div className="notifs-preview-list">
        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '24px 16px',
            color: 'var(--text-muted)'
          }}>
            <i className="fa-solid fa-bell-slash" style={{ fontSize: '1.75rem', marginBottom: '8px', opacity: 0.35, display: 'block' }}></i>
            <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>No New Notifications</h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>You're all caught up with your updates.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notif-item-card ${notif.unread ? 'notif-unread' : ''}`}
              onClick={() => navigate('/student/notifications')}
            >
              <div className="notif-icon-col">
                <div className="notif-avatar-icon">
                  <i className={`fa-solid ${notif.icon || 'fa-bell'}`}></i>
                </div>
              </div>

              <div className="notif-content-col">
                <div className="notif-title-row">
                  <span className="notif-item-title">{notif.title}</span>
                  <span className="notif-time-text">{notif.time}</span>
                </div>
                {notif.desc && <p className="notif-desc-text">{notif.desc}</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="c1-btn c1-btn-secondary btn-card-bottom"
        onClick={() => navigate('/student/notifications')}
      >
        <span>View Notification Inbox</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};
