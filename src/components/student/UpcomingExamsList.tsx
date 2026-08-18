import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UpcomingExam } from '../../data/studentDashboardData';

export interface UpcomingExamsListProps {
  exams?: UpcomingExam[];
}

const DEFAULT_EXAMS: UpcomingExam[] = [
  { subject: 'Data Structures & Algorithms (CS301)', date: '25 Aug 2026', time: '10:00 AM - 01:00 PM', room: 'Hall: CSE-204', daysLeft: 9 },
  { subject: 'Database Management Systems (CS302)', date: '28 Aug 2026', time: '10:00 AM - 01:00 PM', room: 'Hall: CSE-202', daysLeft: 12 },
  { subject: 'Computer Networks & Security (CS304)', date: '30 Aug 2026', time: '02:00 PM - 05:00 PM', room: 'Hall: CSE-301', daysLeft: 14 }
];

export const UpcomingExamsList: React.FC<UpcomingExamsListProps> = ({
  exams = DEFAULT_EXAMS
}) => {
  const navigate = useNavigate();

  return (
    <div className="c1-card upcoming-exams-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Upcoming Examinations</h3>
          <p className="c1-card-subtitle">Mid-semester theoretical & lab evaluations</p>
        </div>
        <button
          type="button"
          className="c1-btn c1-btn-secondary btn-header-action"
          onClick={() => navigate('/student/exams')}
        >
          <span>View Schedule</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="exams-list-container">
        {exams.map((exam, idx) => (
          <div key={idx} className="exam-item-row">
            <div className="exam-calendar-badge">
              <span className="exam-cal-month">{exam.date.split(' ')[1]}</span>
              <span className="exam-cal-day">{exam.date.split(' ')[0]}</span>
            </div>

            <div className="exam-item-info">
              <h4 className="exam-item-name">{exam.subject}</h4>
              <div className="exam-item-meta">
                <span className="exam-time-tag">
                  <i className="fa-regular fa-clock"></i> {exam.time}
                </span>
                <span className="exam-room-tag">
                  <i className="fa-solid fa-location-dot"></i> {exam.room}
                </span>
              </div>
            </div>

            <div className="exam-item-countdown">
              <span className={`c1-badge ${exam.daysLeft <= 10 ? 'c1-badge-error' : 'c1-badge-primary'}`}>
                <i className="fa-solid fa-hourglass-start"></i> {exam.daysLeft} Days Left
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
