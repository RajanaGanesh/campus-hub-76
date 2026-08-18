import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export interface AdminNotifItem {
  id: string;
  title: string;
  message: string;
  targetRole: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  isUnread: boolean;
}

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotifItem[]>([
    {
      id: 'NOTIF-01',
      title: 'Hostel Maintenance Request #402',
      message: 'Plumbing repair request submitted by student Aditya Sharma in Room A-204.',
      targetRole: 'Admin / Hostel Warden',
      priority: 'Medium',
      time: '15 mins ago',
      isUnread: true
    },
    {
      id: 'NOTIF-02',
      title: 'Midterm Exam Seating Roster Approved',
      message: 'COE Controller has approved the room allocations for Midterm Theory Assessment 1.',
      targetRole: 'All Faculty & Admin',
      priority: 'Low',
      time: '1 hour ago',
      isUnread: true
    },
    {
      id: 'NOTIF-03',
      title: 'Fee Gateway Settlement Completed',
      message: 'Razorpay settlement batch of ₹4,25,000 transferred to university account.',
      targetRole: 'Finance Admin',
      priority: 'High',
      time: '3 hours ago',
      isUnread: false
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetRole, setTargetRole] = useState('All Users');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [message, setMessage] = useState('');

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const newN: AdminNotifItem = {
      id: `NOTIF-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      targetRole,
      priority,
      time: 'Just now',
      isUnread: true
    };

    setNotifications([newN, ...notifications]);
    setIsAddModalOpen(false);
    setTitle('');
    setMessage('');
    showToast(`System notification broadcasted to ${targetRole}!`, 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">System Notifications</span>
            </div>
            <h1 className="module-title">System Broadcasts & Activity Alerts</h1>
            <p className="module-subtitle">
              Broadcast high-priority institutional alerts, monitor system logs, and manage service requests.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-tower-broadcast"></i>
              <span>Broadcast Alert</span>
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
              <span className="stat-label">Active Activity Alerts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>{notifications.filter((n) => n.isUnread).length}</span>
              <span className="stat-label">Pending Action</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>All Nodes</span>
              <span className="stat-label">Campus System Health</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">WebSocket</span>
              <span className="stat-label">Real-Time Sync Engine</span>
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
                    <span className="course-code-tag">{notif.targetRole}</span>
                    <h3 className="notif-inbox-title">{notif.title}</h3>
                    {notif.isUnread && <span className="unread-dot-badge">UNREAD</span>}
                  </div>
                  <span className="notif-inbox-time">{notif.time}</span>
                </div>

                <p className="notif-inbox-msg">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL: BROADCAST ALERT MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Broadcast System Notification"
            maxWidth="md"
          >
            <form onSubmit={handleBroadcast} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Alert Heading</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Scheduled Network Maintenance Tonight"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Target Role</label>
                  <select
                    className="c1-select"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  >
                    <option value="All Users">All Campus Users</option>
                    <option value="Student">All Students</option>
                    <option value="Faculty">All Faculty</option>
                    <option value="Parent">Parents</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Priority</label>
                  <select
                    className="c1-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Message Content</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Enter message details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Broadcast Now</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

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

export default AdminNotifications;
