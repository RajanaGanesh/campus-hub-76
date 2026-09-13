import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { useEffectiveUserProfile } from '../../utils/userProfile';
import { downloadAttendanceReport, downloadNoticeAttachment } from '../../utils/fileDownloader';
import {
  LeaveApplication,
  AttendanceSummary,
  initialAttendanceSummary,
  subjectAttendanceData,
  initialLeaveApplications
} from '../../data/attendanceData';
import {
  getAttendanceShortageEmails,
  AttendanceShortageEmailRecord
} from '../../services/emailService';

const LEAVES_STORAGE_KEY = 'campushub_student_leaves';

export const StudentAttendance: React.FC = () => {
  const effectiveProfile = useEffectiveUserProfile();
  const studentRoll = (effectiveProfile as any).rollNumber || '236F1A0551';

  // Core Data States
  const [summary] = useState<AttendanceSummary>(initialAttendanceSummary);
  
  // Sent Shortage Notices & Emails State
  const [shortageEmails, setShortageEmails] = useState<AttendanceShortageEmailRecord[]>(() => getAttendanceShortageEmails());
  const [selectedNoticeEmail, setSelectedNoticeEmail] = useState<AttendanceShortageEmailRecord | null>(null);

  // Subscribe to real-time email dispatch events
  useEffect(() => {
    const handleSync = () => {
      setShortageEmails(getAttendanceShortageEmails());
    };
    window.addEventListener('campushub_shortage_email_sent', handleSync);
    window.addEventListener('campushub_student_notifications_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('campushub_shortage_email_sent', handleSync);
      window.removeEventListener('campushub_student_notifications_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter notices for this student (matching email, roll number, or student name, or general attendance shortage)
  const studentShortageNotices = useMemo(() => {
    const cleanEmail = (effectiveProfile.email || '').toLowerCase().trim();
    const cleanRoll = studentRoll.toLowerCase().trim();
    const cleanName = (effectiveProfile.name || '').toLowerCase().trim();

    const matched = shortageEmails.filter((eml) => {
      const emlEmail = eml.studentEmail.toLowerCase().trim();
      const emlId = eml.studentId.toLowerCase().trim();
      const emlName = eml.studentName.toLowerCase().trim();

      return (
        (cleanEmail && emlEmail === cleanEmail) ||
        (cleanRoll && emlId === cleanRoll) ||
        (cleanName && emlName === cleanName) ||
        emlEmail.includes(cleanRoll) ||
        cleanEmail.includes(emlId)
      );
    });

    return matched.length > 0 ? matched : shortageEmails;
  }, [shortageEmails, effectiveProfile, studentRoll]);

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
      rollNumber: studentRoll,
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
            URGENT ATTENDANCE SHORTAGE NOTICE BANNER (If notices received)
            ========================================================================= */}
        {studentShortageNotices.length > 0 && (
          <div
            className="c1-card"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(244, 63, 94, 0.08) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="c1-badge c1-badge-error" style={{ fontSize: '11px', fontWeight: 700 }}>
                    Official Attendance Warning Issued
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Transmitted to student email & guardian contact
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  Academic Shortage Notice Delivered ({studentShortageNotices[0].courseCode} • {studentShortageNotices[0].attendancePercentage}%)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  An official notice was dispatched to <strong>{studentShortageNotices[0].studentEmail}</strong> regarding course attendance falling below 75%.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setSelectedNoticeEmail(studentShortageNotices[0])}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', padding: '10px 18px', fontSize: '13px' }}
            >
              <i className="fa-solid fa-envelope-open-text"></i>
              <span>View Notice Transcript</span>
            </button>
          </div>
        )}

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
                Track overall attendance standing, review official attendance shortage warning emails, submit On-Duty (OD) / Medical leave applications, and view faculty advisor approvals.
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
                    background: summary.overallPercentage >= 75 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: summary.overallPercentage >= 75 ? '#059669' : '#dc2626'
                  }}
                >
                  <i className={summary.overallPercentage >= 75 ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation"}></i>
                  {summary.overallPercentage >= 75 ? 'Safe (≥75% Req.)' : 'Shortage (<75%)'}
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
                  stroke={summary.overallPercentage >= 75 ? "#2563eb" : "#ef4444"}
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
            OFFICIAL ATTENDANCE NOTICES & SENT EMAILS LOG
            ========================================================================= */}
        <div className="c1-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              marginBottom: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Official Attendance Notices & Email Communications
                </h2>
                <span className="c1-badge c1-badge-cyan" style={{ fontSize: '11px' }}>
                  {studentShortageNotices.length} Notice{studentShortageNotices.length === 1 ? '' : 's'}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Formal notifications regarding attendance shortages, exam eligibility alerts, and guardian SMS/email broadcasts.
              </p>
            </div>
          </div>

          {studentShortageNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-shield-halved" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '12px', display: 'block', opacity: 0.8 }}></i>
              <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 600 }}>No Attendance Shortage Warnings</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Your attendance is in good standing across all enrolled subjects.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {studentShortageNotices.map((eml) => (
                <div
                  key={eml.id}
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="c1-badge c1-badge-error" style={{ fontSize: '10.5px', fontWeight: 700 }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '4px' }}></i>
                        {eml.attendancePercentage}% Attendance Shortage
                      </span>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {eml.sentAt}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                      {eml.subject}
                    </h4>

                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.4 }}>
                      <div><strong>Course:</strong> {eml.courseCode} ({eml.courseName})</div>
                      <div><strong>Delivered To:</strong> <span style={{ color: 'var(--accent-blue)' }}>{eml.studentEmail}</span></div>
                      <div><strong>Conducted / Attended:</strong> {eml.conductedClasses} Held • {eml.presentClasses} Attended • {eml.absentClasses} Missed</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      className="c1-btn c1-btn-primary"
                      onClick={() => setSelectedNoticeEmail(eml)}
                      style={{ flex: 1, padding: '7px 12px', fontSize: '12px' }}
                    >
                      <i className="fa-solid fa-eye"></i>
                      <span>Read Full Notice</span>
                    </button>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      onClick={() => {
                        downloadNoticeAttachment({
                          attachmentName: `Official_Shortage_Notice_${eml.courseCode}.pdf`,
                          title: eml.subject,
                          content: eml.messageText,
                          department: eml.facultyName,
                          date: eml.sentAt,
                          priority: 'High'
                        });
                        showToast('Official Shortage Notice PDF downloaded.', 'success');
                      }}
                      style={{ padding: '7px 12px', fontSize: '12px' }}
                      title="Download Official Notice Document"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            MODAL: VIEW FULL ATTENDANCE SHORTAGE EMAIL & NOTICE
            ========================================================================= */}
        {selectedNoticeEmail && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedNoticeEmail(null)}
            title="Official Attendance Shortage Notice & Email Transcript"
            maxWidth="lg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Info */}
              <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Recipient Student</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedNoticeEmail.studentName} ({selectedNoticeEmail.studentId})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Recipient Email</span>
                    <strong style={{ color: 'var(--accent-blue)' }}>{selectedNoticeEmail.studentEmail}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Course Code & Section</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedNoticeEmail.courseCode} ({selectedNoticeEmail.section})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Issued On</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedNoticeEmail.sentAt}</strong>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="c1-form-label" style={{ marginBottom: '4px' }}>Subject Line</label>
                <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: '#f87171', fontWeight: 600, fontSize: '13.5px' }}>
                  {selectedNoticeEmail.subject}
                </div>
              </div>

              {/* Message Transcript */}
              <div>
                <label className="c1-form-label" style={{ marginBottom: '4px' }}>Notice Transcript & Official Communication</label>
                <pre style={{
                  padding: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {selectedNoticeEmail.messageText}
                </pre>
              </div>

              {/* Modal footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedNoticeEmail(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-primary"
                  onClick={() => {
                    downloadNoticeAttachment({
                      attachmentName: `Official_Shortage_Notice_${selectedNoticeEmail.courseCode}.pdf`,
                      title: selectedNoticeEmail.subject,
                      content: selectedNoticeEmail.messageText,
                      department: selectedNoticeEmail.facultyName,
                      date: selectedNoticeEmail.sentAt,
                      priority: 'High'
                    });
                    showToast('Official Shortage Notice PDF downloaded.', 'success');
                    setSelectedNoticeEmail(null);
                  }}
                >
                  <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>
                  Download Official Notice (PDF)
                </button>
              </div>
            </div>
          </Modal>
        )}

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

                {/* Document Attachment */}
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
