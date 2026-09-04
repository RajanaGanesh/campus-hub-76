import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

interface StudentAttendanceEntry {
  id: string;
  name: string;
  status: 'Present' | 'Absent';
}

interface AttendanceHistoryRecord {
  id: string;
  date: string;
  courseCode: string;
  section: string;
  presentCount: number;
  absentCount: number;
  totalStudents: number;
  percentage: number;
}

export const FacultyAttendance: React.FC = () => {
  const mgmt = getManagementData();

  // Active section / course selection
  const [selectedCourseCode, setSelectedCourseCode] = useState('CSE-301');
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState('2026-08-18');

  // Active student roster entries for attendance
  const [roster, setRoster] = useState<StudentAttendanceEntry[]>(() => {
    return mgmt.students.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.attendancePercent > 70 ? 'Present' : 'Absent'
    }));
  });

  // Attendance History records
  const [history, setHistory] = useState<AttendanceHistoryRecord[]>([
    {
      id: 'att-hist-1',
      date: '17 Aug 2026',
      courseCode: 'CSE-301',
      section: 'Section A',
      presentCount: 54,
      absentCount: 6,
      totalStudents: 60,
      percentage: 90
    },
    {
      id: 'att-hist-2',
      date: '15 Aug 2026',
      courseCode: 'CSE-302',
      section: 'Section B',
      presentCount: 52,
      absentCount: 8,
      totalStudents: 60,
      percentage: 86
    },
    {
      id: 'att-hist-3',
      date: '14 Aug 2026',
      courseCode: 'CSE-401',
      section: 'Section A',
      presentCount: 58,
      absentCount: 2,
      totalStudents: 60,
      percentage: 96
    }
  ]);

  // Modals & Dialogs
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle individual student attendance
  const handleToggleStatus = (id: string) => {
    setRoster((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' } : s))
    );
  };

  // Bulk actions
  const handleMarkAllPresent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
    showToast('All students marked as Present.', 'info');
  };

  const handleMarkAllAbsent = () => {
    setRoster((prev) => prev.map((s) => ({ ...s, status: 'Absent' })));
    showToast('All students marked as Absent.', 'warning');
  };

  const handleResetAttendance = () => {
    setRoster(
      mgmt.students.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.attendancePercent > 70 ? 'Present' : 'Absent'
      }))
    );
    showToast('Attendance reset to defaults.', 'info');
  };

  // Derived counts
  const presentCount = roster.filter((s) => s.status === 'Present').length;
  const absentCount = roster.length - presentCount;
  const currentPercentage = Math.round((presentCount / (roster.length || 1)) * 100);

  // Confirm save
  const handleConfirmSave = () => {
    const newRecord: AttendanceHistoryRecord = {
      id: `att-hist-${Date.now()}`,
      date: new Date(attendanceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      courseCode: selectedCourseCode,
      section: `Section ${selectedSection}`,
      presentCount,
      absentCount,
      totalStudents: roster.length,
      percentage: currentPercentage
    };

    setHistory([newRecord, ...history]);
    setIsConfirmModalOpen(false);
    showToast(`Attendance recorded successfully for ${selectedCourseCode} (Section ${selectedSection})!`, 'success');
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
              <span className="crumb-current">Attendance Management</span>
            </div>
            <h1 className="module-title">Class Attendance & Roll Call</h1>
            <p className="module-subtitle">
              Mark student attendance for assigned lecture sessions, apply bulk markers, and review historical logs.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>Save Class Attendance</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{roster.length} Students</span>
              <span className="stat-label">Section Strength</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{presentCount}</span>
              <span className="stat-label">Present Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-xmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>{absentCount}</span>
              <span className="stat-label">Absent Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentPercentage}%</span>
              <span className="stat-label">Session Attendance Rate</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'mark' ? 'active' : ''}`}
            onClick={() => setActiveTab('mark')}
          >
            <i className="fa-solid fa-clipboard-user"></i>
            <span>Mark Attendance</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Attendance History ({history.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: MARK ATTENDANCE
            ============================================================ */}
        {activeTab === 'mark' && (
          <div className="attendance-marking-view">
            {/* Session Selector Toolbar */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
              <div className="filters-row-wrap" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="filter-select-item">
                    <label htmlFor="select-att-course">Course Subject</label>
                    <select
                      id="select-att-course"
                      className="c1-select"
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                    >
                      <option value="CSE-301">CSE-301: Advanced Data Structures</option>
                      <option value="CSE-302">CSE-302: Database Management Systems</option>
                      <option value="CSE-401">CSE-401: Cloud Computing Architecture</option>
                      <option value="CSE-402">CSE-402: Software Engineering & Agile</option>
                    </select>
                  </div>

                  <div className="filter-select-item">
                    <label htmlFor="select-att-sec">Section</label>
                    <select
                      id="select-att-sec"
                      className="c1-select"
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      <option value="A">Section A (Room CSE-204)</option>
                      <option value="B">Section B (Computer Lab 2)</option>
                    </select>
                  </div>

                  <div className="filter-select-item">
                    <label htmlFor="select-att-date">Lecture Date</label>
                    <input
                      type="date"
                      id="select-att-date"
                      className="c1-input"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      style={{ padding: '7px 12px' }}
                    />
                  </div>
                </div>

                {/* Bulk Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={handleMarkAllPresent}
                  >
                    <i className="fa-solid fa-check-double"></i>
                    <span>All Present</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={handleMarkAllAbsent}
                  >
                    <i className="fa-solid fa-xmark"></i>
                    <span>All Absent</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={handleResetAttendance}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="c1-card attendance-roster-card">
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">{selectedCourseCode} (Section {selectedSection}) Attendance Roster</h3>
                  <p className="c1-card-subtitle">Click student status button to toggle Present / Absent</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="c1-badge c1-badge-success">{presentCount} Present</span>
                  <span className="c1-badge c1-badge-error">{absentCount} Absent</span>
                </div>
              </div>

              <div className="attendance-roster-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Candidate</th>
                      <th>Assigned Course</th>
                      <th>Class Section</th>
                      <th>Attendance Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((stu) => (
                      <tr key={stu.id}>
                        <td><span className="course-code-cell">{stu.id}</span></td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{stu.name}</strong>
                        </td>
                        <td>{selectedCourseCode}</td>
                        <td>Section {selectedSection}</td>
                        <td>
                          {stu.status === 'Present' ? (
                            <span className="attendance-status-pill present">
                              <i className="fa-solid fa-circle-check"></i> Present
                            </span>
                          ) : (
                            <span className="attendance-status-pill absent">
                              <i className="fa-solid fa-circle-xmark"></i> Absent
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`c1-btn ${stu.status === 'Present' ? 'c1-btn-secondary' : 'c1-btn-gradient'}`}
                            style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                            onClick={() => handleToggleStatus(stu.id)}
                          >
                            <span>Toggle to {stu.status === 'Present' ? 'Absent' : 'Present'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: ATTENDANCE HISTORY
            ============================================================ */}
        {activeTab === 'history' && (
          <div className="c1-card attendance-history-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Past Attendance Records</h3>
                <p className="c1-card-subtitle">Historical log of class roll calls and section statistics</p>
              </div>
              <span className="c1-badge c1-badge-cyan">{history.length} Sessions Logged</span>
            </div>

            <div className="history-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course Code</th>
                    <th>Section</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                    <th>Audit Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec.id}>
                      <td><strong>{rec.date}</strong></td>
                      <td><span className="course-code-cell">{rec.courseCode}</span></td>
                      <td>{rec.section}</td>
                      <td><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{rec.presentCount} Students</span></td>
                      <td><span style={{ color: 'var(--color-error)', fontWeight: 700 }}>{rec.absentCount} Students</span></td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{rec.percentage}%</strong>
                      </td>
                      <td>
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-check"></i> Recorded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: CONFIRM SAVE ATTENDANCE DIALOG
            ============================================================ */}
        {isConfirmModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsConfirmModalOpen(false)}
            title="Confirm Attendance Submission"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <h3 className="confirm-heading">Submit Class Attendance?</h3>
              <p className="confirm-body-text">
                You are about to save attendance records for <strong>{roster.length} students</strong> in <strong>{selectedCourseCode} ({`Section ${selectedSection}`})</strong> for lecture date <strong>{attendanceDate}</strong>.
              </p>

              <div className="confirm-summary-pill-row">
                <span className="c1-badge c1-badge-success">{presentCount} Present</span>
                <span className="c1-badge c1-badge-error">{absentCount} Absent</span>
                <span className="c1-badge c1-badge-cyan">{currentPercentage}% Attendance</span>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handleConfirmSave}
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Confirm & Save</span>
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

export default FacultyAttendance;
