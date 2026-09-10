import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, FacultyRecord } from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminFaculty: React.FC = () => {
  // Faculty state loaded from persistent storage
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(() => getManagementData().faculty);

  // Sync from Supabase on mount (only if live Supabase is connected)
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteFaculty = async () => {
      try {
        if (!supabase) return;
        const remote = await dbService.getFaculty();
        if (isMounted && remote && remote.length > 0) {
          setFacultyList(remote);
          const mgmt = getManagementData();
          saveManagementData({ ...mgmt, faculty: remote });
        }
      } catch (err) {
        console.warn('Could not sync remote faculty:', err);
      }
    };

    fetchRemoteFaculty();
    return () => { isMounted = false; };
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);
  const [viewingFaculty, setViewingFaculty] = useState<FacultyRecord | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<FacultyRecord | null>(null);
  const [deactivatingFaculty, setDeactivatingFaculty] = useState<FacultyRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [designation, setDesignation] = useState('Associate Professor');
  const [coursesInput, setCoursesInput] = useState('CSE-301');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Faculty Handler
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !empId.trim() || !email.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const cleanEmpId = empId.trim().toUpperCase();
    if (facultyList.some((f) => f.id.toUpperCase() === cleanEmpId)) {
      showToast(`Employee ID ${cleanEmpId} is already registered.`, 'error');
      return;
    }

    const assignedCourses = coursesInput
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const newFac: FacultyRecord = {
      id: cleanEmpId,
      name: name.trim(),
      department,
      designation,
      email: email.trim().toLowerCase(),
      courses: assignedCourses.length > 0 ? assignedCourses : ['CSE-301'],
      status: 'Active'
    };

    // 1. Update local state & cache
    const updated = [newFac, ...facultyList];
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setIsAddModalOpen(false);
    setName('');
    setEmpId('');
    setEmail('');
    setCoursesInput('CSE-301');

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    // 2. Persist to Supabase
    try {
      const res = await dbService.addFaculty(newFac);
      if (res.success) {
        showToast(`Faculty member ${newFac.name} (${newFac.id}) registered successfully!`, 'success');
      } else {
        showToast(`Faculty added locally. (${res.error || 'Saved in local cache'})`, 'info');
      }
    } catch (err: any) {
      showToast(`Faculty added locally. (${err?.message || 'Offline mode'})`, 'info');
    }
  };

  // Edit Faculty Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;

    const cleanName = editingFaculty.name.trim();
    if (!cleanName) {
      showToast('Faculty name cannot be empty.', 'error');
      return;
    }

    const targetFaculty = {
      ...editingFaculty,
      name: cleanName,
      email: editingFaculty.email.trim().toLowerCase()
    };

    const updated = facultyList.map((f) => (f.id === targetFaculty.id ? targetFaculty : f));
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setEditingFaculty(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.updateFaculty(targetFaculty);
      showToast(`Faculty member ${targetFaculty.name} updated successfully!`, 'success');
    } catch {
      showToast(`Faculty member ${targetFaculty.name} updated in local cache.`, 'success');
    }
  };

  // Delete Faculty Handler
  const handleConfirmDelete = async () => {
    if (!deletingFaculty) return;

    const targetFaculty = deletingFaculty;
    const updated = facultyList.filter((f) => f.id !== targetFaculty.id);
    setFacultyList(updated);

    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    setDeletingFaculty(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.deleteFaculty(targetFaculty.id);
      showToast(`Faculty member ${targetFaculty.name} (${targetFaculty.id}) deleted.`, 'info');
    } catch {
      showToast(`Faculty member ${targetFaculty.name} removed from cache.`, 'info');
    }
  };

  // Toggle Status Handler
  const handleConfirmToggleStatus = async () => {
    if (!deactivatingFaculty) return;
    const newStatus: 'Active' | 'Deactivated' = deactivatingFaculty.status === 'Active' ? 'Deactivated' : 'Active';

    const updated = facultyList.map((f) => (f.id === deactivatingFaculty.id ? { ...f, status: newStatus } : f));
    setFacultyList(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, faculty: updated });

    const targetFaculty: FacultyRecord = { ...deactivatingFaculty, status: newStatus };
    setDeactivatingFaculty(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));

    try {
      await dbService.updateFaculty(targetFaculty);
      showToast(`Faculty status updated to ${newStatus}.`, 'info');
    } catch {
      showToast(`Faculty status updated to ${newStatus}.`, 'info');
    }
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

  const activeFacultyCount = facultyList.filter((f) => f.status === 'Active').length;

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
              <span className="stat-num">{facultyList.length}</span>
              <span className="stat-label">Total Faculty Members</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">
                {facultyList.filter((f) => f.designation.includes('Professor') || f.designation.includes('HOD')).length}
              </span>
              <span className="stat-label">Professors & HODs</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{activeFacultyCount} Active</span>
              <span className="stat-label">Active Instructors</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-book-open-reader"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">
                {facultyList.reduce((sum, f) => sum + (f.courses?.length || 0), 0)}
              </span>
              <span className="stat-label">Assigned Sections</span>
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
                <option value="CSE">CSE / Computer Science</option>
                <option value="ECE">ECE / Electronics</option>
                <option value="IT">Information Technology</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
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
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="c1-card-title">Faculty Roster ({filteredFaculty.length} Instructors)</h3>
              <p className="c1-card-subtitle">Official academic teaching staff directory and course allocations</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Faculty</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            {filteredFaculty.length > 0 ? (
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Faculty Instructor</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Assigned Courses</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                      <td>
                        <span className="c1-badge c1-badge-primary">{fac.department}</span>
                      </td>
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
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                            onClick={() => setViewingFaculty(fac)}
                            title="View Faculty Profile"
                          >
                            <i className="fa-solid fa-eye"></i>
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}
                            onClick={() => setEditingFaculty({ ...fac })}
                            title="Edit Faculty Details"
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
                              color: fac.status === 'Active' ? '#f59e0b' : 'var(--color-success)'
                            }}
                            onClick={() => setDeactivatingFaculty(fac)}
                            title={fac.status === 'Active' ? 'Deactivate faculty' : 'Activate faculty'}
                          >
                            <i className={`fa-solid ${fac.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-icon-only"
                            style={{ width: '32px', height: '32px', padding: 0, color: 'var(--color-error)' }}
                            onClick={() => setDeletingFaculty(fac)}
                            title="Delete Faculty Member"
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
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No faculty members found matching your search</p>
                <p style={{ fontSize: '0.85rem' }}>Try clearing your filters or adding a new faculty member.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ marginTop: '16px' }}
                  onClick={() => {
                    setSearchQuery('');
                    setDeptFilter('All');
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
            MODAL 1: ADD FACULTY MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Register New Faculty Member"
            maxWidth="md"
          >
            <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Dr. Rajesh Verma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Employee ID *
                  </label>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Institutional Email *
                </label>
                <input
                  type="email"
                  className="c1-input"
                  placeholder="e.g. rajesh.verma@campushub.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Academic Designation
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  >
                    <option value="Professor">Professor / HOD</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer / Instructor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Assigned Course Codes (comma-separated)
                </label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. CSE-301, CSE-302"
                  value={coursesInput}
                  onChange={(e) => setCoursesInput(e.target.value)}
                />
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
            title={`Edit Faculty: ${editingFaculty.name} (${editingFaculty.id})`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editingFaculty.id}
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
                    value={editingFaculty.name}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  className="c1-input"
                  value={editingFaculty.email}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingFaculty.department}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                  >
                    <option value="CSE">Computer Science & Engineering (CSE)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Designation
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingFaculty.designation}
                    onChange={(e) => setEditingFaculty({ ...editingFaculty, designation: e.target.value })}
                  >
                    <option value="Professor">Professor / HOD</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer / Instructor</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Courses (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingFaculty.courses.join(', ')}
                    onChange={(e) =>
                      setEditingFaculty({
                        ...editingFaculty,
                        courses: e.target.value.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
                      })
                    }
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingFaculty.status}
                    onChange={(e) =>
                      setEditingFaculty({
                        ...editingFaculty,
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
            MODAL 3: DELETE FACULTY MODAL
            ============================================================ */}
        {deletingFaculty && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingFaculty(null)}
            title="Remove Faculty Member"
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
                    Are you sure you want to delete <strong>{deletingFaculty.name}</strong> (Employee ID: <strong>{deletingFaculty.id}</strong>) from the {deletingFaculty.department} department roster? This will permanently unassign their active courses.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingFaculty(null)}
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
                  <span>Delete Faculty</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: VIEW PROFILE MODAL
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
                  <span className="d-val" style={{ color: viewingFaculty.status === 'Active' ? '#34d399' : '#fb7185' }}>
                    {viewingFaculty.status}
                  </span>
                </div>
              </div>

              <div className="modal-dialog-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ color: 'var(--accent-blue)' }}
                  onClick={() => {
                    const f = viewingFaculty;
                    setViewingFaculty(null);
                    setEditingFaculty({ ...f });
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit Faculty</span>
                </button>

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
            MODAL 5: DEACTIVATE / ACTIVATE CONFIRMATION
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
