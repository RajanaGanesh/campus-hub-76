import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { servicesData, PaymentTransaction } from '../data/servicesData';

export const Fees: React.FC = () => {
  const { user } = useAuth();
  const studentName = user?.name || 'Aditya Sharma';

  // Fee state variables
  const [totalFees] = useState(85000);
  const [paidAmount, setPaidAmount] = useState(() => {
    try {
      const stored = localStorage.getItem('campushub_fees_paid');
      return stored ? parseInt(stored) : 72500;
    } catch {
      return 72500;
    }
  });

  const pendingAmount = totalFees - paidAmount;

  // Payments log state
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_fees_payments');
      return stored ? JSON.parse(stored) : servicesData.payments;
    } catch {
      return servicesData.payments;
    }
  });

  // Modal / Payment states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Wallet'>('UPI');
  const [payAmountInput, setPayAmountInput] = useState('12500');
  const [payError, setPayError] = useState<string | null>(null);

  // Active receipt state for printable view
  const [receiptData, setReceiptData] = useState<PaymentTransaction | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handlePayClick = () => {
    setPayAmountInput(pendingAmount.toString());
    setPayError(null);
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(payAmountInput);

    // Validations
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setPayError('Please enter a valid positive payment amount.');
      return;
    }
    if (parsedAmount > pendingAmount) {
      setPayError(`Payment amount cannot exceed the outstanding balance of ₹${pendingAmount.toLocaleString()}.`);
      return;
    }

    setPayError(null);

    // Generate transaction ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const transactionId = `CH2026PAY${randomDigits}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const newPayment: PaymentTransaction = {
      id: transactionId,
      date: todayStr,
      description: 'Tuition Fee Payment',
      amount: parsedAmount,
      method: payMethod,
      status: 'Paid'
    };

    // Update state
    const nextPaid = paidAmount + parsedAmount;
    const nextPayments = [newPayment, ...payments];

    setPaidAmount(nextPaid);
    setPayments(nextPayments);
    localStorage.setItem('campushub_fees_paid', nextPaid.toString());
    localStorage.setItem('campushub_fees_payments', JSON.stringify(nextPayments));

    setShowPayModal(false);
    setReceiptData(newPayment);
    setToastMsg('Payment completed successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Print Overlay CSS style rules */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 20px !important;
            box-shadow: none !important;
          }
          .print-section h2, .print-section h3, .print-section td, .print-section th, .print-section strong {
            color: black !important;
          }
          .print-section button, .print-section .btn-search-close {
            display: none !important;
          }
        }
      ` }} />

      {/* Fees Header */}
      <div className="dashboard-header">
        <h1>Fees & Payments</h1>
        <p>View your fee details, payment history, and upcoming dues.</p>
      </div>

      {/* Dues notification warning */}
      {pendingAmount > 0 ? (
        <div className="login-error-box" style={{ margin: 0, borderColor: 'rgba(255,178,54,0.3)', background: 'rgba(255,178,54,0.02)' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: '#ffb236' }}></i>
          <span style={{ color: '#ffb236' }}>
            <strong>Fee Payment Reminder:</strong> Your ₹{pendingAmount.toLocaleString()} fee payment is due on 30 Aug 2026.
          </span>
        </div>
      ) : (
        <div className="login-error-box" style={{ margin: 0, borderColor: 'rgba(0,216,154,0.3)', background: 'rgba(0,216,154,0.02)' }}>
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span style={{ color: '#00d89a' }}>
            <strong>Payment Status:</strong> All academic tuition balances have been settled for the current term.
          </span>
        </div>
      )}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div className="stat-card-value">₹{totalFees.toLocaleString()}</div>
          <div className="stat-card-desc">Total Fee Liability</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#00d89a' }}>₹{paidAmount.toLocaleString()}</div>
          <div className="stat-card-desc">Total Fees Paid</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <span className={`stat-card-trend ${pendingAmount > 0 ? 'critical' : 'safe'}`}>
              {pendingAmount > 0 ? 'Dues Pending' : 'No Dues'}
            </span>
          </div>
          <div className="stat-card-value" style={{ color: pendingAmount > 0 ? 'var(--color-error)' : 'white' }}>
            ₹{pendingAmount.toLocaleString()}
          </div>
          <div className="stat-card-desc">Pending Balance</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-calendar-day"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '15px', fontWeight: '800' }}>30 Aug 2026</div>
          <div className="stat-card-desc">Next Due Date</div>
        </div>
      </div>

      {/* Paid Progress bar panel */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Paid Progress ratio</span>
          <span>{Math.round((paidAmount / totalFees) * 100)}% Paid</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(paidAmount / totalFees) * 100}%`,
              height: '100%',
              background: '#00d89a',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>

      {/* Split grid: Breakdown on left, outstanding card on right */}
      <div className="dashboard-main-grid">
        {/* Fee breakdown list */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Academic Fees Breakdown</h3>
            <i className="fa-solid fa-list-ul" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {servicesData.fees.map((fee, idx) => (
              <div key={idx} className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span style={{ fontSize: '13.5px', color: 'white', fontWeight: '600' }}>{fee.category}</span>
                <span style={{ fontSize: '13.5px', fontWeight: '700' }}>₹{fee.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <span style={{ fontSize: '14px', color: 'white', fontWeight: '800' }}>Total Fee Amount</span>
              <span style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--accent-highlight)' }}>₹{totalFees.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Outstanding amount widget card */}
        <div className="card-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Outstanding Amount</h3>
              <i className="fa-solid fa-wallet" style={{ color: 'var(--text-secondary)' }}></i>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Current Balance</span>
              <strong style={{ fontSize: '32px', color: pendingAmount > 0 ? 'var(--color-error)' : '#00d89a', fontWeight: '900', display: 'block', marginTop: '6px' }}>
                ₹{pendingAmount.toLocaleString()}
              </strong>
              {pendingAmount > 0 ? (
                <span className="subject-att-status critical" style={{ fontSize: '9px', display: 'inline-block', marginTop: '8px' }}>
                  Payment Due by 30 Aug
                </span>
              ) : (
                <span className="subject-att-status safe" style={{ fontSize: '9px', display: 'inline-block', marginTop: '8px' }}>
                  Clear No Dues
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn-signin"
            style={{ width: '100%', height: '42px', margin: 0 }}
            onClick={handlePayClick}
            disabled={pendingAmount <= 0}
          >
            <i className="fa-solid fa-credit-card" style={{ marginRight: '8px' }}></i>
            Pay Now
          </button>
        </div>
      </div>

      {/* Payment transactions history */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Payment Transactions History</h3>
          <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Transaction ID</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Amount</th>
                <th style={{ padding: '12px' }}>Method</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: 'white' }}>{pay.id}</td>
                  <td style={{ padding: '12px' }}>{pay.date}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{pay.description}</td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>₹{pay.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{pay.method}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="subject-att-status safe" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                      {pay.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-retry-err"
                      style={{ margin: 0, padding: '4px 10px', fontSize: '11.5px' }}
                      onClick={() => setReceiptData(pay)}
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Now Demo payment modal */}
      {showPayModal && (
        <div className="search-modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '18px' }}>Fees Demo Payment Portal</h2>
              <button type="button" className="btn-search-close" onClick={() => setShowPayModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                <i className="fa-solid fa-shield-halved"></i>
                <span>
                  <strong>Demo Mode Safeguard:</strong> This is a mock payment sandbox. Please do NOT supply any real credit cards or bank passwords.
                </span>
              </div>

              {payError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{payError}</span>
                </div>
              )}

              <form onSubmit={handleConfirmPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="pay-amt" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Outstanding Balance Due</label>
                  <strong style={{ fontSize: '20px', color: 'white', display: 'block' }}>₹{pendingAmount.toLocaleString()}</strong>
                </div>

                <div className="form-group">
                  <label htmlFor="pay-input" style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Payment Amount (₹)</label>
                  <input
                    id="pay-input"
                    type="number"
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>Select Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {(['UPI', 'Card', 'Net Banking', 'Wallet'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`btn-sso ${payMethod === m ? 'active' : ''}`}
                        onClick={() => setPayMethod(m)}
                        style={{
                          height: '36px',
                          fontSize: '12px',
                          background: payMethod === m ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)',
                          borderColor: payMethod === m ? 'var(--accent-primary)' : 'var(--border-color)'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-signin"
                  style={{ height: '42px', fontSize: '13.5px', marginTop: '10px', marginInline: 0 }}
                >
                  Confirm Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt / Invoicing Modal */}
      {receiptData && (
        <div className="search-modal-overlay" onClick={() => setReceiptData(null)}>
          <div className="search-modal-card print-section" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-highlight)', fontWeight: '800' }}>CAMPUS HUB</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>Payment Receipt</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setReceiptData(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Student Name:</span> <strong style={{ color: 'white' }}>{studentName}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Student ID:</span> <strong style={{ color: 'white' }}>236F1A0551</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span> <strong style={{ color: 'var(--accent-highlight)' }}>{receiptData.id}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Payment Date:</span> <strong style={{ color: 'white' }}>{receiptData.date}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span> <strong style={{ color: 'white' }}>{receiptData.method}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Amount Settled:</span>
                  <strong style={{ color: '#00d89a', fontSize: '15px' }}>₹{receiptData.amount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className="subject-att-status safe" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{receiptData.status}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0 }}
                  onClick={() => setReceiptData(null)}
                >
                  Close Receipt
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '38px' }}
                  onClick={handlePrint}
                >
                  <i className="fa-solid fa-print" style={{ marginRight: '6px' }}></i> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Fees;
