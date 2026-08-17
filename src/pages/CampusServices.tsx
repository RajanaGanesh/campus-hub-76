import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesData, CampusServiceItem, ServiceRequest } from '../data/servicesData';

export const CampusServices: React.FC = () => {
  const navigate = useNavigate();

  // Load requests from localStorage
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_service_requests');
      return stored ? JSON.parse(stored) : servicesData.requests;
    } catch {
      return servicesData.requests;
    }
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modals States
  const [showIdModal, setShowIdModal] = useState(false);
  const [activeRequestService, setActiveRequestService] = useState<CampusServiceItem | null>(null);

  // Form Fields
  const [formSubject, setFormSubject] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formError, setFormError] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const categoriesList = ['All', 'Documents', 'Academic', 'Student Support', 'Technical', 'Campus'];

  // Filtered services
  const filteredServices = servicesData.services.filter((srv) => {
    const matchSearch =
      srv.title.toLowerCase().includes(search.toLowerCase()) ||
      srv.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || srv.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenService = (srv: CampusServiceItem) => {
    if (srv.id === 'srv-digital-id') {
      setShowIdModal(true);
    } else {
      setActiveRequestService(srv);
      setFormSubject('');
      setFormDesc('');
      setFormPriority('Medium');
      setFormError(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSubject.trim() || !formDesc.trim()) {
      setFormError('Please fill in both the Subject and Description fields.');
      return;
    }

    setFormError(null);

    const nextIdNum = 1001 + requests.length;
    const reqId = `REQ-${nextIdNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRequest: ServiceRequest = {
      id: reqId,
      serviceType: activeRequestService?.title || 'General Request',
      subject: formSubject,
      description: formDesc,
      createdDate: todayStr,
      status: 'Submitted',
      lastUpdated: todayStr,
      priority: formPriority,
      timeline: [
        { date: `${todayStr} ${timeStr}`, statusText: 'Request submitted' },
        { date: `${todayStr} ${timeStr}`, statusText: 'Request assigned to administration' }
      ]
    };

    const nextRequests = [newRequest, ...requests];
    setRequests(nextRequests);
    localStorage.setItem('campushub_service_requests', JSON.stringify(nextRequests));

    setActiveRequestService(null);
    setToastMsg('Service request submitted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Services Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Campus Services</h1>
          <p>Access common college services from one place.</p>
        </div>

        <button
          type="button"
          className="btn-view-all"
          style={{ width: 'auto', padding: '0 16px', height: '36px', border: '1px solid var(--accent-primary)', color: 'white', margin: 0 }}
          onClick={() => navigate('/services/requests')}
        >
          <i className="fa-solid fa-list-check" style={{ marginRight: '8px' }}></i>
          My Service Requests
        </button>
      </div>

      {/* Toast alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search and Category navigation bar */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Categories Tab Selector */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '100%' }}>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn-sso ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)',
                  borderColor: activeCategory === cat ? 'var(--accent-primary)' : 'var(--border-color)',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '280px', width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 32px',
                fontSize: '12.5px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredServices.length > 0 ? (
          filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="quick-card"
              style={{ cursor: 'default', height: '100%', justifyContent: 'space-between', padding: '20px 24px' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '16px' }}>
                    <i className={`fa-solid ${srv.icon}`}></i>
                  </div>
                  <span className="subject-att-status good" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                    {srv.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>{srv.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{srv.description}</p>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ height: '36px', fontSize: '12px', marginTop: '20px', marginInline: 0 }}
                onClick={() => handleOpenService(srv)}
              >
                {srv.actionText}
              </button>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No campus services found</h3>
            <p style={{ fontSize: '12.5px' }}>Try changing search filters.</p>
          </div>
        )}
      </div>

      {/* Digital ID modal overlay */}
      {showIdModal && (
        <div className="search-modal-overlay" onClick={() => setShowIdModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '360px', padding: 0, overflow: 'hidden', background: '#100f2e', border: '1px solid var(--accent-primary)', boxShadow: '0 0 30px rgba(124,92,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
            {/* ID Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-highlight))', padding: '24px 20px', textAlign: 'center', color: 'white', position: 'relative' }}>
              <button
                type="button"
                className="btn-search-close"
                onClick={() => setShowIdModal(false)}
                style={{ position: 'absolute', right: '14px', top: '14px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>CAMPUS HUB ID</h3>
              <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)' }}>ACADEMIC SYSTEM BADGE</span>
            </div>

            {/* ID Body */}
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Photo placeholder */}
              <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-primary)', border: '3px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'var(--accent-highlight)', fontWeight: '800', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                AS
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '2px' }}>Aditya Sharma</h2>
                <span style={{ fontSize: '12px', color: 'var(--accent-highlight)', fontWeight: '700', textTransform: 'uppercase' }}>STUDENT • 236F1A0551</span>
              </div>

              {/* ID Details grid */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', color: 'var(--text-secondary)' }}>
                <div>Dept: <strong style={{ color: 'white' }}>CSE</strong></div>
                <div>Sec: <strong style={{ color: 'white' }}>CSE-A</strong></div>
                <div>Year: <strong style={{ color: 'white' }}>IV Year</strong></div>
                <div>Blood: <strong style={{ color: 'white' }}>O+ve</strong></div>
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ffb236', fontWeight: '600', fontSize: '10.5px', marginTop: '4px' }}>
                  VALIDITY: JULY 2027
                </div>
              </div>

              {/* Interactive SVG QR code layout */}
              <div style={{ width: '96px', height: '96px', background: 'white', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }} fill="none" stroke="black" strokeWidth="0.5">
                  <path d="M1 1h6v6H1V1zm16 0h6v6h-6V1zM1 17h6v6H1v-6zm3-12h1v1H4V5zm16 0h1v1h-1V5zm-16 16h1v1H4v-1zm14-14h1v1h-1V7zm1-5h1v1h-1V2zm-3 2h1v1h-1V4zm1 5h1v1h-1V9zm-5-3h1v1h-1V6zm0 4h1v1h-1v-1zm2 1h1v1h-1v-1zm-4 4h1v1h-1v-1zm5 1h1v1h-1v-1zm-1 3h1v1h-1v-1zm3 2h1v1h-1v-1zm-6-2h1v1h-1v-1z" fill="black" />
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0, padding: 0, height: '34px', fontSize: '11px' }}
                  onClick={() => setShowIdModal(false)}
                >
                  Close ID
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '34px', fontSize: '11.5px', padding: 0 }}
                  onClick={() => {
                    setToastMsg('ID card download initiated.');
                    setTimeout(() => setToastMsg(null), 2500);
                  }}
                >
                  Download ID
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Creation Modal Form */}
      {activeRequestService && (
        <div className="search-modal-overlay" onClick={() => setActiveRequestService(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Create service request</span>
                <h2 style={{ fontSize: '18px', marginTop: '2px' }}>{activeRequestService.title}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setActiveRequestService(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="req-subject" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Subject / Topic</label>
                  <input
                    id="req-subject"
                    type="text"
                    placeholder="e.g. Passport verification, sick leave application..."
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'white',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="req-desc" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Request Description</label>
                  <textarea
                    id="req-desc"
                    rows={4}
                    placeholder="Provide details of your request here..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'white',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Select Priority</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(['Low', 'Medium', 'High'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`btn-sso ${formPriority === p ? 'active' : ''}`}
                        onClick={() => setFormPriority(p)}
                        style={{
                          height: '36px',
                          fontSize: '12px',
                          flex: 1,
                          background: formPriority === p ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)',
                          borderColor: formPriority === p ? 'var(--accent-primary)' : 'var(--border-color)'
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-signin"
                  style={{ height: '42px', fontSize: '13.5px', marginTop: '10px', marginInline: 0 }}
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CampusServices;
