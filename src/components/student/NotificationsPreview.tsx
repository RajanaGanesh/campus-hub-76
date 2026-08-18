import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface NotificationItemData {
  id: number;
  icon: string;
  title: string;
  desc?: string;
  time: string;
  unread: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationItemData[] = [
  { id: 1, icon: 'fa-user-check', title: 'Attendance Alert in Computer Networks', desc: 'Overall attendance in CS304 is currently 76%. Attend upcoming lectures.', time: '10m ago', unread: true },
  { id: 2, icon: 'fa-file-invoice', title: 'New DBMS Assignment Uploaded', desc: 'Prof. Priya posted "ER Diagram & Normalization" due tomorrow.', time: '2h ago', unread: true },
  { id: 3, icon: 'fa-briefcase', title: 'Microsoft Placement Drive Open', desc: 'Registration closes this Sunday for 2027 graduating batch.', time: '1d ago', unread: true },
  { id: 4, icon: 'fa-receipt', title: 'Mid-term Exam Seating Published', desc: 'Hall allocation for CS301 to CS305 is available in Exams.', time: '2d ago', unread: false }
];

export const NotificationsPreview: React.FC = () => {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<NotificationItemData[]>(DEFAULT_NOTIFICATIONS);

  const toggleRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const unreadCount = notifs.filter((n) => n.unread).length;

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
        {notifs.map((notif) => (
          <div
            key={notif.id}
            className={`notif-item-card ${notif.unread ? 'notif-unread' : ''}`}
            onClick={() => navigate('/student/notifications')}
          >
            <div className="notif-icon-col">
              <div className="notif-avatar-icon">
                <i className={`fa-solid ${notif.icon}`}></i>
              </div>
            </div>

            <div className="notif-content-col">
              <div className="notif-title-row">
                <span className="notif-item-title">{notif.title}</span>
                <span className="notif-time-text">{notif.time}</span>
              </div>
              {notif.desc && <p className="notif-desc-text">{notif.desc}</p>}
            </div>

            <button
              type="button"
              className="notif-toggle-read"
              onClick={(e) => toggleRead(notif.id, e)}
              title={notif.unread ? 'Mark as read' : 'Mark as unread'}
            >
              <i className={notif.unread ? 'fa-solid fa-circle-dot' : 'fa-regular fa-circle'}></i>
            </button>
          </div>
        ))}
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
