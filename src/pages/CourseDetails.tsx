import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lmsData, LMSCourse } from '../data/lmsData';

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Load courses from localStorage or fallback
  const [courses, setCourses] = useState<LMSCourse[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_lms_courses');
      return stored ? JSON.parse(stored) : lmsData.courses;
    } catch {
      return lmsData.courses;
    }
  });

  const course = courses.find((c) => c.id === courseId);

  // If course not found, show error state
  if (!course) {
    return (
      <div className="card-panel" style={{ padding: '40px', textRendering: 'optimizeLegibility', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '32px', color: 'var(--color-error)', marginBottom: '12px' }}></i>
        <h3>Unable to load course details</h3>
        <p style={{ fontSize: '13px' }}>The course identifier does not match any registered curriculum node.</p>
        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 20px', height: '38px', marginTop: '16px' }}
          onClick={() => navigate('/learning')}
        >
          Back to Learning Hub
        </button>
      </div>
    );
  }

  // Course study materials
  const courseMaterials = lmsData.materials.filter((mat) => mat.subject.toLowerCase().includes(course.title.toLowerCase()));

  // Course video lessons
  const courseVideos = lmsData.videos.filter((vid) => vid.course.toLowerCase().includes(course.title.toLowerCase()));

  const handleMarkCompleted = (moduleId: number) => {
    const updatedCourses = courses.map((c) => {
      if (c.id === course.id) {
        const nextModules = c.modules.map((m) => {
          if (m.id === moduleId) {
            return {
              ...m,
              status: 'Completed' as const
            };
          }
          // Automatically unlock next module if it is currently locked
          if (m.id === moduleId + 1 && m.status === 'Locked') {
            return {
              ...m,
              status: 'In Progress' as const
            };
          }
          return m;
        });

        const completedCount = nextModules.filter((m) => m.status === 'Completed').length;
        const progressPct = Math.round((completedCount / c.moduleCount) * 100);

        return {
          ...c,
          modules: nextModules,
          completedModulesCount: completedCount,
          progress: progressPct
        };
      }
      return c;
    });

    setCourses(updatedCourses);
    localStorage.setItem('campushub_lms_courses', JSON.stringify(updatedCourses));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Course Details Header */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/learning')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to LMS
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Learning Hub / Course / {course.title}</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', margin: 0 }}>
        <div>
          <h1>{course.title}</h1>
          <p>Curriculum directed by <strong>{course.faculty}</strong></p>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Completed:</span>
            <strong style={{ color: 'white' }}>{course.completedModulesCount} / {course.moduleCount} Modules</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Course Progress:</span>
            <strong style={{ color: 'var(--accent-highlight)' }}>{course.progress}%</strong>
          </div>
        </div>
      </div>

      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 20px' }}>
        {course.description} This interactive module guide enables students to track syllabus progression, access textbook PDF downloads, review lesson slides, watch classroom videos, and take practice quizzes to test their knowledge.
      </p>

      {/* Split grid: Modules lists on left, study files & videos on right */}
      <div className="dashboard-main-grid">
        {/* Course modules index list */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Course Syllabus Modules</h3>
            <i className="fa-solid fa-list-check" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {course.modules.map((m) => (
              <div
                key={m.id}
                className="timetable-item"
                style={{
                  padding: '16px',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  background: m.status === 'Completed' ? 'rgba(0, 216, 154, 0.01)' : 'rgba(255,255,255,0.01)',
                  border: m.status === 'Completed' ? '1px solid rgba(0, 216, 154, 0.1)' : '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: m.status === 'Completed' ? '#00d89a' : m.status === 'In Progress' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                      border: m.status === 'Locked' ? '1px solid var(--border-color)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      marginTop: '2px'
                    }}
                  >
                    {m.status === 'Completed' ? <i className="fa-solid fa-check"></i> : m.status === 'Locked' ? <i className="fa-solid fa-lock" style={{ fontSize: '9px' }}></i> : m.id}
                  </div>

                  <div>
                    <span style={{ fontSize: '13.5px', fontWeight: '700', color: m.status === 'Locked' ? 'var(--text-secondary)' : 'white' }}>{m.title}</span>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                      {m.description}
                    </p>
                  </div>
                </div>

                {m.status !== 'Completed' && m.status !== 'Locked' && (
                  <button
                    type="button"
                    className="btn-signin"
                    style={{ height: '30px', fontSize: '11px', margin: 0, padding: '0 12px', width: 'auto' }}
                    onClick={() => handleMarkCompleted(m.id)}
                  >
                    Mark as Completed
                  </button>
                )}

                {m.status === 'Completed' && (
                  <span style={{ fontSize: '11px', color: '#00d89a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
                    <i className="fa-solid fa-circle-check"></i> Done
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources list: Materials & Videos */}
        <div className="dashboard-row" style={{ flex: 1 }}>
          {/* Specific Course Materials */}
          <div className="card-panel">
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Syllabus Materials</h3>
              <i className="fa-solid fa-file-pdf" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseMaterials.length > 0 ? (
                courseMaterials.map((mat) => (
                  <div key={mat.id} className="timetable-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'white' }}>{mat.title}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{mat.size} • {mat.type}</span>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', textDecoration: 'none', fontWeight: '700' }}
                    >
                      Download
                    </a>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                  No files uploaded for this course yet.
                </div>
              )}
            </div>
          </div>

          {/* Specific Course Videos */}
          <div className="card-panel">
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Lecture Videos</h3>
              <i className="fa-solid fa-video" style={{ color: 'var(--text-secondary)' }}></i>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseVideos.length > 0 ? (
                courseVideos.map((vid) => (
                  <div key={vid.id} className="timetable-item" style={{ justifyContent: 'space-between', padding: '10px 14px' }}>
                    <div>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'white' }}>{vid.title}</span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{vid.duration}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '600' }}>
                      {vid.progress}% Watched
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                  No video lectures recorded for this course.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseDetails;
