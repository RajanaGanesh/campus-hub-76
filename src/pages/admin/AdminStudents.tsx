import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, StudentRecord } from '../../data/managementData';

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();

  // Load management database
  const [data, setData] = useState(() => getManagementData());
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    return getManagementData().students;
  });

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Modals selectors
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);

  // Add Form Fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('CSE');
  const [year, setYear] = useState('IV Year');
  const [section, setSection] = useState('A');
  const [cgpa, setCgpa] = useState(8.0);
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    setStudentId('');
    setEmail('');
    setDept('CSE');
    setYear('IV Year');
    setSection('A');
    setCgpa(8.0);
    setPhone('');
    setFormError(null);
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (st: StudentRecord) => {
    setEditingStudent(st);
    setName(st.name);
    setStudentId(st.id);
    setEmail(st.email);
    setDept(st.department);
    setYear(st.year);
    setSection(st.section);
    setCgpa(st.cgpa);
    setPhone(st.phone);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleToggleStatus = (stId: string) => {
    const nextStudents = students.map((s) => {
      if (s.id === stId) {
        const nextStatus = s.status === 'Active' ? 'Deactivated' as const : 'Active' as const;
        setToastMsg(`Student "${s.name}" is now ${nextStatus}.`);
        setTimeout(() => setToastMsg(null), 2500);
        return {
          ...s,
          status: nextStatus
        };
      }
      return s;
    });

    setStudents(nextStudents);
    const updatedData = { ...data, students: nextStudents };
    setData(updatedData);
    saveManagementData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !studentId.trim() || !email.trim() || !phone.trim()) {
      setFormError('Please fill in all required fields (Name, ID, Email, and Phone).');
      return;
    }

    if (cgpa < 0 || cgpa > 10) {
      setFormError('CGPA score must be between 0.0 and 10.0.');
      return;
    }

    if (editingStudent) {
      // Edit
      const nextStudents = students.map((s) => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            name,
            id: studentId,
            email,
            department: dept,
            year,
            section,
            cgpa,
            phone
          };
        }
        return s;
      });

      setStudents(nextStudents);
      const updatedData = { ...data, students: nextStudents };
      setData(updatedData);
      saveManagementData(updatedData);

      setShowAddModal(false);
      setToastMsg('Student profile updated successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    } else {
      // Add
      if (students.some((s) => s.id === studentId)) {
        setFormError('Error: A student with this Roll Number ID already exists.');
        return;
      }

      const newStudent: StudentRecord = {
        id: studentId,
        name,
        email,
        department: dept,
        year,
        section,
        cgpa,
        phone,
        status: 'Active',
        attendancePercent: 100,
        assignmentsCompleted: 0,
        performance: 'Good'
      };

      const nextStudents = [...students, newStudent];
      setStudents(nextStudents);
      const updatedData = { ...data, students: nextStudents };
      setData(updatedData);
      saveManagementData(updatedData);

      setShowAddModal(false);
      setToastMsg('Student added successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDept !== 'All' && s.department !== filterDept) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back nav */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/admin')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Admin Console
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Students</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Student Management</h1>
          <p>Register new student candidate profiles, activate/deactivate accounts, and edit performance score records.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenAdd}
        >
          <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> Add Student
        </button>
      </div>

      {/* Toast alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search by student name or Roll No ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px 8px 32px', fontSize: '12.5px', color: 'white', outline: 'none' }}
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{ background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
          >
            <option value="All">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
          </select>
        </div>
      </div>

      {/* Roster table */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Student ID</th>
                <th style={{ padding: '12px 14px' }}>Student Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Year</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Section</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>CGPA</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{st.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{st.name}</td>
                    <td style={{ padding: '12px 14px' }}>{st.department}</td>
                    <td style={{ padding: '12px 14px' }}>{st.year}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{st.section}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800' }}>{st.cgpa.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className={`subject-att-status ${st.status === 'Active' ? 'good' : 'critical'}`} style={{ fontSize: '8.5px' }}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-sso"
                          style={{ height: '26px', fontSize: '11px', padding: '0 8px', margin: 0, width: 'auto' }}
                          onClick={() => setViewingStudent(st)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn-sso"
                          style={{ height: '26px', fontSize: '11px', padding: '0 8px', margin: 0, width: 'auto' }}
                          onClick={() => handleOpenEdit(st)}
                        >
                          Edit
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
                            background: st.status === 'Active' ? 'rgba(217, 83, 79, 0.05)' : 'rgba(0, 216, 154, 0.05)',
                            borderColor: st.status === 'Active' ? 'var(--color-error)' : '#00d89a',
                            color: st.status === 'Active' ? 'var(--color-error)' : '#00d89a'
                          }}
                          onClick={() => handleToggleStatus(st.id)}
                        >
                          {st.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No students listed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showAddModal && (
        <div className="search-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Student Roster</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{editingStudent ? 'Edit Student Profile' : 'Add Student Record'}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '70vh' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="st-name" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input
                    id="st-name"
                    type="text"
                    placeholder="Enter student name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="st-id" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Roll Number (Student ID)</label>
                  <input
                    id="st-id"
                    type="text"
                    placeholder="e.g. 236F1A0551"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={!!editingStudent}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="st-email" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    id="st-email"
                    type="email"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Department</label>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12.5px' }}
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Year Level</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12.5px' }}
                    >
                      <option value="I Year">I Year</option>
                      <option value="II Year">II Year</option>
                      <option value="III Year">III Year</option>
                      <option value="IV Year">IV Year</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Section</label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12.5px' }}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="st-cgpa" style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>CGPA Score</label>
                    <input
                      id="st-cgpa"
                      type="number"
                      step={0.01}
                      min={0}
                      max={10}
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="st-phone" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    id="st-phone"
                    type="text"
                    placeholder="Enter phone number..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  {editingStudent ? 'Save Profile' : 'Add Student'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Viewing dossier profile modal */}
      {viewingStudent && (
        <div className="search-modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>STUDENT ACCOUNT DETAILS</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Dossier View</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setViewingStudent(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <div>Name: <strong style={{ color: 'white' }}>{viewingStudent.name}</strong></div>
                <div>ID: <strong style={{ color: 'white' }}>{viewingStudent.id}</strong></div>
                <div>Email: <strong style={{ color: 'white' }}>{viewingStudent.email}</strong></div>
                <div>Phone: <strong style={{ color: 'white' }}>{viewingStudent.phone}</strong></div>
                <div>Dept: <strong style={{ color: 'white' }}>{viewingStudent.department}</strong></div>
                <div>Year: <strong style={{ color: 'white' }}>{viewingStudent.year}</strong></div>
                <div>Section: <strong style={{ color: 'white' }}>{viewingStudent.section}</strong></div>
                <div>CGPA: <strong style={{ color: 'var(--accent-highlight)' }}>{viewingStudent.cgpa}</strong></div>
                <div>Status: <span className={`subject-att-status ${viewingStudent.status === 'Active' ? 'good' : 'critical'}`} style={{ fontSize: '9px' }}>{viewingStudent.status}</span></div>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ width: '100%', height: '36px', margin: 0, fontSize: '12.5px' }}
                onClick={() => setViewingStudent(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminStudents;
