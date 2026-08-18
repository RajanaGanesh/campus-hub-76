import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, ManagementAnnouncement } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminNotices: React.FC = () => {
  const mgmt = getManagementData();

  const [notices, setNotices] = useState<ManagementAnnouncement[]>(mgmt.announcements);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<ManagementAnnouncement | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState<ManagementAnnouncement['audience']>('All Students');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [message, setMessage] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const newNot: ManagementAnnouncement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      publishedBy: 'Campus Administration Office',
      audience,
      priority,
      publishDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Published'
    };

    setNotices([newNot, ...notices]);
    setIsAddModalOpen(false);
    setTitle('');
    setMessage('');
    showToast(`Notice "${newNot.title}" published campus-wide!`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deletingNotice) return;
    setNotices((prev) => prev.filter((n) => n.id !== deletingNotice.id));
    setDeletingNotice(null);
    showToast('Notice removed from bulletin board.', 'info');
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
              <span className="crumb-current">Notices & Circulars</span>
            </div>
            <h1 className="module-title">Institutional Notice Board & Circulars</h1>
            <p className="module-subtitle">
              Publish campus-wide administrative orders, emergency alerts, semester circulars, and event announcements.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>Publish Notice</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{notices.length}</span>
              <span className="stat-label">Published Circulars</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>{notices.filter((n) => n.priority === 'High').length}</span>
              <span className="stat-label">High Priority Bulletins</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">All Users</span>
              <span className="stat-label">Campus Delivery Scope</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Live Sync</span>
              <span className="stat-label">Broadcast Channels Active</span>
            </div>
          </div>
        </div>

        {/* Notices Stack */}
        <div className="notices-cards-stack">
          {notices.map((notif) => (
            <div key={notif.id} className="c1-card notice-list-card">
              <div className="notice-card-header">
                <div className="notice-meta-left">
                  <span className="course-code-tag">{notif.audience}</span>
                  <span className={`priority-pill priority-${notif.priority.toLowerCase()}`}>
                    {notif.priority} Priority
                  </span>
                </div>
                <span className="notice-pub-date">
                  <i className="fa-regular fa-calendar"></i> {notif.publishDate}
                </span>
              </div>

              <h3 className="notice-card-heading">{notif.title}</h3>
              <p className="notice-card-snippet">{notif.message}</p>

              <div className="notice-card-footer">
                <span className="notice-publisher">
                  <i className="fa-solid fa-shield-halved"></i> Source: <strong>{notif.publishedBy}</strong>
                </span>

                <button
                  type="button"
                  className="c1-btn c1-btn-secondary btn-icon-only"
                  style={{ width: '30px', height: '30px', padding: 0 }}
                  onClick={() => setDeletingNotice(notif)}
                  title="Delete notice"
                >
                  <i className="fa-solid fa-trash-can" style={{ color: 'var(--color-error)' }}></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL 1: PUBLISH NOTICE MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Publish Administrative Circular"
            maxWidth="md"
          >
            <form onSubmit={handlePublishSubmit} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Notice Subject / Heading</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Annual Tech Symposium & Campus Holiday Advisory"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="c1-select"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                  >
                    <option value="All Students">All Students</option>
                    <option value="Faculty">All Faculty Members</option>
                    <option value="Specific Department">CSE & IT Departments</option>
                    <option value="Hostel Students">Hostel Residents Only</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Priority Level</label>
                  <select
                    className="c1-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="High">High (Immediate Alert)</option>
                    <option value="Medium">Medium (General Notice)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Detailed Notice Content</label>
                <textarea
                  className="c1-textarea"
                  rows={4}
                  placeholder="Enter full notice announcement details..."
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
                  <span>Broadcast Notice</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: DELETE NOTICE CONFIRMATION
            ============================================================ */}
        {deletingNotice && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingNotice(null)}
            title="Delete Notice"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <i className="fa-solid fa-trash-can"></i>
              </div>
              <h3 className="confirm-heading">Delete Notice?</h3>
              <p className="confirm-body-text">
                Are you sure you want to remove <strong>"{deletingNotice.title}"</strong>?
              </p>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingNotice(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: 'var(--color-error)' }}
                  onClick={handleDeleteConfirm}
                >
                  Delete Notice
                </button>
              </div>
            </div>
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

export default AdminNotices;
