import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, StudentRecord } from '../../data/managementData';

export const FacultyAttendance: React.FC = () => {
  const navigate = useNavigate();

  // Load students
  const [students] = useState<StudentRecord[]>(() => {
    return getManagementData().students;
  });

  const [selectedCourse, setSelectedCourse] = useState('CSE-301');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().substring(0, 10);
  });

  // Roll call states (student-id -> present/absent/late)
  const [rollCall, setRollCall] = useState<Record<string, 'P' | 'A' | 'L'>>(() => {
    const initial: Record<string, 'P' | 'A' | 'L'> = {};
    getManagementData().students.forEach((s) => {
      initial[s.id] = 'P'; // default all present
    });
    return initial;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter students by department/section
  const filteredStudents = students.filter((s) => {
    // CSE course vs CSE students (all CSE in A/B except Rahul in ECE)
    if (selectedCourse.startsWith('CSE') && s.department !== 'CSE') return false;
    if (selectedCourse.startsWith('ECE') && s.department !== 'ECE') return false;
    return s.section === selectedSection;
  });

  // Calculate dynamic stats
  const total = filteredStudents.length;
  const present = filteredStudents.filter((s) => rollCall[s.id] === 'P').length;
  const absent = filteredStudents.filter((s) => rollCall[s.id] === 'A').length;
  const late = filteredStudents.filter((s) => rollCall[s.id] === 'L').length;
  const percent = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

  const handleMarkStatus = (studentId: string, status: 'P' | 'A' | 'L') => {
    setRollCall((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    const nextRollCall = { ...rollCall };
    filteredStudents.forEach((s) => {
      nextRollCall[s.id] = 'P';
    });
    setRollCall(nextRollCall);
  };

  const handleSaveAttendance = () => {
    setToastMsg('Attendance saved successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Faculty Panel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Attendance</span>
      </div>

      <div className="dashboard-header">
        <h1>Attendance Management</h1>
        <p>Take, mark, and save student presence records for course sections.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Options Panel */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div className="form-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="CSE-301">CSE-301 Data Structures</option>
              <option value="CSE-302">CSE-302 Databases (DBMS)</option>
              <option value="CSE-303">CSE-303 Computer Networks</option>
              <option value="ECE-304">ECE-304 Embedded Systems</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
            >
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Students</div>
          <div className="stat-card-value" style={{ marginTop: '4px' }}>{total}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Present</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>{present}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-error)' }}>Absent</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--color-error)' }}>{absent}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#ffb236' }}>Late</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#ffb236' }}>{late}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-highlight)' }}>Daily Percentage</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--accent-highlight)' }}>{percent}%</div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white' }}>Student Roll Call Desk</h3>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-sso"
              onClick={handleMarkAllPresent}
              style={{ height: '32px', fontSize: '11.5px', margin: 0, padding: '0 12px', width: 'auto' }}
            >
              Mark All Present
            </button>
            <button
              type="button"
              className="btn-signin"
              onClick={handleSaveAttendance}
              style={{ height: '32px', fontSize: '11.5px', margin: 0, padding: '0 16px', width: 'auto' }}
            >
              Save Attendance
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Roll Number</th>
                <th style={{ padding: '12px 14px' }}>Student Name</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Present</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Absent</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Late</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Current Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{st.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{st.name}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(st.id, 'P')}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid var(--border-color)',
                          background: rollCall[st.id] === 'P' ? '#00d89a' : 'none',
                          color: rollCall[st.id] === 'P' ? 'black' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}
                      >
                        P
                      </button>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(st.id, 'A')}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid var(--border-color)',
                          background: rollCall[st.id] === 'A' ? 'var(--color-error)' : 'none',
                          color: rollCall[st.id] === 'A' ? 'white' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}
                      >
                        A
                      </button>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(st.id, 'L')}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '1px solid var(--border-color)',
                          background: rollCall[st.id] === 'L' ? '#ffb236' : 'none',
                          color: rollCall[st.id] === 'L' ? 'black' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '10px',
                          fontWeight: '800'
                        }}
                      >
                        L
                      </button>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>{st.attendancePercent}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No students found for this Section & Course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default FacultyAttendance;
