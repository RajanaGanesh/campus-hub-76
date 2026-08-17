import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementsData, CareerApplication } from '../data/placementsData';

export const MyApplications: React.FC = () => {
  const navigate = useNavigate();

  // Load applications logs state
  const [apps, setApps] = useState<CareerApplication[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_apps');
      return stored ? JSON.parse(stored) : placementsData.applications;
    } catch {
      return placementsData.applications;
    }
  });

  // Modal timelines state
  const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(null);
  const [withdrawApp, setWithdrawApp] = useState<CareerApplication | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const getStatusClass = (status: CareerApplication['status']) => {
    switch (status) {
      case 'Selected':
        return 'subject-att-status safe';
      case 'Rejected':
      case 'Withdrawn':
        return 'subject-att-status critical';
      case 'Shortlisted':
      case 'Interview':
      case 'Assessment':
        return 'subject-att-status warning';
      case 'Applied':
      case 'Under Review':
      default:
        return 'subject-att-status good';
    }
  };

  const handleWithdrawClick = (app: CareerApplication) => {
    setWithdrawApp(app);
  };

  const handleConfirmWithdraw = () => {
    if (!withdrawApp) return;

    const nextApps = apps.map((a) => {
      if (a.id === withdrawApp.id) {
        return {
          ...a,
          status: 'Withdrawn' as const,
          nextStep: 'Withdrawn by student',
          timeline: [
            ...a.timeline,
            { date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' 12:00 PM', statusText: 'Application Withdrawn' }
          ]
        };
      }
      return a;
    });

    setApps(nextApps);
    localStorage.setItem('campushub_career_apps', JSON.stringify(nextApps));
    setWithdrawApp(null);
    setSelectedApp(null);
    setToastMsg('Application withdrawn successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Derive metrics
  const activeAppsCount = apps.length;
  const applicationsCount = activeAppsCount + 5; // Offset to 6
  const shortlistedCount = 2;
  const interviewsCount = 2;
  const selectedCount = 1;
  const rejectedCount = 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header toggles */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/placements')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Placements Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Careers / My Applications</span>
      </div>

      <div className="dashboard-header">
        <h1>My Applications</h1>
        <p>Track your active job applications, recruitment stages, and shortlist reviews.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Metrics Summaries Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        <div className="card-panel stat-card" style={{ padding: '16px' }}>
          <div className="stat-card-value" style={{ fontSize: '20px' }}>{applicationsCount}</div>
          <div className="stat-card-desc" style={{ fontSize: '11px' }}>Total Applications</div>
        </div>

        <div className="card-panel stat-card" style={{ padding: '16px' }}>
          <div className="stat-card-value" style={{ fontSize: '20px', color: '#ffb236' }}>{shortlistedCount}</div>
          <div className="stat-card-desc" style={{ fontSize: '11px' }}>Shortlisted</div>
        </div>

        <div className="card-panel stat-card" style={{ padding: '16px' }}>
          <div className="stat-card-value" style={{ fontSize: '20px', color: 'var(--accent-highlight)' }}>{interviewsCount}</div>
          <div className="stat-card-desc" style={{ fontSize: '11px' }}>Interviews</div>
        </div>

        <div className="card-panel stat-card" style={{ padding: '16px' }}>
          <div className="stat-card-value" style={{ fontSize: '20px', color: '#00d89a' }}>{selectedCount}</div>
          <div className="stat-card-desc" style={{ fontSize: '11px' }}>Selected</div>
        </div>

        <div className="card-panel stat-card" style={{ padding: '16px' }}>
          <div className="stat-card-value" style={{ fontSize: '20px', color: 'var(--color-error)' }}>{rejectedCount}</div>
          <div className="stat-card-desc" style={{ fontSize: '11px' }}>Rejected</div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Recruitment Status Logs</h3>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Company</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Applied Date</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Next Step</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'white' }}>{app.company}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{app.role}</td>
                  <td style={{ padding: '12px' }}>{app.appliedDate}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={getStatusClass(app.status)} style={{ fontSize: '9.5px' }}>{app.status}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px' }}>{app.nextStep || 'Waiting for recruiter'}</td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn-retry-err"
                      style={{ margin: 0, padding: '4px 10px', fontSize: '11.5px' }}
                      onClick={() => setSelectedApp(app)}
                    >
                      Timeline
                    </button>
                    {app.status !== 'Withdrawn' && app.status !== 'Rejected' && app.status !== 'Selected' && (
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{ margin: 0, padding: '4px 10px', fontSize: '11.5px', border: '1px solid var(--color-error)', color: 'var(--color-error)' }}
                        onClick={() => handleWithdrawClick(app)}
                      >
                        Withdraw
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No job applications logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline details modal overlay */}
      {selectedApp && (
        <div className="search-modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Application {selectedApp.id} Timeline</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{selectedApp.company}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setSelectedApp(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Role: <strong style={{ color: 'white' }}>{selectedApp.role}</strong></div>
                <div>Submitted Resume: <strong style={{ color: 'white' }}>{selectedApp.resumeName}</strong></div>
                <div>Current Stage: <span className={getStatusClass(selectedApp.status)}>{selectedApp.status}</span></div>
              </div>

              {/* Vertical timeline details */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '14px' }}>Selection Milestones</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '9px', top: '4px', bottom: '4px', width: '2px', background: 'rgba(255,255,255,0.04)', zIndex: 1 }} />

                  {selectedApp.timeline.map((evt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative', zIndex: 2, alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: idx === selectedApp.timeline.length - 1 ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                          border: '2px solid var(--border-color)',
                          boxShadow: idx === selectedApp.timeline.length - 1 ? '0 0 10px rgba(124,92,255,0.4)' : 'none'
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
            </div>
          </div>
        </div>
      )}

      {/* Withdraw confirmation modal overlay */}
      {withdrawApp && (
        <div className="search-modal-overlay" onClick={() => setWithdrawApp(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '16.5px' }}>Withdraw Application?</h2>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: 'white', lineHeight: '1.4' }}>
                Are you sure you want to withdraw your application for <strong>{withdrawApp.role}</strong> at <strong>{withdrawApp.company}</strong>?
                This action is irreversible and you will not be able to re-apply.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setWithdrawApp(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '38px', background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                  onClick={handleConfirmWithdraw}
                >
                  Yes, Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyApplications;
