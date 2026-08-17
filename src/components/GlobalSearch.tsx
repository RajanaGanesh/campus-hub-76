import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SearchItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  roles: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'dashboard', title: 'Dashboard', icon: 'fa-chart-simple', path: '/', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'attendance', title: 'Attendance Logs', icon: 'fa-user-check', path: '/attendance', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'timetable', title: 'Weekly Timetable', icon: 'fa-calendar-days', path: '/timetable', roles: ['student', 'faculty', 'admin'] },
  { id: 'assignments', title: 'Coursework Assignments', icon: 'fa-file-invoice', path: '/assignments', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'exams', title: 'Examinations Schedule', icon: 'fa-receipt', path: '/exams', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'results', title: 'Term Results', icon: 'fa-award', path: '/results', roles: ['student', 'admin', 'parent'] },
  { id: 'library', title: 'Library Catalog', icon: 'fa-book-open', path: '/library', roles: ['student', 'admin'] },
  { id: 'fees', title: 'Fees Billing & Payments', icon: 'fa-wallet', path: '/fees', roles: ['student', 'admin', 'parent'] },
  { id: 'services', title: 'Campus Services Catalog', icon: 'fa-screwdriver-wrench', path: '/services', roles: ['student', 'admin'] },
  { id: 'requests', title: 'My Service Requests Timeline', icon: 'fa-list-check', path: '/services/requests', roles: ['student', 'admin'] },
  { id: 'digital-id', title: 'Digital Student ID Card Badge', icon: 'fa-id-card', path: '/services', roles: ['student', 'admin'] },
  { id: 'bonafide', title: 'Bonafide Certificate Request', icon: 'fa-file-signature', path: '/services', roles: ['student', 'admin'] },
  { id: 'nodue', title: 'No Due Clearance Certificate Request', icon: 'fa-clipboard-check', path: '/services', roles: ['student', 'admin'] },
  { id: 'leave', title: 'Leave Application Request Form', icon: 'fa-calendar-minus', path: '/services', roles: ['student', 'admin'] },
  { id: 'grievance', title: 'Institutional Grievance Feedback Form', icon: 'fa-hand-holding-hand', path: '/services', roles: ['student', 'admin'] },
  { id: 'helpdesk', title: 'Help Desk Campus Support Contact', icon: 'fa-circle-question', path: '/services', roles: ['student', 'admin'] },
  { id: 'placements', title: 'Placements & Job Listings Catalog', icon: 'fa-briefcase', path: '/placements', roles: ['student', 'admin'] },
  { id: 'applications', title: 'My Job Applications Tracker', icon: 'fa-paper-plane', path: '/placements/applications', roles: ['student', 'admin'] },
  { id: 'saved-jobs', title: 'Saved Jobs Opportunities', icon: 'fa-bookmark', path: '/placements/saved', roles: ['student', 'admin'] },
  { id: 'calendar', title: 'Placement Calendar & Recruitment Drives', icon: 'fa-calendar-days', path: '/placements/calendar', roles: ['student', 'admin'] },
  { id: 'career-profile', title: 'Career Profile & Resume Readiness', icon: 'fa-user-tie', path: '/placements/profile', roles: ['student', 'admin'] },
  { id: 'prep', title: 'Interview Preparation Prep Portal', icon: 'fa-book-open-reader', path: '/placements/prep', roles: ['student', 'admin'] },
  { id: 'hostel', title: 'Hostel Lodging Dashboard', icon: 'fa-hotel', path: '/hostel', roles: ['student', 'admin'] },
  { id: 'my-room', title: 'Hostel Assigned Room Information', icon: 'fa-bed', path: '/hostel', roles: ['student', 'admin'] },
  { id: 'hostel-requests', title: 'Hostel Service Maintenance Complaints', icon: 'fa-screwdriver-wrench', path: '/hostel/requests', roles: ['student', 'admin'] },
  { id: 'mess', title: 'Mess & Weekly Dining Menu Board', icon: 'fa-utensils', path: '/hostel/mess', roles: ['student', 'admin'] },
  { id: 'transport', title: 'Campus Transport Pass & Schedules', icon: 'fa-bus', path: '/transport', roles: ['student', 'admin'] },
  { id: 'bus-routes', title: 'Bus Routes Listings & Driver Details', icon: 'fa-route', path: '/transport', roles: ['student', 'admin'] },
  { id: 'bus-tracking', title: 'Bus Live Tracking Map Simulator', icon: 'fa-location-dot', path: '/transport', roles: ['student', 'admin'] },
  { id: 'transport-pass', title: 'Digital Transit Transport Pass QR', icon: 'fa-qrcode', path: '/transport', roles: ['student', 'admin'] },
  { id: 'mobility', title: 'Campus Mobility Dashboard Hub', icon: 'fa-location-arrow', path: '/mobility', roles: ['student', 'admin'] },
  { id: 'announcements', title: 'Campus Announcements Feed', icon: 'fa-bullhorn', path: '/announcements', roles: ['faculty', 'parent'] },
  { id: 'notifications', title: 'Notification Alerts', icon: 'fa-bell', path: '/notifications', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'ai-assistant', title: 'Campus AI Chatbot Assistant', icon: 'fa-wand-magic-sparkles', path: '/assistant', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'insights', title: 'Personalized Academic Insights Analysis', icon: 'fa-chart-pie', path: '/insights', roles: ['student', 'admin'] },
  { id: 'help-center', title: 'Help Center Support FAQs Guides', icon: 'fa-circle-question', path: '/help', roles: ['student', 'faculty', 'admin'] },
  { id: 'profile', title: 'My User Profile', icon: 'fa-user-gear', path: '/profile', roles: ['student', 'faculty', 'admin', 'parent'] },
  { id: 'settings', title: 'System Settings', icon: 'fa-sliders', path: '/settings', roles: ['student', 'faculty', 'admin', 'parent'] }
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Filter search items matching query and user role
  const userRole = user?.role || 'student';
  const filtered = SEARCH_ITEMS.filter(
    (item) =>
      item.roles.includes(userRole) &&
      (item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase()))
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

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} style={{ color: 'var(--accent-highlight)', fontWeight: '700' }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Campus Hub..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button type="button" className="btn-search-close" onClick={onClose}>
            ESC
          </button>
        </div>

        <div className="search-results-list">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`search-result-item ${selectedIndex === idx ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
              >
                <div className="search-result-left">
                  <div className="search-result-icon">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="search-result-text">
                    <span className="search-result-title">{highlightText(item.title, query)}</span>
                    <span className="search-result-path">Navigate to {item.path}</span>
                  </div>
                </div>
                <div className="search-result-action">
                  <span>Go to</span> <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No matches found for "{query}"
            </div>
          )}
        </div>

        <div className="search-modal-footer">
          <span>
            <kbd>↑↓</kbd> Navigation
          </span>
          <span>
            <kbd>Enter</kbd> Open
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
};
