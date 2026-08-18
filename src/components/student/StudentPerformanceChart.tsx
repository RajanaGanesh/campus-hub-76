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

const DEFAULT_DATA: PerformanceDataPoint[] = [
  { semester: 'Sem 1', cgpa: 7.2 },
  { semester: 'Sem 2', cgpa: 7.5 },
  { semester: 'Sem 3', cgpa: 7.8 },
  { semester: 'Sem 4', cgpa: 8.0 },
  { semester: 'Sem 5', cgpa: 8.3 },
  { semester: 'Sem 6', cgpa: 8.5 },
  { semester: 'Cur Sem', cgpa: 8.6 }
];

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  data = DEFAULT_DATA,
  currentCgpa = 8.6
}) => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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

  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((item.cgpa - minVal) / range) * chartHeight;
    return { x, y, semester: item.semester, cgpa: item.cgpa };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`;

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
            CGPA {currentCgpa.toFixed(1)}
          </span>
          <span className="c1-badge c1-badge-success">
            <i className="fa-solid fa-arrow-trend-up"></i> +1.4 Trend
          </span>
        </div>
      </div>

      <div className="chart-canvas-wrap">
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

          {/* Area Fill */}
          <path d={areaPath} fill="url(#perfAreaGrad)" />

          {/* Performance Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#perfLineGrad)"
            strokeWidth="3"
            filter="url(#chartGlow)"
          />

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

        {/* Floating Tooltip info on hover */}
        {hoveredIdx !== null && (
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
