import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  getUserAccounts,
  saveUserAccounts,
  UserAccountItem,
  getLoginHistory,
  recordLoginEvent,
  updateLoginSessionStatus,
  clearLoginHistory,
  LoginHistoryRecord
} from '../../services/storageService';

import { getManagementData, saveManagementData } from '../../data/managementData';
import { downloadCSV } from '../../utils/fileDownloader';

export const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'directory';
  const [activeTab, setActiveTab] = useState<'directory' | 'history'>(initialTab);

  // User Accounts State
  const [users, setUsers] = useState<UserAccountItem[]>(() => getUserAccounts());

  // Login History State
  const [loginHistory, setLoginHistory] = useState<LoginHistoryRecord[]>(() => getLoginHistory());

  // Directory Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'faculty' | 'admin'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  // Login History Search & Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyRoleFilter, setHistoryRoleFilter] = useState<'All' | 'student' | 'faculty' | 'admin'>('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'All' | 'Active Session' | 'Success' | 'Logged Out' | 'Terminated by Admin'>('All');
  const [historyDateFilter, setHistoryDateFilter] = useState<'All' | 'Today' | 'Past 7 Days'>('All');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserAccountItem | null>(null);
  const [selectedLog, setSelectedLog] = useState<LoginHistoryRecord | null>(null);
  const [isClearHistoryModalOpen, setIsClearHistoryModalOpen] = useState(false);

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Synchronize state on external events (e.g. login from another tab or service)
  useEffect(() => {
    const handleStorageUpdate = () => {
      setUsers(getUserAccounts());
      setLoginHistory(getLoginHistory());
    };

    window.addEventListener('campushub_login_history_updated', handleStorageUpdate);
    window.addEventListener('campushub_management_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('campushub_login_history_updated', handleStorageUpdate);
      window.removeEventListener('campushub_management_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Update tab in state and query param
  const handleTabChange = (tab: 'directory' | 'history') => {
    setActiveTab(tab);
    setSearchParams(tab === 'history' ? { tab: 'history' } : {});
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

  // Terminate Active Session
  const handleTerminateSession = (logId: string, userName: string) => {
    updateLoginSessionStatus(logId, 'Terminated by Admin');
    const updatedHistory = getLoginHistory();
    setLoginHistory(updatedHistory);
    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog({ ...selectedLog, status: 'Terminated by Admin' });
    }
    showToast(`Session for ${userName} terminated by Administrator.`, 'warning');
  };

  // Clear Login History Handler
  const handleClearHistory = () => {
    clearLoginHistory();
    setLoginHistory([]);
    setIsClearHistoryModalOpen(false);
    showToast('Login audit logs cleared successfully.', 'info');
  };

  // Simulate Test Login for Verification
  const handleSimulateLogin = (testRole: 'student' | 'faculty') => {
    const mgmt = getManagementData();
    if (testRole === 'student') {
      const randomStudent = mgmt.students[Math.floor(Math.random() * mgmt.students.length)] || {
        id: '236F1A0551',
        name: 'Rajana Ganesh',
        email: 'grajana608@gmail.com',
        department: 'Computer Science & Engineering'
      };
      const newLog = recordLoginEvent({
        userId: randomStudent.id,
        userName: randomStudent.name,
        userEmail: randomStudent.email,
        role: 'student',
        ipAddress: `192.168.1.${Math.floor(50 + Math.random() * 150)} (Campus Wi-Fi)`,
        deviceInfo: 'Chrome 128 / Android 14',
        loginLocation: 'Central Library / Student Area',
        authMethod: 'Password',
        status: 'Active Session'
      });
      setLoginHistory(getLoginHistory());
      showToast(`Simulated live student login for "${newLog.userName}" (${newLog.userId}).`, 'success');
    } else {
      const randomFaculty = mgmt.faculty[Math.floor(Math.random() * mgmt.faculty.length)] || {
        id: 'FAC-CSE-01',
        name: 'Dr. Suresh Kumar',
        email: 'faculty@campushub.com',
        department: 'Computer Science & Engineering'
      };
      const newLog = recordLoginEvent({
        userId: randomFaculty.id,
        userName: randomFaculty.name,
        userEmail: randomFaculty.email,
        role: 'faculty',
        ipAddress: `172.16.10.${Math.floor(10 + Math.random() * 50)} (Faculty LAN)`,
        deviceInfo: 'Chrome 128 / macOS Sonoma',
        loginLocation: `${randomFaculty.department || 'Academic'} Department Wing`,
        authMethod: 'Password',
        status: 'Active Session'
      });
      setLoginHistory(getLoginHistory());
      showToast(`Simulated live faculty login for "${newLog.userName}" (${newLog.userId}).`, 'success');
    }
  };

  // Export Login History CSV
  const handleExportHistoryCSV = () => {
    const headers = [
      'Log_ID',
      'User_ID',
      'User_Name',
      'Email_Address',
      'Role',
      'Login_Timestamp',
      'IP_Address',
      'Device_Platform',
      'Location_Network',
      'Auth_Method',
      'Session_Status'
    ];

    const rows = filteredHistory.map((item) => [
      item.id,
      item.userId,
      item.userName,
      item.userEmail,
      item.role.toUpperCase(),
      item.timestamp,
      item.ipAddress,
      item.deviceInfo,
      item.loginLocation,
      item.authMethod,
      item.status
    ]);

    downloadCSV('CampusHub_Student_Faculty_Login_Audit_Report.csv', headers, rows);
    showToast(`Exported ${filteredHistory.length} login audit records as CSV!`, 'success');
  };

  // Filtered Users for Directory
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

  // Filtered Login History Records
  const filteredHistory = useMemo(() => {
    return loginHistory.filter((log) => {
      const q = historySearch.toLowerCase().trim();
      const matchQ =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.userEmail.toLowerCase().includes(q) ||
        log.userId.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q) ||
        log.deviceInfo.toLowerCase().includes(q) ||
        log.loginLocation.toLowerCase().includes(q);

      const matchRole = historyRoleFilter === 'All' || log.role === historyRoleFilter;
      const matchStatus = historyStatusFilter === 'All' || log.status === historyStatusFilter;

      let matchDate = true;
      if (historyDateFilter === 'Today') {
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        matchDate = log.timestamp.includes(todayStr);
      } else if (historyDateFilter === 'Past 7 Days') {
        matchDate = true;
      }

      return matchQ && matchRole && matchStatus && matchDate;
    });
  }, [loginHistory, historySearch, historyRoleFilter, historyStatusFilter, historyDateFilter]);

  // Directory Stats
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalFaculty = users.filter((u) => u.role === 'faculty').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  // History Stats
  const activeStudentSessions = loginHistory.filter((l) => l.role === 'student' && l.status === 'Active Session').length;
  const activeFacultySessions = loginHistory.filter((l) => l.role === 'faculty' && l.status === 'Active Session').length;
  const totalActiveSessions = loginHistory.filter((l) => l.status === 'Active Session').length;
  const studentLoginsCount = loginHistory.filter((l) => l.role === 'student').length;
  const facultyLoginsCount = loginHistory.filter((l) => l.role === 'faculty').length;

  const getRoleBadge = (r: 'student' | 'faculty' | 'admin') => {
    switch (r) {
      case 'admin':
        return <span className="c1-badge c1-badge-error">Administrator</span>;
      case 'faculty':
        return <span className="c1-badge c1-badge-cyan">Faculty</span>;
      default:
        return <span className="c1-badge c1-badge-success">Student</span>;
    }
  };

  const getStatusBadge = (status: LoginHistoryRecord['status']) => {
    switch (status) {
      case 'Active Session':
        return (
          <span
            className="c1-badge c1-badge-success"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981'
              }}
            ></span>
            Active Session
          </span>
        );
      case 'Success':
        return <span className="c1-badge c1-badge-blue">Authenticated</span>;
      case 'Logged Out':
        return <span className="c1-badge c1-badge-purple">Logged Out</span>;
      case 'Terminated by Admin':
        return <span className="c1-badge c1-badge-error">Revoked</span>;
      default:
        return <span className="c1-badge c1-badge-secondary">{status}</span>;
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
              <span className="crumb-current">User Accounts & Access Audit</span>
            </div>
            <h1 className="module-title">User Accounts & Security Audit</h1>
            <p className="module-subtitle">
              Manage user authentication identities, view real-time student and faculty login audit trails, and control active sessions.
            </p>
          </div>

          <div className="module-header-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'directory' ? (
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setIsAddModalOpen(true)}
              >
                <i className="fa-solid fa-user-plus"></i>
                <span>Add New User</span>
              </button>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => handleSimulateLogin('student')}
                    title="Simulate live student login event"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <i className="fa-solid fa-user-graduate" style={{ color: '#34d399' }}></i>
                    <span>Test Student Login</span>
                  </button>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => handleSimulateLogin('faculty')}
                    title="Simulate live faculty login event"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <i className="fa-solid fa-chalkboard-user" style={{ color: '#38bdf8' }}></i>
                    <span>Test Faculty Login</span>
                  </button>
                </div>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={handleExportHistoryCSV}
                >
                  <i className="fa-solid fa-file-csv"></i>
                  <span>Export Audit CSV</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '22px',
            paddingBottom: '2px'
          }}
        >
          <button
            type="button"
            className="c1-btn"
            style={{
              background: activeTab === 'directory' ? 'var(--primary-light, rgba(99, 102, 241, 0.15))' : 'transparent',
              color: activeTab === 'directory' ? 'var(--primary-color, #818cf8)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'directory' ? '2px solid var(--primary-color, #818cf8)' : '2px solid transparent',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'directory' ? 700 : 500,
              padding: '10px 18px',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => handleTabChange('directory')}
          >
            <i className="fa-solid fa-users-gear"></i>
            <span>Authentication Directory</span>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 7px',
                borderRadius: '10px',
                marginLeft: '4px'
              }}
            >
              {users.length}
            </span>
          </button>

          <button
            type="button"
            className="c1-btn"
            style={{
              background: activeTab === 'history' ? 'var(--primary-light, rgba(99, 102, 241, 0.15))' : 'transparent',
              color: activeTab === 'history' ? 'var(--primary-color, #818cf8)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary-color, #818cf8)' : '2px solid transparent',
              borderRadius: '8px 8px 0 0',
              fontWeight: activeTab === 'history' ? 700 : 500,
              padding: '10px 18px',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => handleTabChange('history')}
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            <span>Student & Faculty Login History</span>
            <span
              style={{
                fontSize: '0.75rem',
                background: totalActiveSessions > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                color: totalActiveSessions > 0 ? '#34d399' : 'inherit',
                border: totalActiveSessions > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                padding: '2px 7px',
                borderRadius: '10px',
                marginLeft: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {totalActiveSessions > 0 && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span>
              )}
              {loginHistory.length} Logs
            </span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: AUTHENTICATION DIRECTORY
            ============================================================ */}
        {activeTab === 'directory' && (
          <>
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
          </>
        )}

        {/* ============================================================
            TAB 2: LOGIN HISTORY & SESSION AUDIT LOG
            ============================================================ */}
        {activeTab === 'history' && (
          <>
            {/* 4 Login History Stat Cards */}
            <div className="academic-stats-grid">
              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{loginHistory.length}</span>
                  <span className="stat-label">Total Login Audits</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div className="stat-card-data">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="stat-num">{activeStudentSessions}</span>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Active</span>
                  </div>
                  <span className="stat-label">Student Live Sessions ({studentLoginsCount} Total)</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
                <div className="stat-card-data">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="stat-num">{activeFacultySessions}</span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>Active</span>
                  </div>
                  <span className="stat-label">Faculty Live Sessions ({facultyLoginsCount} Total)</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num" style={{ color: '#fbbf24' }}>
                    {loginHistory.length > 0
                      ? `${(
                          (loginHistory.filter((l) => l.status !== 'Terminated by Admin').length /
                            loginHistory.length) *
                          100
                        ).toFixed(1)}%`
                      : '100%'}
                  </span>
                  <span className="stat-label">Authentication Success Rate</span>
                </div>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="c1-card" style={{ marginBottom: '20px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
                    <input
                      type="text"
                      className="c1-input"
                      placeholder="Search student/faculty name, roll ID, IP, device, location..."
                      style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
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
                    style={{ minWidth: '140px', fontSize: '0.85rem' }}
                    value={historyRoleFilter}
                    onChange={(e) => setHistoryRoleFilter(e.target.value as any)}
                  >
                    <option value="All">All Roles</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="admin">Admins Only</option>
                  </select>

                  {/* Status filter */}
                  <select
                    className="c1-select"
                    style={{ minWidth: '150px', fontSize: '0.85rem' }}
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value as any)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active Session">Active Sessions Only</option>
                    <option value="Success">Authenticated</option>
                    <option value="Logged Out">Logged Out</option>
                    <option value="Terminated by Admin">Terminated / Revoked</option>
                  </select>

                  {/* Date Filter */}
                  <select
                    className="c1-select"
                    style={{ minWidth: '130px', fontSize: '0.85rem' }}
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value as any)}
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today Only</option>
                    <option value="Past 7 Days">Past 7 Days</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Showing <strong>{filteredHistory.length}</strong> of {loginHistory.length} records
                  </span>
                  {loginHistory.length > 0 && (
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--color-error)' }}
                      onClick={() => setIsClearHistoryModalOpen(true)}
                      title="Clear session audit records"
                    >
                      <i className="fa-solid fa-trash-can" style={{ fontSize: '0.75rem' }}></i>
                      <span>Clear Logs</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Login History Table */}
            <div className="c1-card student-roster-card">
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">Live Student & Faculty Login Audit Ledger</h3>
                  <p className="c1-card-subtitle">Real-time authentication sessions, network origins, device telemetry, and security access logs</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="c1-badge c1-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                    Live Streaming
                  </span>
                </div>
              </div>

              <div className="student-roster-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>User Identity</th>
                      <th>Role</th>
                      <th>Login Timestamp</th>
                      <th>Network & IP</th>
                      <th>Device & Client</th>
                      <th>Location / Gateway</th>
                      <th>Session State</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="course-code-cell" style={{ fontSize: '0.75rem' }}>
                              {item.id}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                                {item.userName}
                              </strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                {item.userId} • {item.userEmail}
                              </span>
                            </div>
                          </td>
                          <td>{getRoleBadge(item.role)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                              <i className="fa-regular fa-clock" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}></i>
                              <span>{item.timestamp}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                              {item.ipAddress}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                              <i
                                className={
                                  item.deviceInfo.toLowerCase().includes('ios') ||
                                  item.deviceInfo.toLowerCase().includes('android') ||
                                  item.deviceInfo.toLowerCase().includes('mobile')
                                    ? 'fa-solid fa-mobile-screen-button'
                                    : 'fa-solid fa-laptop'
                                }
                                style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                              ></i>
                              <span>{item.deviceInfo}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                              <i className="fa-solid fa-location-dot" style={{ color: '#818cf8', fontSize: '0.75rem' }}></i>
                              <span>{item.loginLocation}</span>
                            </div>
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="c1-btn c1-btn-secondary"
                                style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                onClick={() => setSelectedLog(item)}
                                title="View complete security session details"
                              >
                                <i className="fa-solid fa-eye" style={{ fontSize: '0.75rem' }}></i>
                                <span>Inspect</span>
                              </button>

                              {item.status === 'Active Session' && (
                                <button
                                  type="button"
                                  className="c1-btn c1-btn-secondary"
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.75rem',
                                    color: 'var(--color-error)',
                                    borderColor: 'rgba(239, 68, 68, 0.3)'
                                  }}
                                  onClick={() => handleTerminateSession(item.id, item.userName)}
                                  title="Terminate active user session"
                                >
                                  <i className="fa-solid fa-ban" style={{ fontSize: '0.75rem' }}></i>
                                  <span>Revoke</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                          <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', opacity: 0.5 }}></i>
                          No student or faculty login records match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

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

        {/* ============================================================
            MODAL 3: SESSION INSPECTION & DETAILS MODAL
            ============================================================ */}
        {selectedLog && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedLog(null)}
            title="Session Authentication Inspector"
            maxWidth="md"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Session Reference ID
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {selectedLog.id}
                  </div>
                </div>
                {getStatusBadge(selectedLog.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    User Full Name
                  </span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{selectedLog.userName}</strong>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Roll / Employee ID
                  </span>
                  <strong style={{ color: '#818cf8', fontSize: '0.9rem', fontFamily: 'monospace' }}>{selectedLog.userId}</strong>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Institutional Email
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{selectedLog.userEmail}</span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Access Role Level
                  </span>
                  <div>{getRoleBadge(selectedLog.role)}</div>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Login Timestamp
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{selectedLog.timestamp}</span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Authentication Method
                  </span>
                  <span className="c1-badge c1-badge-purple" style={{ fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-key" style={{ marginRight: '4px' }}></i>
                    {selectedLog.authMethod}
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    IP Address & Network
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {selectedLog.ipAddress}
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Client Device & OS
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{selectedLog.deviceInfo}</span>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Physical Location / Gateway Point
                </span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-location-dot" style={{ color: '#818cf8', marginRight: '6px' }}></i>
                  {selectedLog.loginLocation}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                {selectedLog.status === 'Active Session' && (
                  <button
                    type="button"
                    className="c1-btn"
                    style={{ background: 'var(--color-error)', color: '#fff' }}
                    onClick={() => handleTerminateSession(selectedLog.id, selectedLog.userName)}
                  >
                    <i className="fa-solid fa-ban"></i>
                    <span>Terminate Session</span>
                  </button>
                )}
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedLog(null)}
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: CLEAR LOGIN HISTORY CONFIRMATION MODAL
            ============================================================ */}
        {isClearHistoryModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsClearHistoryModalOpen(false)}
            title="Clear Login Audit Trail"
            maxWidth="sm"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--color-warning)', fontSize: '1.3rem', marginTop: '2px' }}></i>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '4px' }}>
                    Reset Authentication Audit Logs?
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    Are you sure you want to clear all stored student and faculty login history logs? This action will reset historical session records.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsClearHistoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="c1-btn"
                  style={{ background: 'var(--color-warning)', color: '#000', fontWeight: 600 }}
                  onClick={handleClearHistory}
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Confirm Clear</span>
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
