import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminHostel: React.FC = () => {
  const navigate = useNavigate();

  // Mock Hostel stats
  const hostels = [
    { name: 'Krishna Boys Hostel (A Block)', totalRooms: 100, occupied: 90, available: 10, maintenance: 0 },
    { name: 'Krishna Boys Hostel (B Block)', totalRooms: 100, occupied: 90, available: 10, maintenance: 0 },
    { name: 'Ganga Girls Hostel (A Block)', totalRooms: 120, occupied: 110, available: 8, maintenance: 2 },
    { name: 'Ganga Girls Hostel (B Block)', totalRooms: 80, occupied: 72, available: 6, maintenance: 2 }
  ];

  const totalRooms = hostels.reduce((acc, h) => acc + h.totalRooms, 0);
  const totalOccupied = hostels.reduce((acc, h) => acc + h.occupied, 0);
  const totalAvailable = hostels.reduce((acc, h) => acc + h.available, 0);
  const totalMaintenance = hostels.reduce((acc, h) => acc + h.maintenance, 0);
  const occupancyRate = Math.round((totalOccupied / totalRooms) * 100);

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
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Hostel Management</span>
      </div>

      <div className="dashboard-header">
        <h1>Hostel Management Overview</h1>
        <p>Monitor room allocation capacities, pending maintenance requests, and lodging occupancy ratios.</p>
      </div>

      {/* Stats summary */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Rooms</div>
          <div className="stat-card-value" style={{ marginTop: '4px' }}>{totalRooms}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Occupied</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>{totalOccupied}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#ffb236' }}>Available</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#ffb236' }}>{totalAvailable}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-error)' }}>Under Maintenance</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--color-error)' }}>{totalMaintenance}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-highlight)' }}>Occupancy Rate</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--accent-highlight)' }}>{occupancyRate}%</div>
        </div>
      </div>

      {/* Hostel Wise details list */}
      <div className="card-panel">
        <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Hostel-wise Blocks Capacity</h3>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Hostel Blocks</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Total Rooms</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Occupied</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Available</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Maintenance</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Occupancy Rate</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((h, idx) => {
                const rate = Math.round((h.occupied / h.totalRooms) * 100);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{h.name}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{h.totalRooms}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--accent-highlight)', fontWeight: '700' }}>{h.occupied}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#00d89a', fontWeight: '700' }}>{h.available}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: h.maintenance > 0 ? 'var(--color-error)' : 'var(--text-secondary)' }}>{h.maintenance}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminHostel;
