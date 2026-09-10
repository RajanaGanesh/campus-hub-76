import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getManagementData,
  AssignmentSubmission
} from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export interface StudentAssignmentItem {
  id: string;
  courseCode: string;
  subject: string;
  title: string;
  faculty: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue' | 'Late';
  description: string;
  instructions: string;
  createdDate: string;
  maxMarks: number;
  marks?: number | null;
  feedback?: string;
  comments?: string;
  submittedFile?: string;
  submittedDate?: string;
}

export const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper to construct unified assignments list for the active student
  const loadMergedAssignments = useCallback((): StudentAssignmentItem[] => {
    const mgmt = getManagementData();
    const studentId = (user?.id || '').trim().toLowerCase();
    const studentName = (user?.name || '').trim().toLowerCase();
    const studentEmail = (user?.email || '').trim().toLowerCase();

    return mgmt.assignments.map((asg) => {
      // Find matching submission by this student
      const sub = mgmt.submissions.find(
        (s) =>
          s.assignmentId === asg.id &&
          (s.studentId.toLowerCase() === studentId ||
           s.studentName.toLowerCase() === studentName ||
           s.studentId.toLowerCase() === studentEmail ||
           (studentName.length >= 3 && s.studentName.toLowerCase().includes(studentName)))
      );

      let status: StudentAssignmentItem['status'] = 'Pending';
      if (sub) {
        status = sub.status;
      }

      return {
        id: asg.id,
        courseCode: asg.courseCode || 'CSE-301',
        subject: asg.courseName || asg.courseCode || 'Computer Science',
        title: asg.title,
        faculty: asg.facultyName || 'Dr. S. Kumar',
        due: asg.dueDate,
        priority: asg.priority || 'High',
        status,
        description: asg.description,
        instructions: asg.instructions || 'Submit a clean PDF report, ZIP archive, or code source files covering all task requirements.',
        createdDate: asg.createdDate || '12 Aug 2026',
        maxMarks: asg.maxMarks || 100,
        marks: sub?.marks,
        feedback: sub?.feedback,
        comments: sub?.comments,
        submittedFile: sub?.fileName || (sub ? 'Submission_Document.pdf' : undefined),
        submittedDate: sub?.submittedDate
      };
    });
  }, [user]);

  // Assignments state loaded from persistent management storage
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>(() => loadMergedAssignments());

  // Listen for real-time updates from faculty grading or other tabs
  useEffect(() => {
    const handleSync = () => {
      setAssignments(loadMergedAssignments());
    };

    setAssignments(loadMergedAssignments());

    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_assignments_updated', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_assignments_updated', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
    };
  }, [loadMergedAssignments]);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'soonest' | 'latest' | 'newest' | 'priority'>('soonest');

  // Modal states
  const [detailsModalItem, setDetailsModalItem] = useState<StudentAssignmentItem | null>(null);
  const [submitModalItem, setSubmitModalItem] = useState<StudentAssignmentItem | null>(null);

  // Submission form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentComments, setStudentComments] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Action Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Dynamic Statistics Counts
  const stats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter((a) => a.status === 'Pending' || a.status === 'Late').length;
    const submitted = assignments.filter((a) => a.status === 'Submitted').length;
    const graded = assignments.filter((a) => a.status === 'Graded').length;
    const overdue = assignments.filter((a) => a.status === 'Overdue').length;
    return { total, pending, submitted, graded, overdue };
  }, [assignments]);

  const uniqueSubjects = useMemo(() => {
    return ['All', ...Array.from(new Set(assignments.map((a) => a.subject)))];
  }, [assignments]);

  // Filtered & Sorted Assignments List
  const filteredAssignments = useMemo(() => {
    let list = assignments.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.faculty.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Pending' && (item.status === 'Pending' || item.status === 'Late')) ||
        item.status === statusFilter;

      const matchSubject = subjectFilter === 'All' || item.subject === subjectFilter;

      return matchSearch && matchStatus && matchSubject;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
      if (sortBy === 'latest') {
        return new Date(b.due).getTime() - new Date(a.due).getTime();
      }
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    });

    return list;
  }, [assignments, searchQuery, statusFilter, subjectFilter, sortBy]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || subjectFilter !== 'All' || sortBy !== 'soonest';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setSubjectFilter('All');
    setSortBy('soonest');
    showToast('Filters reset.', 'info');
  };

  // Open Submission Modal
  const handleOpenSubmit = (item: StudentAssignmentItem) => {
    setSubmitModalItem(item);
    setSelectedFile(null);
    setStudentComments(item.comments || '');
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  // File Select Handler with Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedExtensions = ['.pdf', '.docx', '.zip', '.py', '.java', '.sql', '.txt', '.cpp', '.c', '.js', '.ts', '.png', '.jpg'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExt)) {
        setUploadError(`Unsupported file format (${fileExt}). Please upload a PDF, DOCX, ZIP, or code file.`);
        setSelectedFile(null);
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        setUploadError('File size exceeds 25 MB limit.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
    }
  };

  // Submit Assignment Flow (Persists to Management Data for Faculty Visibility)
  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalItem) return;

    if (!selectedFile && submitModalItem.status !== 'Submitted' && submitModalItem.status !== 'Graded') {
      setUploadError('Please select a file to submit.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    // Simulate animated upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setUploadProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);

        const mgmt = getManagementData();
        const studentId = user?.id || '236F1A0551';
        const studentName = user?.name || 'Aditya Sharma';
        const studentIdentifier = studentId.toLowerCase().trim();
        const studentEmail = (user?.email || 'student@campushub.com').toLowerCase().trim();

        // Check if student already has a submission record for this assignment
        const existingIdx = mgmt.submissions.findIndex(
          (s) =>
            s.assignmentId === submitModalItem.id &&
            (s.studentId.toLowerCase().trim() === studentIdentifier ||
             s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim() ||
             s.studentId.toLowerCase().trim() === studentEmail ||
             (studentName.length >= 3 && s.studentName.toLowerCase().includes(studentName.toLowerCase().trim())))
        );

        const newSubmission: AssignmentSubmission = {
          id: existingIdx >= 0 ? mgmt.submissions[existingIdx].id : `SUB-${Date.now()}`,
          assignmentId: submitModalItem.id,
          studentId: studentId,
          studentName: studentName,
          submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Submitted',
          marks: existingIdx >= 0 ? mgmt.submissions[existingIdx].marks : null,
          fileName: selectedFile ? selectedFile.name : (existingIdx >= 0 ? mgmt.submissions[existingIdx].fileName : 'Assignment_Submission.pdf'),
          comments: studentComments
        };

        // Submit via dbService to ensure local management storage & Supabase sync
        dbService.submitAssignment(newSubmission, user?.email).then(() => {
          // Update local student assignment state
          setAssignments(loadMergedAssignments());

          // Notify all portal components & faculty tabs
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('campushub_assignments_updated'));
          window.dispatchEvent(new Event('campushub_management_updated'));
        }).catch((err) => {
          console.warn('Submission persistence notice:', err);
        });

        setSubmitModalItem(null);
        showToast(`Assignment "${submitModalItem.title}" submitted to faculty successfully!`, 'success');
      }
    }, 200);
  };

  const getStatusBadge = (status: StudentAssignmentItem['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Submitted</span>;
      case 'Graded':
        return <span className="c1-badge c1-badge-cyan"><i className="fa-solid fa-award"></i> Graded</span>;
      case 'Overdue':
      case 'Late':
        return <span className="c1-badge c1-badge-error"><i className="fa-solid fa-triangle-exclamation"></i> Overdue</span>;
      case 'Pending':
      default:
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-clock"></i> Pending</span>;
    }
  };

  const getPriorityTag = (priority: StudentAssignmentItem['priority']) => {
    switch (priority) {
      case 'High':
        return <span className="priority-pill priority-high"><i className="fa-solid fa-circle"></i> High Priority</span>;
      case 'Medium':
        return <span className="priority-pill priority-medium"><i className="fa-solid fa-circle"></i> Medium</span>;
      case 'Low':
      default:
        return <span className="priority-pill priority-low"><i className="fa-solid fa-circle"></i> Normal</span>;
    }
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
              <span className="crumb-current">Assignments & Coursework</span>
            </div>
            <h1 className="module-title">Assignments & Coursework</h1>
            <p className="module-subtitle">
              Manage your homework submissions, download problem specifications, and track evaluation feedback.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="meta-badge-box">
              <span className="meta-badge-label">Active Term</span>
              <span className="meta-badge-val">Semester 8 (2026)</span>
            </div>
          </div>
        </div>

        {/* 5 Summary Statistics Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-list-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-label">Total Assigned</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{stats.submitted}</span>
              <span className="stat-label">Submitted</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{stats.graded}</span>
              <span className="stat-label">Graded</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>
        </div>

        {/* Search, Filter, and Sort Controls Bar */}
        <div className="c1-card academic-filters-card">
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search assignments by title, course, or instructor..."
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
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                className="c1-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="Submitted">Submitted Only</option>
                <option value="Graded">Graded Only</option>
                <option value="Overdue">Overdue Only</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="filter-subject-ass">Course</label>
              <select
                id="filter-subject-ass"
                className="c1-select"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="sort-by-ass">Sort By</label>
              <select
                id="sort-by-ass"
                className="c1-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="soonest">Due Date (Soonest)</option>
                <option value="latest">Due Date (Latest)</option>
                <option value="newest">Recently Assigned</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="c1-btn c1-btn-secondary btn-clear-filters"
                onClick={resetFilters}
              >
                <i className="fa-solid fa-arrow-rotate-left"></i>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Assignments List Cards */}
        {filteredAssignments.length > 0 ? (
          <div className="assignments-cards-grid">
            {filteredAssignments.map((assignment) => {
              const isSubmitted = assignment.status === 'Submitted';
              const isGraded = assignment.status === 'Graded';

              return (
                <div key={assignment.id} className="c1-card assignment-card-item">
                  <div className="assignment-card-top">
                    <div className="course-priority-wrap">
                      <span className="course-code-tag">{assignment.subject}</span>
                      {getPriorityTag(assignment.priority)}
                    </div>
                    {getStatusBadge(assignment.status)}
                  </div>

                  <h3 className="assignment-card-title">{assignment.title}</h3>
                  <p className="assignment-card-desc">{assignment.description}</p>

                  <div className="assignment-meta-grid">
                    <div className="meta-cell">
                      <span className="meta-cell-label">Faculty</span>
                      <span className="meta-cell-val">
                        <i className="fa-solid fa-user-tie"></i> {assignment.faculty}
                      </span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-cell-label">Assigned Date</span>
                      <span className="meta-cell-val">{assignment.createdDate}</span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-cell-label">Due Deadline</span>
                      <span className="meta-cell-val due-deadline-val">
                        <i className="fa-regular fa-clock"></i> {assignment.due}
                      </span>
                    </div>
                    <div className="meta-cell">
                      <span className="meta-cell-label">Max Marks</span>
                      <span className="meta-cell-val">{assignment.maxMarks} Points</span>
                    </div>
                  </div>

                  {isSubmitted && assignment.submittedFile && (
                    <div className="submitted-file-strip">
                      <i className="fa-solid fa-file-arrow-up"></i>
                      <span>Submitted: <strong>{assignment.submittedFile}</strong></span>
                    </div>
                  )}

                  <div className="assignment-card-actions">
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary btn-action-half"
                      onClick={() => setDetailsModalItem(assignment)}
                    >
                      <i className="fa-solid fa-eye"></i>
                      <span>Details</span>
                    </button>

                    {isSubmitted ? (
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary btn-action-half btn-edit-submission"
                        onClick={() => handleOpenSubmit(assignment)}
                      >
                        <i className="fa-solid fa-file-pen"></i>
                        <span>Resubmit</span>
                      </button>
                    ) : isGraded ? (
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary btn-action-half"
                        onClick={() => setDetailsModalItem(assignment)}
                      >
                        <i className="fa-solid fa-award" style={{ color: '#10b981' }}></i>
                        <span>Score: {assignment.marks !== null && assignment.marks !== undefined ? assignment.marks : assignment.maxMarks} / {assignment.maxMarks}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient btn-action-half"
                        onClick={() => handleOpenSubmit(assignment)}
                      >
                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                        <span>Submit Work</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="c1-card academic-empty-card">
            <i className="fa-solid fa-file-circle-xmark empty-card-icon"></i>
            <h4>No assignments found</h4>
            <p>No coursework records match your current search and filter parameters.</p>
            {hasActiveFilters && (
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={resetFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* ============================================================
            MODAL 1: ASSIGNMENT DETAILS MODAL
            ============================================================ */}
        {detailsModalItem && (
          <Modal
            isOpen={true}
            onClose={() => setDetailsModalItem(null)}
            title="Assignment Details & Instructions"
            maxWidth="md"
          >
            <div className="assignment-details-dialog">
              <div className="details-header-meta">
                <div>
                  <span className="course-code-tag">{detailsModalItem.subject}</span>
                  <h3 className="details-title">{detailsModalItem.title}</h3>
                </div>
                {getStatusBadge(detailsModalItem.status)}
              </div>

              <div className="details-info-grid">
                <div className="info-box">
                  <span className="info-label">Instructor</span>
                  <span className="info-val">{detailsModalItem.faculty}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Assigned Date</span>
                  <span className="info-val">{detailsModalItem.createdDate}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Due Deadline</span>
                  <span className="info-val due-deadline-val">{detailsModalItem.due}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Maximum Marks</span>
                  <span className="info-val">{detailsModalItem.maxMarks} Points</span>
                </div>
              </div>

              <div className="details-section">
                <h4>Assignment Description</h4>
                <p>{detailsModalItem.description}</p>
              </div>

              <div className="details-section">
                <h4>Submission Guidelines & Instructions</h4>
                <p>{detailsModalItem.instructions}</p>
              </div>

              {detailsModalItem.status === 'Graded' && (
                <div className="details-section" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-award"></i> Evaluated & Graded
                    </h4>
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>
                      {detailsModalItem.marks !== null && detailsModalItem.marks !== undefined ? detailsModalItem.marks : detailsModalItem.maxMarks} / {detailsModalItem.maxMarks} Marks
                    </strong>
                  </div>
                  {detailsModalItem.feedback && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Faculty Feedback:</strong> {detailsModalItem.feedback}
                    </p>
                  )}
                </div>
              )}

              {detailsModalItem.submittedFile && (
                <div className="details-section submitted-box">
                  <h4>Your Submitted Document</h4>
                  <div className="submitted-file-badge">
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>{detailsModalItem.submittedFile}</span>
                  </div>
                  {detailsModalItem.comments && (
                    <p className="student-comment-note">
                      <strong>Remarks:</strong> {detailsModalItem.comments}
                    </p>
                  )}
                </div>
              )}

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDetailsModalItem(null)}
                >
                  Close
                </button>
                {detailsModalItem.status !== 'Graded' && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => {
                      const it = detailsModalItem;
                      setDetailsModalItem(null);
                      handleOpenSubmit(it);
                    }}
                  >
                    <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    <span>{detailsModalItem.status === 'Submitted' ? 'Resubmit Document' : 'Submit Assignment'}</span>
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: ASSIGNMENT SUBMISSION MODAL
            ============================================================ */}
        {submitModalItem && (
          <Modal
            isOpen={true}
            onClose={() => !isUploading && setSubmitModalItem(null)}
            title={`Submit: ${submitModalItem.title}`}
            maxWidth="md"
          >
            <form onSubmit={handleConfirmSubmit} className="assignment-submit-form">
              <div className="submit-form-header">
                <span className="course-code-tag">{submitModalItem.subject}</span>
                <span className="meta-due">Deadline: {submitModalItem.due}</span>
              </div>

              {uploadError && (
                <div className="c1-alert c1-alert-error" role="alert">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Drag and Drop File Selector */}
              <div className="file-dropzone-wrap">
                <input
                  type="file"
                  id="assignment-file-input"
                  className="file-hidden-input"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label htmlFor="assignment-file-input" className="file-dropzone-label">
                  <div className="dropzone-icon">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  {selectedFile ? (
                    <div className="file-selected-info">
                      <span className="file-selected-name">{selectedFile.name}</span>
                      <span className="file-selected-size">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </span>
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <span className="dropzone-title">Click or drag & drop assignment file here</span>
                      <span className="dropzone-formats">Supported formats: PDF, DOCX, ZIP, PY, JAVA, SQL (Max 25MB)</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Upload Progress Simulation Bar */}
              {isUploading && (
                <div className="upload-progress-box">
                  <div className="progress-text-row">
                    <span>Uploading assignment document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Student Remarks / Note */}
              <div className="form-field-wrap">
                <label htmlFor="student-comments-input" className="form-label">
                  Student Comments / Notes (Optional)
                </label>
                <textarea
                  id="student-comments-input"
                  className="c1-textarea"
                  rows={3}
                  placeholder="Add any context, compilation instructions, or notes for the faculty instructor..."
                  value={studentComments}
                  onChange={(e) => setStudentComments(e.target.value)}
                  disabled={isUploading}
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSubmitModalItem(null)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                  disabled={isUploading || (!selectedFile && submitModalItem.status !== 'Submitted')}
                >
                  {isUploading ? (
                    <>
                      <LoadingSpinner size="sm" color="#ffffff" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Confirm Submission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Toast Feedback */}
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
            <h4>Next Academic Modules</h4>
            <p>Check upcoming examination dates or review your graded academic transcripts.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/exams')}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>Exam Timetable</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/results')}
            >
              <i className="fa-solid fa-award"></i>
              <span>Grade Transcripts</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAssignments;
