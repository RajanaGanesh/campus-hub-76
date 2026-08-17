import React from 'react';
import { useLocation } from 'react-router-dom';
import { ModulePlaceholder } from '../components/ModulePlaceholder';

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const names: Record<string, { title: string; icon: string }> = {
    '/attendance': { title: 'Attendance Management', icon: 'fa-user-check' },
    '/timetable': { title: 'Class Timetable', icon: 'fa-calendar-days' },
    '/assignments': { title: 'Assignments Portal', icon: 'fa-file-invoice' },
    '/exams': { title: 'Examinations Center', icon: 'fa-receipt' },
    '/results': { title: 'Results & Marks Cards', icon: 'fa-award' },
    '/learning': { title: 'LMS Learning Space', icon: 'fa-graduation-cap' },
    '/students': { title: 'Students Management', icon: 'fa-users' },
    '/faculty': { title: 'Faculty Directory', icon: 'fa-chalkboard-user' },
    '/departments': { title: 'Departments Control', icon: 'fa-sitemap' },
    '/courses': { title: 'Courses Syllabus Catalog', icon: 'fa-book' },
    '/library': { title: 'Library Catalog Services', icon: 'fa-book-open' },
    '/fees': { title: 'Tuition Fees Billing', icon: 'fa-wallet' },
    '/placements': { title: 'Career Placements Office', icon: 'fa-briefcase' },
    '/hostel': { title: 'Hostel Maintenance Tickets', icon: 'fa-hotel' },
    '/transport': { title: 'Transport Telemetry Tracking', icon: 'fa-bus' },
    '/announcements': { title: 'Campus Announcements Feed', icon: 'fa-bullhorn' },
    '/notifications': { title: 'Notification Log History', icon: 'fa-bell' },
    '/ai': { title: 'Campus Hub AI Copilot', icon: 'fa-robot' },
    '/analytics': { title: 'System Analytics Metrics', icon: 'fa-chart-line' },
    '/profile': { title: 'User Account Profile', icon: 'fa-user-gear' },
    '/settings': { title: 'System Configurations', icon: 'fa-sliders' },
    '/performance': { title: 'Student Academic Performance', icon: 'fa-chart-bar' },
  };

  const current = names[path] || { title: 'Module Portal', icon: 'fa-cubes' };

  return <ModulePlaceholder title={current.title} icon={current.icon} />;
};

export default PlaceholderPage;
