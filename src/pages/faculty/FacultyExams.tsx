import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, ExamMarkRecord } from '../../data/managementData';

export const FacultyExams: React.FC = () => {
  const navigate = useNavigate();

  // Load management database
  const [data, setData] = useState(() => getManagementData());
  const [examMarks, setExamMarks] = useState<ExamMarkRecord[]>(() => {
    return getManagementData().examMarks;
  });

  // Entering marks forms state
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('CSE-301');
  const [selectedExam, setSelectedExam] = useState('Midterm 1');
  const [selectedSection, setSelectedSection] = useState('A');

  // Candidate mark values inputs (studentId -> { internal, external })
  const [inputMarks, setInputMarks] = useState<Record<string, { internal: number; external: number }>>(() => {
    const initial: Record<string, { internal: number; external: number }> = {};
    getManagementData().students.forEach((s) => {
      // Find existing marks
      const existing = getManagementData().examMarks.find(
        (m) => m.studentId === s.id && m.courseCode === 'CSE-301' && m.examName === 'Midterm 1'
      );
      initial[s.id] = {
        internal: existing ? existing.internalMarks : 0,
        external: existing ? existing.externalMarks : 0
      };
    });
    return initial;
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filteredStudents = data.students.filter((s) => {
    if (selectedCourse.startsWith('CSE') && s.department !== 'CSE') return false;
    if (selectedCourse.startsWith('ECE') && s.department !== 'ECE') return false;
    return s.section === selectedSection;
  });

  const handleOpenMarksEntry = () => {
    setFormError(null);
    setShowEntryModal(true);
  };

  const handleMarkChange = (studentId: string, type: 'internal' | 'external', val: number) => {
    setInputMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: val
      }
    }));
  };

  // Grade calculation algorithm
  const calculateGradeInfo = (internal: number, external: number) => {
    const total = internal + external;
    let grade = 'F';
    let point = 0;

    if (total >= 90) {
      grade = 'A+';
      point = 10;
    } else if (total >= 80) {
      grade = 'A';
      point = 9;
    } else if (total >= 70) {
      grade = 'B';
      point = 8;
    } else if (total >= 60) {
      grade = 'C';
      point = 7;
    } else if (total >= 50) {
      grade = 'D';
      point = 6;
    }

    return { total, grade, point };
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    let hasErr = false;
    filteredStudents.forEach((s) => {
      const marks = inputMarks[s.id] || { internal: 0, external: 0 };
      if (marks.internal < 0 || marks.internal > 30 || marks.external < 0 || marks.external > 70) {
        hasErr = true;
      }
    });

    if (hasErr) {
      setFormError('Error: Internal marks must be 0-30, and External marks must be 0-70.');
      return;
    }

    setFormError(null);

    // Save
    const nextExamMarks = [...examMarks];
    filteredStudents.forEach((s) => {
      const marks = inputMarks[s.id] || { internal: 0, external: 0 };
      const idx = nextExamMarks.findIndex(
        (m) => m.studentId === s.id && m.courseCode === selectedCourse && m.examName === selectedExam
      );

      const record: ExamMarkRecord = {
        studentId: s.id,
        studentName: s.name,
        courseCode: selectedCourse,
        examName: selectedExam,
        internalMarks: marks.internal,
        externalMarks: marks.external
      };

      if (idx >= 0) {
        nextExamMarks[idx] = record;
      } else {
        nextExamMarks.push(record);
      }
    });

    setExamMarks(nextExamMarks);
    const updatedData = {
      ...data,
      examMarks: nextExamMarks
    };
    setData(updatedData);
    saveManagementData(updatedData);

    setShowEntryModal(false);
    setToastMsg('Marks saved successfully.');
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
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Examinations</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Examination Management</h1>
          <p>Schedule quizzes, view subject performances, and upload internal/external exam grades.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenMarksEntry}
        >
          <i className="fa-solid fa-file-pen" style={{ marginRight: '6px' }}></i> Enter Exam Marks
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid: Upcoming Exams vs Past Marks sheets */}
      <div className="dashboard-main-grid">
        {/* Exam lists */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Upcoming Examinations</h3>
            <i className="fa-solid fa-calendar-days" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: 'Database Midterms Theory', course: 'CSE-302', date: '21 Aug 2026', duration: '90 Mins' },
              { title: 'Computer Networks Lab', course: 'CSE-303', date: '25 Aug 2026', duration: '180 Mins' }
            ].map((ex, idx) => (
              <div key={idx} className="timetable-item" style={{ padding: '14px', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: 'white', fontSize: '13.5px', display: 'block' }}>{ex.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Course: {ex.course} • Duration: {ex.duration}</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--accent-highlight)', fontWeight: '700' }}>{ex.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Marks list preview */}
        <div className="card-panel" style={{ flex: 1.2 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Submitted Exam Grades</h3>
            <i className="fa-solid fa-award" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="custom-table" style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 10px' }}>Student</th>
                  <th style={{ padding: '8px 10px' }}>Course</th>
                  <th style={{ padding: '8px 10px' }}>Exam</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Int (30)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Ext (70)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {examMarks.length > 0 ? (
                  examMarks.map((m, idx) => {
                    const info = calculateGradeInfo(m.internalMarks, m.externalMarks);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700' }}>{m.studentName}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--accent-highlight)' }}>{m.courseCode}</td>
                        <td style={{ padding: '8px 10px' }}>{m.examName}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.internalMarks}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{m.externalMarks}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <span className={`subject-att-status ${info.grade !== 'F' ? 'safe' : 'critical'}`} style={{ fontSize: '8.5px' }}>
                            {info.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No grades entered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Marks entry Modal */}
      {showEntryModal && (
        <div className="search-modal-overlay" onClick={() => setShowEntryModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Academic Portal</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Enter Exam Marks</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowEntryModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '70vh' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveMarks} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Course</label>
                    <select
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="CSE-301">CSE-301 DS</option>
                      <option value="CSE-302">CSE-302 DBMS</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Exam</label>
                    <select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="Midterm 1">Midterm 1</option>
                      <option value="Sem End">Sem End</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '13px', color: 'white', marginBottom: '10px' }}>Enter Student Scores</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredStudents.map((s) => {
                      const marks = inputMarks[s.id] || { internal: 0, external: 0 };
                      const info = calculateGradeInfo(marks.internal, marks.external);

                      return (
                        <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <div>
                            <strong style={{ color: 'white', fontSize: '12.5px', display: 'block' }}>{s.name}</strong>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>ID: {s.id}</span>
                          </div>
                          
                          <div>
                            <label style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Int (30)</label>
                            <input
                              type="number"
                              min={0}
                              max={30}
                              value={marks.internal}
                              onChange={(e) => handleMarkChange(s.id, 'internal', Number(e.target.value))}
                              style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 6px', color: 'white', fontSize: '12px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Ext (70)</label>
                            <input
                              type="number"
                              min={0}
                              max={70}
                              value={marks.external}
                              onChange={(e) => handleMarkChange(s.id, 'external', Number(e.target.value))}
                              style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '4px 6px', color: 'white', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Grade</span>
                            <strong style={{ color: 'var(--accent-highlight)', fontSize: '13px' }}>{info.grade} ({info.total})</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  Save Student Marks
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyExams;
