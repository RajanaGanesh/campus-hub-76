import React from 'react';
import { AppLayout } from '../../components/AppLayout';

export const ParentNotices: React.FC = () => {
  const notices = [
    {
      id: 'not-p-1',
      title: 'Annual Parent-Teacher Conference (PTC) 2026',
      date: '16 Aug 2026',
      publisher: 'Dean of Student Affairs',
      priority: 'High',
      content: 'The university invites all parents and guardians for the Odd-Semester Parent-Teacher Academic Interaction on Saturday, 12 September 2026. Interactive sessions will take place in the Main Auditorium from 10:00 AM to 02:00 PM.'
    },
    {
      id: 'not-p-2',
      title: 'Mid-Semester Examination Schedule Notification',
      date: '14 Aug 2026',
      publisher: 'Controller of Examinations (COE)',
      priority: 'High',
      content: 'Midterm Theory Examinations for B.Tech students will commence on 25 August 2026. Parents are requested to ensure students maintain minimum attendance compliance for hall ticket generation.'
    },
    {
      id: 'not-p-3',
      title: 'Campus Independence Day Celebration & Holiday Notice',
      date: '10 Aug 2026',
      publisher: 'Registrar Office',
      priority: 'Medium',
      content: 'The campus will remain closed on 15 August 2026 in observance of Independence Day. Flag hoisting ceremony will be held at 08:30 AM at the Administrative Block.'
    }
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
              <span className="crumb-current">Notices</span>
            </div>
            <h1 className="module-title">Institutional Notices & Circulars</h1>
            <p className="module-subtitle">
              Official university circulars, parent-teacher interaction advisories, and campus advisories.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{notices.length} Circulars</span>
              <span className="stat-label">Published Circulars</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>2 Urgent</span>
              <span className="stat-label">High Priority Notices</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Parents & Guardians</span>
              <span className="stat-label">Target Audience</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Verified</span>
              <span className="stat-label">Official University Circulars</span>
            </div>
          </div>
        </div>

        {/* Notices Stack */}
        <div className="notices-cards-stack">
          {notices.map((notif) => (
            <div key={notif.id} className="c1-card notice-list-card">
              <div className="notice-card-header">
                <div className="notice-meta-left">
                  <span className="course-code-tag">Campus Official</span>
                  <span className={`priority-pill priority-${notif.priority.toLowerCase()}`}>
                    {notif.priority} Priority
                  </span>
                </div>
                <span className="notice-pub-date">
                  <i className="fa-regular fa-calendar"></i> {notif.date}
                </span>
              </div>

              <h3 className="notice-card-heading">{notif.title}</h3>
              <p className="notice-card-snippet">{notif.content}</p>

              <div className="notice-card-footer">
                <span className="notice-publisher">
                  <i className="fa-solid fa-shield-halved"></i> Source: <strong>{notif.publisher}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentNotices;
