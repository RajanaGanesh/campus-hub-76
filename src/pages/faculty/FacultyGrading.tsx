import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, AssignmentSubmission } from '../../data/managementData';
import { dbService } from '../../services/dbService';

export const FacultyGrading: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  // Load management data
  const [data, setData] = useState(() => getManagementData());
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    return getManagementData().submissions.filter((s) => s.assignmentId === assignmentId);
  });

  const assignment = data.assignments.find((a) => a.id === assignmentId);

  // Modal grading student
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [inputMarks, setInputMarks] = useState<number>(0);
  const [inputFeedback, setInputFeedback] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync listener
  const refreshData = useCallback(() => {
    const mgmt = getManagementData();
    setData(mgmt);
    setSubmissions(mgmt.submissions.filter((s) => s.assignmentId === assignmentId));
  }, [assignmentId]);

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    window.addEventListener('campushub_assignments_updated', refreshData);
    window.addEventListener('campushub_management_updated', refreshData);

    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('campushub_assignments_updated', refreshData);
      window.removeEventListener('campushub_management_updated', refreshData);
    };
  }, [refreshData]);

  if (!assignment) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'white' }}>
        <h2>Assignment Not Found</h2>
        <button type="button" className="btn-signin" style={{ width: 'auto', marginTop: '10px' }} onClick={() => navigate('/faculty/assignments')}>
          Return to Assignments
        </button>
      </div>
    );
  }

  // Calculate stats
  const totalStudents = data.students?.length || 5;
  const submittedCount = submissions.length;
  const pendingCount = Math.max(0, totalStudents - submittedCount);
  const lateCount = submissions.filter((s) => s.status === 'Late').length;

  const handleOpenGrade = (sub: AssignmentSubmission) => {
    setGradingSub(sub);
    setInputMarks(sub.marks !== null && sub.marks !== undefined ? sub.marks : assignment.maxMarks);
    setInputFeedback(sub.feedback || 'Good work. Submission verified.');
    setFormError(null);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;

    if (inputMarks < 0) {
      setFormError('Error: Marks cannot be negative.');
      return;
    }

    if (inputMarks > assignment.maxMarks) {
      setFormError(`Error: Marks cannot exceed the maximum allowance of ${assignment.maxMarks} points.`);
      return;
    }

    // Persist via dbService to sync locally and with Supabase
    dbService.gradeAssignmentSubmission(gradingSub.id, inputMarks, inputFeedback.trim()).catch((err) => {
      console.warn('Grade persistence notice:', err);
    });

    // Update global state
    const mgmt = getManagementData();
    const nextSubmissions = mgmt.submissions.map((s) => {
      if (s.id === gradingSub.id) {
        return {
          ...s,
          status: 'Graded' as const,
          marks: inputMarks,
          feedback: inputFeedback.trim()
        };
      }
      return s;
    });

    const updatedData = {
      ...mgmt,
      submissions: nextSubmissions
    };

    saveManagementData(updatedData);
    setData(updatedData);
    setSubmissions(nextSubmissions.filter((s) => s.assignmentId === assignmentId));

    // Dispatch sync events
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_assignments_updated'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    setGradingSub(null);
    setToastMsg(`Marks of ${inputMarks}/${assignment.maxMarks} saved successfully.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back nav */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty/assignments')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Assignments List
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Grading Desk</span>
      </div>

      {/* Header Info */}
      <div className="card-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{assignment.courseCode} - {assignment.courseName}</span>
          <span className="subject-att-status info" style={{ fontSize: '8.5px' }}>{assignment.id}</span>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>{assignment.title}</h1>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>{assignment.description}</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mini stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Max Allowance', val: `${assignment.maxMarks} Points` },
          { label: 'Submitted Items', val: `${submittedCount} Tasks` },
          { label: 'Pending Reviews', val: `${pendingCount} Students` },
          { label: 'Late Uploads', val: `${lateCount} Late` }
        ].map((st, idx) => (
          <div key={idx} className="card-panel" style={{ padding: '12px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{st.label}</span>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginTop: '4px' }}>{st.val}</div>
          </div>
        ))}
      </div>

      {/* Submissions table */}
      <div className="card-panel">
        <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Student Submissions Catalog</h3>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Student Name</th>
                <th style={{ padding: '12px 14px' }}>Roll Number</th>
                <th style={{ padding: '12px 14px' }}>Uploaded Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Review Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Scored Points</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{sub.studentName}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--accent-highlight)' }}>{sub.studentId}</td>
                    <td style={{ padding: '12px 14px' }}>{sub.submittedDate}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className={`subject-att-status ${sub.status === 'Graded' ? 'safe' : sub.status === 'Late' ? 'warning' : 'good'}`} style={{ fontSize: '8.5px' }}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: sub.marks ? 'white' : 'var(--text-secondary)' }}>
                      {sub.marks !== null ? `${sub.marks} / ${assignment.maxMarks}` : '--'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-sso"
                        style={{ height: '28px', fontSize: '11px', padding: '0 12px', margin: 0, width: 'auto' }}
                        onClick={() => handleOpenGrade(sub)}
                      >
                        {sub.status === 'Graded' ? 'Re-grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No submissions uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Submission Modal */}
      {gradingSub && (
        <div className="search-modal-overlay" onClick={() => setGradingSub(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>{gradingSub.studentId} Submission</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Grade Submission</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setGradingSub(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Submitted File:</div>
                <div style={{ fontSize: '12.5px', color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>{gradingSub.fileName || `${gradingSub.studentId}_Solution.pdf`}</span>
                </div>
                {gradingSub.comments && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    Note: "{gradingSub.comments}"
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Student Candidate</label>
                  <strong style={{ color: 'white', fontSize: '14px' }}>{gradingSub.studentName} ({gradingSub.studentId})</strong>
                </div>

                <div className="form-group">
                  <label htmlFor="input-marks" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Enter Marks Score (Max: {assignment.maxMarks})
                  </label>
                  <input
                    id="input-marks"
                    type="number"
                    value={inputMarks}
                    onChange={(e) => setInputMarks(Number(e.target.value))}
                    min={0}
                    max={assignment.maxMarks}
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '13px' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="input-feedback" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Evaluation Feedback & Comments
                  </label>
                  <textarea
                    id="input-feedback"
                    rows={3}
                    value={inputFeedback}
                    onChange={(e) => setInputFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for student..."
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '13px', resize: 'vertical' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Save Grade & Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyGrading;
