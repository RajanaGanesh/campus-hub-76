import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export const AdminSettings: React.FC = () => {
  const [instName, setInstName] = useState('CampusOne Institute of Technology');
  const [instCode, setInstCode] = useState('CIT-BLR-001');
  const [currentTerm, setCurrentTerm] = useState('Academic Year 2025–2026 (Even Semester)');
  const [contactEmail, setContactEmail] = useState('registrar@campushub.edu');

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Campus configuration settings saved successfully!', 'success');
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
              <span className="crumb-current">System Settings</span>
            </div>
            <h1 className="module-title">Institutional Profile & System Settings</h1>
            <p className="module-subtitle">
              Manage university institutional metadata, academic term calendars, system preferences, and security policies.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleSaveSettings}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* 1. Theme & Appearance Information Card */}
        <div className="c1-card" style={{ padding: '28px', maxWidth: '800px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <i className="fa-solid fa-palette" style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }}></i>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Appearance & Theme
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Campus Hub is styled in High-Contrast Light Theme with Midnight Navy Navigation, optimized for classroom clarity and administrative workflows.
          </p>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--accent-primary)',
              backgroundColor: 'rgba(108, 75, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '380px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
              >
                <i className="fa-solid fa-sun"></i>
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', display: 'block' }}>
                  Light Theme (CampusOne)
                </strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  Standard Institutional Layout
                </span>
              </div>
            </div>
            <span className="c1-badge c1-badge-success">
              <i className="fa-solid fa-check"></i> Active
            </span>
          </div>
        </div>

        {/* 2. Configuration Forms */}
        <div className="c1-card" style={{ padding: '28px', maxWidth: '800px' }}>
          <form onSubmit={handleSaveSettings} className="faculty-form-stack">
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, marginBottom: '8px' }}>
              Institutional Metadata
            </h3>

            <div className="form-fields-two-col">
              <div className="form-field-wrap">
                <label className="form-label">Institution Name</label>
                <input
                  type="text"
                  className="c1-input"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Institution Code</label>
                <input
                  type="text"
                  className="c1-input"
                  value={instCode}
                  onChange={(e) => setInstCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-fields-two-col">
              <div className="form-field-wrap">
                <label className="form-label">Active Academic Term</label>
                <input
                  type="text"
                  className="c1-input"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Registrar Office Email</label>
                <input
                  type="email"
                  className="c1-input"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field-wrap">
              <label className="form-label">Security & Session Policy</label>
              <div style={{ padding: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Enforce Two-Factor Authentication (2FA) for Faculty & Administrators</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Enable Audit Logging for Grade & Mark Sheet Modifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Automated Nightly Backup of Institutional Database to Secure Storage</span>
                </label>
              </div>
            </div>

            <div className="modal-dialog-footer" style={{ marginTop: '14px' }}>
              <button
                type="submit"
                className="c1-btn c1-btn-gradient"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
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

export default AdminSettings;
