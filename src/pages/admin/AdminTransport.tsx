import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  getTransportRoutes,
  saveTransportRoutes,
  TransportRouteItem
} from '../../services/storageService';

export const AdminTransport: React.FC = () => {
  // Routes State backed by persistent storage
  const [routes, setRoutes] = useState<TransportRouteItem[]>(() => getTransportRoutes());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Under Maintenance' | 'Suspended'>('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRouteItem | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<TransportRouteItem | null>(null);
  const [overviewRoute, setOverviewRoute] = useState<TransportRouteItem | null>(null);

  // Add Form State
  const [routeName, setRouteName] = useState('');
  const [routeId, setRouteId] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [capacity, setCapacity] = useState<number>(45);
  const [assignedCount, setAssignedCount] = useState<number>(0);
  const [morningTime, setMorningTime] = useState('07:15 AM');
  const [eveningTime, setEveningTime] = useState('05:15 PM');
  const [routeStatus, setRouteStatus] = useState<'Active' | 'Under Maintenance' | 'Suspended'>('Active');
  const [stopsText, setStopsText] = useState('');

  // Toast Notification State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Auto-generate Next Route ID when opening Add Modal
  const handleOpenAddModal = () => {
    const nextNum = routes.length + 1;
    const pad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setRouteId(`RT-${pad}`);
    setRouteName(`Route ${nextNum}: `);
    setBusNumber(`KA-01-FA-${1200 + nextNum * 4}`);
    setDriverName('');
    setDriverPhone('+91 ');
    setCapacity(45);
    setAssignedCount(0);
    setMorningTime('07:15 AM');
    setEveningTime('05:15 PM');
    setRouteStatus('Active');
    setStopsText('Point A, Point B, Point C, Campus Main Gate');
    setIsAddModalOpen(true);
  };

  // Add Route Handler
  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = routeId.trim().toUpperCase();
    const cleanName = routeName.trim();

    if (!cleanId || !cleanName) {
      showToast('Please enter both Route ID and Route Name.', 'error');
      return;
    }

    if (routes.some((r) => r.id.toUpperCase() === cleanId)) {
      showToast(`A route with ID "${cleanId}" already exists.`, 'error');
      return;
    }

    const stops = stopsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newRoute: TransportRouteItem = {
      id: cleanId,
      name: cleanName,
      busNumber: busNumber.trim() || 'KA-01-FA-0000',
      driverName: driverName.trim() || 'Unassigned Driver',
      driverPhone: driverPhone.trim() || '+91 00000 00000',
      capacity: Number(capacity) || 45,
      assignedCount: Number(assignedCount) || 0,
      morningTime: morningTime.trim() || '07:30 AM',
      eveningTime: eveningTime.trim() || '05:15 PM',
      stops: stops.length > 0 ? stops : ['Main Terminal', 'Campus Main Gate'],
      status: routeStatus
    };

    const updated = [...routes, newRoute];
    setRoutes(updated);
    saveTransportRoutes(updated);

    setIsAddModalOpen(false);
    window.dispatchEvent(new Event('storage'));
    showToast(`Transport route "${newRoute.name}" (${newRoute.id}) added successfully!`, 'success');
  };

  // Edit Route Handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    const cleanName = editingRoute.name.trim();
    if (!cleanName) {
      showToast('Route Name cannot be empty.', 'error');
      return;
    }

    const updated = routes.map((r) =>
      r.id === editingRoute.id
        ? {
            ...editingRoute,
            name: cleanName,
            busNumber: editingRoute.busNumber.trim() || 'KA-01-FA-0000',
            driverName: editingRoute.driverName.trim() || 'Unassigned Driver',
            driverPhone: editingRoute.driverPhone.trim() || '+91 00000 00000',
            capacity: Number(editingRoute.capacity) || 45,
            assignedCount: Math.min(Number(editingRoute.assignedCount) || 0, Number(editingRoute.capacity) || 45),
            morningTime: editingRoute.morningTime.trim() || '07:30 AM',
            eveningTime: editingRoute.eveningTime.trim() || '05:15 PM',
            stops: editingRoute.stops.length > 0 ? editingRoute.stops : ['Main Terminal', 'Campus Main Gate'],
            status: editingRoute.status || 'Active'
          }
        : r
    );

    setRoutes(updated);
    saveTransportRoutes(updated);

    const saved = editingRoute;
    setEditingRoute(null);
    window.dispatchEvent(new Event('storage'));
    showToast(`Route "${saved.name}" (${saved.id}) updated successfully!`, 'success');
  };

  // Delete Route Handler
  const handleConfirmDelete = () => {
    if (!deletingRoute) return;

    const targetRoute = deletingRoute;
    const updated = routes.filter((r) => r.id !== targetRoute.id);

    setRoutes(updated);
    saveTransportRoutes(updated);

    setDeletingRoute(null);
    window.dispatchEvent(new Event('storage'));
    showToast(`Route "${targetRoute.name}" (${targetRoute.id}) has been removed.`, 'info');
  };

  // Filtered Routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((rt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        rt.name.toLowerCase().includes(q) ||
        rt.id.toLowerCase().includes(q) ||
        rt.busNumber.toLowerCase().includes(q) ||
        rt.driverName.toLowerCase().includes(q) ||
        rt.driverPhone.toLowerCase().includes(q) ||
        rt.stops.some((st) => st.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'All' || (rt.status || 'Active') === statusFilter;

      return matchQ && matchStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  // Derived Statistics
  const totalRoutesCount = routes.length;
  const totalBuses = routes.length;
  const totalRiders = routes.reduce((sum, r) => sum + (r.assignedCount || 0), 0);
  const totalCapacity = routes.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const fleetUtilization = totalCapacity > 0 ? Math.round((totalRiders / totalCapacity) * 100) : 0;
  const activeDriversCount = routes.filter((r) => r.driverName && !r.driverName.includes('Unassigned')).length;

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Admin Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Transport Management</span>
            </div>
            <h1 className="module-title">Campus Transport Fleet & Route Schedules</h1>
            <p className="module-subtitle">
              Manage university bus transit routes, stop waypoints, driver contact rosters, vehicle allocations, and rider subscriptions.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => showToast(`Transit broadcast alert dispatched to ${totalRiders} subscribed student riders.`, 'info')}
              title="Send an SMS/App alert to all passengers"
            >
              <i className="fa-solid fa-bullhorn"></i>
              <span>Broadcast Transit Alert</span>
            </button>

            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleOpenAddModal}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add New Route</span>
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
              <span className="stat-num">{totalRoutesCount} Routes</span>
              <span className="stat-label">Active Designated Corridors</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-bus"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalBuses} Buses</span>
              <span className="stat-label">Fleet Vehicles ({totalCapacity} Seats)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{totalRiders} Riders</span>
              <span className="stat-label">Subscribed Students ({fleetUtilization}% Filled)</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-id-card"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{activeDriversCount} Drivers</span>
              <span className="stat-label">Licensed Staff on Duty</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="c1-card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              {/* Search Input */}
              <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="Search route name, ID, driver, bus number, or stop waypoint..."
                  style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i
                  className="fa-solid fa-magnifying-glass"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem'
                  }}
                ></i>
              </div>

              {/* Status Filter */}
              <select
                className="c1-select"
                style={{ minWidth: '180px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Operational Statuses</option>
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredRoutes.length}</strong> of {routes.length} transit routes
            </span>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="faculty-courses-full-grid">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((rt) => {
              const status = rt.status || 'Active';
              const seatPercent = rt.capacity > 0 ? Math.round((rt.assignedCount / rt.capacity) * 100) : 0;
              const isFull = rt.assignedCount >= rt.capacity;

              return (
                <div key={rt.id} className="c1-card faculty-course-card-full" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="f-card-header">
                    <div>
                      <span className="course-code-tag">{rt.id}</span>
                      <h3 className="course-title-text" style={{ marginTop: '4px' }}>{rt.name}</h3>
                      <span className="course-dept-text">Bus: <strong>{rt.busNumber}</strong></span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span
                        className={`c1-badge ${
                          isFull
                            ? 'c1-badge-warning'
                            : seatPercent > 80
                            ? 'c1-badge-purple'
                            : 'c1-badge-success'
                        }`}
                      >
                        {rt.assignedCount} / {rt.capacity} Seats ({seatPercent}%)
                      </span>

                      {status !== 'Active' && (
                        <span className="c1-badge c1-badge-error" style={{ fontSize: '0.6875rem' }}>
                          {status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seat Occupancy Progress Bar */}
                  <div style={{ margin: '8px 0', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, seatPercent)}%`,
                        height: '100%',
                        background: isFull ? 'var(--color-warning)' : seatPercent > 80 ? 'var(--accent-purple)' : 'var(--color-success)',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>

                  {/* Route Info Matrix */}
                  <div className="course-info-grid-compact" style={{ marginTop: '4px' }}>
                    <div className="c-info-cell">
                      <i className="fa-solid fa-user-tie"></i>
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

                  {/* Stops Chips */}
                  <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', margin: '12px 0 16px 0', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        <i className="fa-solid fa-location-dot" style={{ marginRight: '5px', color: 'var(--accent-blue)' }}></i>
                        Waypoints ({rt.stops.length} Stops)
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {rt.stops.map((st, i) => (
                        <span key={i} className="c1-badge c1-badge-purple" style={{ fontSize: '0.6875rem' }}>
                          <span style={{ opacity: 0.6, marginRight: '3px' }}>{i + 1}.</span> {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="course-shortcuts-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem' }}
                      onClick={() => setOverviewRoute(rt)}
                      title="Inspect Route Waypoints & Itinerary"
                    >
                      <i className="fa-solid fa-eye"></i>
                      <span>Overview</span>
                    </button>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.78rem', color: 'var(--accent-blue)' }}
                      onClick={() => setEditingRoute({ ...rt })}
                      title="Edit Route & Fleet Details"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary btn-icon-only"
                      style={{ width: '34px', height: '34px', padding: 0, color: 'var(--color-error)' }}
                      onClick={() => setDeletingRoute(rt)}
                      title="Delete Route from Fleet"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="c1-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-bus-simple" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', opacity: 0.6 }}></i>
              <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No transport routes match your query</p>
              <p style={{ fontSize: '0.85rem' }}>Try clearing your search terms or resetting the status filter.</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handleOpenAddModal}
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add New Route</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            MODAL 1: ADD ROUTE MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Add Campus Transport Route"
            maxWidth="md"
          >
            <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route ID *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. RT-05"
                    value={routeId}
                    onChange={(e) => setRouteId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route Name & Corridor *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Route 5: Bannerghatta – Jayanagar – Campus"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Bus / Vehicle Registration No. *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. KA-01-FA-1220"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route Operational Status
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={routeStatus}
                    onChange={(e) => setRouteStatus(e.target.value as any)}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Driver Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Mr. Anand Prakash"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Driver Phone Contact *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. +91 98450 56789"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="c1-input"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Subscribed Riders
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={capacity || 100}
                    className="c1-input"
                    value={assignedCount}
                    onChange={(e) => setAssignedCount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Morning Pickup
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="07:15 AM"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Evening Return
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="05:15 PM"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Transit Stops & Waypoints (Comma-separated) *
                </label>
                <textarea
                  className="c1-input"
                  rows={3}
                  placeholder="e.g. Silk Board Junction, HSR BDA Complex, Agara Lake, Campus Main Gate"
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                ></textarea>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Separate each stop or boarding waypoint with a comma.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Route</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: EDIT ROUTE MODAL
            ============================================================ */}
        {editingRoute && (
          <Modal
            isOpen={true}
            onClose={() => setEditingRoute(null)}
            title={`Edit Transport Route: ${editingRoute.id}`}
            maxWidth="md"
          >
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route ID
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editingRoute.id}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route Name & Corridor *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    required
                    value={editingRoute.name}
                    onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Bus / Vehicle Registration No. *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    required
                    value={editingRoute.busNumber}
                    onChange={(e) => setEditingRoute({ ...editingRoute, busNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Route Operational Status
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={editingRoute.status || 'Active'}
                    onChange={(e) => setEditingRoute({ ...editingRoute, status: e.target.value as any })}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Assigned Driver Name *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    required
                    value={editingRoute.driverName}
                    onChange={(e) => setEditingRoute({ ...editingRoute, driverName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Driver Phone Contact *
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    required
                    value={editingRoute.driverPhone}
                    onChange={(e) => setEditingRoute({ ...editingRoute, driverPhone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Total Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="c1-input"
                    value={editingRoute.capacity}
                    onChange={(e) => setEditingRoute({ ...editingRoute, capacity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Subscribed Riders
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editingRoute.capacity || 100}
                    className="c1-input"
                    value={editingRoute.assignedCount}
                    onChange={(e) => setEditingRoute({ ...editingRoute, assignedCount: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Morning Pickup
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingRoute.morningTime}
                    onChange={(e) => setEditingRoute({ ...editingRoute, morningTime: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Evening Return
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingRoute.eveningTime}
                    onChange={(e) => setEditingRoute({ ...editingRoute, eveningTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Transit Stops & Waypoints (Comma-separated) *
                </label>
                <textarea
                  className="c1-input"
                  rows={3}
                  value={editingRoute.stops.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);
                    setEditingRoute({ ...editingRoute, stops: parsed });
                  }}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                ></textarea>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Editing this field updates the waypoint itinerary tags.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingRoute(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: DELETE CONFIRMATION MODAL
            ============================================================ */}
        {deletingRoute && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingRoute(null)}
            title="Remove Transport Route"
            maxWidth="sm"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-error)', fontSize: '1.3rem', marginTop: '2px' }}></i>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '4px' }}>
                    Confirm Route Removal
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Are you sure you want to delete <strong>{deletingRoute.name} ({deletingRoute.id})</strong> with vehicle <strong>{deletingRoute.busNumber}</strong>?
                  </p>
                  {deletingRoute.assignedCount > 0 && (
                    <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '0.75rem', color: '#fca5a5' }}>
                      <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                      Warning: <strong>{deletingRoute.assignedCount} students</strong> currently subscribed to this bus will need reassignment.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingRoute(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  style={{ background: 'var(--color-error)', color: '#fff' }}
                  onClick={handleConfirmDelete}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Delete Route</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: ROUTE OVERVIEW / ITINERARY INSPECTOR MODAL
            ============================================================ */}
        {overviewRoute && (
          <Modal
            isOpen={true}
            onClose={() => setOverviewRoute(null)}
            title={`Route Overview: ${overviewRoute.name}`}
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="course-code-tag" style={{ fontSize: '0.875rem' }}>{overviewRoute.id}</span>
                  <span className="c1-badge c1-badge-cyan">Bus: {overviewRoute.busNumber}</span>
                  <span className={`c1-badge ${overviewRoute.status === 'Active' || !overviewRoute.status ? 'c1-badge-success' : 'c1-badge-warning'}`}>
                    {overviewRoute.status || 'Active'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={() => {
                      const target = overviewRoute;
                      setOverviewRoute(null);
                      setEditingRoute({ ...target });
                    }}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Edit Route</span>
                  </button>
                </div>
              </div>

              {/* Driver & Timing Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Fleet Staff
                  </span>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      <i className="fa-solid fa-id-badge"></i>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600 }}>{overviewRoute.driverName}</h4>
                      <p style={{ color: 'var(--accent-blue)', fontSize: '0.8125rem' }}>
                        <i className="fa-solid fa-phone" style={{ marginRight: '5px' }}></i>
                        {overviewRoute.driverPhone}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Operating Hours & Seat Allotment
                  </span>
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Morning Pickup:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{overviewRoute.morningTime}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Evening Return:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{overviewRoute.eveningTime}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Subscribed Seats:</span>
                      <strong style={{ color: 'var(--color-success)' }}>{overviewRoute.assignedCount} of {overviewRoute.capacity} Seats</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoint Itinerary Timeline */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  <i className="fa-solid fa-route" style={{ marginRight: '6px', color: 'var(--accent-purple)' }}></i>
                  Transit Stop Sequence & Itinerary
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {overviewRoute.stops.map((stop, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === overviewRoute.stops.length - 1;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: isFirst ? 'rgba(56, 189, 248, 0.08)' : isLast ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px'
                        }}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isFirst ? 'var(--accent-blue)' : isLast ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {stop}
                          </span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {isFirst ? 'Starting Origin Waypoint' : isLast ? 'Terminal Destination Point' : 'Intermediate Scheduled Boarding Stop'}
                          </span>
                        </div>
                        <span className="c1-badge c1-badge-purple" style={{ fontSize: '0.6875rem' }}>
                          Stop #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setOverviewRoute(null)}
                >
                  Close Overview
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
      </div>
    </AppLayout>
  );
};

export default AdminTransport;
