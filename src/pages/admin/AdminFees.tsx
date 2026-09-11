import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, StudentRecord } from '../../data/managementData';
import { dbService } from '../../services/dbService';
import { supabase } from '../../lib/supabase';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export interface StudentFeeItem {
  id: string; // Student ID e.g. 236F1A0551
  name: string;
  department: string;
  year: string;
  section: string;
  email: string;
  phone: string;
  totalBilled: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'Settled' | 'Partial' | 'Pending';
  lastPaymentDate?: string;
  lastPaymentMode?: string;
  breakdown: {
    category: string;
    billed: number;
    paid: number;
    pending: number;
  }[];
}

export interface FeeTransactionRecord {
  id: string; // e.g. TXN-8901
  studentId: string;
  studentName: string;
  studentDisplay: string; // "Aditya Sharma (236F1A0551)"
  department: string;
  amount: number;
  amountFormatted: string; // "₹42,500"
  method: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
  referenceNo?: string;
  component?: string;
}

const STORAGE_STUDENT_FEES_KEY = 'campushub_admin_student_fee_reports';
const STORAGE_TRANSACTIONS_KEY = 'campushub_admin_fee_transactions';

// Pre-configured Baseline Transactions
const INITIAL_TRANSACTIONS: FeeTransactionRecord[] = [
  { id: 'TXN-8901', studentId: '236F1A0551', studentName: 'Aditya Sharma', studentDisplay: 'Aditya Sharma (236F1A0551)', department: 'CSE', amount: 42500, amountFormatted: '₹42,500', method: 'UPI / HDFC NetBanking', date: '18 Aug 2026', status: 'Success', component: 'Tuition Fee Installment 2', referenceNo: 'HDFC982104523' },
  { id: 'TXN-8902', studentId: '236F1A0552', studentName: 'Sneha Patel', studentDisplay: 'Sneha Patel (236F1A0552)', department: 'CSE', amount: 42500, amountFormatted: '₹42,500', method: 'Credit Card', date: '17 Aug 2026', status: 'Success', component: 'Academic Instruction Fee', referenceNo: 'AXIS772184910' },
  { id: 'TXN-8903', studentId: '236F1A0553', studentName: 'Rohan Gupta', studentDisplay: 'Rohan Gupta (236F1A0553)', department: 'ECE', amount: 42500, amountFormatted: '₹42,500', method: 'Debit Card', date: '17 Aug 2026', status: 'Success', component: 'Tuition Fee Installment 1', referenceNo: 'ICIC554109823' },
  { id: 'TXN-8904', studentId: '236F1A0554', studentName: 'Pooja Reddy', studentDisplay: 'Pooja Reddy (236F1A0554)', department: 'IT', amount: 42500, amountFormatted: '₹42,500', method: 'UPI / Razorpay', date: '16 Aug 2026', status: 'Success', component: 'Academic Fee Installment', referenceNo: 'RAZPAY33419082' },
  { id: 'TXN-8905', studentId: '236F1A0502', studentName: 'Arun Kumar', studentDisplay: 'Arun Kumar (236F1A0502)', department: 'CSE', amount: 42500, amountFormatted: '₹42,500', method: 'UPI / GooglePay', date: '18 Aug 2026', status: 'Success', component: 'Tuition & Lab Fee Settle', referenceNo: 'GPAY998231405' },
  { id: 'TXN-8906', studentId: '236F1A0503', studentName: 'Amit Patel', studentDisplay: 'Amit Patel (236F1A0503)', department: 'CSE', amount: 42500, amountFormatted: '₹42,500', method: 'Debit Card / Axis Bank', date: '15 Aug 2026', status: 'Success', component: 'Tuition Fee Installment 1', referenceNo: 'AXIS881903421' },
  { id: 'TXN-8907', studentId: '236F1A0412', studentName: 'Rahul Kumar', studentDisplay: 'Rahul Kumar (236F1A0412)', department: 'ECE', amount: 40000, amountFormatted: '₹40,000', method: 'NetBanking / ICICI', date: '14 Aug 2026', status: 'Success', component: 'Semester 8 Tuition Advance', referenceNo: 'ICIC662094182' },
  { id: 'TXN-8908', studentId: '236F1A0522', studentName: 'Priya Reddy', studentDisplay: 'Priya Reddy (236F1A0522)', department: 'CSE', amount: 42500, amountFormatted: '₹42,500', method: 'UPI / PhonePe', date: '17 Aug 2026', status: 'Success', component: 'Tuition & Amenities Balance', referenceNo: 'PHONEPE4401928' }
];

// Department Ledger Data
const DEPT_FEE_LEDGER = [
  { dept: 'Computer Science & Engineering', billed: '₹54,00,000', collected: '₹50,40,000', pending: '₹3,60,000', rate: 93 },
  { dept: 'Electronics & Communication', billed: '₹42,00,000', collected: '₹38,60,000', pending: '₹3,40,000', rate: 92 },
  { dept: 'Information Technology', billed: '₹33,00,000', collected: '₹30,80,000', pending: '₹2,20,000', rate: 93 },
  { dept: 'Artificial Intelligence & Data Science', billed: '₹24,00,000', collected: '₹22,80,000', pending: '₹1,20,000', rate: 95 },
  { dept: 'Mechanical Engineering', billed: '₹24,00,000', collected: '₹21,60,000', pending: '₹2,40,000', rate: 90 },
  { dept: 'Civil Engineering', billed: '₹23,00,000', collected: '₹20,00,000', pending: '₹3,00,000', rate: 87 }
];

export const AdminFees: React.FC = () => {
  // Toast Notification state
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Student directory source from management data & remote sync
  const [adminStudents, setAdminStudents] = useState<StudentRecord[]>(() => getManagementData().students);

  // Sync students from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        if (!supabase) return;
        const remote = await dbService.getStudents();
        if (isMounted && remote && remote.length > 0) {
          setAdminStudents(remote);
        }
      } catch (err) {
        console.warn('Could not sync remote students for fees:', err);
      }
    };
    fetchRemote();

    const handleStorage = () => {
      setAdminStudents(getManagementData().students);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('campushub_management_updated', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('campushub_management_updated', handleStorage);
    };
  }, []);

  // Transactions State
  const [transactions, setTransactions] = useState<FeeTransactionRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  // Student Fee Reports State
  const [studentFeeReports, setStudentFeeReports] = useState<StudentFeeItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_STUDENT_FEES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Build / Merge comprehensive Fee Reports for all students in the Admin Portal
  useEffect(() => {
    const defaultFeesMap: Record<string, { totalBilled: number; paidAmount: number; pendingAmount: number; status: 'Settled' | 'Partial' | 'Pending'; lastPaymentDate: string; lastPaymentMode: string }> = {
      '236F1A0551': { totalBilled: 85000, paidAmount: 85000, pendingAmount: 0, status: 'Settled', lastPaymentDate: '18 Aug 2026', lastPaymentMode: 'UPI / HDFC NetBanking' },
      '236F1A0502': { totalBilled: 85000, paidAmount: 85000, pendingAmount: 0, status: 'Settled', lastPaymentDate: '18 Aug 2026', lastPaymentMode: 'UPI / GooglePay' },
      '236F1A0503': { totalBilled: 85000, paidAmount: 42500, pendingAmount: 42500, status: 'Partial', lastPaymentDate: '15 Aug 2026', lastPaymentMode: 'Debit Card / Axis Bank' },
      '236F1A0412': { totalBilled: 80000, paidAmount: 40000, pendingAmount: 40000, status: 'Partial', lastPaymentDate: '14 Aug 2026', lastPaymentMode: 'NetBanking / ICICI' },
      '236F1A0522': { totalBilled: 85000, paidAmount: 85000, pendingAmount: 0, status: 'Settled', lastPaymentDate: '17 Aug 2026', lastPaymentMode: 'UPI / PhonePe' },
      '236F1A0552': { totalBilled: 85000, paidAmount: 42500, pendingAmount: 42500, status: 'Partial', lastPaymentDate: '17 Aug 2026', lastPaymentMode: 'Credit Card' },
      '236F1A0553': { totalBilled: 80000, paidAmount: 42500, pendingAmount: 37500, status: 'Partial', lastPaymentDate: '17 Aug 2026', lastPaymentMode: 'Debit Card' },
      '236F1A0554': { totalBilled: 85000, paidAmount: 42500, pendingAmount: 42500, status: 'Partial', lastPaymentDate: '16 Aug 2026', lastPaymentMode: 'UPI / Razorpay' }
    };

    // Ensure all registered admin students are included
    const allStudentsList: StudentRecord[] = [...adminStudents];
    
    // Add extra baseline students if not yet present in roster
    const extraKnown = [
      { id: '236F1A0552', name: 'Sneha Patel', department: 'CSE', year: 'IV Year', section: 'A', cgpa: 8.7, email: 'sneha@campushub.com', phone: '+91 9876543206', status: 'Active' as const, attendancePercent: 92, assignmentsCompleted: 2, performance: 'Excellent' as const },
      { id: '236F1A0553', name: 'Rohan Gupta', department: 'ECE', year: 'IV Year', section: 'B', cgpa: 8.2, email: 'rohan@campushub.com', phone: '+91 9876543207', status: 'Active' as const, attendancePercent: 86, assignmentsCompleted: 1, performance: 'Good' as const },
      { id: '236F1A0554', name: 'Pooja Reddy', department: 'IT', year: 'IV Year', section: 'A', cgpa: 8.8, email: 'pooja@campushub.com', phone: '+91 9876543208', status: 'Active' as const, attendancePercent: 94, assignmentsCompleted: 2, performance: 'Excellent' as const }
    ];

    extraKnown.forEach(ex => {
      if (!allStudentsList.some(s => s.id.toUpperCase() === ex.id.toUpperCase())) {
        allStudentsList.push(ex);
      }
    });

    setStudentFeeReports(prev => {
      const merged: StudentFeeItem[] = allStudentsList.map(stu => {
        const existing = prev.find(p => p.id.toUpperCase() === stu.id.toUpperCase());
        if (existing) {
          return {
            ...existing,
            name: stu.name,
            department: stu.department,
            year: stu.year,
            section: stu.section || 'A',
            email: stu.email,
            phone: stu.phone
          };
        }

        const preset = defaultFeesMap[stu.id] || {
          totalBilled: 85000,
          paidAmount: 42500,
          pendingAmount: 42500,
          status: 'Partial' as const,
          lastPaymentDate: '15 Aug 2026',
          lastPaymentMode: 'UPI / Online Gateway'
        };

        const totalBilled = preset.totalBilled ?? 85000;
        const paidAmount = preset.paidAmount ?? 42500;
        const pendingAmount = totalBilled - paidAmount;
        const status: 'Settled' | 'Partial' | 'Pending' = pendingAmount <= 0 ? 'Settled' : (paidAmount > 0 ? 'Partial' : 'Pending');

        const tuitionBilled = Math.round(totalBilled * 0.7);
        const labBilled = Math.round(totalBilled * 0.1);
        const libBilled = Math.round(totalBilled * 0.06);
        const amenBilled = totalBilled - tuitionBilled - labBilled - libBilled;

        const tuitionPaid = Math.min(tuitionBilled, paidAmount);
        const remainingAfterTuition = Math.max(0, paidAmount - tuitionBilled);
        const labPaid = Math.min(labBilled, remainingAfterTuition);
        const remainingAfterLab = Math.max(0, remainingAfterTuition - labBilled);
        const libPaid = Math.min(libBilled, remainingAfterLab);
        const amenPaid = Math.max(0, remainingAfterLab - libBilled);

        return {
          id: stu.id,
          name: stu.name,
          department: stu.department,
          year: stu.year,
          section: stu.section || 'A',
          email: stu.email,
          phone: stu.phone,
          totalBilled,
          paidAmount,
          pendingAmount,
          dueDate: '15 Sep 2026',
          status,
          lastPaymentDate: preset.lastPaymentDate || '16 Aug 2026',
          lastPaymentMode: preset.lastPaymentMode || 'UPI / Online Gateway',
          breakdown: [
            { category: 'Tuition Fee (Annual / Term)', billed: tuitionBilled, paid: tuitionPaid, pending: tuitionBilled - tuitionPaid },
            { category: 'Computing, Lab & Facilities', billed: labBilled, paid: labPaid, pending: labBilled - labPaid },
            { category: 'Digital Library & Research Resources', billed: libBilled, paid: libPaid, pending: libBilled - libPaid },
            { category: 'Campus Amenities & Student Welfare', billed: amenBilled, paid: amenPaid, pending: amenBilled - amenPaid }
          ]
        };
      });

      try {
        localStorage.setItem(STORAGE_STUDENT_FEES_KEY, JSON.stringify(merged));
      } catch {}
      return merged;
    });
  }, [adminStudents]);

  // Persist transactions on update
  const saveTransactionsState = (updatedTxns: FeeTransactionRecord[]) => {
    setTransactions(updatedTxns);
    try {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(updatedTxns));
    } catch {}
    window.dispatchEvent(new Event('storage'));
  };

  const saveStudentFeesState = (updatedReports: StudentFeeItem[]) => {
    setStudentFeeReports(updatedReports);
    try {
      localStorage.setItem(STORAGE_STUDENT_FEES_KEY, JSON.stringify(updatedReports));
    } catch {}
    window.dispatchEvent(new Event('storage'));
  };

  // Search and Filter states for Student Fee Reports Table
  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Search for Transactions Log Table
  const [txnSearch, setTxnSearch] = useState('');

  // Modals state
  const [viewingStatementStudent, setViewingStatementStudent] = useState<StudentFeeItem | null>(null);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<FeeTransactionRecord | null>(null);

  // Deletion Modal States
  const [deletingTransaction, setDeletingTransaction] = useState<FeeTransactionRecord | null>(null);
  const [deletingStudentFee, setDeletingStudentFee] = useState<StudentFeeItem | null>(null);

  // Form State for Recording Payment
  const [payStudentId, setPayStudentId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(42500);
  const [payMethod, setPayMethod] = useState('UPI / Razorpay');
  const [payReference, setPayReference] = useState('');
  const [payComponent, setPayComponent] = useState('Tuition Fee (Sem 8)');
  const [payDate, setPayDate] = useState('18 Aug 2026');
  const [payNotes, setPayNotes] = useState('');

  // Open Record Payment Modal for a specific student
  const handleOpenRecordPayment = (student?: StudentFeeItem) => {
    const target = student || studentFeeReports[0];
    if (target) {
      setPayStudentId(target.id);
      setPayAmount(target.pendingAmount > 0 ? target.pendingAmount : 42500);
      setPayReference(`UTR-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setPayNotes(`Fee settlement for ${target.name} (${target.id})`);
    }
    setIsRecordPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payStudentId) {
      showToast('Please select a student candidate.', 'error');
      return;
    }
    if (!payAmount || payAmount <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    const targetStudent = studentFeeReports.find(s => s.id === payStudentId);
    if (!targetStudent) {
      showToast('Student not found in registry.', 'error');
      return;
    }

    const newTxnId = `TXN-${Math.floor(8900 + Math.random() * 999)}`;
    const newTxn: FeeTransactionRecord = {
      id: newTxnId,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      studentDisplay: `${targetStudent.name} (${targetStudent.id})`,
      department: targetStudent.department,
      amount: Number(payAmount),
      amountFormatted: `₹${Number(payAmount).toLocaleString('en-IN')}`,
      method: payMethod,
      date: payDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Success',
      referenceNo: payReference || `REF-${Date.now().toString().slice(-8)}`,
      component: payComponent
    };

    // 1. Update Student Fee Ledger
    const updatedReports = studentFeeReports.map(s => {
      if (s.id === targetStudent.id) {
        const newPaid = s.paidAmount + Number(payAmount);
        const newPending = Math.max(0, s.totalBilled - newPaid);
        const newStatus: 'Settled' | 'Partial' | 'Pending' = newPending <= 0 ? 'Settled' : 'Partial';

        // Update category breakdown
        const updatedBreakdown = s.breakdown.map(b => {
          if (b.pending > 0) {
            const alloc = Math.min(b.pending, Number(payAmount));
            return {
              ...b,
              paid: b.paid + alloc,
              pending: Math.max(0, b.pending - alloc)
            };
          }
          return b;
        });

        return {
          ...s,
          paidAmount: newPaid,
          pendingAmount: newPending,
          status: newStatus,
          lastPaymentDate: newTxn.date,
          lastPaymentMode: newTxn.method,
          breakdown: updatedBreakdown
        };
      }
      return s;
    });

    saveStudentFeesState(updatedReports);

    // 2. Prepend to Recent Transactions Log
    const updatedTxns = [newTxn, ...transactions];
    saveTransactionsState(updatedTxns);

    setIsRecordPaymentModalOpen(false);
    showToast(`Payment of ₹${Number(payAmount).toLocaleString('en-IN')} recorded for ${targetStudent.name} (${newTxnId})!`, 'success');
  };

  // Handle Delete Fee Transaction & Recalculate Balance
  const handleConfirmDeleteTransaction = () => {
    if (!deletingTransaction) return;

    const targetTxn = deletingTransaction;
    const updatedTxns = transactions.filter(t => t.id !== targetTxn.id);
    saveTransactionsState(updatedTxns);

    // Revert student's fee ledger if found
    const updatedReports = studentFeeReports.map(s => {
      if (s.id.toUpperCase() === targetTxn.studentId.toUpperCase()) {
        const revertedPaid = Math.max(0, s.paidAmount - targetTxn.amount);
        const newPending = Math.max(0, s.totalBilled - revertedPaid);
        const newStatus: 'Settled' | 'Partial' | 'Pending' = newPending <= 0 ? 'Settled' : (revertedPaid > 0 ? 'Partial' : 'Pending');

        return {
          ...s,
          paidAmount: revertedPaid,
          pendingAmount: newPending,
          status: newStatus
        };
      }
      return s;
    });
    saveStudentFeesState(updatedReports);

    setDeletingTransaction(null);
    showToast(`Transaction ${targetTxn.id} deleted. Student fee balance has been recalculated.`, 'success');
  };

  // Handle Delete Student Fee Record
  const handleConfirmDeleteStudentFee = () => {
    if (!deletingStudentFee) return;

    const targetStu = deletingStudentFee;
    const updatedReports = studentFeeReports.filter(s => s.id !== targetStu.id);
    saveStudentFeesState(updatedReports);

    setDeletingStudentFee(null);
    showToast(`Fee report record for ${targetStu.name} (${targetStu.id}) has been removed.`, 'success');
  };

  // Filtered Student Fee Reports
  const filteredStudents = useMemo(() => {
    return studentFeeReports.filter(stu => {
      const matchesSearch =
        stu.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        stu.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
        stu.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        stu.department.toLowerCase().includes(studentSearch.toLowerCase());

      const matchesDept = deptFilter === 'All' || stu.department.toUpperCase() === deptFilter.toUpperCase();
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Settled' && stu.status === 'Settled') ||
        (statusFilter === 'Partial' && stu.status === 'Partial') ||
        (statusFilter === 'Pending' && stu.status === 'Pending');

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [studentFeeReports, studentSearch, deptFilter, statusFilter]);

  // Filtered Transactions Log
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const term = txnSearch.toLowerCase();
      return (
        tx.id.toLowerCase().includes(term) ||
        tx.studentDisplay.toLowerCase().includes(term) ||
        tx.studentName.toLowerCase().includes(term) ||
        tx.studentId.toLowerCase().includes(term) ||
        tx.method.toLowerCase().includes(term) ||
        (tx.referenceNo && tx.referenceNo.toLowerCase().includes(term))
      );
    });
  }, [transactions, txnSearch]);

  // Dynamic Overall Aggregate KPIs
  const totalInvoiced = studentFeeReports.reduce((sum, s) => sum + s.totalBilled, 0);
  const totalCollected = studentFeeReports.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalPending = studentFeeReports.reduce((sum, s) => sum + s.pendingAmount, 0);
  const realizationPercent = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 92;

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Department', 'Year', 'Total Invoiced (INR)', 'Paid (INR)', 'Pending (INR)', 'Status', 'Due Date', 'Last Payment Date', 'Last Payment Mode'];
    const rows = filteredStudents.map(s => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.year}"`,
      s.totalBilled,
      s.paidAmount,
      s.pendingAmount,
      `"${s.status}"`,
      `"${s.dueDate}"`,
      `"${s.lastPaymentDate || 'N/A'}"`,
      `"${s.lastPaymentMode || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusHub_Student_Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Comprehensive student fee reports exported to CSV successfully.', 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header Row */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Fee Management & Reports</span>
            </div>
            <h1 className="module-title">Institutional Fee Management & Student Reports</h1>
            <p className="module-subtitle">
              Monitor university tuition collection rates, departmental ledgers, student fee reports, online payment gateways, and pending balances.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleExportCSV}
            >
              <i className="fa-solid fa-file-arrow-down"></i>
              <span>Export Fee Report (CSV)</span>
            </button>

            <button
              type="button"
              className="c1-btn"
              onClick={() => handleOpenRecordPayment()}
              style={{ background: '#0284c7', color: '#ffffff' }}
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Record Fee Settlement</span>
            </button>

            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast(`Automated payment reminder notifications dispatched to ${studentFeeReports.filter(s => s.pendingAmount > 0).length} students with outstanding balances.`, 'success')}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Send Reminders</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1' }}>
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">₹{(totalInvoiced / 100000).toFixed(2)} Lakhs</span>
              <span className="stat-label">Total Invoiced Fees ({studentFeeReports.length} Students)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a' }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#16a34a' }}>₹{(totalCollected / 100000).toFixed(2)} Lakhs</span>
              <span className="stat-label">Realized Revenue ({realizationPercent}%)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(217, 119, 6, 0.12)', color: '#d97706' }}>
              <i className="fa-solid fa-hourglass-half"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#d97706' }}>₹{(totalPending / 100000).toFixed(2)} Lakhs</span>
              <span className="stat-label">Pending Collection ({studentFeeReports.filter(s => s.pendingAmount > 0).length} Due)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#0284c7' }}>98.4%</span>
              <span className="stat-label">Online Gateway Success</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PRIMARY SECTION: STUDENT-WISE FEE REPORTS & INVOICING DIRECTORY
            ========================================================================= */}
        <div className="c1-card student-roster-card" style={{ marginBottom: '28px' }}>
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="c1-card-title">Student Fee Invoicing & Ledger Directory</h3>
                <span className="c1-badge c1-badge-primary">{filteredStudents.length} Students Listed</span>
              </div>
              <p className="c1-card-subtitle">Real-time fee billing, payment realization, and outstanding balances for all registered students</p>
            </div>

            {/* Filter Bar Controls */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', width: '240px' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }}></i>
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="c1-form-input"
                  style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px' }}
                />
              </div>

              {/* Department Select */}
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="c1-form-select"
                style={{ width: 'auto', padding: '8px 12px' }}
              >
                <option value="All">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="IT">IT</option>
                <option value="AI&DS">AI & DS</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="c1-form-select"
                style={{ width: 'auto', padding: '8px 12px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Settled">Settled (100% Paid)</option>
                <option value="Partial">Partial Payment</option>
                <option value="Pending">Pending / Overdue</option>
              </select>
            </div>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department & Year</th>
                  <th>Total Invoiced</th>
                  <th>Collected / Paid</th>
                  <th>Pending Balance</th>
                  <th>Realization %</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      <i className="fa-solid fa-user-xmark" style={{ fontSize: '28px', marginBottom: '8px', display: 'block' }}></i>
                      No student fee reports match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu) => {
                    const pct = stu.totalBilled > 0 ? Math.round((stu.paidAmount / stu.totalBilled) * 100) : 0;
                    return (
                      <tr key={stu.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '13px',
                                flexShrink: 0
                              }}
                            >
                              {stu.name.charAt(0)}
                            </div>
                            <div>
                              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '13.5px' }}>{stu.name}</strong>
                              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>{stu.id}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stu.department}</span>
                          <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-secondary)' }}>{stu.year}</span>
                        </td>

                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>₹{stu.totalBilled.toLocaleString('en-IN')}</strong>
                        </td>

                        <td>
                          <strong style={{ color: '#16a34a' }}>₹{stu.paidAmount.toLocaleString('en-IN')}</strong>
                          {stu.lastPaymentDate && (
                            <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Last: {stu.lastPaymentDate}</span>
                          )}
                        </td>

                        <td>
                          {stu.pendingAmount > 0 ? (
                            <strong style={{ color: '#d97706' }}>₹{stu.pendingAmount.toLocaleString('en-IN')}</strong>
                          ) : (
                            <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>₹0 (Cleared)</span>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '90px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600 }}>
                              <span style={{ color: pct >= 100 ? '#16a34a' : '#0284c7' }}>{pct}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, pct)}%`,
                                  height: '100%',
                                  background: pct >= 100 ? '#16a34a' : 'linear-gradient(90deg, #0284c7, #6366f1)',
                                  borderRadius: '3px'
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          {stu.status === 'Settled' ? (
                            <span className="c1-badge c1-badge-success">
                              <i className="fa-solid fa-circle-check"></i> Settled
                            </span>
                          ) : stu.status === 'Partial' ? (
                            <span className="c1-badge c1-badge-warning">
                              <i className="fa-solid fa-circle-half-stroke"></i> Partial
                            </span>
                          ) : (
                            <span className="c1-badge c1-badge-error">
                              <i className="fa-solid fa-clock"></i> Pending
                            </span>
                          )}
                        </td>

                        <td>
                          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{stu.dueDate}</span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            {/* View Statement */}
                            <button
                              type="button"
                              title="View Fee Statement & Invoice Breakdown"
                              onClick={() => setViewingStatementStudent(stu)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                color: '#0369a1',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fa-solid fa-file-lines"></i> Statement
                            </button>

                            {/* Record Payment */}
                            <button
                              type="button"
                              title="Record Offline / Gateway Fee Payment"
                              onClick={() => handleOpenRecordPayment(stu)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#15803d',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <i className="fa-solid fa-credit-card"></i> Pay
                            </button>

                            {/* Send Reminder */}
                            {stu.pendingAmount > 0 && (
                              <button
                                type="button"
                                title="Send Payment Reminder Notification"
                                onClick={() => showToast(`Payment reminder sent to ${stu.name} (${stu.email}) for pending balance of ₹${stu.pendingAmount.toLocaleString('en-IN')}.`, 'info')}
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: '#fffbeb',
                                  border: '1px solid #fde68a',
                                  color: '#b45309',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                <i className="fa-regular fa-bell"></i>
                              </button>
                            )}

                            {/* Delete Student Fee Record */}
                            <button
                              type="button"
                              title="Delete Student Fee Record"
                              onClick={() => setDeletingStudentFee(stu)}
                              style={{
                                padding: '6px 8px',
                                borderRadius: '6px',
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            SECONDARY SECTION: DEPARTMENT TUITION REALIZATION LEDGER
            ========================================================================= */}
        <div className="c1-card student-roster-card" style={{ marginBottom: '28px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Department Tuition Realization Ledger</h3>
              <p className="c1-card-subtitle">Collection percentage and outstanding balance by engineering school</p>
            </div>
            <span className="c1-badge c1-badge-primary">Term 2025–2026</span>
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
                {DEPT_FEE_LEDGER.map((d) => (
                  <tr key={d.dept}>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{d.dept}</strong></td>
                    <td>{d.billed}</td>
                    <td><strong style={{ color: '#16a34a' }}>{d.collected}</strong></td>
                    <td><strong style={{ color: '#d97706' }}>{d.pending}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, color: '#0284c7', minWidth: '35px' }}>{d.rate}%</span>
                        <div style={{ height: '6px', width: '100px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${d.rate}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #16a34a)', borderRadius: '3px' }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            TERTIARY SECTION: RECENT FEE SETTLEMENTS & GATEWAY LOGS
            ========================================================================= */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 className="c1-card-title">Recent Fee Settlements & Gateway Logs</h3>
              <p className="c1-card-subtitle">Live university payment receipts and transaction records for enrolled students</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}></i>
                <input
                  type="text"
                  placeholder="Filter transactions..."
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  className="c1-form-input"
                  style={{ paddingLeft: '30px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12.5px' }}
                />
              </div>
              <span className="c1-badge c1-badge-success">
                <i className="fa-solid fa-shield-halved"></i> Razorpay / UPI Verified
              </span>
            </div>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>TRANSACTION REF</th>
                  <th>STUDENT CANDIDATE</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT MODE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="course-code-cell" style={{ fontWeight: 700, color: '#0284c7' }}>
                        {tx.id}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{tx.studentDisplay}</strong>
                      {tx.component && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tx.component}</span>}
                    </td>
                    <td>
                      <strong style={{ color: '#0284c7', fontSize: '14px' }}>{tx.amountFormatted}</strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)' }}>{tx.method}</span>
                      {tx.referenceNo && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                          Ref: {tx.referenceNo}
                        </span>
                      )}
                    </td>
                    <td>{tx.date}</td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        <i className="fa-solid fa-circle-check"></i> {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(tx)}
                          title="View Official Digital Voucher"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <i className="fa-solid fa-receipt"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingTransaction(tx)}
                          title="Delete Transaction & Revert Balance"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#e11d48',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            MODAL 1: VIEW STUDENT STATEMENT & INVOICE BREAKDOWN
            ========================================================================= */}
        {viewingStatementStudent && (
          <Modal
            isOpen={!!viewingStatementStudent}
            onClose={() => setViewingStatementStudent(null)}
            title={`Fee Invoice & Statement: ${viewingStatementStudent.name}`}
            maxWidth="lg"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Institutional Invoice Ref: CMS-INV-2026-{viewingStatementStudent.id}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => {
                      window.print();
                    }}
                  >
                    <i className="fa-solid fa-print"></i> Print Statement
                  </button>
                  <button
                    type="button"
                    className="c1-btn"
                    style={{ background: '#0284c7', color: '#ffffff' }}
                    onClick={() => {
                      const s = viewingStatementStudent;
                      setViewingStatementStudent(null);
                      handleOpenRecordPayment(s);
                    }}
                  >
                    <i className="fa-solid fa-credit-card"></i> Record Settle Payment
                  </button>
                </div>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Summary */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Candidate Name</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '15px' }}>{viewingStatementStudent.name}</strong>
                  <span style={{ fontSize: '12px', color: '#0284c7', fontFamily: 'monospace' }}>{viewingStatementStudent.id}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Department & Term</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{viewingStatementStudent.department}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{viewingStatementStudent.year} • Sec {viewingStatementStudent.section}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoiced</span>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '16px' }}>₹{viewingStatementStudent.totalBilled.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Outstanding Dues</span>
                  <strong style={{ display: 'block', color: viewingStatementStudent.pendingAmount > 0 ? '#d97706' : '#16a34a', fontSize: '16px' }}>
                    ₹{viewingStatementStudent.pendingAmount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Itemized Fee Breakdown Table */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-list-check" style={{ color: '#0284c7' }}></i>
                  Itemized Institutional Fee Structure
                </h4>
                <table className="c1-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Fee Component</th>
                      <th>Billed Amount</th>
                      <th>Paid Amount</th>
                      <th>Pending Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingStatementStudent.breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong style={{ color: 'var(--text-primary)' }}>{item.category}</strong></td>
                        <td>₹{item.billed.toLocaleString('en-IN')}</td>
                        <td><strong style={{ color: '#16a34a' }}>₹{item.paid.toLocaleString('en-IN')}</strong></td>
                        <td><strong style={{ color: item.pending > 0 ? '#d97706' : '#64748b' }}>₹{item.pending.toLocaleString('en-IN')}</strong></td>
                        <td>
                          {item.pending === 0 ? (
                            <span className="c1-badge c1-badge-success">Paid</span>
                          ) : item.paid > 0 ? (
                            <span className="c1-badge c1-badge-warning">Partial</span>
                          ) : (
                            <span className="c1-badge c1-badge-error">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Records for this Student */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: '#16a34a' }}></i>
                  Transaction History & Official Receipts
                </h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="c1-table" style={{ fontSize: '12.5px' }}>
                    <thead>
                      <tr>
                        <th>Receipt ID</th>
                        <th>Component</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(t => t.studentId.toUpperCase() === viewingStatementStudent.id.toUpperCase())
                        .map(t => (
                          <tr key={t.id}>
                            <td><span className="course-code-cell" style={{ color: '#0284c7' }}>{t.id}</span></td>
                            <td>{t.component || 'Tuition Fee Installment'}</td>
                            <td><strong style={{ color: '#0284c7' }}>{t.amountFormatted}</strong></td>
                            <td>{t.method}</td>
                            <td>{t.date}</td>
                            <td>
                              <span className="c1-badge c1-badge-success"><i className="fa-solid fa-check"></i> {t.status}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* =========================================================================
            MODAL 2: RECORD OFFLINE / GATEWAY PAYMENT
            ========================================================================= */}
        {isRecordPaymentModalOpen && (
          <Modal
            isOpen={isRecordPaymentModalOpen}
            onClose={() => setIsRecordPaymentModalOpen(false)}
            title="Record Fee Settlement / Offline Payment"
            maxWidth="md"
          >
            <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Select Student */}
              <div className="c1-form-group">
                <label className="c1-form-label">
                  Student Candidate <span className="required">*</span>
                </label>
                <select
                  className="c1-form-select"
                  value={payStudentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setPayStudentId(sid);
                    const stu = studentFeeReports.find(s => s.id === sid);
                    if (stu) {
                      setPaymentTargetStudent(stu);
                      setPayAmount(stu.pendingAmount > 0 ? stu.pendingAmount : 42500);
                    }
                  }}
                  required
                >
                  {studentFeeReports.map(stu => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.id}) — {stu.department} • Pending: ₹{stu.pendingAmount.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Fee Component Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Payment Amount (INR) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    className="c1-form-input"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    min={1}
                  />
                </div>

                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Fee Component <span className="required">*</span>
                  </label>
                  <select
                    className="c1-form-select"
                    value={payComponent}
                    onChange={(e) => setPayComponent(e.target.value)}
                  >
                    <option value="Tuition Fee (Sem 8)">Tuition Fee (Sem 8)</option>
                    <option value="Computing & AI Lab Access">Computing & AI Lab Access</option>
                    <option value="Digital Library & Research">Digital Library & Research</option>
                    <option value="Campus Amenities & Hostel">Campus Amenities & Hostel</option>
                    <option value="Comprehensive Term Settlement">Comprehensive Term Settlement</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode & Reference */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Payment Mode <span className="required">*</span>
                  </label>
                  <select
                    className="c1-form-select"
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                  >
                    <option value="UPI / Razorpay">UPI / Razorpay</option>
                    <option value="UPI / GooglePay">UPI / GooglePay</option>
                    <option value="UPI / PhonePe">UPI / PhonePe</option>
                    <option value="UPI / HDFC NetBanking">UPI / HDFC NetBanking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="NetBanking / SBI">NetBanking / SBI</option>
                    <option value="NetBanking / ICICI">NetBanking / ICICI</option>
                    <option value="Demand Draft / Banker Cheque">Demand Draft / Banker Cheque</option>
                    <option value="Cash / Campus Accounts Counter">Cash / Campus Accounts Counter</option>
                  </select>
                </div>

                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Bank Reference / UTR Number
                  </label>
                  <input
                    type="text"
                    className="c1-form-input"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. UTR-387074988"
                  />
                </div>
              </div>

              {/* Settlement Date & Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Settlement Date
                  </label>
                  <input
                    type="text"
                    className="c1-form-input"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>

                <div className="c1-form-group">
                  <label className="c1-form-label">
                    Accounts Ledger Remarks
                  </label>
                  <input
                    type="text"
                    className="c1-form-input"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Cleared at Central Admin Accounts Desk"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsRecordPaymentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn"
                  style={{ background: '#0284c7', color: '#ffffff', fontWeight: 600 }}
                >
                  <i className="fa-solid fa-check-double"></i> Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* =========================================================================
            MODAL 3: VIEW OFFICIAL DIGITAL RECEIPT VOUCHER
            ========================================================================= */}
        {viewingReceipt && (
          <Modal
            isOpen={!!viewingReceipt}
            onClose={() => setViewingReceipt(null)}
            title={`University Fee Receipt: ${viewingReceipt.id}`}
            maxWidth="sm"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => window.print()}
                >
                  <i className="fa-solid fa-print"></i> Print Receipt
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  style={{ background: '#0284c7', color: '#ffffff' }}
                  onClick={() => setViewingReceipt(null)}
                >
                  Done
                </button>
              </div>
            }
          >
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 12px auto' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Payment Verified & Settled</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Institutional Accounts Gateway Confirmation</span>

              <div style={{ margin: '20px 0', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Transaction Ref</span>
                  <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{viewingReceipt.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Student</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{viewingReceipt.studentDisplay}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Amount Paid</span>
                  <strong style={{ color: '#16a34a', fontSize: '16px' }}>{viewingReceipt.amountFormatted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Payment Mode</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{viewingReceipt.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Settlement Date</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{viewingReceipt.date}</span>
                </div>
                {viewingReceipt.referenceNo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Bank Reference</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '11.5px' }}>{viewingReceipt.referenceNo}</span>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* =========================================================================
            MODAL 4: DELETE TRANSACTION CONFIRMATION
            ========================================================================= */}
        {deletingTransaction && (
          <Modal
            isOpen={!!deletingTransaction}
            onClose={() => setDeletingTransaction(null)}
            title={`Delete Transaction: ${deletingTransaction.id}`}
            maxWidth="sm"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingTransaction(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  style={{ background: '#dc2626', color: '#ffffff', fontWeight: 600 }}
                  onClick={handleConfirmDeleteTransaction}
                >
                  <i className="fa-solid fa-trash-can"></i> Confirm Delete
                </button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px', color: '#dc2626', flexShrink: 0 }}></i>
                <span>Are you sure you want to delete this payment settlement? This action will remove the record and revert the student's pending fee balance.</span>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Transaction Ref:</span>
                  <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{deletingTransaction.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student Candidate:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{deletingTransaction.studentDisplay}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Settlement Amount:</span>
                  <strong style={{ color: '#dc2626' }}>{deletingTransaction.amountFormatted}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>
                  <span>{deletingTransaction.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Recorded Date:</span>
                  <span>{deletingTransaction.date}</span>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* =========================================================================
            MODAL 5: DELETE STUDENT FEE RECORD CONFIRMATION
            ========================================================================= */}
        {deletingStudentFee && (
          <Modal
            isOpen={!!deletingStudentFee}
            onClose={() => setDeletingStudentFee(null)}
            title={`Delete Student Fee Record: ${deletingStudentFee.name}`}
            maxWidth="sm"
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingStudentFee(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  style={{ background: '#dc2626', color: '#ffffff', fontWeight: 600 }}
                  onClick={handleConfirmDeleteStudentFee}
                >
                  <i className="fa-solid fa-trash-can"></i> Confirm Delete
                </button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px', color: '#dc2626', flexShrink: 0 }}></i>
                <span>Are you sure you want to remove this student's fee invoice ledger record?</span>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{deletingStudentFee.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Roll Number:</span>
                  <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{deletingStudentFee.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <span>{deletingStudentFee.department} ({deletingStudentFee.year})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Billed:</span>
                  <strong>₹{deletingStudentFee.totalBilled.toLocaleString('en-IN')}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Current Status:</span>
                  <span>{deletingStudentFee.status}</span>
                </div>
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

export default AdminFees;
