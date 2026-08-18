import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export interface AdminExamItem {
  id: string;
  name: string;
  courseCode: string;
  department: string;
  date: string;
  time: string;
  room: string;
  invigilator: string;
  studentCount: number;
  status: 'Scheduled' | 'Completed';
}

export const AdminExams: React.FC = () => {
  const [exams, setExams] = useState<AdminExamItem[]>([
    {
      id: 'ex-1',
      name: 'Mid-Semester Theory Examination 1',
      courseCode: 'CSE-301',
      department: 'Computer Science',
      date: '2026-08-25',
      time: '10:00 AM – 12:00 PM',
      room: 'Room CSE-204',
      invigilator: 'Dr. Suresh Kumar',
      studentCount: 60,
      status: 'Scheduled'
    },
    {
      id: 'ex-2',
      name: 'DBMS End-Semester Practical Assessment',
      courseCode: 'CSE-302',
      department: 'Computer Science',
      date: '2026-08-28',
      time: '02:00 PM – 05:00 PM',
      room: 'Computer Lab 3',
      invigilator: 'Dr. Priya Menon',
      studentCount: 60,
      status: 'Scheduled'
    },
    {
      id: 'ex-3',
      name: 'VLSI Digital Signal Processing Midterm',
      courseCode: 'ECE-301',
      department: 'Electronics',
      date: '2026-08-26',
      time: '10:00 AM – 12:00 PM',
      room: 'Seminar Hall 1',
      invigilator: 'Dr. Rajesh Verma',
      studentCount: 60,
      status: 'Scheduled'
    }
  ]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [examName, setExamName] = useState('');
  const [examCode, setExamCode] = useState('CSE-401');
  const [examDept, setExamDept] = useState('Computer Science');
  const [examDate, setExamDate] = useState('2026-09-02');
  const [examTime, setExamTime] = useState('10:00 AM – 01:00 PM');
  const [examRoom, setExamRoom] = useState('Room CSE-204');
  const [examInvigilator, setExamInvigilator] = useState('Dr. Suresh Kumar');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examRoom.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    // Schedule conflict detection
    const hasConflict = exams.some(
      (ex) => ex.date === examDate && ex.room.toLowerCase() === examRoom.toLowerCase() && ex.time === examTime
    );

    if (hasConflict) {
      showToast(`Schedule conflict detected! ${examRoom} is already occupied on ${examDate} at ${examTime}.`, 'error');
      return;
    }

    const newEx: AdminExamItem = {
      id: `ex-${Date.now()}`,
      name: examName.trim(),
      courseCode: examCode,
      department: examDept,
      date: examDate,
      time: examTime,
      room: examRoom,
      invigilator: examInvigilator,
      studentCount: 60,
      status: 'Scheduled'
    };

    setExams([...exams, newEx]);
    setIsAddModalOpen(false);
    setExamName('');
    showToast(`Examination "${newEx.name}" scheduled with 0 room conflicts!`, 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Examination Management</span>
            </div>
            <h1 className="module-title">University Examinations & Hall Allotment</h1>
            <p className="module-subtitle">
              Configure institutional exam calendars, validate room conflict schedules, and assign faculty invigilators.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-calendar-plus"></i>
              <span>Schedule Examination</span>
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
              <span className="stat-num">{exams.length * 4}</span>
              <span className="stat-label">Scheduled Exam Papers</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">8 Halls</span>
              <span className="stat-label">Invigilation Venues</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>0 Conflicts</span>
              <span className="stat-label">Room Conflict Validator</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,240</span>
              <span className="stat-label">Supervised Candidates</span>
            </div>
          </div>
        </div>

        {/* Exams Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Institutional Exam Schedule ({exams.length} Papers)</h3>
              <p className="c1-card-subtitle">Conflict-checked seating and invigilation master registry</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Exam</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Paper Code</th>
                  <th>Exam Title</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Examination Hall</th>
                  <th>Invigilator</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex) => (
                  <tr key={ex.id}>
                    <td><span className="course-code-tag">{ex.courseCode}</span></td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{ex.name}</strong>
                    </td>
                    <td>{ex.department}</td>
                    <td>
                      <div>
                        <strong>{ex.date}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.time}</div>
                      </div>
                    </td>
                    <td><strong style={{ color: '#38bdf8' }}>{ex.room}</strong></td>
                    <td>{ex.invigilator}</td>
                    <td>
                      <span className="c1-badge c1-badge-cyan">{ex.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL: SCHEDULE EXAM MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Schedule University Examination"
            maxWidth="md"
          >
            <form onSubmit={handleCreateExam} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Examination Title</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. End-Semester Theory Paper"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Course Subject Code</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={examCode}
                    onChange={(e) => setExamCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Department</label>
                  <select
                    className="c1-select"
                    value={examDept}
                    onChange={(e) => setExamDept(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Exam Date</label>
                  <input
                    type="date"
                    className="c1-input"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Session Timing</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Exam Hall / Lab Room</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Faculty Invigilator</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={examInvigilator}
                    onChange={(e) => setExamInvigilator(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Validate & Schedule</span>
                </button>
              </div>
            </form>
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

export default AdminExams;
