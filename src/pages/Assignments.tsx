import React, { useState } from 'react';
import { academicData, AssignmentItem } from '../data/academicData';

export const Assignments: React.FC = () => {
  // Assignments state (initially from academicData)
  const [assignments, setAssignments] = useState<AssignmentItem[]>(academicData.assignments);

  // Filters state
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal/Detail states
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitComment, setSubmitComment] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Derive counts dynamically
  const pendingCount = assignments.filter((a) => a.status === 'Pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'Submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'Graded').length;
  const overdueCount = assignments.filter((a) => a.status === 'Overdue').length;

  const subjectsList = Array.from(new Set(assignments.map((a) => a.subject)));

  // Filtered list
  const filteredAssignments = assignments.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = subjectFilter === 'All' || a.subject === subjectFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    
    return matchSearch && matchSubject && matchStatus && matchPriority;
  });

  const getStatusClass = (status: AssignmentItem['status']) => {
    switch (status) {
      case 'Submitted':
        return 'subject-att-status safe'; // cyan
      case 'Graded':
        return 'subject-att-status safe'; // green
      case 'Overdue':
      case 'Late':
        return 'subject-att-status critical'; // red
      case 'Pending':
      default:
        return 'subject-att-status good'; // blue/purple
    }
  };

  const handleOpenDetails = (ass: AssignmentItem) => {
    setActiveAssignment(ass);
    setSubmitFile(null);
    setSubmitComment(ass.comments || '');
    setSubmitError(null);
    setSubmitSuccessMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmitFile(e.target.files[0]);
      setSubmitError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    // Validation
    if (!submitFile && activeAssignment.status !== 'Submitted') {
      setSubmitError('Please select a file before submitting.');
      return;
    }

    // Success Simulation
    setSubmitError(null);
    
    // Update assignments array state
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === activeAssignment.id
          ? {
              ...a,
              status: 'Submitted',
              comments: submitComment,
              submittedFile: submitFile ? submitFile.name : a.submittedFile
            }
          : a
      )
    );

    setSubmitSuccessMsg('Assignment submitted successfully.');
    
    // Update temporary details state to show submitted
    setActiveAssignment((prev) =>
      prev
        ? {
            ...prev,
            status: 'Submitted',
            comments: submitComment,
            submittedFile: submitFile ? submitFile.name : prev.submittedFile
          }
        : null
    );

    setTimeout(() => {
      setSubmitSuccessMsg(null);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Assignments Header */}
      <div className="dashboard-header">
        <h1>Assignments</h1>
        <p>Track, submit, and manage your academic assignments.</p>
      </div>

      {/* Top summary cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
          </div>
          <div className="stat-card-value">{pendingCount}</div>
          <div className="stat-card-desc">Pending Assignments</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-file-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value">{submittedCount}</div>
          <div className="stat-card-desc">Submitted Assignments</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </div>
          </div>
          <div className="stat-card-value">{gradedCount}</div>
          <div className="stat-card-desc">Graded Assignments</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
          </div>
          <div className="stat-card-value">{overdueCount}</div>
          <div className="stat-card-desc">Overdue Assignments</div>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '320px', width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 32px',
                fontSize: '13px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Subjects</option>
              {subjectsList.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment List Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((ass) => (
            <div key={ass.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '600' }}>{ass.subject}</span>
                  <span className={getStatusClass(ass.status)} style={{ fontSize: '9px' }}>{ass.status}</span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{ass.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '14px' }}>
                  Instructor: <strong style={{ color: 'white' }}>{ass.faculty}</strong>
                </p>

                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                  <div>
                    <i className="fa-solid fa-calendar-day" style={{ marginRight: '6px', color: '#555365' }}></i>
                    Due Date: <strong style={{ color: 'white' }}>{ass.due}</strong>
                  </div>
                  <div>
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px', color: '#555365' }}></i>
                    Priority:{' '}
                    <strong style={{ color: ass.priority === 'High' ? 'var(--color-error)' : ass.priority === 'Medium' ? '#ffb236' : '#00d89a' }}>
                      {ass.priority}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '18px', border: '1px solid var(--accent-primary)', color: 'white' }}
                onClick={() => handleOpenDetails(ass)}
              >
                View Assignment
              </button>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textRendering: 'optimizeLegibility', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', opacity: 0.4, marginBottom: '12px' }}></i>
            <h3>No assignments found</h3>
            <p style={{ fontSize: '12.5px' }}>Try changing your filters.</p>
          </div>
        )}
      </div>

      {/* Assignment Details and Submission Modal */}
      {activeAssignment && (
        <div className="search-modal-overlay" onClick={() => setActiveAssignment(null)}>
          <div className="search-modal-card" style={{ maxWidth: '600px', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '600', display: 'block' }}>{activeAssignment.subject}</span>
                <h2 style={{ fontSize: '18px', marginTop: '2px' }}>{activeAssignment.title}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setActiveAssignment(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '60vh' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', fontSize: '12.5px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Faculty:</span> <strong style={{ color: 'white' }}>{activeAssignment.faculty}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Max Marks:</span> <strong style={{ color: 'white' }}>{activeAssignment.maxMarks}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Created:</span> <strong style={{ color: 'white' }}>{activeAssignment.createdDate}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Due Date:</span> <strong style={{ color: 'white' }}>{activeAssignment.due}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Priority:</span> <strong style={{ color: activeAssignment.priority === 'High' ? 'var(--color-error)' : 'white' }}>{activeAssignment.priority}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span className={getStatusClass(activeAssignment.status)}>{activeAssignment.status}</span></div>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Description</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activeAssignment.description}</p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>Instructions</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{activeAssignment.instructions}</p>
              </div>

              {/* Attachments Mockup */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Attachments</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', width: 'fit-content' }}>
                  <i className="fa-solid fa-file-pdf" style={{ color: 'var(--color-error)', fontSize: '16px' }}></i>
                  <span>Assignment_Reference_Guide.pdf</span>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent-highlight)', textDecoration: 'none', marginLeft: '10px', fontWeight: '600' }}>Download</a>
                </div>
              </div>

              {/* SUBMISSION FORM PANEL */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>Submission Engine</h3>
                
                {submitSuccessMsg && (
                  <div className="toast-msg" style={{ position: 'static', animation: 'none', marginBottom: '14px' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
                    <span>{submitSuccessMsg}</span>
                  </div>
                )}

                {submitError && (
                  <div className="login-error-box" style={{ margin: '0 0 14px 0', padding: '10px 14px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeAssignment.status === 'Submitted' ? (
                    <div style={{ padding: '12px 16px', background: 'rgba(0, 216, 154, 0.04)', border: '1px solid rgba(0, 216, 154, 0.2)', borderRadius: '8px', fontSize: '13px' }}>
                      <div><strong style={{ color: 'white' }}>✓ Submission status:</strong> Submitted</div>
                      <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                        <strong>Attached File:</strong> {activeAssignment.submittedFile || 'assignment_upload.pdf'}
                      </div>
                      {activeAssignment.comments && (
                        <div style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                          <strong>Comments:</strong> {activeAssignment.comments}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Select Submission File (PDF, DOCX, ZIP)</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <label className="btn-sso" style={{ margin: 0, height: '38px', padding: '0 16px', fontSize: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }}>
                            <i className="fa-solid fa-paperclip" style={{ marginRight: '6px' }}></i> Attach File
                            <input
                              type="file"
                              accept=".pdf,.docx,.zip"
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <span style={{ fontSize: '12.5px', color: submitFile ? 'white' : 'var(--text-secondary)' }}>
                            {submitFile ? submitFile.name : 'No file attached'}
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="submit-comment" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Submission Comments (Optional)</label>
                        <textarea
                          id="submit-comment"
                          rows={3}
                          placeholder="Add comments here..."
                          value={submitComment}
                          onChange={(e) => setSubmitComment(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none',
                            resize: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn-signin"
                        style={{ height: '42px', fontSize: '13.5px', margin: 0 }}
                      >
                        Submit Assignment
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Assignments;
