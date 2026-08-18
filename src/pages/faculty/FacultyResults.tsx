import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, ExamMarkRecord } from '../../data/managementData';
import { Toast } from '../../components/Toast';

export const FacultyResults: React.FC = () => {
  const mgmt = getManagementData();

  // Selected Course and Assessment
  const [selectedCourse, setSelectedCourse] = useState('CSE-301');
  const [selectedExamType, setSelectedExamType] = useState('Midterm Assessment 1 (Internal)');

  // Marks records state
  const [marksList, setMarksList] = useState<ExamMarkRecord[]>(() => {
    return mgmt.examMarks.filter((m) => m.courseCode === 'CSE-301');
  });

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper compute letter grade
  const computeGrade = (internal: number, external: number) => {
    const total = internal + external;
    if (total >= 90) return { grade: 'A+', color: '#34d399' };
    if (total >= 80) return { grade: 'A', color: '#38bdf8' };
    if (total >= 70) return { grade: 'B', color: '#818cf8' };
    if (total >= 60) return { grade: 'C', color: '#fbbf24' };
    return { grade: 'F', color: '#fb7185' };
  };

  // Handle marks change for student
  const handleInternalChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(30, val));
    setMarksList((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, internalMarks: clamped } : m))
    );
  };

  const handleExternalChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(70, val));
    setMarksList((prev) =>
      prev.map((m) => (m.studentId === studentId ? { ...m, externalMarks: clamped } : m))
    );
  };

  // Save all results
  const handleSaveAllResults = () => {
    showToast(`Results for ${marksList.length} students in ${selectedCourse} saved and published to student grade sheets!`, 'success');
  };

  const handleResetResults = () => {
    setMarksList(mgmt.examMarks.filter((m) => m.courseCode === selectedCourse));
    showToast('Marks reset to stored values.', 'info');
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
              <span className="crumb-current">Academic Results Valuation</span>
            </div>
            <h1 className="module-title">Academic Results & Grading Ledger</h1>
            <p className="module-subtitle">
              Enter mid-semester internal marks, end-semester evaluation scores, compute grade points, and publish to student transcripts.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleSaveAllResults}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save & Publish All Results</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{marksList.length} Candidates</span>
              <span className="stat-label">Enrolled Roster</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">84.2</span>
              <span className="stat-label">Cohort Average Marks</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">A Grade</span>
              <span className="stat-label">Modal Cohort Standing</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">100%</span>
              <span className="stat-label">Valuation Completion</span>
            </div>
          </div>
        </div>

        {/* Selector Filters Card */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="filters-row-wrap" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div className="filter-select-item">
                <label htmlFor="select-result-course">Subject Course</label>
                <select
                  id="select-result-course"
                  className="c1-select"
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setMarksList(mgmt.examMarks.filter((m) => m.courseCode === e.target.value));
                  }}
                >
                  <option value="CSE-301">CSE-301: Advanced Data Structures</option>
                  <option value="CSE-302">CSE-302: Database Management Systems</option>
                  <option value="CSE-401">CSE-401: Cloud Computing Architecture</option>
                </select>
              </div>

              <div className="filter-select-item">
                <label htmlFor="select-result-type">Assessment Component</label>
                <select
                  id="select-result-type"
                  className="c1-select"
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                >
                  <option value="Midterm Assessment 1 (Internal)">Midterm Assessment 1 (30 Internal + 70 External)</option>
                  <option value="End-Semester Examination">End-Semester Final Examination</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={handleResetResults}
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Reset</span>
              </button>
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={handleSaveAllResults}
              >
                <i className="fa-solid fa-check"></i>
                <span>Save All Grades</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Entry Table */}
        <div className="c1-card results-entry-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">{selectedCourse} Candidate Results Table</h3>
              <p className="c1-card-subtitle">Enter Internal Marks (max 30) and Assessment Marks (max 70)</p>
            </div>
            <span className="c1-badge c1-badge-cyan">100 Max Total Marks</span>
          </div>

          <div className="results-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Candidate</th>
                  <th>Internal Marks (Max 30)</th>
                  <th>Assessment Marks (Max 70)</th>
                  <th>Total Marks (100)</th>
                  <th>Grade</th>
                  <th>Result Status</th>
                </tr>
              </thead>
              <tbody>
                {marksList.map((rec) => {
                  const total = rec.internalMarks + rec.externalMarks;
                  const gradeObj = computeGrade(rec.internalMarks, rec.externalMarks);

                  return (
                    <tr key={rec.studentId}>
                      <td><span className="course-code-cell">{rec.studentId}</span></td>
                      <td>
                        <strong style={{ color: '#ffffff' }}>{rec.studentName}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            className="c1-input marks-cell-input"
                            value={rec.internalMarks}
                            onChange={(e) => handleInternalChange(rec.studentId, Number(e.target.value))}
                            min={0}
                            max={30}
                            style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 30</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            className="c1-input marks-cell-input"
                            value={rec.externalMarks}
                            onChange={(e) => handleExternalChange(rec.studentId, Number(e.target.value))}
                            min={0}
                            max={70}
                            style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 70</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{total} / 100</strong>
                      </td>
                      <td>
                        <span
                          className="c1-badge"
                          style={{ background: 'rgba(255,255,255,0.06)', color: gradeObj.color, fontWeight: 800 }}
                        >
                          {gradeObj.grade}
                        </span>
                      </td>
                      <td>
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Passed
                        </span>
                      </td>
                    </tr>
                  );
                })}
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

export default FacultyResults;
