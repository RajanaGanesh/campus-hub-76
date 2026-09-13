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

export interface UpcomingEventsListProps {
  events?: UpcomingEventItem[];
}

export const UpcomingEventsList: React.FC<UpcomingEventsListProps> = ({
  events = []
}) => {
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
        {events.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '28px 16px',
            color: 'var(--text-muted)'
          }}>
            <i className="fa-regular fa-calendar-check" style={{ fontSize: '2rem', marginBottom: '10px', opacity: 0.35, display: 'block' }}></i>
            <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>No Upcoming Events</h4>
            <p style={{ margin: 0, fontSize: '0.8rem' }}>Your schedule is clear for the coming days.</p>
          </div>
        ) : (
          events.map((event) => {
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
          })
        )}
      </div>
    </div>
  );
};
