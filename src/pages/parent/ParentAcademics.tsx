import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentAcademics: React.FC = () => {
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
              <span className="crumb-current">Academic Performance</span>
            </div>
            <h1 className="module-title">Academic Performance & Transcripts</h1>
            <p className="module-subtitle">
              Verified university semester results, internal evaluation scores, and GPA credits for {currentStudent.name} ({currentStudent.id}).
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-acad-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-acad-student"
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
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>{currentStudent.academics.cumulativeGpa.toFixed(2)}</span>
              <span className="stat-label">Cumulative CGPA (10.0 Scale)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{currentStudent.academics.currentSemesterGpa.toFixed(2)}</span>
              <span className="stat-label">{currentStudent.semester} SGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.academics.passedCredits} / {currentStudent.academics.totalCredits}</span>
              <span className="stat-label">Earned Academic Credits</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>0 Backlogs</span>
              <span className="stat-label">Clear Academic Standing</span>
            </div>
          </div>
        </div>

        {/* Course Grades Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">{currentStudent.semester} Course Valuation & Grades</h3>
              <p className="c1-card-subtitle">Official transcript score breakdown and grade point awards</p>
            </div>
            <span className="c1-badge c1-badge-success">Controller of Exams Certified</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Subject Title</th>
                  <th>Internal Score (30)</th>
                  <th>Exam Score (70)</th>
                  <th>Total Marks (100)</th>
                  <th>Letter Grade</th>
                  <th>Grade Points</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {currentStudent.academics.courses.map((c) => (
                  <tr key={c.code}>
                    <td><span className="course-code-tag">{c.code}</span></td>
                    <td><strong style={{ color: '#ffffff' }}>{c.name}</strong></td>
                    <td>{c.internalMarks} / 30</td>
                    <td>{c.examMarks} / 70</td>
                    <td><strong style={{ color: '#ffffff' }}>{c.totalMarks} / 100</strong></td>
                    <td>
                      <span className="c1-badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#38bdf8', fontWeight: 800 }}>
                        {c.grade}
                      </span>
                    </td>
                    <td><strong style={{ color: '#38bdf8' }}>{c.gradePoints.toFixed(1)}</strong></td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-circle-check"></i> Passed
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

export default ParentAcademics;
