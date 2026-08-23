import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface GlobalSearchEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  path: string;
  roles: Array<'student' | 'faculty' | 'admin' | 'parent'>;
}

export const GLOBAL_SEARCH_ENTRIES: GlobalSearchEntry[] = [
  // Student Portal
  { id: 'stu-dash', title: 'Student Dashboard', category: 'General', description: 'Overview metrics, daily classes, and quick shortcuts', icon: 'fa-chart-simple', path: '/student/dashboard', roles: ['student'] },
  { id: 'stu-att', title: 'Attendance Logs & Session Roll Call', category: 'Academics', description: 'Subject-wise attendance matrix and percentages', icon: 'fa-user-check', path: '/student/timetable', roles: ['student'] },
  { id: 'stu-asg', title: 'Assignments & Homework Tasks', category: 'Academics', description: 'Submit coursework, view deadlines and feedback', icon: 'fa-file-invoice', path: '/student/assignments', roles: ['student'] },
  { id: 'stu-exam', title: 'Examination Timetable', category: 'Academics', description: 'Mid-semester and end-semester hall seatings', icon: 'fa-receipt', path: '/student/exams', roles: ['student'] },
  { id: 'stu-res', title: 'Academic Results & Transcripts', category: 'Academics', description: 'Cumulative GPA, semester marks, and credit sheets', icon: 'fa-award', path: '/student/results', roles: ['student'] },
  { id: 'stu-lms', title: 'LMS Course Materials & Syllabus', category: 'Academics', description: 'Study notes, lecture slides, and video archives', icon: 'fa-book-open', path: '/student/lms', roles: ['student'] },
  { id: 'stu-lib', title: 'Central Library Catalogue & Loans', category: 'Campus Services', description: 'Active RFID book borrowings and fine balances', icon: 'fa-book-bookmark', path: '/student/library', roles: ['student'] },
  { id: 'stu-fee', title: 'Tuition Fees & Payment Invoices', category: 'Campus Services', description: 'Annual fees, receipts, and payment portal', icon: 'fa-wallet', path: '/student/fees', roles: ['student'] },
  { id: 'stu-place', title: 'Placements & Career Opportunities', category: 'Career', description: 'Job openings, campus recruitment drives, applications', icon: 'fa-briefcase', path: '/student/placements', roles: ['student'] },
  { id: 'stu-host', title: 'Hostel Residency & Mess Menu', category: 'Campus Services', description: 'Room allotment, warden contact, and daily meal plans', icon: 'fa-hotel', path: '/student/hostel', roles: ['student'] },
  { id: 'stu-trans', title: 'Transport Fleet & Bus Schedules', category: 'Campus Services', description: 'Transit routes, stop timings, and driver details', icon: 'fa-bus', path: '/student/transport', roles: ['student'] },
  { id: 'stu-not', title: 'Campus Notices & Bulletins', category: 'Notices', description: 'Official circulars, holiday advisories, and events', icon: 'fa-bullhorn', path: '/student/notices', roles: ['student'] },
  { id: 'stu-notif', title: 'Student Notifications Inbox', category: 'System', description: 'Activity stream, alerts, and deadline reminders', icon: 'fa-bell', path: '/student/notifications', roles: ['student'] },

  // Faculty Portal
  { id: 'fac-dash', title: 'Faculty Dashboard', category: 'General', description: 'Teaching schedule, courses overview, and shortcuts', icon: 'fa-chart-simple', path: '/faculty/dashboard', roles: ['faculty'] },
  { id: 'fac-courses', title: 'Assigned Courses & Curriculum', category: 'Teaching', description: 'Manage assigned subjects, syllabus, and credit loads', icon: 'fa-book-open', path: '/faculty/courses', roles: ['faculty'] },
  { id: 'fac-stu', title: 'Student Directory & Class Roster', category: 'Teaching', description: 'Enrolled students list, profiles, and attendance', icon: 'fa-users', path: '/faculty/students', roles: ['faculty'] },
  { id: 'fac-att', title: 'Mark Class Attendance', category: 'Teaching', description: 'Daily roll call sheet and session presence logs', icon: 'fa-clipboard-user', path: '/faculty/attendance', roles: ['faculty'] },
  { id: 'fac-asg', title: 'Assignments Desk & Grading', category: 'Evaluation', description: 'Publish homework tasks and evaluate submissions', icon: 'fa-file-invoice', path: '/faculty/assignments', roles: ['faculty'] },
  { id: 'fac-exams', title: 'Examination Timetable & Invigilation', category: 'Evaluation', description: 'Exam halls, dates, and invigilation duties', icon: 'fa-receipt', path: '/faculty/exams', roles: ['faculty'] },
  { id: 'fac-res', title: 'Enter Examination Marks & Results', category: 'Evaluation', description: 'Internal valuation, assessment scoring, and grades', icon: 'fa-award', path: '/faculty/results', roles: ['faculty'] },
  { id: 'fac-mat', title: 'Study Materials & LMS Uploads', category: 'Teaching', description: 'Upload lecture notes, PDFs, and assignment resources', icon: 'fa-file-arrow-up', path: '/faculty/materials', roles: ['faculty'] },
  { id: 'fac-not', title: 'Publish Academic Notices', category: 'Communication', description: 'Broadcast circulars to students and departmental groups', icon: 'fa-bullhorn', path: '/faculty/notices', roles: ['faculty'] },

  // Admin Portal
  { id: 'adm-dash', title: 'Central Admin Dashboard', category: 'Administration', description: 'University analytics, department metrics, and operations', icon: 'fa-chart-simple', path: '/admin/dashboard', roles: ['admin'] },
  { id: 'adm-stu', title: 'Student Management & Admissions', category: 'Administration', description: 'Full student directory, add/edit candidate records', icon: 'fa-user-graduate', path: '/admin/students', roles: ['admin'] },
  { id: 'adm-fac', title: 'Faculty & Staff Roster', category: 'Administration', description: 'Teaching staff directory, designations, appointments', icon: 'fa-chalkboard-user', path: '/admin/faculty', roles: ['admin'] },
  { id: 'adm-courses', title: 'Course Management & Curriculum', category: 'Academics', description: 'Master curriculum registry and faculty reassignments', icon: 'fa-book-open', path: '/admin/courses', roles: ['admin'] },
  { id: 'adm-dept', title: 'Academic Departments & Branches', category: 'Academics', description: 'Manage engineering schools, HODs, and laboratories', icon: 'fa-building-columns', path: '/admin/departments', roles: ['admin'] },
  { id: 'adm-att', title: 'Campus-Wide Attendance Overview', category: 'Operations', description: 'Institutional attendance rates and low attendance alerts', icon: 'fa-clipboard-user', path: '/admin/attendance', roles: ['admin'] },
  { id: 'adm-fees', title: 'Tuition Fee Management & Collections', category: 'Finance', description: 'Fee realization ledger, collections, and overdue accounts', icon: 'fa-wallet', path: '/admin/fees', roles: ['admin'] },
  { id: 'adm-lib', title: 'Central Library Master Inventory', category: 'Services', description: 'Catalogue book inventory, loans, and overdue tracking', icon: 'fa-book-bookmark', path: '/admin/library', roles: ['admin'] },
  { id: 'adm-host', title: 'Hostel Blocks & Resident Management', category: 'Services', description: 'Blocks A to D, room occupancy, and warden contacts', icon: 'fa-hotel', path: '/admin/hostel', roles: ['admin'] },
  { id: 'adm-trans', title: 'Transport Fleet & Route Schedules', category: 'Services', description: 'Transit routes 1 to 4, fleet buses, driver rosters', icon: 'fa-bus', path: '/admin/transport', roles: ['admin'] },
  { id: 'adm-place', title: 'Placement & Corporate Relations', category: 'Placements', description: 'Hiring partners, job opportunities, and offer tracking', icon: 'fa-briefcase', path: '/admin/placements', roles: ['admin'] },
  { id: 'adm-not', title: 'Publish Institutional Notices', category: 'Communication', description: 'Publish university circulars and emergency bulletins', icon: 'fa-bullhorn', path: '/admin/notices', roles: ['admin'] },
  { id: 'adm-users', title: 'User Accounts & Role Access Control', category: 'Security', description: 'Authentication directory, RBAC roles, and status controls', icon: 'fa-users-gear', path: '/admin/users', roles: ['admin'] },
  { id: 'adm-rep', title: 'Institutional Reports & Data Export', category: 'Reporting', description: '9 datasets with CSV, PDF, and print view exports', icon: 'fa-file-chart-column', path: '/admin/reports', roles: ['admin'] },
  { id: 'adm-set', title: 'System Configuration & Settings', category: 'System', description: 'Institutional profile, term calendar, and security policies', icon: 'fa-sliders', path: '/admin/settings', roles: ['admin'] },

  // Parent Portal
  { id: 'par-dash', title: 'Parent Dashboard', category: 'Monitoring', description: 'Student summary, multi-student switch, and metrics', icon: 'fa-chart-simple', path: '/parent/dashboard', roles: ['parent'] },
  { id: 'par-att', title: "Student's Attendance Logs", category: 'Monitoring', description: 'Subject-wise attendance breakdown and low-rate alerts', icon: 'fa-user-check', path: '/parent/attendance', roles: ['parent'] },
  { id: 'par-acad', title: 'Academic Performance & Results', category: 'Monitoring', description: 'Cumulative GPA, semester grades, and marks transcript', icon: 'fa-award', path: '/parent/academics', roles: ['parent'] },
  { id: 'par-asg', title: 'Homework & Coursework Tasks', category: 'Monitoring', description: 'Track assignments, submission status, and scores', icon: 'fa-file-invoice', path: '/parent/assignments', roles: ['parent'] },
  { id: 'par-exam', title: 'Examination Timetable & Venues', category: 'Monitoring', description: 'Scheduled midterm dates, session timings, and hall slots', icon: 'fa-receipt', path: '/parent/exams', roles: ['parent'] },
  { id: 'par-fees', title: 'Tuition Invoices & Payment Receipts', category: 'Finance', description: 'Verified payment receipts and outstanding balance', icon: 'fa-wallet', path: '/parent/fees', roles: ['parent'] },
  { id: 'par-lib', title: 'Central Library Book Loans', category: 'Services', description: 'Borrowed book titles, due dates, and return status', icon: 'fa-book-bookmark', path: '/parent/library', roles: ['parent'] },
  { id: 'par-host', title: 'Hostel Residency & Warden Contact', category: 'Services', description: 'Residential block, room allotment, and mess meal plan', icon: 'fa-hotel', path: '/parent/hostel', roles: ['parent'] },
  { id: 'par-place', title: 'Placement Progress & Job Offers', category: 'Career', description: 'Recruitment applications, interview status, and offers', icon: 'fa-briefcase', path: '/parent/placements', roles: ['parent'] },
  { id: 'par-not', title: 'Parent & Campus Circulars', category: 'Notices', description: 'Parent-Teacher conference advisories and holiday notices', icon: 'fa-bullhorn', path: '/parent/notices', roles: ['parent'] },
  { id: 'par-set', title: 'Parent Profile & Alert Settings', category: 'Account', description: 'Guardian contact info and instant notification channels', icon: 'fa-user-gear', path: '/parent/settings', roles: ['parent'] }
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = GLOBAL_SEARCH_ENTRIES.filter(
    (item) =>
      item.roles.includes(userRole as any) &&
      (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="search-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(6, 7, 19, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      onClick={onClose}
    >
      <div
        className="search-modal-card"
        style={{
          width: '640px',
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: '#0c0e22',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search CampusOne modules, courses, assignments, notices..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <span
            style={{
              fontSize: '0.6875rem',
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length > 0 ? (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#38bdf8' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem'
                      }}
                    >
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{item.title}</strong>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <i className="fa-solid fa-arrow-right" style={{ color: isSelected ? '#38bdf8' : 'transparent', fontSize: '0.8125rem' }}></i>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '1.5rem', marginBottom: '8px', opacity: 0.5 }}></i>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No results found matching "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>↑</kbd> <kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>↓</kbd> Navigate</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>↵</kbd> Select</span>
            <span><kbd style={{ padding: '2px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)' }}>ESC</kbd> Close</span>
          </div>
          <span>CampusOne Universal Search</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
