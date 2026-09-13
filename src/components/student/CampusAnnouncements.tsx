import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnnouncementItem } from '../../data/studentDashboardData';

export interface CampusAnnouncementsProps {
  announcements?: AnnouncementItem[];
}

export const CampusAnnouncements: React.FC<CampusAnnouncementsProps> = ({
  announcements = []
}) => {
  const navigate = useNavigate();

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
        return 'c1-badge-primary';
      case 'placement':
        return 'c1-badge-cyan';
      case 'examination':
        return 'c1-badge-error';
      case 'events':
        return 'c1-badge-success';
      default:
        return 'c1-badge-purple';
    }
  };

  return (
    <div className="c1-card campus-announcements-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Campus Notices & Announcements</h3>
          <p className="c1-card-subtitle">Official administrative broadcasts</p>
        </div>
        <button
          type="button"
          className="c1-btn c1-btn-secondary btn-header-action"
          onClick={() => navigate('/student/notices')}
        >
          <span>View All Notices</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="announcements-list-wrapper">
        {announcements.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '28px 16px',
            color: 'var(--text-muted)'
          }}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.35, display: 'block' }}></i>
            <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>No Active Announcements</h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>Institutional circulars and notices will appear here.</p>
          </div>
        ) : (
          announcements.map((item, idx) => (
            <div key={idx} className="announcement-card-item">
              <div className="announcement-meta-bar">
                <span className={`c1-badge ${getCategoryBadgeClass(item.category)}`}>
                  {item.category}
                </span>
                <span className="announcement-timestamp">
                  <i className="fa-regular fa-clock"></i> {item.time}
                </span>
              </div>

              <h4 className="announcement-headline">{item.title}</h4>
              <p className="announcement-body-text">{item.desc}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
