import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, saveManagementData, StudentRecord } from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const FacultyStudents: React.FC = () => {
  const navigate = useNavigate();

  // Helper to dynamically calculate submitted/completed assignments for any student
  const getStudentCompletedAssignments = useCallback((stu: StudentRecord | null | undefined): number => {
    if (!stu) return 0;
    const mgmt = getManagementData();
    const sId = (stu.id || '').toLowerCase().trim();
    const sName = (stu.name || '').toLowerCase().trim();
    const sEmail = (stu.email || '').toLowerCase().trim();

    const matchingSubs = (mgmt.submissions || []).filter((sub) => {
      const subStuId = (sub.studentId || '').toLowerCase().trim();
      const subStuName = (sub.studentName || '').toLowerCase().trim();
      const matchesUser =
        subStuId === sId ||
        subStuName === sName ||
        subStuId === sEmail ||
        (sName.length >= 3 && subStuName.includes(sName)) ||
        (subStuId.length >= 4 && sId.includes(subStuId));
      const isCompleted = sub.status === 'Submitted' || sub.status === 'Graded' || sub.status === 'Late';
      return matchesUser && isCompleted;
    });

    return matchingSubs.length;
  }, []);

  const totalAssignmentsCount = useMemo(() => {
    const mgmt = getManagementData();
    return Math.max(mgmt.assignments?.length || 0, 1);
  }, []);

  // Load students from management data storage
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const data = getManagementData();
      return Array.isArray(data?.students) ? data.students : [];
    } catch {
      return [];
    }
  });

  // Reload data from local storage and remote Supabase
  const reloadData = useCallback(async () => {
    const mgmt = getManagementData();
    let currentStudents = mgmt.students || [];

    try {
      const remoteStudents = await dbService.getStudents();
      if (remoteStudents && remoteStudents.length > 0) {
        currentStudents = remoteStudents;
        saveManagementData({ ...mgmt, students: remoteStudents });
      }
    } catch (e) {
      console.warn('FacultyStudents remote fetch error:', e);
    }

    setStudents(currentStudents);
  }, []);

  // Listen for real-time submission and student update events
  useEffect(() => {
    reloadData();

    const handleSync = () => {
      reloadData();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_assignments_updated', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_assignments_updated', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
    };
  }, [reloadData]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addRollNo, setAddRollNo] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addDept, setAddDept] = useState('CSE');
  const [addYear, setAddYear] = useState('IV Year');
  const [addSection, setAddSection] = useState('A');
  const [addCgpa, setAddCgpa] = useState('8.2');
  const [addAttendance, setAddAttendance] = useState('85');
  const [addPerformance, setAddPerformance] = useState<StudentRecord['performance']>('Good');

  // Toast State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered student list with defensive null-checks
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (!s) return false;
      const q = searchQuery.toLowerCase().trim();
      const sName = (s.name || '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      const sEmail = (s.email || '').toLowerCase();

      const matchQuery = !q || sName.includes(q) || sId.includes(q) || sEmail.includes(q);
      const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
      const matchDept = departmentFilter === 'All' || (s.department || '').toLowerCase() === departmentFilter.toLowerCase();

      return matchQuery && matchSection && matchDept;
    });
  }, [students, searchQuery, sectionFilter, departmentFilter]);

  const avgAttendance = students.length
    ? Math.round(
        students.reduce((sum, s) => sum + (Number(s?.attendancePercent) || 0), 0) / students.length
      )
    : 0;

  const avgCgpa = students.length
    ? (
        students.reduce((sum, s) => sum + (Number(s?.cgpa) || 0), 0) / students.length
      ).toFixed(2)
    : '0.00';

  // Handle Add Student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addRollNo.trim() || !addEmail.trim()) {
      showToast('Please fill out all required fields (Name, Roll No, Email).', 'error');
      return;
    }

    const cleanRollNo = addRollNo.trim().toUpperCase();
    if (students.some((s) => s?.id && s.id.toUpperCase() === cleanRollNo)) {
      showToast(`Student with Roll Number ${cleanRollNo} already exists.`, 'error');
      return;
    }

    const newStudent: StudentRecord = {
      id: cleanRollNo,
      name: addName.trim(),
      email: addEmail.trim().toLowerCase(),
      phone: addPhone.trim() || '+91 98765 43210',
      department: addDept,
      year: addYear,
      section: addSection,
      cgpa: parseFloat(addCgpa) || 8.0,
      attendancePercent: parseInt(addAttendance, 10) || 85,
      assignmentsCompleted: 0,
      performance: addPerformance,
      status: 'Active'
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    setIsAddModalOpen(false);
    setAddName('');
    setAddRollNo('');
    setAddEmail('');
    setAddPhone('');
    setAddCgpa('8.2');
    setAddAttendance('85');
    setAddPerformance('Good');

    try {
      await dbService.addStudent(newStudent);
      showToast(`Student ${newStudent.name} (${newStudent.id}) enrolled and stored in database successfully!`, 'success');
    } catch {
      showToast(`Student ${newStudent.name} (${newStudent.id}) enrolled successfully!`, 'success');
    }

    window.dispatchEvent(new Event('campushub_management_updated'));
  };

  // Handle Edit Student
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editingStudent.name.trim() || !editingStudent.email.trim()) {
      showToast('Student name and email are required.', 'error');
      return;
    }

    const updated = students.map((s) => (s.id === editingStudent.id ? editingStudent : s));
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    if (selectedStudent && selectedStudent.id === editingStudent.id) {
      setSelectedStudent(editingStudent);
    }

    const targetStudent = editingStudent;
    setEditingStudent(null);

    try {
      await dbService.updateStudent(targetStudent);
      showToast(`Student ${targetStudent.name} details updated in database!`, 'success');
    } catch {
      showToast(`Student ${targetStudent.name} details updated successfully!`, 'success');
    }

    window.dispatchEvent(new Event('campushub_management_updated'));
  };

  // Handle Delete Student
  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    const updated = students.filter((s) => s.id !== deletingStudent.id);
    setStudents(updated);
    const mgmt = getManagementData();
    saveManagementData({ ...mgmt, students: updated });

    const targetStudent = deletingStudent;
    setDeletingStudent(null);

    if (selectedStudent && selectedStudent.id === targetStudent.id) {
      setSelectedStudent(null);
    }

    try {
      await dbService.deleteStudent(targetStudent.id);
      showToast(`Student ${targetStudent.name} removed from cohort and database.`, 'info');
    } catch {
      showToast(`Student ${targetStudent.name} removed from cohort.`, 'info');
    }

    window.dispatchEvent(new Event('campushub_management_updated'));
  };

  const getPerformanceBadge = (perf?: StudentRecord['performance']) => {
    switch (perf) {
      case 'Excellent':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-star"></i> Excellent</span>;
      case 'Good':
        return <span className="c1-badge c1-badge-cyan"><i className="fa-solid fa-circle-check"></i> Good</span>;
      case 'Needs Improvement':
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-triangle-exclamation"></i> Needs Attention</span>;
      default:
        return <span className="c1-badge c1-badge-purple">Average</span>;
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Enrolled Students Roster</span>
            </div>
            <h1 className="module-title">Student Cohorts & Academic Roster</h1>
            <p className="module-subtitle">
              Manage candidate admissions, edit academic parameters, monitor attendance compliance, and track performance.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Add Student</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/faculty/attendance')}
            >
              <i className="fa-solid fa-clipboard-user"></i>
              <span>Mark Attendance</span>
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
              <span className="stat-label">Enrolled Students</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{avgAttendance}%</span>
              <span className="stat-label">Cohort Attendance Average</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{avgCgpa}</span>
              <span className="stat-label">Average Cohort CGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">
                {students.filter((s) => (Number(s?.attendancePercent) || 0) >= 75).length} / {students.length}
              </span>
              <span className="stat-label">Attendance Compliant</span>
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
              placeholder="Search students by name, roll number (236F1A0551), or email..."
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
              <label htmlFor="filter-student-section">Class Section</label>
              <select
                id="filter-student-section"
                className="c1-select"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="All">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div className="filter-select-item">
              <label htmlFor="filter-student-dept">Department</label>
              <select
                id="filter-student-dept"
                className="c1-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="EEE">EEE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="c1-card-title">Class Cohort Roster ({filteredStudents.length} Students)</h3>
              <p className="c1-card-subtitle">Enrolled candidates across faculty courses</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Active Academic Session</span>
          </div>

          <div className="student-roster-table-wrap">
            {filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-user-slash" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block' }}></i>
                <p>No students found matching the search criteria.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ marginTop: '16px' }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <i className="fa-solid fa-plus"></i> Add New Student
                </button>
              </div>
            ) : (
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Dept & Section</th>
                    <th>Attendance</th>
                    <th>Assignments</th>
                    <th>CGPA</th>
                    <th>Academic Standing</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu) => {
                    const att = Number(stu.attendancePercent) || 0;
                    const cg = Number(stu.cgpa) || 0;
                    return (
                      <tr key={stu.id}>
                        <td><span className="course-code-cell">{stu.id}</span></td>
                        <td>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{stu.name || 'Student'}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.email || ''}</div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="c1-badge c1-badge-primary">{stu.department || 'CSE'}</span>
                            <span className="c1-badge c1-badge-purple">Sec {stu.section || 'A'}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                att >= 85
                                  ? 'var(--color-success)'
                                  : att >= 75
                                  ? 'var(--accent-blue)'
                                  : 'var(--color-error)'
                            }}
                          >
                            {att}%
                          </span>
                        </td>
                        <td>
                          <span>{getStudentCompletedAssignments(stu)} / {totalAssignmentsCount}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{cg.toFixed(1)}</strong>
                        </td>
                        <td>{getPerformanceBadge(stu.performance)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                              onClick={() => setSelectedStudent(stu)}
                              title="View Academic Profile"
                            >
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}
                              onClick={() => setEditingStudent({ ...stu })}
                              title="Edit Student Information"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--color-error)' }}
                              onClick={() => setDeletingStudent(stu)}
                              title="Remove Student from Cohort"
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
            )}
          </div>
        </div>

        {/* ============================================================
            MODAL 1: ADD NEW STUDENT MODAL
            ============================================================ */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Enroll New Student to Cohort"
          maxWidth="md"
        >
          <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Roll Number / Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 236F1A0560"
                  value={addRollNo}
                  onChange={(e) => setAddRollNo(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
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
                  placeholder="e.g. rohan@campushub.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Department
                </label>
                <select
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="CIVIL">CIVIL</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Section
                </label>
                <select
                  value={addSection}
                  onChange={(e) => setAddSection(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Academic Year
                </label>
                <select
                  value={addYear}
                  onChange={(e) => setAddYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="I Year">I Year</option>
                  <option value="II Year">II Year</option>
                  <option value="III Year">III Year</option>
                  <option value="IV Year">IV Year</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Initial CGPA
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={addCgpa}
                  onChange={(e) => setAddCgpa(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
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
                  value={addAttendance}
                  onChange={(e) => setAddAttendance(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Standing
                </label>
                <select
                  value={addPerformance}
                  onChange={(e) => setAddPerformance(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="c1-btn c1-btn-gradient">
                <i className="fa-solid fa-check"></i>
                <span>Enroll Student</span>
              </button>
            </div>
          </form>
        </Modal>

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
                    Roll Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingStudent.id}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
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
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingStudent.phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <select
                    value={editingStudent.department || 'CSE'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="IT">IT</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Section
                  </label>
                  <select
                    value={editingStudent.section || 'A'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Year
                  </label>
                  <select
                    value={editingStudent.year || 'IV Year'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, year: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="I Year">I Year</option>
                    <option value="II Year">II Year</option>
                    <option value="III Year">III Year</option>
                    <option value="IV Year">IV Year</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={Number(editingStudent.cgpa) || 0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, cgpa: parseFloat(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Attendance (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={Number(editingStudent.attendancePercent) || 0}
                    onChange={(e) => setEditingStudent({ ...editingStudent, attendancePercent: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Academic Standing
                  </label>
                  <select
                    value={editingStudent.performance || 'Good'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, performance: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="c1-btn c1-btn-gradient">
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
        {deletingStudent && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingStudent(null)}
            title="Remove Student from Cohort"
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
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-error)', fontSize: '1.25rem', marginTop: '2px' }}></i>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '4px' }}>
                    Confirm Removal
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Are you sure you want to remove <strong>{deletingStudent.name}</strong> (Roll No: <strong>{deletingStudent.id}</strong>) from Section {deletingStudent.section}? This will de-enroll the candidate from your class roster.
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
            MODAL 4: STUDENT ACADEMIC PROFILE MODAL
            ============================================================ */}
        {selectedStudent && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedStudent(null)}
            title={`Student Academic Profile: ${selectedStudent.name || 'Student'}`}
            maxWidth="md"
          >
            <div className="student-profile-dialog-content">
              <div className="student-dialog-header">
                <div className="student-avatar-badge">
                  {(selectedStudent.name || 'ST').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="stu-name">{selectedStudent.name}</h3>
                  <span className="stu-sub">
                    Roll No: <strong>{selectedStudent.id}</strong> • Department of {selectedStudent.department || 'CSE'}
                  </span>
                </div>
              </div>

              <div className="student-profile-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Class Section:</span>
                  <span className="d-val">Section {selectedStudent.section || 'A'} (B.Tech {selectedStudent.year || 'IV Year'})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Cumulative CGPA:</span>
                  <span className="d-val" style={{ color: '#38bdf8' }}>{(Number(selectedStudent.cgpa) || 0).toFixed(2)} / 10.0</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Attendance Percentage:</span>
                  <span className="d-val" style={{ color: (Number(selectedStudent.attendancePercent) || 0) >= 75 ? '#34d399' : '#fb7185' }}>
                    {Number(selectedStudent.attendancePercent) || 0}% ({(Number(selectedStudent.attendancePercent) || 0) >= 75 ? 'Satisfactory' : 'Low Attendance Alert'})
                  </span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Assignment Progress:</span>
                  <span className="d-val">{getStudentCompletedAssignments(selectedStudent)} of {totalAssignmentsCount} Tasks Submitted</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Email Address:</span>
                  <span className="d-val">{selectedStudent.email || 'N/A'}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Contact Phone:</span>
                  <span className="d-val">{selectedStudent.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="modal-dialog-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ color: 'var(--accent-blue)' }}
                    onClick={() => {
                      const s = selectedStudent;
                      setSelectedStudent(null);
                      setEditingStudent({ ...s });
                    }}
                  >
                    <i className="fa-solid fa-pen"></i> Edit Student
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Close Profile
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => {
                      setSelectedStudent(null);
                      navigate('/faculty/results');
                    }}
                  >
                    <i className="fa-solid fa-chart-line"></i>
                    <span>Enter Marks</span>
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Component */}
        <Toast
          message={toastMsg?.message || null}
          type={toastMsg?.type || 'info'}
          onClose={() => setToastMsg(null)}
        />
      </div>
    </AppLayout>
  );
};

export default FacultyStudents;
