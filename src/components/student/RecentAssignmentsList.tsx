import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PendingAssignment } from '../../data/studentDashboardData';

export interface RecentAssignmentsListProps {
  assignments?: PendingAssignment[];
}

export const RecentAssignmentsList: React.FC<RecentAssignmentsListProps> = ({
  assignments = []
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'due soon':
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-clock"></i> Due Soon</span>;
      case 'submitted':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-circle-check"></i> Submitted</span>;
      case 'overdue':
      case 'late':
        return <span className="c1-badge c1-badge-error"><i className="fa-solid fa-circle-exclamation"></i> Overdue</span>;
      case 'graded':
        return <span className="c1-badge c1-badge-cyan"><i className="fa-solid fa-award"></i> Graded</span>;
      default:
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-hourglass-half"></i> Pending</span>;
    }
  };

  const getPriorityTag = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <span className="priority-tag priority-high"><i className="fa-solid fa-circle"></i> High Priority</span>;
      case 'medium':
        return <span className="priority-tag priority-medium"><i className="fa-solid fa-circle"></i> Medium</span>;
      default:
        return <span className="priority-tag priority-low"><i className="fa-solid fa-circle"></i> Normal</span>;
    }
  };

  return (
    <div className="c1-card recent-assignments-card">
      <div className="c1-card-header">
        <div>
          <h3 className="c1-card-title">Recent Assignments</h3>
          <p className="c1-card-subtitle">Active submissions and homework deadlines</p>
        </div>
        <button
          type="button"
          className="c1-btn c1-btn-secondary btn-header-action"
          onClick={() => navigate('/student/assignments')}
        >
          <span>View All ({assignments.length})</span>
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <div className="assignments-list-container">
        {assignments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 16px',
            color: 'var(--text-muted)'
          }}>
            <i className="fa-solid fa-clipboard-check" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.35, display: 'block' }}></i>
            <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>No Pending Assignments</h4>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>All course homework submissions are up to date.</p>
          </div>
        ) : (
          assignments.map((item, idx) => (
            <div key={idx} className="assignment-item-row">
              <div className="assignment-item-icon">
                <i className="fa-solid fa-file-lines"></i>
              </div>

              <div className="assignment-item-details">
                <div className="assignment-top-meta">
                  <span className="assignment-subject-tag">{item.subject}</span>
                  {getPriorityTag(item.priority)}
                </div>
                <h4 className="assignment-item-title">{item.title}</h4>
                <div className="assignment-bottom-meta">
                  <span className="assignment-due-date">
                    <i className="fa-regular fa-calendar-xmark"></i> Due: {item.due}
                  </span>
                </div>
              </div>

              <div className="assignment-item-status">
                {getStatusBadge(item.status)}
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary btn-submit-micro"
                  onClick={() => navigate('/student/assignments')}
                >
                  <span>Submit</span>
                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
