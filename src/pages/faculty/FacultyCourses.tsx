import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, CourseRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';

export const FacultyCourses: React.FC = () => {
  const navigate = useNavigate();
  const mgmt = getManagementData();

  // Load faculty assigned courses
  const [courses] = useState<CourseRecord[]>(() => {
    return mgmt.courses.filter((c) => c.facultyId === 'FAC-101');
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseRecord | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.department.toLowerCase().includes(q);
    });
  }, [courses, searchQuery]);

  const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0);
  const avgProgress = Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / (courses.length || 1));

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">My Assigned Courses</span>
            </div>
            <h1 className="module-title">My Courses</h1>
            <p className="module-subtitle">
              Syllabus progress tracking, student cohorts, lecture schedules, and course administration shortcuts.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => navigate('/faculty/materials')}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Upload Study Material</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{courses.length}</span>
              <span className="stat-label">Assigned Subjects</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalStudents}</span>
              <span className="stat-label">Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{avgProgress}%</span>
              <span className="stat-label">Avg Syllabus Completed</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Active</span>
              <span className="stat-label">Academic Term 2025–2026</span>
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search courses by code (CSE-301) or subject name..."
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
        </div>

        {/* Courses Cards Grid */}
        <div className="faculty-courses-full-grid">
          {filteredCourses.map((course) => (
            <div key={course.code} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div>
                  <span className="course-code-tag">{course.code}</span>
                  <h3 className="course-title-text">{course.name}</h3>
                  <span className="course-dept-text">{course.department} Department • {course.semester}</span>
                </div>
                <span className="c1-badge c1-badge-success">{course.status}</span>
              </div>

              <div className="course-info-grid-compact">
                <div className="c-info-cell">
                  <i className="fa-solid fa-users"></i>
                  <span><strong>{course.studentsCount}</strong> Students Enrolled</span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>Schedule: <strong>{course.nextClass}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-location-dot"></i>
                  <span>Lecture Hall: <strong>Room CSE-204</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-award"></i>
                  <span>Credits: <strong>4 Credits (Theory + Lab)</strong></span>
                </div>
              </div>

              <div className="course-syllabus-bar">
                <div className="syl-bar-top">
                  <span>Syllabus Coverage</span>
                  <strong>{course.progress}% Completed</strong>
                </div>
                <div className="progress-bar-large-track">
                  <div className="progress-bar-large-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>

              <div className="course-shortcuts-row">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedCourse(course)}
                >
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Details</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => navigate('/faculty/attendance')}
                >
                  <i className="fa-solid fa-user-check"></i>
                  <span>Attendance</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => navigate('/faculty/assignments')}
                >
                  <i className="fa-solid fa-file-invoice"></i>
                  <span>Assignments</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => navigate('/faculty/results')}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Results</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => navigate('/faculty/materials')}
                >
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Materials</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL: COURSE DETAILS MODAL
            ============================================================ */}
        {selectedCourse && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedCourse(null)}
            title={`${selectedCourse.code} — ${selectedCourse.name}`}
            maxWidth="md"
          >
            <div className="course-details-dialog-content">
              <div className="dialog-meta-row">
                <span className="course-code-tag">{selectedCourse.code}</span>
                <span className="c1-badge c1-badge-success">{selectedCourse.status}</span>
              </div>

              <h3 className="dialog-course-name">{selectedCourse.name}</h3>
              <p className="dialog-dept-sub">{selectedCourse.department} • {selectedCourse.semester} • 4 Credits</p>

              <div className="course-dialog-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Enrolled Students:</span>
                  <span className="d-val">{selectedCourse.studentsCount} Students (Section A)</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Room Allocation:</span>
                  <span className="d-val">Room CSE-204 (Smart Classroom)</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Class Timing:</span>
                  <span className="d-val">{selectedCourse.nextClass}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Course Instructor:</span>
                  <span className="d-val">{selectedCourse.facultyName}</span>
                </div>
              </div>

              <div className="dialog-units-section">
                <h4>Curriculum Units Overview</h4>
                <ul className="bullet-list">
                  <li>Unit 1: Foundational Algorithms & Asymptotic Complexity Analysis</li>
                  <li>Unit 2: Non-Linear Data Structures (Trees, Balanced BSTs, B-Trees)</li>
                  <li>Unit 3: Graph Algorithms (Shortest Paths, Flow Networks, Topological Sort)</li>
                  <li>Unit 4: Dynamic Programming & Greedy Paradigms</li>
                  <li>Unit 5: Advanced String Matching & NP-Completeness Overview</li>
                </ul>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    setSelectedCourse(null);
                    navigate('/faculty/attendance');
                  }}
                >
                  <i className="fa-solid fa-user-check"></i>
                  <span>Take Attendance</span>
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
};

export default FacultyCourses;
