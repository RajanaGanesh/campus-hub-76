import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminFees: React.FC = () => {
  const navigate = useNavigate();

  // Mock Admin Fee stats
  const feeStats = {
    total: 35000000,
    collected: 29750000,
    pending: 3750000,
    overdue: 1500000,
    percent: 85
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/admin')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Admin Console
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Fees Overview</span>
      </div>

      <div className="dashboard-header">
        <h1>Fee Management Overview</h1>
        <p>Monitor collection trends, categorized dues, and payment completion metrics across campus departments.</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Invoiced</div>
          <div className="stat-card-value" style={{ marginTop: '4px' }}>₹{(feeStats.total / 100000).toFixed(1)} L</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Collected</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>₹{(feeStats.collected / 100000).toFixed(1)} L</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#ffb236' }}>Pending</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#ffb236' }}>₹{(feeStats.pending / 100000).toFixed(1)} L</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-error)' }}>Overdue</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--color-error)' }}>₹{(feeStats.overdue / 100000).toFixed(1)} L</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-highlight)' }}>Rate</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--accent-highlight)' }}>{feeStats.percent}%</div>
        </div>
      </div>

      {/* Breakdown Charts Grid */}
      <div className="dashboard-main-grid">
        {/* Category Breakdown list */}
        <div className="card-panel" style={{ flex: 1.2 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Fee Category Breakdown</h3>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Tuition Fees', value: 18000000, target: 20000000, color: 'var(--accent-primary)' },
              { label: 'Hostel & Mess Fees', value: 8500000, target: 10000000, color: 'var(--accent-highlight)' },
              { label: 'Transport Dues', value: 2250000, target: 3000000, color: '#ffb236' },
              { label: 'Library & Exams Fees', value: 1000000, target: 2000000, color: '#00d89a' }
            ].map((cat, idx) => {
              const rate = Math.round((cat.value / cat.target) * 100);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                    <span style={{ color: 'white', fontWeight: '700' }}>{cat.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ₹{(cat.value / 100000).toFixed(1)}L / ₹{(cat.target / 100000).toFixed(1)}L ({rate}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${rate}%`, height: '100%', background: cat.color, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Collection trends */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Monthly Collections (₹ Lakhs)</h3>
            <i className="fa-solid fa-chart-bar" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', gap: '12px', height: '140px', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0' }}>
            {[
              { month: 'Jun', val: 75, height: '75%' },
              { month: 'Jul', val: 90, height: '90%' },
              { month: 'Aug', val: 120, height: '100%' },
              { month: 'Sep', val: 50, height: '50%' }
            ].map((bar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{ width: '28px', height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ width: '100%', height: bar.height, background: 'var(--accent-primary)', borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bar.month} ({bar.val}L)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminFees;
