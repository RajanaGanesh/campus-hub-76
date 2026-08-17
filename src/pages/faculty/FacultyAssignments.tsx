import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, ManagementAssignment } from '../../data/managementData';

export const FacultyAssignments: React.FC = () => {
  const navigate = useNavigate();

  // Load assignments state
  const [data, setData] = useState(() => getManagementData());
  const [assignments, setAssignments] = useState<ManagementAssignment[]>(() => {
    return getManagementData().assignments;
  });

  // Modal forms states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ManagementAssignment | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CSE-301');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setTitle('');
    setCourseCode('CSE-301');
    setDesc('');
    setDueDate('');
    setMaxMarks(100);
    setFormError(null);
    setEditingAssignment(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (asm: ManagementAssignment) => {
    setEditingAssignment(asm);
    setTitle(asm.title);
    setCourseCode(asm.courseCode);
    setDesc(asm.description);
    setDueDate(asm.dueDate);
    setMaxMarks(asm.maxMarks);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleDelete = (asmId: string) => {
    const nextAsms = assignments.filter((a) => a.id !== asmId);
    setAssignments(nextAsms);

    const nextData = {
      ...data,
      assignments: nextAsms
    };
    setData(nextData);
    saveManagementData(nextData);

    setToastMsg('Assignment deleted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !dueDate) {
      setFormError('Please fill in all fields (Title, Description, and Due Date).');
      return;
    }

    if (maxMarks <= 0) {
      setFormError('Max Marks must be greater than zero.');
      return;
    }

    const matchedCourse = data.courses.find((c) => c.code === courseCode);
    const courseName = matchedCourse ? matchedCourse.name : 'Unknown Course';

    if (editingAssignment) {
      // Edit
      const nextAsms = assignments.map((a) => {
        if (a.id === editingAssignment.id) {
          return {
            ...a,
            title,
            courseCode,
            courseName,
            description: desc,
            dueDate,
            maxMarks
          };
        }
        return a;
      });

      setAssignments(nextAsms);
      const nextData = { ...data, assignments: nextAsms };
      setData(nextData);
      saveManagementData(nextData);

      setShowCreateModal(false);
      setToastMsg('Assignment updated successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    } else {
      // Create new
      const newIdNum = 101 + assignments.length;
      const nextId = `ASSIGN-${newIdNum}`;

      const newAsm: ManagementAssignment = {
        id: nextId,
        title,
        courseCode,
        courseName,
        description: desc,
        dueDate,
        maxMarks,
        submissionsCount: 0
      };

      const nextAsms = [...assignments, newAsm];
      setAssignments(nextAsms);
      const nextData = { ...data, assignments: nextAsms };
      setData(nextData);
      saveManagementData(nextData);

      setShowCreateModal(false);
      setToastMsg('Assignment created successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Faculty Panel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Assignments</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Assignment Management</h1>
          <p>Create, edit, grade, and distribute assignment tasks to your course sections.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenCreate}
        >
          <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Create Assignment
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* List Assignments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {assignments.length > 0 ? (
          assignments.map((asm) => {
            // Count actual submissions for this assignment
            const subs = data.submissions.filter((s) => s.assignmentId === asm.id);
            const gradedCount = subs.filter((s) => s.status === 'Graded').length;

            return (
              <div
                key={asm.id}
                className="card-panel"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '22px' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{asm.courseCode}</span>
                    <span className="subject-att-status info" style={{ fontSize: '8.5px' }}>{asm.id}</span>
                  </div>

                  <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{asm.title}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                    {asm.courseName}
                  </span>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
                    {asm.description}
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <div>Due Date: <strong style={{ color: 'white' }}>{asm.dueDate}</strong></div>
                    <div>Max Marks: <strong style={{ color: 'white' }}>{asm.maxMarks} Points</strong></div>
                    <div>Graded Submissions: <strong style={{ color: '#00d89a' }}>{gradedCount} / {subs.length}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn-signin"
                    style={{ flex: 1.4, margin: 0, height: '32px', fontSize: '11.5px', padding: 0 }}
                    onClick={() => navigate(`/faculty/assignments/${asm.id}`)}
                  >
                    View Submissions ({subs.length})
                  </button>
                  <button
                    type="button"
                    className="btn-sso"
                    style={{ flex: 0.8, margin: 0, height: '32px', fontSize: '11.5px', padding: 0 }}
                    onClick={() => handleOpenEdit(asm)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-retry-err"
                    style={{ flex: 0.8, margin: 0, height: '32px', fontSize: '11.5px', padding: 0, background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                    onClick={() => handleDelete(asm.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No assignments created</h3>
            <p style={{ fontSize: '12.5px' }}>Click "Create Assignment" at the top to draft your first academic checklist task.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="search-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Academic Task</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowCreateModal(false)}>
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="asm-title" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Assignment Title</label>
                  <input
                    id="asm-title"
                    type="text"
                    placeholder="e.g. Binary Search Tree traversals..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Course</label>
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  >
                    {data.courses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="asm-desc" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Instructions & Description</label>
                  <textarea
                    id="asm-desc"
                    rows={4}
                    placeholder="Provide details of the coding tasks or descriptive questions..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="asm-due" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Due Date</label>
                    <input
                      id="asm-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px' }}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="asm-marks" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Max Marks</label>
                    <input
                      id="asm-marks"
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  {editingAssignment ? 'Save Changes' : 'Create Task'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyAssignments;
