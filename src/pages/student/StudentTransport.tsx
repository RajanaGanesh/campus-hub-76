import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { mobilityData, TransportRoute } from '../../data/mobilityData';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentTransport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'my-route' | 'all-routes' | 'notices'>('my-route');

  // Selected route from list
  const [routes] = useState<TransportRoute[]>(mobilityData.routes);
  const myRoute = routes[0] || {
    routeNumber: 'Route 4',
    startingPoint: 'Railway Station Junction',
    destination: 'Campus Main Gate',
    stops: ['Railway Station', 'City Center Metro', 'Green Glen Layout', 'Tech Park Circle', 'College Main Gate'],
    pickupTime: '07:45 AM',
    dropTime: '08:35 AM',
    busNumber: 'Bus 12 (KA-01-F-4421)',
    driverName: 'Mr. Rajesh Kumar',
    driverPhone: '+91 94451 88231',
    status: 'On Time'
  };

  // Bus Pass Modal State
  const [isBusPassModalOpen, setIsBusPassModalOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePrintBusPass = () => {
    showToast('Opening official bus pass print preview...', 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const myStopsTimeline = [
    { number: 1, name: 'Railway Station Junction', morningTime: '07:30 AM', eveningTime: '05:45 PM', isBoardingPoint: false },
    { number: 2, name: 'City Center Metro Station (Gate 2)', morningTime: '07:45 AM', eveningTime: '05:30 PM', isBoardingPoint: true },
    { number: 3, name: 'Green Glen Layout Main Road', morningTime: '08:05 AM', eveningTime: '05:15 PM', isBoardingPoint: false },
    { number: 4, name: 'Tech Park Circle Outer Ring', morningTime: '08:20 AM', eveningTime: '05:00 PM', isBoardingPoint: false },
    { number: 5, name: 'College Campus Main Gate', morningTime: '08:35 AM', eveningTime: '04:45 PM', isBoardingPoint: false, isDestination: true }
  ];

  const transportNotices = [
    {
      id: 'tn-1',
      title: 'Exam Special Evening Bus Timings',
      date: '16 Aug 2026',
      category: 'Schedule Update',
      desc: 'During mid-semester examinations next week, an additional special departure shuttle will leave campus at 01:30 PM and 05:30 PM across all routes.'
    },
    {
      id: 'tn-2',
      title: 'Route 4 Temporary Diversion Notice',
      date: '14 Aug 2026',
      category: 'Route Notice',
      desc: 'Due to metro flyover maintenance near City Center, Route 4 morning buses will pick up passengers 50 meters ahead at Bus Shelter B.'
    },
    {
      id: 'tn-3',
      title: 'Annual Transport Smart Pass Renewal',
      date: '10 Aug 2026',
      category: 'Administration',
      desc: 'Students utilizing campus fleet transportation must ensure their Semester 8 transport pass renewal is completed before 31st August.'
    }
  ];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Campus Life</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Campus Transport</span>
            </div>
            <h1 className="module-title">Campus Transport</h1>
            <p className="module-subtitle">
              Assigned bus routes, scheduled boarding stops, driver contacts, and downloadable digital transport pass.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient btn-bus-pass-main"
              onClick={() => setIsBusPassModalOpen(true)}
            >
              <i className="fa-solid fa-id-badge"></i>
              <span>View Digital Bus Pass</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-bus"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{myRoute.routeNumber}</span>
              <span className="stat-label">Assigned Transport Route</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-van-shuttle"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{myRoute.busNumber.split(' ')[0]} {myRoute.busNumber.split(' ')[1]}</span>
              <span className="stat-label">Dedicated Vehicle Fleet</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{myRoute.pickupTime}</span>
              <span className="stat-label">Boarding Time (City Center)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">On Time</span>
              <span className="stat-label">Daily Fleet Operational Status</span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'my-route' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-route')}
          >
            <i className="fa-solid fa-route"></i>
            <span>My Assigned Route Schedule</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'all-routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-routes')}
          >
            <i className="fa-solid fa-map-location-dot"></i>
            <span>All Campus Bus Routes ({routes.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            <i className="fa-solid fa-bullhorn"></i>
            <span>Transport Circulars ({transportNotices.length})</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: MY ROUTE & STOPS SCHEDULE
            ============================================================ */}
        {activeTab === 'my-route' && (
          <div className="transport-route-layout">
            {/* Route & Driver Details Card */}
            <div className="c1-card route-profile-card">
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">{myRoute.routeNumber} — North Campus Express</h3>
                  <p className="c1-card-subtitle">{myRoute.startingPoint} to {myRoute.destination}</p>
                </div>
                <span className="c1-badge c1-badge-success">Active Pass</span>
              </div>

              <div className="driver-contact-grid">
                <div className="driver-contact-item">
                  <div className="driver-avatar">
                    <i className="fa-solid fa-user-tie"></i>
                  </div>
                  <div className="driver-info">
                    <h4>{myRoute.driverName}</h4>
                    <span className="driver-role">Assigned Fleet Driver</span>
                    <span className="driver-phone"><i className="fa-solid fa-phone"></i> {myRoute.driverPhone}</span>
                  </div>
                </div>

                <div className="driver-contact-item">
                  <div className="driver-avatar">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <div className="driver-info">
                    <h4>Prof. K. Ramesh</h4>
                    <span className="driver-role">Transport Office Help Desk</span>
                    <span className="driver-phone"><i className="fa-solid fa-phone"></i> +91 98401 55432 (Ext: 205)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stop List Timeline */}
            <div className="c1-card stop-timeline-card">
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">Scheduled Stops & Arrival Timeline</h3>
                  <p className="c1-card-subtitle">Official scheduled morning pickup and evening return drop timings</p>
                </div>
              </div>

              <div className="stops-timeline-stack">
                {myStopsTimeline.map((stop) => (
                  <div
                    key={stop.number}
                    className={`stop-timeline-node ${stop.isBoardingPoint ? 'node-boarding-point' : ''} ${stop.isDestination ? 'node-destination' : ''}`}
                  >
                    <div className="node-marker">
                      <span className="node-number">{stop.number}</span>
                    </div>

                    <div className="node-content">
                      <div className="node-title-row">
                        <h4 className="stop-name">{stop.name}</h4>
                        {stop.isBoardingPoint && (
                          <span className="c1-badge c1-badge-cyan">
                            <i className="fa-solid fa-person-walking-luggage"></i> Your Boarding Stop
                          </span>
                        )}
                        {stop.isDestination && (
                          <span className="c1-badge c1-badge-success">
                            <i className="fa-solid fa-flag-checkered"></i> Destination
                          </span>
                        )}
                      </div>

                      <div className="stop-times-row">
                        <span className="time-chip morning">
                          <i className="fa-regular fa-sun"></i> Morning Pickup: <strong>{stop.morningTime}</strong>
                        </span>
                        <span className="time-chip evening">
                          <i className="fa-regular fa-moon"></i> Evening Drop: <strong>{stop.eveningTime}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: ALL CAMPUS ROUTES
            ============================================================ */}
        {activeTab === 'all-routes' && (
          <div className="all-routes-grid">
            {routes.map((rt) => (
              <div key={rt.routeNumber} className="c1-card route-card-item">
                <div className="route-card-header">
                  <div>
                    <span className="course-code-tag">{rt.routeNumber}</span>
                    <h3 className="route-name">{rt.startingPoint} to {rt.destination}</h3>
                  </div>
                  <span className="c1-badge c1-badge-success">{rt.status}</span>
                </div>

                <div className="route-meta-grid">
                  <div className="route-meta-cell">
                    <span className="r-label">Vehicle</span>
                    <span className="r-val">{rt.busNumber}</span>
                  </div>
                  <div className="route-meta-cell">
                    <span className="r-label">Morning Dep.</span>
                    <span className="r-val">{rt.pickupTime}</span>
                  </div>
                  <div className="route-meta-cell">
                    <span className="r-label">Campus Arrival</span>
                    <span className="r-val">{rt.dropTime}</span>
                  </div>
                  <div className="route-meta-cell">
                    <span className="r-label">Driver Contact</span>
                    <span className="r-val">{rt.driverName}</span>
                  </div>
                </div>

                <div className="route-stops-list">
                  <span className="stops-label">Key Route Stops:</span>
                  <p className="stops-text">{rt.stops.join(' ➔ ')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            TAB 3: TRANSPORT NOTICES
            ============================================================ */}
        {activeTab === 'notices' && (
          <div className="hostel-notices-grid">
            {transportNotices.map((notif) => (
              <div key={notif.id} className="c1-card hostel-notice-card">
                <div className="notice-card-top">
                  <span className="c1-badge c1-badge-cyan">{notif.category}</span>
                  <span className="notice-date"><i className="fa-regular fa-calendar"></i> {notif.date}</span>
                </div>
                <h3 className="notice-title">{notif.title}</h3>
                <p className="notice-desc">{notif.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            MODAL: DIGITAL BUS PASS MODAL
            ============================================================ */}
        {isBusPassModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsBusPassModalOpen(false)}
            title="Official Student Bus Pass"
            maxWidth="md"
          >
            <div className="bus-pass-document">
              <div className="bus-pass-header">
                <h2>CAMPUSONE INSTITUTION OF TECHNOLOGY</h2>
                <p>Campus Fleet & Student Transportation Services</p>
                <span className="pass-title-chip">ANNUAL STUDENT BUS PASS — 2025–2026</span>
              </div>

              <div className="pass-identity-grid">
                <div className="pass-photo-box">
                  <i className="fa-solid fa-user pass-user-icon"></i>
                  <span>PHOTO</span>
                </div>

                <div className="pass-details-box">
                  <div className="pass-field">
                    <span className="p-lbl">Student Name:</span>
                    <span className="p-val">{user?.name || 'Aditya Sharma'}</span>
                  </div>
                  <div className="pass-field">
                    <span className="p-lbl">Roll Number:</span>
                    <span className="p-val">236F1A0551</span>
                  </div>
                  <div className="pass-field">
                    <span className="p-lbl">Route & Bus:</span>
                    <span className="p-val">Route 4 • Bus 12</span>
                  </div>
                  <div className="pass-field">
                    <span className="p-lbl">Boarding Point:</span>
                    <span className="p-val">City Center Metro (07:45 AM)</span>
                  </div>
                  <div className="pass-field">
                    <span className="p-lbl">Validity:</span>
                    <span className="p-val" style={{ color: '#16a34a', fontWeight: 800 }}>31 JULY 2026 (ACTIVE)</span>
                  </div>
                </div>
              </div>

              <div className="pass-barcode-strip">
                <div className="barcode-mock">||| | |||| ||| |||| | ||||| ||| || | |||| ||||</div>
                <span className="barcode-id">PASS-ID: CH2026-BUS-R4-0551</span>
              </div>

              <div className="modal-dialog-footer no-print">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsBusPassModalOpen(false)}
                >
                  Close Pass
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handlePrintBusPass}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print Bus Pass</span>
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
            <h4>Check Campus Notices & Notifications</h4>
            <p>Stay informed with official circulars and real-time student notifications.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/notices')}
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>Campus Notices</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/notifications')}
            >
              <i className="fa-solid fa-bell"></i>
              <span>Notifications</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentTransport;
