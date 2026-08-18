import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData } from '../../data/managementData';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const mgmt = getManagementData();

  const totalStudents = mgmt.students.length * 20; // 1,240 students campus-wide
  const totalFaculty = mgmt.faculty.length * 14; // 84 faculty
  const totalCourses = mgmt.courses.length * 8; // 48 active courses

  // Department distribution
  const deptStats = [
    { code: 'CSE', name: 'Computer Science & Engineering', students: 360, faculty: 24, percent: 29 },
    { code: 'ECE', name: 'Electronics & Communication', students: 280, faculty: 18, percent: 23 },
    { code: 'IT', name: 'Information Technology', students: 220, faculty: 14, percent: 18 },
    { code: 'AI&DS', name: 'Artificial Intelligence & Data Science', students: 160, faculty: 12, percent: 13 },
    { code: 'MECH', name: 'Mechanical Engineering', students: 120, faculty: 10, percent: 10 },
    { code: 'CIVIL', name: 'Civil Engineering', students: 100, faculty: 6, percent: 7 }
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
              <span className="crumb-current">Central Dashboard</span>
            </div>
            <h1 className="module-title">Welcome back, Administrator</h1>
            <p className="module-subtitle">
              Monitor and manage your entire campus operations, academics, admissions, services, and finances from one place.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => navigate('/admin/reports')}
            >
              <i className="fa-solid fa-file-chart-column"></i>
              <span>Campus Reports</span>
            </button>
          </div>
        </div>

        {/* 8 Statistics Cards */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/students')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalStudents}</span>
              <span className="stat-label">Total Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/faculty')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalFaculty}</span>
              <span className="stat-label">Faculty Members</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/courses')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalCourses}</span>
              <span className="stat-label">Active Courses</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/departments')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-building-columns"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">8 Depts</span>
              <span className="stat-label">Active Departments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/attendance')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#60a5fa' }}>86.4%</span>
              <span className="stat-label">Campus Attendance Rate</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/fees')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>₹1.84 Cr</span>
              <span className="stat-label">Fees Realized (92%)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/placements')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">142 Offers</span>
              <span className="stat-label">Career Placements</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/admin/notifications')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-bell"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>14 Alerts</span>
              <span className="stat-label">Pending Service Requests</span>
            </div>
          </div>
        </div>

        {/* Analytics Section & Quick Actions Grid */}
        <div className="hostel-overview-grid" style={{ gridTemplateColumns: '1.7fr 1fr' }}>
          {/* Department Distribution Analytics */}
          <div className="c1-card faculty-today-classes-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Campus Enrollment by Academic Department</h3>
                <p className="c1-card-subtitle">Active student capacity and faculty ratio per engineering discipline</p>
              </div>
              <span className="c1-badge c1-badge-cyan">Term 2025–2026</span>
            </div>

            <div className="dept-distribution-stack" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              {deptStats.map((dept) => (
                <div key={dept.code} className="dept-stat-node" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="course-code-tag">{dept.code}</span>
                      <strong style={{ fontSize: '0.875rem', color: '#ffffff' }}>{dept.name}</strong>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <strong>{dept.students}</strong> Students • <strong>{dept.faculty}</strong> Faculty
                    </span>
                  </div>
                  <div className="progress-bar-large-track">
                    <div className="progress-bar-large-fill" style={{ width: `${dept.percent * 3}%`, background: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 100%)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="c1-card faculty-quick-actions-card">
            <h3 className="c1-card-title">Admin Operations</h3>
            <p className="c1-card-subtitle">Instant triggers for campus administration</p>

            <div className="faculty-shortcuts-grid">
              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/students')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <span>Add Student</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/faculty')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <span>Add Faculty</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/courses')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <i className="fa-solid fa-book-medical"></i>
                </div>
                <span>Create Course</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/notices')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <span>Publish Notice</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/exams')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <span>Schedule Exam</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/admin/placements')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <span>Add Placement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Financial & Campus Services Snapshot */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="c1-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Hostel Occupancy</h4>
              <span className="c1-badge c1-badge-cyan">90% Full</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>360 of 400</strong> rooms occupied across 4 blocks (Boys & Girls).
            </p>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
              onClick={() => navigate('/admin/hostel')}
            >
              Manage Hostels
            </button>
          </div>

          <div className="c1-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Campus Transport</h4>
              <span className="c1-badge c1-badge-success">16 Buses</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>540 students</strong> commuting on 8 designated city routes.
            </p>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
              onClick={() => navigate('/admin/transport')}
            >
              Manage Fleet & Routes
            </button>
          </div>

          <div className="c1-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Central Library</h4>
              <span className="c1-badge c1-badge-purple">14,200 Titles</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <strong>1,240 books</strong> currently on loan with 84 overdue returns.
            </p>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{ width: '100%', marginTop: '12px', fontSize: '0.75rem' }}
              onClick={() => navigate('/admin/library')}
            >
              Library Inventory
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
