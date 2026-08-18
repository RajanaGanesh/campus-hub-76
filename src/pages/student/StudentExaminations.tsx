import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export interface ExamScheduleItem {
  id: string;
  subject: string;
  code: string;
  type: 'Mid-Term' | 'End Semester' | 'Lab Practical';
  semester: string;
  date: string;
  day: string;
  time: string;
  room: string;
  deskNumber: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  syllabus: string;
  targetDateTime: string; // ISO date for timer
}

const EXAM_SCHEDULE: ExamScheduleItem[] = [
  {
    id: 'ex-ds',
    subject: 'Data Structures & Algorithms',
    code: 'CS301',
    type: 'Mid-Term',
    semester: 'Semester 8',
    date: '25 Aug 2026',
    day: 'Tuesday',
    time: '10:00 AM – 01:00 PM',
    room: 'Hall: CSE-204',
    deskNumber: 'Desk: B-14',
    status: 'Upcoming',
    syllabus: 'Units 1–3: Advanced Trees, B-Trees, Dynamic Programming, Graphs & Flow Networks',
    targetDateTime: '2026-08-25T10:00:00'
  },
  {
    id: 'ex-db',
    subject: 'Database Management Systems',
    code: 'CS302',
    type: 'Mid-Term',
    semester: 'Semester 8',
    date: '28 Aug 2026',
    day: 'Friday',
    time: '10:00 AM – 01:00 PM',
    room: 'Hall: CSE-202',
    deskNumber: 'Desk: A-08',
    status: 'Upcoming',
    syllabus: 'Units 1–4: Relational Algebra, SQL Queries, Normalization to BCNF, Concurrency Control',
    targetDateTime: '2026-08-28T10:00:00'
  },
  {
    id: 'ex-cn',
    subject: 'Computer Networks & Security',
    code: 'CS304',
    type: 'Mid-Term',
    semester: 'Semester 8',
    date: '30 Aug 2026',
    day: 'Sunday',
    time: '02:00 PM – 05:00 PM',
    room: 'Hall: CSE-301',
    deskNumber: 'Desk: C-22',
    status: 'Upcoming',
    syllabus: 'Units 1–3: OSI & TCP/IP Stack, Subnetting, Routing Algorithms, Cryptography Basics',
    targetDateTime: '2026-08-30T14:00:00'
  },
  {
    id: 'ex-os-lab',
    subject: 'Operating Systems System Lab',
    code: 'CS303-L',
    type: 'Lab Practical',
    semester: 'Semester 8',
    date: '02 Sep 2026',
    day: 'Wednesday',
    time: '09:00 AM – 12:00 PM',
    room: 'Systems Lab 2',
    deskNumber: 'Terminal: L2-19',
    status: 'Upcoming',
    syllabus: 'POSIX Threads, IPC Shared Memory, Semaphores Implementation, Shell Scripting',
    targetDateTime: '2026-09-02T09:00:00'
  }
];

export const StudentExaminations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'guidelines'>('upcoming');
  const [examTypeFilter, setExamTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamScheduleItem | null>(null);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real-time Countdown Timer for nearest upcoming exam (CS301 on 25 Aug 2026)
  const nearestExam = EXAM_SCHEDULE[0];
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false
  });

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = new Date(nearestExam.targetDateTime).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, isPassed: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nearestExam.targetDateTime]);

  // Filtered list
  const filteredExams = useMemo(() => {
    return EXAM_SCHEDULE.filter((exam) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        exam.subject.toLowerCase().includes(q) ||
        exam.code.toLowerCase().includes(q) ||
        exam.room.toLowerCase().includes(q);

      const matchType = examTypeFilter === 'All' || exam.type === examTypeFilter;

      return matchSearch && matchType;
    });
  }, [searchQuery, examTypeFilter]);

  const handlePrintHallTicket = () => {
    showToast('Preparing Hall Ticket for printing...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
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
              <span className="crumb-current">Examinations</span>
            </div>
            <h1 className="module-title">Examinations & Hall Tickets</h1>
            <p className="module-subtitle">
              Mid-semester & end-semester theoretical evaluations, seating arrangements, and institutional hall tickets.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient btn-hall-ticket-main"
              onClick={() => setIsHallTicketModalOpen(true)}
            >
              <i className="fa-solid fa-id-card"></i>
              <span>Download Hall Ticket</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">3</span>
              <span className="stat-label">Upcoming Exams</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">Data Structures</span>
              <span className="stat-label">Next Examination</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-hourglass-start"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{countdown.days} Days Left</span>
              <span className="stat-label">Countdown to Next Exam</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">24 / 24</span>
              <span className="stat-label">Completed Credits (Sem 7)</span>
            </div>
          </div>
        </div>

        {/* Next Exam Live Countdown Hero Banner */}
        <div className="c1-card exam-countdown-hero-banner">
          <div className="countdown-hero-left">
            <div className="countdown-badge">
              <span className="pulse-circle"></span>
              <span>NEAREST SCHEDULED EXAMINATION</span>
            </div>
            <h2 className="countdown-exam-title">
              {nearestExam.subject} <span className="exam-code-tag">({nearestExam.code})</span>
            </h2>
            <div className="countdown-exam-meta">
              <span><i className="fa-regular fa-calendar"></i> {nearestExam.date} ({nearestExam.day})</span>
              <span><i className="fa-regular fa-clock"></i> {nearestExam.time}</span>
              <span><i className="fa-solid fa-location-dot"></i> {nearestExam.room}</span>
              <span><i className="fa-solid fa-chair"></i> {nearestExam.deskNumber}</span>
            </div>
          </div>

          <div className="countdown-hero-right">
            <div className="digital-countdown-grid">
              <div className="countdown-unit">
                <span className="unit-number">{String(countdown.days).padStart(2, '0')}</span>
                <span className="unit-label">DAYS</span>
              </div>
              <span className="unit-colon">:</span>
              <div className="countdown-unit">
                <span className="unit-number">{String(countdown.hours).padStart(2, '0')}</span>
                <span className="unit-label">HOURS</span>
              </div>
              <span className="unit-colon">:</span>
              <div className="countdown-unit">
                <span className="unit-number">{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="unit-label">MINS</span>
              </div>
              <span className="unit-colon">:</span>
              <div className="countdown-unit">
                <span className="unit-number">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="unit-label">SECS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <i className="fa-solid fa-calendar-days"></i>
            <span>Active Exam Timetable ({filteredExams.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Past Exam History</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            <i className="fa-solid fa-shield-halved"></i>
            <span>Exam Rules & Guidelines</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: UPCOMING EXAMS SCHEDULE
            ============================================================ */}
        {activeTab === 'upcoming' && (
          <div className="upcoming-exams-tab-content">
            {/* Search and Filters */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '20px' }}>
              <div className="search-filter-input-wrap">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  className="c1-input search-filter-input"
                  placeholder="Search examinations by subject or hall..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters-row-wrap">
                <div className="filter-select-item">
                  <label htmlFor="filter-exam-type">Exam Category</label>
                  <select
                    id="filter-exam-type"
                    className="c1-select"
                    value={examTypeFilter}
                    onChange={(e) => setExamTypeFilter(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Mid-Term">Mid-Term (Internal)</option>
                    <option value="End Semester">End Semester (Final)</option>
                    <option value="Lab Practical">Lab Practical</option>
                  </select>
                </div>

                {(searchQuery || examTypeFilter !== 'All') && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-clear-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setExamTypeFilter('All');
                    }}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Exam Schedule Grid */}
            {filteredExams.length > 0 ? (
              <div className="exam-schedule-grid">
                {filteredExams.map((exam) => (
                  <div key={exam.id} className="c1-card exam-schedule-card">
                    <div className="exam-schedule-top">
                      <div className="exam-calendar-box">
                        <span className="cal-box-month">{exam.date.split(' ')[1]}</span>
                        <span className="cal-box-day">{exam.date.split(' ')[0]}</span>
                        <span className="cal-box-weekday">{exam.day.slice(0, 3)}</span>
                      </div>

                      <div className="exam-schedule-details">
                        <div className="exam-code-type-row">
                          <span className="exam-code-badge">{exam.code}</span>
                          <span className="c1-badge c1-badge-purple">{exam.type}</span>
                        </div>
                        <h3 className="exam-subject-title">{exam.subject}</h3>
                        <div className="exam-time-location">
                          <span><i className="fa-regular fa-clock"></i> {exam.time}</span>
                          <span><i className="fa-solid fa-location-dot"></i> {exam.room}</span>
                          <span className="desk-highlight"><i className="fa-solid fa-chair"></i> {exam.deskNumber}</span>
                        </div>
                      </div>
                    </div>

                    <div className="exam-syllabus-snippet">
                      <span className="syllabus-label">Syllabus Scope:</span>
                      <p className="syllabus-text">{exam.syllabus}</p>
                    </div>

                    <div className="exam-schedule-actions">
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ width: '100%' }}
                        onClick={() => setSelectedExam(exam)}
                      >
                        <i className="fa-solid fa-circle-info"></i>
                        <span>Seating Details & Syllabus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-calendar-xmark empty-card-icon"></i>
                <h4>No examinations match your filter</h4>
                <p>Try resetting the category filter or search keyword.</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: PAST EXAM HISTORY
            ============================================================ */}
        {activeTab === 'past' && (
          <div className="c1-card past-exams-card">
            <h3 className="card-section-title">Completed Semester 7 Examinations</h3>
            <div className="past-exams-table-wrap">
              <table className="c1-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Subject Name</th>
                    <th>Exam Date</th>
                    <th>Total Marks</th>
                    <th>Grade Secured</th>
                    <th>Result Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>CS701</strong></td>
                    <td>Cloud Computing Architecture</td>
                    <td>15 Nov 2025</td>
                    <td>90 / 100</td>
                    <td><span className="c1-badge c1-badge-success">A+</span></td>
                    <td><span className="status-pass">Passed</span></td>
                  </tr>
                  <tr>
                    <td><strong>CS702</strong></td>
                    <td>Machine Learning Foundations</td>
                    <td>18 Nov 2025</td>
                    <td>86 / 100</td>
                    <td><span className="c1-badge c1-badge-success">A</span></td>
                    <td><span className="status-pass">Passed</span></td>
                  </tr>
                  <tr>
                    <td><strong>CS703</strong></td>
                    <td>Information & Network Security</td>
                    <td>22 Nov 2025</td>
                    <td>82 / 100</td>
                    <td><span className="c1-badge c1-badge-success">A</span></td>
                    <td><span className="status-pass">Passed</span></td>
                  </tr>
                  <tr>
                    <td><strong>CS704</strong></td>
                    <td>Distributed Systems & Microservices</td>
                    <td>25 Nov 2025</td>
                    <td>88 / 100</td>
                    <td><span className="c1-badge c1-badge-success">A</span></td>
                    <td><span className="status-pass">Passed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: EXAM GUIDELINES
            ============================================================ */}
        {activeTab === 'guidelines' && (
          <div className="c1-card exam-guidelines-card">
            <h3 className="card-section-title">Institutional Examination Rules & Regulations</h3>
            <div className="guidelines-list">
              <div className="guideline-item">
                <i className="fa-solid fa-id-card guideline-icon"></i>
                <div>
                  <h4>Mandatory Physical Hall Ticket & Smart ID</h4>
                  <p>Candidates must bring their printed CampusOne Hall Ticket and official college Smart Card ID to every examination session.</p>
                </div>
              </div>
              <div className="guideline-item">
                <i className="fa-solid fa-clock guideline-icon"></i>
                <div>
                  <h4>Reporting & Entry Deadlines</h4>
                  <p>Students must report to their allocated examination hall at least 20 minutes prior to test commencement. Late entry after 15 minutes is strictly prohibited.</p>
                </div>
              </div>
              <div className="guideline-item">
                <i className="fa-solid fa-ban guideline-icon"></i>
                <div>
                  <h4>Prohibited Electronic Devices</h4>
                  <p>Mobile phones, smart watches, programmable calculators, and Bluetooth accessories are strictly prohibited inside the examination halls.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL 1: EXAM DETAILS MODAL
            ============================================================ */}
        {selectedExam && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedExam(null)}
            title={`Examination Details: ${selectedExam.subject}`}
            maxWidth="md"
          >
            <div className="exam-detail-dialog">
              <div className="exam-detail-grid">
                <div className="detail-box">
                  <span className="detail-lbl">Course Code</span>
                  <span className="detail-val">{selectedExam.code}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">Category</span>
                  <span className="detail-val">{selectedExam.type}</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">Date & Time</span>
                  <span className="detail-val">{selectedExam.date} ({selectedExam.time})</span>
                </div>
                <div className="detail-box">
                  <span className="detail-lbl">Venue & Desk</span>
                  <span className="detail-val">{selectedExam.room} • {selectedExam.deskNumber}</span>
                </div>
              </div>

              <div className="details-section">
                <h4>Syllabus Coverage</h4>
                <p>{selectedExam.syllabus}</p>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedExam(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    setSelectedExam(null);
                    setIsHallTicketModalOpen(true);
                  }}
                >
                  <i className="fa-solid fa-id-card"></i>
                  <span>View Hall Ticket</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: OFFICIAL HALL TICKET PREVIEW MODAL
            ============================================================ */}
        {isHallTicketModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsHallTicketModalOpen(false)}
            title="Institutional Examination Hall Ticket"
            maxWidth="lg"
          >
            <div className="hall-ticket-document">
              {/* Institutional Header */}
              <div className="ticket-header">
                <div className="ticket-branding">
                  <h2>CAMPUSONE INSTITUTION OF TECHNOLOGY</h2>
                  <p>Autonomous Engineering Institution • Controller of Examinations</p>
                  <span className="ticket-sem-title">MID-SEMESTER EXAMINATION HALL TICKET — AUGUST 2026</span>
                </div>
              </div>

              {/* Student Identity Grid */}
              <div className="ticket-student-grid">
                <div className="ticket-field">
                  <span className="t-label">Roll Number:</span>
                  <span className="t-val">236F1A0551</span>
                </div>
                <div className="ticket-field">
                  <span className="t-label">Candidate Name:</span>
                  <span className="t-val">{user?.name || 'Aditya Sharma'}</span>
                </div>
                <div className="ticket-field">
                  <span className="t-label">Department:</span>
                  <span className="t-val">Computer Science & Engineering</span>
                </div>
                <div className="ticket-field">
                  <span className="t-label">Program & Semester:</span>
                  <span className="t-val">B.Tech IV Year (8th Semester)</span>
                </div>
              </div>

              {/* Scheduled Papers Table */}
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Paper Code</th>
                    <th>Subject Title</th>
                    <th>Room & Desk</th>
                    <th>Invigilator Sig.</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAM_SCHEDULE.map((ex) => (
                    <tr key={ex.id}>
                      <td>{ex.date}</td>
                      <td>{ex.time}</td>
                      <td><strong>{ex.code}</strong></td>
                      <td>{ex.subject}</td>
                      <td>{ex.room} ({ex.deskNumber.split(':')[1]?.trim()})</td>
                      <td className="sig-cell"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="ticket-footer-signatures">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>Candidate Signature</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <span>Controller of Examinations</span>
                </div>
              </div>

              <div className="modal-dialog-footer no-print">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsHallTicketModalOpen(false)}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handlePrintHallTicket}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Official Hall Ticket</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Academic Records</h4>
            <p>View your completed semester grade sheets and cumulative CGPA transcripts.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/results')}
            >
              <i className="fa-solid fa-award"></i>
              <span>View Grade Transcripts</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/lms')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>LMS Study Materials</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentExaminations;
