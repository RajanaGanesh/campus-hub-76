import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getDepartments, saveDepartments, DepartmentItem } from '../../services/storageService';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => getDepartments());

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHOD, setDeptHOD] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const newDept: DepartmentItem = {
      code: deptCode.trim().toUpperCase(),
      name: deptName.trim(),
      hod: deptHOD.trim() || 'To Be Appointed',
      students: 0,
      faculty: 0,
      labs: 2,
      established: new Date().getFullYear().toString(),
      status: 'Active'
    };

    const updated = [...departments, newDept];
    setDepartments(updated);
    saveDepartments(updated);

    setIsAddModalOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptHOD('');
    showToast(`Department "${newDept.name}" created successfully!`, 'success');
  };

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

        {/* Departments Grid */}
        <div className="faculty-courses-full-grid">
          {departments.map((dept) => (
            <div key={dept.code} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div>
                  <span className="course-code-tag">{dept.code}</span>
                  <h3 className="course-title-text">{dept.name}</h3>
                  <span className="course-dept-text">Established in {dept.established}</span>
                </div>
                <span className="c1-badge c1-badge-success">{dept.status}</span>
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

              <div className="course-shortcuts-row">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => showToast(`Department of ${dept.name} information opened.`, 'info')}
                >
                  <i className="fa-solid fa-circle-info"></i>
                  <span>Overview</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================
            MODAL: ADD DEPARTMENT MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Create Academic Department"
            maxWidth="md"
          >
            <form onSubmit={handleAddDept} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Chemical Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Department Code</label>
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

              <div className="form-field-wrap">
                <label className="form-label">Head of Department (HOD)</label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={deptHOD}
                  onChange={(e) => setDeptHOD(e.target.value)}
                />
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
                  <span>Create Department</span>
                </button>
              </div>
            </form>
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
