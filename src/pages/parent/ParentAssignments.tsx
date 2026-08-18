import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentAssignments: React.FC = () => {
  const linkedStudents = getParentLinkedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');

  const currentStudent: ParentLinkedStudent =
    linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  const pendingCount = currentStudent.assignments.filter((a) => a.status === 'Pending').length;
  const gradedCount = currentStudent.assignments.filter((a) => a.status === 'Graded').length;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Assignments</span>
            </div>
            <h1 className="module-title">Student Homework & Coursework</h1>
            <p className="module-subtitle">
              Monitor academic task submission timelines, evaluated marks, and instructor feedback for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-asg-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-asg-student"
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
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.assignments.length} Tasks</span>
              <span className="stat-label">Assigned Coursework</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{gradedCount} Tasks</span>
              <span className="stat-label">Graded by Instructors</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{pendingCount} Tasks</span>
              <span className="stat-label">Pending Submission</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">91.5 / 100</span>
              <span className="stat-label">Average Assignment Score</span>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Coursework Status & Feedback Ledger</h3>
              <p className="c1-card-subtitle">Active and evaluated academic assignments</p>
            </div>
            <span className="c1-badge c1-badge-cyan">{currentStudent.semester}</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Assignment Title</th>
                  <th>Assigned Date</th>
                  <th>Submission Due Date</th>
                  <th>Status</th>
                  <th>Marks Awarded</th>
                  <th>Instructor Feedback</th>
                </tr>
              </thead>
              <tbody>
                {currentStudent.assignments.map((a) => (
                  <tr key={a.id}>
                    <td><span className="course-code-tag">{a.courseCode}</span></td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{a.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.courseName}</div>
                    </td>
                    <td>{a.assignedDate}</td>
                    <td><strong>{a.dueDate}</strong></td>
                    <td>
                      {a.status === 'Graded' ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Graded
                        </span>
                      ) : a.status === 'Submitted' ? (
                        <span className="c1-badge c1-badge-cyan">Submitted</span>
                      ) : (
                        <span className="c1-badge c1-badge-warning">
                          <i className="fa-solid fa-clock"></i> Due Soon
                        </span>
                      )}
                    </td>
                    <td>
                      {a.marks !== null ? (
                        <strong style={{ color: '#38bdf8' }}>{a.marks} / {a.maxMarks}</strong>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {a.feedback || 'Awaiting instructor evaluation.'}
                      </span>
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

export default ParentAssignments;
