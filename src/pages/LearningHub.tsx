import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lmsData, LMSCourse, StudyMaterial, VideoLesson, QuizItem } from '../data/lmsData';

export const LearningHub: React.FC = () => {
  const navigate = useNavigate();

  // Load courses from localStorage or fallback
  const [courses] = useState<LMSCourse[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_lms_courses');
      return stored ? JSON.parse(stored) : lmsData.courses;
    } catch {
      return lmsData.courses;
    }
  });

  // Quizzes state to track best score changes
  const [quizzes, setQuizzes] = useState<QuizItem[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_lms_quizzes');
      return stored ? JSON.parse(stored) : lmsData.quizzes;
    } catch {
      return lmsData.quizzes;
    }
  });

  // Search and Filter states
  const [courseSearch, setCourseSearch] = useState('');
  const [matTypeFilter, setMatTypeFilter] = useState('All');

  // Modal / Preview states
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(null);
  
  // Video player modal state
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Active quiz modal state
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizTimer, setQuizTimer] = useState(300); // 5 mins in seconds
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correct: number; total: number; pct: number } | null>(null);

  // Timer effect for Quiz
  useEffect(() => {
    if (!activeQuiz || quizSubmitted) return;

    if (quizTimer <= 0) {
      handleQuizSubmit();
      return;
    }

    const timerInterval = setInterval(() => {
      setQuizTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeQuiz, quizTimer, quizSubmitted]);

  // Calculate overall statistics
  const totalCompletedModules = courses.reduce((acc, c) => acc + c.completedModulesCount, 0);
  const totalModules = courses.reduce((acc, c) => acc + c.moduleCount, 0);
  const calculatedOverallProgress = Math.round((totalCompletedModules / totalModules) * 100);

  // Filtered lists
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.faculty.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredMaterials = lmsData.materials.filter((mat) => {
    const matchType = matTypeFilter === 'All' || mat.type === matTypeFilter;
    return matchType;
  });

  const handleStartQuiz = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setActiveQIndex(0);
    setSelectedAnswers({});
    setQuizTimer(quiz.timeLimit * 60);
    setQuizSubmitted(false);
    setQuizResults(null);
  };

  const handleSelectAnswer = (optIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [activeQIndex]: optIndex
    });
  };

  const handleQuizSubmit = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / activeQuiz.questionsCount) * 100);
    setQuizResults({
      correct: correctCount,
      total: activeQuiz.questionsCount,
      pct: scorePct
    });
    setQuizSubmitted(true);

    // Save best score
    const newScoreStr = `${correctCount}/${activeQuiz.questionsCount}`;
    const nextQuizzes = quizzes.map((q) => {
      if (q.id === activeQuiz.id) {
        // Compare with previous best score
        let isBetter = true;
        if (q.bestScore) {
          const prevScore = parseInt(q.bestScore.split('/')[0]);
          if (prevScore >= correctCount) isBetter = false;
        }
        return {
          ...q,
          status: 'Attempted' as const,
          bestScore: isBetter ? newScoreStr : q.bestScore
        };
      }
      return q;
    });

    setQuizzes(nextQuizzes);
    localStorage.setItem('campushub_lms_quizzes', JSON.stringify(nextQuizzes));
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* LMS Header */}
      <div className="dashboard-header">
        <h1>Learning Hub</h1>
        <p>Learn, practice, and track your academic progress.</p>
      </div>

      {/* 1. Learning progress widgets summary */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <span className="stat-card-trend excellent">{calculatedOverallProgress}%</span>
          </div>
          <div className="stat-card-value">{calculatedOverallProgress}%</div>
          <div className="stat-card-desc">Overall Syllabus Progress</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value">
            {courses.filter((c) => c.progress === 100).length} / {courses.length}
          </div>
          <div className="stat-card-desc">Courses Completed</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </div>
          </div>
          <div className="stat-card-value">
            {lmsData.progress.quizAverage}%
          </div>
          <div className="stat-card-desc">Quiz Average Score</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-fire"></i>
            </div>
            <span className="stat-card-trend critical">7 days</span>
          </div>
          <div className="stat-card-value">7 Days</div>
          <div className="stat-card-desc">Study Day Streak</div>
        </div>
      </div>

      {/* 2. Course Cards Section */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <h3>My Active Courses</h3>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px 6px 28px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((c) => (
              <div key={c.id} className="quick-card" style={{ cursor: 'default', height: '100%', justifyContent: 'space-between', padding: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '15px' }}>
                      <i className={`fa-solid ${c.icon}`}></i>
                    </div>
                    <span className="subject-att-status safe" style={{ fontSize: '9px' }}>{c.progress}% done</span>
                  </div>

                  <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: 'white' }}>{c.title}</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Instructor: {c.faculty}</span>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.4' }}>
                    {c.description}
                  </p>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>Modules progress</span>
                      <span>{c.completedModulesCount} / {c.moduleCount} completed</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.progress}%`, height: '100%', background: 'var(--accent-primary)' }}></div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-signin"
                  style={{ height: '38px', fontSize: '12.5px', marginTop: '20px', marginInline: 0 }}
                  onClick={() => navigate(`/learning/${c.id}`)}
                >
                  Continue Learning
                </button>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No courses found.
            </div>
          )}
        </div>
      </div>

      {/* Secondary split grids: Study Materials & Video lessons */}
      <div className="dashboard-main-grid">
        {/* Study Materials Catalog */}
        <div className="card-panel">
          <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <h3>Study Materials</h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={matTypeFilter}
                onChange={(e) => setMatTypeFilter(e.target.value)}
                style={{
                  background: '#100f2e',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="All">All Types</option>
                <option value="PDF">PDF</option>
                <option value="Notes">Notes</option>
                <option value="Presentation">Presentation</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {filteredMaterials.map((mat) => (
              <div
                key={mat.id}
                className="timetable-item"
                style={{ justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: mat.type === 'PDF' ? 'var(--color-error)' : 'var(--accent-primary)' }}>
                    <i className={`fa-solid ${mat.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-lines'}`} style={{ fontSize: '16px' }}></i>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{mat.title}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      {mat.subject} • {mat.size}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => setActiveMaterial(mat)}
                >
                  View File
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Video Lessons catalog */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3>Video Lessons</h3>
            <i className="fa-solid fa-circle-play" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            {lmsData.videos.map((vid) => (
              <div
                key={vid.id}
                className="timetable-item"
                style={{ justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '42px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-highlight)' }}>
                    <i className="fa-solid fa-play" style={{ fontSize: '11px' }}></i>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{vid.title}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                      {vid.course} • {vid.duration}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => {
                    setActiveVideo(vid);
                    setIsVideoPlaying(true);
                  }}
                >
                  Watch
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practice Quizzes catalog */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Practice Quizzes</h3>
          <i className="fa-solid fa-circle-question" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {quizzes.map((qz) => (
            <div
              key={qz.id}
              className="timetable-item"
              style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px', gap: '14px' }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--accent-highlight)', fontWeight: '600' }}>{qz.subject}</span>
                  <span className={`subject-att-status ${qz.status === 'Attempted' ? 'safe' : 'good'}`} style={{ fontSize: '9px' }}>
                    {qz.status === 'Attempted' ? 'Completed' : 'Not Attempted'}
                  </span>
                </div>
                <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'white' }}>{qz.title}</h4>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  <span>{qz.questionsCount} Questions</span>
                  <span>{qz.timeLimit} Mins Limit</span>
                  {qz.bestScore && (
                    <span style={{ color: '#00d89a' }}>Best Score: {qz.bestScore}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ height: '34px', fontSize: '11.5px', marginInline: 0, marginBlock: 0, width: '100%' }}
                onClick={() => handleStartQuiz(qz)}
              >
                {qz.status === 'Attempted' ? 'Retake Quiz' : 'Start Quiz'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Material File Preview modal */}
      {activeMaterial && (
        <div className="search-modal-overlay" onClick={() => setActiveMaterial(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '18px' }}>{activeMaterial.title}</h2>
              <button type="button" className="btn-search-close" onClick={() => setActiveMaterial(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Subject:</span> <strong style={{ color: 'white' }}>{activeMaterial.subject}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>File Type:</span> <strong style={{ color: 'white' }}>{activeMaterial.type}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>File Size:</span> <strong style={{ color: 'white' }}>{activeMaterial.size}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Uploaded:</span> <strong style={{ color: 'white' }}>{activeMaterial.uploadedDate}</strong></div>
              </div>

              <div style={{ padding: '40px 20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-file-invoice" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
                <p style={{ fontSize: '12.5px' }}>This is a mockup study material resource. PDF viewing requires central LMS credentials.</p>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ height: '40px', fontSize: '13px', margin: 0 }}
                onClick={() => setActiveMaterial(null)}
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Lesson Player Modal */}
      {activeVideo && (
        <div className="search-modal-overlay" onClick={() => { setActiveVideo(null); setIsVideoPlaying(false); }}>
          <div className="search-modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--accent-highlight)', display: 'block' }}>{activeVideo.course}</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{activeVideo.title}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => { setActiveVideo(null); setIsVideoPlaying(false); }}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Mock Video player screen */}
              <div style={{ width: '100%', height: '260px', background: 'black', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ color: 'var(--accent-primary)', fontSize: '42px', animation: isVideoPlaying ? 'pulse 2s infinite' : 'none' }}>
                  <i className={isVideoPlaying ? 'fa-solid fa-tower-broadcast' : 'fa-solid fa-circle-play'}></i>
                </div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '12px' }}>
                  {isVideoPlaying ? 'Streaming Mock Lecture Video...' : 'Paused'}
                </span>
                
                {/* Play/Pause controls overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.8)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    <i className={`fa-solid ${isVideoPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                  <span style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${activeVideo.progress}%`, background: 'var(--accent-primary)', borderRadius: '2px' }}></span>
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{activeVideo.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quizzes Interactive Modal */}
      {activeQuiz && (
        <div className="search-modal-overlay" onClick={() => setActiveQuiz(null)}>
          <div className="search-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10.5px', color: 'var(--accent-highlight)', display: 'block' }}>{activeQuiz.subject}</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{activeQuiz.title}</h2>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: '700', color: 'white' }}>
                Timer: <span style={{ color: 'var(--color-error)' }}>{formatTimer(quizTimer)}</span>
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '260px' }}>
              {!quizSubmitted ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Question {activeQIndex + 1} of {activeQuiz.questionsCount}</span>
                  </div>

                  <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                    {activeQuiz.questions[activeQIndex].question}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeQuiz.questions[activeQIndex].options.map((opt, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          background: selectedAnswers[activeQIndex] === idx ? 'rgba(124,92,255,0.08)' : 'rgba(255,255,255,0.01)',
                          border: selectedAnswers[activeQIndex] === idx ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${activeQIndex}`}
                          checked={selectedAnswers[activeQIndex] === idx}
                          onChange={() => handleSelectAnswer(idx)}
                          style={{ accentColor: 'var(--accent-primary)' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-retry-err"
                      style={{ margin: 0 }}
                      disabled={activeQIndex === 0}
                      onClick={() => setActiveQIndex(activeQIndex - 1)}
                    >
                      Previous
                    </button>
                    
                    {activeQIndex < activeQuiz.questionsCount - 1 ? (
                      <button
                        type="button"
                        className="btn-signin"
                        style={{ width: 'auto', padding: '0 18px', height: '36px', margin: 0 }}
                        onClick={() => setActiveQIndex(activeQIndex + 1)}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-signin"
                        style={{ width: 'auto', padding: '0 20px', height: '36px', margin: 0 }}
                        onClick={handleQuizSubmit}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Results overlay */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 216, 154, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d89a', fontSize: '24px' }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>Quiz Submitted!</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Here is your score performance review.</p>
                  </div>

                  <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                      <span>Correct Answers:</span>
                      <strong style={{ color: '#00d89a' }}>{quizResults?.correct}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                      <span>Incorrect Answers:</span>
                      <strong style={{ color: 'var(--color-error)' }}>{quizResults ? quizResults.total - quizResults.correct : 0}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                      <span>Score Percentage:</span>
                      <strong style={{ color: 'var(--accent-highlight)' }}>{quizResults?.pct}%</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {quizResults && quizResults.pct >= 70 ? 'Excellent work! You have shown a strong command of this topic.' : 'Keep practicing to improve your scores.'}
                  </p>

                  <button
                    type="button"
                    className="btn-signin"
                    style={{ height: '38px', width: 'auto', padding: '0 24px', marginTop: '10px' }}
                    onClick={() => setActiveQuiz(null)}
                  >
                    Close Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LearningHub;
