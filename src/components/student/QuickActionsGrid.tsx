import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickActionsGrid: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { id: 'qa-attendance', label: 'Attendance', icon: 'fa-user-check', color: '#6366f1', route: '/student/attendance' },
    { id: 'qa-timetable', label: 'Timetable', icon: 'fa-calendar-days', color: '#38bdf8', route: '/student/timetable' },
    { id: 'qa-assignments', label: 'Assignments', icon: 'fa-file-invoice', color: '#10b981', route: '/student/assignments' },
    { id: 'qa-results', label: 'Results & GPA', icon: 'fa-award', color: '#f59e0b', route: '/student/results' },
    { id: 'qa-library', label: 'Library Catalog', icon: 'fa-book-open', color: '#ec4899', route: '/student/library' },
    { id: 'qa-fees', label: 'Pay Fees', icon: 'fa-wallet', color: '#8b5cf6', route: '/student/fees' },
    { id: 'qa-placements', label: 'Placements', icon: 'fa-briefcase', color: '#06b6d4', route: '/student/placements' },
    { id: 'qa-notices', label: 'Notice Board', icon: 'fa-bullhorn', color: '#f43f5e', route: '/student/notices' }
  ];

  return (
    <div className="c1-card quick-actions-panel">
      <div className="c1-card-header" style={{ marginBottom: '16px' }}>
        <div>
          <h3 className="c1-card-title">Quick Actions</h3>
          <p className="c1-card-subtitle">Frequent campus modules and direct navigation</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className="quick-action-tile"
            onClick={() => navigate(action.route)}
          >
            <div className="action-tile-icon" style={{ color: action.color, borderColor: `${action.color}33`, background: `${action.color}14` }}>
              <i className={`fa-solid ${action.icon}`}></i>
            </div>
            <span className="action-tile-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
