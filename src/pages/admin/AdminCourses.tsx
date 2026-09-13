import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, saveLabRecord, deleteLabRecord, CourseRecord, LabRecord } from '../../data/managementData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const AdminCourses: React.FC = () => {
  const mgmt = getManagementData();

  // Courses & Labs state loaded from persistent storage
  const [courses, setCourses] = useState<CourseRecord[]>(() => mgmt.courses);
  const [labs, setLabs] = useState<LabRecord[]>(() => mgmt.labs || []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assigningCourse, setAssigningCourse] = useState<CourseRecord | null>(null);
  const [editingCourse, setEditingCourse] = useState<CourseRecord | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseRecord | null>(null);

  // Lab modal state
  const [addingLabForCourse, setAddingLabForCourse] = useState<CourseRecord | null>(null);
  const [managingLabsCourse, setManagingLabsCourse] = useState<CourseRecord | null>(null);

  // Add Course Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [sem, setSem] = useState('5th Semester');
  const [facultyId, setFacultyId] = useState('FAC-101');
  const [studentsCount, setStudentsCount] = useState<number>(60);
  const [nextClass, setNextClass] = useState('Mon, Wed 09:00 AM');

  // Add Lab Form State
  const [labCode, setLabCode] = useState('');
  const [labName, setLabName] = useState('');
  const [labRoom, setLabRoom] = useState('CS Lab 2 (Cloud Systems Hub)');
  const [labFacultyId, setLabFacultyId] = useState('FAC-101');
  const [labBatch, setLabBatch] = useState('Batch A (Roll 1-30)');
  const [labScheduleDay, setLabScheduleDay] = useState('Tuesday');
  const [labScheduleTime, setLabScheduleTime] = useState('02:00 PM - 04:30 PM');
  const [labStudentsCount, setLabStudentsCount] = useState<number>(30);

  // Assign Form
  const [selectedFacId, setSelectedFacId] = useState('FAC-101');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync state on updates
  useEffect(() => {
    const handleSync = () => {
      const fresh = getManagementData();
      setCourses(fresh.courses);
      setLabs(fresh.labs || []);
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
    };
  }, []);

  // Open Add Lab Modal for a Course
  const handleOpenAddLab = (course: CourseRecord) => {
    setAddingLabForCourse(course);
    setLabCode(`${course.code}L`);
    setLabName(`${course.name} Lab`);
    setLabRoom('CS Lab 2 (Cloud Systems Hub)');
    setLabFacultyId(course.facultyId || 'FAC-101');
    setLabBatch('Batch A (Roll 1-30)');
    setLabScheduleDay('Tuesday');
    setLabScheduleTime('02:00 PM - 04:30 PM');
    setLabStudentsCount(30);
  };

  // Save Lab Handler
  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingLabForCourse) return;

    const cleanCode = labCode.trim().toUpperCase();
    const cleanName = labName.trim();

    if (!cleanCode || !cleanName) {
      showToast('Please fill out all required lab details.', 'error');
      return;
    }

    const currentMgmt = getManagementData();
    const fac = currentMgmt.faculty.find((f) => f.id === labFacultyId);

    const newLab: LabRecord = {
      id: `LAB-${Date.now()}`,
      code: cleanCode,
      name: cleanName,
      courseCode: addingLabForCourse.code,
      courseName: addingLabForCourse.name,
      department: addingLabForCourse.department,
      semester: addingLabForCourse.semester,
      facultyId: labFacultyId,
      facultyName: fac ? fac.name : addingLabForCourse.facultyName,
      labRoom: labRoom.trim() || 'CS Main Lab 1',
      batch: labBatch,
      scheduleDay: labScheduleDay,
      scheduleTime: labScheduleTime.trim() || '02:00 PM - 04:30 PM',
      studentsCount: Number(labStudentsCount) || 30,
      status: 'Active'
    };

    saveLabRecord(newLab);
    const updatedMgmt = getManagementData();
    setLabs(updatedMgmt.labs || []);

    setAddingLabForCourse(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`Lab Practical "${newLab.name}" (${newLab.code}) successfully linked to ${addingLabForCourse.code}!`, 'success');
  };

  // Delete Lab Handler
  const handleDeleteLab = (labId: string, labTitle: string) => {
    deleteLabRecord(labId);
    const updatedMgmt = getManagementData();
    setLabs(updatedMgmt.labs || []);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`Lab "${labTitle}" removed.`, 'info');
  };

  // Add Course Handler
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanCode) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (courses.some((c) => c.code.toUpperCase() === cleanCode)) {
      showToast(`A course with code "${cleanCode}" already exists.`, 'error');
      return;
    }

    const currentMgmt = getManagementData();
    const fac = currentMgmt.faculty.find((f) => f.id === facultyId);

    const newCourse: CourseRecord = {
      code: cleanCode,
      name: cleanName,
      department: dept,
      semester: sem,
      facultyId,
      facultyName: fac ? fac.name : 'Dr. Suresh Kumar',
      studentsCount: Number(studentsCount) || 60,
      status: 'Active',
      progress: 0,
      nextClass: nextClass.trim() || 'Mon, Wed 09:00 AM'
    };

    const updated = [newCourse, ...courses];
    setCourses(updated);
    saveManagementData({ ...currentMgmt, courses: updated });

    setIsAddModalOpen(false);
    setName('');
    setCode('');
    setStudentsCount(60);
    setNextClass('Mon, Wed 09:00 AM');

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`Course "${newCourse.name}" created successfully!`, 'success');
  };

  // Edit Course Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const cleanName = editingCourse.name.trim();
    if (!cleanName) {
      showToast('Course title cannot be empty.', 'error');
      return;
    }

    const currentMgmt = getManagementData();
    const fac = currentMgmt.faculty.find((f) => f.id === editingCourse.facultyId);

    const updated = courses.map((c) =>
      c.code === editingCourse.code
        ? {
            ...editingCourse,
            name: cleanName,
            facultyName: fac ? fac.name : editingCourse.facultyName,
            studentsCount: Number(editingCourse.studentsCount) || 0,
            nextClass: editingCourse.nextClass?.trim() || 'Mon, Wed 09:00 AM'
          }
        : c
    );

    setCourses(updated);
    saveManagementData({ ...currentMgmt, courses: updated });

    const savedCourse = editingCourse;
    setEditingCourse(null);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`Course "${savedCourse.name}" (${savedCourse.code}) updated successfully!`, 'success');
  };

  // Delete Course Handler
  const handleConfirmDelete = () => {
    if (!deletingCourse) return;

    const targetCourse = deletingCourse;
    const currentMgmt = getManagementData();
    const updated = courses.filter((c) => c.code !== targetCourse.code);

    setCourses(updated);
    saveManagementData({ ...currentMgmt, courses: updated });

    setDeletingCourse(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`Course "${targetCourse.name}" (${targetCourse.code}) deleted successfully.`, 'info');
  };

  // Reassign Faculty Handler
  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCourse) return;

    const currentMgmt = getManagementData();
    const fac = currentMgmt.faculty.find((f) => f.id === selectedFacId);

    const updated = courses.map((c) =>
      c.code === assigningCourse.code
        ? { ...c, facultyId: selectedFacId, facultyName: fac ? fac.name : c.facultyName }
        : c
    );

    setCourses(updated);
    saveManagementData({ ...currentMgmt, courses: updated });

    setAssigningCourse(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
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

      const matchDept =
        deptFilter === 'All' || c.department.toLowerCase().includes(deptFilter.toLowerCase());

      const matchStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchQ && matchDept && matchStatus;
    });
  }, [courses, searchQuery, deptFilter, statusFilter]);

  const totalEnrollments = courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0);
  const activeCoursesCount = courses.filter((c) => c.status === 'Active').length;

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
              Configure course syllabus, allocate faculty instructors, update subject details, and manage academic cohorts.
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
              <span className="stat-num">{courses.length}</span>
              <span className="stat-label">Total Subjects</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{mgmt.faculty.length}</span>
              <span className="stat-label">Teaching Faculty</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalEnrollments}</span>
              <span className="stat-label">Student Enrollments</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{activeCoursesCount} Active</span>
              <span className="stat-label">Running Sections</span>
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

          <div className="filters-row-wrap" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="filter-select-item">
              <label htmlFor="select-course-dept">Department</label>
              <select
                id="select-course-dept"
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
              <label htmlFor="select-course-status">Status</label>
              <select
                id="select-course-status"
                className="c1-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="c1-card-title">Curriculum Registry ({filteredCourses.length} Subjects)</h3>
              <p className="c1-card-subtitle">Active syllabus courses, enrolled cohorts, and allocated faculty instructors</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Subject</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            {filteredCourses.length > 0 ? (
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Title</th>
                    <th>Dept & Semester</th>
                    <th>Assigned Faculty</th>
                    <th>Enrolled Students</th>
                    <th>Schedule Timing</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => {
                    const courseLabs = labs.filter((l) => (l.courseCode || '').toUpperCase() === c.code.toUpperCase());
                    return (
                      <tr key={c.code}>
                        <td>
                          <span className="course-code-tag">{c.code}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block' }}>{c.name}</strong>
                          {courseLabs.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {courseLabs.map((lab) => (
                                <span
                                  key={lab.id}
                                  className="c1-badge"
                                  style={{
                                    background: 'rgba(168, 85, 247, 0.12)',
                                    color: '#c084fc',
                                    border: '1px solid rgba(168, 85, 247, 0.25)',
                                    fontSize: '0.7rem',
                                    padding: '2px 8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => setManagingLabsCourse(c)}
                                  title={`Click to manage labs for ${c.code}`}
                                >
                                  <i className="fa-solid fa-flask-vial"></i>
                                  <span>{lab.code}: {lab.scheduleDay} {lab.scheduleTime} ({lab.batch})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>
                            <span className="c1-badge c1-badge-primary" style={{ marginRight: '6px' }}>
                              {c.department}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {c.semester}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-user-tie" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}></i>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.facultyName}</span>
                          </div>
                        </td>
                        <td>
                          <strong>{c.studentsCount}</strong> Students
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {c.nextClass || 'TBD'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`c1-badge ${
                              c.status === 'Active' ? 'c1-badge-success' : 'c1-badge-warning'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{
                                padding: '6px 10px',
                                fontSize: '0.75rem',
                                color: '#c084fc',
                                borderColor: 'rgba(168, 85, 247, 0.35)',
                                background: 'rgba(168, 85, 247, 0.08)'
                              }}
                              onClick={() => handleOpenAddLab(c)}
                              title={`Add Practical Lab for ${c.code}`}
                            >
                              <i className="fa-solid fa-flask-vial"></i>
                              <span>Add Lab</span>
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setAssigningCourse(c);
                                setSelectedFacId(c.facultyId);
                              }}
                              title="Reassign Instructor"
                            >
                              <i className="fa-solid fa-user-pen"></i>
                              <span>Reassign</span>
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}
                              onClick={() => setEditingCourse({ ...c })}
                              title="Edit Course Details"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary btn-icon-only"
                              style={{ width: '32px', height: '32px', padding: 0, color: 'var(--color-error)' }}
                              onClick={() => setDeletingCourse(c)}
                              title="Delete Course"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-book-skull" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', opacity: 0.6 }}></i>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No courses match your criteria</p>
                <p style={{ fontSize: '0.85rem' }}>Try clearing your search query or selecting "All Departments".</p>
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
            MODAL 1: ADD COURSE MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Create Curriculum Course"
            maxWidth="md"
          >
            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Course Subject Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Distributed Operating Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Course Code *
                  </label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
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
                    Academic Semester
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={sem}
                    onChange={(e) => setSem(e.target.value)}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assign Faculty Instructor
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                  >
                    {mgmt.faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id} • {f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="c1-input"
                    value={studentsCount}
                    onChange={(e) => setStudentsCount(parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Weekly Class Schedule
                </label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Tuesday 09:00 AM - 10:30 AM"
                  value={nextClass}
                  onChange={(e) => setNextClass(e.target.value)}
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
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EDIT COURSE MODAL
            ============================================================ */}
        {editingCourse && (
          <Modal
            isOpen={true}
            onClose={() => setEditingCourse(null)}
            title={`Edit Course: ${editingCourse.name} (${editingCourse.code})`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Course Code
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editingCourse.code}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="c1-input"
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingCourse.department}
                    onChange={(e) => setEditingCourse({ ...editingCourse, department: e.target.value })}
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
                    Academic Semester
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingCourse.semester}
                    onChange={(e) => setEditingCourse({ ...editingCourse, semester: e.target.value })}
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Faculty Instructor
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingCourse.facultyId}
                    onChange={(e) => {
                      const fId = e.target.value;
                      const fObj = mgmt.faculty.find((f) => f.id === fId);
                      setEditingCourse({
                        ...editingCourse,
                        facultyId: fId,
                        facultyName: fObj ? fObj.name : editingCourse.facultyName
                      });
                    }}
                  >
                    {mgmt.faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.id} • {f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Enrolled Students
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="c1-input"
                    value={editingCourse.studentsCount}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        studentsCount: parseInt(e.target.value) || 0
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Course Status
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingCourse.status}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        status: e.target.value as any
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Weekly Schedule
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Tuesday 09:00 AM"
                    value={editingCourse.nextClass || ''}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        nextClass: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingCourse(null)}
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
            MODAL 3: DELETE COURSE MODAL
            ============================================================ */}
        {deletingCourse && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingCourse(null)}
            title="Remove Curriculum Course"
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
                    Are you sure you want to delete <strong>{deletingCourse.name} ({deletingCourse.code})</strong> from the {deletingCourse.department} curriculum registry? This action will remove the course and unassign instructor allocations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingCourse(null)}
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
                  <span>Delete Course</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: REASSIGN FACULTY MODAL
            ============================================================ */}
        {assigningCourse && (
          <Modal
            isOpen={true}
            onClose={() => setAssigningCourse(null)}
            title={`Assign Faculty: ${assigningCourse.code}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveAssign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="c1-alert c1-alert-info">
                <i className="fa-solid fa-circle-info"></i>
                <div>
                  Currently assigned to <strong>{assigningCourse.facultyName}</strong> for <strong>{assigningCourse.name}</strong>.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Select Faculty Instructor
                </label>
                <select
                  className="c1-select"
                  style={{ width: '100%' }}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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

        {/* ============================================================
            MODAL 5: ADD PRACTICAL LAB MODAL
            ============================================================ */}
        {addingLabForCourse && (
          <Modal
            isOpen={true}
            onClose={() => setAddingLabForCourse(null)}
            title={`Add Practical Lab: ${addingLabForCourse.code}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveLab} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="c1-alert c1-alert-info">
                <i className="fa-solid fa-flask-vial" style={{ color: '#c084fc' }}></i>
                <div>
                  Linking new lab session to parent course <strong>{addingLabForCourse.name} ({addingLabForCourse.code})</strong> • {addingLabForCourse.department}.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Lab Course Code *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. CSE-301L"
                    value={labCode}
                    onChange={(e) => setLabCode(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Lab Practical Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Distributed Systems Practical Lab"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Faculty Instructor
                  </label>
                  <select
                    className="c1-select"
                    value={labFacultyId}
                    onChange={(e) => setLabFacultyId(e.target.value)}
                  >
                    {mgmt.faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Lab Facility / Room
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. CS Lab 2 (Cloud Systems Hub)"
                    value={labRoom}
                    onChange={(e) => setLabRoom(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Target Student Batch / Cohort
                  </label>
                  <select
                    className="c1-select"
                    value={labBatch}
                    onChange={(e) => setLabBatch(e.target.value)}
                  >
                    <option value="Batch A (Roll 1-30)">Batch A (Roll 1-30)</option>
                    <option value="Batch B (Roll 31-60)">Batch B (Roll 31-60)</option>
                    <option value="All Batches">All Batches (Full Cohort)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    className="c1-input"
                    min="10"
                    max="120"
                    value={labStudentsCount}
                    onChange={(e) => setLabStudentsCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Scheduled Day of Week
                  </label>
                  <select
                    className="c1-select"
                    value={labScheduleDay}
                    onChange={(e) => setLabScheduleDay(e.target.value)}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Scheduled Time Slot
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. 02:00 PM - 04:30 PM"
                    value={labScheduleTime}
                    onChange={(e) => setLabScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setAddingLabForCourse(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
                >
                  <i className="fa-solid fa-flask-vial"></i>
                  <span>Save Lab Practical</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 6: MANAGE COURSE LABS MODAL
            ============================================================ */}
        {managingLabsCourse && (
          <Modal
            isOpen={true}
            onClose={() => setManagingLabsCourse(null)}
            title={`Practical Labs for ${managingLabsCourse.code}`}
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>
                    {managingLabsCourse.name}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {managingLabsCourse.department} • {managingLabsCourse.semester}
                  </span>
                </div>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ fontSize: '0.75rem', color: '#c084fc' }}
                  onClick={() => {
                    const c = managingLabsCourse;
                    setManagingLabsCourse(null);
                    handleOpenAddLab(c);
                  }}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Another Lab</span>
                </button>
              </div>

              {(() => {
                const courseLabs = labs.filter((l) => (l.courseCode || '').toUpperCase() === managingLabsCourse.code.toUpperCase());
                if (courseLabs.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-flask-vial" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5, display: 'block' }}></i>
                      <p>No practical lab sessions configured for this course yet.</p>
                    </div>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {courseLabs.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="course-code-tag" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                              {l.code}
                            </span>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{l.name}</strong>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            <span style={{ marginRight: '10px' }}>
                              <i className="fa-solid fa-calendar-day" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i>
                              {l.scheduleDay}, {l.scheduleTime}
                            </span>
                            <span style={{ marginRight: '10px' }}>
                              <i className="fa-solid fa-location-dot" style={{ marginRight: '4px', color: '#f59e0b' }}></i>
                              {l.labRoom}
                            </span>
                            <span>
                              <i className="fa-solid fa-users" style={{ marginRight: '4px', color: '#10b981' }}></i>
                              {l.batch} ({l.studentsCount} Capacity)
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary btn-icon-only"
                          style={{ width: '32px', height: '32px', padding: 0, color: 'var(--color-error)' }}
                          onClick={() => handleDeleteLab(l.id, l.name)}
                          title="Delete Lab"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setManagingLabsCourse(null)}
                >
                  Close
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

export default AdminCourses;
