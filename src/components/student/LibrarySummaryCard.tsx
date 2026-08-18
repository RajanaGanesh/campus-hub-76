import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface LibrarySummaryCardProps {
  issuedCount?: number;
  dueSoonCount?: number;
  overdueCount?: number;
  fineAmount?: number;
}

export const LibrarySummaryCard: React.FC<LibrarySummaryCardProps> = ({
  issuedCount = 3,
  dueSoonCount = 1,
  overdueCount = 0,
  fineAmount = 0
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
        <div className="lib-chip lib-chip-warning">
          <span className="lib-chip-num">{dueSoonCount}</span>
          <span className="lib-chip-label">Due Soon</span>
        </div>
        <div className="lib-chip">
          <span className="lib-chip-num">{overdueCount}</span>
          <span className="lib-chip-label">Overdue</span>
        </div>
        <div className="lib-chip">
          <span className="lib-chip-num">₹{fineAmount}</span>
          <span className="lib-chip-label">Fine</span>
        </div>
      </div>

      <div className="recent-book-banner">
        <div className="book-icon-wrap">
          <i className="fa-solid fa-book"></i>
        </div>
        <div className="book-banner-info">
          <span className="book-banner-title">Clean Code: Agile Craftsmanship</span>
          <span className="book-banner-due">Due: 28 Aug 2026 (Robert C. Martin)</span>
        </div>
      </div>

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
