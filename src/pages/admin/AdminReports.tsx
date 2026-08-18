import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export interface ReportCategoryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  format: string;
  recordsCount: string;
}

export const AdminReports: React.FC = () => {
  const [reports] = useState<ReportCategoryItem[]>([
    {
      id: 'REP-01',
      title: 'Student Enrollment & Demographics',
      category: 'Admissions & Students',
      description: 'Comprehensive roster of 1,240 enrolled students by year, branch, and category.',
      icon: 'fa-user-graduate',
      format: 'CSV / PDF',
      recordsCount: '1,240 Rows'
    },
    {
      id: 'REP-02',
      title: 'Faculty Appointments & Workload',
      category: 'Faculty & Human Resources',
      description: 'Faculty directory, credit distribution, and teaching schedule allocations.',
      icon: 'fa-chalkboard-user',
      format: 'CSV / PDF',
      recordsCount: '84 Rows'
    },
    {
      id: 'REP-03',
      title: 'Campus Attendance Audit Ledger',
      category: 'Academic Operations',
      description: 'Departmental attendance trends, daily roll call counts, and low attendance records.',
      icon: 'fa-clipboard-user',
      format: 'CSV / PDF',
      recordsCount: '1,240 Rows'
    },
    {
      id: 'REP-04',
      title: 'Academic Results & GPA Analysis',
      category: 'Examinations',
      description: 'Semester grade sheets, pass percentages, and subject failure rates.',
      icon: 'fa-award',
      format: 'CSV / PDF',
      recordsCount: '1,240 Rows'
    },
    {
      id: 'REP-05',
      title: 'Tuition Fee Collection & Balance',
      category: 'Finance & Accounts',
      description: 'Invoices, realizations (₹1.84 Cr), pending balances, and transaction logs.',
      icon: 'fa-file-invoice-dollar',
      format: 'CSV / PDF',
      recordsCount: '1,240 Invoices'
    },
    {
      id: 'REP-06',
      title: 'Library Circulation & Inventory',
      category: 'Campus Services',
      description: 'Active book loans, overdue items, and physical volume holdings.',
      icon: 'fa-book-open',
      format: 'CSV / PDF',
      recordsCount: '14,200 Titles'
    },
    {
      id: 'REP-07',
      title: 'Hostel Occupancy & Bed Allocation',
      category: 'Campus Services',
      description: 'Resident student room allocations across Blocks A to D.',
      icon: 'fa-hotel',
      format: 'CSV / PDF',
      recordsCount: '360 Occupants'
    },
    {
      id: 'REP-08',
      title: 'Campus Transport Route Manifest',
      category: 'Campus Services',
      description: 'Bus transit subscriptions, stop allocations, and driver rosters.',
      icon: 'fa-bus',
      format: 'CSV / PDF',
      recordsCount: '540 Riders'
    },
    {
      id: 'REP-09',
      title: 'Placement Offers & Corporate Hires',
      category: 'Career & Placements',
      description: 'Company-wise hiring statistics, packages, and student conversion metrics.',
      icon: 'fa-briefcase',
      format: 'CSV / PDF',
      recordsCount: '142 Offers'
    }
  ]);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportCSV = (repTitle: string) => {
    showToast(`Exporting "${repTitle}" as CSV file... Download started.`, 'success');
  };

  const handlePrintReport = (repTitle: string) => {
    showToast(`Generating printable view for "${repTitle}"...`, 'info');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Institutional Reports</span>
            </div>
            <h1 className="module-title">Institutional Reports & Data Exports</h1>
            <p className="module-subtitle">
              Generate university compliance reports, departmental performance logs, financial ledgers, and accreditation data.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Full Institutional Master Archive (ZIP) export generated.', 'success')}
            >
              <i className="fa-solid fa-file-zipper"></i>
              <span>Export Full Archive</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-file-lines"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{reports.length} Reports</span>
              <span className="stat-label">Institutional Datasets</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-file-csv"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">CSV & PDF</span>
              <span className="stat-label">Export Formats Available</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>Live Data</span>
              <span className="stat-label">Database Synchronized</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Audit-Ready</span>
              <span className="stat-label">NAAC / NBA Format Compliant</span>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="faculty-courses-full-grid">
          {reports.map((rep) => (
            <div key={rep.id} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}
                  >
                    <i className={`fa-solid ${rep.icon}`}></i>
                  </div>
                  <div>
                    <span className="course-code-tag">{rep.category}</span>
                    <h3 className="course-title-text" style={{ fontSize: '1.05rem' }}>{rep.title}</h3>
                  </div>
                </div>
                <span className="c1-badge c1-badge-cyan">{rep.recordsCount}</span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {rep.description}
              </p>

              <div className="course-shortcuts-row" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: <strong>{rep.format}</strong></span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => handlePrintReport(rep.title)}
                  >
                    <i className="fa-solid fa-print"></i>
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => handleExportCSV(rep.title)}
                  >
                    <i className="fa-solid fa-file-arrow-down"></i>
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
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

export default AdminReports;
