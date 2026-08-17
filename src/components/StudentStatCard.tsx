import React from 'react';

interface StudentStatCardProps {
  icon: string;
  title: string;
  value: string | number;
  description: string;
  status: string;
  statusType: 'good' | 'excellent' | 'due' | 'active';
  progress?: number;
  colorVariant: 'primary' | 'cyan' | 'green' | 'red';
}

export const StudentStatCard: React.FC<StudentStatCardProps> = ({
  icon,
  title,
  value,
  description,
  status,
  statusType,
  progress,
  colorVariant
}) => {
  return (
    <div className="card-panel stat-card">
      <div className="stat-card-row">
        <div className={`stat-card-icon ${colorVariant}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <span className={`stat-card-trend ${statusType}`}>
          {status}
        </span>
      </div>
      
      <div className="stat-card-value" style={{ margin: '8px 0 4px 0' }}>{value}</div>
      <div className="stat-card-desc" style={{ marginBottom: progress !== undefined ? '10px' : '0' }}>
        <strong>{title}</strong> • {description}
      </div>

      {progress !== undefined && (
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent-highlight), var(--accent-primary))',
              borderRadius: '2px'
            }} 
          />
        </div>
      )}
    </div>
  );
};
export default StudentStatCard;
