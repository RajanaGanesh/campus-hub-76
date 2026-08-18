import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { academicData, TimetableSlot } from '../../data/academicData';

export const StudentTimetable: React.FC = () => {
  const navigate = useNavigate();

  // Days and slots definitions
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM'];

  // Current day calculation
  const todayName = useMemo(() => {
    const dayIdx = new Date().getDay();
    const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayMap[dayIdx] || 'Monday';
  }, []);

  const [activeDay, setActiveDay] = useState<string>(
    daysList.includes(todayName) ? todayName : 'Monday'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  // Filter states
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');
  const [facultyFilter, setFacultyFilter] = useState('All');

  // Extract unique filter options from data
  const allSlots: TimetableSlot[] = useMemo(() => {
    const slots: TimetableSlot[] = [];
    Object.values(academicData.timetable).forEach((daySlots) => {
      slots.push(...daySlots);
    });
    return slots;
  }, []);

  const subjects = useMemo(() => ['All', ...Array.from(new Set(allSlots.map((s) => s.subject)))], [allSlots]);
  const rooms = useMemo(() => ['All', ...Array.from(new Set(allSlots.map((s) => s.room)))], [allSlots]);
  const faculties = useMemo(() => ['All', ...Array.from(new Set(allSlots.map((s) => s.faculty)))], [allSlots]);

  const hasActiveFilters = subjectFilter !== 'All' || roomFilter !== 'All' || facultyFilter !== 'All';

  const resetFilters = () => {
    setSubjectFilter('All');
    setRoomFilter('All');
    setFacultyFilter('All');
  };

  // Filtered timetable calculation
  const filteredTimetable = useMemo(() => {
    const result: Record<string, TimetableSlot[]> = {};
    daysList.forEach((day) => {
      const rawSlots = academicData.timetable[day] || [];
      result[day] = rawSlots.filter((slot) => {
        const matchSubject = subjectFilter === 'All' || slot.subject === subjectFilter;
        const matchRoom = roomFilter === 'All' || slot.room === roomFilter;
        const matchFaculty = facultyFilter === 'All' || slot.faculty === facultyFilter;
        return matchSubject && matchRoom && matchFaculty;
      });
    });
    return result;
  }, [subjectFilter, roomFilter, facultyFilter, daysList]);

  // Live class simulation: active class in DBMS on Monday 10:00 AM
  const liveClass = {
    subject: 'Database Management Systems',
    code: 'CS302',
    faculty: 'Prof. Priya',
    room: 'CSE-202',
    time: '10:00 AM – 11:30 AM',
    remainingMinutes: 45
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Academic</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Class Timetable</span>
            </div>
            <h1 className="module-title">Class Timetable</h1>
            <p className="module-subtitle">
              Weekly class lecture schedule, lab allocations, and period timings for Computer Science & Engineering.
            </p>
          </div>

          <div className="module-header-meta">
            <div className="meta-badge-box">
              <span className="meta-badge-label">Section & Batch</span>
              <span className="meta-badge-val">IV Year • CSE-A (8th Sem)</span>
            </div>
          </div>
        </div>

        {/* Live / Current Class Alert Widget */}
        <div className="c1-card live-class-alert-card">
          <div className="live-class-left">
            <div className="live-pulse-badge">
              <span className="pulse-circle"></span>
              <span>LIVE LECTURE IN SESSION</span>
            </div>
            <h3 className="live-class-name">
              {liveClass.subject} <span className="live-class-code">({liveClass.code})</span>
            </h3>
            <div className="live-class-meta-row">
              <span><i className="fa-solid fa-chalkboard-user"></i> {liveClass.faculty}</span>
              <span><i className="fa-solid fa-location-dot"></i> Room: {liveClass.room}</span>
              <span><i className="fa-regular fa-clock"></i> {liveClass.time}</span>
            </div>
          </div>

          <div className="live-class-right">
            <div className="time-remaining-bubble">
              <span className="time-rem-label">Session Ends In</span>
              <span className="time-rem-val">{liveClass.remainingMinutes} Mins</span>
            </div>
          </div>
        </div>

        {/* Timetable Controls & Filters Bar */}
        <div className="c1-card timetable-controls-card">
          <div className="controls-top-row">
            {/* Week navigation */}
            <div className="week-nav-group">
              <button
                type="button"
                className="c1-btn c1-btn-secondary btn-icon-only"
                onClick={() => setWeekOffset((prev) => prev - 1)}
                title="Previous Week"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="current-week-label">
                {weekOffset === 0
                  ? 'Current Week'
                  : weekOffset > 0
                  ? `Week +${weekOffset}`
                  : `Week ${weekOffset}`}
              </span>
              <button
                type="button"
                className="c1-btn c1-btn-secondary btn-icon-only"
                onClick={() => setWeekOffset((prev) => prev + 1)}
                title="Next Week"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              {weekOffset !== 0 && (
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary btn-today"
                  onClick={() => setWeekOffset(0)}
                >
                  This Week
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fa-solid fa-table-cells"></i>
                <span>Weekly Grid</span>
              </button>
              <button
                type="button"
                className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
                onClick={() => setViewMode('day')}
              >
                <i className="fa-solid fa-calendar-day"></i>
                <span>Daily View</span>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="filters-grid-row">
            <div className="filter-field">
              <label htmlFor="filter-subject">Subject</label>
              <select
                id="filter-subject"
                className="c1-select"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-room">Classroom / Lab</label>
              <select
                id="filter-room"
                className="c1-select"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                {rooms.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="filter-faculty">Faculty Instructor</label>
              <select
                id="filter-faculty"
                className="c1-select"
                value={facultyFilter}
                onChange={(e) => setFacultyFilter(e.target.value)}
              >
                {faculties.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="filter-reset-action">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary btn-reset-filters"
                  onClick={resetFilters}
                >
                  <i className="fa-solid fa-filter-circle-xmark"></i>
                  <span>Reset</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Day Selection Tabs (Active for Day mode or Mobile) */}
        <div className="day-tabs-scroll">
          {daysList.map((day) => {
            const isToday = day === todayName;
            const isSelected = day === activeDay;
            const slotCount = filteredTimetable[day]?.length || 0;

            return (
              <button
                key={day}
                type="button"
                className={`day-tab-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveDay(day)}
              >
                <div className="day-tab-info">
                  <span className="day-name">{day}</span>
                  <span className="day-slot-count">{slotCount} periods</span>
                </div>
                {isToday && <span className="today-badge">TODAY</span>}
              </button>
            );
          })}
        </div>

        {/* ============================================================
            VIEW 1: DESKTOP WEEKLY GRID
            ============================================================ */}
        {viewMode === 'grid' && (
          <div className="c1-card timetable-grid-card">
            <div className="timetable-grid-wrapper">
              <table className="timetable-table">
                <thead>
                  <tr>
                    <th className="th-timeslot">Time Slot</th>
                    {daysList.map((day) => (
                      <th
                        key={day}
                        className={`th-day ${day === todayName ? 'th-today' : ''}`}
                      >
                        <div className="th-day-content">
                          <span>{day}</span>
                          {day === todayName && <span className="th-today-pill">Today</span>}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time}>
                      <td className="td-timeslot">
                        <div className="slot-time-badge">
                          <i className="fa-regular fa-clock"></i>
                          <span>{time}</span>
                        </div>
                      </td>
                      {daysList.map((day) => {
                        const daySlots = filteredTimetable[day] || [];
                        const slot = daySlots.find((s) => s.time === time);

                        if (!slot) {
                          return (
                            <td key={day} className="td-class-empty">
                              <span className="empty-slot-dash">—</span>
                            </td>
                          );
                        }

                        const isLive = day === 'Monday' && time === '10:00 AM';

                        return (
                          <td key={day} className={`td-class-filled ${isLive ? 'td-live-class' : ''}`}>
                            <div className="class-period-card">
                              {isLive && (
                                <div className="period-live-indicator">
                                  <span className="pulse-dot"></span>
                                  <span>LIVE</span>
                                </div>
                              )}
                              <h4 className="period-subject">{slot.subject}</h4>
                              <div className="period-meta">
                                <span className="period-faculty">
                                  <i className="fa-solid fa-user-tie"></i> {slot.faculty}
                                </span>
                                <span className="period-room">
                                  <i className="fa-solid fa-location-dot"></i> {slot.room}
                                </span>
                              </div>
                              <div className="period-footer">
                                <span className="period-duration">{slot.duration}</span>
                              </div>
                            </div>
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

        {/* ============================================================
            VIEW 2: DAY-BY-DAY LIST VIEW (AND MOBILE DEFAULT)
            ============================================================ */}
        {viewMode === 'day' && (
          <div className="daily-schedule-view">
            <div className="daily-view-header">
              <h3 className="daily-day-title">
                {activeDay} Schedule
                {activeDay === todayName && <span className="c1-badge c1-badge-success">Today</span>}
              </h3>
              <span className="daily-count-badge">
                {filteredTimetable[activeDay]?.length || 0} Lectures Allocated
              </span>
            </div>

            {filteredTimetable[activeDay] && filteredTimetable[activeDay].length > 0 ? (
              <div className="daily-cards-stack">
                {filteredTimetable[activeDay].map((slot, idx) => {
                  const isLive = activeDay === 'Monday' && slot.time === '10:00 AM';

                  return (
                    <div
                      key={idx}
                      className={`c1-card daily-period-card ${isLive ? 'daily-live-card' : ''}`}
                    >
                      <div className="period-time-col">
                        <div className="period-number-badge">Period {idx + 1}</div>
                        <span className="period-start-time">{slot.time}</span>
                        <span className="period-duration-tag">{slot.duration}</span>
                      </div>

                      <div className="period-detail-col">
                        <div className="period-title-bar">
                          <h4 className="daily-subject-name">{slot.subject}</h4>
                          {isLive && (
                            <span className="c1-badge c1-badge-error">
                              <span className="pulse-dot"></span> In Progress
                            </span>
                          )}
                        </div>
                        <div className="daily-meta-chips">
                          <span className="meta-chip">
                            <i className="fa-solid fa-chalkboard-user"></i>
                            <span>{slot.faculty}</span>
                          </span>
                          <span className="meta-chip">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>Room: {slot.room}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-calendar-xmark empty-card-icon"></i>
                <h4>No lectures scheduled for {activeDay}</h4>
                <p>No class sessions match your active filter criteria on this day.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={resetFilters}
                  >
                    Reset Active Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Connected Academic Resources</h4>
            <p>Jump directly to active coursework submissions and upcoming examination timetables.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/assignments')}
            >
              <i className="fa-solid fa-file-invoice"></i>
              <span>View Assignments</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/exams')}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>Exam Timetable</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentTimetable;
