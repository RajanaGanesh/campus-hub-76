import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CampusMobility: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Campus Mobility</h1>
        <p>Dashboard for all hostel, mess dining, and bus tracking mobility controls.</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '16px', color: 'white' }}>Quick Action Items</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {[
            { title: 'View Hostel Room', icon: 'fa-hotel', path: '/hostel', desc: 'Check assigned bed, roommate details and amenities.' },
            { title: 'View Mess Menu', icon: 'fa-utensils', path: '/hostel/mess', desc: 'Browse Breakfast, Lunch, and Dinner meal items.' },
            { title: 'Track Shuttle Bus', icon: 'fa-location-dot', path: '/transport', desc: 'Open live bus tracking map simulator.' },
            { title: 'View Transport Pass', icon: 'fa-qrcode', path: '/transport', desc: 'Open digital transit pass details.' },
            { title: 'Hostel Requests', icon: 'fa-screwdriver-wrench', path: '/hostel/requests', desc: 'Check status of lodging complaints.' }
          ].map((act, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-card-btn"
              onClick={() => navigate(act.path)}
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease-in-out',
                height: '100%'
              }}
            >
              <i className={`fa-solid ${act.icon}`} style={{ fontSize: '20px', color: 'var(--accent-primary)', marginBottom: '4px' }}></i>
              <span style={{ fontSize: '12.5px', fontWeight: '800' }}>{act.title}</span>
              <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{act.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summaries Panels split layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Hostel card */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Lodging Summary</h3>
              <i className="fa-solid fa-hotel" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <div>Assigned Block: <strong style={{ color: 'white' }}>Krishna B Block</strong></div>
              <div>Room: <strong style={{ color: 'white' }}>B-204 (4 Sharing)</strong></div>
              <div>Bed Number: <strong style={{ color: 'white' }}>Bed 3</strong></div>
            </div>
          </div>
          <button
            type="button"
            className="btn-view-all"
            style={{ marginTop: '18px', border: '1px solid var(--accent-primary)', color: 'white' }}
            onClick={() => navigate('/hostel')}
          >
            Manage Lodging
          </button>
        </div>

        {/* Mess card */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Dining Summary</h3>
              <i className="fa-solid fa-utensils" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <div>Today's Day: <strong style={{ color: 'white' }}>Monday</strong></div>
              <div>Next Meal: <strong style={{ color: 'white' }}>Dinner (Roti, Paneer butter)</strong></div>
              <div>Mess Status: <span className="subject-att-status safe" style={{ fontSize: '9px' }}>ACTIVE MEMBER</span></div>
            </div>
          </div>
          <button
            type="button"
            className="btn-view-all"
            style={{ marginTop: '18px', border: '1px solid var(--accent-primary)', color: 'white' }}
            onClick={() => navigate('/hostel/mess')}
          >
            View Dining Menu
          </button>
        </div>

        {/* Transport card */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Transit Summary</h3>
              <i className="fa-solid fa-bus" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
              <div>Assigned Route: <strong style={{ color: 'white' }}>Route 12 (Miyapur)</strong></div>
              <div>Scheduled Pickup: <strong style={{ color: 'white' }}>8:05 AM</strong></div>
              <div>Pass Validity: <strong style={{ color: '#00d89a' }}>Pass Active</strong></div>
            </div>
          </div>
          <button
            type="button"
            className="btn-view-all"
            style={{ marginTop: '18px', border: '1px solid var(--accent-primary)', color: 'white' }}
            onClick={() => navigate('/transport')}
          >
            Manage Transit
          </button>
        </div>
      </div>
    </div>
  );
};
export default CampusMobility;
