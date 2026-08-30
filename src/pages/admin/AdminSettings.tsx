import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const AdminSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
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

  const themeCards: { mode: ThemeMode; label: string; icon: string; desc: string }[] = [
    { mode: 'light', label: 'Light', icon: 'fa-sun', desc: 'Bright and clean interface with high contrast.' },
    { mode: 'dark', label: 'Dark', icon: 'fa-moon', desc: 'Comfortable for low-light environments.' },
    { mode: 'system', label: 'System', icon: 'fa-desktop', desc: 'Automatically match your device settings.' }
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

        {/* 1. Theme & Appearance Preference Card */}
        <div className="c1-card" style={{ padding: '28px', maxWidth: '800px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <i className="fa-solid fa-palette" style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }}></i>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Appearance & Theme
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
            Choose your preferred Campus Hub theme appearance. This setting applies across all modules and is saved to your account.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {themeCards.map((t) => {
              const isSelected = theme === t.mode;
              return (
                <div
                  key={t.mode}
                  onClick={() => {
                    setTheme(t.mode);
                    showToast(`Switched theme to ${t.label} Mode!`, 'success');
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                    backgroundColor: isSelected ? 'rgba(108, 75, 255, 0.08)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 16px rgba(108, 75, 255, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                      <i className={`fa-solid ${t.icon}`} style={{ fontSize: '1rem' }}></i>
                      <span>{t.label}</span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--border-medium)',
                      backgroundColor: 'transparent'
                    }} />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                    {t.desc}
                  </p>
                </div>
              );
            })}
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
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Enforce Two-Factor Authentication (2FA) for Faculty & Administrators</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Enable Audit Logging for Grade & Mark Sheet Modifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
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
