import React from 'react';
import { useNavigate } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Faculty Dashboard</h1>
        <p>Manage your courses, students, attendance and academic activities.</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="stat-card-value">124</div>
          <div className="stat-card-desc">Total Students</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-book"></i>
            </div>
          </div>
          <div className="stat-card-value">4</div>
          <div className="stat-card-desc">Active Courses</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon warning">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
          </div>
          <div className="stat-card-value">12</div>
          <div className="stat-card-desc">Pending Assignments</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value">86%</div>
          <div className="stat-card-desc">Attendance Average</div>
        </div>
      </div>

      {/* Main Grid: Today's Classes on left, Quick Actions on right */}
      <div className="dashboard-main-grid">
        {/* Today's Classes */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Today's Scheduled Classes</h3>
            <i className="fa-solid fa-clock" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { time: '09:00 AM', subject: 'Data Structures & Algorithms', sec: 'CSE-A', room: 'Room CSE-204', status: 'Completed', statusClass: 'subject-att-status good' },
              { time: '10:30 AM', subject: 'Database Management Systems', sec: 'CSE-B', room: 'Room CSE-202', status: 'Ongoing', statusClass: 'subject-att-status warning' },
              { time: '02:00 PM', subject: 'Computer Networks', sec: 'CSE-A', room: 'Room CSE-301', status: 'Upcoming', statusClass: 'subject-att-status info' }
            ].map((cls, idx) => (
              <div key={idx} className="timetable-item" style={{ padding: '16px', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', minWidth: '70px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Class Time</span>
                    <strong style={{ fontSize: '12.5px', color: 'white' }}>{cls.time}</strong>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'white', marginBottom: '2px' }}>{cls.subject}</h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Section: {cls.sec} • Room: {cls.room}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={cls.statusClass} style={{ fontSize: '9px' }}>{cls.status}</span>
                  {cls.status === 'Ongoing' && (
                    <button
                      type="button"
                      className="btn-signin"
                      style={{ height: '30px', margin: 0, fontSize: '11px', padding: '0 12px', width: 'auto' }}
                      onClick={() => navigate('/faculty/attendance')}
                    >
                      Roll Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Faculty Operations</h3>
            <i className="fa-solid fa-gears" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Take Attendance', icon: 'fa-user-check', path: '/faculty/attendance' },
              { label: 'Create Assignment', icon: 'fa-file-signature', path: '/faculty/assignments' },
              { label: 'Upload Material', icon: 'fa-file-arrow-up', path: '/faculty/courses' },
              { label: 'Enter Marks', icon: 'fa-award', path: '/faculty/exams' },
              { label: 'View Students', icon: 'fa-users', path: '/faculty/students' },
              { label: 'Manage Courses', icon: 'fa-book-open', path: '/faculty/courses' },
              { label: 'Send Announcement', icon: 'fa-bullhorn', path: '/faculty/announcements' },
              { label: 'View Timetable', icon: 'fa-calendar-days', path: '/faculty' }
            ].map((op, idx) => (
              <button
                key={idx}
                type="button"
                className="btn-sso"
                onClick={() => handleQuickAction(op.path)}
                style={{
                  height: '70px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  padding: '6px',
                  margin: 0,
                  background: 'rgba(255,255,255,0.01)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '8px'
                }}
              >
                <i className={`fa-solid ${op.icon}`} style={{ fontSize: '16px', color: 'var(--accent-primary)' }}></i>
                <span>{op.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* AI Insights & Assistant Alerts Row */}
      <div className="card-panel ai-insight-card" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(124,92,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-highlight)', fontSize: '20px' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Faculty AI Assistant & Teaching Insights
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5', maxWidth: '700px' }}>
                • <strong>Grading Dues:</strong> 12 assignment submissions are pending review in "Binary Tree Implementation" (CSE-301 Section A).<br />
                • <strong>Attendance Alerts:</strong> 2 classes (DBMS Section B) have student averages below the 75% threshold limit.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-ai-ask"
            style={{ width: 'auto', padding: '0 18px', height: '36px', margin: 0, fontSize: '12px' }}
            onClick={() => navigate('/assistant')}
          >
            Consult Faculty AI
          </button>
        </div>
      </div>
    </div>
  );
};
export default FacultyDashboard;
