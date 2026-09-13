import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface PlacementSummaryCardProps {
  availableJobsCount?: number;
  applicationsCount?: number;
  shortlistedCount?: number;
  upcomingDrivesCount?: number;
  featuredRole?: string;
  featuredCompany?: string;
  featuredMeta?: string;
}

export const PlacementSummaryCard: React.FC<PlacementSummaryCardProps> = ({
  availableJobsCount = 0,
  applicationsCount = 0,
  shortlistedCount = 0,
  upcomingDrivesCount = 0,
  featuredRole,
  featuredCompany,
  featuredMeta
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

      {/* Featured Company Drive or Empty State */}
      {availableJobsCount > 0 && featuredRole ? (
        <div className="featured-drive-banner">
          <div className="drive-logo-chip">{(featuredCompany || 'CP').slice(0, 2).toUpperCase()}</div>
          <div className="drive-info">
            <div className="drive-role">{featuredRole}</div>
            <div className="drive-meta">{featuredMeta || featuredCompany}</div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '14px 10px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: '1px dashed var(--border-subtle)',
          margin: '12px 0 4px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          No active recruitment drives scheduled
        </div>
      )}

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
