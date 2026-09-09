import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { useEffectiveUserProfile } from '../../utils/userProfile';
import { downloadAttendanceReport } from '../../utils/fileDownloader';
import {
  LeaveApplication,
  AttendanceSummary,
  initialAttendanceSummary,
  subjectAttendanceData,
  initialLeaveApplications
} from '../../data/attendanceData';

const LEAVES_STORAGE_KEY = 'campushub_student_leaves';

export const StudentAttendance: React.FC = () => {
  const effectiveProfile = useEffectiveUserProfile();

  // Core Data States
  const [summary] = useState<AttendanceSummary>(initialAttendanceSummary);
  
  // Leaves state seeded with storage or initial mock
  const [leaves, setLeaves] = useState<LeaveApplication[]>(() => {
    try {
      const stored = localStorage.getItem(LEAVES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return initialLeaveApplications;
  });

  // Leave Filter State
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'All' | 'Approved' | 'Pending Advisor Review' | 'Medical' | 'On-Duty'>('All');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'Medical Leave' | 'On-Duty (OD) Academic' | 'On-Duty (OD) Sports' | 'Casual Leave'>('Medical Leave');
  const [leaveFrom, setLeaveFrom] = useState('');
  const [leaveTo, setLeaveTo] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveAdvisor, setLeaveAdvisor] = useState('Dr. Suresh Kumar (Professor & HOD)');
  const [leaveFileName, setLeaveFileName] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered Leaves List
  const filteredLeaves = leaves.filter((item) => {
    if (leaveStatusFilter === 'All') return true;
    if (leaveStatusFilter === 'Approved') return item.status === 'Approved';
    if (leaveStatusFilter === 'Pending Advisor Review') return item.status === 'Pending Advisor Review';
    if (leaveStatusFilter === 'Medical') return item.type === 'Medical Leave';
    if (leaveStatusFilter === 'On-Duty') return item.type.includes('On-Duty');
    return true;
  });

  // Handle Submit Leave Request
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!leaveFrom || !leaveTo) {
      showToast('Please specify both Start Date and End Date.', 'error');
      return;
    }

    if (!leaveReason.trim()) {
      showToast('Please provide a legitimate reason for the leave application.', 'error');
      return;
    }

    const startDate = new Date(leaveFrom);
    const endDate = new Date(leaveTo);
    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newApp: LeaveApplication = {
      id: `LEV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: leaveType,
      fromDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(startDate),
      toDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(endDate),
      totalDays,
      reason: leaveReason.trim(),
      appliedDate: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      status: 'Pending Advisor Review',
      advisorName: leaveAdvisor,
      remarks: 'Application submitted into the automated faculty review queue.',
      documentName: leaveFileName || 'Supporting_Document.pdf'
    };

    const updated = [newApp, ...leaves];
    setLeaves(updated);
    try {
      localStorage.setItem(LEAVES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setIsLeaveModalOpen(false);
    setLeaveReason('');
    setLeaveFrom('');
    setLeaveTo('');
    setLeaveFileName('');
    showToast(`Leave application #${newApp.id} submitted for faculty approval!`, 'success');
  };

  // Download official attendance report
  const handleDownloadReport = () => {
    downloadAttendanceReport({
      studentName: effectiveProfile.name,
      rollNumber: '236F1A0551',
      department: 'Computer Science & Engineering',
      semester: 'Semester 8 (Final Year)',
      overallPercentage: summary.overallPercentage,
      totalHeld: summary.totalHeld,
      totalAttended: summary.totalAttended,
      subjects: subjectAttendanceData.map((s) => ({
        code: s.code,
        name: s.name,
        conducted: s.totalConducted,
        attended: s.totalAttended,
        percentage: s.percentage,
        status: s.status === 'Safe' ? 'SAFE (>=75%)' : s.status === 'Warning' ? 'WARNING (<80%)' : 'CRITICAL (<75%)'
      }))
    });
    showToast(`Consolidated Attendance Transcript for "${effectiveProfile.name}" downloaded!`, 'success');
  };

  // SVG Gauge calculations
  const gaugeRadius = 46;

  return (
    <AppLayout>
      <div className="attendance-page-container" style={{ paddingBottom: '60px' }}>
        {/* Toast Alerts */}
        {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}

        {/* =========================================================================
            1. HERO ATTENDANCE HEADER BANNER
            ========================================================================= */}
        <div
          className="c1-card"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="live-indicator"></span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Academic Tracking
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{summary.lastUpdated}</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                Attendance & Leave Registry
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                Track overall attendance standing, submit On-Duty (OD) / Medical leave applications, and view faculty advisor approval status.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={handleDownloadReport}
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <i className="fa-solid fa-file-arrow-down" style={{ color: '#10b981' }}></i>
                <span>Export Ledger</span>
              </button>

              <button
                type="button"
                className="c1-btn c1-btn-primary"
                onClick={() => setIsLeaveModalOpen(true)}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <i className="fa-solid fa-file-circle-plus"></i>
                <span>Apply for Leave / OD</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. KEY METRIC STAT CARDS & GAUGE
            ========================================================================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}
        >
          {/* Card 1: Overall Percentage with Visual Gauge */}
          <div
            className="c1-card"
            style={{
              padding: '20px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                OVERALL ATTENDANCE
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {summary.overallPercentage}%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#059669'
                  }}
                >
                  <i className="fa-solid fa-circle-check"></i> Safe (≥75% Req.)
                </span>
              </div>
            </div>

            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: '84px', height: '84px', flexShrink: 0 }}>
              <svg style={{ width: '84px', height: '84px', transform: 'rotate(-90deg)' }}>
                <circle
                  cx="42"
                  cy="42"
                  r={gaugeRadius - 12}
                  stroke="var(--border-color)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="42"
                  cy="42"
                  r={gaugeRadius - 12}
                  stroke="#2563eb"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * (gaugeRadius - 12)}
                  strokeDashoffset={2 * Math.PI * (gaugeRadius - 12) * (1 - summary.overallPercentage / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}
              >
                {Math.round(summary.overallPercentage)}%
              </div>
            </div>
          </div>

          {/* Card 2: Lectures Attended vs Conducted */}
          <div className="c1-card" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>LECTURES ATTENDED</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-user-check"></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {summary.totalAttended} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>/ {summary.totalHeld} Held</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
              8 Enrolled Courses (6 Theory • 2 Labs)
            </p>
          </div>

          {/* Card 3: Missed Classes & OD Credit */}
          <div className="c1-card" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>MISSED & ON-DUTY (OD)</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-calendar-xmark"></i>
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {summary.totalAbsent} <span style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7' }}>+ {summary.totalOnDuty} ODs Excused</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
              {summary.consecutivePresentStreak} days continuous attendance streak
            </p>
          </div>

          {/* Card 4: Examination Hall Ticket Status */}
          <div className="c1-card" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>EXAM ELIGIBILITY</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>
              {summary.examEligibility}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
              Hall Ticket Clear for End-Semester Exams
            </p>
          </div>
        </div>

        {/* =========================================================================
            3. LEAVE & ON-DUTY (OD) APPLICATIONS SECTION
            ========================================================================= */}
        <div className="c1-card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '20px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Leave & On-Duty (OD) Applications
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Approved leaves and official sports/academic On-Duty requests are excused in your institutional attendance register.
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(['All', 'Approved', 'Pending Advisor Review', 'Medical', 'On-Duty'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  type="button"
                  onClick={() => setLeaveStatusFilter(filterOpt)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: leaveStatusFilter === filterOpt ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                    color: leaveStatusFilter === filterOpt ? '#ffffff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {filterOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((item) => {
                const isApproved = item.status === 'Approved';
                const isPending = item.status === 'Pending Advisor Review';

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-blue)' }}>
                          {item.id}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isApproved
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isPending
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: isApproved ? '#059669' : isPending ? '#d97706' : '#dc2626'
                          }}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Type & Dates */}
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                        {item.type}
                      </h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <i className="fa-regular fa-calendar" style={{ marginRight: '6px', color: 'var(--accent-blue)' }}></i>
                        {item.fromDate} {item.fromDate !== item.toDate ? `to ${item.toDate}` : ''} ({item.totalDays} Day{item.totalDays > 1 ? 's' : ''})
                      </div>

                      {/* Reason */}
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                        "{item.reason}"
                      </p>

                      {/* Advisor Remarks */}
                      {item.remarks && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Advisor Remarks:</strong> {item.remarks}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <span>Applied on {item.appliedDate}</span>
                      <span>Reviewer: {item.advisorName.split(' ')[0]} {item.advisorName.split(' ')[1]}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}></i>
                No leave applications matched the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            MODAL: APPLY FOR LEAVE / ON-DUTY (OD)
            ========================================================================= */}
        {isLeaveModalOpen && (
          <Modal
            isOpen={isLeaveModalOpen}
            onClose={() => setIsLeaveModalOpen(false)}
            title="Student Leave / On-Duty (OD) Application"
            maxWidth="md"
          >
            <form onSubmit={handleApplyLeave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Leave Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Leave / OD Category *
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e: any) => setLeaveType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Medical Leave">Medical Leave (Doctor Certificate)</option>
                    <option value="On-Duty (OD) Academic">On-Duty (OD) Academic (Hackathon / Conference)</option>
                    <option value="On-Duty (OD) Sports">On-Duty (OD) Sports (University Sports Meet)</option>
                    <option value="Casual Leave">Casual / Personal Emergency Leave</option>
                  </select>
                </div>

                {/* Date Ranges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      From Date *
                    </label>
                    <input
                      type="date"
                      value={leaveFrom}
                      onChange={(e) => setLeaveFrom(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      To Date *
                    </label>
                    <input
                      type="date"
                      value={leaveTo}
                      onChange={(e) => setLeaveTo(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                {/* Faculty Advisor */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Faculty Advisor Reviewer
                  </label>
                  <input
                    type="text"
                    value={leaveAdvisor}
                    onChange={(e) => setLeaveAdvisor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                </div>

                {/* Reason */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Detailed Reason & Justification *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed description for your leave or On-Duty event..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Document Attachment Mock */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Upload Proof / Supporting Document (PDF, JPG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setLeaveFileName(file.name);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-color)',
                      background: 'var(--bg-secondary)',
                      fontSize: '12px'
                    }}
                  />
                  {leaveFileName && (
                    <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>
                      <i className="fa-solid fa-file-pdf" style={{ marginRight: '4px' }}></i> Attached: {leaveFileName}
                    </div>
                  )}
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => setIsLeaveModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="c1-btn c1-btn-primary">
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Submit Application</span>
                  </button>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentAttendance;
