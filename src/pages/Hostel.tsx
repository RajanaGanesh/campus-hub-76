import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mobilityData, HostelRequest } from '../data/mobilityData';

export const Hostel: React.FC = () => {
  const navigate = useNavigate();

  // Load requests state
  const [requests, setRequests] = useState<HostelRequest[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_hostel_requests');
      return stored ? JSON.parse(stored) : mobilityData.requests;
    } catch {
      return mobilityData.requests;
    }
  });

  // Modal selectors
  const [activeComplaintType, setActiveComplaintType] = useState<string | null>(null);
  const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Complaint Form Fields
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPriority, setComplaintPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Room Change Fields
  const [preferredRoom, setPreferredRoom] = useState('');
  const [roomChangeReason, setRoomChangeReason] = useState('');

  // Leave Form Fields
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDest, setLeaveDest] = useState('');
  const [leaveEmergency, setLeaveEmergency] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenComplaint = (type: string) => {
    setActiveComplaintType(type);
    setComplaintSubject('');
    setComplaintDesc('');
    setComplaintPriority('Medium');
    setFormError(null);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      setFormError('Please fill in both the Subject and Description fields.');
      return;
    }

    const nextIdNum = 1001 + requests.length;
    const reqId = `HOSTEL-REQ-${nextIdNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newRequest: HostelRequest = {
      id: reqId,
      type: activeComplaintType || 'General Complaint',
      subject: complaintSubject,
      description: complaintDesc,
      createdDate: todayStr,
      priority: complaintPriority,
      status: 'Submitted',
      lastUpdated: todayStr,
      timeline: [
        { date: `${todayStr} ${timeStr}`, statusText: 'Request submitted' },
        { date: `${todayStr} ${timeStr}`, statusText: 'Request assigned to hostel warden' }
      ]
    };

    const nextRequests = [newRequest, ...requests];
    setRequests(nextRequests);
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(nextRequests));

    setActiveComplaintType(null);
    setToastMsg(`Request submitted successfully. Ticket ID: ${reqId}`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredRoom.trim() || !roomChangeReason.trim()) {
      setFormError('Please fill in both the Preferred Room and Reason fields.');
      return;
    }

    const nextIdNum = 1001 + requests.length;
    const reqId = `HOSTEL-REQ-${nextIdNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const newRequest: HostelRequest = {
      id: reqId,
      type: 'Room Change Request',
      subject: `Change from B-204 to ${preferredRoom}`,
      description: roomChangeReason,
      createdDate: todayStr,
      priority: 'Low',
      status: 'Under Review',
      lastUpdated: todayStr,
      timeline: [
        { date: `${todayStr} 12:00 PM`, statusText: 'Room Change request submitted' },
        { date: `${todayStr} 12:00 PM`, statusText: 'Request under review by warden' }
      ]
    };

    const nextRequests = [newRequest, ...requests];
    setRequests(nextRequests);
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(nextRequests));

    setShowRoomChangeModal(false);
    setToastMsg('Room change request submitted under review.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason.trim() || !leaveDest.trim() || !leaveEmergency.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    const dateStart = new Date(leaveStart);
    const dateEnd = new Date(leaveEnd);

    if (dateEnd < dateStart) {
      setFormError('Error: Return date cannot be before leaving date.');
      return;
    }

    setFormError(null);

    const nextIdNum = 1001 + requests.length;
    const reqId = `HOSTEL-REQ-${nextIdNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const newRequest: HostelRequest = {
      id: reqId,
      type: 'Hostel Leave Request',
      subject: `Leave from ${leaveStart} to ${leaveEnd}`,
      description: `Reason: ${leaveReason}. Destination: ${leaveDest}. Emergency Contact: ${leaveEmergency}`,
      createdDate: todayStr,
      priority: 'Medium',
      status: 'Submitted',
      lastUpdated: todayStr,
      timeline: [
        { date: `${todayStr} 12:00 PM`, statusText: 'Leave request submitted' },
        { date: `${todayStr} 12:00 PM`, statusText: 'Assigned to warden for gatepass approval' }
      ]
    };

    const nextRequests = [newRequest, ...requests];
    setRequests(nextRequests);
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(nextRequests));

    setShowLeaveModal(false);
    setToastMsg('Leave request submitted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Hostel Management</h1>
          <p>Manage your accommodation, room information, requests, and hostel services.</p>
        </div>

        <button
          type="button"
          className="btn-view-all"
          style={{ width: 'auto', padding: '0 16px', height: '36px', border: '1px solid var(--accent-primary)', color: 'white', margin: 0 }}
          onClick={() => navigate('/hostel/requests')}
        >
          <i className="fa-solid fa-list-check" style={{ marginRight: '8px' }}></i>
          My Hostel Requests
        </button>
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-hotel"></i>
            </div>
            <span className="stat-card-trend safe">Krishna Boys</span>
          </div>
          <div className="stat-card-value">B-204</div>
          <div className="stat-card-desc">Current Room</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-bed"></i>
            </div>
          </div>
          <div className="stat-card-value">3 / 4</div>
          <div className="stat-card-desc">Beds Occupied</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="stat-card-value">3</div>
          <div className="stat-card-desc">Active Roommates</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-utensils"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#00d89a' }}>Active</div>
          <div className="stat-card-desc">Hostel Mess Membership</div>
        </div>
      </div>

      {/* Grid area: Room info on left, roommates list on right */}
      <div className="dashboard-main-grid">
        {/* Room Info details */}
        <div className="card-panel" style={{ flex: 1.2 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>My Room Details</h3>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', marginBottom: '20px' }}>
            <div>Hostel Block: <strong style={{ color: 'white' }}>Krishna B Block</strong></div>
            <div>Floor: <strong style={{ color: 'white' }}>2nd Floor</strong></div>
            <div>Room Number: <strong style={{ color: 'white' }}>B-204</strong></div>
            <div>Room Type: <strong style={{ color: 'white' }}>4 Sharing</strong></div>
            <div>Warden Contact: <strong style={{ color: 'white' }}>+91 9440999999</strong></div>
            <div>Current Status: <span className="subject-att-status safe" style={{ fontSize: '9px' }}>OCCUPIED</span></div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <h4 style={{ fontSize: '13.5px', color: 'white', marginBottom: '10px' }}>Provided Amenities</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Bed', 'Study Table', 'Chair', 'Wardrobe', 'Wi-Fi Network', 'Ceiling Fan', 'Power Outlets'].map((am) => (
                <span key={am} style={{ fontSize: '11px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '4px 10px', color: 'white' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#00d89a', marginRight: '6px' }}></i> {am}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Roommates card list */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>My Roommates</h3>
            <i className="fa-solid fa-users" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mobilityData.roommates.map((rm) => (
              <div key={rm.id} className="timetable-item" style={{ padding: '10px 14px', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                  {rm.avatarText}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>{rm.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Dept: {rm.department} • Year: {rm.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hostel Announcements */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Hostel Announcements</h3>
          <i className="fa-solid fa-bullhorn" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {mobilityData.announcements.map((ann) => (
            <div key={ann.id} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="class-subject-name" style={{ fontSize: '13.5px' }}>{ann.title}</span>
                <span className="subject-att-status good" style={{ fontSize: '8px' }}>{ann.category}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Date: {ann.date}</span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{ann.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hostel Services Button grid */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Hostel Services Requests</h3>
          <i className="fa-solid fa-screwdriver-wrench" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
          {[
            { type: 'Room Maintenance', desc: 'Report damages to tables, beds or cupboards.', icon: 'fa-bed-pulse' },
            { type: 'Electrical Complaint', desc: 'Fan failures, power outlet errors or lighting issues.', icon: 'fa-bolt' },
            { type: 'Plumbing Complaint', desc: 'Tap leakages, basin blocks or flush repairs.', icon: 'fa-faucet' },
            { type: 'Wi-Fi Complaint', desc: 'Low signal strength, access denials or routing crashes.', icon: 'fa-wifi' },
            { type: 'Room Change Request', desc: 'Apply to swap rooms next term.', icon: 'fa-house-chimney-window', custom: 'change' },
            { type: 'Hostel Leave Request', desc: 'Apply for weekend gatepass approvals.', icon: 'fa-door-open', custom: 'leave' },
            { type: 'Mess Complaint', desc: 'Hygiene standards, food issues, or menu feedback.', icon: 'fa-utensils' },
            { type: 'General Complaint', desc: 'Laundries, cleaning, wardens issues.', icon: 'fa-circle-question' }
          ].map((srv, idx) => (
            <div key={idx} className="quick-card" style={{ cursor: 'default', height: '100%', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '14px', marginBottom: '12px' }}>
                  <i className={`fa-solid ${srv.icon}`}></i>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{srv.type}</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{srv.desc}</p>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ height: '32px', fontSize: '11.5px', marginTop: '16px', marginInline: 0 }}
                onClick={() => {
                  if (srv.custom === 'change') {
                    setFormError(null);
                    setPreferredRoom('');
                    setRoomChangeReason('');
                    setShowRoomChangeModal(true);
                  } else if (srv.custom === 'leave') {
                    setFormError(null);
                    setLeaveStart('');
                    setLeaveEnd('');
                    setLeaveReason('');
                    setLeaveDest('');
                    setLeaveEmergency('');
                    setShowLeaveModal(true);
                  } else {
                    handleOpenComplaint(srv.type);
                  }
                }}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Submit Modal */}
      {activeComplaintType && (
        <div className="search-modal-overlay" onClick={() => setActiveComplaintType(null)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Hostel Service ticket</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{activeComplaintType}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setActiveComplaintType(null)}>
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

              <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="comp-subject" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Subject Topic</label>
                  <input
                    id="comp-subject"
                    type="text"
                    placeholder="e.g. Wi-Fi not working on my study table..."
                    value={complaintSubject}
                    onChange={(e) => setComplaintSubject(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="comp-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Detailed Description</label>
                  <textarea
                    id="comp-desc"
                    rows={4}
                    placeholder="Please explain the issue to help our maintenance technicians..."
                    value={complaintDesc}
                    onChange={(e) => setComplaintDesc(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(['Low', 'Medium', 'High'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`btn-sso ${complaintPriority === p ? 'active' : ''}`}
                        onClick={() => setComplaintPriority(p)}
                        style={{ height: '36px', fontSize: '12px', flex: 1, background: complaintPriority === p ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)', borderColor: complaintPriority === p ? 'var(--accent-primary)' : 'var(--border-color)' }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Submit Complaint Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Room Change Modal Form */}
      {showRoomChangeModal && (
        <div className="search-modal-overlay" onClick={() => setShowRoomChangeModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Krishna Boys Hostel</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Request Room Change</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowRoomChangeModal(false)}>
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

              <form onSubmit={handleRoomChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Current Assigned Room</label>
                  <strong style={{ color: 'white', fontSize: '13px' }}>B-204 ( कृष्णा Hostel )</strong>
                </div>

                <div className="form-group">
                  <label htmlFor="pref-room" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Preferred Room Number / Block</label>
                  <input
                    id="pref-room"
                    type="text"
                    placeholder="e.g. B-205, C-104 (2 Sharing)..."
                    value={preferredRoom}
                    onChange={(e) => setPreferredRoom(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="change-reason" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Reason for Room Change</label>
                  <textarea
                    id="change-reason"
                    rows={3}
                    placeholder="Explain the reason for requesting room reallocation..."
                    value={roomChangeReason}
                    onChange={(e) => setRoomChangeReason(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Submit Reallocation Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Leave Request Modal Form */}
      {showLeaveModal && (
        <div className="search-modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}> Krishna Boys Hostel </span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Leave Request Application</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowLeaveModal(false)}>
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

              <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="leave-start" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Leaving Date</label>
                    <input
                      id="leave-start"
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="leave-end" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Return Date</label>
                    <input
                      id="leave-end"
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="leave-reason" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Reason for Outing</label>
                  <input
                    id="leave-reason"
                    type="text"
                    placeholder="e.g. Going home for weekend festival..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leave-dest" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Destination Address</label>
                  <input
                    id="leave-dest"
                    type="text"
                    placeholder="Provide town/city address..."
                    value={leaveDest}
                    onChange={(e) => setLeaveDest(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leave-emerg" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Emergency Contact Number</label>
                  <input
                    id="leave-emerg"
                    type="text"
                    placeholder="Parent / Guardian phone number..."
                    value={leaveEmergency}
                    onChange={(e) => setLeaveEmergency(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Submit Leave Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Hostel;
