import React from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData } from '../../data/managementData';

export const AdminAssignments: React.FC = () => {
  const mgmt = getManagementData();

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Assignments Overview</span>
            </div>
            <h1 className="module-title">Campus Assignments & Coursework Ledger</h1>
            <p className="module-subtitle">
              Monitor academic coursework submissions, evaluation rates, and faculty grading across all departments.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{mgmt.assignments.length * 7}</span>
              <span className="stat-label">Published Tasks</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-file-arrow-up"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,120</span>
              <span className="stat-label">Student Submissions</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>940</span>
              <span className="stat-label">Evaluated / Graded</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>180</span>
              <span className="stat-label">Pending Faculty Grading</span>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Campus-Wide Assignment Directory</h3>
              <p className="c1-card-subtitle">Active academic homework items across all courses</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Term 2025–2026</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Assignment Title</th>
                  <th>Course Name</th>
                  <th>Submission Deadline</th>
                  <th>Max Marks</th>
                  <th>Submissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mgmt.assignments.map((asg) => (
                  <tr key={asg.id}>
                    <td><span className="course-code-tag">{asg.courseCode}</span></td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{asg.title}</strong>
                    </td>
                    <td>{asg.courseName}</td>
                    <td><strong>{asg.dueDate}</strong></td>
                    <td>{asg.maxMarks} Marks</td>
                    <td>
                      <span className="c1-badge c1-badge-cyan">
                        <i className="fa-solid fa-users"></i> {asg.submissionsCount || 54} Submissions
                      </span>
                    </td>
                    <td>
                      <span className="c1-badge c1-badge-success">Active</span>
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

export default AdminAssignments;
