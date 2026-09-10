import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getDepartments, saveDepartments, DepartmentItem } from '../../services/storageService';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => getDepartments());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Under Review'>('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);
  const [overviewDept, setOverviewDept] = useState<DepartmentItem | null>(null);

  // Add Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHOD, setDeptHOD] = useState('');
  const [deptLabs, setDeptLabs] = useState<number>(4);
  const [deptStudents, setDeptStudents] = useState<number>(120);
  const [deptFaculty, setDeptFaculty] = useState<number>(10);
  const [deptEstablished, setDeptEstablished] = useState<string>(new Date().getFullYear().toString());
  const [deptStatus, setDeptStatus] = useState<'Active' | 'Under Review'>('Active');

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Add Department Handler
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = deptCode.trim().toUpperCase();
    const cleanName = deptName.trim();

    if (!cleanName || !cleanCode) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (departments.some((d) => d.code.toUpperCase() === cleanCode)) {
      showToast(`A department with code "${cleanCode}" already exists.`, 'error');
      return;
    }

    const newDept: DepartmentItem = {
      code: cleanCode,
      name: cleanName,
      hod: deptHOD.trim() || 'To Be Appointed',
      students: Number(deptStudents) || 0,
      faculty: Number(deptFaculty) || 0,
      labs: Number(deptLabs) || 1,
      established: deptEstablished.trim() || new Date().getFullYear().toString(),
      status: deptStatus
    };

    const updated = [...departments, newDept];
    setDepartments(updated);
    saveDepartments(updated);

    setIsAddModalOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptHOD('');
    setDeptLabs(4);
    setDeptStudents(120);
    setDeptFaculty(10);
    setDeptEstablished(new Date().getFullYear().toString());
    setDeptStatus('Active');

    window.dispatchEvent(new Event('storage'));
    showToast(`Department of "${newDept.name}" created successfully!`, 'success');
  };

  // Edit Department Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    const cleanName = editingDept.name.trim();
    if (!cleanName) {
      showToast('Department name cannot be empty.', 'error');
      return;
    }

    const updated = departments.map((d) =>
      d.code === editingDept.code
        ? {
            ...editingDept,
            name: cleanName,
            hod: editingDept.hod.trim() || 'To Be Appointed',
            students: Number(editingDept.students) || 0,
            faculty: Number(editingDept.faculty) || 0,
            labs: Number(editingDept.labs) || 1,
            established: editingDept.established.trim() || '2020',
            status: editingDept.status
          }
        : d
    );

    setDepartments(updated);
    saveDepartments(updated);

    const savedDept = editingDept;
    setEditingDept(null);

    window.dispatchEvent(new Event('storage'));
    showToast(`Department of "${savedDept.name}" updated successfully!`, 'success');
  };

  // Delete Department Handler
  const handleConfirmDelete = () => {
    if (!deletingDept) return;

    const targetDept = deletingDept;
    const updated = departments.filter((d) => d.code !== targetDept.code);

    setDepartments(updated);
    saveDepartments(updated);

    setDeletingDept(null);
    window.dispatchEvent(new Event('storage'));
    showToast(`Department "${targetDept.name}" (${targetDept.code}) removed successfully.`, 'info');
  };

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.hod.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchQ && matchStatus;
    });
  }, [departments, searchQuery, statusFilter]);

  const totalStudents = departments.reduce((sum, d) => sum + d.students, 0);
  const totalFaculty = departments.reduce((sum, d) => sum + d.faculty, 0);
  const totalLabs = departments.reduce((sum, d) => sum + d.labs, 0);

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Academic Departments</span>
            </div>
            <h1 className="module-title">Academic Departments & Branches</h1>
            <p className="module-subtitle">
              Manage university academic schools, department chairs, laboratory infrastructure, and faculty allocations.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-building-circle-check"></i>
              <span>Add Department</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-building-columns"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{departments.length}</span>
              <span className="stat-label">Academic Departments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-flask-vial"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalLabs}</span>
              <span className="stat-label">Active Research Labs</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalStudents}</span>
              <span className="stat-label">Total Student Capacity</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalFaculty}</span>
              <span className="stat-label">Faculty Staff Allocated</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="c1-card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="Search department, code, or HOD..."
                  style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}
                ></i>
              </div>

              {/* Status filter */}
              <select
                className="c1-select"
                style={{ minWidth: '160px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>

            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredDepartments.length}</strong> of {departments.length} departments
            </span>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="faculty-courses-full-grid">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((dept) => (
              <div key={dept.code} className="c1-card faculty-course-card-full">
                <div className="f-card-header">
                  <div>
                    <span className="course-code-tag">{dept.code}</span>
                    <h3 className="course-title-text">{dept.name}</h3>
                    <span className="course-dept-text">Established in {dept.established}</span>
                  </div>
                  <span
                    className={`c1-badge ${
                      dept.status === 'Active' ? 'c1-badge-success' : 'c1-badge-warning'
                    }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div className="course-info-grid-compact">
                  <div className="c-info-cell">
                    <i className="fa-solid fa-user-tie"></i>
                    <span>HOD: <strong>{dept.hod}</strong></span>
                  </div>
                  <div className="c-info-cell">
                    <i className="fa-solid fa-users"></i>
                    <span>Students: <strong>{dept.students}</strong></span>
                  </div>
                  <div className="c-info-cell">
                    <i className="fa-solid fa-chalkboard-user"></i>
                    <span>Faculty: <strong>{dept.faculty}</strong></span>
                  </div>
                  <div className="c-info-cell">
                    <i className="fa-solid fa-flask"></i>
                    <span>Labs: <strong>{dept.labs} Labs</strong></span>
                  </div>
                </div>

                <div className="course-shortcuts-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
                    onClick={() => setOverviewDept(dept)}
                    title="View Department Overview"
                  >
                    <i className="fa-solid fa-eye"></i>
                    <span>Overview</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', color: 'var(--accent-blue)' }}
                    onClick={() => setEditingDept({ ...dept })}
                    title="Edit Department Details"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-icon-only"
                    style={{ width: '34px', height: '34px', padding: 0, color: 'var(--color-error)' }}
                    onClick={() => setDeletingDept(dept)}
                    title="Delete Department"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="c1-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-building-circle-xmark" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', opacity: 0.6 }}></i>
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No departments match your search</p>
              <p style={{ fontSize: '0.85rem' }}>Try refining your search query or reset the status filter.</p>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                style={{ marginTop: '16px' }}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ============================================================
            MODAL 1: ADD DEPARTMENT MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Create Academic Department"
            maxWidth="md"
          >
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Chemical Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department Code *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. CHEM"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={deptHOD}
                    onChange={(e) => setDeptHOD(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Established Year
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. 2021"
                    value={deptEstablished}
                    onChange={(e) => setDeptEstablished(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={deptStudents}
                    onChange={(e) => setDeptStudents(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Faculty Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={deptFaculty}
                    onChange={(e) => setDeptFaculty(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Research Labs
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={deptLabs}
                    onChange={(e) => setDeptLabs(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Department Status
                </label>
                <select
                  className="c1-select"
                  style={{ width: '100%' }}
                  value={deptStatus}
                  onChange={(e) => setDeptStatus(e.target.value as any)}
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                </select>
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
                  <span>Create Department</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EDIT DEPARTMENT MODAL
            ============================================================ */}
        {editingDept && (
          <Modal
            isOpen={true}
            onClose={() => setEditingDept(null)}
            title={`Edit Department: ${editingDept.name} (${editingDept.code})`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department Code
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editingDept.code}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="c1-input"
                    value={editingDept.name}
                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingDept.hod}
                    onChange={(e) => setEditingDept({ ...editingDept, hod: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Established Year
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingDept.established}
                    onChange={(e) => setEditingDept({ ...editingDept, established: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={editingDept.students}
                    onChange={(e) => setEditingDept({ ...editingDept, students: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Faculty Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={editingDept.faculty}
                    onChange={(e) => setEditingDept({ ...editingDept, faculty: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Research Labs
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={editingDept.labs}
                    onChange={(e) => setEditingDept({ ...editingDept, labs: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Department Status
                </label>
                <select
                  className="c1-select"
                  style={{ width: '100%' }}
                  value={editingDept.status}
                  onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value as any })}
                >
                  <option value="Active">Active</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingDept(null)}
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
            MODAL 3: DELETE CONFIRMATION MODAL
            ============================================================ */}
        {deletingDept && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingDept(null)}
            title="Remove Academic Department"
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
                    Are you sure you want to delete the <strong>{deletingDept.name} ({deletingDept.code})</strong> department? This will unassign its records from the administrative registry.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingDept(null)}
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
                  <span>Delete Department</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: DEPARTMENT OVERVIEW MODAL
            ============================================================ */}
        {overviewDept && (
          <Modal
            isOpen={true}
            onClose={() => setOverviewDept(null)}
            title={`Department Overview: ${overviewDept.name}`}
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {overviewDept.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="course-code-tag">{overviewDept.code}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Founded in {overviewDept.established}
                    </span>
                    <span
                      className={`c1-badge ${
                        overviewDept.status === 'Active' ? 'c1-badge-success' : 'c1-badge-warning'
                      }`}
                    >
                      {overviewDept.status}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div className="c1-card" style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Department Chair (HOD)</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{overviewDept.hod}</strong>
                </div>

                <div className="c1-card" style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Research & Specialized Labs</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--accent-blue)' }}>{overviewDept.labs} Facilities</strong>
                </div>

                <div className="c1-card" style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Enrolled Student Capacity</span>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-success)' }}>{overviewDept.students} Students</strong>
                </div>

                <div className="c1-card" style={{ padding: '12px 16px', background: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Faculty Staff Allocated</span>
                  <strong style={{ fontSize: '0.95rem', color: '#fbbf24' }}>{overviewDept.faculty} Members</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ color: 'var(--accent-blue)' }}
                  onClick={() => {
                    const d = overviewDept;
                    setOverviewDept(null);
                    setEditingDept({ ...d });
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit Department</span>
                </button>

                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setOverviewDept(null)}
                >
                  Close Overview
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

export default AdminDepartments;
