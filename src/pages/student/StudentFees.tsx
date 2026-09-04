import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export interface FeeCategoryBreakdown {
  id: string;
  category: string;
  total: number;
  paid: number;
  pending: number;
  dueDate: string;
  status: 'Settled' | 'Partial' | 'Pending';
}

export interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: 'UPI' | 'Net Banking' | 'Card' | 'Wallet';
  status: 'Paid' | 'Pending' | 'Failed';
}

export const StudentFees: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fee state
  const [feeBreakdown, setFeeBreakdown] = useState<FeeCategoryBreakdown[]>([
    { id: 'f-tuition', category: 'Tuition Fee (Semester 8)', total: 60000, paid: 47500, pending: 12500, dueDate: '15 Sep 2026', status: 'Partial' },
    { id: 'f-lab', category: 'Laboratory & Computing Facilities', total: 8000, paid: 8000, pending: 0, dueDate: '15 Sep 2026', status: 'Settled' },
    { id: 'f-lib', category: 'Digital Library & Periodicals', total: 5000, paid: 4500, pending: 500, dueDate: '15 Sep 2026', status: 'Partial' },
    { id: 'f-hostel', category: 'Hostel & Amenities Fee', total: 7000, paid: 0, pending: 7000, dueDate: '15 Sep 2026', status: 'Pending' }
  ]);

  // Payment history records
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
    { id: 'CH2026PAY001120', date: '05 Jun 2026', description: 'Academic Enrollment Deposit', amount: 25000, method: 'Net Banking', status: 'Paid' },
    { id: 'CH2026PAY001210', date: '15 Jul 2026', description: 'Tuition Fee (Installment 1)', amount: 35000, method: 'UPI', status: 'Paid' }
  ]);

  // Derived Totals
  const totalFees = feeBreakdown.reduce((sum, item) => sum + item.total, 0);
  const totalPaid = feeBreakdown.reduce((sum, item) => sum + item.paid, 0);
  const totalPending = feeBreakdown.reduce((sum, item) => sum + item.pending, 0);
  const paidPercentage = Math.round((totalPaid / totalFees) * 100);

  // Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(totalPending);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'UPI' | 'Net Banking' | 'Card'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<PaymentRecord | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Confirm Demo Payment
  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const newTxnId = `CH2026PAY00${Math.floor(1000 + Math.random() * 9000)}`;
      const newPayment: PaymentRecord = {
        id: newTxnId,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        description: 'Semester 8 Outstanding Fee Settlement',
        amount: payAmount,
        method: selectedPayMethod,
        status: 'Paid'
      };

      // Add to payment history
      setPaymentHistory((prev) => [newPayment, ...prev]);

      // Update fee breakdown
      setFeeBreakdown((prev) => {
        let remainingPaid = payAmount;
        return prev.map((item) => {
          if (remainingPaid <= 0) return item;
          const deductible = Math.min(item.pending, remainingPaid);
          remainingPaid -= deductible;
          const newPaid = item.paid + deductible;
          const newPending = item.total - newPaid;
          const newStatus: FeeCategoryBreakdown['status'] = newPending === 0 ? 'Settled' : 'Partial';
          return { ...item, paid: newPaid, pending: newPending, status: newStatus };
        });
      });

      setIsPayModalOpen(false);
      setActiveReceiptPayment(newPayment);
      showToast(`Payment of ₹${payAmount.toLocaleString('en-IN')} completed successfully!`, 'success');
    }, 1600);
  };

  const handlePrintReceipt = () => {
    showToast('Opening official fee receipt print view...', 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Campus Services</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Fee Management</span>
            </div>
            <h1 className="module-title">Fee Management</h1>
            <p className="module-subtitle">
              Detailed tuition fee schedules, installment breakdowns, transaction ledger, and official downloadable receipts.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient btn-pay-fees-main"
              onClick={() => {
                setPayAmount(totalPending);
                setIsPayModalOpen(true);
              }}
              disabled={totalPending === 0}
            >
              <i className="fa-solid fa-credit-card"></i>
              <span>{totalPending > 0 ? `Pay Fees (₹${totalPending.toLocaleString('en-IN')})` : 'All Fees Cleared'}</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-vault"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹{totalFees.toLocaleString('en-IN')}</span>
              <span className="stat-label">Total Annual Fees</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹{totalPaid.toLocaleString('en-IN')}</span>
              <span className="stat-label">Amount Paid</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹{totalPending.toLocaleString('en-IN')}</span>
              <span className="stat-label">Outstanding Pending</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">15 Sep 2026</span>
              <span className="stat-label">Next Payment Due Date</span>
            </div>
          </div>
        </div>

        {/* Visual Payment Progress Gauge Card */}
        <div className="c1-card fee-progress-hero-card">
          <div className="fee-progress-left">
            <h3 className="progress-headline">Academic Fee Settlement Progress</h3>
            <p className="progress-subtext">
              You have settled <strong>₹{totalPaid.toLocaleString('en-IN')}</strong> of the total academic fee of <strong>₹{totalFees.toLocaleString('en-IN')}</strong>.
            </p>
            <div className="progress-summary-pills">
              <span className="summary-pill paid-pill">
                <span className="pill-dot"></span> Paid: ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="summary-pill pending-pill">
                <span className="pill-dot"></span> Pending: ₹{totalPending.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="fee-progress-right">
            <div className="fee-radial-wrap">
              <div className="fee-radial-percent">{paidPercentage}%</div>
              <span className="fee-radial-label">CLEARED</span>
            </div>
            <div className="progress-bar-large-track">
              <div className="progress-bar-large-fill" style={{ width: `${paidPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Fee Category Breakdown Table */}
        <div className="c1-card fee-table-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Fee Structure & Category Breakdown</h3>
              <p className="c1-card-subtitle">Approved annual fee components for B.Tech IV Year</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Term 2025–2026</span>
          </div>

          <div className="fee-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Fee Category</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Outstanding Balance</th>
                  <th>Due Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeBreakdown.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{item.category}</strong>
                    </td>
                    <td>₹{item.total.toLocaleString('en-IN')}</td>
                    <td><span style={{ color: 'var(--color-success)', fontWeight: 600 }}>₹{item.paid.toLocaleString('en-IN')}</span></td>
                    <td>
                      {item.pending > 0 ? (
                        <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>₹{item.pending.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-muted">₹0</span>
                      )}
                    </td>
                    <td>{item.dueDate}</td>
                    <td>
                      {item.status === 'Settled' ? (
                        <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Settled</span>
                      ) : item.status === 'Partial' ? (
                        <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-hourglass-half"></i> Partial</span>
                      ) : (
                        <span className="c1-badge c1-badge-error"><i className="fa-solid fa-circle-exclamation"></i> Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="c1-card fee-history-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Payment Transaction History</h3>
              <p className="c1-card-subtitle">Complete ledger of electronic tuition and institutional payments</p>
            </div>
            <span className="c1-badge c1-badge-success">{paymentHistory.length} Settled Transactions</span>
          </div>

          <div className="payment-history-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((txn) => (
                  <tr key={txn.id}>
                    <td>
                      <span className="course-code-cell">{txn.id}</span>
                    </td>
                    <td>{txn.date}</td>
                    <td>{txn.description}</td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>₹{txn.amount.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className="payment-method-chip">
                        <i className={`fa-solid ${txn.method === 'UPI' ? 'fa-qrcode' : txn.method === 'Net Banking' ? 'fa-building-columns' : 'fa-credit-card'}`}></i>
                        <span>{txn.method}</span>
                      </span>
                    </td>
                    <td>
                      <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> {txn.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => setActiveReceiptPayment(txn)}
                      >
                        <i className="fa-solid fa-receipt"></i>
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL 1: PAY FEES DEMO / DEVELOPMENT MODE DIALOG
            ============================================================ */}
        {isPayModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => !isProcessingPayment && setIsPayModalOpen(false)}
            title="Make Fee Payment"
            maxWidth="md"
          >
            <form onSubmit={handleExecutePayment} className="fee-pay-form">
              {/* Development Mode Notice Alert */}
              <div className="c1-alert c1-alert-info" role="alert">
                <i className="fa-solid fa-shield-halved"></i>
                <div style={{ fontSize: '0.8125rem' }}>
                  <strong>Development Mode Payment Simulation:</strong> This sandbox demonstrates the electronic payment settlement workflow. No real banking credentials or real money transfers will take place.
                </div>
              </div>

              {/* Amount Selection */}
              <div className="form-field-wrap">
                <label className="form-label">Amount to Pay (INR)</label>
                <div className="amount-input-box">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    className="c1-input amount-val-input"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Math.max(1, Math.min(totalPending, Number(e.target.value))))}
                    min={1}
                    max={totalPending}
                    disabled={isProcessingPayment}
                    required
                  />
                </div>
                <div className="amount-quick-chips">
                  <button
                    type="button"
                    className="quick-chip-btn"
                    onClick={() => setPayAmount(totalPending)}
                  >
                    Full Balance (₹{totalPending.toLocaleString('en-IN')})
                  </button>
                  {totalPending >= 10000 && (
                    <button
                      type="button"
                      className="quick-chip-btn"
                      onClick={() => setPayAmount(10000)}
                    >
                      Installment (₹10,000)
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="form-field-wrap">
                <label className="form-label">Select Payment Gateway / Method</label>
                <div className="pay-method-grid">
                  <button
                    type="button"
                    className={`pay-method-card ${selectedPayMethod === 'UPI' ? 'selected' : ''}`}
                    onClick={() => setSelectedPayMethod('UPI')}
                  >
                    <i className="fa-solid fa-qrcode method-icon"></i>
                    <span className="method-name">UPI / QR</span>
                    <span className="method-sub">GPay, PhonePe, Paytm</span>
                  </button>

                  <button
                    type="button"
                    className={`pay-method-card ${selectedPayMethod === 'Net Banking' ? 'selected' : ''}`}
                    onClick={() => setSelectedPayMethod('Net Banking')}
                  >
                    <i className="fa-solid fa-building-columns method-icon"></i>
                    <span className="method-name">Net Banking</span>
                    <span className="method-sub">All Major Banks</span>
                  </button>

                  <button
                    type="button"
                    className={`pay-method-card ${selectedPayMethod === 'Card' ? 'selected' : ''}`}
                    onClick={() => setSelectedPayMethod('Card')}
                  >
                    <i className="fa-solid fa-credit-card method-icon"></i>
                    <span className="method-name">Debit / Credit</span>
                    <span className="method-sub">Visa, Mastercard, RuPay</span>
                  </button>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsPayModalOpen(false)}
                  disabled={isProcessingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                  disabled={isProcessingPayment || payAmount <= 0}
                >
                  {isProcessingPayment ? (
                    <>
                      <LoadingSpinner size="sm" color="#ffffff" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock"></i>
                      <span>Confirm Pay ₹{payAmount.toLocaleString('en-IN')} (Demo)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: OFFICIAL FEE RECEIPT PREVIEW MODAL
            ============================================================ */}
        {activeReceiptPayment && (
          <Modal
            isOpen={true}
            onClose={() => setActiveReceiptPayment(null)}
            title={`Fee Receipt: ${activeReceiptPayment.id}`}
            maxWidth="md"
          >
            <div className="fee-receipt-document">
              <div className="receipt-header">
                <h2>CAMPUSONE INSTITUTION OF TECHNOLOGY</h2>
                <p>Finance & Accounts Division • Official Payment Acknowledgment</p>
                <span className="receipt-doc-tag">ELECTRONIC FEE RECEIPT</span>
              </div>

              <div className="receipt-info-grid">
                <div className="r-cell">
                  <span className="r-lbl">Transaction ID:</span>
                  <span className="r-val">{activeReceiptPayment.id}</span>
                </div>
                <div className="r-cell">
                  <span className="r-lbl">Payment Date:</span>
                  <span className="r-val">{activeReceiptPayment.date}</span>
                </div>
                <div className="r-cell">
                  <span className="r-lbl">Candidate Name:</span>
                  <span className="r-val">{user?.name || 'Aditya Sharma'}</span>
                </div>
                <div className="r-cell">
                  <span className="r-lbl">Student Roll No:</span>
                  <span className="r-val">236F1A0551</span>
                </div>
                <div className="r-cell">
                  <span className="r-lbl">Payment Mode:</span>
                  <span className="r-val">{activeReceiptPayment.method}</span>
                </div>
                <div className="r-cell">
                  <span className="r-lbl">Payment Status:</span>
                  <span className="r-val" style={{ color: '#16a34a', fontWeight: 800 }}>SUCCESSFUL (PAID)</span>
                </div>
              </div>

              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Term</th>
                    <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{activeReceiptPayment.description}</td>
                    <td>Semester 8 (2026)</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{activeReceiptPayment.amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan={2}><strong>Total Amount Received</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                      ₹{activeReceiptPayment.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="receipt-footer-stamp">
                <div className="stamp-box">
                  <i className="fa-solid fa-stamp"></i>
                  <span>CAMPUSONE ACCOUNTS VERIFIED</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>Finance Officer</span>
                </div>
              </div>

              <div className="modal-dialog-footer no-print">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setActiveReceiptPayment(null)}
                >
                  Close Receipt
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handlePrintReceipt}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Receipt</span>
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

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Campus Accommodation & Transport</h4>
            <p>Access your hostel room allocation details or view bus pickup schedules.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/hostel')}
            >
              <i className="fa-solid fa-hotel"></i>
              <span>Hostel Management</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/transport')}
            >
              <i className="fa-solid fa-bus"></i>
              <span>Campus Transport</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentFees;
