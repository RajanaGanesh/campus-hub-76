import React, { useState } from 'react';
import { academicData } from '../data/academicData';

export const Timetable: React.FC = () => {
  
  // Views: 'day' | 'week'
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [activeDay, setActiveDay] = useState<string>('Monday');

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM'];

  // Simulated live class coordinates
  // Assume: Monday at 10:15 AM (overlaps Database Management 10:00 AM - 11:30 AM)
  const isSimulatedMonday = activeDay === 'Monday';
  
  // Custom highlight function for current slot
  const isSlotLive = (day: string, time: string) => {
    return day === 'Monday' && time === '10:00 AM';
  };

  const getSlotDetails = (day: string, time: string) => {
    const dayClasses = academicData.timetable[day] || [];
    return dayClasses.find((c) => c.time === time) || null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Timetable Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Class Timetable</h1>
          <p>Your weekly academic schedule.</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <div><strong style={{ color: 'white' }}>Department:</strong> Computer Science & Engineering</div>
          <div><strong style={{ color: 'white' }}>Section:</strong> IV Year • CSE-A</div>
        </div>
      </div>

      {/* Current Class Highlight Widget */}
      {isSimulatedMonday && (
        <div className="card-panel ai-insight-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', padding: '18px 24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="subject-att-status critical" style={{ animation: 'shake 1.5s infinite', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} /> CURRENT CLASS
              </span>
              <strong style={{ color: 'white', fontSize: '15px' }}>Database Management</strong>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Room: <strong style={{ color: 'white' }}>CSE-202</strong> • Instructor: <strong style={{ color: 'white' }}>Prof. Priya</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Ends in</span>
            <strong style={{ fontSize: '18px', color: 'var(--accent-highlight)' }}>75 minutes</strong>
          </div>
        </div>
      )}

      {/* View Toggles & Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Day selection */}
        {viewMode === 'day' ? (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
            {daysList.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`btn-sso ${activeDay === day ? 'active' : ''}`}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  background: activeDay === day ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                  borderColor: activeDay === day ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: 'white',
                  fontSize: '12.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                {day}
              </button>
            ))}
          </div>
        ) : <div />}

        {/* View Mode Day/Week toggler */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '3px' }}>
          <button
            type="button"
            className={`btn-sso ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
            style={{
              height: '30px',
              padding: '0 14px',
              borderRadius: '6px',
              background: viewMode === 'day' ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderColor: 'transparent',
              fontSize: '12px',
              fontWeight: viewMode === 'day' ? '700' : '500'
            }}
          >
            Day View
          </button>
          <button
            type="button"
            className={`btn-sso ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
            style={{
              height: '30px',
              padding: '0 14px',
              borderRadius: '6px',
              background: viewMode === 'week' ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderColor: 'transparent',
              fontSize: '12px',
              fontWeight: viewMode === 'week' ? '700' : '500'
            }}
          >
            Week View
          </button>
        </div>
      </div>

      {/* TIMETABLE CONTENT */}
      {viewMode === 'day' ? (
        <div className="card-panel">
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Schedules for {activeDay}</h3>
            <i className="fa-solid fa-clock" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div className="timetable-list">
            {(academicData.timetable[activeDay] || []).length > 0 ? (
              (academicData.timetable[activeDay] || []).map((slot, idx) => {
                const live = isSlotLive(activeDay, slot.time);
                return (
                  <div
                    key={idx}
                    className={`timetable-item ${live ? 'active-class' : ''}`}
                  >
                    <div className="class-time">
                      <span className="time-start">{slot.time}</span>
                      <span className="time-duration">{slot.duration}</span>
                    </div>

                    <div className="class-subject">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="class-subject-name">{slot.subject}</span>
                        {live && (
                          <span className="subject-att-status critical" style={{ fontSize: '8px', padding: '1px 4px' }}>
                            Live
                          </span>
                        )}
                      </div>
                      <div className="class-details">
                        <span>
                          <i className="fa-solid fa-location-dot"></i> {slot.room}
                        </span>
                        <span>
                          <i className="fa-solid fa-chalkboard-user"></i> {slot.faculty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '24px', opacity: 0.4, marginBottom: '10px' }}></i>
                <h4>No classes scheduled.</h4>
                <p style={{ fontSize: '12px' }}>Enjoy your holiday!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Week View Grid Layout */
        <div className="card-panel" style={{ padding: '20px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12.5px', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', width: '90px' }}>Time</th>
                  {daysList.map((day) => (
                    <th key={day} style={{ padding: '12px' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '700', textAlign: 'left', color: 'var(--text-secondary)' }}>{time}</td>
                    {daysList.map((day) => {
                      const slot = getSlotDetails(day, time);
                      const live = isSlotLive(day, time);
                      return (
                        <td key={day} style={{ padding: '8px' }}>
                          {slot ? (
                            <div
                              style={{
                                background: live ? 'linear-gradient(135deg, rgba(124, 92, 255, 0.15), rgba(8, 185, 221, 0.08))' : 'rgba(255,255,255,0.01)',
                                border: live ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                borderRadius: '8px',
                                padding: '10px 8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                boxShadow: live ? '0 2px 10px rgba(124,92,255,0.15)' : 'none'
                              }}
                            >
                              <strong style={{ color: 'white', fontSize: '11.5px', display: 'block', lineHeight: '1.2' }}>{slot.subject}</strong>
                              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{slot.room}</span>
                              <span style={{ fontSize: '9px', color: 'var(--accent-highlight)' }}>{slot.faculty}</span>
                            </div>
                          ) : (
                            <div style={{ color: 'rgba(255,255,255,0.05)', fontSize: '11px' }}>-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default Timetable;
