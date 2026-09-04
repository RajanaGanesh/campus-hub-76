import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  status: 'Active' | 'Suspended';
  lastActive: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserAccountItem[]>([
    { id: 'USR-01', name: 'Aditya Sharma', email: 'aditya.sharma@campushub.edu', role: 'student', status: 'Active', lastActive: 'Just now' },
    { id: 'USR-02', name: 'Dr. Suresh Kumar', email: 'suresh.kumar@campushub.edu', role: 'faculty', status: 'Active', lastActive: '10 mins ago' },
    { id: 'USR-03', name: 'System Administrator', email: 'admin@campushub.edu', role: 'admin', status: 'Active', lastActive: 'Active now' },
    { id: 'USR-04', name: 'Sneha Patel', email: 'sneha.patel@campushub.edu', role: 'student', status: 'Active', lastActive: '2 hours ago' },
    { id: 'USR-05', name: 'Dr. Priya Menon', email: 'priya.menon@campushub.edu', role: 'faculty', status: 'Active', lastActive: '1 day ago' },
    { id: 'USR-06', name: 'Rahul Verma', email: 'rahul.verma@campushub.edu', role: 'student', status: 'Active', lastActive: '3 hours ago' }
  ]);

  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`User ${u.name} account ${nextStatus.toLowerCase()}!`, 'info');
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const getRoleBadge = (role: UserAccountItem['role']) => {
    switch (role) {
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
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,360</span>
              <span className="stat-label">Total Registered Accounts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,240</span>
              <span className="stat-label">Student Logins</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">84</span>
              <span className="stat-label">Faculty Accounts</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">12</span>
              <span className="stat-label">Admin Officers</span>
            </div>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
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
                    <td>
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: u.status === 'Active' ? 'var(--color-error)' : 'var(--color-success)' }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

export default AdminUsers;
