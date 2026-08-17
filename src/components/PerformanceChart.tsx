import React, { useState } from 'react';

interface ChartDataPoint {
  semester: string;
  cgpa: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Layout configurations
  const width = 550;
  const height = 220;
  const marginLeft = 40;
  const marginRight = 30;
  const marginTop = 20;
  const marginBottom = 40;

  const availableWidth = width - marginLeft - marginRight;
  const availableHeight = height - marginTop - marginBottom;

  const minCGPA = 6.0;
  const maxCGPA = 10.0;
  const cgpaRange = maxCGPA - minCGPA;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = marginLeft + (index / (data.length - 1)) * availableWidth;
    const y = marginTop + availableHeight - ((d.cgpa - minCGPA) / cgpaRange) * availableHeight;
    return { x, y, semester: d.semester, cgpa: d.cgpa };
  });

  // SVG Line path string
  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Gradient area path string
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(marginTop + availableHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(marginTop + availableHeight).toFixed(1)} Z`;

  // Y-axis grid line values
  const gridLines = [7.0, 8.0, 9.0, 10.0];

  return (
    <div className="card-panel" style={{ width: '100%' }}>
      <div className="card-panel-header" style={{ marginBottom: '14px' }}>
        <div>
          <h3>Academic Performance</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Semester-wise CGPA progression</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-highlight)' }}>CGPA: 8.6</span>
          <span style={{ fontSize: '10px', color: '#00d89a', background: 'rgba(0, 216, 154, 0.08)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', border: '1px solid rgba(0,216,154,0.1)' }}>
            +1.2% Trend
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '480px', height: 'auto', display: 'block' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((val) => {
            const y = marginTop + availableHeight - ((val - minCGPA) / cgpaRange) * availableHeight;
            return (
              <g key={val}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={width - marginRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={marginLeft - 8}
                  y={y + 4}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Fill Area */}
          <path d={areaPath} fill="url(#chartGrad)" />

          {/* Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-axis labels */}
          {points.map((p, index) => (
            <text
              key={index}
              x={p.x}
              y={height - marginBottom + 18}
              fill="var(--text-secondary)"
              fontSize="9"
              textAnchor="middle"
              fontWeight="600"
            >
              {p.semester}
            </text>
          ))}

          {/* Data point circles and interaction */}
          {points.map((p, index) => (
            <g
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === index ? 6 : 4}
                fill="#100f28"
                stroke={hoveredIndex === index ? 'var(--accent-highlight)' : 'var(--accent-primary)'}
                strokeWidth="2.5"
                style={{ transition: 'all 0.15s' }}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${points[hoveredIndex].x - 40}px`,
              top: `${points[hoveredIndex].y - 38}px`,
              background: '#100f2e',
              border: '1px solid var(--accent-highlight)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '11px',
              color: 'white',
              fontWeight: '700',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              animation: 'dropdownAnim 0.15s ease'
            }}
          >
            CGPA: {points[hoveredIndex].cgpa}
          </div>
        )}
      </div>
    </div>
  );
};
export default PerformanceChart;
