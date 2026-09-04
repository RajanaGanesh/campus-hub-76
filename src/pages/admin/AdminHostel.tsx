import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export const AdminHostel: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const blocks = [
    { code: 'Block A', name: 'Boys Senior Hostel (Block A)', rooms: 100, occupied: 94, vacant: 4, maintenance: 2, warden: 'Mr. K. Sharma (+91 98765 11111)' },
    { code: 'Block B', name: 'Boys Junior Hostel (Block B)', rooms: 100, occupied: 92, vacant: 6, maintenance: 2, warden: 'Mr. R. Varma (+91 98765 22222)' },
    { code: 'Block C', name: 'Girls Senior Hostel (Block C)', rooms: 100, occupied: 96, vacant: 2, maintenance: 2, warden: 'Dr. Sunita Rao (+91 98765 33333)' },
    { code: 'Block D', name: 'Girls Junior Hostel (Block D)', rooms: 100, occupied: 78, vacant: 20, maintenance: 2, warden: 'Ms. Anita Nair (+91 98765 44444)' }
  ];

  const allocations = [
    { student: 'Aditya Sharma (236F1A0551)', block: 'Block A', room: 'Room A-204 (Double AC)', status: 'Active Occupant', joined: '15 Jul 2024' },
    { student: 'Rohan Gupta (236F1A0553)', block: 'Block A', room: 'Room A-204 (Double AC)', status: 'Active Occupant', joined: '15 Jul 2024' },
    { student: 'Sneha Patel (236F1A0552)', block: 'Block C', room: 'Room C-302 (Single Non-AC)', status: 'Active Occupant', joined: '18 Jul 2024' },
    { student: 'Pooja Reddy (236F1A0554)', block: 'Block C', room: 'Room C-108 (Double Non-AC)', status: 'Active Occupant', joined: '20 Jul 2024' }
  ];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Hostel Management</span>
            </div>
            <h1 className="module-title">Campus Hostel & Residency Management</h1>
            <p className="module-subtitle">
              Manage residential blocks, room allocations, warden contacts, maintenance requests, and occupant registries.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Room allotment allocation wizard initiated.', 'info')}
            >
              <i className="fa-solid fa-hotel"></i>
              <span>Allocate Room</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-hotel"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">400 Rooms</span>
              <span className="stat-label">Total Residential Rooms</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-bed"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>360 Occupied</span>
              <span className="stat-label">Resident Students (90%)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>32 Available</span>
              <span className="stat-label">Vacant Rooms</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>8 Rooms</span>
              <span className="stat-label">Under Maintenance</span>
            </div>
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="faculty-courses-full-grid" style={{ marginBottom: '24px' }}>
          {blocks.map((b) => (
            <div key={b.code} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div>
                  <span className="course-code-tag">{b.code}</span>
                  <h3 className="course-title-text">{b.name}</h3>
                  <span className="course-dept-text">Warden: {b.warden}</span>
                </div>
                <span className="c1-badge c1-badge-cyan">{b.occupied} / {b.rooms} Beds</span>
              </div>

              <div className="course-info-grid-compact">
                <div className="c-info-cell">
                  <i className="fa-solid fa-bed"></i>
                  <span>Occupied: <strong>{b.occupied}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-door-open"></i>
                  <span>Vacant: <strong>{b.vacant}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-wrench"></i>
                  <span>Repairs: <strong>{b.maintenance}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-chart-pie"></i>
                  <span>Occupancy: <strong>{Math.round((b.occupied / b.rooms) * 100)}%</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Allocations Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Resident Student Room Ledger</h3>
              <p className="c1-card-subtitle">Active student room allocations and verification dates</p>
            </div>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Residential Block</th>
                  <th>Allotted Room</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((a) => (
                  <tr key={a.student}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{a.student}</strong></td>
                    <td><span className="course-code-tag">{a.block}</span></td>
                    <td><strong style={{ color: '#38bdf8' }}>{a.room}</strong></td>
                    <td>{a.joined}</td>
                    <td>
                      <span className="c1-badge c1-badge-success">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default AdminHostel;
