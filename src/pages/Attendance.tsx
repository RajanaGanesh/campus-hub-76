import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicData, AttendanceSubjectDetail } from '../data/academicData';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [data] = useState(academicData.attendance);
  const [history] = useState(academicData.attendanceHistory);

  // States for search, filter, sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Subject Name');

  // Modal State
  const [activeSubject, setActiveSubject] = useState<AttendanceSubjectDetail | null>(null);

  // History states
  const [histSubFilter, setHistSubFilter] = useState('All');
  const [histStatusFilter, setHistStatusFilter] = useState('All');

  // Configurable thresholds in code
  const CRITICAL_LIMIT = 75;
  const WARNING_LIMIT = 80;

  const getStatusText = (pct: number) => {
    if (pct < CRITICAL_LIMIT) return 'critical';
    if (pct < WARNING_LIMIT) return 'warning';
    return 'safe';
  };

  const getStatusBadge = (status: 'safe' | 'warning' | 'critical') => {
    return <span className={`subject-att-status ${status}`}>{status}</span>;
  };

  // Filtered and Sorted subjects
  const filteredSubjects = data.subjects
    .filter((sub) => {
      const matchSearch = sub.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || sub.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Subject Name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Highest Attendance') {
        return b.percentage - a.percentage;
      } else if (sortBy === 'Lowest Attendance') {
        return a.percentage - b.percentage;
      }
      return 0;
    });

  // Filtered History
  const filteredHistory = history.filter((log) => {
    const matchSubject = histSubFilter === 'All' || log.subject === histSubFilter;
    const matchStatus = histStatusFilter === 'All' || log.status === histStatusFilter;
    return matchSubject && matchStatus;
  });

  const overallStatus = getStatusText(data.overall);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Attendance</h1>
          <p>Track your attendance across all subjects.</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'white' }}>Student Name:</strong> {user?.name || 'Aditya Sharma'}</div>
          <div><strong style={{ color: 'white' }}>Student ID:</strong> 236F1A0551</div>
          <div><strong style={{ color: 'white' }}>Dept & Sec:</strong> Computer Science & Engineering • CSE-A</div>
        </div>
      </div>

      {/* Attendance Warnings Alert Banner */}
      {data.subjects.some((sub) => sub.percentage < WARNING_LIMIT) && (
        <div className="login-error-box" style={{ margin: 0 }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>
            <strong>Attendance Warning:</strong> Your attendance in{' '}
            {data.subjects
              .filter((sub) => sub.percentage < WARNING_LIMIT)
              .map((sub) => `${sub.name} (${sub.percentage}%)`)
              .join(', ')}{' '}
            is low. Please maintain regular attendance to stay above the 75% threshold.
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

      {/* Main Subjects Table & Filters */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <h3>Subject-wise Attendance</h3>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
              <input
                type="text"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 12px 6px 28px',
                  fontSize: '12px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="All">All Statuses</option>
              <option value="Safe">Safe</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="Subject Name">Sort: Subject Name</option>
              <option value="Highest Attendance">Sort: Highest Attendance</option>
              <option value="Lowest Attendance">Sort: Lowest Attendance</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Subject</th>
                <th style={{ padding: '12px' }}>Faculty</th>
                <th style={{ padding: '12px' }}>Total Classes</th>
                <th style={{ padding: '12px' }}>Present</th>
                <th style={{ padding: '12px' }}>Absent</th>
                <th style={{ padding: '12px' }}>Percentage</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{sub.name}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{sub.faculty}</td>
                    <td style={{ padding: '12px' }}>{sub.total}</td>
                    <td style={{ padding: '12px', color: '#00d89a' }}>{sub.present}</td>
                    <td style={{ padding: '12px', color: 'var(--color-error)' }}>{sub.absent}</td>
                    <td style={{ padding: '12px', fontWeight: '700' }}>{sub.percentage}%</td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(sub.status)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{ padding: '4px 10px', fontSize: '11px', margin: 0 }}
                        onClick={() => setActiveSubject(sub)}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textRendering: 'optimizeLegibility', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No attendance records available matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Visual Charts Grid */}
      <div className="dashboard-main-grid">
        {/* Custom SVG Bar Chart - Subject-wise */}
        <div className="card-panel">
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Subject-wise Attendance Chart</h3>
            <i className="fa-solid fa-chart-simple" style={{ color: 'var(--text-secondary)' }}></i>
          </div>
          
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
              {/* Gridlines */}
              {[25, 50, 75, 100].map((val) => {
                const x = 50 + (val / 100) * 400;
                return (
                  <g key={val}>
                    <line x1={x} y1="20" x2={x} y2="150" stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
                    <text x={x} y="165" fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{val}%</text>
                  </g>
                );
              })}

              {data.subjects.map((sub, idx) => {
                const y = 25 + idx * 25;
                const widthVal = (sub.percentage / 100) * 400;
                const barColor = sub.status === 'safe' ? '#00d89a' : sub.status === 'warning' ? '#ffb236' : 'var(--color-error)';
                
                return (
                  <g key={sub.id}>
                    {/* Subject code abbreviation */}
                    <text x="40" y={y + 10} fill="var(--text-secondary)" fontSize="9.5" textAnchor="end" fontWeight="600">
                      {sub.name.split(' ').map((w) => w[0]).join('')}
                    </text>
                    {/* Bar background */}
                    <rect x="50" y={y} width="400" height="12" fill="rgba(255,255,255,0.01)" rx="3" />
                    {/* Bar value */}
                    <rect x="50" y={y} width={widthVal} height="12" fill={barColor} rx="3" />
                    {/* Text value tag */}
                    <text x={55 + widthVal} y={y + 10} fill="white" fontSize="9" fontWeight="700">{sub.percentage}%</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

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
              {/* Jan 80%, Feb 82%, Mar 85%, Apr 83%, May 86%, Jun 86% */}
              {/* Points: Jan (40, 78), Feb (128, 73.2), Mar (216, 66), Apr (304, 70.8), May (392, 63.6), Jun (480, 63.6) */}
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
              value={histSubFilter}
              onChange={(e) => setHistSubFilter(e.target.value)}
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
              <option value="All">All Subjects</option>
              {data.subjects.map((sub) => (
                <option key={sub.id} value={sub.name}>{sub.name}</option>
              ))}
            </select>

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
                <th style={{ padding: '12px' }}>Subject Name</th>
                <th style={{ padding: '12px' }}>Class Time</th>
                <th style={{ padding: '12px' }}>Faculty</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{log.date}</td>
                    <td style={{ padding: '12px', color: 'white' }}>{log.subject}</td>
                    <td style={{ padding: '12px' }}>{log.time}</td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.faculty}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`subject-att-status ${log.status === 'Present' ? 'safe' : 'critical'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No matching activity logs in registry memory cache.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject details Modal */}
      {activeSubject && (
        <div className="search-modal-overlay" onClick={() => setActiveSubject(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '18px' }}>{activeSubject.name}</h2>
              <button type="button" className="btn-search-close" onClick={() => setActiveSubject(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '340px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Faculty:</span> <strong style={{ color: 'white' }}>{activeSubject.faculty}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Overall:</span> <strong style={{ color: 'white' }}>{activeSubject.percentage}%</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Total Classes:</span> <strong style={{ color: 'white' }}>{activeSubject.total}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Present:</span> <strong style={{ color: '#00d89a' }}>{activeSubject.present}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Absent:</span> <strong style={{ color: 'var(--color-error)' }}>{activeSubject.absent}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> {getStatusBadge(activeSubject.status)}</div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>Logs Timeline</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {history
                    .filter((log) => log.subject === activeSubject.name)
                    .map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12.5px' }}>
                        <span>{log.date} ({log.time})</span>
                        <span style={{ fontWeight: '700', color: log.status === 'Present' ? '#00d89a' : 'var(--color-error)' }}>{log.status}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Attendance;
