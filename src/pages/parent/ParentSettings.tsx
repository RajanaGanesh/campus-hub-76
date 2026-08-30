import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getParentLinkedStudents } from '../../data/parentData';
import { Toast } from '../../components/Toast';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ParentSettings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const linkedStudents = getParentLinkedStudents();

  const [parentName, setParentName] = useState(user?.name || 'Rajesh Sharma');
  const [parentEmail, setParentEmail] = useState(user?.email || 'parent@campushub.com');
  const [parentPhone, setParentPhone] = useState('+91 98765 43210');
  const [relationship, setRelationship] = useState('Father / Legal Guardian');

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Parent profile and notification preferences saved successfully!', 'success');
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
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Profile & Settings</span>
            </div>
            <h1 className="module-title">Parent Profile & Preferences</h1>
            <p className="module-subtitle">
              Manage guardian contact details, verified student authorizations, and notification channels.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleSaveProfile}
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Theme & Appearance Preference Card */}
        <div className="c1-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <i className="fa-solid fa-palette" style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }}></i>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 800, margin: 0 }}>
              Appearance & Theme
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '18px' }}>
            Choose your preferred display theme.
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

        {/* Profile Card & Form */}
        <div className="hostel-overview-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
              Guardian Contact Information
            </h3>

            <form onSubmit={handleSaveProfile} className="faculty-form-stack">
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Guardian Full Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Relationship to Student</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Registered Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Primary Mobile Number</label>
                  <input
                    type="tel"
                    className="c1-input"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Alert Channels & Communication Preferences</label>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Receive instant SMS alerts if student attendance drops below 75%</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Email semester exam schedules and published result transcripts</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem', color: '#ffffff', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Send payment receipts and upcoming fee balance reminders</span>
                  </label>
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Verified Linked Students Card */}
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px' }}>
              Verified Linked Students
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '16px' }}>
              Authorized student wards attached to this guardian account
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {linkedStudents.map((stu) => (
                <div key={stu.id} style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.9375rem' }}>{stu.name}</strong>
                    <span className="c1-badge c1-badge-success">
                      <i className="fa-solid fa-link"></i> Linked
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Roll Number: <strong style={{ color: '#38bdf8' }}>{stu.id}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {stu.degree} • Year {stu.year}
                  </div>
                </div>
              ))}
            </div>
          </div>
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

export default ParentSettings;
