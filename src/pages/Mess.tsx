import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mobilityData, MessFeedback } from '../data/mobilityData';

export const Mess: React.FC = () => {
  const navigate = useNavigate();

  // Selected Day state (Mon-Sun, default to Monday or Today)
  const [selectedDayName, setSelectedDayName] = useState('Monday');

  // Load mess feedbacks from local storage
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_mess_feedbacks');
      return stored ? JSON.parse(stored) : mobilityData.feedbacks;
    } catch {
      return mobilityData.feedbacks;
    }
  });

  // Give Feedback fields
  const [fbMeal, setFbMeal] = useState('Lunch');
  const [fbRating, setFbRating] = useState(5);
  const [fbComments, setFbComments] = useState('');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedDayMenu = mobilityData.weeklyMenu.find((m) => m.day === selectedDayName) || mobilityData.weeklyMenu[0];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newFb: MessFeedback = {
      id: `mess-fb-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      meal: fbMeal,
      rating: fbRating,
      comments: fbComments.trim()
    };

    const nextFbs = [newFb, ...feedbacks];
    setFeedbacks(nextFbs);
    localStorage.setItem('campushub_mess_feedbacks', JSON.stringify(nextFbs));

    setFbComments('');
    setFbRating(5);
    setToastMsg('Feedback submitted successfully. Thank you!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back navigation */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/hostel')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Hostel Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Hostel / Mess & Dining</span>
      </div>

      <div className="dashboard-header">
        <h1>Mess & Dining</h1>
        <p>View today's menu, meal timings, and mess information.</p>
      </div>

      {/* Toast message alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Grid: Meal timings on left, Weekly switcher on right */}
      <div className="dashboard-main-grid">
        {/* Meal Timings Card */}
        <div className="card-panel" style={{ flex: 1 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Meal Timings</h3>
            <i className="fa-solid fa-clock" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Breakfast', time: '07:30 AM – 09:00 AM' },
              { label: 'Lunch', time: '12:30 PM – 02:00 PM' },
              { label: 'Snacks', time: '04:30 PM – 05:30 PM' },
              { label: 'Dinner', time: '07:30 PM – 09:00 PM' }
            ].map((meal, idx) => (
              <div key={idx} className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>{meal.label}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--accent-highlight)' }}>{meal.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Give Feedback Panel */}
        <div className="card-panel" style={{ flex: 1.2 }}>
          <div className="card-panel-header" style={{ marginBottom: '16px' }}>
            <h3>Mess Performance Feedback</h3>
            <i className="fa-solid fa-star" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Select Meal</label>
                <select
                  value={fbMeal}
                  onChange={(e) => setFbMeal(e.target.value)}
                  style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Rating (1 - 5 Stars)</label>
                <div style={{ display: 'flex', gap: '6px', paddingTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFbRating(num)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: num <= fbRating ? '#ffb236' : 'var(--text-secondary)' }}
                    >
                      <i className="fa-solid fa-star" style={{ fontSize: '16px' }}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Comments / Remarks</label>
              <textarea
                rows={2}
                value={fbComments}
                onChange={(e) => setFbComments(e.target.value)}
                placeholder="e.g. Rice quality was excellent, Paneer quantity could be improved..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <button type="submit" className="btn-signin" style={{ height: '36px', margin: 0, fontSize: '12px' }}>
              Submit Feedback
            </button>
          </form>
        </div>
      </div>

      {/* Weekly Menu Switcher */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Weekly Mess Menu</h3>
          <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        {/* Day selection tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '16px' }}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName) => (
            <button
              key={dayName}
              type="button"
              className={`btn-sso ${selectedDayName === dayName ? 'active' : ''}`}
              onClick={() => setSelectedDayName(dayName)}
              style={{
                height: '34px',
                padding: '0 16px',
                borderRadius: '6px',
                fontSize: '12.5px',
                whiteSpace: 'nowrap',
                background: selectedDayName === dayName ? 'var(--accent-primary)' : 'rgba(255,255,255,0.01)',
                borderColor: selectedDayName === dayName ? 'var(--accent-primary)' : 'var(--border-color)'
              }}
            >
              {dayName}
            </button>
          ))}
        </div>

        {/* Selected Menu items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Breakfast', value: selectedDayMenu.Breakfast },
            { label: 'Lunch', value: selectedDayMenu.Lunch },
            { label: 'Snacks', value: selectedDayMenu.Snacks },
            { label: 'Dinner', value: selectedDayMenu.Dinner }
          ].map((meal, idx) => (
            <div key={idx} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
                <strong style={{ fontSize: '14px', color: 'white' }}>{meal.label}</strong>
                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{meal.value.timing}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{meal.value.menuItems}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Mess;
