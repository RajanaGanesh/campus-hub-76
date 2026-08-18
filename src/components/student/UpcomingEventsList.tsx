import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface UpcomingEventItem {
  id: string;
  title: string;
  category: 'exam' | 'assignment' | 'event' | 'fee' | 'library';
  date: string;
  time?: string;
  location?: string;
}

const DEFAULT_EVENTS: UpcomingEventItem[] = [
  { id: 'ev-1', title: 'DBMS Assignment 3 Due Date', category: 'assignment', date: 'Tomorrow', time: '11:59 PM' },
  { id: 'ev-2', title: 'Data Structures Mid-Term Exam', category: 'exam', date: '25 Aug 2026', time: '10:00 AM' },
  { id: 'ev-3', title: 'Clean Code Book Return Deadline', category: 'library', date: '28 Aug 2026', time: '05:00 PM' },
  { id: 'ev-4', title: 'Semester 8 Tuition Fee Due Date', category: 'fee', date: '30 Aug 2026', time: 'End of Day' },
  { id: 'ev-5', title: 'National Tech Symposium & Hackathon', category: 'event', date: '05 Sep 2026', time: '09:00 AM' }
];

export const UpcomingEventsList: React.FC = () => {
  const navigate = useNavigate();

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'exam':
        return { label: 'Exam', color: 'c1-badge-error', icon: 'fa-receipt' };
      case 'assignment':
        return { label: 'Deadline', color: 'c1-badge-warning', icon: 'fa-file-invoice' };
      case 'library':
        return { label: 'Library', color: 'c1-badge-cyan', icon: 'fa-book' };
      case 'fee':
        return { label: 'Finance', color: 'c1-badge-primary', icon: 'fa-wallet' };
      case 'event':
      default:
        return { label: 'Campus Event', color: 'c1-badge-success', icon: 'fa-calendar-star' };
    }
  };

  return (
    <div className="c1-card upcoming-events-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Upcoming Schedule</h3>
          <p className="c1-card-subtitle">Chronological deadlines & milestones</p>
        </div>
        <button
          type="button"
          className="c1-btn c1-btn-secondary btn-header-action"
          onClick={() => navigate('/student/timetable')}
        >
          <span>View All</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="events-timeline-list">
        {DEFAULT_EVENTS.map((event) => {
          const meta = getCategoryMeta(event.category);
          return (
            <div key={event.id} className="timeline-event-item">
              <div className="timeline-indicator">
                <span className="timeline-bullet"></span>
                <span className="timeline-connector"></span>
              </div>

              <div className="timeline-content">
                <div className="timeline-top">
                  <span className={`c1-badge ${meta.color} event-category-pill`}>
                    <i className={`fa-solid ${meta.icon}`}></i> {meta.label}
                  </span>
                  <span className="event-date-text">{event.date}</span>
                </div>
                <h4 className="event-title-text">{event.title}</h4>
                {event.time && (
                  <span className="event-time-text">
                    <i className="fa-regular fa-clock"></i> {event.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
