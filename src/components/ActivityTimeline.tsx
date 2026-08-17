import React from 'react';

export interface ActivityEvent {
  title: string;
  detail: string;
  time: string;
  icon: string;
}

interface ActivityTimelineProps {
  activities: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  return (
    <div className="card-panel" style={{ height: 'fit-content' }}>
      <div className="card-panel-header" style={{ marginBottom: '20px' }}>
        <h3>Recent Activity</h3>
        <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--text-secondary)' }}></i>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        {/* Central Vertical Line */}
        <div
          style={{
            position: 'absolute',
            left: '17px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            background: 'rgba(255,255,255,0.04)',
            zIndex: 1
          }}
        />

        {activities.map((act, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '16px',
              position: 'relative',
              zIndex: 2,
              alignItems: 'flex-start'
            }}
          >
            {/* Timeline Icon Badge */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                fontSize: '13px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <i className={`fa-solid ${act.icon}`}></i>
            </div>

            {/* Event Info Details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{act.title}</span>
                <span style={{ fontSize: '10px', color: '#555365', fontWeight: '600' }}>{act.time}</span>
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                {act.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ActivityTimeline;
