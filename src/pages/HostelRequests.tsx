import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mobilityData, HostelRequest } from '../data/mobilityData';

export const HostelRequests: React.FC = () => {
  const navigate = useNavigate();

  // Load requests from localStorage
  const [requests, setRequests] = useState<HostelRequest[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_hostel_requests');
      return stored ? JSON.parse(stored) : mobilityData.requests;
    } catch {
      return mobilityData.requests;
    }
  });

  // Active details modal
  const [selectedRequest, setSelectedRequest] = useState<HostelRequest | null>(null);

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

  const handleCancelRequest = (reqId: string) => {
    const updated = requests.filter((r) => r.id !== reqId);
    setRequests(updated);
    localStorage.setItem('campushub_hostel_requests', JSON.stringify(updated));
    setSelectedRequest(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/hostel')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Hostel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Campus Life / Hostel Requests</span>
      </div>

      <div className="dashboard-header">
        <h1>My Hostel Requests</h1>
        <p>View your submitted hostel service requests, support tickets and leaves history.</p>
      </div>

      {/* Requests cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {requests.length > 0 ? (
          requests.map((req) => (
            <div
              key={req.id}
              className="card-panel"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '20px' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{req.id}</span>
                  <span className={getStatusClass(req.status)} style={{ fontSize: '9px' }}>{req.status}</span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{req.type}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Subject: {req.subject}</span>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '12px' }}>
                  <div>Created Date: <strong style={{ color: 'white' }}>{req.createdDate}</strong></div>
                  <div>Last Updated: <strong style={{ color: 'white' }}>{req.lastUpdated}</strong></div>
                  <div>Priority:{' '}
                    <strong style={{ color: req.priority === 'High' ? 'var(--color-error)' : req.priority === 'Medium' ? '#ffb236' : '#00d89a' }}>
                      {req.priority}
                    </strong>
                  </div>
                  {req.assignedTo && <div>Assigned To: <strong style={{ color: 'white' }}>{req.assignedTo}</strong></div>}
                </div>
              </div>

              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '18px', border: '1px solid var(--accent-primary)', color: 'white' }}
                onClick={() => setSelectedRequest(req)}
              >
                View Timeline Details
              </button>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No hostel requests</h3>
            <p style={{ fontSize: '12.5px' }}>File complaints or leave applications on the Hostel page to see them here.</p>
          </div>
        )}
      </div>

      {/* Details Timeline Modal */}
      {selectedRequest && (
        <div className="search-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>{selectedRequest.id} Timeline</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{selectedRequest.type}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setSelectedRequest(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Subject: <strong style={{ color: 'white' }}>{selectedRequest.subject}</strong></div>
                <div>Created: <strong style={{ color: 'white' }}>{selectedRequest.createdDate}</strong></div>
                <div>Priority: <strong style={{ color: 'white' }}>{selectedRequest.priority}</strong></div>
                <div>Status: <span className={getStatusClass(selectedRequest.status)}>{selectedRequest.status}</span></div>
                {selectedRequest.assignedTo && <div>Assigned Tech: <strong style={{ color: 'white' }}>{selectedRequest.assignedTo}</strong></div>}
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '6px' }}>Description</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedRequest.description}</p>
              </div>

              {/* Vertical Timeline */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '14px' }}>Ticket Event Milestones</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '9px', top: '4px', bottom: '4px', width: '2px', background: 'rgba(255,255,255,0.04)', zIndex: 1 }} />

                  {selectedRequest.timeline.map((evt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 2, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: idx === selectedRequest.timeline.length - 1 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                          border: '2px solid var(--border-color)',
                          boxShadow: idx === selectedRequest.timeline.length - 1 ? '0 0 10px rgba(124,92,255,0.4)' : 'none'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'white' }}>{evt.statusText}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{evt.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Button only for Submitted requests */}
              {selectedRequest.status === 'Submitted' && (
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ width: '100%', height: '38px', marginTop: '10px', background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={() => handleCancelRequest(selectedRequest.id)}
                >
                  Withdraw Complaint
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HostelRequests;
