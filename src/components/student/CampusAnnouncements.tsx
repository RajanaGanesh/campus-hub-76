import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnnouncementItem } from '../../data/studentDashboardData';

export interface CampusAnnouncementsProps {
  announcements?: AnnouncementItem[];
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    title: 'Mid-Semester Exam Timetable & Hall Allocations Released',
    category: 'Academic',
    time: '2 hours ago',
    desc: 'The official timetable for B.Tech IV Year examinations is now live. Please review schedule shifts for elective subjects.'
  },
  {
    title: 'Campus Recruitment Drive: TechNova & Microsoft Registrations',
    category: 'Placement',
    time: '5 hours ago',
    desc: 'Shortlisting criteria and online assessment schedules have been published on the Placements portal.'
  },
  {
    title: 'Library Extended Hours for Upcoming Examination Month',
    category: 'General',
    time: 'Yesterday',
    desc: 'Central Library study halls will remain open until 11:00 PM starting next Monday.'
  }
];

export const CampusAnnouncements: React.FC<CampusAnnouncementsProps> = ({
  announcements = DEFAULT_ANNOUNCEMENTS
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
        {announcements.map((item, idx) => (
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
        ))}
      </div>
    </div>
  );
};
