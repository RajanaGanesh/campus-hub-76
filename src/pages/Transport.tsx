import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { mobilityData, TransportRoute } from '../data/mobilityData';

export const Transport: React.FC = () => {
  const { user } = useAuth();
  const studentName = user?.name || 'Aditya Sharma';

  // Load routes catalog
  const [routes] = useState<TransportRoute[]>(mobilityData.routes);
  const [search, setSearch] = useState('');
  
  // Selected route state
  const [selectedRouteNum, setSelectedRouteNum] = useState('Route 12');

  // Tracking Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStopIndex, setSimStopIndex] = useState(0);
  const [simEta, setSimEta] = useState(25);
  const simulationIntervalRef = useRef<any>(null);

  // Modal active pass
  const [showPassModal, setShowPassModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeRoute = routes.find((r) => r.routeNumber === selectedRouteNum) || routes[0];

  const filteredRoutes = routes.filter((r) =>
    r.routeNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.startingPoint.toLowerCase().includes(search.toLowerCase()) ||
    r.stops.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Simulation effect hook
  useEffect(() => {
    if (isSimulating) {
      setSimStopIndex(0);
      setSimEta(25);

      simulationIntervalRef.current = setInterval(() => {
        setSimStopIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= activeRoute.stops.length - 1) {
            // Reached Campus Gate
            setIsSimulating(false);
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            setToastMsg('Bus reached Campus Gate. Simulation completed.');
            setTimeout(() => setToastMsg(null), 2500);
            return activeRoute.stops.length - 1;
          }
          // Calculate dummy ETA decreases
          setSimEta((prevEta) => Math.max(2, prevEta - 5));
          return nextIndex;
        });
      }, 5000); // Advance every 5 seconds
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [isSimulating, selectedRouteNum]);

  // Clean simulation on route change
  const handleRouteChange = (routeNum: string) => {
    setSelectedRouteNum(routeNum);
    setIsSimulating(false);
    setSimStopIndex(0);
    setSimEta(25);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Campus Transport</h1>
        <p>Manage your bus routes, schedules, transport pass, and campus travel.</p>
      </div>

      {/* Toast notifications alerts */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-bus"></i>
            </div>
            <span className="stat-card-trend safe">Assigned</span>
          </div>
          <div className="stat-card-value">Route 12</div>
          <div className="stat-card-desc">Assigned Route</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-hashtag"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ fontSize: '16px', fontWeight: '800' }}>AP 39 AB 1234</div>
          <div className="stat-card-desc">Bus License Number</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-clock"></i>
            </div>
          </div>
          <div className="stat-card-value">8:05 AM</div>
          <div className="stat-card-desc">Pickup Time</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-id-card"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#00d89a' }}>Active</div>
          <div className="stat-card-desc">Transport pass status</div>
        </div>
      </div>

      {/* Bus Route Details split layout */}
      <div className="dashboard-main-grid">
        {/* Left Column: Routes search list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div className="card-panel">
            <div className="card-panel-header" style={{ marginBottom: '14px' }}>
              <h3>Available Bus Routes</h3>
              <i className="fa-solid fa-route" style={{ color: 'var(--text-secondary)' }}></i>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}></i>
              <input
                type="text"
                placeholder="Search route or stop name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 12px 6px 30px',
                  fontSize: '12.5px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredRoutes.map((r) => (
                <button
                  key={r.routeNumber}
                  type="button"
                  onClick={() => handleRouteChange(r.routeNumber)}
                  style={{
                    background: selectedRouteNum === r.routeNumber ? 'rgba(124,92,255,0.05)' : 'rgba(255,255,255,0.01)',
                    border: selectedRouteNum === r.routeNumber ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ color: 'white', fontSize: '13.5px', display: 'block' }}>{r.routeNumber}</strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {r.startingPoint} → {r.destination}
                    </span>
                  </div>
                  <span className={`subject-att-status ${r.status === 'On Time' ? 'safe' : r.status === 'Delayed' ? 'warning' : 'critical'}`} style={{ fontSize: '9px' }}>
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Transport Pass summary Card */}
          <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white' }}>Digital Pass</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Keep your digital transport pass active to access campus shuttles.</p>
            <button
              type="button"
              className="btn-signin"
              style={{ width: '100%', height: '36px', margin: 0, fontSize: '12.5px' }}
              onClick={() => setShowPassModal(true)}
            >
              <i className="fa-solid fa-qrcode" style={{ marginRight: '6px' }}></i> View Transport Pass
            </button>
          </div>
        </div>

        {/* Right Column: Route Details Stops timeline & simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1.4 }}>
          {/* Tracking Simulation panel */}
          <div className="card-panel" style={{ border: '1px solid var(--accent-primary)', boxShadow: '0 0 15px rgba(124,92,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '9px', background: 'rgba(255,178,54,0.08)', color: '#ffb236', border: '1px solid rgba(255,178,54,0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                  DEMO TRACKING SIMULATOR
                </span>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '4px' }}>Shuttle Bus Live Location</h3>
              </div>

              <button
                type="button"
                className={`btn-sso ${isSimulating ? 'active' : ''}`}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '11px',
                  margin: 0,
                  borderColor: isSimulating ? 'var(--color-error)' : 'var(--accent-primary)',
                  background: isSimulating ? 'rgba(217,83,79,0.05)' : 'none',
                  color: isSimulating ? 'var(--color-error)' : 'white'
                }}
                onClick={() => setIsSimulating(!isSimulating)}
              >
                {isSimulating ? 'Stop Demo' : 'Start Simulation'}
              </button>
            </div>

            {/* Simulation Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div>Current Location: <strong style={{ color: 'white' }}>{isSimulating ? activeRoute.stops[simStopIndex] : activeRoute.startingPoint}</strong></div>
              <div>Next Stop: <strong style={{ color: 'white' }}>{isSimulating ? activeRoute.stops[Math.min(simStopIndex + 1, activeRoute.stops.length - 1)] : activeRoute.stops[1]}</strong></div>
              <div>ETA Minutes: <strong style={{ color: 'var(--accent-highlight)' }}>{isSimulating ? `${simEta} Mins` : '--'}</strong></div>
              <div>Status: <span className="subject-att-status safe">ON TIME</span></div>
            </div>

            {/* Visual Road Map tracker */}
            <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', position: 'relative', padding: '0 10px', marginTop: '30px', marginBottom: '20px' }}>
              {/* Connected route line */}
              <div style={{ position: 'absolute', left: '10px', right: '10px', height: '4px', background: 'rgba(124,92,255,0.15)', zIndex: 1 }} />
              
              {/* Active filled line */}
              {isSimulating && (
                <div
                  style={{
                    position: 'absolute',
                    left: '10px',
                    width: `${(simStopIndex / (activeRoute.stops.length - 1)) * 95}%`,
                    height: '4px',
                    background: 'var(--accent-primary)',
                    zIndex: 2,
                    transition: 'width 0.3s ease-in-out'
                  }}
                />
              )}

              {/* Stop Nodes */}
              {activeRoute.stops.map((_, idx) => {
                const isPassed = isSimulating && simStopIndex >= idx;
                const isCurrent = isSimulating && simStopIndex === idx;

                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `calc(10px + ${(idx / (activeRoute.stops.length - 1)) * 93}% - 6px)`,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: isCurrent ? 'var(--accent-highlight)' : isPassed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                      border: '2px solid var(--bg-primary)',
                      zIndex: 3,
                      boxShadow: isCurrent ? '0 0 10px var(--accent-highlight)' : 'none'
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', padding: '0 4px' }}>
              <span>{activeRoute.startingPoint}</span>
              <span>{activeRoute.destination}</span>
            </div>
          </div>

          {/* Vertical stops agenda details */}
          <div className="card-panel">
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Stops & Timeline</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '9px', top: '4px', bottom: '4px', width: '2px', background: 'rgba(255,255,255,0.04)' }} />

              {activeRoute.stops.map((stop, idx) => {
                const isActiveNode = isSimulating && simStopIndex === idx;
                return (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: isActiveNode ? 'var(--accent-highlight)' : 'rgba(255,255,255,0.03)',
                        border: '2px solid var(--border-color)',
                        zIndex: 2
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: isActiveNode ? '800' : '600', color: isActiveNode ? 'var(--accent-highlight)' : 'white' }}>{stop}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Digital Pass Modal Overlay */}
      {showPassModal && (
        <div className="search-modal-overlay" onClick={() => setShowPassModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '360px', padding: 0, overflow: 'hidden', background: '#100f2e', border: '1px solid var(--accent-primary)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-highlight))', padding: '20px', textAlign: 'center', color: 'white', position: 'relative' }}>
              <button
                type="button"
                className="btn-search-close"
                onClick={() => setShowPassModal(false)}
                style={{ position: 'absolute', right: '12px', top: '12px', color: 'white', background: 'rgba(0,0,0,0.2)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>CAMPUS TRANSPORT PASS</h3>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>SHUTTLE TRANSIT AUTHORITY</span>
            </div>

            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {/* Photo */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: 'var(--accent-highlight)', fontWeight: '800' }}>
                AS
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '16.5px', fontWeight: '800', color: 'white' }}>{studentName}</h2>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: 236F1A0551</span>
              </div>

              {/* Pass details */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', color: 'var(--text-secondary)' }}>
                <div>Route No: <strong style={{ color: 'white' }}>Route 12</strong></div>
                <div>Bus Plate: <strong style={{ color: 'white' }}>AP 39 AB 1234</strong></div>
                <div>Valid Until: <strong style={{ color: 'white' }}>30 June 2027</strong></div>
                <div>Status: <span className="subject-att-status safe" style={{ fontSize: '9px' }}>ACTIVE</span></div>
              </div>

              {/* QR Code */}
              <div style={{ width: '90px', height: '90px', background: 'white', padding: '6px', borderRadius: '6px' }}>
                <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }} fill="none" stroke="black" strokeWidth="0.5">
                  <path d="M1 1h6v6H1V1zm16 0h6v6h-6V1zM1 17h6v6H1v-6zm3-12h1v1H4V5zm16 0h1v1h-1V5zm-16 16h1v1H4v-1zm14-14h1v1h-1V7zm1-5h1v1h-1V2zm-3 2h1v1h-1V4zm1 5h1v1h-1V9zm-5-3h1v1h-1V6zm0 4h1v1h-1v-1zm2 1h1v1h-1v-1zm-4 4h1v1h-1v-1zm5 1h1v1h-1v-1zm-1 3h1v1h-1v-1zm3 2h1v1h-1v-1zm-6-2h1v1h-1v-1z" fill="black" />
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  className="btn-retry-err"
                  style={{ flex: 1, margin: 0, height: '34px', fontSize: '11px', padding: 0 }}
                  onClick={() => setShowPassModal(false)}
                >
                  Close Pass
                </button>
                <button
                  type="button"
                  className="btn-signin"
                  style={{ flex: 1, margin: 0, height: '34px', fontSize: '11.5px', padding: 0 }}
                  onClick={() => {
                    setToastMsg('Transport pass download started.');
                    setTimeout(() => setToastMsg(null), 2500);
                  }}
                >
                  Download Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Transport;
