import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicData } from '../data/academicData';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [data] = useState(academicData.attendance);
  const [history] = useState(academicData.attendanceHistory);

  // General history status filter
  const [histStatusFilter, setHistStatusFilter] = useState('All');

  // Configurable thresholds
  const CRITICAL_LIMIT = 75;
  const WARNING_LIMIT = 80;

  const getStatusText = (pct: number) => {
    if (pct < CRITICAL_LIMIT) return 'critical';
    if (pct < WARNING_LIMIT) return 'warning';
    return 'safe';
  };

  // Filtered History (overall log feed)
  const filteredHistory = history.filter((log) => {
    const matchStatus = histStatusFilter === 'All' || log.status === histStatusFilter;
    return matchStatus;
  });

  const overallStatus = getStatusText(data.overall);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Attendance</h1>
          <p>Track your academic attendance metrics.</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'white' }}>Student Name:</strong> {user?.name || 'Aditya Sharma'}</div>
          <div><strong style={{ color: 'white' }}>Student ID:</strong> 236F1A0551</div>
          <div><strong style={{ color: 'white' }}>Dept & Sec:</strong> Computer Science & Engineering • CSE-A</div>
        </div>
      </div>

      {/* Attendance Warnings Alert Banner */}
      {data.overall < WARNING_LIMIT && (
        <div className="login-error-box" style={{ margin: 0 }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>
            <strong>Attendance Warning:</strong> Your overall attendance is {data.overall}%, which is close to or below the minimum requirement. Please maintain regular attendance to stay above the 75% threshold.
          </span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-user-check"></i>
            </div>
            <span className={`stat-card-trend ${overallStatus}`}>
              {overallStatus === 'safe' ? 'Good' : overallStatus === 'warning' ? 'Warning' : 'Critical'}
            </span>
          </div>
          <div className="stat-card-value">{data.overall}%</div>
          <div className="stat-card-desc">Overall Attendance</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value">{data.presentCount}</div>
          <div className="stat-card-desc">Classes Present</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
          </div>
          <div className="stat-card-value">{data.absentCount}</div>
          <div className="stat-card-desc">Classes Absent</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-layer-group"></i>
            </div>
          </div>
          <div className="stat-card-value">{data.totalCount}</div>
          <div className="stat-card-desc">Total Classes Conducted</div>
        </div>
      </div>

      {/* Threshold Status summary card */}
      <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
        <div className="logo-badge" style={{ background: overallStatus === 'safe' ? '#00d89a' : overallStatus === 'warning' ? '#ffb236' : 'var(--color-error)' }}>
          {data.overall}%
        </div>
        <div>
          <h3 style={{ textTransform: 'uppercase', fontSize: '14px', color: 'white' }}>
            {overallStatus === 'safe' ? 'Safe Attendance Status' : overallStatus === 'warning' ? 'Attendance Warning Alert' : 'Critical Attendance Limit'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {overallStatus === 'safe'
              ? 'You are currently above the minimum academic attendance requirement of 75%.'
              : 'Your attendance is approaching the critical academic threshold. Please attend classes regularly.'}
          </p>
        </div>
      </div>

      {/* Attendance Visual Charts Grid */}
      <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Custom SVG Line Chart - Monthly Trend */}
        <div className="card-panel">
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Monthly Attendance Trend</h3>
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-highlight)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent-highlight)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Y Gridlines */}
              {[60, 70, 80, 90, 100].map((val) => {
                const y = 150 - ((val - 50) / 50) * 120;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.03)" />
                    <text x="32" y={y + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end">{val}%</text>
                  </g>
                );
              })}

              {/* Monthly plots */}
              <path d="M 40,78 L 128,73.2 L 216,66 L 304,70.8 L 392,63.6 L 480,63.6 L 480,150 L 40,150 Z" fill="url(#trendGrad)" />
              <path d="M 40,78 L 128,73.2 L 216,66 L 304,70.8 L 392,63.6 L 480,63.6" fill="none" stroke="var(--accent-highlight)" strokeWidth="3" strokeLinecap="round" />

              {/* X Axis Months */}
              {[
                { label: 'Jan', x: 40 },
                { label: 'Feb', x: 128 },
                { label: 'Mar', x: 216 },
                { label: 'Apr', x: 304 },
                { label: 'May', x: 392 },
                { label: 'Jun', x: 480 }
              ].map((m) => (
                <text key={m.label} x={m.x} y="165" fill="var(--text-secondary)" fontSize="9.5" textAnchor="middle" fontWeight="600">{m.label}</text>
              ))}

              {/* Circles */}
              {[78, 73.2, 66, 70.8, 63.6, 63.6].map((y, idx) => {
                const x = 40 + idx * 88;
                return (
                  <circle key={idx} cx={x} cy={y} r="4" fill="#100f2e" stroke="var(--accent-highlight)" strokeWidth="2" />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Attendance Logs History Feed */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <h3>Attendance Logs History</h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={histStatusFilter}
              onChange={(e) => setHistStatusFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Logs</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Class Time</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{log.date}</td>
                    <td style={{ padding: '12px' }}>{log.time}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`subject-att-status ${log.status === 'Present' ? 'safe' : 'critical'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No matching activity logs in registry memory cache.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
