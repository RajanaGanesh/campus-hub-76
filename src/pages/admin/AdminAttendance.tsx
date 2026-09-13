import React, { useState, useEffect } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getManagementData, StudentRecord } from '../../data/managementData';
import { Toast } from '../../components/Toast';
import { Modal } from '../../components/Modal';
import {
  sendAttendanceShortageEmail,
  sendBulkAttendanceShortageEmails,
  getAttendanceShortageEmails,
  AttendanceShortageEmailRecord,
  SendShortageEmailParams
} from '../../services/emailService';

export const AdminAttendance: React.FC = () => {
  const mgmt = getManagementData();

  // Filter low attendance candidates (< 75%)
  const lowAttendanceList = mgmt.students.filter((s) => s.attendancePercent < 75);

  // Sent emails registry state
  const [shortageEmails, setShortageEmails] = useState<AttendanceShortageEmailRecord[]>(() => getAttendanceShortageEmails());
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<AttendanceShortageEmailRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync emails on storage changes or custom events
  useEffect(() => {
    const handleSync = () => {
      setShortageEmails(getAttendanceShortageEmails());
    };
    window.addEventListener('campushub_shortage_email_sent', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('campushub_shortage_email_sent', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Broadcast Guardian & Student Alerts to all candidates below 75%
  const handleBroadcastGuardianAlerts = () => {
    if (lowAttendanceList.length === 0) {
      showToast('All registered students currently meet or exceed the 75% attendance criteria.', 'info');
      return;
    }

    setIsBroadcasting(true);
    setTimeout(() => {
      const payloads: SendShortageEmailParams[] = lowAttendanceList.map((stu) => {
        const conducted = 32;
        const present = Math.round((stu.attendancePercent / 100) * conducted);
        const absent = conducted - present;
        return {
          studentId: stu.id,
          studentName: stu.name,
          studentEmail: stu.email,
          courseCode: 'CSE-301',
          courseName: 'Core Computer Science & Engineering Curriculum',
          facultyName: 'Central Academic Dean / Attendance Monitoring Cell',
          section: stu.section ? `Section ${stu.section}` : 'Section A',
          conductedClasses: conducted,
          presentClasses: present,
          absentClasses: absent,
          attendancePercentage: stu.attendancePercent
        };
      });

      sendBulkAttendanceShortageEmails(payloads);
      const updated = getAttendanceShortageEmails();
      setShortageEmails(updated);
      setIsBroadcasting(false);
      showToast(
        `Official low-attendance warning notices & emails successfully dispatched to ${payloads.length} students & guardians!`,
        'success'
      );
    }, 400);
  };

  // Send single shortage notice to a student
  const handleSendSingleNotice = (stu: StudentRecord) => {
    const conducted = 32;
    const present = Math.round((stu.attendancePercent / 100) * conducted);
    const absent = conducted - present;

    const sent = sendAttendanceShortageEmail({
      studentId: stu.id,
      studentName: stu.name,
      studentEmail: stu.email,
      courseCode: 'CSE-301',
      courseName: 'Core Computer Science & Engineering Curriculum',
      facultyName: 'Central Academic Dean / Attendance Monitoring Cell',
      section: stu.section ? `Section ${stu.section}` : 'Section A',
      conductedClasses: conducted,
      presentClasses: present,
      absentClasses: absent,
      attendancePercentage: stu.attendancePercent
    });

    setShortageEmails(getAttendanceShortageEmails());
    showToast(
      `Attendance shortage notice & warning email dispatched to ${stu.name} (${sent.studentEmail})!`,
      'success'
    );
  };

  const departmentRates = [
    { dept: 'Artificial Intelligence & Data Science', rate: 91, present: 145, absent: 15 },
    { dept: 'Computer Science & Engineering', rate: 88, present: 316, absent: 44 },
    { dept: 'Information Technology', rate: 87, present: 191, absent: 29 },
    { dept: 'Electronics & Communication', rate: 85, present: 238, absent: 42 },
    { dept: 'Mechanical Engineering', rate: 82, present: 98, absent: 22 },
    { dept: 'Civil Engineering', rate: 79, present: 79, absent: 21 }
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
              <span className="crumb-current">Attendance Overview</span>
            </div>
            <h1 className="module-title">Campus-Wide Attendance Overview</h1>
            <p className="module-subtitle">
              Institutional attendance analytics, branch percentages, daily roll-call aggregates, and real-time student notice & guardian email dispatching.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleBroadcastGuardianAlerts}
              disabled={isBroadcasting}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {isBroadcasting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Dispatching Alerts...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Broadcast Guardian & Student Alerts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#818cf8' }}>86.4%</span>
              <span className="stat-label">Institutional Attendance</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>1,072</span>
              <span className="stat-label">Students Present Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-user-xmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>168</span>
              <span className="stat-label">Students Absent Today</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{lowAttendanceList.length}</span>
              <span className="stat-label">Below 75% Attendance ({shortageEmails.length} notices issued)</span>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="c1-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Department Attendance Realization</h3>
              <p className="c1-card-subtitle">Aggregated attendance percentages across engineering schools</p>
            </div>
            <span className="c1-badge c1-badge-cyan">Daily Audit</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
            {departmentRates.map((d) => (
              <div key={d.dept} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{d.dept}</strong>
                  <strong style={{ color: d.rate >= 85 ? '#34d399' : d.rate >= 75 ? '#38bdf8' : '#fb7185' }}>{d.rate}%</strong>
                </div>
                <div className="progress-bar-large-track">
                  <div className="progress-bar-large-fill" style={{ width: `${d.rate}%`, background: d.rate >= 85 ? 'var(--color-success)' : 'var(--accent-primary)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  <span>{d.present} Present</span>
                  <span>{d.absent} Absent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Student Alerts Table */}
        <div className="c1-card student-roster-card" style={{ marginBottom: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Low Attendance Alerts (&lt; 75% Threshold)</h3>
              <p className="c1-card-subtitle">Students requiring administrative academic counseling, official notices, and guardian email alerts</p>
            </div>
            <span className="c1-badge c1-badge-error">Mandatory Attention</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Candidate</th>
                  <th>Student Email</th>
                  <th>Department</th>
                  <th>Section</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mgmt.students.map((stu) => {
                  const hasEmailNotice = shortageEmails.some(
                    (e) => e.studentId.toLowerCase() === stu.id.toLowerCase() || (stu.email && e.studentEmail.toLowerCase() === stu.email.toLowerCase())
                  );
                  return (
                    <tr key={stu.id}>
                      <td><span className="course-code-cell">{stu.id}</span></td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{stu.name}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{stu.email}</span>
                      </td>
                      <td>{stu.department}</td>
                      <td>Section {stu.section}</td>
                      <td>
                        <strong style={{ color: stu.attendancePercent >= 75 ? '#34d399' : '#fb7185' }}>
                          {stu.attendancePercent}%
                        </strong>
                      </td>
                      <td>
                        {hasEmailNotice ? (
                          <span className="c1-badge c1-badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-envelope-circle-check"></i> Notice Sent
                          </span>
                        ) : (
                          <span className={`c1-badge ${stu.attendancePercent >= 75 ? 'c1-badge-success' : 'c1-badge-error'}`}>
                            {stu.attendancePercent >= 75 ? 'Satisfactory' : 'Action Required'}
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={hasEmailNotice ? "c1-btn c1-btn-secondary" : "c1-btn c1-btn-primary"}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          onClick={() => handleSendSingleNotice(stu)}
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                          <span>{hasEmailNotice ? 'Re-send Email' : 'Send Email Notice'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatched Attendance Shortage Notice & Sent Emails Log */}
        <div className="c1-card" style={{ padding: '24px' }}>
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Dispatched Shortage Notices & Email Communications ({shortageEmails.length})</h3>
              <p className="c1-card-subtitle">Complete transcript history of attendance warning circulars and automated guardian alerts</p>
            </div>
            <span className="c1-badge c1-badge-purple">Live Dispatch Log</span>
          </div>

          {shortageEmails.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '2.5rem', opacity: 0.35, marginBottom: '12px', display: 'block' }}></i>
              <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontWeight: 600 }}>No Attendance Shortage Notices Dispatched Yet</h4>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Use the "Broadcast Guardian Alerts" button above or trigger individual student notices to record email transcripts.</p>
            </div>
          ) : (
            <div className="student-roster-table-wrap" style={{ marginTop: '12px' }}>
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Dispatch ID</th>
                    <th>Student Name & Roll No</th>
                    <th>Recipient Email</th>
                    <th>Course Code</th>
                    <th>Attendance %</th>
                    <th>Sent Timestamp</th>
                    <th>Delivery Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {shortageEmails.map((eml) => (
                    <tr key={eml.id}>
                      <td><span className="course-code-cell">{eml.id}</span></td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{eml.studentName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{eml.studentId}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', fontWeight: 500 }}>
                          <i className="fa-solid fa-envelope" style={{ marginRight: '5px' }}></i>
                          {eml.studentEmail}
                        </span>
                      </td>
                      <td>{eml.courseCode}</td>
                      <td>
                        <strong style={{ color: '#fb7185' }}>{eml.attendancePercentage}%</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{eml.sentAt}</span>
                      </td>
                      <td>
                        <span className="c1-badge c1-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-circle-check"></i> {eml.status} (Email & SMS)
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setSelectedEmail(eml)}
                        >
                          <i className="fa-solid fa-eye"></i>
                          <span>View Transcript</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: View Full Email Transcript */}
        {selectedEmail && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedEmail(null)}
            title="Official Attendance Shortage Email Notice"
            maxWidth="lg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Notice Metadata header */}
              <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Recipient Student</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedEmail.studentName} ({selectedEmail.studentId})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Recipient Email</span>
                    <strong style={{ color: 'var(--accent-blue)' }}>{selectedEmail.studentEmail}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Course / Section</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedEmail.courseCode} ({selectedEmail.section})</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Dispatch Date</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedEmail.sentAt}</strong>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="c1-form-label" style={{ marginBottom: '4px' }}>Email Subject Line</label>
                <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: '#f87171', fontWeight: 600, fontSize: '13.5px' }}>
                  {selectedEmail.subject}
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="c1-form-label" style={{ marginBottom: '4px' }}>Email Body & Formal Notice Transcript</label>
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
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}>
                  {selectedEmail.messageText}
                </pre>
              </div>

              {/* Modal footer buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedEmail(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-primary"
                  onClick={() => {
                    showToast(`Notice transcript for ${selectedEmail.studentName} downloaded.`, 'success');
                    setSelectedEmail(null);
                  }}
                >
                  <i className="fa-solid fa-download" style={{ marginRight: '6px' }}></i>
                  Download Notice PDF
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

export default AdminAttendance;
