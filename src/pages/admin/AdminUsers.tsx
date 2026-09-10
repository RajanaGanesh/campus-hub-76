import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { getUserAccounts, saveUserAccounts, UserAccountItem } from '../../services/storageService';
import { getManagementData, saveManagementData } from '../../data/managementData';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccountItem[]>(() => getUserAccounts());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'faculty' | 'admin'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserAccountItem | null>(null);

  // Add Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Toggle Suspend / Activate
  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => {
      if (u.id === id) {
        const nextStatus: 'Active' | 'Suspended' = u.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`User ${u.name} account ${nextStatus.toLowerCase()}!`, 'info');
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveUserAccounts(updated);
    window.dispatchEvent(new Event('storage'));
  };

  // Add User Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      showToast('Please enter both name and email address.', 'error');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      showToast(`An account with email "${cleanEmail}" already exists.`, 'error');
      return;
    }

    const nextIdNum = users.length + 1;
    const nextId = `USR-${nextIdNum < 10 ? `0${nextIdNum}` : nextIdNum}`;

    const newUser: UserAccountItem = {
      id: nextId,
      name: cleanName,
      email: cleanEmail,
      role,
      status: 'Active',
      lastActive: 'Just now'
    };

    const updated = [...users, newUser];
    setUsers(updated);
    saveUserAccounts(updated);

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setRole('student');
    window.dispatchEvent(new Event('storage'));
    showToast(`Account for "${newUser.name}" (${newUser.role}) created successfully!`, 'success');
  };

  // Delete User Handler
  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    const targetUser = deletingUser;
    const updatedUsers = users.filter((u) => u.id !== targetUser.id);
    setUsers(updatedUsers);
    saveUserAccounts(updatedUsers);

    // Also remove from management data (students or faculty) if applicable
    try {
      const mgmt = getManagementData();
      const targetEmail = targetUser.email.toLowerCase().trim();
      const targetName = targetUser.name.toLowerCase().trim();

      const updatedStudents = mgmt.students.filter(
        (s) => s.email.toLowerCase().trim() !== targetEmail && s.name.toLowerCase().trim() !== targetName
      );
      const updatedFaculty = mgmt.faculty.filter(
        (f) => f.email.toLowerCase().trim() !== targetEmail && f.name.toLowerCase().trim() !== targetName
      );

      saveManagementData({
        ...mgmt,
        students: updatedStudents,
        faculty: updatedFaculty
      });
    } catch (err) {
      console.warn('Error syncing deleted user across management datasets:', err);
    }

    setDeletingUser(null);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('campushub_management_updated'));
    showToast(`User account "${targetUser.name}" (${targetUser.email}) removed permanently.`, 'info');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQ =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);

      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      const matchStatus = statusFilter === 'All' || u.status === statusFilter;

      return matchQ && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Derived Summary Counts
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalFaculty = users.filter((u) => u.role === 'faculty').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const getRoleBadge = (r: UserAccountItem['role']) => {
    switch (r) {
      case 'admin':
        return <span className="c1-badge c1-badge-error">Administrator</span>;
      case 'faculty':
        return <span className="c1-badge c1-badge-cyan">Faculty</span>;
      default:
        return <span className="c1-badge c1-badge-success">Student</span>;
    }
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
              <span className="crumb-current">User Accounts</span>
            </div>
            <h1 className="module-title">User Accounts & Role Access Control</h1>
            <p className="module-subtitle">
              Manage user authentication identities, access security roles, and account state controls.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsAddModalOpen(true)}
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{users.length}</span>
              <span className="stat-label">Total Registered Accounts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalStudents}</span>
              <span className="stat-label">Student Logins</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalFaculty}</span>
              <span className="stat-label">Faculty Accounts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalAdmins}</span>
              <span className="stat-label">Admin Officers</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="c1-card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              {/* Search input */}
              <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="Search user name, email, ID, or role..."
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

              {/* Role filter */}
              <select
                className="c1-select"
                style={{ minWidth: '150px', fontSize: '0.85rem' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
              >
                <option value="All">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrators</option>
              </select>

              {/* Status filter */}
              <select
                className="c1-select"
                style={{ minWidth: '150px', fontSize: '0.85rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Authentication Directory</h3>
              <p className="c1-card-subtitle">Role permissions and status enforcement</p>
            </div>
            <span className="c1-badge c1-badge-cyan">RBAC Enforced</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>User Identity</th>
                  <th>Institutional Email</th>
                  <th>Access Role</th>
                  <th>Account State</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td><span className="course-code-cell">{u.id}</span></td>
                      <td><strong style={{ color: 'var(--text-primary)' }}>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        <span className={`c1-badge ${u.status === 'Active' ? 'c1-badge-success' : 'c1-badge-error'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>{u.lastActive}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', color: u.status === 'Active' ? 'var(--color-warning)' : 'var(--color-success)' }}
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-icon-only"
                            style={{ width: '30px', height: '30px', padding: 0, color: 'var(--color-error)' }}
                            onClick={() => setDeletingUser(u)}
                            title="Delete User Account"
                          >
                            <i className="fa-solid fa-trash-can" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                      No user accounts match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================
            MODAL 1: ADD USER MODAL
            ============================================================ */}
        {isAddModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsAddModalOpen(false)}
            title="Create User Account"
            maxWidth="md"
          >
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  User Full Name *
                </label>
                <input
                  type="text"
                  className="c1-input"
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  className="c1-input"
                  placeholder="e.g. vikram.sharma@campushub.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Access Role & Security Privilege *
                </label>
                <select
                  className="c1-select"
                  style={{ width: '100%' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                >
                  <option value="student">Student (Student Portal Access)</option>
                  <option value="faculty">Faculty (Faculty Portal Access)</option>
                  <option value="admin">Administrator (Full Admin Portal Access)</option>
                </select>
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
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: DELETE CONFIRMATION MODAL
            ============================================================ */}
        {deletingUser && (
          <Modal
            isOpen={true}
            onClose={() => setDeletingUser(null)}
            title="Delete User Account"
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
                    Confirm Permanent Deletion
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Are you sure you want to delete the user account for <strong>{deletingUser.name}</strong> ({deletingUser.email})?
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
                    This will permanently revoke all role access ({deletingUser.role}) and remove the account record across institutional rosters.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setDeletingUser(null)}
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
                  <span>Delete Account</span>
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

export default AdminUsers;
