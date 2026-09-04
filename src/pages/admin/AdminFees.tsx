import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export const AdminFees: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const deptFeeLedger = [
    { dept: 'Computer Science & Engineering', billed: '₹54,00,000', collected: '₹50,40,000', pending: '₹3,60,000', rate: 93 },
    { dept: 'Electronics & Communication', billed: '₹42,00,000', collected: '₹38,60,000', pending: '₹3,40,000', rate: 92 },
    { dept: 'Information Technology', billed: '₹33,00,000', collected: '₹30,80,000', pending: '₹2,20,000', rate: 93 },
    { dept: 'Artificial Intelligence & Data Science', billed: '₹24,00,000', collected: '₹22,80,000', pending: '₹1,20,000', rate: 95 },
    { dept: 'Mechanical Engineering', billed: '₹24,00,000', collected: '₹21,60,000', pending: '₹2,40,000', rate: 90 },
    { dept: 'Civil Engineering', billed: '₹23,00,000', collected: '₹20,00,000', pending: '₹3,00,000', rate: 87 }
  ];

  const recentTransactions = [
    { id: 'TXN-8901', student: 'Aditya Sharma (236F1A0551)', amount: '₹42,500', method: 'UPI / HDFC NetBanking', date: '18 Aug 2026', status: 'Success' },
    { id: 'TXN-8902', student: 'Sneha Patel (236F1A0552)', amount: '₹42,500', method: 'Credit Card', date: '17 Aug 2026', status: 'Success' },
    { id: 'TXN-8903', student: 'Rohan Gupta (236F1A0553)', amount: '₹42,500', method: 'Debit Card', date: '17 Aug 2026', status: 'Success' },
    { id: 'TXN-8904', student: 'Pooja Reddy (236F1A0554)', amount: '₹42,500', method: 'UPI / Razorpay', date: '16 Aug 2026', status: 'Success' }
  ];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Fee Management</span>
            </div>
            <h1 className="module-title">Institutional Fee Management & Collections</h1>
            <p className="module-subtitle">
              Monitor university tuition collection rates, departmental ledgers, online payment gateways, and pending balances.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Automated payment reminder notifications sent to 84 pending students.', 'success')}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send Payment Reminders</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹2.00 Cr</span>
              <span className="stat-label">Total Invoiced Fees</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>₹1.84 Cr</span>
              <span className="stat-label">Realized Revenue (92%)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>₹16.0 Lakhs</span>
              <span className="stat-label">Pending Collection</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">98.4%</span>
              <span className="stat-label">Online Gateway Success</span>
            </div>
          </div>
        </div>

        {/* Department Ledger Table */}
        <div className="c1-card student-roster-card" style={{ marginBottom: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Department Tuition Realization Ledger</h3>
              <p className="c1-card-subtitle">Collection percentage and outstanding balance by engineering school</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Term 2025–2026</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Invoiced</th>
                  <th>Collected Revenue</th>
                  <th>Pending Balance</th>
                  <th>Realization %</th>
                </tr>
              </thead>
              <tbody>
                {deptFeeLedger.map((d) => (
                  <tr key={d.dept}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{d.dept}</strong></td>
                    <td>{d.billed}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>{d.collected}</strong></td>
                    <td><strong style={{ color: '#fbbf24' }}>{d.pending}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#38bdf8' }}>{d.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Recent Fee Settlements & Gateway Logs</h3>
              <p className="c1-card-subtitle">Live university payment receipts and transaction records</p>
            </div>
            <span className="c1-badge c1-badge-success">Razorpay / UPI Verified</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Student Candidate</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td><span className="course-code-cell">{tx.id}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{tx.student}</strong></td>
                    <td><strong style={{ color: '#38bdf8' }}>{tx.amount}</strong></td>
                    <td>{tx.method}</td>
                    <td>{tx.date}</td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-circle-check"></i> {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default AdminFees;
