import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, CourseRecord } from '../../data/managementData';

export const AdminCourses: React.FC = () => {
  const navigate = useNavigate();

  // Load management data
  const [data, setData] = useState(() => getManagementData());
  const [courses, setCourses] = useState<CourseRecord[]>(() => {
    return getManagementData().courses;
  });

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Add Course Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [dept, setDept] = useState('CSE');
  const [semester, setSemester] = useState('5th Semester');

  // Assign Faculty Fields
  const [assignCourseCode, setAssignCourseCode] = useState('CSE-301');
  const [assignFacultyId, setAssignFacultyId] = useState('FAC-101');
  const [assignSection, setAssignSection] = useState('A');
  const [assignSemester, setAssignSemester] = useState('5th Semester');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setCode('');
    setName('');
    setDept('CSE');
    setSemester('5th Semester');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenAssign = (cCode: string) => {
    setAssignCourseCode(cCode);
    setAssignFacultyId('FAC-101');
    setAssignSection('A');
    setAssignSemester('5th Semester');
    setFormError(null);
    setShowAssignModal(true);
  };

  const handleToggleStatus = (cCode: string) => {
    const nextCourses = courses.map((c) => {
      if (c.code === cCode) {
        const nextStatus = c.status === 'Active' ? 'Inactive' as const : 'Active' as const;
        setToastMsg(`Course "${c.name}" status set to ${nextStatus}.`);
        setTimeout(() => setToastMsg(null), 2500);
        return {
          ...c,
          status: nextStatus
        };
      }
      return c;
    });

    setCourses(nextCourses);
    const updatedData = { ...data, courses: nextCourses };
    setData(updatedData);
    saveManagementData(updatedData);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setFormError('Please fill in both the Course Code and Course Name.');
      return;
    }

    if (courses.some((c) => c.code.toLowerCase() === code.toLowerCase())) {
      setFormError('Error: A course with this code already exists.');
      return;
    }

    const newCourse: CourseRecord = {
      code: code.toUpperCase(),
      name,
      department: dept,
      semester,
      facultyId: '',
      facultyName: 'Unassigned',
      studentsCount: 0,
      status: 'Active',
      progress: 0,
      nextClass: 'Unscheduled'
    };

    const nextCourses = [...courses, newCourse];
    setCourses(nextCourses);
    const updatedData = { ...data, courses: nextCourses };
    setData(updatedData);
    saveManagementData(updatedData);

    setShowAddModal(false);
    setToastMsg('Course added successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const facultyMember = data.faculty.find((f) => f.id === assignFacultyId);
    if (!facultyMember) {
      setFormError('Selected faculty member not found.');
      return;
    }

    const nextCourses = courses.map((c) => {
      if (c.code === assignCourseCode) {
        return {
          ...c,
          facultyId: facultyMember.id,
          facultyName: facultyMember.name,
          semester: assignSemester,
          nextClass: `Assigned Section ${assignSection}`
        };
      }
      return c;
    });

    // Also update faculty courses list
    const nextFaculty = data.faculty.map((f) => {
      if (f.id === facultyMember.id && !f.courses.includes(assignCourseCode)) {
        return {
          ...f,
          courses: [...f.courses, assignCourseCode]
        };
      }
      return f;
    });

    setCourses(nextCourses);
    const updatedData = {
      ...data,
      courses: nextCourses,
      faculty: nextFaculty
    };
    setData(updatedData);
    saveManagementData(updatedData);

    setShowAssignModal(false);
    setToastMsg('Faculty assigned successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/admin')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Admin Console
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Courses</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Course Management</h1>
          <p>Create new academic modules, assign faculty instructors, and adjust course syllabus statuses.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenAdd}
        >
          <i className="fa-solid fa-book-medical" style={{ marginRight: '6px' }}></i> Add Course
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Roster table */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Course Code</th>
                <th style={{ padding: '12px 14px' }}>Course Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Semester</th>
                <th style={{ padding: '12px 14px' }}>Assigned Instructor</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Students</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.code} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{c.code}</td>
                  <td style={{ padding: '12px 14px', fontWeight: '700' }}>{c.name}</td>
                  <td style={{ padding: '12px 14px' }}>{c.department}</td>
                  <td style={{ padding: '12px 14px' }}>{c.semester}</td>
                  <td style={{ padding: '12px 14px', fontWeight: '600' }}>{c.facultyName}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>{c.studentsCount}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className={`subject-att-status ${c.status === 'Active' ? 'good' : 'inactive'}`} style={{ fontSize: '8.5px' }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-sso"
                        style={{ height: '26px', fontSize: '11px', padding: '0 8px', margin: 0, width: 'auto' }}
                        onClick={() => handleOpenAssign(c.code)}
                      >
                        Assign Faculty
                      </button>
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{
                          height: '26px',
                          fontSize: '11px',
                          padding: '0 8px',
                          margin: 0,
                          width: 'auto',
                          background: c.status === 'Active' ? 'rgba(217, 83, 79, 0.05)' : 'rgba(0, 216, 154, 0.05)',
                          borderColor: c.status === 'Active' ? 'var(--color-error)' : '#00d89a',
                          color: c.status === 'Active' ? 'var(--color-error)' : '#00d89a'
                        }}
                        onClick={() => handleToggleStatus(c.code)}
                      >
                        {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="search-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Curriculum</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Add Course</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowAddModal(false)}>
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

              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="crs-code" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Course Code</label>
                  <input
                    id="crs-code"
                    type="text"
                    placeholder="e.g. CSE-305"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="crs-name" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Course Name</label>
                  <input
                    id="crs-name"
                    type="text"
                    placeholder="e.g. Operating Systems..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Department</label>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="1st Semester">1st Sem</option>
                      <option value="3rd Semester">3rd Sem</option>
                      <option value="5th Semester">5th Sem</option>
                      <option value="7th Semester">7th Sem</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Publish Course
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Instructor Modal */}
      {showAssignModal && (
        <div className="search-modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Instructors Allocation</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Assign Faculty</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowAssignModal(false)}>
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

              <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Selected Course</label>
                  <strong style={{ color: 'white', fontSize: '14px' }}>{assignCourseCode}</strong>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Select Faculty Instructor</label>
                  <select
                    value={assignFacultyId}
                    onChange={(e) => setAssignFacultyId(e.target.value)}
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px' }}
                  >
                    {data.faculty.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.designation} - {f.department})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Semester</label>
                    <select
                      value={assignSemester}
                      onChange={(e) => setAssignSemester(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="5th Semester">5th Semester</option>
                      <option value="7th Semester">7th Semester</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Section</label>
                    <select
                      value={assignSection}
                      onChange={(e) => setAssignSection(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Assign Faculty Instructor
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCourses;
