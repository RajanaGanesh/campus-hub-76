import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, ManagementAnnouncement } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const FacultyNotices: React.FC = () => {
  const mgmt = getManagementData();

  // Notices state
  const [notices, setNotices] = useState<ManagementAnnouncement[]>(mgmt.announcements);

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [deletingNotice, setDeletingNotice] = useState<ManagementAnnouncement | null>(null);

  // Form fields
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<ManagementAnnouncement['audience']>('Specific Course');
  const [noticeTargetDetail, setNoticeTargetDetail] = useState('CSE-301 Section A');
  const [noticePriority, setNoticePriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMsg.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const newNot: ManagementAnnouncement = {
      id: `ann-${Date.now()}`,
      title: noticeTitle,
      message: noticeMsg,
      publishedBy: 'Dr. Suresh Kumar (Faculty)',
      audience: noticeAudience,
      targetAudienceDetail: noticeTargetDetail,
      priority: noticePriority,
      publishDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Published'
    };

    setNotices([newNot, ...notices]);
    setIsPublishModalOpen(false);
    setNoticeTitle('');
    setNoticeMsg('');
    showToast(`Notice "${noticeTitle}" published to student boards!`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deletingNotice) return;
    setNotices((prev) => prev.filter((n) => n.id !== deletingNotice.id));
    setDeletingNotice(null);
    showToast('Notice removed from notice board.', 'info');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Academic Notices</span>
            </div>
            <h1 className="module-title">Course Circulars & Announcements</h1>
            <p className="module-subtitle">
              Publish classroom circulars, lab advisories, exam reminders, and assignment extensions directly to student boards.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsPublishModalOpen(true)}
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
              <span className="stat-num">{notices.filter((n) => n.priority === 'High').length}</span>
              <span className="stat-label">High Priority Alerts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">240</span>
              <span className="stat-label">Recipient Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Live Sync</span>
              <span className="stat-label">Student Board Integrated</span>
            </div>
          </div>
        </div>

        {/* Notices Stack */}
        <div className="notices-cards-stack">
          {notices.map((notif) => (
            <div key={notif.id} className="c1-card notice-list-card">
              <div className="notice-card-header">
                <div className="notice-meta-left">
                  <span className="course-code-tag">{notif.targetAudienceDetail || notif.audience}</span>
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
                  <i className="fa-solid fa-user-tie"></i> Published by: <strong>{notif.publishedBy}</strong>
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
        {isPublishModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsPublishModalOpen(false)}
            title="Publish Academic Course Circular"
            maxWidth="md"
          >
            <form onSubmit={handlePublishSubmit} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Notice Subject / Title</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Extra Practical Lab Session on Saturday"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Target Recipient Audience</label>
                  <select
                    className="c1-select"
                    value={noticeTargetDetail}
                    onChange={(e) => {
                      setNoticeTargetDetail(e.target.value);
                      setNoticeAudience('Specific Course');
                    }}
                  >
                    <option value="CSE-301 Section A">CSE-301 (Section A)</option>
                    <option value="CSE-302 Section B">CSE-302 (Section B)</option>
                    <option value="CSE-401 Section A">CSE-401 (Section A)</option>
                    <option value="All CSE Students">All CSE Department Students</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Priority Flag</label>
                  <select
                    className="c1-select"
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                  >
                    <option value="High">High (Immediate Alert)</option>
                    <option value="Medium">Medium (General Advisory)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Detailed Notice Content</label>
                <textarea
                  className="c1-textarea"
                  rows={4}
                  placeholder="Enter full announcement details, timings, instructions, or prerequisites..."
                  value={noticeMsg}
                  onChange={(e) => setNoticeMsg(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsPublishModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Publish Notice</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: DELETE NOTICE MODAL
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
                Are you sure you want to delete <strong>"{deletingNotice.title}"</strong>? It will no longer appear on student notice boards.
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

export default FacultyNotices;
