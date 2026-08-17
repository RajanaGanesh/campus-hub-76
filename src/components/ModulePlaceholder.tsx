import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ModulePlaceholderProps {
  title: string;
  icon?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, icon = 'fa-cubes' }) => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-container">
      <div className="coming-soon-card card-panel">
        <div className="coming-soon-icon-box">
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <h1>{title}</h1>
        <p>
          The detailed modules and functional panels for this section are scheduled for development in later milestones.
        </p>
        <button
          type="button"
          className="btn-back-home"
          onClick={() => navigate('/')}
        >
          <i className="fa-solid fa-house"></i>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
