import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesData, ServiceRequest } from '../data/servicesData';

export const ServiceRequests: React.FC = () => {
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

  // Modal active state
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  const getStatusClass = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'subject-att-status safe'; // green
      case 'Under Review':
        return 'subject-att-status warning'; // yellow
      case 'Rejected':
        return 'subject-att-status critical'; // red
      case 'Submitted':
      default:
        return 'subject-att-status good'; // blue/purple
    }
  };

  const handleCancelRequest = (reqId: string) => {
    const updated = requests.filter((r) => r.id !== reqId);
    setRequests(updated);
    localStorage.setItem('campushub_service_requests', JSON.stringify(updated));
    setSelectedRequest(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Navigation */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/services')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Services
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Campus Services / My Requests</span>
      </div>

      <div className="dashboard-header">
        <h1>My Service Requests</h1>
        <p>View your submitted service requests, support tickets and certificate queries.</p>
      </div>

      {/* Requests Deck list */}
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
                  <span style={{ fontSize: '12px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{req.id}</span>
                  <span className={getStatusClass(req.status)} style={{ fontSize: '9px' }}>{req.status}</span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{req.serviceType}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Subject: {req.subject}</span>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px', marginTop: '12px' }}>
                  <div>Created Date: <strong style={{ color: 'white' }}>{req.createdDate}</strong></div>
                  <div>Last Updated: <strong style={{ color: 'white' }}>{req.lastUpdated}</strong></div>
                  <div>Priority:{' '}
                    <strong style={{ color: req.priority === 'High' ? 'var(--color-error)' : req.priority === 'Medium' ? '#ffb236' : '#00d89a' }}>
                      {req.priority}
                    </strong>
                  </div>
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
            <i className="fa-solid fa-receipt" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No service requests found</h3>
            <p style={{ fontSize: '12.5px' }}>Submit requests in the Campus Services catalog to get started.</p>
          </div>
        )}
      </div>

      {/* Timeline details modal overlay */}
      {selectedRequest && (
        <div className="search-modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>{selectedRequest.id} Details</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{selectedRequest.serviceType}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setSelectedRequest(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Subject:</span> <strong style={{ color: 'white' }}>{selectedRequest.subject}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Created:</span> <strong style={{ color: 'white' }}>{selectedRequest.createdDate}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Last Updated:</span> <strong style={{ color: 'white' }}>{selectedRequest.lastUpdated}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Priority:</span> <strong style={{ color: selectedRequest.priority === 'High' ? 'var(--color-error)' : 'white' }}>{selectedRequest.priority}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span className={getStatusClass(selectedRequest.status)}>{selectedRequest.status}</span></div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '6px' }}>Description</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedRequest.description}</p>
              </div>

              {/* Timeline widget */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '14px' }}>Processing Timeline</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  {/* Central Vertical Line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '9px',
                      top: '4px',
                      bottom: '4px',
                      width: '2px',
                      background: 'rgba(255,255,255,0.04)',
                      zIndex: 1
                    }}
                  />

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
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ServiceRequests;
