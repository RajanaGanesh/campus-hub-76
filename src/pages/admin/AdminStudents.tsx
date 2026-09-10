import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, StudentRecord } from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminStudents: React.FC = () => {
  // Students state loaded from persistent storage
  const [students, setStudents] = useState<StudentRecord[]>(() => getManagementData().students);

  // Sync from Supabase on mount (only if live Supabase is connected)
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteStudents = async () => {
      try {
        if (!supabase) return;
        const remote = await dbService.getStudents();
        if (isMounted && remote && remote.length > 0) {
          setStudents(remote);
          const mgmt = getManagementData();
          saveManagementData({ ...mgmt, students: remote });
        }
      } catch (err) {
        console.warn('Could not sync remote students:', err);
      }
    };

    fetchRemoteStudents();
    return () => { isMounted = false; };
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState<StudentRecord | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('IV Year');
  const [section, setSection] = useState('A');
  const [cgpa, setCgpa] = useState<number>(8.5);
  const [attendance, setAttendance] = useState<number>(90);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim() || !email.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const cleanRollNo = rollNo.trim().toUpperCase();
    if (students.some((s) => s.id.toUpperCase() === cleanRollNo)) {
      showToast(`A student with Roll Number ${cleanRollNo} already exists.`, 'error');
      return;
    }

    const newStu: StudentRecord = {
      id: cleanRollNo,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '+91 98765 43210',
      department,
      year: year.includes('Year') ? year : `${year} Year`,
      section,
      cgpa: Number(cgpa) || 8.0,
      attendancePercent: Number(attendance) || 90,
      assignmentsCompleted: 0,
      performance: Number(cgpa) >= 8.5 ? 'Excellent' : Number(cgpa) >= 7.5 ? 'Good' : 'Average',
      status: 'Active'
    };

    // 1. Update local state & cache
    const updated = [newStu, ...students];
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    setIsAddModalOpen(false);
    setName('');
    setRollNo('');
    setEmail('');
    setPhone('');
    setCgpa(8.5);
    setAttendance(90);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    // 2. Persist directly to Supabase database
    try {
      const res = await dbService.addStudent(newStu);
      if (res.success) {
        showToast(`Student ${newStu.name} (${newStu.id}) stored in database successfully!`, 'success');
      } else {
        showToast(`Student registered locally. (${res.error || 'Saved in local cache'})`, 'info');
      }
    } catch (err: any) {
      showToast(`Student saved locally. (${err?.message || 'Offline mode'})`, 'info');
    }
  };

  // Edit Student Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const cleanName = editingStudent.name.trim();
    if (!cleanName) {
      showToast('Student name cannot be empty.', 'error');
      return;
    }

    const targetStudent: StudentRecord = {
      ...editingStudent,
      name: cleanName,
      email: editingStudent.email.trim().toLowerCase(),
      phone: editingStudent.phone?.trim() || '+91 98765 43210',
      cgpa: Number(editingStudent.cgpa) || 8.0,
      attendancePercent: Number(editingStudent.attendancePercent) || 85,
      year: editingStudent.year.includes('Year') ? editingStudent.year : `${editingStudent.year} Year`,
      performance: Number(editingStudent.cgpa) >= 8.5 ? 'Excellent' : Number(editingStudent.cgpa) >= 7.5 ? 'Good' : 'Average'
    };

    const updated = students.map((s) => (s.id === targetStudent.id ? targetStudent : s));
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    setEditingStudent(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.updateStudent(targetStudent);
      showToast(`Student ${targetStudent.name} updated successfully!`, 'success');
    } catch {
      showToast(`Student ${targetStudent.name} updated in local cache.`, 'success');
    }
  };

  // Delete Student Handler
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    const targetStudent = deletingStudent;
    const updated = students.filter((s) => s.id !== targetStudent.id);
    setStudents(updated);

    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    setDeletingStudent(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.deleteStudent(targetStudent.id);
      showToast(`Student ${targetStudent.name} (${targetStudent.id}) removed successfully.`, 'info');
    } catch {
      showToast(`Student ${targetStudent.name} removed from cache.`, 'info');
    }
  };

  // Toggle Status Handler
  const handleConfirmToggleStatus = async () => {
    if (!deactivatingStudent) return;
    const newStatus: 'Active' | 'Deactivated' = deactivatingStudent.status === 'Active' ? 'Deactivated' : 'Active';

    const updated = students.map((s) => (s.id === deactivatingStudent.id ? { ...s, status: newStatus } : s));
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    const targetStudent: StudentRecord = { ...deactivatingStudent, status: newStatus };
    setDeactivatingStudent(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.updateStudent(targetStudent);
      showToast(`Student status updated to ${newStatus}.`, 'info');
    } catch {
      showToast(`Student status updated to ${newStatus}.`, 'info');
    }
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
      const matchYear = yearFilter === 'All' || s.year.includes(yearFilter);
      const matchStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchQ && matchDept && matchYear && matchStatus;
    });
  }, [students, searchQuery, deptFilter, yearFilter, statusFilter]);

  const activeCount = students.filter((s) => s.status === 'Active').length;
  const lowAttCount = students.filter((s) => s.attendancePercent < 75).length;
  const avgCgpa = students.length > 0 ? (students.reduce((sum, s) => sum + (Number(s.cgpa) || 0), 0) / students.length).toFixed(2) : '8.40';

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
              <span className="stat-num">{students.length}</span>
              <span className="stat-label">Total Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{activeCount}</span>
              <span className="stat-label">Active Student Accounts</span>
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
              <span className="stat-num">{avgCgpa}</span>
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
                <option value="CSE">CSE / Computer Science</option>
                <option value="ECE">ECE / Electronics</option>
                <option value="IT">Information Technology</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
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
                <option value="I Year">1st Year</option>
                <option value="II Year">2nd Year</option>
                <option value="III Year">3rd Year</option>
                <option value="IV Year">4th Year</option>
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
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="c1-card-title">Enrolled Candidates ({filteredStudents.length} Records)</h3>
              <p className="c1-card-subtitle">Official university student ledger and authorization directory</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            {filteredStudents.length > 0 ? (
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
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                      <td>
                        <span className="c1-badge c1-badge-primary">{stu.department}</span>
                      </td>
                      <td>{stu.year} • Sec {stu.section}</td>
                      <td><strong style={{ color: '#38bdf8' }}>{Number(stu.cgpa).toFixed(1)}</strong></td>
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
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => setViewingStudent(stu)}
                            title="View student profile"
                          >
                            <i className="fa-solid fa-eye"></i>
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}
                            onClick={() => setEditingStudent({ ...stu })}
                            title="Edit student details"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              color: stu.status === 'Active' ? '#f59e0b' : 'var(--color-success)'
                            }}
                            onClick={() => setDeactivatingStudent(stu)}
                            title={stu.status === 'Active' ? 'Deactivate student' : 'Activate student'}
                          >
                            <i className={`fa-solid ${stu.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-icon-only"
                            style={{ width: '32px', height: '32px', padding: 0, color: 'var(--color-error)' }}
                            onClick={() => setDeletingStudent(stu)}
                            title="Delete Student"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', opacity: 0.6 }}></i>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No students found matching your search</p>
                <p style={{ fontSize: '0.85rem' }}>Try clearing your filters or adding a new student candidate.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ marginTop: '16px' }}
                  onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('All');
                    setYearFilter('All');
                    setStatusFilter('All');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
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
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-circle-info" style={{ color: '#38bdf8' }}></i>
                <span>Registered students can log in using their <strong>Full Name</strong>, <strong>Roll Number</strong>, or <strong>Email</strong> with password <code>student123</code> or <code>123456789</code>.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    University Roll Number *
                  </label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    className="c1-input"
                    placeholder="e.g. rahul.sharma@campushub.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="c1-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="CSE">CSE / Computer Science</option>
                    <option value="ECE">ECE / Electronics</option>
                    <option value="IT">Information Technology</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Academic Year
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="I Year">I Year (1st Year)</option>
                    <option value="II Year">II Year (2nd Year)</option>
                    <option value="III Year">III Year (3rd Year)</option>
                    <option value="IV Year">IV Year (4th Year)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Section
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Cumulative CGPA (0.0 - 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="c1-input"
                    value={cgpa}
                    onChange={(e) => setCgpa(parseFloat(e.target.value) || 8.0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Attendance Percentage (0 - 100%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="c1-input"
                    value={attendance}
                    onChange={(e) => setAttendance(parseInt(e.target.value) || 85)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
            title={`Edit Student: ${editingStudent.name} (${editingStudent.id})`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    University Roll Number
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editingStudent.id}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="c1-input"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="c1-input"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    className="c1-input"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingStudent.department}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                  >
                    <option value="CSE">CSE / Computer Science</option>
                    <option value="ECE">ECE / Electronics</option>
                    <option value="IT">Information Technology</option>
                    <option value="MECH">Mechanical Engineering</option>
                    <option value="CIVIL">Civil Engineering</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Academic Year
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingStudent.year}
                    onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                  >
                    <option value="I Year">I Year (1st Year)</option>
                    <option value="II Year">II Year (2nd Year)</option>
                    <option value="III Year">III Year (3rd Year)</option>
                    <option value="IV Year">IV Year (4th Year)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Section
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingStudent.section}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className="c1-input"
                    value={editingStudent.cgpa}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        cgpa: parseFloat(e.target.value) || 8.0
                      })
                    }
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Attendance %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="c1-input"
                    value={editingStudent.attendancePercent}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        attendancePercent: parseInt(e.target.value) || 85
                      })
                    }
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Account Status
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingStudent.status}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        status: e.target.value as any
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
            MODAL 3: DELETE STUDENT MODAL
            ============================================================ */}
        {deletingStudent && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingStudent(null)}
            title="Remove Student Record"
            maxWidth="sm"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-error)', fontSize: '1.3rem', marginTop: '2px' }}></i>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '4px' }}>
                    Confirm Removal
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Are you sure you want to delete <strong>{deletingStudent.name}</strong> (Roll No: <strong>{deletingStudent.id}</strong>) from the {deletingStudent.department} student ledger? This will permanently delete their admissions record.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingStudent(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  onClick={handleConfirmDelete}
                  style={{ background: 'var(--color-error)', color: '#fff' }}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Delete Student</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: VIEW PROFILE MODAL
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
                  <span className="d-val">{viewingStudent.year} (Section {viewingStudent.section})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Cumulative CGPA:</span>
                  <span className="d-val" style={{ color: '#38bdf8' }}>{Number(viewingStudent.cgpa).toFixed(2)} / 10.0</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Attendance:</span>
                  <span className="d-val" style={{ color: viewingStudent.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                    {viewingStudent.attendancePercent}%
                  </span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Contact Phone:</span>
                  <span className="d-val">{viewingStudent.phone || 'N/A'}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Status:</span>
                  <span className="d-val" style={{ color: viewingStudent.status === 'Active' ? '#34d399' : '#fb7185' }}>
                    {viewingStudent.status}
                  </span>
                </div>
              </div>

              <div className="modal-dialog-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ color: 'var(--accent-blue)' }}
                  onClick={() => {
                    const s = viewingStudent;
                    setViewingStudent(null);
                    setEditingStudent({ ...s });
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit Student</span>
                </button>

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
            MODAL 5: DEACTIVATE / ACTIVATE CONFIRMATION
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
