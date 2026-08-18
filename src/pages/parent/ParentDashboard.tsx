import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const parentName = user?.name || 'Rajesh Sharma';

  const linkedStudents = getParentLinkedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');

  const currentStudent: ParentLinkedStudent =
    linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Dashboard</span>
            </div>
            <h1 className="module-title">Welcome back, {parentName}</h1>
            <p className="module-subtitle">
              Stay connected with your student's academic progress, attendance percentages, fees, and campus activities.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-parent-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-parent-student"
                  className="c1-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--accent-primary)', fontWeight: 700, color: '#ffffff' }}
                >
                  {linkedStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.id} • {stu.department.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Student Summary Card */}
        <div className="c1-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)'
                }}
              >
                {currentStudent.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>{currentStudent.name}</h2>
                  <span className="course-code-tag">{currentStudent.id}</span>
                  <span className="c1-badge c1-badge-success">{currentStudent.academicStanding} Standing</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {currentStudent.degree} • Year {currentStudent.year} ({currentStudent.semester}) • Section {currentStudent.section}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attendance</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: currentStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                  {currentStudent.attendancePercent}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Cumulative GPA</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                  {currentStudent.cgpa.toFixed(2)} / 10.0
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Statistics Cards */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/attendance')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                {currentStudent.attendancePercent}%
              </span>
              <span className="stat-label">Overall Attendance</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/assignments')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>
                {currentStudent.assignments.filter((a) => a.status === 'Pending').length}
              </span>
              <span className="stat-label">Pending Homework</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/exams')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.exams.length} Exams</span>
              <span className="stat-label">Scheduled Assessments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/academics')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>{currentStudent.cgpa.toFixed(2)}</span>
              <span className="stat-label">Current GPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/fees')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.feeDetails.status === 'Paid in Full' ? '#34d399' : '#fbbf24' }}>
                {currentStudent.feeDetails.pendingBalance === '₹0' ? 'Paid' : currentStudent.feeDetails.pendingBalance}
              </span>
              <span className="stat-label">Fee Balance</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/parent/notifications')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">3 Alerts</span>
              <span className="stat-label">Campus Activity Alerts</span>
            </div>
          </div>
        </div>

        {/* Quick Operations & Overview */}
        <div className="hostel-overview-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* Course Attendance Realization */}
          <div className="c1-card faculty-today-classes-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Subject Attendance Breakdown</h3>
                <p className="c1-card-subtitle">Verified roll call counts for {currentStudent.semester}</p>
              </div>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => navigate('/parent/attendance')}
              >
                <span>Full Logs</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {currentStudent.courseAttendance.map((ca) => (
                <div key={ca.code} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <div>
                      <span className="course-code-tag">{ca.code}</span>
                      <strong style={{ fontSize: '0.875rem', color: '#ffffff', marginLeft: '6px' }}>{ca.name}</strong>
                    </div>
                    <strong style={{ color: ca.percentage >= 75 ? '#34d399' : '#fb7185' }}>{ca.percentage}%</strong>
                  </div>
                  <div className="progress-bar-large-track">
                    <div className="progress-bar-large-fill" style={{ width: `${ca.percentage}%`, background: ca.percentage >= 75 ? 'var(--color-success)' : 'var(--color-error)' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span>Faculty: {ca.faculty}</span>
                    <span>{ca.attended} attended of {ca.conducted} classes ({ca.absent} missed)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Operations Shortcuts */}
          <div className="c1-card faculty-quick-actions-card">
            <h3 className="c1-card-title">Quick Shortcuts</h3>
            <p className="c1-card-subtitle">Instant access to student monitoring modules</p>

            <div className="faculty-shortcuts-grid">
              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/attendance')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <span>Attendance Logs</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/academics')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-award"></i>
                </div>
                <span>Exam Results</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/assignments')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-file-invoice"></i>
                </div>
                <span>Assignments</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/exams')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <span>Exam Timetable</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/fees')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-wallet"></i>
                </div>
                <span>Fee Receipts</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/parent/notices')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <span>Parent Notices</span>
              </button>
            </div>
          </div>
        </div>

        {/* Campus Services for Student */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {currentStudent.hostelInfo && (
            <div className="c1-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Hostel Residency</h4>
                <span className="c1-badge c1-badge-cyan">Resident</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {currentStudent.hostelInfo.block} • <strong>{currentStudent.hostelInfo.room}</strong>
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Warden: {currentStudent.hostelInfo.warden} ({currentStudent.hostelInfo.wardenPhone})
              </div>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
                onClick={() => navigate('/parent/hostel')}
              >
                Hostel Details
              </button>
            </div>
          )}

          <div className="c1-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Library Loans</h4>
              <span className="c1-badge c1-badge-purple">{currentStudent.libraryInfo.booksBorrowed} Books on Loan</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {currentStudent.libraryInfo.booksDueSoon > 0 ? (
                <span style={{ color: '#fbbf24' }}>1 book due for return this week.</span>
              ) : (
                <span style={{ color: '#34d399' }}>All borrowed books within due dates.</span>
              )}
            </p>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
              onClick={() => navigate('/parent/library')}
            >
              Library Status
            </button>
          </div>

          {currentStudent.placementInfo?.eligible && (
            <div className="c1-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Placement Offers</h4>
                <span className="c1-badge c1-badge-success">{currentStudent.placementInfo.offersCount} Offer Received</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>{currentStudent.placementInfo.latestOffer?.company}</strong>: {currentStudent.placementInfo.latestOffer?.packageStr} ({currentStudent.placementInfo.latestOffer?.role})
              </p>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
                onClick={() => navigate('/parent/placements')}
              >
                Placement Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentDashboard;
