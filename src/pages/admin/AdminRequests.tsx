import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { mobilityData, HostelRequest } from '../../data/mobilityData';

export const AdminRequests: React.FC = () => {
  const navigate = useNavigate();

  // Load hostel requests
  const [hostelRequests, setHostelRequests] = useState<HostelRequest[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_hostel_requests');
      return stored ? JSON.parse(stored) : mobilityData.requests;
    } catch {
      return mobilityData.requests;
    }
  });

  // Selectors for editing/updating status
  const [activeRequest, setActiveRequest] = useState<HostelRequest | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<HostelRequest['status']>('Submitted');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getStatusClass = (status: HostelRequest['status']) => {
    switch (status) {
      case 'Resolved':
        return 'subject-att-status safe';
      case 'Under Review':
      case 'Assigned':
        return 'subject-att-status warning';
      case 'Rejected':
        return 'subject-att-status critical';
      case 'Submitted':
      default:
        return 'subject-att-status good';
    }
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    const nextRequests = hostelRequests.map((r) => {
      if (r.id === activeRequest.id) {
        const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        return {
          ...r,
          status: selectedStatus,
          lastUpdated: todayStr,
          timeline: [
            ...r.timeline,
            { date: `${todayStr} ${timeStr}`, statusText: `Admin changed status to: ${selectedStatus}` }
          ]
        };
      }
      return r;
    });

    setHostelRequests(nextRequests);
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(nextRequests));

    setActiveRequest(null);
    setToastMsg(`Request status updated to ${selectedStatus}.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/admin')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Admin Console
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Requests</span>
      </div>

      <div className="dashboard-header">
        <h1>Request & Helpdesk Management</h1>
        <p>Review submitted leaves, room changes, maintenance tickets and certificate applications.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Requests table */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Request ID</th>
                <th style={{ padding: '12px 14px' }}>Category Type</th>
                <th style={{ padding: '12px 14px' }}>Subject Details</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Created Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Priority</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostelRequests.length > 0 ? (
                hostelRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{req.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{req.type}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div>{req.subject}</div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{req.description.slice(0, 50)}{req.description.length > 50 ? '...' : ''}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{req.createdDate}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ color: req.priority === 'High' ? 'var(--color-error)' : req.priority === 'Medium' ? '#ffb236' : '#00d89a', fontWeight: '700' }}>
                        {req.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className={getStatusClass(req.status)} style={{ fontSize: '8.5px' }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-sso"
                        style={{ height: '26px', fontSize: '11px', padding: '0 10px', margin: 0, width: 'auto' }}
                        onClick={() => {
                          setActiveRequest(req);
                          setSelectedStatus(req.status);
                        }}
                      >
                        Action
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Update Status Modal */}
      {activeRequest && (
        <div className="search-modal-overlay" onClick={() => setActiveRequest(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>{activeRequest.id} Action</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Review Ticket</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setActiveRequest(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Category: <strong style={{ color: 'white' }}>{activeRequest.type}</strong></div>
                <div>Subject: <strong style={{ color: 'white' }}>{activeRequest.subject}</strong></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '6px', marginTop: '4px', lineHeight: '1.4' }}>
                  {activeRequest.description}
                </div>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Change Request Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px' }}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '6px', fontSize: '13px' }}>
                  Update Ticket Status
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminRequests;
