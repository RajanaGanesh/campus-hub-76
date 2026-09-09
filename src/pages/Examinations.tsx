import React, { useState, useEffect } from 'react';
import { lmsData, ExamItem } from '../data/lmsData';

export const Examinations: React.FC = () => {
  const [exams] = useState<ExamItem[]>(lmsData.exams);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Active modal exam detail
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

  // Reminder states (stores exam ID -> boolean)
  const [reminders, setReminders] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('campushub_exam_reminders');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Countdown state for nearest exam
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Dynamic upcoming target date (+3 days 14 hours ahead)
    const targetTime = new Date(Date.now() + (3 * 24 + 14) * 3600 * 1000 + 45 * 60 * 1000).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleReminder = (examId: string) => {
    const nextReminders = { ...reminders, [examId]: !reminders[examId] };
    setReminders(nextReminders);
    localStorage.setItem('campushub_exam_reminders', JSON.stringify(nextReminders));

    if (nextReminders[examId]) {
      setReminderToast('Exam reminder enabled');
      setTimeout(() => setReminderToast(null), 2500);
    }
  };

  // Filtered timetable
  const filteredExams = exams.filter((ex) => {
    const matchSearch = ex.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || ex.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Exams Header */}
      <div className="dashboard-header">
        <h1>Examinations</h1>
        <p>View your upcoming examinations, schedules, and examination details.</p>
      </div>

      {/* Reminder Alert Toast */}
      {reminderToast && (
        <div className="toast-msg" style={{ zIndex: 100 }}>
          <i className="fa-solid fa-bell-slash" style={{ color: 'var(--accent-highlight)' }}></i>
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Dynamic Countdown Header */}
      <div className="c1-card exam-countdown-hero-banner" style={{ margin: 0 }}>
        <div className="countdown-hero-left">
          <div className="countdown-badge">
            <span className="pulse-circle"></span>
            <span>NEAREST SCHEDULED EXAMINATION</span>
          </div>
          <h2 className="countdown-exam-title">
            Data Structures & Algorithms <span className="exam-code-tag">(CS301)</span>
          </h2>
          <div className="countdown-exam-meta">
            <span className="meta-pill"><i className="fa-regular fa-calendar"></i> In 3 Days (Tuesday)</span>
            <span className="meta-pill"><i className="fa-regular fa-clock"></i> 10:00 AM – 01:00 PM</span>
            <span className="meta-pill"><i className="fa-solid fa-location-dot"></i> Hall: CSE-204</span>
            <span className="meta-pill desk-pill"><i className="fa-solid fa-chair"></i> Desk: B-14</span>
          </div>
        </div>

        <div className="countdown-hero-right">
          <div className="pro-timer-widget">
            <div className="pro-timer-header">
              <span className="pro-timer-pulse-indicator"></span>
              <span className="pro-timer-title">EXAM COUNTDOWN</span>
              <span className="pro-timer-badge">LIVE SYNC</span>
            </div>
            <div className="pro-timer-digits-container">
              <div className="pro-timer-unit-card">
                <div className="pro-timer-card-inner">
                  <span className="pro-timer-number">{String(countdown.days).padStart(2, '0')}</span>
                  <div className="pro-timer-card-divider"></div>
                </div>
                <span className="pro-timer-label">DAYS</span>
              </div>
              <div className="pro-timer-separator">
                <span className="pro-timer-dot"></span>
                <span className="pro-timer-dot"></span>
              </div>
              <div className="pro-timer-unit-card">
                <div className="pro-timer-card-inner">
                  <span className="pro-timer-number">{String(countdown.hours).padStart(2, '0')}</span>
                  <div className="pro-timer-card-divider"></div>
                </div>
                <span className="pro-timer-label">HOURS</span>
              </div>
              <div className="pro-timer-separator">
                <span className="pro-timer-dot"></span>
                <span className="pro-timer-dot"></span>
              </div>
              <div className="pro-timer-unit-card">
                <div className="pro-timer-card-inner">
                  <span className="pro-timer-number">{String(countdown.minutes).padStart(2, '0')}</span>
                  <div className="pro-timer-card-divider"></div>
                </div>
                <span className="pro-timer-label">MINS</span>
              </div>
              <div className="pro-timer-separator">
                <span className="pro-timer-dot"></span>
                <span className="pro-timer-dot"></span>
              </div>
              <div className="pro-timer-unit-card pro-timer-seconds-card">
                <div className="pro-timer-card-inner">
                  <span className="pro-timer-number pro-timer-accent-number">{String(countdown.seconds).padStart(2, '0')}</span>
                  <div className="pro-timer-card-divider"></div>
                </div>
                <span className="pro-timer-label">SECS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary grid */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-receipt"></i>
            </div>
          </div>
          <div className="stat-card-value">3</div>
          <div className="stat-card-desc">Upcoming Exams</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-desc">Completed Exams</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-hourglass-start"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '20px', fontWeight: '800' }}>DS</div>
          <div className="stat-card-desc">Next Exam: Data Structures</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
          <div className="stat-card-value">VIII</div>
          <div className="stat-card-desc">Current Semester</div>
        </div>
      </div>

      {/* Cards Deck */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {exams.map((ex) => (
          <div key={ex.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '600' }}>{ex.type}</span>
                <span className="subject-att-status good" style={{ fontSize: '9px' }}>{ex.status}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{ex.subject}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                <div>Date: <strong style={{ color: 'white' }}>{new Date(ex.dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                <div>Time: <strong style={{ color: 'white' }}>{ex.time}</strong></div>
                <div>Room: <strong style={{ color: 'white' }}>{ex.room}</strong></div>
                <div>Duration: <strong style={{ color: 'white' }}>{ex.duration}</strong></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn-view-all"
                style={{ flex: 1, margin: 0, border: '1px solid var(--accent-primary)', color: 'white' }}
                onClick={() => setSelectedExam(ex)}
              >
                View Details
              </button>
              <button
                type="button"
                className="btn-view-all"
                style={{ 
                  flex: 1, 
                  margin: 0, 
                  background: reminders[ex.id] ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)',
                  borderColor: reminders[ex.id] ? 'var(--accent-primary)' : 'var(--border-color)',
                  color: 'white' 
                }}
                onClick={() => handleToggleReminder(ex.id)}
              >
                <i className={`fa-solid ${reminders[ex.id] ? 'fa-bell' : 'fa-bell-slash'}`} style={{ marginRight: '6px' }}></i>
                {reminders[ex.id] ? 'Reminder Set' : 'Set Reminder'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Schedules Table */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <h3>Examination Timetable</h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
              <input
                type="text"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 12px 6px 28px',
                  fontSize: '12px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#100f2e',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="All">All Exams</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Date & Day</th>
                <th style={{ padding: '12px' }}>Subject</th>
                <th style={{ padding: '12px' }}>Time</th>
                <th style={{ padding: '12px' }}>Room</th>
                <th style={{ padding: '12px' }}>Type</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.length > 0 ? (
                filteredExams.map((ex) => {
                  const dateObj = new Date(ex.dateStr);
                  const dateFormatted = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                  const dayFormatted = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  
                  return (
                    <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{dateFormatted} ({dayFormatted})</td>
                      <td style={{ padding: '12px' }}>{ex.subject}</td>
                      <td style={{ padding: '12px' }}>{ex.time}</td>
                      <td style={{ padding: '12px', color: 'var(--accent-highlight)' }}>{ex.room}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{ex.type}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="subject-att-status good" style={{ fontSize: '9.5px' }}>{ex.status}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No exams found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedExam && (
        <div className="search-modal-overlay" onClick={() => setSelectedExam(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '18px' }}>{selectedExam.subject} Details</h2>
              <button type="button" className="btn-search-close" onClick={() => setSelectedExam(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Exam Type:</span> <strong style={{ color: 'white' }}>{selectedExam.type}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Room:</span> <strong style={{ color: 'white' }}>{selectedExam.room}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Duration:</span> <strong style={{ color: 'white' }}>{selectedExam.duration}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Date:</span> <strong style={{ color: 'white' }}>{new Date(selectedExam.dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Time:</span> <strong style={{ color: 'white' }}>{selectedExam.time}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Status:</span> <span className="subject-att-status good">{selectedExam.status}</span></div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'white' }}>Important Instructions</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                  <li>Carry your college ID card.</li>
                  <li>Arrive at the examination hall 15 minutes before the exam starts.</li>
                  <li>Electronic devices (smartphones, calculators, smartwatches) are not permitted inside the hall.</li>
                  <li>Follow examination hall invigilator instructions at all times.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Examinations;
