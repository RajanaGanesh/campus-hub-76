import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage the complete Campus Hub ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total Students', val: '2,450', icon: 'fa-users', color: 'primary' },
          { label: 'Total Faculty', val: '142', icon: 'fa-chalkboard-user', color: 'cyan' },
          { label: 'Active Courses', val: '86', icon: 'fa-book', color: 'warning' },
          { label: 'Attendance', val: '87%', icon: 'fa-user-check', color: 'green' },
          { label: 'Placement Rate', val: '82%', icon: 'fa-briefcase', color: 'green' },
          { label: 'Pending Requests', val: '34', icon: 'fa-clock', color: 'critical' }
        ].map((st, idx) => (
          <div key={idx} className="card-panel stat-card">
            <div className="stat-card-row">
              <div className={`stat-card-icon ${st.color}`}>
                <i className={`fa-solid ${st.icon}`}></i>
              </div>
            </div>
            <div className="stat-card-value">{st.val}</div>
            <div className="stat-card-desc">{st.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Charts & System Notifications */}
      <div className="dashboard-main-grid">
        {/* Charts & System Analytics */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Campus Performance Overview</h3>
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {/* Chart 1: Fee Collection vs Target */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fee Collection Overview</span>
              <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'white', marginTop: '4px', marginBottom: '12px' }}>Collected vs Pending</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Collected (85%)</span>
                    <strong style={{ color: '#00d89a' }}>₹2.45 Cr</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '85%', height: '100%', background: '#00d89a' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pending (15%)</span>
                    <strong style={{ color: 'var(--color-error)' }}>₹43.2 L</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', background: 'var(--color-error)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Hostel Occupancy */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hostel Capacity</span>
              <h4 style={{ fontSize: '16px', fontWeight: '900', color: 'white', marginTop: '4px', marginBottom: '12px' }}>Occupancy breakdown</h4>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <svg width="60" height="60" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray="90, 100" />
                </svg>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  <div>Total Rooms: <strong style={{ color: 'white' }}>200</strong></div>
                  <div>Occupied (90%): <strong style={{ color: 'var(--accent-highlight)' }}>180</strong></div>
                  <div>Available: <strong style={{ color: '#00d89a' }}>20</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Notifications Alert Center */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>System Administrator Alerts</h3>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { text: '34 service complaints pending review.', color: '#ffb236', icon: 'fa-screwdriver-wrench', path: '/admin/requests' },
              { text: '12 hostel requests require warden actions.', color: '#ffb236', icon: 'fa-hotel', path: '/admin/requests' },
              { text: 'Microsoft placement shortlist uploaded.', color: '#00d89a', icon: 'fa-briefcase', path: '/admin/placements' },
              { text: 'Bus Route 12 reported delayed by 15 mins.', color: 'var(--color-error)', icon: 'fa-bus', path: '/admin/transport' },
              { text: 'Fee collection deadline approaching: 24th Aug.', color: '#00d89a', icon: 'fa-wallet', path: '/admin/fees' }
            ].map((alert, idx) => (
              <div
                key={idx}
                className="timetable-item"
                style={{ padding: '12px 14px', gap: '12px', cursor: 'pointer' }}
                onClick={() => navigate(alert.path)}
              >
                <div style={{ color: alert.color, fontSize: '14px' }}>
                  <i className={`fa-solid ${alert.icon}`}></i>
                </div>
                <span style={{ fontSize: '12px', color: 'white' }}>{alert.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* AI Overview Alerts Row */}
      <div className="card-panel ai-insight-card" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(124,92,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-highlight)', fontSize: '20px' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Admin AI Assistant & System Insights
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5', maxWidth: '700px' }}>
                • <strong>Campus Tickets:</strong> 34 campus requests require attention.<br />
                • <strong>Hostel Occupancy:</strong> Hostel occupancy is currently 90%. Ganga girls block has 8 available rooms.<br />
                • <strong>Shuttle Mobility:</strong> 12 transport routes are active. Route 12 Miyapur bus is currently delayed.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-ai-ask"
            style={{ width: 'auto', padding: '0 18px', height: '36px', margin: 0, fontSize: '12px' }}
            onClick={() => navigate('/assistant')}
          >
            Consult Admin AI
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
