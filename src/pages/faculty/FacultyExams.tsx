import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export interface FacultyExamItem {
  id: string;
  name: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  maxMarks: number;
  instructions: string;
  studentCount: number;
  status: 'Scheduled' | 'Completed' | 'Valuation Active';
}

export const FacultyExams: React.FC = () => {
  const navigate = useNavigate();

  // Exams state
  const [exams, setExams] = useState<FacultyExamItem[]>([
    {
      id: 'exam-mid-1',
      name: 'Mid-Semester Theory Examination (Midterm 1)',
      courseCode: 'CSE-301',
      courseName: 'Advanced Data Structures & Algorithms',
      date: '25 Aug 2026',
      time: '10:00 AM – 12:00 PM',
      duration: '120 Minutes',
      room: 'Room CSE-204',
      maxMarks: 30,
      instructions: 'Closed-book theoretical assessment. Calculators are allowed for algorithmic complexity calculations.',
      studentCount: 60,
      status: 'Scheduled'
    },
    {
      id: 'exam-lab-1',
      name: 'DBMS End-Semester Practical & Viva Assessment',
      courseCode: 'CSE-302',
      courseName: 'Database Management Systems',
      date: '28 Aug 2026',
      time: '02:00 PM – 05:00 PM',
      duration: '180 Minutes',
      room: 'Computer Lab 3 (Systems 1–60)',
      maxMarks: 70,
      instructions: 'Hands-on SQL schema normalization and PL/SQL stored procedure coding live demonstration.',
      studentCount: 60,
      status: 'Scheduled'
    }
  ]);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<FacultyExamItem | null>(null);

  // Form fields
  const [examName, setExamName] = useState('');
  const [examCourse, setExamCourse] = useState('CSE-301');
  const [examDate, setExamDate] = useState('2026-09-05');
  const [examTime, setExamTime] = useState('10:00 AM - 01:00 PM');
  const [examRoom, setExamRoom] = useState('Room CSE-204');
  const [examMarks, setExamMarks] = useState<number>(30);
  const [examInstructions, setExamInstructions] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) {
      showToast('Please provide an exam title.', 'error');
      return;
    }

    const newEx: FacultyExamItem = {
      id: `exam-${Date.now()}`,
      name: examName,
      courseCode: examCourse,
      courseName: examCourse === 'CSE-301' ? 'Advanced Data Structures' : 'Computer Science Course',
      date: new Date(examDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: examTime,
      duration: '180 Minutes',
      room: examRoom,
      maxMarks: examMarks,
      instructions: examInstructions || 'Standard institutional examination regulations apply.',
      studentCount: 60,
      status: 'Scheduled'
    };

    setExams([...exams, newEx]);
    setIsCreateModalOpen(false);
    setExamName('');
    showToast(`Examination "${examName}" scheduled and published!`, 'success');
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
              <span className="crumb-current">Examination Management</span>
            </div>
            <h1 className="module-title">Examinations & Invigilation</h1>
            <p className="module-subtitle">
              Manage mid-semester evaluations, practical lab assessments, room allocations, and marks valuation entries.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Schedule New Exam</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{exams.length}</span>
              <span className="stat-label">Scheduled Exams</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">120</span>
              <span className="stat-label">Supervised Candidates</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">2 Halls</span>
              <span className="stat-label">Assigned Examination Venues</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>Ready</span>
              <span className="stat-label">Valuation Ledger Portal</span>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="faculty-exams-grid">
          {exams.map((ex) => (
            <div key={ex.id} className="c1-card faculty-exam-card">
              <div className="exam-card-header-row">
                <span className="course-code-tag">{ex.courseCode}</span>
                <span className="c1-badge c1-badge-cyan">
                  <i className="fa-solid fa-calendar-check"></i> {ex.status}
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
                  <span className="e-val">{ex.maxMarks} Marks ({ex.maxMarks <= 30 ? 'Internal' : 'External'})</span>
                </div>
                <div className="e-metric-cell">
                  <span className="e-lbl">Cohort Size</span>
                  <span className="e-val">{ex.studentCount} Students</span>
                </div>
              </div>

              <p className="exam-instructions-snippet">{ex.instructions}</p>

              <div className="exam-card-actions">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedExam(ex)}
                >
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Exam Details</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => navigate('/faculty/results')}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Enter / View Results</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL 1: CREATE EXAM MODAL
            ============================================================ */}
        {isCreateModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsCreateModalOpen(false)}
            title="Schedule Course Examination"
            maxWidth="md"
          >
            <form onSubmit={handleCreateExam} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Examination Name / Title</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Mid-Semester Assessment 2"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Course Subject</label>
                  <select
                    className="c1-select"
                    value={examCourse}
                    onChange={(e) => setExamCourse(e.target.value)}
                  >
                    <option value="CSE-301">CSE-301: Advanced Data Structures</option>
                    <option value="CSE-302">CSE-302: Database Management Systems</option>
                    <option value="CSE-401">CSE-401: Cloud Computing Architecture</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Examination Date</label>
                  <input
                    type="date"
                    className="c1-input"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Time & Duration</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="10:00 AM - 12:00 PM"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Hall / Lab Venue</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Maximum Assessment Marks</label>
                <input
                  type="number"
                  className="c1-input"
                  value={examMarks}
                  onChange={(e) => setExamMarks(Number(e.target.value))}
                  min={10}
                  max={100}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Instructions for Students</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Specify allowed stationery, calculators, and exam guidelines..."
                  value={examInstructions}
                  onChange={(e) => setExamInstructions(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Publish Examination</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EXAM DETAILS MODAL
            ============================================================ */}
        {selectedExam && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedExam(null)}
            title={`Exam Details: ${selectedExam.courseCode}`}
            maxWidth="md"
          >
            <div className="exam-details-dialog-content">
              <div className="dialog-meta-row">
                <span className="course-code-tag">{selectedExam.courseCode}</span>
                <span className="c1-badge c1-badge-cyan">{selectedExam.status}</span>
              </div>

              <h3 className="dialog-exam-name">{selectedExam.name}</h3>
              <p className="dialog-course-sub">{selectedExam.courseName}</p>

              <div className="dialog-exam-meta-grid">
                <div className="d-cell">
                  <span className="d-lbl">Scheduled Date:</span>
                  <span className="d-val">{selectedExam.date}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Session Timing:</span>
                  <span className="d-val">{selectedExam.time} ({selectedExam.duration})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Examination Hall:</span>
                  <span className="d-val">{selectedExam.room}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Max Marks:</span>
                  <span className="d-val">{selectedExam.maxMarks} Marks</span>
                </div>
              </div>

              <div className="dialog-instructions-box">
                <h4>Guidelines & Instructions</h4>
                <p>{selectedExam.instructions}</p>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedExam(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    setSelectedExam(null);
                    navigate('/faculty/results');
                  }}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Enter Student Marks</span>
                </button>
              </div>
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
      </div>
    </AppLayout>
  );
};

export default FacultyExams;
