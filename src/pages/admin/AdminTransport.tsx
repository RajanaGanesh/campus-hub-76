import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mobilityData, TransportRoute } from '../../data/mobilityData';

export const AdminTransport: React.FC = () => {
  const navigate = useNavigate();

  // Load routes
  const [routes, setRoutes] = useState<TransportRoute[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_transport_routes');
      return stored ? JSON.parse(stored) : mobilityData.routes;
    } catch {
      return mobilityData.routes;
    }
  });

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);

  // Form Fields
  const [routeNum, setRouteNum] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [destPoint, setDestPoint] = useState('Campus');
  const [busNo, setBusNo] = useState('');
  const [stopsInput, setStopsInput] = useState('');
  const [driver, setDriver] = useState('');
  const [phone, setPhone] = useState('');
  const [pTime, setPTime] = useState('08:00 AM');
  const [status, setStatus] = useState<'On Time' | 'Delayed' | 'Cancelled' | 'Completed'>('On Time');

  const [formError, setFormError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setRouteNum('');
    setStartPoint('');
    setDestPoint('Campus');
    setBusNo('');
    setStopsInput('');
    setDriver('');
    setPhone('');
    setPTime('08:00 AM');
    setStatus('On Time');
    setFormError(null);
    setEditingRoute(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (r: TransportRoute) => {
    setEditingRoute(r);
    setRouteNum(r.routeNumber);
    setStartPoint(r.startingPoint);
    setDestPoint(r.destination);
    setBusNo(r.busNumber);
    setStopsInput(r.stops.join(', '));
    setDriver(r.driverName);
    setPhone(r.driverPhone);
    setPTime(r.pickupTime);
    setStatus(r.status);
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeNum.trim() || !startPoint.trim() || !busNo.trim() || !driver.trim()) {
      setFormError('Please fill in Route Number, Start Point, Bus Plate, and Driver Name.');
      return;
    }

    const stopsArray = stopsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (editingRoute) {
      // Edit
      const nextRoutes = routes.map((r) => {
        if (r.routeNumber === editingRoute.routeNumber) {
          return {
            ...r,
            routeNumber: routeNum,
            startingPoint: startPoint,
            destination: destPoint,
            busNumber: busNo,
            stops: stopsArray,
            driverName: driver,
            driverPhone: phone,
            pickupTime: pTime,
            status
          };
        }
        return r;
      });

      setRoutes(nextRoutes);
      localStorage.setItem('campushub_transport_routes', JSON.stringify(nextRoutes));
      setShowAddModal(false);
      setToastMsg('Route details updated successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    } else {
      // Add
      if (routes.some((r) => r.routeNumber.toLowerCase() === routeNum.toLowerCase())) {
        setFormError('Error: A route with this number already exists.');
        return;
      }

      const newRoute: TransportRoute = {
        routeNumber: routeNum,
        startingPoint: startPoint,
        destination: destPoint,
        busNumber: busNo,
        stops: stopsArray,
        pickupTime: pTime,
        dropTime: '05:30 PM',
        driverName: driver,
        driverPhone: phone,
        status
      };

      const nextRoutes = [...routes, newRoute];
      setRoutes(nextRoutes);
      localStorage.setItem('campushub_transport_routes', JSON.stringify(nextRoutes));
      setShowAddModal(false);
      setToastMsg('Transport Route added successfully.');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  // Stats
  const activeBuses = routes.filter((r) => r.status === 'On Time').length;
  const delayedBuses = routes.filter((r) => r.status === 'Delayed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/admin')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Admin Console
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Admin / Transport</span>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Transport Management</h1>
          <p>Register campus shuttle routes, assign bus licenses, edit status parameters, and check telemetry logs.</p>
        </div>

        <button
          type="button"
          className="btn-signin"
          style={{ width: 'auto', padding: '0 16px', height: '36px', margin: 0 }}
          onClick={handleOpenAdd}
        >
          <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add Route
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase' }}>Total Routes</div>
          <div className="stat-card-value" style={{ marginTop: '4px' }}>{routes.length}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: '#00d89a' }}>Active Buses</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: '#00d89a' }}>{activeBuses}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-error)' }}>Delayed Buses</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--color-error)' }}>{delayedBuses}</div>
        </div>
        <div className="card-panel stat-card">
          <div className="stat-card-desc" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-highlight)' }}>Registered Students</div>
          <div className="stat-card-value" style={{ marginTop: '4px', color: 'var(--accent-highlight)' }}>348</div>
        </div>
      </div>

      {/* Table */}
      <div className="card-panel">
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Route No</th>
                <th style={{ padding: '12px 14px' }}>Starting Point</th>
                <th style={{ padding: '12px 14px' }}>Stops list</th>
                <th style={{ padding: '12px 14px' }}>Bus License</th>
                <th style={{ padding: '12px 14px' }}>Driver</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Pickup Time</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--accent-highlight)' }}>{r.routeNumber}</td>
                  <td style={{ padding: '12px 14px', fontWeight: '700' }}>{r.startingPoint}</td>
                  <td style={{ padding: '12px 14px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {r.stops.slice(0, 3).join(' → ')} {r.stops.length > 3 ? '...' : ''}
                  </td>
                  <td style={{ padding: '12px 14px' }}>{r.busNumber}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div>{r.driverName}</div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{r.driverPhone}</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>{r.pickupTime}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span className={`subject-att-status ${r.status === 'On Time' ? 'good' : r.status === 'Delayed' ? 'warning' : 'critical'}`} style={{ fontSize: '8.5px' }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn-sso"
                      style={{ height: '28px', fontSize: '11.5px', padding: '0 12px', margin: 0, width: 'auto' }}
                      onClick={() => handleOpenEdit(r)}
                    >
                      Edit Route
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="search-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Transit networks</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{editingRoute ? 'Edit Transit Route' : 'Add Transit Route'}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setShowAddModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '70vh' }}>
              {formError && (
                <div className="login-error-box" style={{ margin: 0, padding: '10px 14px' }}>
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="tr-num" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Route Number</label>
                    <input
                      id="tr-num"
                      type="text"
                      placeholder="e.g. Route 09"
                      value={routeNum}
                      onChange={(e) => setRouteNum(e.target.value)}
                      disabled={!!editingRoute}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tr-start" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Start Location</label>
                    <input
                      id="tr-start"
                      type="text"
                      placeholder="e.g. Miyapur..."
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="tr-bus" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Bus License Plate</label>
                    <input
                      id="tr-bus"
                      type="text"
                      placeholder="e.g. AP 39 AB 1234"
                      value={busNo}
                      onChange={(e) => setBusNo(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tr-ptime" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Pickup Time</label>
                    <input
                      id="tr-ptime"
                      type="text"
                      placeholder="e.g. 08:05 AM"
                      value={pTime}
                      onChange={(e) => setPTime(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="tr-stops" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Route Stops (Comma separated)</label>
                  <input
                    id="tr-stops"
                    type="text"
                    placeholder="e.g. Miyapur, JNTU, KPHB, Kukatpally, Campus"
                    value={stopsInput}
                    onChange={(e) => setStopsInput(e.target.value)}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label htmlFor="tr-driver" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Driver Name</label>
                    <input
                      id="tr-driver"
                      type="text"
                      placeholder="Enter driver name..."
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tr-phone" style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Driver Phone</label>
                    <input
                      id="tr-phone"
                      type="text"
                      placeholder="Enter driver phone..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Route Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    style={{ width: '100%', background: '#100f2e', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px' }}
                  >
                    <option value="On Time">On Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button type="submit" className="btn-signin" style={{ height: '40px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                  {editingRoute ? 'Save Route' : 'Add Route'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminTransport;
