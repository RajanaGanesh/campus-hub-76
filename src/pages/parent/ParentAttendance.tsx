import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentAttendance: React.FC = () => {
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
              <span className="crumb-current">Attendance Monitoring</span>
            </div>
            <h1 className="module-title">Student Attendance Logs</h1>
            <p className="module-subtitle">
              Detailed session-by-session roll call logs and percentage compliance for {currentStudent.name} ({currentStudent.id}).
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-att-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-att-student"
                  className="c1-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--accent-primary)', fontWeight: 700, color: '#ffffff' }}
                >
                  {linkedStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                {currentStudent.attendancePercent}%
              </span>
              <span className="stat-label">Overall Attendance Rate</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.totalClasses}</span>
              <span className="stat-label">Total Lectures Conducted</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>{currentStudent.attendedClasses}</span>
              <span className="stat-label">Lectures Attended</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>{currentStudent.absentClasses}</span>
              <span className="stat-label">Lectures Missed</span>
            </div>
          </div>
        </div>

        {/* Low Attendance Alert if < 75% */}
        {currentStudent.attendancePercent < 75 ? (
          <div className="c1-alert c1-alert-warning" style={{ marginBottom: '24px' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Low Attendance Notice:</strong> Overall attendance for {currentStudent.name} is currently {currentStudent.attendancePercent}%, which is below the university minimum threshold of 75%. Please contact the department advisor.
            </div>
          </div>
        ) : (
          <div className="c1-alert c1-alert-success" style={{ marginBottom: '24px' }}>
            <i className="fa-solid fa-circle-check"></i>
            <div>
              <strong>Satisfactory Attendance:</strong> Overall attendance for {currentStudent.name} ({currentStudent.attendancePercent}%) complies with university academic regulations.
            </div>
          </div>
        )}

        {/* Course-wise Attendance Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">{currentStudent.semester} Subject Attendance Matrix</h3>
              <p className="c1-card-subtitle">Official roll call verification by course instructors</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Verified by Faculty</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Subject</th>
                  <th>Course Instructor</th>
                  <th>Conducted</th>
                  <th>Attended</th>
                  <th>Missed</th>
                  <th>Percentage</th>
                  <th>Standing</th>
                </tr>
              </thead>
              <tbody>
                {currentStudent.courseAttendance.map((ca) => (
                  <tr key={ca.code}>
                    <td><span className="course-code-tag">{ca.code}</span></td>
                    <td><strong style={{ color: '#ffffff' }}>{ca.name}</strong></td>
                    <td>{ca.faculty}</td>
                    <td>{ca.conducted} Classes</td>
                    <td><strong style={{ color: '#34d399' }}>{ca.attended}</strong></td>
                    <td><strong style={{ color: '#fb7185' }}>{ca.absent}</strong></td>
                    <td>
                      <strong style={{ color: ca.percentage >= 75 ? '#34d399' : '#fb7185', fontSize: '0.9375rem' }}>
                        {ca.percentage}%
                      </strong>
                    </td>
                    <td>
                      {ca.percentage >= 85 ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Good
                        </span>
                      ) : ca.percentage >= 75 ? (
                        <span className="c1-badge c1-badge-cyan">
                          <i className="fa-solid fa-check"></i> Satisfactory
                        </span>
                      ) : (
                        <span className="c1-badge c1-badge-error">
                          <i className="fa-solid fa-triangle-exclamation"></i> Low Attendance
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentAttendance;
