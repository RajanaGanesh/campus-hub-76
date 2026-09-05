import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getAdminJobs, saveAdminJobs, AdminJobItem } from '../../services/storageService';

export const AdminPlacements: React.FC = () => {
  const [jobs, setJobs] = useState<AdminJobItem[]>(() => getAdminJobs());

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [packageStr, setPackageStr] = useState('₹8.0 LPA');
  const [location, setLocation] = useState('Bangalore');
  const [cgpaRequired, setCgpaRequired] = useState<number>(7.5);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const newJob: AdminJobItem = {
      id: `job-${Date.now()}`,
      company: company.trim(),
      title: title.trim(),
      packageStr,
      type: 'Full Time',
      location,
      cgpaRequired,
      deadline: '15 Sep 2026',
      applicationsCount: 0,
      status: 'Active'
    };

    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveAdminJobs(updated);

    setIsAddModalOpen(false);
    setCompany('');
    setTitle('');
    showToast(`Job opening at ${newJob.company} published for eligible students!`, 'success');
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
              <span className="crumb-current">Placement Management</span>
            </div>
            <h1 className="module-title">Placement & Corporate Relations</h1>
            <p className="module-subtitle">
              Manage hiring partners, publish recruitment job listings, monitor candidate applications, and track offers.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-briefcase"></i>
              <span>Post New Job Opening</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-building"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">48</span>
              <span className="stat-label">Hiring Corporate Partners</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{jobs.length * 8}</span>
              <span className="stat-label">Active Job Openings</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>142 Offers</span>
              <span className="stat-label">Offers Extended</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-sack-dollar"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>₹14.0 LPA</span>
              <span className="stat-label">Highest Package</span>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Corporate Job Opportunities ({jobs.length} Active Posts)</h3>
              <p className="c1-card-subtitle">Active placements published to student careers portal</p>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add Opening</span>
            </button>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Company Partner</th>
                  <th>Job Title</th>
                  <th>Salary Package</th>
                  <th>Location</th>
                  <th>Min CGPA</th>
                  <th>Applications</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{j.company}</strong>
                    </td>
                    <td>{j.title}</td>
                    <td><strong style={{ color: '#38bdf8' }}>{j.packageStr}</strong></td>
                    <td>{j.location}</td>
                    <td>Min {j.cgpaRequired} CGPA</td>
                    <td>
                      <span className="c1-badge c1-badge-cyan">
                        <i className="fa-solid fa-users"></i> {j.applicationsCount} Applicants
                      </span>
                    </td>
                    <td>
                      <span className="c1-badge c1-badge-success">{j.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL: ADD JOB MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Post Corporate Job Opportunity"
            maxWidth="md"
          >
            <form onSubmit={handleAddJob} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Amazon Web Services"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Role Title</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Cloud Support Associate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Salary Package</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={packageStr}
                    onChange={(e) => setPackageStr(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Location / Mode</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Minimum CGPA Requirement</label>
                <input
                  type="number"
                  step="0.1"
                  className="c1-input"
                  value={cgpaRequired}
                  onChange={(e) => setCgpaRequired(Number(e.target.value))}
                  min={5.0}
                  max={10.0}
                  required
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Publish Job Listing</span>
                </button>
              </div>
            </form>
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

export default AdminPlacements;
