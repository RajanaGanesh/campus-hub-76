import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, StudentRecord } from '../../data/managementData';
import { Toast } from '../../components/Toast';

export const AdminAttendance: React.FC = () => {
  const mgmt = getManagementData();

  // Filter low attendance candidates (< 75%)
  const [lowAttendanceList] = useState<StudentRecord[]>(() => {
    return mgmt.students.filter((s) => s.attendancePercent < 75);
  });

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const departmentRates = [
    { dept: 'Artificial Intelligence & Data Science', rate: 91, present: 145, absent: 15 },
    { dept: 'Computer Science & Engineering', rate: 88, present: 316, absent: 44 },
    { dept: 'Information Technology', rate: 87, present: 191, absent: 29 },
    { dept: 'Electronics & Communication', rate: 85, present: 238, absent: 42 },
    { dept: 'Mechanical Engineering', rate: 82, present: 98, absent: 22 },
    { dept: 'Civil Engineering', rate: 79, present: 79, absent: 21 }
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
              <span className="crumb-current">Attendance Overview</span>
            </div>
            <h1 className="module-title">Campus-Wide Attendance Overview</h1>
            <p className="module-subtitle">
              Institutional attendance analytics, branch percentages, daily roll-call aggregates, and low-attendance alert triggers.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Low-attendance warning emails dispatched to all registered guardians.', 'success')}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Broadcast Guardian Alerts</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#818cf8' }}>86.4%</span>
              <span className="stat-label">Institutional Attendance</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>1,072</span>
              <span className="stat-label">Students Present Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>168</span>
              <span className="stat-label">Students Absent Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{lowAttendanceList.length * 14}</span>
              <span className="stat-label">Below 75% Attendance</span>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="c1-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Department Attendance Realization</h3>
              <p className="c1-card-subtitle">Aggregated attendance percentages across engineering schools</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Daily Audit</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
            {departmentRates.map((d) => (
              <div key={d.dept} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{d.dept}</strong>
                  <strong style={{ color: d.rate >= 85 ? '#34d399' : d.rate >= 75 ? '#38bdf8' : '#fb7185' }}>{d.rate}%</strong>
                </div>
                <div className="progress-bar-large-track">
                  <div className="progress-bar-large-fill" style={{ width: `${d.rate}%`, background: d.rate >= 85 ? 'var(--color-success)' : 'var(--accent-primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>{d.present} Present</span>
                  <span>{d.absent} Absent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Student Alerts Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Low Attendance Alerts (&lt; 75% Threshold)</h3>
              <p className="c1-card-subtitle">Students requiring administrative academic counseling or guardian notice</p>
            </div>
            <span className="c1-badge c1-badge-error">Mandatory Attention</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Candidate</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mgmt.students.map((stu) => (
                  <tr key={stu.id}>
                    <td><span className="course-code-cell">{stu.id}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{stu.name}</strong>
                    </td>
                    <td>{stu.department}</td>
                    <td>Section {stu.section}</td>
                    <td>
                      <strong style={{ color: stu.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                        {stu.attendancePercent}%
                      </strong>
                    </td>
                    <td>
                      <span className={`c1-badge ${stu.attendancePercent >= 75 ? 'c1-badge-success' : 'c1-badge-error'}`}>
                        {stu.attendancePercent >= 75 ? 'Satisfactory' : 'Action Required'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => showToast(`Counseling notice sent to ${stu.name} (${stu.id}).`, 'info')}
                      >
                        <i className="fa-solid fa-envelope"></i>
                        <span>Send Notice</span>
                      </button>
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

export default AdminAttendance;
