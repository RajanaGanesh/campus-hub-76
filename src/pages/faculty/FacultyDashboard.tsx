import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getManagementData } from '../../data/managementData';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const mgmt = getManagementData();

  // Filter courses for this faculty
  const myCourses = mgmt.courses.filter((c) => c.facultyId === 'FAC-101');
  const facultyName = user?.name || 'Dr. Suresh Kumar';

  // Today's classes schedule
  const todayClasses = [
    {
      time: '09:00 AM - 10:30 AM',
      courseCode: 'CSE-301',
      subject: 'Advanced Data Structures & Algorithms',
      section: 'CSE-A',
      room: 'Room CSE-204',
      studentsCount: 60,
      status: 'Completed' as const
    },
    {
      time: '11:00 AM - 12:30 PM',
      courseCode: 'CSE-302',
      subject: 'Database Management Systems',
      section: 'CSE-B',
      room: 'Computer Lab 2',
      studentsCount: 60,
      status: 'Ongoing' as const
    },
    {
      time: '02:00 PM - 03:30 PM',
      courseCode: 'CSE-401',
      subject: 'Cloud Computing & Distributed Systems',
      section: 'CSE-A',
      room: 'Seminar Hall 2',
      studentsCount: 60,
      status: 'Upcoming' as const
    }
  ];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header with Welcome Greeting */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Dashboard</span>
            </div>
            <h1 className="module-title">Good Morning, {facultyName}</h1>
            <p className="module-subtitle">
              Manage your classes, student rosters, attendance, assignments, examinations, and academic records.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => navigate('/faculty/attendance')}
            >
              <i className="fa-solid fa-user-check"></i>
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>

        {/* 6 Faculty Statistics Cards */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="c1-card academic-stat-card" onClick={() => navigate('/faculty/courses')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{myCourses.length} Courses</span>
              <span className="stat-label">Assigned Subjects</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/faculty/students')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">240</span>
              <span className="stat-label">Total Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <i className="fa-solid fa-calendar-day"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{todayClasses.length}</span>
              <span className="stat-label">Today's Class Sessions</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/faculty/assignments')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>12</span>
              <span className="stat-label">Pending Grading</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/faculty/exams')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">2 Exams</span>
              <span className="stat-label">Scheduled Assessments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => navigate('/faculty/attendance')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-clipboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>1 Section</span>
              <span className="stat-label">Attendance Pending</span>
            </div>
          </div>
        </div>

        {/* Today's Classes & Quick Actions Layout */}
        <div className="hostel-overview-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
          {/* Today's Classes Widget */}
          <div className="c1-card faculty-today-classes-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Today's Teaching Schedule</h3>
                <p className="c1-card-subtitle">Scheduled lecture timings and room assignments for today</p>
              </div>
              <span className="c1-badge c1-badge-cyan">
                <i className="fa-solid fa-clock"></i> 3 Scheduled
              </span>
            </div>

            <div className="faculty-classes-stack">
              {todayClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className={`faculty-class-node ${cls.status === 'Ongoing' ? 'active-class' : ''}`}
                >
                  <div className="class-time-chip">
                    <span className="c-time-lbl">Time</span>
                    <strong className="c-time-val">{cls.time.split(' - ')[0]}</strong>
                  </div>

                  <div className="class-info-col">
                    <div className="class-title-row">
                      <span className="course-code-tag">{cls.courseCode}</span>
                      <h4 className="class-name">{cls.subject}</h4>
                    </div>
                    <div className="class-meta-row">
                      <span><i className="fa-solid fa-users"></i> Section: <strong>{cls.section}</strong> ({cls.studentsCount} Students)</span>
                      <span><i className="fa-solid fa-location-dot"></i> <strong>{cls.room}</strong></span>
                    </div>
                  </div>

                  <div className="class-action-col">
                    {cls.status === 'Completed' ? (
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-circle-check"></i> Completed
                      </span>
                    ) : cls.status === 'Ongoing' ? (
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient btn-roll-call"
                        onClick={() => navigate('/faculty/attendance')}
                      >
                        <i className="fa-solid fa-user-check"></i>
                        <span>Roll Call</span>
                      </button>
                    ) : (
                      <span className="c1-badge c1-badge-cyan">
                        <i className="fa-regular fa-clock"></i> Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Academic Actions & Shortcuts */}
          <div className="c1-card faculty-quick-actions-card">
            <h3 className="c1-card-title">Quick Actions</h3>
            <p className="c1-card-subtitle">Fast shortcuts for daily faculty responsibilities</p>

            <div className="faculty-shortcuts-grid">
              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/attendance')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-clipboard-user"></i>
                </div>
                <span>Mark Attendance</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/assignments')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-file-circle-plus"></i>
                </div>
                <span>Create Assignment</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/results')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <span>Enter Results</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/materials')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <span>Upload Material</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/notices')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  <i className="fa-solid fa-bullhorn"></i>
                </div>
                <span>Publish Notice</span>
              </button>

              <button
                type="button"
                className="shortcut-tile"
                onClick={() => navigate('/faculty/students')}
              >
                <div className="shortcut-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                  <i className="fa-solid fa-users"></i>
                </div>
                <span>Enrolled Students</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Courses Overview */}
        <div className="c1-card faculty-courses-overview-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">My Assigned Courses & Progress</h3>
              <p className="c1-card-subtitle">Active semester syllabus completion and section enrollment</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/faculty/courses')}
            >
              <span>View All Courses</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          <div className="faculty-courses-grid">
            {myCourses.map((c) => (
              <div key={c.code} className="faculty-course-tile">
                <div className="f-course-top">
                  <span className="course-code-tag">{c.code}</span>
                  <span className="c1-badge c1-badge-success">{c.status}</span>
                </div>
                <h4 className="f-course-name">{c.name}</h4>
                <div className="f-course-meta">
                  <span><i className="fa-solid fa-users"></i> {c.studentsCount} Students</span>
                  <span><i className="fa-solid fa-calendar"></i> {c.semester}</span>
                </div>

                <div className="f-course-progress">
                  <div className="f-prog-header">
                    <span>Syllabus Completion</span>
                    <strong>{c.progress}%</strong>
                  </div>
                  <div className="progress-bar-large-track">
                    <div className="progress-bar-large-fill" style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>

                <div className="f-course-actions">
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '6px 0' }}
                    onClick={() => navigate('/faculty/attendance')}
                  >
                    Attendance
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '6px 0' }}
                    onClick={() => navigate('/faculty/assignments')}
                  >
                    Assignments
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FacultyDashboard;
