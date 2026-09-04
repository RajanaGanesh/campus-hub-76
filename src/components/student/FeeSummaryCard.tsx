import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface FeeSummaryCardProps {
  total?: number;
  paid?: number;
  pending?: number;
  dueDate?: string;
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({
  total = 85000,
  paid = 72500,
  pending = 12500,
  dueDate = '30 Aug 2026'
}) => {
  const navigate = useNavigate();

  const paidPercentage = Math.round((paid / total) * 100);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  return (
    <div className="c1-card fee-summary-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Fee Status</h3>
          <p className="c1-card-subtitle">Academic Year 2026–2027</p>
        </div>
        <span className="c1-badge c1-badge-warning">
          <i className="fa-solid fa-clock"></i> Due: {dueDate}
        </span>
      </div>

      <div className="fee-amounts-grid">
        <div className="fee-item">
          <span className="fee-label">Total Dues</span>
          <span className="fee-val total-val">{formatCurrency(total)}</span>
        </div>
        <div className="fee-item">
          <span className="fee-label">Paid</span>
          <span className="fee-val paid-val">{formatCurrency(paid)}</span>
        </div>
        <div className="fee-item">
          <span className="fee-label">Pending</span>
          <span className="fee-val pending-val">{formatCurrency(pending)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fee-progress-wrapper">
        <div className="fee-progress-meta">
          <span>Payment Completion</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{paidPercentage}%</span>
        </div>
        <div className="fee-progress-track">
          <div
            className="fee-progress-bar"
            style={{ width: `${paidPercentage}%` }}
          ></div>
        </div>
      </div>

      <button
        type="button"
        className="c1-btn c1-btn-secondary btn-card-bottom"
        onClick={() => navigate('/student/fees')}
      >
        <span>View Fee Statements & Receipts</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};
