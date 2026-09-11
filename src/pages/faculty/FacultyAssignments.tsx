import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getManagementData, saveManagementData, getFacultyAssignedCourses, CourseRecord, ManagementAssignment, AssignmentSubmission } from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const FacultyAssignments: React.FC = () => {
  const { user } = useAuth();
  // Assignments & submissions state loaded from centralized persistent storage
  const [assignments, setAssignments] = useState<ManagementAssignment[]>(() => getManagementData().assignments);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => getManagementData().submissions);
  const [courses, setCourses] = useState<CourseRecord[]>(() => getFacultyAssignedCourses(user));

  // Active section tab & filters
  const [activeTab, setActiveTab] = useState<'list' | 'submissions'>('list');
  const [selectedAssignmentFilter, setSelectedAssignmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<ManagementAssignment | null>(null);

  // Create Assignment Form
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState<string>(() => {
    const assigned = getFacultyAssignedCourses(user);
    return assigned.length > 0 ? assigned[0].code : 'CSE-301';
  });
  const [newDueDate, setNewDueDate] = useState('2026-09-10');
  const [newMaxMarks, setNewMaxMarks] = useState<number>(100);
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDesc, setNewDesc] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Grading Form State
  const [gradeMarks, setGradeMarks] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState('Good implementation. Clear documentation and correct methodology.');

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real-time bidirectional synchronization listener
  const refreshFromStorage = useCallback(() => {
    const mgmt = getManagementData();
    setAssignments(mgmt.assignments);
    setSubmissions(mgmt.submissions);
    setCourses(getFacultyAssignedCourses(user));
  }, [user]);

  useEffect(() => {
    refreshFromStorage();

    const handleSync = () => {
      refreshFromStorage();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_assignments_updated', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_assignments_updated', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
    };
  }, [refreshFromStorage]);

  // Create new assignment handler
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const mgmt = getManagementData();
    const courseObj = mgmt.courses.find((c) => c.code === newCourseCode);
    const newAss: ManagementAssignment = {
      id: `ASSIGN-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      courseCode: newCourseCode,
      courseName: courseObj ? courseObj.name : 'Computer Science Subject',
      facultyName: 'Dr. Suresh Kumar',
      description: newDesc.trim(),
      instructions: newInstructions.trim() || 'Submit a clean PDF report, ZIP archive, or source code files.',
      dueDate: new Date(newDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: newPriority,
      maxMarks: newMaxMarks,
      submissionsCount: 0
    };

    const updatedAssignments = [newAss, ...mgmt.assignments];
    const updatedMgmt = { ...mgmt, assignments: updatedAssignments };
    saveManagementData(updatedMgmt);
    setAssignments(updatedAssignments);

    // Notify all portals
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_assignments_updated'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewInstructions('');
    showToast(`Assignment "${newTitle}" created and published to students!`, 'success');
  };

  // Delete assignment handler
  const handleConfirmDelete = () => {
    if (!deletingAssignment) return;
    const mgmt = getManagementData();
    const updatedAssignments = mgmt.assignments.filter((a) => a.id !== deletingAssignment.id);
    const updatedSubmissions = mgmt.submissions.filter((s) => s.assignmentId !== deletingAssignment.id);
    
    const updatedMgmt = {
      ...mgmt,
      assignments: updatedAssignments,
      submissions: updatedSubmissions
    };

    saveManagementData(updatedMgmt);
    setAssignments(updatedAssignments);
    setSubmissions(updatedSubmissions);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_assignments_updated'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    setDeletingAssignment(null);
    showToast('Assignment deleted successfully.', 'info');
  };

  // Open grading modal with prefilled data
  const handleOpenGradeModal = (sub: AssignmentSubmission) => {
    setGradingSubmission(sub);
    const parentAsg = assignments.find((a) => a.id === sub.assignmentId);
    const max = parentAsg?.maxMarks || 100;
    setGradeMarks(sub.marks !== null && sub.marks !== undefined ? sub.marks : Math.round(max * 0.85));
    setGradeFeedback(sub.feedback || 'Good implementation. Clear documentation and correct methodology.');
  };

  // Save grade handler
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    const parentAsg = assignments.find((a) => a.id === gradingSubmission.assignmentId);
    const maxMarks = parentAsg?.maxMarks || 100;

    if (gradeMarks < 0 || gradeMarks > maxMarks) {
      showToast(`Marks must be between 0 and ${maxMarks}.`, 'error');
      return;
    }

    dbService.gradeAssignmentSubmission(gradingSubmission.id, gradeMarks, gradeFeedback.trim()).catch((err) => {
      console.warn('Grade persistence notice:', err);
    });

    const mgmt = getManagementData();
    setSubmissions(mgmt.submissions);

    // Notify student portal in real-time
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_assignments_updated'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    setGradingSubmission(null);
    showToast(`Grade of ${gradeMarks}/${maxMarks} saved for ${gradingSubmission.studentName}!`, 'success');
  };

  // Switch to Submissions tab filtered by specific assignment
  const handleEvaluateAssignment = (asgId: string) => {
    setSelectedAssignmentFilter(asgId);
    setActiveTab('submissions');
  };

  // Quick feedback template picker
  const setFeedbackTemplate = (template: string) => {
    setGradeFeedback(template);
  };

  // File icon helper
  const getFileIcon = (fileName?: string) => {
    if (!fileName) return 'fa-file-pdf';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'zip' || ext === 'rar') return 'fa-file-zipper';
    if (['py', 'java', 'cpp', 'c', 'js', 'ts', 'sql', 'html'].includes(ext || '')) return 'fa-file-code';
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return 'fa-file-image';
    if (ext === 'docx' || ext === 'doc') return 'fa-file-word';
    return 'fa-file-lines';
  };

  // Calculated stats
  const pendingGradingCount = submissions.filter((s) => s.status !== 'Graded').length;
  const gradedCount = submissions.filter((s) => s.status === 'Graded').length;

  // Filtered Submissions List for Tab 2
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // Assignment Filter
      if (selectedAssignmentFilter !== 'all' && sub.assignmentId !== selectedAssignmentFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter === 'pending' && sub.status === 'Graded') return false;
      if (statusFilter === 'graded' && sub.status !== 'Graded') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const parentAsg = assignments.find((a) => a.id === sub.assignmentId);
        const matchRoll = sub.studentId.toLowerCase().includes(q);
        const matchName = sub.studentName.toLowerCase().includes(q);
        const matchFile = (sub.fileName || '').toLowerCase().includes(q);
        const matchTitle = (parentAsg?.title || '').toLowerCase().includes(q);
        const matchCourse = (parentAsg?.courseCode || '').toLowerCase().includes(q);

        if (!matchRoll && !matchName && !matchFile && !matchTitle && !matchCourse) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, assignments, selectedAssignmentFilter, statusFilter, searchQuery]);

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
            <h1 className="module-title">Course Assignments & Grading Desk</h1>
            <p className="module-subtitle">
              Create academic coursework tasks, monitor student submission rates, evaluate submitted solution files, and issue grades.
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
          <div className="c1-card academic-stat-card" onClick={() => setActiveTab('list')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{assignments.length}</span>
              <span className="stat-label">Active Assignments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => { setActiveTab('submissions'); setStatusFilter('all'); }} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-file-arrow-up"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{submissions.length}</span>
              <span className="stat-label">Student Submissions</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => { setActiveTab('submissions'); setStatusFilter('pending'); }} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{pendingGradingCount}</span>
              <span className="stat-label">Pending Evaluation</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card" onClick={() => { setActiveTab('submissions'); setStatusFilter('graded'); }} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{gradedCount}</span>
              <span className="stat-label">Graded & Completed</span>
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
            {pendingGradingCount > 0 && (
              <span className="c1-badge c1-badge-warning" style={{ marginLeft: '6px', fontSize: '0.7rem', padding: '2px 6px' }}>
                {pendingGradingCount} Pending
              </span>
            )}
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
                <p className="c1-card-subtitle">Active and past coursework assignments across your assigned subjects</p>
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
                    <th>Course Subject</th>
                    <th>Assignment Title</th>
                    <th>Deadline</th>
                    <th>Maximum Marks</th>
                    <th>Cohort Submissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length > 0 ? (
                    assignments.map((asg) => {
                      const asgSubmissionsCount = submissions.filter((s) => s.assignmentId === asg.id).length;
                      const asgPendingCount = submissions.filter((s) => s.assignmentId === asg.id && s.status !== 'Graded').length;

                      return (
                        <tr key={asg.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span className="course-code-tag" style={{ width: 'fit-content' }}>{asg.courseCode}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{asg.courseName}</span>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{asg.title}</strong>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.4', maxWidth: '380px' }}>
                                {asg.description}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{asg.dueDate}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Created {asg.createdDate || 'Recent'}</div>
                            </div>
                          </td>
                          <td>
                            <span className="c1-badge c1-badge-cyan">{asg.maxMarks} Marks</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span className="c1-badge c1-badge-success" style={{ width: 'fit-content' }}>
                                <i className="fa-solid fa-users"></i> {asgSubmissionsCount} Submitted
                              </span>
                              {asgPendingCount > 0 && (
                                <span className="c1-badge c1-badge-warning" style={{ width: 'fit-content', fontSize: '0.68rem' }}>
                                  {asgPendingCount} Needs Grading
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="c1-btn c1-btn-gradient"
                                style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                                onClick={() => handleEvaluateAssignment(asg.id)}
                              >
                                <i className="fa-solid fa-clipboard-check"></i>
                                <span>Evaluate ({asgSubmissionsCount})</span>
                              </button>
                              <button
                                type="button"
                                className="c1-btn c1-btn-secondary btn-icon-only"
                                style={{ width: '32px', height: '32px', padding: 0 }}
                                onClick={() => setDeletingAssignment(asg)}
                                title="Delete assignment"
                              >
                                <i className="fa-solid fa-trash-can" style={{ color: 'var(--color-error)' }}></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-folder-open" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', opacity: 0.5 }}></i>
                        No coursework assignments found. Click "Create New Assignment" to publish a task.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: SUBMISSIONS & EVALUATION LEDGER
            ============================================================ */}
        {activeTab === 'submissions' && (
          <div className="c1-card faculty-submissions-card">
            {/* Table Header & Controls */}
            <div className="c1-card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 className="c1-card-title">Student Submissions & Evaluation Ledger</h3>
                <p className="c1-card-subtitle">Review submitted student solution files, inspect student comments, and record evaluation grades</p>
              </div>

              {/* Filter Controls Row */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Assignment Filter */}
                <select
                  className="c1-select"
                  style={{ minWidth: '200px', fontSize: '0.8125rem', padding: '6px 10px' }}
                  value={selectedAssignmentFilter}
                  onChange={(e) => setSelectedAssignmentFilter(e.target.value)}
                >
                  <option value="all">All Assignments ({submissions.length})</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.courseCode}: {a.title}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="c1-select"
                  style={{ minWidth: '140px', fontSize: '0.8125rem', padding: '6px 10px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Needs Grading ({pendingGradingCount})</option>
                  <option value="graded">Graded ({gradedCount})</option>
                </select>

                {/* Search Box */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="Search roll no, student, file..."
                    style={{ fontSize: '0.8125rem', padding: '6px 10px 6px 30px', minWidth: '180px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i
                    className="fa-solid fa-magnifying-glass"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  ></i>
                </div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="submissions-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Candidate</th>
                    <th>Assignment & Subject</th>
                    <th>Submitted Document</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Awarded Marks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => {
                      const parentAsg = assignments.find((a) => a.id === sub.assignmentId);
                      const maxMarks = parentAsg?.maxMarks || 100;

                      return (
                        <tr key={sub.id}>
                          <td>
                            <span className="course-code-cell" style={{ fontWeight: '700', color: 'var(--accent-highlight)' }}>
                              {sub.studentId}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>{sub.studentName}</strong>
                            </div>
                          </td>
                          <td>
                            <div>
                              <span className="course-code-tag" style={{ fontSize: '0.68rem', marginRight: '6px' }}>
                                {parentAsg?.courseCode || 'CSE-301'}
                              </span>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                {parentAsg?.title || sub.assignmentId}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  background: 'rgba(56, 189, 248, 0.12)',
                                  color: '#38bdf8',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem'
                                }}
                              >
                                <i className={`fa-solid ${getFileIcon(sub.fileName)}`}></i>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                  {sub.fileName || `${sub.studentId}_Solution.pdf`}
                                </div>
                                {sub.comments && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    "{sub.comments}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem' }}>{sub.submittedDate}</span>
                          </td>
                          <td>
                            {sub.status === 'Graded' ? (
                              <span className="c1-badge c1-badge-success">
                                <i className="fa-solid fa-circle-check"></i> Graded
                              </span>
                            ) : sub.status === 'Late' ? (
                              <span className="c1-badge c1-badge-error">
                                <i className="fa-solid fa-triangle-exclamation"></i> Late
                              </span>
                            ) : (
                              <span className="c1-badge c1-badge-warning">
                                <i className="fa-solid fa-clock"></i> Needs Grading
                              </span>
                            )}
                          </td>
                          <td>
                            {sub.marks !== null && sub.marks !== undefined ? (
                              <strong style={{ color: '#38bdf8', fontSize: '0.9rem' }}>
                                {sub.marks} / {maxMarks}
                              </strong>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not evaluated</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={sub.status === 'Graded' ? 'c1-btn c1-btn-secondary' : 'c1-btn c1-btn-gradient'}
                              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
                              onClick={() => handleOpenGradeModal(sub)}
                            >
                              <i className={sub.status === 'Graded' ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-pen'}></i>
                              <span>{sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: '24px', display: 'block', marginBottom: '8px', opacity: 0.5 }}></i>
                        No student submissions match the selected criteria.
                      </td>
                    </tr>
                  )}
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
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}: {c.name}
                      </option>
                    ))}
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

              <div className="form-fields-two-col">
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
                  <label className="form-label">Priority Level</label>
                  <select
                    className="c1-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Assignment Brief & Description</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Provide problem statements and theoretical context..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Submission Instructions (Optional)</label>
                <textarea
                  className="c1-textarea"
                  rows={2}
                  placeholder="e.g. Submit a single PDF report with screenshots and code snippets."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
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
        {gradingSubmission && (() => {
          const parentAsg = assignments.find((a) => a.id === gradingSubmission.assignmentId);
          const maxMarks = parentAsg?.maxMarks || 100;

          return (
            <Modal
              isOpen={true}
              onClose={() => setGradingSubmission(null)}
              title={`Evaluate: ${gradingSubmission.studentName} (${gradingSubmission.studentId})`}
              maxWidth="md"
            >
              <form onSubmit={handleSaveGrade} className="faculty-form-stack">
                {/* Coursework & Submission Document Box */}
                <div className="c1-alert c1-alert-info" role="alert" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {parentAsg?.courseCode}: {parentAsg?.title || gradingSubmission.assignmentId}
                    </span>
                    <span className="c1-badge c1-badge-cyan">Max Allowance: {maxMarks} Marks</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.8125rem' }}>
                    <i className={`fa-solid ${getFileIcon(gradingSubmission.fileName)}`} style={{ fontSize: '18px', color: '#38bdf8' }}></i>
                    <div>
                      <div>Uploaded File: <strong>{gradingSubmission.fileName || `${gradingSubmission.studentId}_Solution.pdf`}</strong></div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Submitted on {gradingSubmission.submittedDate}</div>
                    </div>
                  </div>

                  {gradingSubmission.comments && (
                    <div style={{ marginTop: '6px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <strong style={{ color: 'var(--accent-highlight)' }}>Student's Notes:</strong> {gradingSubmission.comments}
                    </div>
                  )}
                </div>

                {/* Marks Awarded Input */}
                <div className="form-field-wrap">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Marks Awarded (Out of {maxMarks})</label>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Passing Threshold: {Math.round(maxMarks * 0.4)}</span>
                  </div>
                  <input
                    type="number"
                    className="c1-input"
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(Number(e.target.value))}
                    min={0}
                    max={maxMarks}
                    required
                  />
                </div>

                {/* Quick Feedback Presets */}
                <div className="form-field-wrap">
                  <label className="form-label" style={{ marginBottom: '6px' }}>Quick Feedback Presets</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      'Excellent work! Full marks awarded.',
                      'Good implementation. Clear documentation.',
                      'Accurate solution with well-formatted code.',
                      'Minor errors in edge case validation. Good attempt.',
                      'Late submission received. Deducted penalty points.'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="c1-badge"
                        style={{ background: 'var(--card-bg-subtle)', cursor: 'pointer', border: '1px solid var(--border-color)', fontSize: '0.72rem', padding: '4px 8px' }}
                        onClick={() => setFeedbackTemplate(preset)}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Input */}
                <div className="form-field-wrap">
                  <label className="form-label">Evaluation Feedback & Constructive Comments</label>
                  <textarea
                    className="c1-textarea"
                    rows={3}
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide constructive comments for the student's learning progress..."
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
                    <span>Save Evaluation & Grade</span>
                  </button>
                </div>
              </form>
            </Modal>
          );
        })()}

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
                Are you sure you want to delete <strong>"{deletingAssignment.title}"</strong>? This will remove the task and associated submissions for enrolled students. This action cannot be undone.
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

