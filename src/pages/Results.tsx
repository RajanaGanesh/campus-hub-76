import React, { useState } from 'react';
import { lmsData } from '../data/lmsData';

export const Results: React.FC = () => {
  const [selectedSem, setSelectedSem] = useState<string>('Semester 7');

  const semestersList = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7'];
  
  const activeResult = lmsData.results[selectedSem] || lmsData.results['Semester 7'];

  // Grade mapping
  const gradeMapping: Record<string, number> = {
    'A+': 10,
    'A': 9,
    'B+': 8,
    'B': 7,
    'C': 6,
    'F': 0
  };

  // Calculate insights dynamically
  const getInsights = () => {
    if (!activeResult.subjects || activeResult.subjects.length === 0) {
      return { strongest: 'N/A', weakest: 'N/A', trend: 'N/A' };
    }
    
    // Strongest (highest total)
    const sortedByTotal = [...activeResult.subjects].sort((a, b) => b.total - a.total);
    const strongest = `${sortedByTotal[0].subject} (${sortedByTotal[0].total}%)`;

    // Weakest (lowest total)
    const weakest = `${sortedByTotal[sortedByTotal.length - 1].subject} (${sortedByTotal[sortedByTotal.length - 1].total}%)`;

    // Trend
    const semIndex = semestersList.indexOf(selectedSem);
    let trend = 'No previous semester to compare.';
    if (semIndex > 0) {
      const prevSem = semestersList[semIndex - 1];
      const prevGPA = lmsData.results[prevSem]?.gpa || 0;
      const diff = activeResult.gpa - prevGPA;
      if (diff > 0) {
        trend = `Your GPA improved by +${diff.toFixed(2)} compared to ${prevSem}.`;
      } else if (diff < 0) {
        trend = `Your GPA dropped by ${diff.toFixed(2)} compared to ${prevSem}.`;
      } else {
        trend = `Your GPA remained identical to ${prevSem}.`;
      }
    }

    return { strongest, weakest, trend };
  };

  const insights = getInsights();

  const handlePrint = () => {
    window.print();
  };

  // Coordinates for Chart 1 (GPAs)
  // Semesters: 1 to 7
  // GPAs: 7.2, 7.5, 7.8, 8.0, 8.3, 8.5, 8.8
  const trendPoints = semestersList.map((sem, idx) => {
    const val = lmsData.results[sem]?.gpa || 6.0;
    const x = 40 + idx * 70;
    const y = 140 - ((val - 6.0) / 4.0) * 100; // Map 6.0-10.0 to 140-40 Y coordinates
    return { x, y, val, sem };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Results Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Academic Results</h1>
          <p>Track your semester performance and academic progress.</p>
        </div>
        
        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 20px', height: '42px', margin: 0 }}
          onClick={handlePrint}
        >
          <i className="fa-solid fa-print" style={{ marginRight: '8px' }}></i>
          Print Transcript
        </button>
      </div>

      {/* Top statistics summary cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-award"></i>
            </div>
            <span className="stat-card-trend excellent">CGPA</span>
          </div>
          <div className="stat-card-value">8.6</div>
          <div className="stat-card-desc">Current Cumulative GPA</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-square-poll-vertical"></i>
            </div>
            <span className="stat-card-trend excellent">GPA</span>
          </div>
          <div className="stat-card-value">{activeResult.gpa}</div>
          <div className="stat-card-desc">Selected Semester GPA</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
          <div className="stat-card-value">{activeResult.creditsEarned}</div>
          <div className="stat-card-desc">Semester Credits Earned</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-book"></i>
            </div>
          </div>
          <div className="stat-card-value">132</div>
          <div className="stat-card-desc">Total Cumulative Credits</div>
        </div>
      </div>

      {/* Semester Selector Bar */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '15px' }}>Filter Results</h3>

          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            style={{
              background: '#100f2e',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              color: 'white',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {semestersList.map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="card-panel print-section">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Semester Results — {selectedSem}</h3>
          <span style={{ fontSize: '12.5px', color: 'var(--accent-highlight)', fontWeight: '700' }}>GPA: {activeResult.gpa}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Subject</th>
                <th style={{ padding: '12px' }}>Code</th>
                <th style={{ padding: '12px' }}>Internal</th>
                <th style={{ padding: '12px' }}>External</th>
                <th style={{ padding: '12px' }}>Total</th>
                <th style={{ padding: '12px' }}>Grade</th>
                <th style={{ padding: '12px' }}>Grade Point</th>
                <th style={{ padding: '12px' }}>Credits</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeResult.subjects.map((sub, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{sub.subject}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{sub.code}</td>
                  <td style={{ padding: '12px' }}>{sub.internal}</td>
                  <td style={{ padding: '12px' }}>{sub.external}</td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{sub.total}</td>
                  <td style={{ padding: '12px', color: 'var(--accent-highlight)', fontWeight: '800' }}>{sub.grade}</td>
                  <td style={{ padding: '12px' }}>{gradeMapping[sub.grade] || sub.gradePoint}</td>
                  <td style={{ padding: '12px' }}>{sub.credits}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="subject-att-status safe" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results SVG charts */}
      <div className="dashboard-main-grid">
        {/* SVG Line Chart: Semester GPA Trend */}
        <div className="card-panel">
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Semester Performance Trend</h3>
            <i className="fa-solid fa-chart-line" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="resultsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Y Gridlines */}
              {[6.0, 7.0, 8.0, 9.0, 10.0].map((val) => {
                const y = 140 - ((val - 6.0) / 4.0) * 100;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.03)" />
                    <text x="32" y={y + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end">{val.toFixed(1)}</text>
                  </g>
                );
              })}

              {/* Gradient Area under trend line */}
              <path
                d={`M ${trendPoints[0].x},${trendPoints[0].y} ` +
                  trendPoints.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ') +
                  ` L ${trendPoints[trendPoints.length - 1].x},140 L ${trendPoints[0].x},140 Z`}
                fill="url(#resultsGrad)"
              />

              {/* Trend Line */}
              <path
                d={`M ${trendPoints[0].x},${trendPoints[0].y} ` +
                  trendPoints.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Circles */}
              {trendPoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#100f2e"
                    stroke={selectedSem === p.sem ? 'var(--accent-highlight)' : 'var(--accent-primary)'}
                    strokeWidth={selectedSem === p.sem ? '3' : '2'}
                  />
                  <text x={p.x} y={p.y - 8} fill="white" fontSize="9" fontWeight="700" textAnchor="middle">{p.val.toFixed(1)}</text>
                </g>
              ))}

              {/* X Labels */}
              {trendPoints.map((p, idx) => (
                <text key={idx} x={p.x} y="160" fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontWeight="600">
                  {p.sem.split(' ')[1]}
                </text>
              ))}
              <text x="260" y="180" fill="var(--text-secondary)" fontSize="9.5" textAnchor="middle" fontWeight="700">Semesters</text>
            </svg>
          </div>
        </div>

        {/* SVG Bar Chart: Subject Marks in Selected Semester */}
        <div className="card-panel">
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Subject Performance — {selectedSem}</h3>
            <i className="fa-solid fa-chart-bar" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', minWidth: '400px', height: 'auto', display: 'block' }}>
              {/* Horizontal gridlines */}
              {[25, 50, 75, 100].map((val) => {
                const y = 150 - (val / 100) * 120;
                return (
                  <g key={val}>
                    <line x1="45" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.03)" />
                    <text x="36" y={y + 3} fill="var(--text-secondary)" fontSize="9" textAnchor="end">{val}</text>
                  </g>
                );
              })}

              {activeResult.subjects.map((sub, idx) => {
                const barSpacing = 400 / activeResult.subjects.length;
                const x = 60 + idx * barSpacing;
                const barHeight = (sub.total / 100) * 120;
                const y = 150 - barHeight;
                
                return (
                  <g key={idx}>
                    {/* Bar */}
                    <rect
                      x={x - 10}
                      y={y}
                      width="20"
                      height={barHeight}
                      fill="var(--accent-highlight)"
                      rx="3"
                    />
                    {/* Value Tag */}
                    <text x={x} y={y - 6} fill="white" fontSize="9" fontWeight="700" textAnchor="middle">{sub.total}</text>
                    {/* X Code Label */}
                    <text x={x} y="165" fill="var(--text-secondary)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                      {sub.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Academic Insights and Trends */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Academic Performance Insights</h3>
          <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-highlight)' }}></i>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Strongest Area</h4>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#00d89a', marginTop: '8px' }}>
              {insights.strongest.split(' (')[0]}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Excellent command: {insights.strongest.includes('(') ? insights.strongest.split(' (')[1].replace(')', '') : 'N/A'} total score.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Scope for Improvement</h4>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffb236', marginTop: '8px' }}>
              {insights.weakest.split(' (')[0]}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Lowest academic mark: {insights.weakest.includes('(') ? insights.weakest.split(' (')[1].replace(')', '') : 'N/A'}. Recommend extra focus.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px' }}>
            <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Academic Trend</h4>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginTop: '8px', lineHeight: '1.4' }}>
              {insights.trend}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Calculated dynamically against previous semesters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Results;
