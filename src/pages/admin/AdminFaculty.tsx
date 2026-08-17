import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, FacultyRecord } from '../../data/managementData';

export const AdminFaculty: React.FC = () => {
  const navigate = useNavigate();

  // Load management database
  const [data, setData] = useState(() => getManagementData());
  const [faculty, setFaculty] = useState<FacultyRecord[]>(() => {
    return getManagementData().faculty;
  });

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<FacultyRecord | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('CSE');
  const [designation, setDesignation] = useState('Professor');
  const [coursesInput, setCoursesInput] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    setFacultyId('');
    setEmail('');
    setDept('CSE');
    setDesignation('Professor');
    setCoursesInput('');
    setFormError(null);
    setEditingFaculty(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (fac: FacultyRecord) => {
    setEditingFaculty(fac);
    setName(fac.name);
    setFacultyId(fac.id);
    setEmail(fac.email);
    setDept(fac.department);
    setDesignation(fac.designation);
    setCoursesInput(fac.courses.join(', '));
    setFormError(null);
    setShowAddModal(true);
  };

  const handleToggleStatus = (facId: string) => {
    const nextFaculty = faculty.map((f) => {
      if (f.id === facId) {
        const nextStatus = f.status === 'Active' ? 'Deactivated' as const : 'Active' as const;
        setToastMsg(`Faculty "${f.name}" is now ${nextStatus}.`);
        setTimeout(() => setToastMsg(null), 2500);
        return {
          ...f,
          status: nextStatus
        };
      }
      return f;
    });

    setFaculty(nextFaculty);
    const updatedData = { ...data, faculty: nextFaculty };
    setData(updatedData);
    saveManagementData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !facultyId.trim() || !email.trim()) {
      setFormError('Please fill in all required fields (Name, ID, and Email).');
      return;
    }

    const coursesArray = coursesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (editingFaculty) {
      // Edit
      const nextFaculty = faculty.map((f) => {
        if (f.id === editingFaculty.id) {
          return {
            ...f,
            name,
            id: facultyId,
            email,
            department: dept,
            designation,
            courses: coursesArray
          };
        }
        return f;
      });

      setFaculty(nextFaculty);
      const updatedData = { ...data, faculty: nextFaculty };
      setData(updatedData);
      saveManagementData(updatedData);

      setShowAddModal(false);
      setToastMsg('Faculty profile updated successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    } else {
      // Add
      if (faculty.some((f) => f.id === facultyId)) {
        setFormError('Error: A faculty member with this ID already exists.');
        return;
      }

      const newFaculty: FacultyRecord = {
        id: facultyId,
        name,
        email,
        department: dept,
        designation,
        courses: coursesArray,
        status: 'Active'
      };

      const nextFaculty = [...faculty, newFaculty];
      setFaculty(nextFaculty);
      const updatedData = { ...data, faculty: nextFaculty };
      setData(updatedData);
      saveManagementData(updatedData);

      setShowAddModal(false);
      setToastMsg('Faculty registered successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()) && !f.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDept !== 'All' && f.department !== filterDept) return false;
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
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Faculty</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Faculty Management</h1>
          <p>Register new faculty instructor profiles, assign curriculum codes, and edit designations details.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenAdd}
        >
          <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i> Add Faculty
        </button>
      </div>

      {/* Toast Alert */}
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
              placeholder="Search by faculty name or ID..."
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

      {/* Table */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Faculty ID</th>
                <th style={{ padding: '12px 14px' }}>Faculty Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Designation</th>
                <th style={{ padding: '12px 14px' }}>Email</th>
                <th style={{ padding: '12px 14px' }}>Assigned Courses</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.length > 0 ? (
                filteredFaculty.map((fac) => (
                  <tr key={fac.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{fac.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{fac.name}</td>
                    <td style={{ padding: '12px 14px' }}>{fac.department}</td>
                    <td style={{ padding: '12px 14px' }}>{fac.designation}</td>
                    <td style={{ padding: '12px 14px' }}>{fac.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {fac.courses.map((c) => (
                          <span key={c} style={{ fontSize: '10px', background: 'rgba(124,92,255,0.1)', color: 'var(--accent-highlight)', border: '1px solid rgba(124,92,255,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className={`subject-att-status ${fac.status === 'Active' ? 'good' : 'critical'}`} style={{ fontSize: '8.5px' }}>
                        {fac.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-sso"
                          style={{ height: '26px', fontSize: '11px', padding: '0 8px', margin: 0, width: 'auto' }}
                          onClick={() => setViewingFaculty(fac)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn-sso"
                          style={{ height: '26px', fontSize: '11px', padding: '0 8px', margin: 0, width: 'auto' }}
                          onClick={() => handleOpenEdit(fac)}
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
                            background: fac.status === 'Active' ? 'rgba(217, 83, 79, 0.05)' : 'rgba(0, 216, 154, 0.05)',
                            borderColor: fac.status === 'Active' ? 'var(--color-error)' : '#00d89a',
                            color: fac.status === 'Active' ? 'var(--color-error)' : '#00d89a'
                          }}
                          onClick={() => handleToggleStatus(fac.id)}
                        >
                          {fac.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No faculty found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      {showAddModal && (
        <div className="search-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Faculty Roster</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{editingFaculty ? 'Edit Faculty Member' : 'Add Faculty Member'}</h2>
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
                  <label htmlFor="fac-name" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Faculty Name</label>
                  <input
                    id="fac-name"
                    type="text"
                    placeholder="e.g. Dr. Ramesh Prasad..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fac-id" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Faculty ID</label>
                  <input
                    id="fac-id"
                    type="text"
                    placeholder="e.g. FAC-104"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    disabled={!!editingFaculty}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fac-email" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    id="fac-email"
                    type="email"
                    placeholder="e.g. ramesh@campushub.com"
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
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Designation</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12.5px' }}
                    >
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fac-courses" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assigned Courses (Comma separated codes)</label>
                  <input
                    id="fac-courses"
                    type="text"
                    placeholder="e.g. CSE-301, CSE-302..."
                    value={coursesInput}
                    onChange={(e) => setCoursesInput(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  {editingFaculty ? 'Save Profile' : 'Register Faculty'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Viewing details dossier */}
      {viewingFaculty && (
        <div className="search-modal-overlay" onClick={() => setViewingFaculty(null)}>
          <div className="search-modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>FACULTY BIO</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Dossier View</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setViewingFaculty(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <div>Name: <strong style={{ color: 'white' }}>{viewingFaculty.name}</strong></div>
                <div>ID: <strong style={{ color: 'white' }}>{viewingFaculty.id}</strong></div>
                <div>Email: <strong style={{ color: 'white' }}>{viewingFaculty.email}</strong></div>
                <div>Dept: <strong style={{ color: 'white' }}>{viewingFaculty.department}</strong></div>
                <div>Designation: <strong style={{ color: 'white' }}>{viewingFaculty.designation}</strong></div>
                <div>Status: <span className={`subject-att-status ${viewingFaculty.status === 'Active' ? 'good' : 'critical'}`} style={{ fontSize: '9px' }}>{viewingFaculty.status}</span></div>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ width: '100%', height: '36px', margin: 0, fontSize: '12.5px' }}
                onClick={() => setViewingFaculty(null)}
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
export default AdminFaculty;
