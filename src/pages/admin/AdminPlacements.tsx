import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminPlacements: React.FC = () => {
  const navigate = useNavigate();

  // Mock Placement Stats
  const placementRate = 82;
  const companiesCount = 18;
  const opportunitiesCount = 36;
  const applicationsCount = 148;
  const selectedCount = 92;

  const demoCompanies = [
    { name: 'TechNova Solutions', jobs: 3, hires: 12, contact: 'recruitment@technova.com', status: 'Active' },
    { name: 'Quantum Leap Labs', jobs: 2, hires: 8, contact: 'hr@quantumlabs.io', status: 'Active' },
    { name: 'Apex Systems Inc.', jobs: 4, hires: 15, contact: 'careers@apexsys.com', status: 'Active' },
    { name: 'Microsoft Corporation', jobs: 1, hires: 4, contact: 'ur-hiring@microsoft.com', status: 'Active' },
    { name: 'Google Cloud Services', jobs: 2, hires: 3, contact: 'campus@google.com', status: 'Active' }
  ];

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
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Placements Overview</span>
      </div>

      <div className="dashboard-header">
        <h1>Placement & Career Management</h1>
        <p>Monitor company drives, registered job opportunities, selection rates, and recruiter contacts.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Partner Companies</div>
          <div className="stat-card-value" style={{ marginTop: '4px' }}>{companiesCount}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-highlight)' }}>Job Roles</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--accent-highlight)' }}>{opportunitiesCount}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#ffb236' }}>Total Applications</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#ffb236' }}>{applicationsCount}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Placed Students</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>{selectedCount}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Placement Rate</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>{placementRate}%</div>
        </div>
      </div>

      {/* Grid: Companies list on left, selection rate progress on right */}
      <div className="dashboard-main-grid">
        {/* Companies list */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Registered Recruiting Companies</h3>
            <i className="fa-solid fa-building" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>Company Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Active Jobs</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Recruits Hired</th>
                  <th style={{ padding: '10px 12px' }}>Contact email</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {demoCompanies.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '700' }}>{c.name}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: 'var(--accent-highlight)' }}>{c.jobs}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#00d89a' }}>{c.hires}</td>
                    <td style={{ padding: '10px 12px' }}>{c.contact}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span className="subject-att-status good" style={{ fontSize: '8.5px' }}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic selection pipeline progress */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Selection Funnel Pipeline</h3>
            <i className="fa-solid fa-chart-simple" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { step: 'Applied', val: 148, total: 148, color: 'var(--accent-primary)' },
              { step: 'Shortlisted', val: 110, total: 148, color: 'var(--accent-highlight)' },
              { step: 'Interviewed', val: 95, total: 148, color: '#ffb236' },
              { step: 'Selected', val: 92, total: 148, color: '#00d89a' }
            ].map((f, idx) => {
              const rate = Math.round((f.val / f.total) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'white', fontWeight: '700' }}>{f.step}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{f.val} ({rate}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rate}%`, height: '100%', background: f.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminPlacements;
