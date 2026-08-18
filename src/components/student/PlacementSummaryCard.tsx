import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface PlacementSummaryCardProps {
  availableJobsCount?: number;
  applicationsCount?: number;
  shortlistedCount?: number;
  upcomingDrivesCount?: number;
}

export const PlacementSummaryCard: React.FC<PlacementSummaryCardProps> = ({
  availableJobsCount = 12,
  applicationsCount = 3,
  shortlistedCount = 1,
  upcomingDrivesCount = 2
}) => {
  const navigate = useNavigate();

  return (
    <div className="c1-card placement-summary-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Placement Cell</h3>
          <p className="c1-card-subtitle">Campus recruitment drives & job openings</p>
        </div>
        <span className="c1-badge c1-badge-success">
          <i className="fa-solid fa-bolt"></i> {availableJobsCount} Openings
        </span>
      </div>

      <div className="placement-metrics-grid">
        <div className="placement-metric-item">
          <span className="placement-metric-val">{availableJobsCount}</span>
          <span className="placement-metric-label">Active Drives</span>
        </div>
        <div className="placement-metric-item">
          <span className="placement-metric-val">{applicationsCount}</span>
          <span className="placement-metric-label">Applied</span>
        </div>
        <div className="placement-metric-item">
          <span className="placement-metric-val" style={{ color: 'var(--color-success)' }}>{shortlistedCount}</span>
          <span className="placement-metric-label">Shortlisted</span>
        </div>
        <div className="placement-metric-item">
          <span className="placement-metric-val" style={{ color: 'var(--accent-blue)' }}>{upcomingDrivesCount}</span>
          <span className="placement-metric-label">Interviews</span>
        </div>
      </div>

      {/* Featured Company Drive */}
      <div className="featured-drive-banner">
        <div className="drive-logo-chip">TN</div>
        <div className="drive-info">
          <div className="drive-role">Software Developer (Full Stack)</div>
          <div className="drive-meta">TechNova Systems • ₹8.0 LPA • Deadline: 30 Aug</div>
        </div>
      </div>

      <button
        type="button"
        className="c1-btn c1-btn-secondary btn-card-bottom"
        onClick={() => navigate('/student/placements')}
      >
        <span>Explore Placement Opportunities</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};
