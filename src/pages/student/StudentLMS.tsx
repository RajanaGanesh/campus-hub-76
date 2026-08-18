import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { lmsData, LMSCourse, StudyMaterial, VideoLesson, QuizItem } from '../../data/lmsData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentLMS: React.FC = () => {
  const navigate = useNavigate();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'materials' | 'videos' | 'quizzes' | 'syllabus'>('materials');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Interactive Modal States
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizQIndex, setQuizQIndex] = useState(0);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizTimerSeconds, setQuizTimerSeconds] = useState(300);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number; pct: number } | null>(null);

  // Action Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Quizzes countdown effect
  useEffect(() => {
    if (!activeQuiz || quizFinished) return;

    if (quizTimerSeconds <= 0) {
      handleCompleteQuiz();
      return;
    }

    const interval = setInterval(() => {
      setQuizTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, quizTimerSeconds, quizFinished]);

  // Unique course list
  const coursesList = useMemo(() => {
    return ['All', ...Array.from(new Set(lmsData.courses.map((c) => c.title)))];
  }, []);

  // Filtered study materials
  const filteredMaterials = useMemo(() => {
    return lmsData.materials.filter((mat) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        mat.title.toLowerCase().includes(q) ||
        mat.subject.toLowerCase().includes(q);

      const matchCourse = courseFilter === 'All' || mat.subject.includes(courseFilter) || courseFilter.includes(mat.subject);
      const matchType = typeFilter === 'All' || mat.type.toLowerCase() === typeFilter.toLowerCase();

      return matchSearch && matchCourse && matchType;
    });
  }, [searchQuery, courseFilter, typeFilter]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return lmsData.videos.filter((vid) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        vid.title.toLowerCase().includes(q) ||
        vid.course.toLowerCase().includes(q);

      const matchCourse = courseFilter === 'All' || vid.course.includes(courseFilter) || courseFilter.includes(vid.course);

      return matchSearch && matchCourse;
    });
  }, [searchQuery, courseFilter]);

  // Start a practice quiz
  const handleStartQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setQuizQIndex(0);
    setSelectedQuizAnswers({});
    setQuizTimerSeconds(quiz.timeLimit * 60);
    setQuizFinished(false);
    setQuizScore(null);
  };

  const handleSelectQuizOption = (optIdx: number) => {
    setSelectedQuizAnswers({
      ...selectedQuizAnswers,
      [quizQIndex]: optIdx
    });
  };

  const handleCompleteQuiz = () => {
    if (!activeQuiz) return;

    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });

    const total = activeQuiz.questions.length;
    const pct = Math.round((correct / total) * 100);

    setQuizScore({ score: correct, total, pct });
    setQuizFinished(true);
    showToast(`Quiz completed! You scored ${correct}/${total} (${pct}%).`, 'success');
  };

  const handleDownload = (title: string) => {
    showToast(`Downloading "${title}"...`, 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Academic</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Learning Center (LMS)</span>
            </div>
            <h1 className="module-title">Learning Resource Hub</h1>
            <p className="module-subtitle">
              Digital repository for course lecture notes, syllabus outlines, video recordings, and practice quizzes.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="meta-badge-box">
              <span className="meta-badge-label">Enrolled Subjects</span>
              <span className="meta-badge-val">5 Active Courses</span>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-open-reader"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{lmsData.materials.length}</span>
              <span className="stat-label">Study Materials</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-video"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{lmsData.videos.length}</span>
              <span className="stat-label">Recorded Lectures</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-clipboard-question"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{lmsData.quizzes.length}</span>
              <span className="stat-label">Self-Assessment Quizzes</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{lmsData.courses.length}</span>
              <span className="stat-label">Registered Courses</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <i className="fa-solid fa-file-lines"></i>
            <span>Lecture Notes & PDFs ({filteredMaterials.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <i className="fa-solid fa-circle-play"></i>
            <span>Video Lectures ({filteredVideos.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <i className="fa-solid fa-pen-ruler"></i>
            <span>Practice Quizzes ({lmsData.quizzes.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
            onClick={() => setActiveTab('syllabus')}
          >
            <i className="fa-solid fa-sitemap"></i>
            <span>Course Syllabus & Outlines</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search learning materials by topic, course, or keyword..."
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

          <div className="filters-row-wrap">
            <div className="filter-select-item">
              <label htmlFor="lms-course-filter">Course</label>
              <select
                id="lms-course-filter"
                className="c1-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                {coursesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {activeTab === 'materials' && (
              <div className="filter-select-item">
                <label htmlFor="lms-type-filter">Resource Type</label>
                <select
                  id="lms-type-filter"
                  className="c1-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Formats</option>
                  <option value="PDF">PDF Documents</option>
                  <option value="Notes">Lecture Notes</option>
                  <option value="Presentation">Presentation Slides</option>
                </select>
              </div>
            )}

            {(searchQuery || courseFilter !== 'All' || typeFilter !== 'All') && (
              <button
                type="button"
                className="c1-btn c1-btn-secondary btn-clear-filters"
                onClick={() => {
                  setSearchQuery('');
                  setCourseFilter('All');
                  setTypeFilter('All');
                }}
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================
            TAB 1: LECTURE NOTES & STUDY MATERIALS
            ============================================================ */}
        {activeTab === 'materials' && (
          <div>
            {filteredMaterials.length > 0 ? (
              <div className="materials-cards-grid">
                {filteredMaterials.map((mat) => (
                  <div key={mat.id} className="c1-card material-card-item">
                    <div className="material-card-top">
                      <div className="material-format-icon">
                        <i className={`fa-solid ${mat.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-lines'}`}></i>
                      </div>
                      <span className="c1-badge c1-badge-primary">{mat.subject}</span>
                    </div>

                    <h3 className="material-card-title">{mat.title}</h3>
                    <p className="material-card-desc">Comprehensive reference notes, conceptual diagrams, and code snippets.</p>

                    <div className="material-meta-row">
                      <span><i className="fa-solid fa-file-arrow-down"></i> {mat.size}</span>
                      <span><i className="fa-regular fa-calendar"></i> {mat.uploadedDate}</span>
                    </div>

                    <div className="material-card-actions">
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        onClick={() => setActiveMaterial(mat)}
                      >
                        <i className="fa-solid fa-book-open"></i>
                        <span>Read Online</span>
                      </button>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        onClick={() => handleDownload(mat.title)}
                        title="Download file"
                      >
                        <i className="fa-solid fa-download"></i>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-folder-open empty-card-icon"></i>
                <h4>No study materials found</h4>
                <p>Try clearing your course or keyword search filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: VIDEO LESSONS
            ============================================================ */}
        {activeTab === 'videos' && (
          <div>
            {filteredVideos.length > 0 ? (
              <div className="videos-cards-grid">
                {filteredVideos.map((vid) => (
                  <div key={vid.id} className="c1-card video-card-item">
                    <div className="video-thumbnail-box" onClick={() => setActiveVideo(vid)}>
                      <div className="play-button-overlay">
                        <i className="fa-solid fa-play"></i>
                      </div>
                      <span className="video-duration-chip">{vid.duration}</span>
                    </div>

                    <div className="video-card-body">
                      <span className="course-code-tag">{vid.course}</span>
                      <h3 className="video-card-title">{vid.title}</h3>
                      <div className="video-meta-row">
                        <span><i className="fa-solid fa-clock"></i> {vid.duration}</span>
                        <span><i className="fa-solid fa-chart-pie"></i> {vid.progress}% Watched</span>
                      </div>

                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient btn-watch-video"
                        onClick={() => setActiveVideo(vid)}
                      >
                        <i className="fa-solid fa-play"></i>
                        <span>Watch Lecture Recording</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-video-slash empty-card-icon"></i>
                <h4>No video lectures match your search</h4>
                <p>Select another course from the filter above.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: PRACTICE QUIZZES
            ============================================================ */}
        {activeTab === 'quizzes' && (
          <div className="quizzes-cards-grid">
            {lmsData.quizzes.map((quiz) => (
              <div key={quiz.id} className="c1-card quiz-card-item">
                <div className="quiz-card-header">
                  <span className="course-code-tag">{quiz.subject}</span>
                  <span className="c1-badge c1-badge-cyan">
                    <i className="fa-solid fa-clock"></i> {quiz.timeLimit} Mins
                  </span>
                </div>

                <h3 className="quiz-card-title">{quiz.title}</h3>
                <p className="quiz-card-desc">{quiz.questions.length} multiple-choice questions testing core principles and applications.</p>

                <div className="quiz-meta-row">
                  <span><i className="fa-solid fa-list-ol"></i> {quiz.questions.length} Questions</span>
                  <span><i className="fa-solid fa-award"></i> Best: {quiz.bestScore !== null ? `${quiz.bestScore}%` : 'Not Attempted'}</span>
                </div>

                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ width: '100%', marginTop: '16px' }}
                  onClick={() => handleStartQuiz(quiz)}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>Start Practice Assessment</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            TAB 4: COURSE SYLLABUS OUTLINES
            ============================================================ */}
        {activeTab === 'syllabus' && (
          <div className="syllabus-stack">
            {lmsData.courses.map((course: LMSCourse) => (
              <div key={course.id} className="c1-card syllabus-course-card">
                <div className="syllabus-course-header">
                  <div>
                    <div className="course-code-tag">{course.moduleCount} Units • 4 Credits</div>
                    <h3 className="syllabus-course-title">{course.title}</h3>
                    <span className="syllabus-faculty-text"><i className="fa-solid fa-user-tie"></i> {course.faculty}</span>
                  </div>
                  <div className="course-progress-pill">
                    <span className="progress-pct">{course.progress}% Completed</span>
                    <div className="mini-progress-bar">
                      <div className="mini-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="syllabus-modules-list">
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((mod) => (
                      <div key={mod.id} className="syllabus-unit-row">
                        <span className="unit-number-tag">Unit {mod.id}</span>
                        <div className="unit-info">
                          <h4>{mod.title}</h4>
                          <p>{mod.description}</p>
                        </div>
                        <span className={`c1-badge ${mod.status === 'Completed' ? 'c1-badge-success' : mod.status === 'In Progress' ? 'c1-badge-primary' : 'c1-badge-warning'}`}>
                          {mod.status === 'Completed' ? <><i className="fa-solid fa-circle-check"></i> Completed</> : mod.status === 'In Progress' ? <><i className="fa-solid fa-spinner"></i> In Progress</> : <><i className="fa-solid fa-lock"></i> Locked</>}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="syllabus-unit-row">
                      <span className="unit-number-tag">Unit 1</span>
                      <div className="unit-info">
                        <h4>Core Subject Concepts</h4>
                        <p>{course.description}</p>
                      </div>
                      <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Active</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            MODAL 1: DOCUMENT READER MODAL
            ============================================================ */}
        {activeMaterial && (
          <Modal
            isOpen={true}
            onClose={() => setActiveMaterial(null)}
            title={`Document Viewer: ${activeMaterial.title}`}
            maxWidth="lg"
          >
            <div className="document-reader-dialog">
              <div className="reader-meta-bar">
                <div>
                  <span className="course-code-tag">{activeMaterial.subject}</span>
                  <span className="reader-faculty-author">Format: {activeMaterial.type} • {activeMaterial.size}</span>
                </div>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => handleDownload(activeMaterial.title)}
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Download File</span>
                </button>
              </div>

              {/* Document Preview Canvas */}
              <div className="document-preview-canvas">
                <div className="doc-page-sheet">
                  <div className="doc-header">
                    <h3>{activeMaterial.title}</h3>
                    <p>Course: {activeMaterial.subject} • Uploaded on {activeMaterial.uploadedDate}</p>
                  </div>
                  <div className="doc-body-content">
                    <h4>1. Overview & Learning Objectives</h4>
                    <p>Comprehensive lecture notes and code walkthrough covering key concepts and real-world system designs.</p>
                    <h4>2. Core Key Takeaways</h4>
                    <ul>
                      <li>Algorithmic complexity bounds and state transitions.</li>
                      <li>Comparative benchmarking across memory footprints and execution latency.</li>
                      <li>Practical implementation patterns with sample trace tables.</li>
                    </ul>
                    <h4>3. Summary Formulas & Reference Queries</h4>
                    <pre className="doc-code-block">
                      <code>
                        {`-- Sample SQL Query / Algorithmic Pattern
SELECT department_id, AVG(salary) AS avg_sal
FROM institutional_faculty
GROUP BY department_id
HAVING COUNT(*) > 5;`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setActiveMaterial(null)}
                >
                  Close Document
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: VIDEO LESSON PLAYER MODAL
            ============================================================ */}
        {activeVideo && (
          <Modal
            isOpen={true}
            onClose={() => setActiveVideo(null)}
            title={`Lecture: ${activeVideo.title}`}
            maxWidth="lg"
          >
            <div className="video-player-dialog">
              <div className="video-player-screen">
                <div className="player-placeholder-graphic">
                  <i className="fa-solid fa-circle-play main-play-icon"></i>
                  <span>Streaming Lecture from Campus Media CDN ({activeVideo.duration})</span>
                </div>
              </div>

              <div className="video-dialog-info">
                <span className="course-code-tag">{activeVideo.course}</span>
                <h3 className="video-dialog-title">{activeVideo.title}</h3>
                <p className="video-dialog-faculty">Duration: {activeVideo.duration} • Completed: {activeVideo.progress}%</p>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setActiveVideo(null)}
                >
                  Close Video
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: PRACTICE QUIZ MODAL
            ============================================================ */}
        {activeQuiz && (
          <Modal
            isOpen={true}
            onClose={() => setActiveQuiz(null)}
            title={`Assessment: ${activeQuiz.title}`}
            maxWidth="md"
          >
            <div className="quiz-session-dialog">
              {!quizFinished ? (
                <>
                  <div className="quiz-session-header">
                    <span className="q-progress-text">
                      Question {quizQIndex + 1} of {activeQuiz.questions.length}
                    </span>
                    <div className="quiz-timer-pill">
                      <i className="fa-solid fa-clock"></i>
                      <span>
                        {Math.floor(quizTimerSeconds / 60)}:
                        {String(quizTimerSeconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <div className="quiz-question-box">
                    <h3 className="q-prompt">{activeQuiz.questions[quizQIndex].question}</h3>
                    <div className="q-options-stack">
                      {activeQuiz.questions[quizQIndex].options.map((opt, optIdx) => {
                        const isSelected = selectedQuizAnswers[quizQIndex] === optIdx;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            className={`q-option-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectQuizOption(optIdx)}
                          >
                            <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                            <span className="opt-text">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="modal-dialog-footer">
                    {quizQIndex > 0 && (
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        onClick={() => setQuizQIndex((prev) => prev - 1)}
                      >
                        Previous
                      </button>
                    )}
                    {quizQIndex < activeQuiz.questions.length - 1 ? (
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient"
                        onClick={() => setQuizQIndex((prev) => prev + 1)}
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient"
                        onClick={handleCompleteQuiz}
                      >
                        Submit Assessment
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="quiz-result-view">
                  <div className="quiz-score-badge">
                    <i className="fa-solid fa-award score-icon"></i>
                    <h3>Assessment Completed</h3>
                    <div className="score-big">{quizScore?.score} / {quizScore?.total}</div>
                    <p className="score-pct">{quizScore?.pct}% Accuracy</p>
                  </div>

                  <div className="modal-dialog-footer">
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      onClick={() => handleStartQuiz(activeQuiz)}
                    >
                      Retry Quiz
                    </button>
                    <button
                      type="button"
                      className="c1-btn c1-btn-gradient"
                      onClick={() => setActiveQuiz(null)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Ready for Class?</h4>
            <p>Review your weekly timetable schedule or return to your main student dashboard.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/timetable')}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>Class Timetable</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard Home</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentLMS;
