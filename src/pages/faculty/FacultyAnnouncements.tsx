import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagementData, saveManagementData, ManagementAnnouncement } from '../../data/managementData';

export const FacultyAnnouncements: React.FC = () => {
  const navigate = useNavigate();

  // Load announcements
  const [data, setData] = useState(() => getManagementData());
  const [announcements, setAnnouncements] = useState<ManagementAnnouncement[]>(() => {
    // Show only announcements published by Faculty 'Dr. S. Kumar' or general admin ones for visibility
    return getManagementData().announcements;
  });

  // Modal forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<ManagementAnnouncement | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<ManagementAnnouncement['audience']>('All Students');
  const [priority, setPriority] = useState<ManagementAnnouncement['priority']>('Medium');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setTitle('');
    setMessage('');
    setAudience('All Students');
    setPriority('Medium');
    setFormError(null);
    setEditingAnn(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (ann: ManagementAnnouncement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setMessage(ann.message);
    setAudience(ann.audience);
    setPriority(ann.priority);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    const nextAnns = announcements.filter((a) => a.id !== id);
    setAnnouncements(nextAnns);

    const nextData = {
      ...data,
      announcements: nextAnns
    };
    setData(nextData);
    saveManagementData(nextData);

    setToastMsg('Announcement deleted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFormError('Please fill in both the Title and Message fields.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    if (editingAnn) {
      // Edit
      const nextAnns = announcements.map((a) => {
        if (a.id === editingAnn.id) {
          return {
            ...a,
            title,
            message,
            audience,
            priority,
            publishDate: todayStr
          };
        }
        return a;
      });

      setAnnouncements(nextAnns);
      const nextData = { ...data, announcements: nextAnns };
      setData(nextData);
      saveManagementData(nextData);

      setShowCreateModal(false);
      setToastMsg('Announcement updated successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    } else {
      // Create new
      const nextIdNum = 101 + announcements.length;
      const nextId = `ANN-${nextIdNum}`;

      const newAnn: ManagementAnnouncement = {
        id: nextId,
        title,
        message,
        publishedBy: 'Dr. S. Kumar',
        audience,
        priority,
        publishDate: todayStr,
        status: 'Published'
      };

      const nextAnns = [newAnn, ...announcements];
      setAnnouncements(nextAnns);
      const nextData = { ...data, announcements: nextAnns };
      setData(nextData);
      saveManagementData(nextData);

      setShowCreateModal(false);
      setToastMsg('Announcement published successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/faculty')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Faculty Panel
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Faculty / Announcements</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Faculty Announcements</h1>
          <p>Publish course updates, notice notifications, and schedules amendments directly to students.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenCreate}
        >
          <i className="fa-solid fa-bullhorn" style={{ marginRight: '6px' }}></i> Create Announcement
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Announcements Catalog List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div key={ann.id} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '20px', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span className="class-subject-name" style={{ fontSize: '15px' }}>{ann.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Published By: <strong>{ann.publishedBy}</strong> • Target Audience: <strong>{ann.audience}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`subject-att-status ${ann.priority === 'High' ? 'critical' : ann.priority === 'Medium' ? 'warning' : 'safe'}`} style={{ fontSize: '8px' }}>
                    {ann.priority} Priority
                  </span>
                  {ann.publishedBy === 'Dr. S. Kumar' && (
                    <>
                      <button
                        type="button"
                        className="btn-sso"
                        style={{ height: '26px', fontSize: '11px', padding: '0 10px', margin: 0, width: 'auto' }}
                        onClick={() => handleOpenEdit(ann)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{ height: '26px', fontSize: '11px', padding: '0 10px', margin: 0, width: 'auto', background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
                        onClick={() => handleDelete(ann.id)}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {ann.message}
              </p>

              <div style={{ fontSize: '10.5px', color: '#555365', width: '100%', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                Published: {ann.publishDate}
              </div>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No Announcements</h3>
            <p style={{ fontSize: '12.5px' }}>Click "Create Announcement" to send out notifications.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="search-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Alert system</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{editingAnn ? 'Edit Announcement' : 'Publish Announcement'}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowCreateModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="ann-title" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title</label>
                  <input
                    id="ann-title"
                    type="text"
                    placeholder="e.g. End Semester Lab Practical dates..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ann-msg" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Message Body</label>
                  <textarea
                    id="ann-msg"
                    rows={4}
                    placeholder="Type details of the announcement notice..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Audience</label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as any)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="All Students">All Students</option>
                      <option value="Faculty">Faculty Only</option>
                      <option value="Specific Course">Specific Course (CSE-301)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12px', outline: 'none' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  {editingAnn ? 'Save Announcement' : 'Publish Announcement'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyAnnouncements;
