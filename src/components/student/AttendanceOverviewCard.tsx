import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface AttendanceOverviewCardProps {
  overallPercentage?: number;
  presentCount?: number;
  absentCount?: number;
  totalClasses?: number;
}

export const AttendanceOverviewCard: React.FC<AttendanceOverviewCardProps> = ({
  overallPercentage = 86,
  presentCount = 142,
  absentCount = 23,
  totalClasses = 165
}) => {
  const navigate = useNavigate();

  const isSafe = overallPercentage >= 75;
  const isExcellent = overallPercentage >= 85;

  // SVG Circular Gauge calculation
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="c1-card attendance-overview-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Attendance Overview</h3>
          <p className="c1-card-subtitle">Overall attendance record & eligibility status</p>
        </div>
        <span className={`c1-badge ${isSafe ? (isExcellent ? 'c1-badge-success' : 'c1-badge-primary') : 'c1-badge-error'}`}>
          <i className={`fa-solid ${isSafe ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
          {isSafe ? (isExcellent ? 'Excellent (85%+)' : 'Safe (75%+)') : 'Warning (<75%)'}
        </span>
      </div>

      <div className="attendance-gauge-section">
        {/* SVG Circular Progress Meter */}
        <div className="gauge-container">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="gauge-svg">
            <defs>
              <linearGradient id="attendanceGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isSafe ? 'url(#attendanceGaugeGrad)' : 'var(--color-error)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="gauge-center-text">
            <span className="gauge-percentage">{overallPercentage}%</span>
            <span className="gauge-label">Attendance</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="attendance-metric-breakdown">
          <div className="metric-box metric-present">
            <div className="metric-box-header">
              <span className="metric-indicator-dot present-dot"></span>
              <span className="metric-name">Present Days</span>
            </div>
            <span className="metric-num">{presentCount}</span>
            <span className="metric-denom">of {totalClasses} classes</span>
          </div>

          <div className="metric-box metric-absent">
            <div className="metric-box-header">
              <span className="metric-indicator-dot absent-dot"></span>
              <span className="metric-name">Absent Days</span>
            </div>
            <span className="metric-num">{absentCount}</span>
            <span className="metric-denom">excused & leaves</span>
          </div>
        </div>
      </div>

      <div className="attendance-status-alert">
        {isSafe ? (
          <div className="status-notice status-notice-safe">
            <i className="fa-solid fa-circle-check"></i>
            <span>
              Your attendance satisfies institutional examination eligibility criteria (minimum 75% required).
            </span>
          </div>
        ) : (
          <div className="status-notice status-notice-warning">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>
              Attendance is below 75%. Please attend upcoming lab sessions to avoid exam hall ticket blocking.
            </span>
          </div>
        )}
      </div>

      <div className="card-action-row">
        <button
          type="button"
          className="c1-btn c1-btn-secondary"
          style={{ width: '100%' }}
          onClick={() => navigate('/student/attendance')}
        >
          <span>View Complete Attendance Log</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};
