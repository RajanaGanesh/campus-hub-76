import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { mobilityData, getHostelRequests, saveHostelRequests, HostelRequest, HostelAnnouncement } from '../../data/mobilityData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentHostel: React.FC = () => {
  const navigate = useNavigate();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'notices' | 'mess'>('overview');

  // Requests state loaded from persistent storage
  const [requests, setRequests] = useState<HostelRequest[]>(() => getHostelRequests());
  const [announcements] = useState<HostelAnnouncement[]>(mobilityData.announcements);

  // New Request Modal State
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [reqCategory, setReqCategory] = useState('Plumbing Issue');
  const [reqSubject, setReqSubject] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqPriority, setReqPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Submit new request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSubject.trim() || !reqDesc.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const newReq: HostelRequest = {
      id: `HOSTEL-REQ-${1000 + requests.length + 1}`,
      type: reqCategory,
      subject: reqSubject,
      description: reqDesc,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: reqPriority,
      status: 'Submitted',
      lastUpdated: 'Just now',
      timeline: [
        {
          date: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} 10:00 AM`,
          statusText: 'Service request submitted by student'
        }
      ]
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    saveHostelRequests(updated);

    setIsNewRequestModalOpen(false);
    setReqSubject('');
    setReqDesc('');
    setReqPriority('Medium');
    showToast('Hostel maintenance request submitted successfully!', 'success');
  };

  const getStatusBadge = (status: HostelRequest['status']) => {
    switch (status) {
      case 'Resolved':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Resolved</span>;
      case 'Under Review':
      case 'Assigned':
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-spinner"></i> Under Review</span>;
      case 'Rejected':
        return <span className="c1-badge c1-badge-error"><i className="fa-solid fa-circle-xmark"></i> Rejected</span>;
      case 'Submitted':
      default:
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-clock"></i> Submitted</span>;
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Campus Life</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Hostel Accommodation</span>
            </div>
            <h1 className="module-title">Hostel Management</h1>
            <p className="module-subtitle">
              Room allocation profile, dining plans, hostel maintenance requests, and administrative notices.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient btn-new-req-main"
              onClick={() => setIsNewRequestModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>New Maintenance Request</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-door-closed"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Room 204</span>
              <span className="stat-label">Allocated Room & Bed 2</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-hotel"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Block A</span>
              <span className="stat-label">Krishna Hostel (2nd Floor)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-utensils"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Active</span>
              <span className="stat-label">Mess Dining Subscription</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{requests.length} Requests</span>
              <span className="stat-label">Maintenance Logs</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fa-solid fa-id-card-clip"></i>
            <span>Allocation Profile</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>Maintenance Requests ({requests.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <i className="fa-solid fa-bullhorn"></i>
            <span>Hostel Circulars ({announcements.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'mess' ? 'active' : ''}`}
            onClick={() => setActiveTab('mess')}
          >
            <i className="fa-solid fa-utensils"></i>
            <span>Weekly Mess Menu</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: ALLOCATION OVERVIEW
            ============================================================ */}
        {activeTab === 'overview' && (
          <div className="hostel-overview-grid">
            {/* Room Allocation Info Card */}
            <div className="c1-card allocation-details-card">
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">Room & Bed Allocation</h3>
                  <p className="c1-card-subtitle">Current resident details for Academic Year 2025–2026</p>
                </div>
                <span className="c1-badge c1-badge-success">Occupied</span>
              </div>

              <div className="allocation-fields-grid">
                <div className="alloc-field">
                  <span className="alloc-lbl">Hostel Premises:</span>
                  <span className="alloc-val">Krishna Boys Hostel (Block A)</span>
                </div>
                <div className="alloc-field">
                  <span className="alloc-lbl">Floor & Room:</span>
                  <span className="alloc-val">2nd Floor • Room 204</span>
                </div>
                <div className="alloc-field">
                  <span className="alloc-lbl">Room Type:</span>
                  <span className="alloc-val">Double Occupancy (Air Conditioned)</span>
                </div>
                <div className="alloc-field">
                  <span className="alloc-lbl">Assigned Bed:</span>
                  <span className="alloc-val">Bed #2 (Near Balcony Window)</span>
                </div>
                <div className="alloc-field">
                  <span className="alloc-lbl">Resident Student:</span>
                  <span className="alloc-val">Aditya Sharma (236F1A0551)</span>
                </div>
                <div className="alloc-field">
                  <span className="alloc-lbl">Roommate:</span>
                  <span className="alloc-val">Arun Kumar (CSE - IV Year)</span>
                </div>
              </div>
            </div>

            {/* Warden & Caretaker Contacts */}
            <div className="c1-card warden-contacts-card">
              <h3 className="c1-card-title">Hostel Administration & Support</h3>
              <p className="c1-card-subtitle">Official wardens and emergency contacts for Block A</p>

              <div className="contacts-list">
                <div className="contact-item">
                  <div className="contact-avatar">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Dr. V. Murugan</h4>
                    <span className="contact-role">Chief Residential Warden</span>
                    <span className="contact-phone"><i className="fa-solid fa-phone"></i> +91 98410 23456 (Ext: 402)</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-avatar">
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Mr. Selvam K.</h4>
                    <span className="contact-role">Block A Caretaker & Supervisor</span>
                    <span className="contact-phone"><i className="fa-solid fa-phone"></i> +91 94432 10987</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-avatar">
                    <i className="fa-solid fa-kit-medical"></i>
                  </div>
                  <div className="contact-info">
                    <h4>Campus Health Center & Ambulance</h4>
                    <span className="contact-role">24/7 Medical Emergency Desk</span>
                    <span className="contact-phone" style={{ color: 'var(--color-error)' }}><i className="fa-solid fa-phone"></i> +91 98840 99999</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: MAINTENANCE REQUESTS
            ============================================================ */}
        {activeTab === 'requests' && (
          <div className="c1-card hostel-requests-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Maintenance & Service Requests</h3>
                <p className="c1-card-subtitle">Track repairs, plumbing, electrical, and room issue tickets</p>
              </div>
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setIsNewRequestModalOpen(true)}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Log New Issue</span>
              </button>
            </div>

            {requests.length > 0 ? (
              <div className="requests-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Category</th>
                      <th>Subject / Description</th>
                      <th>Priority</th>
                      <th>Date Filed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td><span className="course-code-cell">{req.id}</span></td>
                        <td><strong>{req.type}</strong></td>
                        <td>
                          <div>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{req.subject}</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{req.description}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`priority-pill priority-${req.priority.toLowerCase()}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td>{req.createdDate}</td>
                        <td>{getStatusBadge(req.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-clipboard-check empty-card-icon"></i>
                <h4>No active maintenance requests</h4>
                <p>Everything in your room is in good working order.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: HOSTEL NOTICES
            ============================================================ */}
        {activeTab === 'notices' && (
          <div className="hostel-notices-grid">
            {announcements.map((notif) => (
              <div key={notif.id} className="c1-card hostel-notice-card">
                <div className="notice-card-top">
                  <span className="c1-badge c1-badge-purple">{notif.category}</span>
                  <span className="notice-date"><i className="fa-regular fa-calendar"></i> {notif.date}</span>
                </div>
                <h3 className="notice-title">{notif.title}</h3>
                <p className="notice-desc">{notif.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            TAB 4: WEEKLY MESS MENU
            ============================================================ */}
        {activeTab === 'mess' && (
          <div className="c1-card mess-menu-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Krishna Hostel Dining Schedule</h3>
                <p className="c1-card-subtitle">Healthy North & South Indian catering schedule</p>
              </div>
              <span className="c1-badge c1-badge-success">ISO 22000 Certified Dining</span>
            </div>

            <div className="mess-menu-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Breakfast (07:30 - 09:30 AM)</th>
                    <th>Lunch (12:30 - 02:30 PM)</th>
                    <th>Evening Snacks (05:00 - 06:00 PM)</th>
                    <th>Dinner (07:30 - 09:30 PM)</th>
                  </tr>
                </thead>
                <tbody>
                  {mobilityData.weeklyMenu.map((dayItem) => (
                    <tr key={dayItem.day}>
                      <td><strong>{dayItem.day}</strong></td>
                      <td>{dayItem.Breakfast.menuItems}</td>
                      <td>{dayItem.Lunch.menuItems}</td>
                      <td>{dayItem.Snacks.menuItems}</td>
                      <td>{dayItem.Dinner.menuItems}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: CREATE NEW HOSTEL REQUEST
            ============================================================ */}
        {isNewRequestModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsNewRequestModalOpen(false)}
            title="Create Hostel Maintenance Request"
            maxWidth="md"
          >
            <form onSubmit={handleCreateRequest} className="hostel-request-form">
              <div className="form-field-wrap">
                <label className="form-label">Issue Category</label>
                <select
                  className="c1-select"
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value)}
                >
                  <option value="Plumbing Issue">Plumbing Maintenance (Taps, Drainage, Flush)</option>
                  <option value="Electrical Repair">Electrical Repair (Fan, Lights, Switches)</option>
                  <option value="Carpentry & Furniture">Carpentry & Furniture (Cot, Study Desk, Cupboard)</option>
                  <option value="Wi-Fi & Network">Wi-Fi & LAN Network Connectivity</option>
                  <option value="Mess & Food Complaint">Mess & Dining Quality Complaint</option>
                  <option value="General Housekeeping">General Housekeeping & Cleaning</option>
                </select>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Summary Subject</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Study table lamp switch not working"
                  value={reqSubject}
                  onChange={(e) => setReqSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Provide details about the issue, location inside the room, and urgency..."
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Urgency / Priority Level</label>
                <div className="priority-select-row">
                  {(['Low', 'Medium', 'High'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-chip-btn ${reqPriority === p ? 'selected' : ''}`}
                      onClick={() => setReqPriority(p)}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsNewRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Ticket</span>
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

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Campus Transport & Notices</h4>
            <p>View bus departure timings or read official administrative circulars.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/transport')}
            >
              <i className="fa-solid fa-bus"></i>
              <span>Campus Transport</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/notices')}
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>Campus Notices</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentHostel;
