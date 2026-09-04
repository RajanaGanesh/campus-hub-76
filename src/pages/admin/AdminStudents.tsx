import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, StudentRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminStudents: React.FC = () => {
  const mgmt = getManagementData();

  // Students state
  const [students, setStudents] = useState<StudentRecord[]>(mgmt.students);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState<StudentRecord | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('4');
  const [section, setSection] = useState('A');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Student Handler
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim() || !email.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (students.some((s) => s.id === rollNo.trim())) {
      showToast(`A student with Roll Number ${rollNo} already exists.`, 'error');
      return;
    }

    const newStu: StudentRecord = {
      id: rollNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 98765 43210',
      department,
      year,
      section,
      cgpa: 8.0,
      attendancePercent: 90,
      assignmentsCompleted: 0,
      performance: 'Good',
      status: 'Active'
    };

    setStudents([newStu, ...students]);
    setIsAddModalOpen(false);
    setName('');
    setRollNo('');
    setEmail('');
    setPhone('');
    showToast(`Student ${newStu.name} (${newStu.id}) registered successfully!`, 'success');
  };

  // Edit Student Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
    );

    setEditingStudent(null);
    showToast(`Student ${editingStudent.name} updated successfully!`, 'success');
  };

  // Toggle Status Handler
  const handleConfirmToggleStatus = () => {
    if (!deactivatingStudent) return;
    const newStatus = deactivatingStudent.status === 'Active' ? 'Deactivated' : 'Active';

    setStudents((prev) =>
      prev.map((s) => (s.id === deactivatingStudent.id ? { ...s, status: newStatus } : s))
    );

    setDeactivatingStudent(null);
    showToast(`Student status updated to ${newStatus}.`, 'info');
  };

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      const matchDept = deptFilter === 'All' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
      const matchYear = yearFilter === 'All' || s.year === yearFilter;
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchQ && matchDept && matchYear && matchStatus;
    });
  }, [students, searchQuery, deptFilter, yearFilter, statusFilter]);

  const activeCount = students.filter((s) => s.status === 'Active').length;
  const lowAttCount = students.filter((s) => s.attendancePercent < 75).length;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Student Management</span>
            </div>
            <h1 className="module-title">Student Directory & Admissions</h1>
            <p className="module-subtitle">
              Manage student enrollment records, academic standings, department allocations, and credentials.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Add New Student</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{students.length * 20}</span>
              <span className="stat-label">Total Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{activeCount * 20}</span>
              <span className="stat-label">Active Academic Accounts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>{lowAttCount}</span>
              <span className="stat-label">Low Attendance (&lt;75%)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">8.42</span>
              <span className="stat-label">Institutional Avg CGPA</span>
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
              placeholder="Search students by name, roll number (236F1A0551), email, or department..."
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
              <label htmlFor="select-admin-dept">Department</label>
              <select
                id="select-admin-dept"
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
              <label htmlFor="select-admin-year">Academic Year</label>
              <select
                id="select-admin-year"
                className="c1-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="All">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="select-admin-status">Account Status</label>
              <select
                id="select-admin-status"
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

        {/* Students Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Enrolled Candidates ({filteredStudents.length} Records)</h3>
              <p className="c1-card-subtitle">Official university student ledger and authorization directory</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Candidate</th>
                  <th>Department</th>
                  <th>Year & Sec</th>
                  <th>CGPA</th>
                  <th>Attendance</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu) => (
                  <tr key={stu.id}>
                    <td><span className="course-code-cell">{stu.id}</span></td>
                    <td>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{stu.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.email}</div>
                      </div>
                    </td>
                    <td>{stu.department}</td>
                    <td>Year {stu.year} • Sec {stu.section}</td>
                    <td><strong style={{ color: '#38bdf8' }}>{stu.cgpa.toFixed(1)}</strong></td>
                    <td>
                      <span style={{ color: stu.attendancePercent >= 75 ? '#34d399' : '#fb7185', fontWeight: 700 }}>
                        {stu.attendancePercent}%
                      </span>
                    </td>
                    <td>
                      <span className={`c1-badge ${stu.status === 'Active' ? 'c1-badge-success' : 'c1-badge-error'}`}>
                        {stu.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => setViewingStudent(stu)}
                          title="View student profile"
                        >
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => setEditingStudent(stu)}
                          title="Edit student"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', color: stu.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}
                          onClick={() => setDeactivatingStudent(stu)}
                          title={stu.status === 'Active' ? 'Deactivate student' : 'Activate student'}
                        >
                          <i className={`fa-solid ${stu.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
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
            MODAL 1: ADD STUDENT MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Register New Student"
            maxWidth="md"
          >
            <form onSubmit={handleAddStudent} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">University Roll Number</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. 236F1A0562"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Institutional Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    placeholder="e.g. rahul.sharma@campushub.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="c1-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Academic Department</label>
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
                  <label className="form-label">Year & Section</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="c1-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    <select
                      className="c1-select"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
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
                  <span>Register Student</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EDIT STUDENT MODAL
            ============================================================ */}
        {editingStudent && (
          <Modal
            isOpen={true}
            onClose={() => setEditingStudent(null)}
            title={`Edit Student: ${editingStudent.id}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Institutional Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
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
                    value={editingStudent.department}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingStudent.section}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingStudent(null)}
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
        {viewingStudent && (
          <Modal
            isOpen={true}
            onClose={() => setViewingStudent(null)}
            title={`Student Details: ${viewingStudent.name}`}
            maxWidth="md"
          >
            <div className="student-profile-dialog-content">
              <div className="student-dialog-header">
                <div className="student-avatar-badge">
                  {viewingStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="stu-name">{viewingStudent.name}</h3>
                  <span className="stu-sub">
                    Roll No: <strong>{viewingStudent.id}</strong> • {viewingStudent.email}
                  </span>
                </div>
              </div>

              <div className="student-profile-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Department:</span>
                  <span className="d-val">{viewingStudent.department}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Year & Section:</span>
                  <span className="d-val">Year {viewingStudent.year} (Section {viewingStudent.section})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">CGPA:</span>
                  <span className="d-val" style={{ color: '#38bdf8' }}>{viewingStudent.cgpa} / 10.0</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Attendance:</span>
                  <span className="d-val" style={{ color: viewingStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                    {viewingStudent.attendancePercent}%
                  </span>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setViewingStudent(null)}
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
        {deactivatingStudent && (
          <Modal
            isOpen={true}
            onClose={() => setDeactivatingStudent(null)}
            title="Confirm Status Change"
            maxWidth="sm"
          >
            <div className="confirm-dialog-content">
              <div className="confirm-icon-box" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
                <i className="fa-solid fa-user-slash"></i>
              </div>
              <h3 className="confirm-heading">
                {deactivatingStudent.status === 'Active' ? 'Deactivate Account?' : 'Reactivate Account?'}
              </h3>
              <p className="confirm-body-text">
                Are you sure you want to {deactivatingStudent.status === 'Active' ? 'deactivate' : 'reactivate'} the student account for <strong>{deactivatingStudent.name} ({deactivatingStudent.id})</strong>?
              </p>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeactivatingStudent(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: deactivatingStudent.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}
                  onClick={handleConfirmToggleStatus}
                >
                  {deactivatingStudent.status === 'Active' ? 'Deactivate' : 'Reactivate'}
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

export default AdminStudents;
