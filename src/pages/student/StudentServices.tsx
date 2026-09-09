import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { servicesData, CampusServiceItem, ServiceRequest } from '../../data/servicesData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

const STORAGE_KEY = 'campushub_service_requests';

export const StudentServices: React.FC = () => {
  const navigate = useNavigate();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-requests' | 'emergency'>('catalog');

  // Search and category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Persistent service requests
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : servicesData.requests;
    } catch {
      return servicesData.requests;
    }
  });

  // Modals state
  const [activeServiceModal, setActiveServiceModal] = useState<CampusServiceItem | null>(null);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<ServiceRequest | null>(null);

  // Form fields for request creation
  const [formSubject, setFormSubject] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formContactInfo, setFormContactInfo] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const categories = ['All', 'Documents', 'Academic', 'Student Support', 'Technical', 'Campus'];

  // Filtered services
  const filteredServices = useMemo(() => {
    return servicesData.services.filter((srv) => {
      const matchesSearch =
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || srv.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenService = (srv: CampusServiceItem) => {
    if (srv.id === 'srv-digital-id') {
      navigate('/student/profile');
      return;
    }
    setActiveServiceModal(srv);
    setFormSubject(srv.title);
    setFormDesc('');
    setFormPriority('Medium');
    setFormContactInfo('');
  };

  const handleCreateRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formDesc.trim()) {
      showToast('Please provide both subject and description.', 'error');
      return;
    }

    const nextId = `REQ-${1000 + requests.length + 1}`;
    const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newReq: ServiceRequest = {
      id: nextId,
      serviceType: activeServiceModal?.title || 'General Service',
      subject: formSubject,
      description: formDesc,
      createdDate: today,
      status: 'Submitted',
      lastUpdated: 'Just now',
      priority: formPriority,
      timeline: [
        { date: `${today} ${nowTime}`, statusText: 'Service request registered by student' },
        { date: `${today} ${nowTime}`, statusText: 'Forwarded to Central Campus Desk' }
      ]
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setActiveServiceModal(null);
    showToast(`Request #${nextId} created successfully!`, 'success');
  };

  const getPriorityBadgeClass = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'High':
        return 'c1-badge-danger';
      case 'Medium':
        return 'c1-badge-warning';
      case 'Low':
      default:
        return 'c1-badge-primary';
    }
  };

  const getStatusBadgeClass = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'c1-badge-success';
      case 'Under Review':
        return 'c1-badge-warning';
      case 'Rejected':
        return 'c1-badge-danger';
      case 'Submitted':
      default:
        return 'c1-badge-primary';
    }
  };

  // Stat metrics
  const pendingCount = requests.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;
  const completedCount = requests.filter((r) => r.status === 'Completed' || r.status === 'Approved').length;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header Row */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Services</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Campus Services & Helpdesk</span>
            </div>
            <h1 className="module-title">Campus Services & Helpdesk Portal</h1>
            <p className="module-subtitle">
              Apply for certificates, lodge facility maintenance requests, submit official grievances, and track support resolution timelines.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => {
                setActiveServiceModal(servicesData.services[0]);
                setFormSubject('');
                setFormDesc('');
                setFormPriority('Medium');
              }}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Create New Request</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{servicesData.services.length}</span>
              <span className="stat-label">Available Services</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{pendingCount}</span>
              <span className="stat-label">Active Tickets</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{completedCount}</span>
              <span className="stat-label">Resolved Requests</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-headset"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">24-48h</span>
              <span className="stat-label">SLA Turnaround</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <i className="fa-solid fa-grid-2"></i>
            <span>Services Catalog ({filteredServices.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-requests')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>My Support Requests ({requests.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
            onClick={() => setActiveTab('emergency')}
          >
            <i className="fa-solid fa-phone-volume"></i>
            <span>Emergency Helplines</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: SERVICES CATALOG
            ============================================================ */}
        {activeTab === 'catalog' && (
          <div>
            {/* Search & Category Filter Toolbar */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
              <div className="search-filter-input-wrap">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  className="c1-input search-filter-input"
                  placeholder="Search campus services, certificates, maintenance, grievances..."
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
                  <label>Category</label>
                  <select
                    className="c1-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-clear-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="materials-cards-grid">
                {filteredServices.map((srv) => (
                  <div key={srv.id} className="c1-card material-card-item" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="material-card-top">
                      <div className="material-format-icon" style={{ background: 'rgba(108, 75, 255, 0.12)', color: 'var(--accent-primary)' }}>
                        <i className={`fa-solid ${srv.icon}`}></i>
                      </div>
                      <span className="c1-badge c1-badge-primary">{srv.category}</span>
                    </div>

                    <h3 className="material-card-title" style={{ marginTop: '8px' }}>{srv.title}</h3>
                    <p className="material-card-desc" style={{ flex: 1 }}>{srv.description}</p>

                    <div className="material-card-actions" style={{ marginTop: '16px' }}>
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient"
                        style={{ width: '100%' }}
                        onClick={() => handleOpenService(srv)}
                      >
                        <i className="fa-solid fa-arrow-right"></i>
                        <span>{srv.actionText}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-circle-info empty-card-icon"></i>
                <h4>No campus services match your search</h4>
                <p>Try clearing your keyword filters or choose another category.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: MY SUPPORT REQUESTS TRACKER
            ============================================================ */}
        {activeTab === 'my-requests' && (
          <div>
            {requests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {requests.map((req) => (
                  <div key={req.id} className="c1-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-primary)' }}>
                            {req.id}
                          </span>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                            {req.subject}
                          </h3>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                          Service Type: <strong>{req.serviceType}</strong> • Submitted on {req.createdDate}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`c1-badge ${getPriorityBadgeClass(req.priority)}`}>
                          {req.priority} Priority
                        </span>
                        <span className={`c1-badge ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 14px 0' }}>
                      {req.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        <i className="fa-regular fa-clock"></i> Last updated: {req.lastUpdated}
                      </span>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                        onClick={() => setSelectedRequestDetails(req)}
                      >
                        <i className="fa-solid fa-timeline"></i>
                        <span>View Progress Timeline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-inbox empty-card-icon"></i>
                <h4>No active service requests</h4>
                <p>You haven't submitted any service requests yet. Browse the catalog to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: EMERGENCY & HELPLINE CONTACTS
            ============================================================ */}
        {activeTab === 'emergency' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="c1-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Campus Security Control</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>24/7 Gate & Patrol Response</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Main Gate Control Room, Central Security Post, Block-A.</p>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444' }}>
                <i className="fa-solid fa-phone"></i> +91 040-23456789 / Ext: 100
              </div>
            </div>

            <div className="c1-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-solid fa-heart-pulse"></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Campus Health Clinic</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Resident Doctor & Ambulance</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Medical Block 1st Floor, Pharmacy & Emergency Ward.</p>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                <i className="fa-solid fa-phone"></i> +91 040-23456790 / Ext: 108
              </div>
            </div>

            <div className="c1-card" style={{ padding: '20px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-solid fa-laptop-code"></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>IT & Wi-Fi Support Desk</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Network, Email & LMS Access</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Computer Center, Server Room Ground Floor.</p>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7' }}>
                <i className="fa-solid fa-envelope"></i> ithelpdesk@campushub.edu
              </div>
            </div>

            <div className="c1-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  <i className="fa-solid fa-scale-balanced"></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Anti-Ragging & Grievances</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Confidential Student Counsel</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>Office of the Dean (Student Affairs), Administrative Wing.</p>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#8b5cf6' }}>
                <i className="fa-solid fa-phone"></i> 1800-180-5522 (Toll Free)
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Service Request */}
        {activeServiceModal && (
          <Modal
            isOpen={true}
            onClose={() => setActiveServiceModal(null)}
            title={`Create Request: ${activeServiceModal.title}`}
            maxWidth="md"
          >
            <form onSubmit={handleCreateRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="c1-form-label">Service Type</label>
                <input
                  type="text"
                  className="c1-input"
                  value={activeServiceModal.title}
                  readOnly
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div>
                <label className="c1-form-label">Subject / Purpose *</label>
                <input
                  type="text"
                  className="c1-input"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Requesting Bonafide Certificate for Visa processing"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Urgency / Priority</label>
                  <select
                    className="c1-select"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Medium">Medium (Standard)</option>
                    <option value="High">High (Urgent)</option>
                  </select>
                </div>
                <div>
                  <label className="c1-form-label">Room / Hostel / Contact Ext.</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={formContactInfo}
                    onChange={(e) => setFormContactInfo(e.target.value)}
                    placeholder="e.g. Room 304, Block-B"
                  />
                </div>
              </div>

              <div>
                <label className="c1-form-label">Detailed Explanation / Notes *</label>
                <textarea
                  className="c1-input"
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe your request requirements or issue details..."
                  required
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setActiveServiceModal(null)}
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

        {/* Modal: Request Progress Timeline */}
        {selectedRequestDetails && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedRequestDetails(null)}
            title={`Ticket Timeline: ${selectedRequestDetails.id}`}
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{selectedRequestDetails.subject}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category: {selectedRequestDetails.serviceType}</span>
                </div>
                <span className={`c1-badge ${getStatusBadgeClass(selectedRequestDetails.status)}`}>
                  {selectedRequestDetails.status}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '12px 14px', borderRadius: '8px' }}>
                <strong>Description:</strong> {selectedRequestDetails.description}
              </div>

              <div>
                <h5 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '12px' }}>Resolution Milestones</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '16px', marginLeft: '6px' }}>
                  {selectedRequestDetails.timeline && selectedRequestDetails.timeline.length > 0 ? (
                    selectedRequestDetails.timeline.map((event, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute',
                          left: '-22px',
                          top: '2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: 'var(--accent-primary)'
                        }} />
                        <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)' }}>{event.statusText}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{event.date}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No milestones logged yet.</div>
                  )}
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedRequestDetails(null)}
                >
                  Close Timeline
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Feedback */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card" style={{ marginTop: '24px' }}>
          <div className="bridge-text">
            <h4>Need More Assistance?</h4>
            <p>Check your library loans, hostel room bookings, or student profile records.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/library')}
            >
              <i className="fa-solid fa-book"></i>
              <span>Campus Library</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/hostel')}
            >
              <i className="fa-solid fa-hotel"></i>
              <span>Hostel & Mess</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/profile')}
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Student Profile</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentServices;
