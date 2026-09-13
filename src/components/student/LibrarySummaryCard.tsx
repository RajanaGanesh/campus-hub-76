import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface LibrarySummaryCardProps {
  issuedCount?: number;
  dueSoonCount?: number;
  overdueCount?: number;
  fineAmount?: number;
  recentBookTitle?: string;
  recentBookDue?: string;
}

export const LibrarySummaryCard: React.FC<LibrarySummaryCardProps> = ({
  issuedCount = 0,
  dueSoonCount = 0,
  overdueCount = 0,
  fineAmount = 0,
  recentBookTitle,
  recentBookDue
}) => {
  const navigate = useNavigate();

  return (
    <div className="c1-card library-summary-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Digital Library</h3>
          <p className="c1-card-subtitle">Active book loans & reservations</p>
        </div>
        <span className="c1-badge c1-badge-cyan">
          <i className="fa-solid fa-book-bookmark"></i> {issuedCount} Issued
        </span>
      </div>

      <div className="library-quick-chips">
        <div className="lib-chip">
          <span className="lib-chip-num">{issuedCount}</span>
          <span className="lib-chip-label">Borrowed</span>
        </div>
        <div className={`lib-chip ${dueSoonCount > 0 ? 'lib-chip-warning' : ''}`}>
          <span className="lib-chip-num">{dueSoonCount}</span>
          <span className="lib-chip-label">Due Soon</span>
        </div>
        <div className={`lib-chip ${overdueCount > 0 ? 'lib-chip-warning' : ''}`}>
          <span className="lib-chip-num">{overdueCount}</span>
          <span className="lib-chip-label">Overdue</span>
        </div>
        <div className="lib-chip">
          <span className="lib-chip-num">₹{fineAmount}</span>
          <span className="lib-chip-label">Fine</span>
        </div>
      </div>

      {issuedCount > 0 && recentBookTitle ? (
        <div className="recent-book-banner">
          <div className="book-icon-wrap">
            <i className="fa-solid fa-book"></i>
          </div>
          <div className="book-banner-info">
            <span className="book-banner-title">{recentBookTitle}</span>
            {recentBookDue && <span className="book-banner-due">Due: {recentBookDue}</span>}
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
          No books currently checked out
        </div>
      )}

      <button
        type="button"
        className="c1-btn c1-btn-secondary btn-card-bottom"
        onClick={() => navigate('/student/library')}
      >
        <span>Browse Digital Library Catalog</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};
