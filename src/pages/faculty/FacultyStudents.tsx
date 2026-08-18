import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, StudentRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';

export const FacultyStudents: React.FC = () => {
  const navigate = useNavigate();
  const mgmt = getManagementData();

  // Load students belonging to this faculty's cohort
  const [students] = useState<StudentRecord[]>(mgmt.students);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchSection = sectionFilter === 'All' || s.section === sectionFilter;

      return matchQuery && matchSection;
    });
  }, [students, searchQuery, sectionFilter]);

  const avgAttendance = Math.round(
    students.reduce((sum, s) => sum + s.attendancePercent, 0) / (students.length || 1)
  );
  const avgCgpa = (
    students.reduce((sum, s) => sum + s.cgpa, 0) / (students.length || 1)
  ).toFixed(2);

  const getPerformanceBadge = (perf: StudentRecord['performance']) => {
    switch (perf) {
      case 'Excellent':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-star"></i> Excellent</span>;
      case 'Good':
        return <span className="c1-badge c1-badge-cyan"><i className="fa-solid fa-circle-check"></i> Good</span>;
      case 'Needs Improvement':
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-triangle-exclamation"></i> Needs Attention</span>;
      default:
        return <span className="c1-badge c1-badge-purple">Average</span>;
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Enrolled Students Roster</span>
            </div>
            <h1 className="module-title">Student Cohorts & Academic Roster</h1>
            <p className="module-subtitle">
              Monitor candidate attendance records, assignment submission metrics, and individual student academic summaries.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => navigate('/faculty/attendance')}
            >
              <i className="fa-solid fa-clipboard-user"></i>
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{students.length}</span>
              <span className="stat-label">Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{avgAttendance}%</span>
              <span className="stat-label">Cohort Attendance Average</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{avgCgpa}</span>
              <span className="stat-label">Average Cohort CGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">92%</span>
              <span className="stat-label">Assignment Submission Rate</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search students by name, roll number (236F1A0551), or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="filters-row-wrap">
            <div className="filter-select-item">
              <label htmlFor="filter-student-section">Class Section</label>
              <select
                id="filter-student-section"
                className="c1-select"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="All">All Sections (A & B)</option>
                <option value="A">Section A (CSE-301 / 401)</option>
                <option value="B">Section B (CSE-302)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Class Cohort Roster ({filteredStudents.length} Students)</h3>
              <p className="c1-card-subtitle">Official candidate enrollment for B.Tech CSE IV Year</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Active Semester 8</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Section</th>
                  <th>Attendance</th>
                  <th>Assignments</th>
                  <th>CGPA</th>
                  <th>Academic Standing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td><span className="course-code-cell">{stu.id}</span></td>
                    <td>
                      <div>
                        <strong style={{ color: '#ffffff' }}>{stu.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="c1-badge c1-badge-purple">Section {stu.section}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            stu.attendancePercent >= 85
                              ? 'var(--color-success)'
                              : stu.attendancePercent >= 75
                              ? 'var(--accent-blue)'
                              : 'var(--color-error)'
                        }}
                      >
                        {stu.attendancePercent}%
                      </span>
                    </td>
                    <td>
                      <span>{stu.assignmentsCompleted} / 12</span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{stu.cgpa.toFixed(1)}</strong>
                    </td>
                    <td>{getPerformanceBadge(stu.performance)}</td>
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedStudent(stu)}
                      >
                        <i className="fa-solid fa-id-card"></i>
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL: STUDENT ACADEMIC PROFILE MODAL
            ============================================================ */}
        {selectedStudent && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedStudent(null)}
            title={`Student Academic Profile: ${selectedStudent.name}`}
            maxWidth="md"
          >
            <div className="student-profile-dialog-content">
              <div className="student-dialog-header">
                <div className="student-avatar-badge">
                  {selectedStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="stu-name">{selectedStudent.name}</h3>
                  <span className="stu-sub">
                    Roll No: <strong>{selectedStudent.id}</strong> • Department of {selectedStudent.department}
                  </span>
                </div>
              </div>

              <div className="student-profile-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Class Section:</span>
                  <span className="d-val">Section {selectedStudent.section} (B.Tech Year {selectedStudent.year})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Cumulative CGPA:</span>
                  <span className="d-val" style={{ color: '#38bdf8' }}>{selectedStudent.cgpa} / 10.0</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Attendance Percentage:</span>
                  <span className="d-val" style={{ color: selectedStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                    {selectedStudent.attendancePercent}% ({selectedStudent.attendancePercent >= 75 ? 'Satisfactory' : 'Low Attendance Alert'})
                  </span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Assignment Progress:</span>
                  <span className="d-val">{selectedStudent.assignmentsCompleted} of 12 Tasks Submitted</span>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close Profile
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    setSelectedStudent(null);
                    navigate('/faculty/results');
                  }}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Enter Student Marks</span>
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
};

export default FacultyStudents;
