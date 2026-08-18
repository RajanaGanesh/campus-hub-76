import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentExams: React.FC = () => {
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
              <span className="crumb-current">Examinations</span>
            </div>
            <h1 className="module-title">Examination Timetable & Seating</h1>
            <p className="module-subtitle">
              Official university examination calendar, session timings, and hall allocations for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-exam-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-exam-student"
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
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.exams.length} Papers</span>
              <span className="stat-label">Scheduled Exam Papers</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.exams[0]?.room || 'Room CSE-204'}</span>
              <span className="stat-label">Allotted Examination Venue</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>August 2026</span>
              <span className="stat-label">Assessment Term</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">COE Certified</span>
              <span className="stat-label">Official University Schedule</span>
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="faculty-exams-grid">
          {currentStudent.exams.map((ex) => (
            <div key={ex.id} className="c1-card faculty-exam-card">
              <div className="exam-card-header-row">
                <span className="course-code-tag">{ex.courseCode}</span>
                <span className="c1-badge c1-badge-cyan">
                  <i className="fa-solid fa-calendar-check"></i> Scheduled
                </span>
              </div>

              <h3 className="exam-title-text">{ex.name}</h3>
              <span className="exam-subject-sub">{ex.courseName}</span>

              <div className="exam-metrics-grid-box">
                <div className="e-metric-cell">
                  <span className="e-lbl">Date & Time</span>
                  <span className="e-val">{ex.date} • {ex.time}</span>
                </div>
                <div className="e-metric-cell">
                  <span className="e-lbl">Exam Hall</span>
                  <span className="e-val">{ex.room}</span>
                </div>
                <div className="e-metric-cell">
                  <span className="e-lbl">Max Marks</span>
                  <span className="e-val">{ex.maxMarks} Marks</span>
                </div>
                <div className="e-metric-cell">
                  <span className="e-lbl">Student ID</span>
                  <span className="e-val">{currentStudent.id}</span>
                </div>
              </div>

              <p className="exam-instructions-snippet">{ex.instructions}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentExams;
