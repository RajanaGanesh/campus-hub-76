import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { getParentLinkedStudents } from '../../data/parentData';
import { Toast } from '../../components/Toast';

export const ParentSettings: React.FC = () => {
  const { user } = useAuth();
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

        {/* Profile Card & Form */}
        <div className="hostel-overview-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
          <div className="c1-card" style={{ padding: '24px' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
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
