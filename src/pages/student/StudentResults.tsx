import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { lmsData, SemesterResult, SemesterResultDetail } from '../../data/lmsData';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentResults: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const semestersList = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7'];
  const [selectedSem, setSelectedSem] = useState<string>('Semester 7');
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const activeResult: SemesterResult = useMemo(() => {
    return lmsData.results[selectedSem] || lmsData.results['Semester 7'];
  }, [selectedSem]);

  // Overall calculations
  const totalEarnedCredits = 142;
  const totalDegreeCredits = 160;
  const cumulativeCgpa = 8.6;

  // Chart data calculation for Semesters 1 to 7
  const chartData = useMemo(() => {
    return semestersList.map((sem) => {
      const gpa = lmsData.results[sem]?.gpa || 7.0;
      const credits = lmsData.results[sem]?.creditsEarned || 20;
      return { sem, gpa, credits };
    });
  }, [semestersList]);

  // SVG Chart Geometry
  const chartW = 600;
  const chartH = 220;
  const pL = 40;
  const pR = 30;
  const pT = 20;
  const pB = 40;
  const cW = chartW - pL - pR;
  const cH = chartH - pT - pB;
  const minG = 6.0;
  const maxG = 10.0;
  const gRange = maxG - minG;

  const points = chartData.map((d, i) => {
    const x = pL + (i / (chartData.length - 1)) * cW;
    const y = pT + cH - ((d.gpa - minG) / gRange) * cH;
    return { x, y, sem: d.sem, gpa: d.gpa, credits: d.credits };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(pT + cH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(pT + cH).toFixed(1)} Z`;

  // Improvement analysis
  const semIndex = semestersList.indexOf(selectedSem);
  const trendNotice = useMemo(() => {
    if (semIndex === 0) return 'First semester baseline record.';
    const prevSem = semestersList[semIndex - 1];
    const prevGpa = lmsData.results[prevSem]?.gpa || 0;
    const diff = activeResult.gpa - prevGpa;
    if (diff > 0) return `SGPA improved by +${diff.toFixed(2)} compared to ${prevSem}.`;
    if (diff < 0) return `SGPA dropped by ${diff.toFixed(2)} compared to ${prevSem}.`;
    return `SGPA remained identical to ${prevSem}.`;
  }, [semIndex, semestersList, activeResult.gpa]);

  const handlePrintTranscript = () => {
    showToast('Opening transcript printable view...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Academic</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Academic Results</span>
            </div>
            <h1 className="module-title">Academic Results & Transcripts</h1>
            <p className="module-subtitle">
              Comprehensive semester grade sheets, credit summaries, and cumulative CGPA progression.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient btn-transcript-main"
              onClick={() => setIsTranscriptModalOpen(true)}
            >
              <i className="fa-solid fa-file-invoice"></i>
              <span>View & Print Official Transcript</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{cumulativeCgpa.toFixed(1)}</span>
              <span className="stat-label">Cumulative CGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{activeResult.gpa.toFixed(2)}</span>
              <span className="stat-label">{selectedSem} SGPA</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalEarnedCredits} / {totalDegreeCredits}</span>
              <span className="stat-label">Earned Credits</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <i className="fa-solid fa-certificate"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Distinction</span>
              <span className="stat-label">Academic Classification</span>
            </div>
          </div>
        </div>

        {/* Academic Performance Progression Chart */}
        <div className="c1-card academic-chart-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Academic Performance Progression</h3>
              <p className="c1-card-subtitle">Semester-wise Grade Point Average (SGPA) trend across 4 years</p>
            </div>
            <span className="c1-badge c1-badge-success">
              <i className="fa-solid fa-arrow-trend-up"></i> +1.6 Total Improvement
            </span>
          </div>

          <div className="chart-canvas-wrap">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="performance-svg">
              <defs>
                <linearGradient id="resultsAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="resultsLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Y Grid lines */}
              {[7.0, 8.0, 9.0, 10.0].map((val) => {
                const yPos = pT + cH - ((val - minG) / gRange) * cH;
                return (
                  <g key={val}>
                    <line
                      x1={pL}
                      y1={yPos}
                      x2={chartW - pR}
                      y2={yPos}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeDasharray="4 4"
                    />
                    <text x={pL - 8} y={yPos + 3} textAnchor="end" fill="var(--text-dim)" fontSize="10">
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              <path d={areaPath} fill="url(#resultsAreaGrad)" />
              <path d={linePath} fill="none" stroke="url(#resultsLineGrad)" strokeWidth="3" />

              {points.map((p, idx) => {
                const isSelected = p.sem === selectedSem;
                const isHovered = hoveredChartIdx === idx;

                return (
                  <g
                    key={idx}
                    onClick={() => setSelectedSem(p.sem)}
                    onMouseEnter={() => setHoveredChartIdx(idx)}
                    onMouseLeave={() => setHoveredChartIdx(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected || isHovered ? 7 : 4.5}
                      fill={isSelected ? '#38bdf8' : '#6366f1'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={chartH - 12}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : 'var(--text-muted)'}
                      fontWeight={isSelected ? 700 : 400}
                      fontSize="11"
                    >
                      {p.sem.replace('Semester ', 'Sem ')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredChartIdx !== null && (
              <div
                className="chart-point-tooltip"
                style={{
                  left: `${(points[hoveredChartIdx].x / chartW) * 100}%`,
                  top: `${(points[hoveredChartIdx].y / chartH) * 100 - 15}%`
                }}
              >
                <span className="tooltip-sem">{points[hoveredChartIdx].sem}</span>
                <span className="tooltip-val">SGPA {points[hoveredChartIdx].gpa.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Semester Selection Tabs */}
        <div className="semester-tabs-bar">
          {semestersList.map((sem) => {
            const isSelected = sem === selectedSem;
            const gpaVal = lmsData.results[sem]?.gpa || 0;

            return (
              <button
                key={sem}
                type="button"
                className={`semester-tab-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSem(sem)}
              >
                <span className="sem-pill-title">{sem}</span>
                <span className="sem-pill-gpa">GPA {gpaVal.toFixed(2)}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Course Breakdown Table for Active Semester */}
        <div className="c1-card results-table-card">
          <div className="results-table-header">
            <div>
              <h3 className="c1-card-title">{selectedSem} Detailed Grade Sheet</h3>
              <p className="c1-card-subtitle">{trendNotice}</p>
            </div>

            <div className="semester-score-tag">
              <span className="sem-score-lbl">Semester SGPA</span>
              <span className="sem-score-val">{activeResult.gpa.toFixed(2)}</span>
            </div>
          </div>

          <div className="results-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Title</th>
                  <th>Credits</th>
                  <th>Internal (30)</th>
                  <th>External (70)</th>
                  <th>Total (100)</th>
                  <th>Letter Grade</th>
                  <th>Grade Point</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {activeResult.subjects.map((sub: SemesterResultDetail, idx: number) => {
                  const isHigh = sub.total >= 85;

                  return (
                    <tr key={idx}>
                      <td><span className="course-code-cell">{sub.code || `CS${semIndex + 1}0${idx + 1}`}</span></td>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{sub.subject}</strong></td>
                      <td>{sub.credits || 4}</td>
                      <td>{sub.internal}</td>
                      <td>{sub.external}</td>
                      <td><strong style={{ color: isHigh ? 'var(--color-success)' : 'var(--text-primary)' }}>{sub.total}</strong></td>
                      <td><span className="c1-badge c1-badge-success">{sub.grade}</span></td>
                      <td>{sub.gradePoint || (sub.grade === 'A+' ? 10 : sub.grade === 'A' ? 9 : 8)}</td>
                      <td><span className="status-pass"><i className="fa-solid fa-circle-check"></i> {sub.status || 'Pass'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL: OFFICIAL ACADEMIC TRANSCRIPT PREVIEW
            ============================================================ */}
        {isTranscriptModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsTranscriptModalOpen(false)}
            title="Official Academic Grade Transcript"
            maxWidth="lg"
          >
            <div className="transcript-document">
              {/* Header */}
              <div className="transcript-header">
                <h2>CAMPUSONE INSTITUTION OF TECHNOLOGY</h2>
                <p>Office of the Academic Registrar & Dean of Examinations</p>
                <span className="transcript-doc-title">CONSOLIDATED ACADEMIC RECORD TRANSCRIPT</span>
              </div>

              {/* Student Bio Grid */}
              <div className="transcript-bio-grid">
                <div className="t-bio-cell">
                  <span className="t-bio-lbl">Student Name:</span>
                  <span className="t-bio-val">{user?.name || 'Aditya Sharma'}</span>
                </div>
                <div className="t-bio-cell">
                  <span className="t-bio-lbl">Roll Number:</span>
                  <span className="t-bio-val">236F1A0551</span>
                </div>
                <div className="t-bio-cell">
                  <span className="t-bio-lbl">Degree Program:</span>
                  <span className="t-bio-val">B.Tech — Computer Science & Engineering</span>
                </div>
                <div className="t-bio-cell">
                  <span className="t-bio-lbl">Cumulative CGPA:</span>
                  <span className="t-bio-val" style={{ color: '#0066cc', fontWeight: 800 }}>8.6 / 10.0</span>
                </div>
              </div>

              {/* Semester Summary Table */}
              <table className="transcript-summary-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>Credits Registered</th>
                    <th>Credits Earned</th>
                    <th>SGPA</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  {semestersList.map((sem) => {
                    const r = lmsData.results[sem];
                    return (
                      <tr key={sem}>
                        <td><strong>{sem}</strong></td>
                        <td>{r?.creditsEarned || 20}</td>
                        <td>{r?.creditsEarned || 20}</td>
                        <td>{r?.gpa ? r.gpa.toFixed(2) : '8.00'}</td>
                        <td>PASSED — FIRST CLASS WITH DISTINCTION</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="transcript-signatures">
                <div className="t-sig-block">
                  <div className="t-sig-line"></div>
                  <span>Academic Registrar</span>
                </div>
                <div className="t-sig-block">
                  <div className="t-sig-line"></div>
                  <span>Controller of Examinations</span>
                </div>
              </div>

              <div className="modal-dialog-footer no-print">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsTranscriptModalOpen(false)}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handlePrintTranscript}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Official Grade Sheet</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Feedback */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Access Learning Materials</h4>
            <p>Download lecture slide decks, syllabus documents, and watch class video recordings.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/lms')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Open Learning Hub</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard Home</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentResults;
