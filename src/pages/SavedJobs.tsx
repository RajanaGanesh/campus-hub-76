import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementsData } from '../data/placementsData';

export const SavedJobs: React.FC = () => {
  const navigate = useNavigate();

  // Load saved job IDs from localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_saved');
      return stored ? JSON.parse(stored) : placementsData.savedJobIds;
    } catch {
      return placementsData.savedJobIds;
    }
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const savedJobs = placementsData.jobs.filter((j) => savedJobIds.includes(j.id));

  const handleRemoveSaved = (jobId: string, title: string) => {
    const nextSaved = savedJobIds.filter((id) => id !== jobId);
    setSavedJobIds(nextSaved);
    localStorage.setItem('campushub_career_saved', JSON.stringify(nextSaved));
    setToastMsg(`Removed "${title}" from saved list.`);
    setTimeout(() => setToastMsg(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header back toggles */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/placements')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Placements Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Careers / Saved Jobs</span>
      </div>

      <div className="dashboard-header">
        <h1>Saved Opportunities</h1>
        <p>Access jobs you saved for later review and apply when ready.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Saved Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {savedJobs.length > 0 ? (
          savedJobs.map((job) => (
            <div key={job.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700' }}>{job.company}</span>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>{job.title}</h3>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px' }}>
                  <div><i className="fa-solid fa-location-dot" style={{ width: '16px' }}></i> Location: <strong style={{ color: 'white' }}>{job.location}</strong></div>
                  <div><i className="fa-solid fa-wallet" style={{ width: '16px' }}></i> Package: <strong style={{ color: 'white' }}>{job.packageStr}</strong></div>
                  <div><i className="fa-solid fa-calendar-day" style={{ width: '16px' }}></i> Deadline: <strong style={{ color: 'white' }}>{job.deadline}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1.2, margin: 0, border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                  onClick={() => handleRemoveSaved(job.id, job.title)}
                >
                  Unsave
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '34px', fontSize: '12px', padding: 0 }}
                  onClick={() => navigate(`/placements/jobs/${job.id}`)}
                >
                  Apply
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-bookmark" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No saved jobs</h3>
            <p style={{ fontSize: '12.5px' }}>Save opportunities in the Placements catalog to view them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default SavedJobs;
