import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  getHostelBlocks,
  saveHostelBlocks,
  getHostelAllocations,
  saveHostelAllocations,
  HostelBlockItem,
  HostelAllocationItem
} from '../../services/storageService';

export const AdminHostel: React.FC = () => {
  // 1. Data States backed by persistent storage
  const [blocks, setBlocks] = useState<HostelBlockItem[]>(() => getHostelBlocks());
  const [allocations, setAllocations] = useState<HostelAllocationItem[]>(() => getHostelAllocations());

  // 2. Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // 3. Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<HostelAllocationItem | null>(null);
  const [deletingAllocation, setDeletingAllocation] = useState<HostelAllocationItem | null>(null);
  const [viewingAllocation, setViewingAllocation] = useState<HostelAllocationItem | null>(null);

  // 4. Form States for New Allocation
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [block, setBlock] = useState('Block A');
  const [room, setRoom] = useState('Room A-205');
  const [roomType, setRoomType] = useState<HostelAllocationItem['roomType']>('Double AC');
  const [bedNumber, setBedNumber] = useState('Bed 1');
  const [joinedDate, setJoinedDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });
  const [status, setStatus] = useState<HostelAllocationItem['status']>('Active Occupant');
  const [messPlan, setMessPlan] = useState('Standard Veg');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [remarks, setRemarks] = useState('');

  // 5. Toast Notification State
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open Add Allocation Modal & Prepopulate defaults
  const handleOpenAddModal = () => {
    const nextNum = allocations.length + 1;
    setStudentName('');
    setRollNo(`236F1A05${50 + nextNum}`);
    setDepartment('Computer Science & Engineering');
    setYear('3rd Year');
    setPhone('+91 98765 ');
    setEmail('');
    setBlock('Block A');
    setRoom('Room A-205');
    setRoomType('Double AC');
    setBedNumber('Bed 1');
    setJoinedDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
    setStatus('Active Occupant');
    setMessPlan('Standard Veg');
    setEmergencyContact('+91 98');
    setRemarks('');
    setIsAddModalOpen(true);
  };

  // Handle Add Member Allocation
  const handleAddAllocation = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = studentName.trim();
    const cleanRoll = rollNo.trim().toUpperCase();
    const cleanRoom = room.trim();

    if (!cleanName || !cleanRoll || !cleanRoom) {
      showToast('Please provide Student Name, Roll Number, and Room Allocation.', 'error');
      return;
    }

    // Check if roll number already has an active allocation
    const existingActive = allocations.find(
      (a) => a.rollNo.toUpperCase() === cleanRoll && a.status === 'Active Occupant'
    );
    if (existingActive) {
      showToast(`Student with Roll No ${cleanRoll} is already allocated in ${existingActive.block} (${existingActive.room}).`, 'warning');
      return;
    }

    const newId = `HOSTEL-ALC-${String(allocations.length + 1).padStart(3, '0')}`;
    const newAllocation: HostelAllocationItem = {
      id: newId,
      studentName: cleanName,
      rollNo: cleanRoll,
      department: department.trim() || 'Computer Science & Engineering',
      year: year || '1st Year',
      phone: phone.trim() || '+91 98765 00000',
      email: email.trim() || `${cleanRoll.toLowerCase()}@campushub.edu`,
      block,
      room: cleanRoom,
      roomType,
      bedNumber,
      joined: joinedDate,
      status,
      messPlan,
      emergencyContact: emergencyContact.trim() || '+91 98000 00000',
      remarks: remarks.trim()
    };

    const updatedAllocations = [newAllocation, ...allocations];
    setAllocations(updatedAllocations);
    saveHostelAllocations(updatedAllocations);

    // Update block occupied count if active
    if (status === 'Active Occupant') {
      const updatedBlocks = blocks.map((b) => {
        if (b.code === block) {
          const newOccupied = Math.min(b.rooms, b.occupied + 1);
          const newVacant = Math.max(0, b.rooms - newOccupied - b.maintenance);
          return { ...b, occupied: newOccupied, vacant: newVacant };
        }
        return b;
      });
      setBlocks(updatedBlocks);
      saveHostelBlocks(updatedBlocks);
    }

    setIsAddModalOpen(false);
    showToast(`Resident ${cleanName} (${cleanRoll}) successfully allocated to ${cleanRoom} in ${block}!`, 'success');
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: HostelAllocationItem) => {
    setEditingAllocation({ ...item });
  };

  // Save Edit Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAllocation) return;

    const updated = allocations.map((a) => (a.id === editingAllocation.id ? editingAllocation : a));
    setAllocations(updated);
    saveHostelAllocations(updated);

    setEditingAllocation(null);
    showToast(`Allocation details updated for ${editingAllocation.studentName}.`, 'success');
  };

  // Handle Vacate / Release Bed
  const handleConfirmVacate = () => {
    if (!deletingAllocation) return;

    const updatedAllocations = allocations.filter((a) => a.id !== deletingAllocation.id);
    setAllocations(updatedAllocations);
    saveHostelAllocations(updatedAllocations);

    // Update block capacity
    const updatedBlocks = blocks.map((b) => {
      if (b.code === deletingAllocation.block) {
        const newOccupied = Math.max(0, b.occupied - 1);
        const newVacant = Math.min(b.rooms, b.rooms - newOccupied - b.maintenance);
        return { ...b, occupied: newOccupied, vacant: newVacant };
      }
      return b;
    });
    setBlocks(updatedBlocks);
    saveHostelBlocks(updatedBlocks);

    showToast(`Room allocation for ${deletingAllocation.studentName} has been released.`, 'info');
    setDeletingAllocation(null);
  };

  // Filtered Allocations
  const filteredAllocations = useMemo(() => {
    return allocations.filter((a) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        a.studentName.toLowerCase().includes(query) ||
        a.rollNo.toLowerCase().includes(query) ||
        a.block.toLowerCase().includes(query) ||
        a.room.toLowerCase().includes(query) ||
        a.department.toLowerCase().includes(query);

      const matchesBlock = selectedBlockFilter === 'All' || a.block === selectedBlockFilter;
      const matchesStatus = selectedStatusFilter === 'All' || a.status === selectedStatusFilter;

      return matchesSearch && matchesBlock && matchesStatus;
    });
  }, [allocations, searchQuery, selectedBlockFilter, selectedStatusFilter]);

  // Overall Live Stats
  const totalRooms = blocks.reduce((acc, b) => acc + b.rooms, 0);
  const totalOccupied = blocks.reduce((acc, b) => acc + b.occupied, 0);
  const totalVacant = blocks.reduce((acc, b) => acc + b.vacant, 0);
  const totalMaintenance = blocks.reduce((acc, b) => acc + b.maintenance, 0);

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Student Name', 'Roll No', 'Department', 'Year', 'Block', 'Room', 'Room Type', 'Bed', 'Join Date', 'Status', 'Mess Plan', 'Phone', 'Emergency Contact'];
    const rows = filteredAllocations.map((a) => [
      a.id,
      `"${a.studentName}"`,
      a.rollNo,
      `"${a.department}"`,
      a.year,
      a.block,
      `"${a.room}"`,
      a.roomType,
      a.bedNumber,
      a.joined,
      a.status,
      a.messPlan,
      a.phone,
      a.emergencyContact
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Resident_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Resident ledger CSV exported successfully.', 'success');
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
              <span className="crumb-current">Hostel Management</span>
            </div>
            <h1 className="module-title">Campus Hostel & Residency Management</h1>
            <p className="module-subtitle">
              Manage residential blocks, room allocations, resident student enrollments, warden registries, and bed availability.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleExportCSV}
              title="Export resident roster to CSV"
            >
              <i className="fa-solid fa-file-csv"></i>
              <span>Export Roster</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleOpenAddModal}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Allocate Room</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-hotel"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalRooms} Rooms</span>
              <span className="stat-label">Total Residential Capacity</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-bed"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{totalOccupied} Occupied</span>
              <span className="stat-label">
                Resident Students ({totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0}%)
              </span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-door-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#38bdf8' }}>{totalVacant} Available</span>
              <span className="stat-label">Vacant Beds</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{totalMaintenance} Rooms</span>
              <span className="stat-label">Under Maintenance</span>
            </div>
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="faculty-courses-full-grid" style={{ marginBottom: '24px' }}>
          {blocks.map((b) => (
            <div key={b.code} className="c1-card faculty-course-card-full">
              <div className="f-card-header">
                <div>
                  <span className="course-code-tag">{b.code}</span>
                  <h3 className="course-title-text" style={{ fontSize: '1rem', marginTop: '4px' }}>{b.name}</h3>
                  <span className="course-dept-text" style={{ fontSize: '0.8125rem' }}>
                    <i className="fa-solid fa-user-shield" style={{ marginRight: '6px', color: 'var(--accent-blue)' }}></i>
                    Warden: {b.warden} ({b.phone})
                  </span>
                </div>
                <span className="c1-badge c1-badge-cyan">{b.occupied} / {b.rooms} Beds</span>
              </div>

              <div className="course-info-grid-compact" style={{ marginTop: '12px' }}>
                <div className="c-info-cell">
                  <i className="fa-solid fa-bed" style={{ color: '#34d399' }}></i>
                  <span>Occupied: <strong>{b.occupied}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-door-open" style={{ color: '#38bdf8' }}></i>
                  <span>Vacant: <strong>{b.vacant}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-wrench" style={{ color: '#fbbf24' }}></i>
                  <span>Repairs: <strong>{b.maintenance}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-chart-pie" style={{ color: '#818cf8' }}></i>
                  <span>Occupancy: <strong>{Math.round((b.occupied / b.rooms) * 100)}%</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Allocations Table Card */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
            <div>
              <h3 className="c1-card-title">Resident Student Room Ledger</h3>
              <p className="c1-card-subtitle">Active student hostel room allocations, mess preferences, and verification details</p>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <div className="c1-search-input-wrap" style={{ position: 'relative', minWidth: '220px' }}>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="Search student, roll no, room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              <select
                className="c1-select"
                value={selectedBlockFilter}
                onChange={(e) => setSelectedBlockFilter(e.target.value)}
              >
                <option value="All">All Blocks</option>
                <option value="Block A">Block A (Boys Senior)</option>
                <option value="Block B">Block B (Boys Junior)</option>
                <option value="Block C">Block C (Girls Senior)</option>
                <option value="Block D">Block D (Girls Junior)</option>
              </select>

              <select
                className="c1-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active Occupant">Active Occupant</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Temporary Leave">Temporary Leave</option>
                <option value="Vacated">Vacated</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="student-roster-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Student Candidate</th>
                  <th>Department & Year</th>
                  <th>Residential Block</th>
                  <th>Room & Bed</th>
                  <th>Room Type</th>
                  <th>Mess Plan</th>
                  <th>Allotted Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.length > 0 ? (
                  filteredAllocations.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{a.studentName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                            {a.rollNo}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{a.department}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.year}</div>
                      </td>
                      <td>
                        <span className="course-code-tag">{a.block}</span>
                      </td>
                      <td>
                        <strong style={{ color: '#38bdf8', display: 'block' }}>{a.room}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.bedNumber}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem' }}>{a.roomType}</span>
                      </td>
                      <td>
                        <span className="c1-badge c1-badge-cyan" style={{ fontSize: '0.75rem' }}>
                          <i className="fa-solid fa-utensils" style={{ marginRight: '4px' }}></i>
                          {a.messPlan}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{a.joined}</span>
                      </td>
                      <td>
                        <span
                          className={`c1-badge ${
                            a.status === 'Active Occupant'
                              ? 'c1-badge-success'
                              : a.status === 'Temporary Leave'
                              ? 'c1-badge-warning'
                              : a.status === 'Under Verification'
                              ? 'c1-badge-cyan'
                              : 'c1-badge-secondary'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="c1-btn-action"
                            title="View Resident Details"
                            onClick={() => setViewingAllocation(a)}
                            style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: 'none', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="c1-btn-action"
                            title="Edit Allocation"
                            onClick={() => handleOpenEditModal(a)}
                            style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            type="button"
                            className="c1-btn-action"
                            title="Vacate / Release Bed"
                            onClick={() => setDeletingAllocation(a)}
                            style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', cursor: 'pointer' }}
                          >
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>
                        <i className="fa-solid fa-hotel"></i>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>No Resident Allocations Found</div>
                      <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>
                        Try adjusting your search query or filters, or allocate a new student to a hostel room.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL 1: Allocate Room / Add Member                                    */}
        {/* ---------------------------------------------------------------------- */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Allocate Hostel Room / Add Resident Member"
          maxWidth="lg"
        >
          <form onSubmit={handleAddAllocation}>
            <div style={{ display: 'grid', gap: '16px' }}>
              {/* Row 1: Student Name & Roll No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">
                    Student Candidate Name <span className="required" style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Rahul Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="c1-form-label">
                    Roll Number / Student ID <span className="required" style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. 236F1A0560"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Department & Academic Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Academic Department</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="c1-form-label">Academic Year</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Residential Block, Room No & Room Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">
                    Hostel Block <span className="required" style={{ color: '#f87171' }}>*</span>
                  </label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  >
                    <option value="Block A">Block A (Boys Senior)</option>
                    <option value="Block B">Block B (Boys Junior)</option>
                    <option value="Block C">Block C (Girls Senior)</option>
                    <option value="Block D">Block D (Girls Junior)</option>
                  </select>
                </div>

                <div>
                  <label className="c1-form-label">
                    Room Number <span className="required" style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Room A-205"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="c1-form-label">Room Type</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as any)}
                  >
                    <option value="Double AC">Double AC</option>
                    <option value="Single AC">Single AC</option>
                    <option value="Double Non-AC">Double Non-AC</option>
                    <option value="Single Non-AC">Single Non-AC</option>
                    <option value="3-Sharing Non-AC">3-Sharing Non-AC</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Bed Number, Joining Date, Mess Plan */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Bed Identifier</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                  >
                    <option value="Bed 1">Bed 1 (Left Window)</option>
                    <option value="Bed 2">Bed 2 (Right Corner)</option>
                    <option value="Bed 3">Bed 3 (Center)</option>
                  </select>
                </div>

                <div>
                  <label className="c1-form-label">Allotment Date</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. 15 Aug 2026"
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="c1-form-label">Mess / Catering Plan</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={messPlan}
                    onChange={(e) => setMessPlan(e.target.value)}
                  >
                    <option value="Standard Veg">Standard Veg</option>
                    <option value="Standard Non-Veg">Standard Non-Veg</option>
                    <option value="Special Veg">Special Veg (Jain/Diet)</option>
                    <option value="Premium Dining">Premium Dining Plan</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Contact Info & Emergency Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Student Phone</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="c1-form-label">Student Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    placeholder="student@campushub.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="c1-form-label">Guardian Emergency Phone</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="+91 98000 00000"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 6: Occupancy Status & Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Occupancy Status</label>
                  <select
                    className="c1-select"
                    style={{ width: '100%' }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="Active Occupant">Active Occupant</option>
                    <option value="Under Verification">Under Verification</option>
                    <option value="Temporary Leave">Temporary Leave</option>
                  </select>
                </div>
                <div>
                  <label className="c1-form-label">Remarks / Special Medical / Dietary Notes</label>
                  <input
                    type="text"
                    className="c1-input"
                    placeholder="e.g. Ground floor preference requested for medical reasons"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
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
                <i className="fa-solid fa-check"></i>
                <span>Confirm Allotment</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL 2: Edit Allocation                                               */}
        {/* ---------------------------------------------------------------------- */}
        {editingAllocation && (
          <Modal
            isOpen={!!editingAllocation}
            onClose={() => setEditingAllocation(null)}
            title={`Edit Room Allocation – ${editingAllocation.studentName}`}
            maxWidth="lg"
          >
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="c1-form-label">Student Candidate Name</label>
                    <input
                      type="text"
                      className="c1-input"
                      value={editingAllocation.studentName}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, studentName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="c1-form-label">Roll Number</label>
                    <input
                      type="text"
                      className="c1-input"
                      value={editingAllocation.rollNo}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, rollNo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="c1-form-label">Hostel Block</label>
                    <select
                      className="c1-select"
                      style={{ width: '100%' }}
                      value={editingAllocation.block}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, block: e.target.value })}
                    >
                      <option value="Block A">Block A (Boys Senior)</option>
                      <option value="Block B">Block B (Boys Junior)</option>
                      <option value="Block C">Block C (Girls Senior)</option>
                      <option value="Block D">Block D (Girls Junior)</option>
                    </select>
                  </div>
                  <div>
                    <label className="c1-form-label">Allotted Room</label>
                    <input
                      type="text"
                      className="c1-input"
                      value={editingAllocation.room}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, room: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="c1-form-label">Room Type</label>
                    <select
                      className="c1-select"
                      style={{ width: '100%' }}
                      value={editingAllocation.roomType}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, roomType: e.target.value as any })}
                    >
                      <option value="Double AC">Double AC</option>
                      <option value="Single AC">Single AC</option>
                      <option value="Double Non-AC">Double Non-AC</option>
                      <option value="Single Non-AC">Single Non-AC</option>
                      <option value="3-Sharing Non-AC">3-Sharing Non-AC</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="c1-form-label">Bed Number</label>
                    <select
                      className="c1-select"
                      style={{ width: '100%' }}
                      value={editingAllocation.bedNumber}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, bedNumber: e.target.value })}
                    >
                      <option value="Bed 1">Bed 1</option>
                      <option value="Bed 2">Bed 2</option>
                      <option value="Bed 3">Bed 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="c1-form-label">Mess Plan</label>
                    <select
                      className="c1-select"
                      style={{ width: '100%' }}
                      value={editingAllocation.messPlan}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, messPlan: e.target.value })}
                    >
                      <option value="Standard Veg">Standard Veg</option>
                      <option value="Standard Non-Veg">Standard Non-Veg</option>
                      <option value="Special Veg">Special Veg</option>
                      <option value="Premium Dining">Premium Dining</option>
                    </select>
                  </div>
                  <div>
                    <label className="c1-form-label">Occupancy Status</label>
                    <select
                      className="c1-select"
                      style={{ width: '100%' }}
                      value={editingAllocation.status}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, status: e.target.value as any })}
                    >
                      <option value="Active Occupant">Active Occupant</option>
                      <option value="Temporary Leave">Temporary Leave</option>
                      <option value="Under Verification">Under Verification</option>
                      <option value="Vacated">Vacated</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="c1-form-label">Phone Contact</label>
                    <input
                      type="text"
                      className="c1-input"
                      value={editingAllocation.phone}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="c1-form-label">Emergency Guardian Phone</label>
                    <input
                      type="text"
                      className="c1-input"
                      value={editingAllocation.emergencyContact}
                      onChange={(e) => setEditingAllocation({ ...editingAllocation, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="c1-form-label">Remarks & Notes</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editingAllocation.remarks || ''}
                    onChange={(e) => setEditingAllocation({ ...editingAllocation, remarks: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setEditingAllocation(null)}
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

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL 3: View Resident Allotment Card                                  */}
        {/* ---------------------------------------------------------------------- */}
        {viewingAllocation && (
          <Modal
            isOpen={!!viewingAllocation}
            onClose={() => setViewingAllocation(null)}
            title="Resident Allotment Details"
            maxWidth="md"
          >
            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>
                  {viewingAllocation.studentName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {viewingAllocation.studentName}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '2px' }}>
                    Roll No: {viewingAllocation.rollNo} • {viewingAllocation.year}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {viewingAllocation.department}
                  </div>
                </div>
                <div>
                  <span className="c1-badge c1-badge-success">{viewingAllocation.status}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Hostel Block</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{viewingAllocation.block}</strong>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Room & Bed</span>
                  <strong style={{ color: '#38bdf8', fontSize: '0.9375rem' }}>{viewingAllocation.room} ({viewingAllocation.bedNumber})</strong>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Room Type</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{viewingAllocation.roomType}</strong>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Mess Plan</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{viewingAllocation.messPlan}</strong>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Student Phone</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{viewingAllocation.phone}</span>
                </div>

                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Emergency Guardian Contact</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{viewingAllocation.emergencyContact}</span>
                </div>
              </div>

              {viewingAllocation.remarks && (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Remarks / Special Notes:</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{viewingAllocation.remarks}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setViewingAllocation(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => {
                    const toEdit = viewingAllocation;
                    setViewingAllocation(null);
                    handleOpenEditModal(toEdit);
                  }}
                >
                  <i className="fa-solid fa-pen-to-square"></i>
                  <span>Edit Allotment</span>
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/* MODAL 4: Vacate / Release Confirmation                                 */}
        {/* ---------------------------------------------------------------------- */}
        {deletingAllocation && (
          <Modal
            isOpen={!!deletingAllocation}
            onClose={() => setDeletingAllocation(null)}
            title="Confirm Vacating Room"
            maxWidth="sm"
          >
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Release Room Allocation?
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Are you sure you want to vacate room <strong>{deletingAllocation.room}</strong> for student{' '}
                <strong>{deletingAllocation.studentName}</strong> ({deletingAllocation.rollNo}) in{' '}
                <strong>{deletingAllocation.block}</strong>?
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>
                This will release the bed back to vacant capacity and remove this student from active hostel records.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setDeletingAllocation(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="c1-btn"
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={handleConfirmVacate}
              >
                <i className="fa-solid fa-door-open"></i>
                <span>Yes, Vacate Room</span>
              </button>
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

export default AdminHostel;
