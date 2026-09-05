import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, FacultyRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminFaculty: React.FC = () => {
  // Faculty state loaded from persistent storage
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(() => getManagementData().faculty);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<FacultyRecord | null>(null);
  const [deactivatingFaculty, setDeactivatingFaculty] = useState<FacultyRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [designation, setDesignation] = useState('Associate Professor');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Faculty Handler
  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !empId.trim() || !email.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (facultyList.some((f) => f.id === empId.trim())) {
      showToast(`Employee ID ${empId} is already registered.`, 'error');
      return;
    }

    const newFac: FacultyRecord = {
      id: empId.trim().toUpperCase(),
      name: name.trim(),
      department,
      designation,
      email: email.trim().toLowerCase(),
      courses: ['CSE-301'],
      status: 'Active'
    };

    const updated = [newFac, ...facultyList];
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setIsAddModalOpen(false);
    setName('');
    setEmpId('');
    setEmail('');
    showToast(`Faculty member ${newFac.name} (${newFac.id}) added successfully!`, 'success');
  };

  // Edit Faculty Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    const updated = facultyList.map((f) => (f.id === editingFaculty.id ? editingFaculty : f));
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setEditingFaculty(null);
    showToast(`Faculty member ${editingFaculty.name} updated successfully!`, 'success');
  };

  // Toggle Status Handler
  const handleConfirmToggleStatus = () => {
    if (!deactivatingFaculty) return;
    const newStatus: 'Active' | 'Deactivated' = deactivatingFaculty.status === 'Active' ? 'Deactivated' : 'Active';

    const updated = facultyList.map((f) => (f.id === deactivatingFaculty.id ? { ...f, status: newStatus } : f));
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setDeactivatingFaculty(null);
    showToast(`Faculty status updated to ${newStatus}.`, 'info');
  };

  // Filtering
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q);

      const matchDept = deptFilter === 'All' || f.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchStatus = statusFilter === 'All' || f.status === statusFilter;

      return matchQ && matchDept && matchStatus;
    });
  }, [facultyList, searchQuery, deptFilter, statusFilter]);

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Faculty Management</span>
            </div>
            <h1 className="module-title">Faculty & Staff Directory</h1>
            <p className="module-subtitle">
              Manage academic appointments, department designations, subject allotments, and credentials.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Add Faculty Member</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{facultyList.length * 14}</span>
              <span className="stat-label">Total Faculty Members</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">28</span>
              <span className="stat-label">Professors & HODs</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">32</span>
              <span className="stat-label">Associate Professors</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-book-open-reader"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">24</span>
              <span className="stat-label">Assistant Professors</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search faculty by name, employee ID (FAC-101), or email..."
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
              <label htmlFor="select-admin-fac-dept">Department</label>
              <select
                id="select-admin-fac-dept"
                className="c1-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science (CSE)</option>
                <option value="Electronics">Electronics (ECE)</option>
                <option value="Information Technology">Information Tech (IT)</option>
                <option value="Mechanical">Mechanical (MECH)</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="select-admin-fac-status">Status</label>
              <select
                id="select-admin-fac-status"
                className="c1-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Faculty Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Faculty Roster ({filteredFaculty.length} Instructors)</h3>
              <p className="c1-card-subtitle">Official academic teaching staff directory</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Faculty</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Faculty Instructor</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Assigned Courses</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((fac) => (
                  <tr key={fac.id}>
                    <td><span className="course-code-cell">{fac.id}</span></td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{fac.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fac.email}</div>
                      </div>
                    </td>
                    <td>{fac.department}</td>
                    <td>
                      <span className="c1-badge c1-badge-purple">{fac.designation}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {fac.courses.map((code) => (
                          <span key={code} className="course-code-tag">{code}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`c1-badge ${fac.status === 'Active' ? 'c1-badge-success' : 'c1-badge-error'}`}>
                        {fac.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => setViewingFaculty(fac)}
                          title="View faculty profile"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => setEditingFaculty(fac)}
                          title="Edit faculty"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', color: fac.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}
                          onClick={() => setDeactivatingFaculty(fac)}
                          title={fac.status === 'Active' ? 'Deactivate faculty' : 'Activate faculty'}
                        >
                          <i className={`fa-solid ${fac.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL 1: ADD FACULTY MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Register New Faculty Member"
            maxWidth="md"
          >
            <form onSubmit={handleAddFaculty} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Full Name & Title</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Dr. Rajesh Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. FAC-106"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Institutional Email</label>
                <input
                  type="email"
                  className="c1-input"
                  placeholder="e.g. rajesh.verma@campushub.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Department</label>
                  <select
                    className="c1-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Academic Designation</label>
                  <select
                    className="c1-select"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    <option value="Professor">Professor / HOD</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>Register Faculty</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EDIT FACULTY MODAL
            ============================================================ */}
        {editingFaculty && (
          <Modal
            isOpen={true}
            onClose={() => setEditingFaculty(null)}
            title={`Edit Faculty: ${editingFaculty.id}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingFaculty.name}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Institutional Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    value={editingFaculty.email}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingFaculty.department}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingFaculty.designation}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingFaculty(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: VIEW PROFILE MODAL
            ============================================================ */}
        {viewingFaculty && (
          <Modal
            isOpen={true}
            onClose={() => setViewingFaculty(null)}
            title={`Faculty Profile: ${viewingFaculty.name}`}
            maxWidth="md"
          >
            <div className="student-profile-dialog-content">
              <div className="student-dialog-header">
                <div className="student-avatar-badge" style={{ borderColor: 'var(--color-cyan)' }}>
                  {viewingFaculty.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="stu-name">{viewingFaculty.name}</h3>
                  <span className="stu-sub">
                    ID: <strong>{viewingFaculty.id}</strong> • {viewingFaculty.designation}
                  </span>
                </div>
              </div>

              <div className="student-profile-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Department:</span>
                  <span className="d-val">{viewingFaculty.department}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Email:</span>
                  <span className="d-val">{viewingFaculty.email}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Assigned Courses:</span>
                  <span className="d-val">{viewingFaculty.courses.join(', ')}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Status:</span>
                  <span className="d-val" style={{ color: '#34d399' }}>{viewingFaculty.status}</span>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setViewingFaculty(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: DEACTIVATE / ACTIVATE CONFIRMATION
            ============================================================ */}
        {deactivatingFaculty && (
          <Modal
            isOpen={true}
            onClose={() => setDeactivatingFaculty(null)}
            title="Confirm Status Change"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <i className="fa-solid fa-user-slash"></i>
              </div>
              <h3 className="confirm-heading">
                {deactivatingFaculty.status === 'Active' ? 'Deactivate Account?' : 'Reactivate Account?'}
              </h3>
              <p className="confirm-body-text">
                Are you sure you want to {deactivatingFaculty.status === 'Active' ? 'deactivate' : 'reactivate'} the faculty account for <strong>{deactivatingFaculty.name} ({deactivatingFaculty.id})</strong>?
              </p>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeactivatingFaculty(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: deactivatingFaculty.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}
                  onClick={handleConfirmToggleStatus}
                >
                  {deactivatingFaculty.status === 'Active' ? 'Deactivate' : 'Reactivate'}
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

export default AdminFaculty;
