import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface PerformanceDataPoint {
  semester: string;
  cgpa: number;
}

export interface StudentPerformanceChartProps {
  data?: PerformanceDataPoint[];
  currentCgpa?: number;
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  data = [],
  currentCgpa
}) => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasData = Array.isArray(data) && data.length > 0;

  // Derive display CGPA
  const displayCgpa = currentCgpa !== undefined && currentCgpa > 0
    ? currentCgpa
    : (hasData ? data[data.length - 1].cgpa : 0.0);

  // Derive trend if 2+ data points exist
  const trendDiff = hasData && data.length >= 2
    ? data[data.length - 1].cgpa - data[data.length - 2].cgpa
    : null;

  // SVG Chart Geometry
  const width = 580;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const minVal = 6.0;
  const maxVal = 10.0;
  const range = maxVal - minVal;

  const points = hasData
    ? data.map((item, idx) => {
        const x = data.length === 1
          ? paddingLeft + chartWidth / 2
          : paddingLeft + (idx / (data.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - ((item.cgpa - minVal) / range) * chartHeight;
        return { x, y, semester: item.semester, cgpa: item.cgpa };
      })
    : [];

  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : '';

  const yGridLines = [7.0, 8.0, 9.0, 10.0];

  return (
    <div className="c1-card student-performance-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Academic Performance</h3>
          <p className="c1-card-subtitle">Semester-wise Cumulative GPA trajectory</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)', marginRight: '8px' }}>
            CGPA {displayCgpa > 0 ? displayCgpa.toFixed(1) : '0.0'}
          </span>
          {trendDiff !== null ? (
            <span className={`c1-badge ${trendDiff >= 0 ? 'c1-badge-success' : 'c1-badge-error'}`}>
              <i className={`fa-solid ${trendDiff >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              {' '}{trendDiff >= 0 ? `+${trendDiff.toFixed(1)}` : trendDiff.toFixed(1)} Trend
            </span>
          ) : (
            <span className="c1-badge c1-badge-cyan">
              <i className="fa-solid fa-graduation-cap"></i> Transcript
            </span>
          )}
        </div>
      </div>

      <div className="chart-canvas-wrap">
        {!hasData ? (
          <div style={{
            height: `${height}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 16px',
            color: 'var(--text-muted)'
          }}>
            <i className="fa-solid fa-chart-line" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.35 }}></i>
            <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
              No Semester Performance Records
            </h4>
            <p style={{ margin: 0, fontSize: '0.825rem', maxWidth: '380px', lineHeight: 1.4 }}>
              Semester-wise CGPA and academic progression will be charted here as your semester exam results are graded and published.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="performance-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="perfAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="perfLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="chartGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {yGridLines.map((val) => {
              const yPos = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={width - paddingRight}
                    y2={yPos}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yPos + 3}
                    textAnchor="end"
                    fill="var(--text-dim)"
                    fontSize="10"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill (if 2+ points) */}
            {areaPath && <path d={areaPath} fill="url(#perfAreaGrad)" />}

            {/* Performance Trend Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#perfLineGrad)"
                strokeWidth="3"
                filter="url(#chartGlow)"
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIdx === idx;
              const isLast = idx === points.length - 1;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Active circle aura */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered || isLast ? 7 : 4.5}
                    fill={isHovered ? '#38bdf8' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{ transition: 'all 0.2s ease' }}
                  />

                  {/* X-axis semester label */}
                  <text
                    x={p.x}
                    y={height - 12}
                    textAnchor="middle"
                    fill={isHovered || isLast ? '#ffffff' : 'var(--text-muted)'}
                    fontWeight={isHovered || isLast ? 600 : 400}
                    fontSize="11"
                  >
                    {p.semester}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Floating Tooltip info on hover */}
        {hasData && hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="chart-point-tooltip"
            style={{
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 15}%`
            }}
          >
            <span className="tooltip-sem">{points[hoveredIdx].semester}</span>
            <span className="tooltip-val">GPA {points[hoveredIdx].cgpa.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="card-action-row" style={{ marginTop: '16px' }}>
        <button
          type="button"
          className="c1-btn c1-btn-secondary"
          style={{ width: '100%' }}
          onClick={() => navigate('/student/results')}
        >
          <span>View Semester Transcripts & Results</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};
