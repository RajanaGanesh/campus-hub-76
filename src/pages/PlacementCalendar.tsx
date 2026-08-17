import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementsData, PlacementEvent } from '../data/placementsData';

export const PlacementCalendar: React.FC = () => {
  const navigate = useNavigate();

  // Load events
  const [events, setEvents] = useState<PlacementEvent[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_events');
      return stored ? JSON.parse(stored) : placementsData.events;
    } catch {
      return placementsData.events;
    }
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRegisterEvent = (eventId: string, title: string) => {
    const nextEvents = events.map((ev) => {
      if (ev.id === eventId) {
        return {
          ...ev,
          isRegistered: true
        };
      }
      return ev;
    });

    setEvents(nextEvents);
    localStorage.setItem('campushub_career_events', JSON.stringify(nextEvents));
    setToastMsg(`Registration successful for "${title}". Event added to your placement calendar.`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const getEventIcon = (type: PlacementEvent['type']) => {
    switch (type) {
      case 'Pre-placement Talk':
        return 'fa-bullhorn';
      case 'Aptitude Test':
      case 'Coding Test':
        return 'fa-code';
      case 'Technical Interview':
      case 'HR Interview':
        return 'fa-comments';
      case 'Placement Drive':
      default:
        return 'fa-calendar-days';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header back navigation */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/placements')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Placements Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Careers / Placement Calendar</span>
      </div>

      <div className="dashboard-header">
        <h1>Placement Calendar</h1>
        <p>Track upcoming recruitment drives, coding rounds, and interview calls.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Events Agenda List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.length > 0 ? (
          events.map((ev) => (
            <div key={ev.id} className="card-panel" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', padding: '24px' }}>
              {/* Date Box */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', minWidth: '90px', padding: '14px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {ev.date.split(' ')[1]}
                </span>
                <strong style={{ fontSize: '24px', fontWeight: '900', color: 'white', display: 'block', margin: '4px 0' }}>
                  {ev.date.split(' ')[0]}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '600' }}>
                  {ev.date.split(' ')[2]}
                </span>
              </div>

              {/* Event Details */}
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' }}>
                  <span className="subject-att-status good" style={{ fontSize: '9px', textTransform: 'uppercase', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                    <i className={`fa-solid ${getEventIcon(ev.type)}`}></i>
                    {ev.type}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>at {ev.time} • Venue: {ev.venue}</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{ev.title}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Company: <strong>{ev.company}</strong></span>
                
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.5' }}>{ev.description}</p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: '12px' }}>
                  <div>Eligibility: <strong style={{ color: 'white' }}>{ev.eligibility}</strong></div>
                  <div>Reg Deadline: <strong style={{ color: 'var(--color-error)' }}>{ev.registrationDeadline}</strong></div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {ev.isRegistered ? (
                  <button
                    type="button"
                    className="btn-view-all"
                    style={{ background: 'rgba(0, 216, 154, 0.05)', borderColor: '#00d89a', color: '#00d89a', margin: 0, width: '110px' }}
                    disabled
                  >
                    Registered
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-signin"
                    style={{ margin: 0, height: '36px', width: '110px', fontSize: '12.5px' }}
                    onClick={() => handleRegisterEvent(ev.id, ev.title)}
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No upcoming placement events</h3>
            <p style={{ fontSize: '12.5px' }}>Check back again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default PlacementCalendar;
