import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { downloadNoticeAttachment } from '../../utils/fileDownloader';
import { getStudentNotices, saveStudentNotices, NoticeItem } from '../../services/storageService';

export type { NoticeItem };

export const StudentNotices: React.FC = () => {
  const navigate = useNavigate();

  // Notices state loaded from persistent storage
  const [notices, setNotices] = useState<NoticeItem[]>(() => getStudentNotices());

  // Real-time listener for notices published by Admin or Faculty
  React.useEffect(() => {
    const handleSync = () => {
      setNotices(getStudentNotices());
    };
    window.addEventListener('campushub_student_notices_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('campushub_student_notices_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [readFilter, setReadFilter] = useState<'All' | 'unread' | 'read'>('All');

  // Modal State
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const categories = ['All', 'Academic', 'Examination', 'Placement', 'Hostel', 'Transport', 'Events', 'General'];

  // Filtered list
  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.publisher.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchPriority = priorityFilter === 'All' || item.priority === priorityFilter;
      const matchRead =
        readFilter === 'All' ||
        (readFilter === 'unread' && item.isUnread) ||
        (readFilter === 'read' && !item.isUnread);

      return matchSearch && matchCategory && matchPriority && matchRead;
    });
  }, [notices, searchQuery, categoryFilter, priorityFilter, readFilter]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'All' || priorityFilter !== 'All' || readFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setReadFilter('All');
    showToast('Notice filters reset.', 'info');
  };

  const handleOpenNotice = (notice: NoticeItem) => {
    setSelectedNotice(notice);
    // Mark as read in state and persist
    const updated = notices.map((n) => (n.id === notice.id ? { ...n, isUnread: false } : n));
    setNotices(updated);
    saveStudentNotices(updated);
  };

  const handleDownloadAttachment = (filename: string, notice?: NoticeItem | null) => {
    downloadNoticeAttachment({
      title: notice?.title || filename,
      attachmentName: filename,
      department: notice?.publisher,
      date: notice?.publishedDate,
      priority: notice?.priority,
      content: notice?.fullText
    });
    showToast(`Downloaded attachment: "${filename}"`, 'success');
  };

  const getPriorityBadge = (priority: NoticeItem['priority']) => {
    switch (priority) {
      case 'High':
        return <span className="priority-pill priority-high"><i className="fa-solid fa-circle"></i> High Priority</span>;
      case 'Medium':
        return <span className="priority-pill priority-medium"><i className="fa-solid fa-circle"></i> Medium</span>;
      case 'Low':
      default:
        return <span className="priority-pill priority-low"><i className="fa-solid fa-circle"></i> Notice</span>;
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
              <span className="crumb-current">Campus Notices</span>
            </div>
            <h1 className="module-title">Campus Notice Board</h1>
            <p className="module-subtitle">
              Official institutional circulars, academic notifications, examination schedules, and departmental advisories.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="meta-badge-box">
              <span className="meta-badge-label">Active Notices</span>
              <span className="meta-badge-val">{notices.filter((n) => n.isUnread).length} Unread Circulars</span>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="notice-category-tabs-scroll">
          {categories.map((cat) => {
            const isSelected = categoryFilter === cat;
            const count = cat === 'All' ? notices.length : notices.filter((n) => n.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                className={`category-tab-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <span>{cat === 'All' ? 'All Circulars' : cat}</span>
                <span className="tab-count-tag">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search circulars by subject, department, or keyword..."
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

          <div className="filters-row-wrap">
            <div className="filter-select-item">
              <label htmlFor="filter-notice-priority">Priority</label>
              <select
                id="filter-notice-priority"
                className="c1-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low / General</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="filter-notice-read">Read Status</label>
              <select
                id="filter-notice-read"
                className="c1-select"
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value as any)}
              >
                <option value="All">All Notices</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="c1-btn c1-btn-secondary btn-clear-filters"
                onClick={resetFilters}
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Notices Cards Stack */}
        {filteredNotices.length > 0 ? (
          <div className="notices-cards-stack">
            {filteredNotices.map((item) => (
              <div
                key={item.id}
                className={`c1-card notice-list-card ${item.isUnread ? 'notice-unread' : ''}`}
                onClick={() => handleOpenNotice(item)}
              >
                <div className="notice-card-header">
                  <div className="notice-meta-left">
                    <span className="course-code-tag">{item.category}</span>
                    {getPriorityBadge(item.priority)}
                    {item.isUnread && <span className="unread-dot-badge">NEW</span>}
                  </div>
                  <span className="notice-pub-date">
                    <i className="fa-regular fa-calendar"></i> {item.publishedDate}
                  </span>
                </div>

                <h3 className="notice-card-heading">{item.title}</h3>
                <p className="notice-card-snippet">{item.snippet}</p>

                <div className="notice-card-footer">
                  <span className="notice-publisher">
                    <i className="fa-solid fa-building-columns"></i> Issued by: <strong>{item.publisher}</strong>
                  </span>
                  {item.attachmentName && (
                    <span className="notice-attachment-chip">
                      <i className="fa-solid fa-paperclip"></i> Attachment Included
                    </span>
                  )}
                  <span className="read-more-link">
                    Read Full Notice <i className="fa-solid fa-chevron-right"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="c1-card academic-empty-card">
            <i className="fa-solid fa-bullhorn empty-card-icon"></i>
            <h4>No circulars match your filters</h4>
            <p>Try clearing your category or keyword search parameters.</p>
            {hasActiveFilters && (
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* ============================================================
            MODAL: NOTICE DETAILS MODAL
            ============================================================ */}
        {selectedNotice && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedNotice(null)}
            title="Campus Circular Details"
            maxWidth="md"
          >
            <div className="notice-dialog-content">
              <div className="notice-dialog-header">
                <div className="dialog-meta-row">
                  <span className="course-code-tag">{selectedNotice.category}</span>
                  {getPriorityBadge(selectedNotice.priority)}
                </div>
                <h3 className="dialog-notice-title">{selectedNotice.title}</h3>
                <div className="dialog-author-date">
                  <span><i className="fa-solid fa-building-columns"></i> {selectedNotice.publisher}</span>
                  <span><i className="fa-regular fa-calendar"></i> {selectedNotice.publishedDate}</span>
                </div>
              </div>

              <div className="notice-dialog-body">
                <p>{selectedNotice.fullText}</p>
              </div>

              {selectedNotice.attachmentName && (
                <div className="notice-dialog-attachment">
                  <div className="attachment-file-box">
                    <i className="fa-solid fa-file-pdf"></i>
                    <div>
                      <span className="att-name">{selectedNotice.attachmentName}</span>
                      <span className="att-size">Official Document (1.4 MB)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => handleDownloadAttachment(selectedNotice.attachmentName!, selectedNotice)}
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Download</span>
                  </button>
                </div>
              )}

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedNotice(null)}
                >
                  Close Notice
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    showToast('Notice acknowledged.', 'info');
                    setSelectedNotice(null);
                  }}
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Acknowledge</span>
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

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Notifications & Dashboard</h4>
            <p>Access your personalized notifications inbox or return to the main dashboard.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/notifications')}
            >
              <i className="fa-solid fa-bell"></i>
              <span>Notifications Inbox</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard Home</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentNotices;
