import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { studentDashboardData, StudentDashboardData } from '../data/studentDashboardData';
import { dbService } from '../services/dbService';
import { StudentStatCard } from '../components/StudentStatCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SkeletonCard } from '../components/States';
import {
  StatCard,
  QuickAccessCard,
  ScheduleCard,
  AttendanceCard,
  AnnouncementCard,
  AIInsightCard,
} from '../components/DashboardCards';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null);

  // Time-aware greeting clock logic & database query loader
  useEffect(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) setGreeting('Good Morning');
    else if (hrs < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    async function loadData() {
      if (user?.email) {
        try {
          const data = await dbService.getStudentDashboardData(user.email);
          setStudentData(data);
        } catch (err) {
          console.error('Error loading student dashboard data from Supabase:', err);
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [user]);

  const userName = user?.name || 'User';
  const userRole = user?.role || 'student';

  const campusAnnouncements = [
    { title: 'Semester Examination Timetable Released', category: 'Academic', date: 'Aug 15, 2026', desc: 'The complete mid-semester exam timetable is now live.' },
    { title: 'Campus Recruitment Drive Registration Open', category: 'Placement', date: 'Aug 14, 2026', desc: 'Microsoft and AWS registrations are active.' },
    { title: 'Library Working Hours Extended', category: 'Services', date: 'Aug 12, 2026', desc: 'Operating hours extended during exams.' }
  ];

  // Handle page redirects
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Render Skeletons loading template
  const renderLoadingSkeletons = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Skeletons Stats Row */}
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" style={{ padding: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div className="skeleton-text" style={{ width: '40px', height: '40px', borderRadius: '8px', marginBottom: '12px' }}></div>
              <div className="skeleton-text" style={{ width: '60%', height: '24px', marginBottom: '8px' }}></div>
              <div className="skeleton-text" style={{ width: '40%', height: '12px' }}></div>
            </div>
          ))}
        </div>

        {/* Skeletons Content Row */}
        <div className="dashboard-main-grid">
          <div className="dashboard-row">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="dashboard-row">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  };

  // Render Student Dashboard Layout (STEP 3 Target)
  const renderStudentDashboard = () => {
    const data = studentData || studentDashboardData;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Dynamic Greeting Header area */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>{greeting}, {userName} 👋</h1>
            <p>Here's your academic and campus overview for today.</p>
          </div>
          
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <div><strong style={{ color: 'white' }}>Student ID:</strong> {data.profile.studentId}</div>
            <div><strong style={{ color: 'white' }}>Dept:</strong> {data.profile.department}</div>
            <div><strong style={{ color: 'white' }}>Year:</strong> {data.profile.yearSection}</div>
          </div>
        </div>

        {/* 1. Statistics Cards Row */}
        <div className="stats-grid">
          {data.stats.map((stat, idx) => (
            <StudentStatCard
              key={idx}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              status={stat.status}
              statusType={stat.statusType}
              progress={stat.progress}
              colorVariant={stat.colorVariant}
            />
          ))}
        </div>

        {/* 2. Main Dashboard columns (Grid Layout) */}
        <div className="dashboard-main-grid">
          {/* LEFT AREA: Academic Details */}
          <div className="dashboard-row">
            {/* Attendance Overview with direct routing */}
            <div className="card-panel">
              <AttendanceCard
                overallPercentage={data.overallAttendance}
              />
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/attendance')}
              >
                View Attendance
              </button>
            </div>

            {/* Custom SVG Line Chart for CGPA */}
            <PerformanceChart data={data.performanceHistory} />

            {/* Timetable schedule preview */}
            <div className="card-panel">
              <ScheduleCard schedule={data.timetable} />
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/timetable')}
              >
                View Full Timetable
              </button>
            </div>

            {/* Pending Assignments */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Pending Assignments</h3>
                <i className="fa-solid fa-file-invoice" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.assignments.map((ass, idx) => (
                  <div
                    key={idx}
                    className="timetable-item"
                    style={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <span className="class-subject-name">{ass.subject}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                        {ass.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Due: <strong style={{ color: 'white' }}>{ass.due}</strong>
                      </span>
                      <span className={`subject-att-status ${ass.priority === 'High' ? 'critical' : ass.priority === 'Medium' ? 'warning' : 'safe'}`}>
                        {ass.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/assignments')}
              >
                View All Assignments
              </button>
            </div>

            {/* Upcoming Examinations */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Upcoming Examinations</h3>
                <i className="fa-solid fa-receipt" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { subject: 'Data Structures', date: '25 Aug 2026', time: '10:00 AM', room: 'Room CSE-204', daysLeft: '9 days left' },
                  { subject: 'Database Management', date: '28 Aug 2026', time: '10:00 AM', room: 'Room CSE-202', daysLeft: '12 days left' },
                  { subject: 'Computer Networks', date: '30 Aug 2026', time: '02:00 PM', room: 'Room CSE-301', daysLeft: '14 days left' }
                ].map((ex, idx) => (
                  <div key={idx} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span className="class-subject-name">{ex.subject}</span>
                      <span className="subject-att-status critical" style={{ fontSize: '9px' }}>{ex.daysLeft}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      <div><i className="fa-solid fa-calendar-day" style={{ marginRight: '6px' }}></i> {ex.date} at {ex.time}</div>
                      <div style={{ marginTop: '2px' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i> {ex.room}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/exams')}
              >
                View Exam Schedule
              </button>
            </div>

            {/* Latest Exam Grades */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Latest Results</h3>
                <i className="fa-solid fa-award" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '8px 12px 12px 12px' }}>Subject</th>
                      <th style={{ padding: '8px 12px 12px 12px' }}>Internal</th>
                      <th style={{ padding: '8px 12px 12px 12px' }}>External</th>
                      <th style={{ padding: '8px 12px 12px 12px' }}>Total</th>
                      <th style={{ padding: '8px 12px 12px 12px' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((res, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px', fontWeight: '600', color: 'white' }}>{res.subject}</td>
                        <td style={{ padding: '12px' }}>{res.internal}</td>
                        <td style={{ padding: '12px' }}>{res.external}</td>
                        <td style={{ padding: '12px' }}>{res.total}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: 'var(--accent-highlight)', fontWeight: '700' }}>{res.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/results')}
              >
                View All Results
              </button>
            </div>

            {/* Placement opportunities */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Placement & Recruitment Drive</h3>
                <i className="fa-solid fa-briefcase" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              
              {/* Summary Indicators row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Eligible Jobs</span>
                  <strong style={{ fontSize: '15px', color: '#00d89a', fontWeight: '800', display: 'block', marginTop: '2px' }}>18 Opportunities</strong>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Applications</span>
                  <strong style={{ fontSize: '15px', color: 'white', fontWeight: '800', display: 'block', marginTop: '2px' }}>6 Tracked</strong>
                </div>
                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Next Event</span>
                  <strong style={{ fontSize: '11px', color: 'var(--accent-highlight)', fontWeight: '800', display: 'block', marginTop: '4px' }}>CloudCore Test (23 Aug)</strong>
                </div>
              </div>

              {/* Latest Job details */}
              <div className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="class-subject-name">Software Developer (Latest Opening)</span>
                  <span className="subject-att-status safe" style={{ fontSize: '9px' }}>Eligible</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <div>Company: <strong style={{ color: 'white' }}>TechNova Solutions</strong></div>
                  <div style={{ marginTop: '2px' }}>Package: <strong style={{ color: 'white' }}>₹8 LPA</strong> • Deadline: <strong style={{ color: 'white' }}>30 Aug 2026</strong></div>
                </div>
              </div>

              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/placements')}
              >
                View All Placements
              </button>
            </div>
          </div>

          {/* RIGHT AREA: Profile & Secondary Metrics */}
          <div className="dashboard-row">
            {/* Student Profile Card summary */}
            <div className="card-panel" style={{ textAlign: 'center' }}>
              <div
                className="user-avatar"
                style={{
                  width: '64px',
                  height: '64px',
                  fontSize: '24px',
                  margin: '0 auto 16px auto',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
              >
                {data.profile.avatarInitials}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{userName}</h3>
              <span style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', fontWeight: '700', textTransform: 'uppercase' }}>
                {data.profile.studentId}
              </span>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: '16px', paddingTop: '16px', textAlign: 'left', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Dept:</span> <strong style={{ color: 'white' }}>{data.profile.department}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Year:</span> <strong style={{ color: 'white' }}>{data.profile.yearSection}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Term:</span> <strong style={{ color: 'white' }}>{data.profile.semester}</strong></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Email:</span> <strong style={{ color: 'white' }}>{data.profile.email}</strong></div>
              </div>

              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '20px', border: '1px solid var(--accent-primary)', color: 'white', background: 'rgba(124, 92, 255, 0.05)' }}
                onClick={() => handleNavigate('/profile')}
              >
                View Profile
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Quick Actions</h3>
                <i className="fa-solid fa-bolt" style={{ color: 'var(--accent-highlight)' }}></i>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/attendance')}>
                  <i className="fa-solid fa-user-check" style={{ color: 'var(--accent-primary)' }}></i> Attendance
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/timetable')}>
                  <i className="fa-solid fa-calendar-days" style={{ color: 'var(--accent-highlight)' }}></i> Timetable
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/assignments')}>
                  <i className="fa-solid fa-file-invoice" style={{ color: '#00d89a' }}></i> Assignments
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/exams')}>
                  <i className="fa-solid fa-receipt" style={{ color: 'var(--color-error)' }}></i> Exams
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/fees')}>
                  <i className="fa-solid fa-wallet" style={{ color: '#ffb236' }}></i> Pay Fees
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/library')}>
                  <i className="fa-solid fa-book-open" style={{ color: 'var(--accent-highlight)' }}></i> Library
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/services')}>
                  <i className="fa-solid fa-screwdriver-wrench" style={{ color: '#00d89a' }}></i> Campus Services
                </button>
                <button className="btn-view-all" style={{ margin: 0, fontSize: '11.5px', gap: '8px' }} onClick={() => handleNavigate('/learning')}>
                  <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent-primary)' }}></i> Learning Hub
                </button>
              </div>
            </div>

            {/* Tuition Fees summary card */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Fee Overview</h3>
                <i className="fa-solid fa-wallet" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Fee:</span>
                  <strong style={{ color: 'white' }}>₹{data.fees.total.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Paid:</span>
                  <strong style={{ color: '#00d89a' }}>₹{data.fees.paid.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending:</span>
                  <strong style={{ color: 'var(--color-error)' }}>₹{data.fees.pending.toLocaleString()}</strong>
                </div>

                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', margin: '4px 0' }}>
                  <div
                    style={{
                      width: `${(data.fees.paid / data.fees.total) * 100}%`,
                      height: '100%',
                      backgroundColor: '#00d89a',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Next Due Date:</span>
                  <strong style={{ color: 'white' }}>{data.fees.dueDate}</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/fees')}
              >
                View Fee Details
              </button>
            </div>

            {/* Library summary card */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>My Library</h3>
                <i className="fa-solid fa-book-open" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-highlight)' }}>{data.library.issued}</div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '2px' }}>Issued</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffb236' }}>{data.library.dueSoonCount}</div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginTop: '2px' }}>Due Soon</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.library.books.map((bk, idx) => (
                  <div key={idx} style={{ fontSize: '12px', borderBottom: idx < data.library.books.length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none', paddingBottom: idx < data.library.books.length - 1 ? '8px' : 0 }}>
                    <div style={{ fontWeight: '600', color: 'white' }}>{bk.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bk.author}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginTop: '4px', color: '#555365' }}>
                      <span>Due: <strong style={{ color: bk.status === 'due-soon' ? '#ffb236' : 'var(--text-secondary)' }}>{bk.due}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/library')}
              >
                Open Library
              </button>
            </div>

            {/* Hostel assigned details card */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Lodging Accommodation</h3>
                <i className="fa-solid fa-hotel" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hostel Room:</span>
                  <strong style={{ color: 'white' }}>B Block • Room B-204</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Upcoming Request:</span>
                  <span className="subject-att-status warning" style={{ fontSize: '9px' }}>HOSTEL-REQ-1001 Resolved</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/hostel')}
              >
                View Hostel Details
              </button>
            </div>

            {/* Transport Pass details card */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Transit & Shuttle Pass</h3>
                <i className="fa-solid fa-bus" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Next Bus Schedule:</span>
                  <strong style={{ color: 'white' }}>Route 12 • 08:05 AM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Transport Pass:</span>
                  <span className="subject-att-status safe" style={{ fontSize: '9.5px' }}>Pass Active</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/transport')}
              >
                View Transport Details
              </button>
            </div>

            {/* AI Prominent Assistant Card */}
            <div className="card-panel ai-insight-card">
              <div className="ai-insight-header">
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-highlight)' }}></i>
                <h3>Campus AI</h3>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                Your intelligent campus companion
              </p>
              <p className="ai-insight-text" style={{ marginBottom: '12px' }}>
                Ask questions about attendance, academics, exams, assignments, library services, and campus activities.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {['"What is my attendance?"', '"What exams do I have this week?"', '"Which assignments are due?"', '"Find library books."'].map((q, idx) => (
                  <div
                    key={idx}
                    style={{ fontSize: '11.5px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--accent-highlight)', cursor: 'pointer' }}
                    onClick={() => handleNavigate('/assistant')}
                  >
                    {q}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="btn-ai-ask"
                onClick={() => handleNavigate('/assistant')}
              >
                Ask Campus AI
              </button>
            </div>

            {/* Notification List Preview */}
            <div className="card-panel">
              <div className="card-panel-header" style={{ marginBottom: '16px' }}>
                <h3>Recent Notifications</h3>
                <i className="fa-solid fa-bell" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="timetable-item"
                    style={{ padding: '10px 12px', gap: '12px', alignItems: 'center' }}
                  >
                    <div style={{ color: notif.unread ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                      <i className={`fa-solid ${notif.icon}`} style={{ fontSize: '14px' }}></i>
                    </div>
                    <div style={{ flex: 1, fontSize: '11.5px', color: notif.unread ? 'white' : 'var(--text-secondary)' }}>
                      {notif.title}
                      <span style={{ display: 'block', fontSize: '9px', color: '#555365', marginTop: '2px' }}>{notif.time}</span>
                    </div>
                    {notif.unread && (
                      <div style={{ width: '6px', height: '6px', background: 'var(--accent-primary)', borderRadius: '50%' }} />
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn-view-all"
                style={{ marginTop: '16px' }}
                onClick={() => handleNavigate('/notifications')}
              >
                View All Notifications
              </button>
            </div>

            {/* Activity timeline logs */}
            <ActivityTimeline activities={data.activities} />
          </div>
        </div>
      </div>
    );
  };

  // Render Faculty Dashboard (Fallback Preview)
  const renderFacultyDashboard = () => (
    <>
      <div className="dashboard-header">
        <h1>{greeting}, {userName} 👋</h1>
        <p>Here's what's happening across your campus today.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="fa-users" title="Total Students" value="120" description="Across 3 lectures" colorVariant="cyan" />
        <StatCard icon="fa-user-check" title="Avg Attendance" value="89%" description="Monthly average" colorVariant="primary" trend={{ value: '1.2%', type: 'up' }} />
        <StatCard icon="fa-file-signature" title="Pending Grading" value="42" description="Assignments submitted" colorVariant="green" />
        <StatCard icon="fa-calendar-check" title="Scheduled Exams" value="2" description="This week" colorVariant="red" />
      </div>

      <div className="quick-access-section">
        <h3>Quick Actions</h3>
        <div className="quick-access-grid">
          <QuickAccessCard icon="fa-user-check" title="Log Attendance" description="Update student checks" path="/attendance" />
          <QuickAccessCard icon="fa-calendar-days" title="My Timetable" description="Lecture slots" path="/timetable" />
          <QuickAccessCard icon="fa-file-invoice" title="Grade Work" description="Check uploads" path="/assignments" />
          <QuickAccessCard icon="fa-receipt" title="Examinations" description="Duty charts" path="/exams" />
          <QuickAccessCard icon="fa-bullhorn" title="Announce" description="Post campus feeds" path="/announcements" />
          <QuickAccessCard icon="fa-users" title="Students List" description="Class enrollments" path="/students" />
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-row">
          <ScheduleCard
            schedule={[
              { time: '10:00 AM', duration: '1.5h', subject: 'Database Management (CS302)', room: 'LH 301', faculty: 'Class A (CS)', isActive: true },
              { time: '03:00 PM', duration: '1h', subject: 'Data Structures (CS301)', room: 'LH 202', faculty: 'Class B (CS)', isActive: false }
            ]}
          />
        </div>
        <div className="dashboard-row">
          <AIInsightCard />
          <AnnouncementCard announcements={campusAnnouncements} onViewAllClick={() => navigate('/announcements')} />
        </div>
      </div>
    </>
  );

  // Render Admin Dashboard (Fallback Preview)
  const renderAdminDashboard = () => (
    <>
      <div className="dashboard-header">
        <h1>{greeting}, {userName} 👋</h1>
        <p>Here's what's happening across your campus today.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="fa-users" title="Total Students" value="1,420" description="Enrolled active" colorVariant="cyan" />
        <StatCard icon="fa-chalkboard-user" title="Total Faculty" value="86" description="Teaching staff" colorVariant="primary" />
        <StatCard icon="fa-user-check" title="Daily Attendance" value="91%" description="Campus-wide average" colorVariant="green" trend={{ value: '0.8%', type: 'up' }} />
        <StatCard icon="fa-wallet" title="Term Collections" value="₹24.5L" description="82% collection status" colorVariant="cyan" />
        <StatCard icon="fa-briefcase" title="Placement Rate" value="84%" description="Enrolled batch" colorVariant="green" />
      </div>

      <div className="quick-access-section">
        <h3>Admin Console</h3>
        <div className="quick-access-grid">
          <QuickAccessCard icon="fa-users" title="Manage Students" description="Add/edit profiles" path="/students" />
          <QuickAccessCard icon="fa-chalkboard-user" title="Manage Faculty" description="Staff duty assignments" path="/faculty" />
          <QuickAccessCard icon="fa-sitemap" title="Departments" description="Academic branches" path="/departments" />
          <QuickAccessCard icon="fa-book" title="Courses" description="Syllabus catalogs" path="/courses" />
          <QuickAccessCard icon="fa-wallet" title="Fees Accounts" description="Billing logs" path="/fees" />
          <QuickAccessCard icon="fa-hotel" title="Hostel Control" description="Allocations & support" path="/hostel" />
          <QuickAccessCard icon="fa-bus" title="Transport" description="Bus telemetry routes" path="/transport" />
          <QuickAccessCard icon="fa-chart-line" title="Analytics" description="Portal database reports" path="/analytics" />
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-row">
          <div className="card-panel">
            <div className="card-panel-header">
              <h3>System Portal Health</h3>
              <i className="fa-solid fa-server" style={{ color: '#00d89a' }}></i>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              All database shards, API gateways, HMR configurations, and auxiliary campus modules are online.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '20px' }}>
              <div>
                <strong style={{ color: 'white' }}>CPU Usage:</strong> 12.4%
              </div>
              <div>
                <strong style={{ color: 'white' }}>Memory:</strong> 42.1%
              </div>
              <div>
                <strong style={{ color: 'white' }}>Sessions:</strong> 142 Active
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-row">
          <AIInsightCard />
        </div>
      </div>
    </>
  );

  // Render Parent Dashboard (Fallback Preview)
  const renderParentDashboard = () => (
    <>
      <div className="dashboard-header">
        <h1>{greeting}, {userName} 👋</h1>
        <p>Here's what's happening across your campus today.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="fa-user-check" title="Student Attendance" value="86%" description="Child overall attendance" colorVariant="primary" />
        <StatCard icon="fa-award" title="Child CGPA" value="8.6" description="Current cumulative grades" colorVariant="cyan" />
        <StatCard icon="fa-receipt" title="Upcoming Exams" value="3" description="Seating dates confirmed" colorVariant="red" />
        <StatCard icon="fa-wallet" title="Tuition Fees Due" value="₹12,500" description="Pay by August 22" colorVariant="red" />
      </div>

      <div className="quick-access-section">
        <h3>Parent Dashboard Links</h3>
        <div className="quick-access-grid">
          <QuickAccessCard icon="fa-user-check" title="Student Attendance" description="Check logs" path="/attendance" />
          <QuickAccessCard icon="fa-chart-bar" title="Performance" description="Semester marks cards" path="/performance" />
          <QuickAccessCard icon="fa-award" title="Exam Results" description="Report sheets" path="/results" />
          <QuickAccessCard icon="fa-file-invoice" title="Assignments" description="Homework submissions" path="/assignments" />
          <QuickAccessCard icon="fa-wallet" title="Pay Fees" description="Make tuition transfers" path="/fees" />
          <QuickAccessCard icon="fa-bullhorn" title="Announcements" description="Parent-teacher updates" path="/announcements" />
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-row">
          <AttendanceCard overallPercentage={86} />
        </div>
        <div className="dashboard-row">
          <AnnouncementCard announcements={campusAnnouncements} onViewAllClick={() => navigate('/announcements')} />
        </div>
      </div>
    </>
  );

  // loading state skeletons check
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Syncing central data...</h1>
          <p>Downloading latest campus ledger nodes.</p>
        </div>
        {renderLoadingSkeletons()}
      </div>
    );
  }

  return (
    <>
      {userRole === 'student' && renderStudentDashboard()}
      {userRole === 'faculty' && renderFacultyDashboard()}
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'parent' && renderParentDashboard()}
    </>
  );
};

export default Dashboard;
