import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1. STAT CARD
interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  trend?: {
    value: string;
    type: 'up' | 'down';
  };
  colorVariant?: 'primary' | 'cyan' | 'green' | 'red';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  description,
  trend,
  colorVariant = 'primary',
}) => {
  return (
    <div className="card-panel stat-card">
      <div className="stat-card-row">
        <div className={`stat-card-icon ${colorVariant}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        {trend && (
          <span className={`stat-card-trend ${trend.type}`}>
            {trend.type === 'up' ? '+' : ''}
            {trend.value}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-desc">{title} • {description}</div>
    </div>
  );
};

// 2. QUICK ACCESS CARD
interface QuickAccessCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  icon,
  title,
  description,
  path,
}) => {
  const navigate = useNavigate();

  return (
    <div className="quick-card" onClick={() => navigate(path)}>
      <div className="quick-card-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="quick-card-details">
        <span className="quick-card-title">{title}</span>
        <span className="quick-card-desc">{description}</span>
      </div>
    </div>
  );
};

// 3. SCHEDULE CARD (TODAY'S TIMETABLE ITEM)
interface ScheduleItem {
  time: string;
  duration: string;
  subject: string;
  room: string;
  faculty: string;
  isActive?: boolean;
}

interface ScheduleCardProps {
  schedule: ScheduleItem[];
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule }) => {
  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3>Today's Schedule</h3>
        <i className="fa-solid fa-calendar-day" style={{ color: 'var(--text-secondary)' }}></i>
      </div>
      <div className="timetable-list">
        {schedule.map((item, idx) => (
          <div
            key={idx}
            className={`timetable-item ${item.isActive ? 'active-class' : ''}`}
          >
            <div className="class-time">
              <span className="time-start">{item.time}</span>
              <span className="time-duration">{item.duration}</span>
            </div>
            <div className="class-subject">
              <span className="class-subject-name">{item.subject}</span>
              <div className="class-details">
                <span>
                  <i className="fa-solid fa-location-dot"></i> {item.room}
                </span>
                <span>
                  <i className="fa-solid fa-chalkboard-user"></i> {item.faculty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. ATTENDANCE CARD
interface SubjectAttendance {
  name: string;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
}

interface AttendanceCardProps {
  overallPercentage: number;
  subjects: SubjectAttendance[];
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  overallPercentage,
  subjects,
}) => {
  // Circular progress dimensions: radius=40, circum=251.2
  const r = 40;
  const strokeDasharray = 2 * Math.PI * r;
  const strokeDashoffset = strokeDasharray - (overallPercentage / 100) * strokeDasharray;

  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3>Attendance Overview</h3>
        <i className="fa-solid fa-user-check" style={{ color: 'var(--text-secondary)' }}></i>
      </div>
      <div className="attendance-card-body">
        <div className="attendance-circle-container">
          <svg className="attendance-circle-svg">
            <defs>
              <linearGradient id="grad-attendance" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--accent-highlight)" />
                <stop offset="100%" stopColor="var(--accent-primary)" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r={r} className="attendance-circle-bg" />
            <circle
              cx="50"
              cy="50"
              r={r}
              className="attendance-circle-bar"
              style={{
                strokeDasharray: strokeDasharray.toFixed(1),
                strokeDashoffset: strokeDashoffset.toFixed(1),
              }}
            />
          </svg>
          <span className="attendance-circle-val">{overallPercentage}%</span>
        </div>

        <div className="attendance-breakdown">
          {subjects.map((sub, idx) => (
            <div key={idx} className="subject-att-row">
              <div className="subject-att-header">
                <span className="subject-att-name">{sub.name}</span>
                <span className="subject-att-value">
                  {sub.percentage}%{' '}
                  <span className={`subject-att-status ${sub.status}`}>
                    {sub.status}
                  </span>
                </span>
              </div>
              <div className="subject-att-track">
                <div
                  className={`subject-att-bar ${sub.status}`}
                  style={{ width: `${sub.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. ANNOUNCEMENT CARD
interface AnnouncementItem {
  title: string;
  category: string;
  date: string;
  desc: string;
}

interface AnnouncementCardProps {
  announcements: AnnouncementItem[];
  onViewAllClick?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcements,
  onViewAllClick,
}) => {
  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3>Campus Announcements</h3>
        <i className="fa-solid fa-bullhorn" style={{ color: 'var(--text-secondary)' }}></i>
      </div>
      <div className="announcements-list">
        {announcements.map((ann, idx) => (
          <div key={idx} className="announcement-item">
            <div className="announcement-tag-row">
              <span className="announcement-tag">{ann.category}</span>
              <span className="announcement-date">{ann.date}</span>
            </div>
            <h4 className="announcement-title">{ann.title}</h4>
            <p className="announcement-body">{ann.desc}</p>
          </div>
        ))}
        {onViewAllClick && (
          <button type="button" className="btn-view-all" onClick={onViewAllClick}>
            View All
          </button>
        )}
      </div>
    </div>
  );
};

// 6. EVENT CARD (TIMELINE TIMESTAMPS)
interface EventItem {
  day: string;
  month: string;
  category: string;
  title: string;
  time: string;
}

interface EventCardProps {
  events: EventItem[];
}

export const EventCard: React.FC<EventCardProps> = ({ events }) => {
  return (
    <div className="card-panel">
      <div className="card-panel-header">
        <h3>Upcoming Timeline</h3>
        <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-secondary)' }}></i>
      </div>
      <div className="events-timeline">
        {events.map((event, idx) => (
          <div key={idx} className="event-item">
            <div className="event-date-box">
              <span className="event-date-day">{event.day}</span>
              <span className="event-date-month">{event.month}</span>
            </div>
            <div className="event-content">
              <span className="event-tag">{event.category}</span>
              <span className="event-title">{event.title}</span>
              <span className="event-meta">{event.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. AI INSIGHT CARD
export const AIInsightCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="card-panel ai-insight-card">
      <div className="ai-insight-header">
        <i className="fa-solid fa-robot"></i>
        <h3>Campus Hub AI</h3>
      </div>
      <div className="ai-insight-text">
        Need help with your campus life? Ask questions about academics, schedules, attendance, fees, placements, and more.
      </div>
      <button
        type="button"
        className="btn-ai-ask"
        onClick={() => navigate('/ai')}
      >
        Ask Campus Hub AI
      </button>
    </div>
  );
};
