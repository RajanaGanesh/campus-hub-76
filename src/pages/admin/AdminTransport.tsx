import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export interface TransportRouteItem {
  id: string;
  name: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedCount: number;
  morningTime: string;
  eveningTime: string;
  stops: string[];
}

export const AdminTransport: React.FC = () => {
  const [routes] = useState<TransportRouteItem[]>([
    {
      id: 'RT-01',
      name: 'Route 1: Silk Board – HSR – Campus',
      busNumber: 'KA-01-FA-1204',
      driverName: 'Mr. Ramesh Babu',
      driverPhone: '+91 98450 12345',
      capacity: 45,
      assignedCount: 42,
      morningTime: '07:15 AM',
      eveningTime: '05:15 PM',
      stops: ['Silk Board Junction', 'HSR BDA Complex', 'Agara Lake', 'Campus Main Gate']
    },
    {
      id: 'RT-02',
      name: 'Route 2: Indiranagar – Koramangala – Campus',
      busNumber: 'KA-01-FA-1208',
      driverName: 'Mr. Manjunath Swamy',
      driverPhone: '+91 98450 23456',
      capacity: 45,
      assignedCount: 44,
      morningTime: '07:00 AM',
      eveningTime: '05:15 PM',
      stops: ['Indiranagar 100ft Rd', 'Domlur Flyover', 'Sony World Koramangala', 'Campus Main Gate']
    },
    {
      id: 'RT-03',
      name: 'Route 3: Whitefield – Marathahalli – Campus',
      busNumber: 'KA-01-FA-1212',
      driverName: 'Mr. Suresh Gowda',
      driverPhone: '+91 98450 34567',
      capacity: 45,
      assignedCount: 40,
      morningTime: '07:10 AM',
      eveningTime: '05:15 PM',
      stops: ['Whitefield TTMC', 'Kundalahalli Gate', 'Marathahalli Bridge', 'Campus Main Gate']
    },
    {
      id: 'RT-04',
      name: 'Route 4: Electronic City – Phase 1 & 2 – Campus',
      busNumber: 'KA-01-FA-1216',
      driverName: 'Mr. Venkatesh Rao',
      driverPhone: '+91 98450 45678',
      capacity: 45,
      assignedCount: 38,
      morningTime: '07:20 AM',
      eveningTime: '05:15 PM',
      stops: ['Infosys Gate 1', 'Wipro Gate', 'Electronic City Toll', 'Campus Main Gate']
    }
  ]);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Transport Management</span>
            </div>
            <h1 className="module-title">Campus Transport Fleet & Route Schedules</h1>
            <p className="module-subtitle">
              Manage university bus transit routes, stop waypoints, driver contact rosters, and student commute allocations.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Bus schedule alert broadcasted to 540 subscribed students.', 'success')}
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>Broadcast Transit Alert</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-route"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{routes.length * 2} Routes</span>
              <span className="stat-label">Designated Transit Routes</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-bus"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">16 Buses</span>
              <span className="stat-label">Active Fleet Vehicles</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>540</span>
              <span className="stat-label">Subscribed Student Riders</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-id-card"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">16 Drivers</span>
              <span className="stat-label">Licensed Staff on Duty</span>
            </div>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="faculty-courses-full-grid">
          {routes.map((rt) => (
            <div key={rt.id} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div>
                  <span className="course-code-tag">{rt.id}</span>
                  <h3 className="course-title-text">{rt.name}</h3>
                  <span className="course-dept-text">Bus: <strong>{rt.busNumber}</strong></span>
                </div>
                <span className="c1-badge c1-badge-success">{rt.assignedCount} / {rt.capacity} Seats</span>
              </div>

              <div className="course-info-grid-compact">
                <div className="c-info-cell">
                  <i className="fa-solid fa-user"></i>
                  <span>Driver: <strong>{rt.driverName}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-phone"></i>
                  <span>{rt.driverPhone}</span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-clock"></i>
                  <span>Pickup: <strong>{rt.morningTime}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span>Return: <strong>{rt.eveningTime}</strong></span>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Stops & Waypoints</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {rt.stops.map((st, i) => (
                    <span key={i} className="c1-badge c1-badge-purple" style={{ fontSize: '0.6875rem' }}>{st}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default AdminTransport;
