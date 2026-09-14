import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getManagementData } from '../../data/managementData';
import { getStudentNotifications, saveStudentNotifications, StudentNotificationItem } from '../../services/storageService';

export interface FacultyNotificationItem {
  id: string;
  category: 'Assignment' | 'Attendance' | 'Class' | 'Exam' | 'System';
  title: string;
  message: string;
  time: string;
  isUnread: boolean;
  targetRoute?: string;
  actionLabel?: string;
}

const INITIAL_FACULTY_NOTIFICATIONS: FacultyNotificationItem[] = [
  {
    id: 'FNOTIF-01',
    category: 'Assignment',
    title: 'New Assignment Submissions',
    message: 'Aditya Sharma and 4 other students submitted solutions for "Binary Search Trees Implementation".',
    time: '20 mins ago',
    isUnread: true,
    targetRoute: '/faculty/assignments',
    actionLabel: 'Evaluate Work'
  },
  {
    id: 'FNOTIF-02',
    category: 'Class',
    title: 'Upcoming Lecture in 30 Mins',
    message: 'CSE-302 (DBMS) Section B lecture begins at 11:00 AM in Computer Lab 2.',
    time: '30 mins ago',
    isUnread: true,
    targetRoute: '/faculty/dashboard',
    actionLabel: 'View Schedule'
  },
  {
    id: 'FNOTIF-03',
    category: 'Attendance',
    title: 'Attendance Reminder',
    message: 'Attendance for CSE-401 Section A (Morning Session) is pending roll call.',
    time: '2 hours ago',
    isUnread: true,
    targetRoute: '/faculty/attendance',
    actionLabel: 'Roll Call'
  },
  {
    id: 'FNOTIF-04',
    category: 'Exam',
    title: 'Midterm 1 Seating Finalized',
    message: 'Seating arrangements for CSE-301 Midterm 1 in Room CSE-204 have been approved by the COE office.',
    time: '1 day ago',
    isUnread: false,
    targetRoute: '/faculty/exams',
    actionLabel: 'View Exam'
  }
];

export const FacultyNotifications: React.FC = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<FacultyNotificationItem[]>(INITIAL_FACULTY_NOTIFICATIONS);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Sending Alert to Student
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertCategory, setAlertCategory] = useState<StudentNotificationItem['category']>('Academic');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetType, setTargetType] = useState<'specific' | 'all'>('specific');
  const [alertMessage, setAlertMessage] = useState('');

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const studentsList = getManagementData().students;

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendStudentAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) {
      showToast('Please fill in both Title and Message fields.', 'error');
      return;
    }

    if (targetType === 'specific' && !targetStudentId) {
      showToast('Please select a student recipient.', 'error');
      return;
    }

    const matchedStudent = studentsList.find((s) => s.id === targetStudentId);

    try {
      const allStudentNotifs = getStudentNotifications();
      const newStudentNotif: StudentNotificationItem = {
        id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        category: alertCategory,
        title: alertTitle.trim(),
        message: alertMessage.trim(),
        time: 'Just now',
        isUnread: true,
        targetRoute: '/student/notifications',
        actionLabel: 'View Alert',
        targetStudentId: targetType === 'specific' ? (matchedStudent?.id || targetStudentId) : 'all',
        targetStudentEmail: targetType === 'specific' ? matchedStudent?.email : undefined,
        targetStudentName: targetType === 'specific' ? matchedStudent?.name : undefined,
        targetRole: 'student'
      };

      saveStudentNotifications([newStudentNotif, ...allStudentNotifs]);

      const recipientText = targetType === 'specific' && matchedStudent
        ? `${matchedStudent.name} (${matchedStudent.id})`
        : 'all students';

      setIsSendModalOpen(false);
      setAlertTitle('');
      setAlertMessage('');
      setTargetStudentId('');
      showToast(`Notification delivered successfully to ${recipientText}!`, 'success');
    } catch (err) {
      showToast('Failed to send notification.', 'error');
    }
  };

  const categories = ['All', 'Assignment', 'Class', 'Attendance', 'Exam'];

  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const totalCount = notifications.length;

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

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    showToast('All notifications marked as read.', 'info');
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification removed.', 'info');
  };

  const getCategoryIcon = (category: FacultyNotificationItem['category']) => {
    switch (category) {
      case 'Assignment':
        return { icon: 'fa-file-invoice', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)' };
      case 'Class':
        return { icon: 'fa-chalkboard-user', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'Attendance':
        return { icon: 'fa-clipboard-user', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'Exam':
        return { icon: 'fa-receipt', color: '#fb7185', bg: 'rgba(244, 63, 94, 0.15)' };
      default:
        return { icon: 'fa-bell', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' };
    }
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
              <span className="crumb-current">Notifications Inbox</span>
            </div>
            <h1 className="module-title">Faculty Notifications & Activity Alerts</h1>
            <p className="module-subtitle">
              Live alerts for student homework submissions, lecture session reminders, and academic milestone deadlines.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="notif-header-actions" style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setIsSendModalOpen(true)}
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Send Student Alert</span>
              </button>
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
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
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
              <span className="stat-num">Live</span>
              <span className="stat-label">Real-Time Faculty Sync</span>
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
                <span>{cat === 'All' ? 'All Alerts' : cat}</span>
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
              placeholder="Search faculty alerts by title, subject, or message..."
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
                        title="Delete alert"
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
            <h4>All alerts acknowledged</h4>
            <p>No new notifications in this category.</p>
          </div>
        )}

        {/* ============================================================
            MODAL: SEND STUDENT ALERT
            ============================================================ */}
        {isSendModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsSendModalOpen(false)}
            title="Send Alert to Student"
            maxWidth="md"
          >
            <form onSubmit={handleSendStudentAlert} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Alert Heading / Subject</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Lab Assignment #4 Feedback & Follow-up"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Recipient Scope</label>
                  <select
                    className="c1-select"
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value as 'specific' | 'all');
                      if (e.target.value === 'all') setTargetStudentId('');
                    }}
                  >
                    <option value="specific">🎯 Individual Student</option>
                    <option value="all">📢 All Students (Class Broadcast)</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Category</label>
                  <select
                    className="c1-select"
                    value={alertCategory}
                    onChange={(e) => setAlertCategory(e.target.value as any)}
                  >
                    <option value="Academic">Academic</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Exam">Exam</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
              </div>

              {targetType === 'specific' && (
                <div className="form-field-wrap">
                  <label className="form-label">Select Student (Recipient)</label>
                  <select
                    className="c1-select"
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {studentsList.map((stu) => (
                      <option key={stu.id} value={stu.id}>
                        {stu.name} ({stu.id}) • {stu.department} ({stu.year} - Sec {stu.section})
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>
                    Only this student will receive this notification in their feed.
                  </p>
                </div>
              )}

              <div className="form-field-wrap">
                <label className="form-label">Notification Message</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Enter message details for the student..."
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsSendModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Send Notification</span>
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

export default FacultyNotifications;
