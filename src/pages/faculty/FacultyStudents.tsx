import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, StudentRecord } from '../../data/managementData';

export const FacultyStudents: React.FC = () => {
  const navigate = useNavigate();

  // Load students
  const [students] = useState<StudentRecord[]>(() => {
    return getManagementData().students;
  });

  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [filterPerformance, setFilterPerformance] = useState('All');

  // Selected student details modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const filteredStudents = students.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.id.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterSection !== 'All' && s.section !== filterSection) {
      return false;
    }
    if (filterPerformance !== 'All' && s.performance !== filterPerformance) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back navigation */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Faculty Panel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Students</span>
      </div>

      <div className="dashboard-header">
        <h1>Faculty Student Roster</h1>
        <p>Browse, search, and inspect the academic profile of students in your sections.</p>
      </div>

      {/* Filter panel */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search by name or Roll No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px 8px 32px', fontSize: '12.5px', color: 'white', outline: 'none' }}
            />
          </div>

          {/* Section */}
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{ background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
          >
            <option value="All">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>

          {/* Performance */}
          <select
            value={filterPerformance}
            onChange={(e) => setFilterPerformance(e.target.value)}
            style={{ background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
          >
            <option value="All">All Performance Levels</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Needs Improvement">Needs Improvement</option>
          </select>
        </div>
      </div>

      {/* Roster list */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Roll Number</th>
                <th style={{ padding: '12px 14px' }}>Student Name</th>
                <th style={{ padding: '12px 14px' }}>Department</th>
                <th style={{ padding: '12px 14px' }}>Year</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Section</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Attendance</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Performance</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{st.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700' }}>{st.name}</td>
                    <td style={{ padding: '12px 14px' }}>{st.department}</td>
                    <td style={{ padding: '12px 14px' }}>{st.year}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>{st.section}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700' }}>{st.attendancePercent}%</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className={`subject-att-status ${st.performance === 'Excellent' || st.performance === 'Good' ? 'safe' : st.performance === 'Average' ? 'warning' : 'critical'}`} style={{ fontSize: '8.5px' }}>
                        {st.performance}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className="subject-att-status good" style={{ fontSize: '8.5px' }}>ACTIVE</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-sso"
                        style={{ height: '28px', fontSize: '11px', padding: '0 10px', margin: 0, width: 'auto' }}
                        onClick={() => setSelectedStudent(st)}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No students matched the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Academic Profile Modal */}
      {selectedStudent && (
        <div className="search-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>STUDENT DOSSIER</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Academic Profile</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setSelectedStudent(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px' }}>
                  {selectedStudent.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: 'white' }}>{selectedStudent.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {selectedStudent.id}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12.5px' }}>
                <div>Department: <strong style={{ color: 'white' }}>{selectedStudent.department}</strong></div>
                <div>Year Level: <strong style={{ color: 'white' }}>{selectedStudent.year}</strong></div>
                <div>Section: <strong style={{ color: 'white' }}>{selectedStudent.section}</strong></div>
                <div>CGPA Score: <strong style={{ color: 'var(--accent-highlight)' }}>{selectedStudent.cgpa}</strong></div>
                <div>Phone No: <strong style={{ color: 'white' }}>{selectedStudent.phone}</strong></div>
                <div>Email ID: <strong style={{ color: 'white' }}>{selectedStudent.email}</strong></div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>Academic Progress Metrics</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Course Attendance:</span>
                  <strong style={{ color: selectedStudent.attendancePercent >= 75 ? '#00d89a' : 'var(--color-error)' }}>{selectedStudent.attendancePercent}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Assignments Done:</span>
                  <strong style={{ color: 'white' }}>{selectedStudent.assignmentsCompleted} / 12</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Overall Rating:</span>
                  <span className={`subject-att-status ${selectedStudent.performance === 'Excellent' || selectedStudent.performance === 'Good' ? 'safe' : 'warning'}`} style={{ fontSize: '8.5px' }}>
                    {selectedStudent.performance}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-signin"
                style={{ width: '100%', height: '36px', margin: 0, marginTop: '10px', fontSize: '12.5px' }}
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyStudents;
