import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, CourseRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminCourses: React.FC = () => {
  const mgmt = getManagementData();

  // Courses state loaded from persistent storage
  const [courses, setCourses] = useState<CourseRecord[]>(() => mgmt.courses);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState<CourseRecord | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [dept, setDept] = useState('Computer Science');
  const [sem, setSem] = useState('Semester 6');
  const [facultyId, setFacultyId] = useState('FAC-101');

  // Assign Form
  const [selectedFacId, setSelectedFacId] = useState('FAC-101');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const mgmt = getManagementData();
    const fac = mgmt.faculty.find((f) => f.id === facultyId);

    const newCourse: CourseRecord = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      department: dept,
      semester: sem,
      facultyId,
      facultyName: fac ? fac.name : 'Dr. Suresh Kumar',
      studentsCount: 60,
      status: 'Active',
      progress: 0,
      nextClass: 'Mon, Wed 09:00 AM'
    };

    const updated = [newCourse, ...courses];
    setCourses(updated);
    saveManagementData({ ...mgmt, courses: updated });

    setIsAddModalOpen(false);
    setName('');
    setCode('');
    showToast(`Course "${newCourse.name}" created successfully!`, 'success');
  };

  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCourse) return;

    const mgmt = getManagementData();
    const fac = mgmt.faculty.find((f) => f.id === selectedFacId);

    const updated = courses.map((c) =>
      c.code === assigningCourse.code
        ? { ...c, facultyId: selectedFacId, facultyName: fac ? fac.name : c.facultyName }
        : c
    );

    setCourses(updated);
    saveManagementData({ ...mgmt, courses: updated });

    setAssigningCourse(null);
    showToast(`Faculty ${fac?.name} assigned to ${assigningCourse.code}!`, 'success');
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.facultyName.toLowerCase().includes(q);

      const matchDept = deptFilter === 'All' || c.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchQ && matchDept;
    });
  }, [courses, searchQuery, deptFilter]);

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Curriculum & Courses</span>
            </div>
            <h1 className="module-title">Curriculum & Course Management</h1>
            <p className="module-subtitle">
              Configure course syllabus, allocate faculty instructors, and manage academic cohorts.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-book-medical"></i>
              <span>Create New Course</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{courses.length * 8}</span>
              <span className="stat-label">Active Courses</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">84</span>
              <span className="stat-label">Assigned Faculty</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,240</span>
              <span className="stat-label">Student Enrollments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">4.0 Avg</span>
              <span className="stat-label">Credits per Course</span>
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
          <div className="search-filter-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              className="c1-input search-filter-input"
              placeholder="Search courses by code (CSE-301), title, or faculty name..."
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
              <label htmlFor="select-course-dept">Department</label>
              <select
                id="select-course-dept"
                className="c1-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Curriculum Registry ({filteredCourses.length} Subjects)</h3>
              <p className="c1-card-subtitle">Active syllabus courses, credits, and faculty instructors</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Subject</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Title</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Assigned Faculty</th>
                  <th>Enrolled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.code}>
                    <td><span className="course-code-tag">{c.code}</span></td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                    </td>
                    <td>{c.department}</td>
                    <td>{c.semester}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-user-tie" style={{ color: 'var(--accent-blue)' }}></i>
                        <span style={{ color: 'var(--text-primary)' }}>{c.facultyName}</span>
                      </div>
                    </td>
                    <td><strong>{c.studentsCount}</strong> Students</td>
                    <td>
                      <span className="c1-badge c1-badge-success">{c.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setAssigningCourse(c);
                          setSelectedFacId(c.facultyId);
                        }}
                      >
                        <i className="fa-solid fa-user-pen"></i>
                        <span>Reassign</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL 1: ADD COURSE MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Create Curriculum Course"
            maxWidth="md"
          >
            <form onSubmit={handleAddCourse} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Course Subject Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Distributed Operating Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. CSE-405"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Department</label>
                  <select
                    className="c1-select"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Academic Semester</label>
                  <select
                    className="c1-select"
                    value={sem}
                    onChange={(e) => setSem(e.target.value)}
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 5">Semester 5</option>
                    <option value="Semester 6">Semester 6</option>
                    <option value="Semester 7">Semester 7</option>
                    <option value="Semester 8">Semester 8</option>
                  </select>
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Assign Faculty Instructor</label>
                <select
                  className="c1-select"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                >
                  {mgmt.faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.id} - {f.department})
                    </option>
                  ))}
                </select>
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
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: REASSIGN FACULTY MODAL
            ============================================================ */}
        {assigningCourse && (
          <Modal
            isOpen={true}
            onClose={() => setAssigningCourse(null)}
            title={`Assign Faculty: ${assigningCourse.code}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveAssign} className="faculty-form-stack">
              <div className="c1-alert c1-alert-info">
                <i className="fa-solid fa-circle-info"></i>
                <div>
                  Currently assigned to <strong>{assigningCourse.facultyName}</strong> for <strong>{assigningCourse.name}</strong>.
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Select Faculty Instructor</label>
                <select
                  className="c1-select"
                  value={selectedFacId}
                  onChange={(e) => setSelectedFacId(e.target.value)}
                >
                  {mgmt.faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation} • {f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setAssigningCourse(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Assignment</span>
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

export default AdminCourses;
