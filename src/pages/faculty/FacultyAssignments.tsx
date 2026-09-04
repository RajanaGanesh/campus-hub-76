import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, ManagementAssignment, AssignmentSubmission } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const FacultyAssignments: React.FC = () => {
  const mgmt = getManagementData();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'list' | 'submissions'>('list');

  // Assignments state
  const [assignments, setAssignments] = useState<ManagementAssignment[]>(mgmt.assignments);

  // Submissions state
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(mgmt.submissions);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<ManagementAssignment | null>(null);

  // Create Assignment Form
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('CSE-301');
  const [newDueDate, setNewDueDate] = useState('2026-09-10');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [newDesc, setNewDesc] = useState('');

  // Grading Form State
  const [gradeMarks, setGradeMarks] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState('Good implementation. Clear ER diagram modeling.');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Create new assignment handler
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const courseObj = mgmt.courses.find((c) => c.code === newCourseCode);
    const newAss: ManagementAssignment = {
      id: `asg-${Date.now()}`,
      title: newTitle,
      courseCode: newCourseCode,
      courseName: courseObj ? courseObj.name : 'Computer Science Subject',
      description: newDesc,
      dueDate: new Date(newDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      maxMarks: newMaxMarks,
      submissionsCount: 0
    };

    setAssignments([newAss, ...assignments]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    showToast(`Assignment "${newTitle}" created and published to students!`, 'success');
  };

  // Delete assignment handler
  const handleConfirmDelete = () => {
    if (!deletingAssignment) return;
    setAssignments((prev) => prev.filter((a) => a.id !== deletingAssignment.id));
    setDeletingAssignment(null);
    showToast('Assignment deleted successfully.', 'info');
  };

  // Save grade handler
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    if (gradeMarks < 0 || gradeMarks > 100) {
      showToast('Marks must be between 0 and 100.', 'error');
      return;
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === gradingSubmission.id
          ? { ...sub, marks: gradeMarks, status: 'Graded' }
          : sub
      )
    );

    setGradingSubmission(null);
    showToast(`Grade of ${gradeMarks}/100 saved for ${gradingSubmission.studentName}!`, 'success');
  };

  const pendingGradingCount = submissions.filter((s) => s.status !== 'Graded').length;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Assignment Management</span>
            </div>
            <h1 className="module-title">Course Assignments & Grading</h1>
            <p className="module-subtitle">
              Create academic homework tasks, monitor cohort submission rates, evaluate code/documents, and issue grades.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Create New Assignment</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{assignments.length}</span>
              <span className="stat-label">Active Assignments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-file-arrow-up"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{submissions.length}</span>
              <span className="stat-label">Submitted Solutions</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{pendingGradingCount}</span>
              <span className="stat-label">Pending Evaluation</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">86 / 100</span>
              <span className="stat-label">Average Cohort Score</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>Assignments List ({assignments.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            <i className="fa-solid fa-pen-to-square"></i>
            <span>Student Submissions & Evaluation ({submissions.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: ASSIGNMENT LIST
            ============================================================ */}
        {activeTab === 'list' && (
          <div className="c1-card faculty-assignments-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Published Coursework Tasks</h3>
                <p className="c1-card-subtitle">Active and past assignments across your courses</p>
              </div>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Task</span>
              </button>
            </div>

            <div className="assignments-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Assignment Title</th>
                    <th>Deadline</th>
                    <th>Maximum Marks</th>
                    <th>Submissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asg) => (
                    <tr key={asg.id}>
                      <td><span className="course-code-tag">{asg.courseCode}</span></td>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{asg.title}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{asg.description}</p>
                        </div>
                      </td>
                      <td><strong>{asg.dueDate}</strong></td>
                      <td>{asg.maxMarks} Marks</td>
                      <td>
                        <span className="c1-badge c1-badge-cyan">
                          <i className="fa-solid fa-users"></i> {asg.submissionsCount || 54} Submissions
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => setActiveTab('submissions')}
                          >
                            <i className="fa-solid fa-clipboard-check"></i>
                            <span>Evaluate</span>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-icon-only"
                            style={{ width: '30px', height: '30px', padding: 0 }}
                            onClick={() => setDeletingAssignment(asg)}
                            title="Delete assignment"
                          >
                            <i className="fa-solid fa-trash-can" style={{ color: 'var(--color-error)' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: SUBMISSIONS & GRADING
            ============================================================ */}
        {activeTab === 'submissions' && (
          <div className="c1-card faculty-submissions-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">Student Submissions & Evaluation Ledger</h3>
                <p className="c1-card-subtitle">Review submitted work files and enter evaluation scores</p>
              </div>
              <span className="c1-badge c1-badge-warning">{pendingGradingCount} Pending Grading</span>
            </div>

            <div className="submissions-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Candidate</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Awarded Marks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td><span className="course-code-cell">{sub.studentId}</span></td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{sub.studentName}</strong>
                      </td>
                      <td>{sub.submittedDate}</td>
                      <td>
                        {sub.status === 'Graded' ? (
                          <span className="c1-badge c1-badge-success">
                            <i className="fa-solid fa-circle-check"></i> Graded
                          </span>
                        ) : sub.status === 'Late' ? (
                          <span className="c1-badge c1-badge-error">Late Submission</span>
                        ) : (
                          <span className="c1-badge c1-badge-warning">
                            <i className="fa-solid fa-clock"></i> Needs Grading
                          </span>
                        )}
                      </td>
                      <td>
                        {sub.marks !== null ? (
                          <strong style={{ color: '#38bdf8' }}>{sub.marks} / 100</strong>
                        ) : (
                          <span className="text-muted">Not evaluated</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="c1-btn c1-btn-gradient"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeMarks(sub.marks !== null ? sub.marks : 85);
                          }}
                        >
                          <i className="fa-solid fa-pen"></i>
                          <span>{sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL 1: CREATE ASSIGNMENT MODAL
            ============================================================ */}
        {isCreateModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsCreateModalOpen(false)}
            title="Create New Coursework Assignment"
            maxWidth="md"
          >
            <form onSubmit={handleCreateAssignment} className="faculty-form-stack">
              <div className="form-field-wrap">
                <label className="form-label">Assignment Title</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Dynamic Programming & Knapsack Problem Analysis"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Course Subject</label>
                  <select
                    className="c1-select"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                  >
                    <option value="CSE-301">CSE-301: Advanced Data Structures</option>
                    <option value="CSE-302">CSE-302: Database Management Systems</option>
                    <option value="CSE-401">CSE-401: Cloud Computing Architecture</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Submission Due Date</label>
                  <input
                    type="date"
                    className="c1-input"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Maximum Marks</label>
                <input
                  type="number"
                  className="c1-input"
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(Number(e.target.value))}
                  min={10}
                  max={100}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Assignment Brief & Instructions</label>
                <textarea
                  className="c1-textarea"
                  rows={4}
                  placeholder="Provide problem statements, formatting requirements, and submission instructions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
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
                  <span>Publish Assignment</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: GRADE SUBMISSION MODAL
            ============================================================ */}
        {gradingSubmission && (
          <Modal
            isOpen={true}
            onClose={() => setGradingSubmission(null)}
            title={`Grade: ${gradingSubmission.studentName}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveGrade} className="faculty-form-stack">
              <div className="c1-alert c1-alert-info" role="alert">
                <i className="fa-solid fa-file-pdf"></i>
                <div style={{ fontSize: '0.8125rem' }}>
                  Evaluating submitted document: <strong>{gradingSubmission.studentId}_Solution.pdf</strong> (Submitted on {gradingSubmission.submittedDate})
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Marks Awarded (out of 100)</label>
                <input
                  type="number"
                  className="c1-input"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(Number(e.target.value))}
                  min={0}
                  max={100}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Evaluation Feedback & Constructive Comments</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Provide constructive feedback on technical accuracy and presentation..."
                  required
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setGradingSubmission(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Save Evaluation Grade</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: DELETE CONFIRMATION MODAL
            ============================================================ */}
        {deletingAssignment && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingAssignment(null)}
            title="Delete Assignment"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="confirm-heading">Delete Assignment?</h3>
              <p className="confirm-body-text">
                Are you sure you want to delete <strong>"{deletingAssignment.title}"</strong>? This will remove the task for all enrolled students. This action cannot be undone.
              </p>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingAssignment(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: 'var(--color-error)' }}
                  onClick={handleConfirmDelete}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Delete Task</span>
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

export default FacultyAssignments;
