import React from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData } from '../../data/managementData';

export const AdminResults: React.FC = () => {
  const mgmt = getManagementData();

  const deptResults = [
    { dept: 'Artificial Intelligence & Data Science', avgGpa: '8.65', passPct: '98%', published: 'Completed' },
    { dept: 'Computer Science & Engineering', avgGpa: '8.54', passPct: '96%', published: 'Completed' },
    { dept: 'Information Technology', avgGpa: '8.40', passPct: '95%', published: 'Completed' },
    { dept: 'Electronics & Communication', avgGpa: '8.32', passPct: '93%', published: 'Completed' },
    { dept: 'Mechanical Engineering', avgGpa: '8.10', passPct: '91%', published: 'Completed' },
    { dept: 'Civil Engineering', avgGpa: '8.05', passPct: '90%', published: 'Completed' }
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
              <span className="crumb-current">Academic Results</span>
            </div>
            <h1 className="module-title">Academic Results & Performance Audit</h1>
            <p className="module-subtitle">
              Monitor university semester evaluations, GPA averages, pass rates, and grade sheet publication across branches.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">8.42 / 10</span>
              <span className="stat-label">Campus Average CGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>94.8%</span>
              <span className="stat-label">Overall Pass Percentage</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">68%</span>
              <span className="stat-label">First Class with Distinction</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>100%</span>
              <span className="stat-label">Results Published</span>
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Department Academic Performance Ledger</h3>
              <p className="c1-card-subtitle">Aggregated GPA performance and transcript release status</p>
            </div>
            <span className="c1-badge c1-badge-success">Semester 8 Audited</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Average CGPA</th>
                  <th>Pass Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deptResults.map((d) => (
                  <tr key={d.dept}>
                    <td><strong style={{ color: '#ffffff' }}>{d.dept}</strong></td>
                    <td><strong style={{ color: '#38bdf8' }}>{d.avgGpa} / 10.0</strong></td>
                    <td><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{d.passPct}</span></td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-check"></i> {d.published}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sample Student Marks Audit */}
        <div className="c1-card student-roster-card" style={{ marginTop: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Valuation Audit Log ({mgmt.examMarks.length} Evaluated)</h3>
              <p className="c1-card-subtitle">Verified candidate scores in core computing courses</p>
            </div>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Candidate</th>
                  <th>Subject</th>
                  <th>Internal (30)</th>
                  <th>Assessment (70)</th>
                  <th>Total (100)</th>
                </tr>
              </thead>
              <tbody>
                {mgmt.examMarks.map((m) => (
                  <tr key={m.studentId}>
                    <td><span className="course-code-cell">{m.studentId}</span></td>
                    <td><strong style={{ color: '#ffffff' }}>{m.studentName}</strong></td>
                    <td><span className="course-code-tag">{m.courseCode}</span></td>
                    <td>{m.internalMarks} / 30</td>
                    <td>{m.externalMarks} / 70</td>
                    <td><strong style={{ color: '#38bdf8' }}>{m.internalMarks + m.externalMarks} / 100</strong></td>
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

export default AdminResults;
