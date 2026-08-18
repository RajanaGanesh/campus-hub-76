import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const ParentFees: React.FC = () => {
  const linkedStudents = getParentLinkedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');

  const currentStudent: ParentLinkedStudent =
    linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  const [selectedReceipt, setSelectedReceipt] = useState<ParentLinkedStudent['feeDetails']['transactions'][0] | null>(null);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Fee Management</span>
            </div>
            <h1 className="module-title">Tuition Invoices & Payment Receipts</h1>
            <p className="module-subtitle">
              Verified institutional fee settlements, official university receipts, and balance records for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-fee-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-fee-student"
                  className="c1-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--accent-primary)', fontWeight: 700, color: '#ffffff' }}
                >
                  {linkedStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.feeDetails.totalInvoiced}</span>
              <span className="stat-label">Total Invoiced Fees</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{currentStudent.feeDetails.paidAmount}</span>
              <span className="stat-label">Total Paid Amount</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.feeDetails.pendingBalance === '₹0' ? '#34d399' : '#fbbf24' }}>
                {currentStudent.feeDetails.pendingBalance}
              </span>
              <span className="stat-label">Outstanding Balance</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.feeDetails.status === 'Paid in Full' ? '#34d399' : '#fbbf24' }}>
                {currentStudent.feeDetails.status}
              </span>
              <span className="stat-label">Payment Status</span>
            </div>
          </div>
        </div>

        {/* Transactions & Receipts Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Official Fee Payment Receipts</h3>
              <p className="c1-card-subtitle">Verified institutional payment gateway vouchers</p>
            </div>
            <span className="c1-badge c1-badge-success">Finance Controller Audited</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Receipt Number</th>
                  <th>Payment Description</th>
                  <th>Settlement Date</th>
                  <th>Amount Paid</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {currentStudent.feeDetails.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td><span className="course-code-cell">{tx.id}</span></td>
                    <td><strong style={{ color: '#ffffff' }}>{tx.type}</strong></td>
                    <td>{tx.date}</td>
                    <td><strong style={{ color: '#34d399', fontSize: '0.9375rem' }}>{tx.amount}</strong></td>
                    <td>{tx.mode}</td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-check"></i> {tx.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => setSelectedReceipt(tx)}
                      >
                        <i className="fa-solid fa-receipt"></i>
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL: VIEW RECEIPT MODAL
            ============================================================ */}
        {selectedReceipt && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedReceipt(null)}
            title={`Payment Receipt: ${selectedReceipt.id}`}
            maxWidth="sm"
          >
            <div className="student-profile-dialog-content">
              <div className="student-dialog-header">
                <div className="student-avatar-badge" style={{ borderColor: 'var(--color-success)', color: '#34d399' }}>
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <div>
                  <h3 className="stu-name">{selectedReceipt.amount}</h3>
                  <span className="stu-sub">Receipt Ref: <strong>{selectedReceipt.id}</strong></span>
                </div>
              </div>

              <div className="student-profile-metrics-grid">
                <div className="d-cell">
                  <span className="d-lbl">Student:</span>
                  <span className="d-val">{currentStudent.name} ({currentStudent.id})</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Payment Date:</span>
                  <span className="d-val">{selectedReceipt.date}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Payment Description:</span>
                  <span className="d-val">{selectedReceipt.type}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Payment Mode:</span>
                  <span className="d-val">{selectedReceipt.mode}</span>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    showToast('Official PDF receipt downloaded.', 'success');
                    setSelectedReceipt(null);
                  }}
                >
                  <i className="fa-solid fa-file-arrow-down"></i>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

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

export default ParentFees;
