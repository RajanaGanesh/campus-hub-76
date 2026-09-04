import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { Toast } from '../../components/Toast';

export interface LibraryBookItem {
  isbn: string;
  title: string;
  author: string;
  department: string;
  copiesTotal: number;
  copiesAvailable: number;
  shelf: string;
}

export const AdminLibrary: React.FC = () => {
  const [books] = useState<LibraryBookItem[]>([
    { isbn: '978-0131103627', title: 'The C Programming Language (2nd Edition)', author: 'Brian Kernighan & Dennis Ritchie', department: 'Computer Science', copiesTotal: 30, copiesAvailable: 12, shelf: 'A-102' },
    { isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen', department: 'Computer Science', copiesTotal: 45, copiesAvailable: 18, shelf: 'A-104' },
    { isbn: '978-0078022159', title: 'Database System Concepts (7th Edition)', author: 'Silberschatz, Korth & Sudarshan', department: 'Computer Science', copiesTotal: 35, copiesAvailable: 14, shelf: 'B-201' },
    { isbn: '978-0132126953', title: 'Computer Networks (5th Edition)', author: 'Andrew S. Tanenbaum', department: 'Computer Science', copiesTotal: 40, copiesAvailable: 22, shelf: 'B-205' },
    { isbn: '978-0134685991', title: 'Effective Java (3rd Edition)', author: 'Joshua Bloch', department: 'Computer Science', copiesTotal: 25, copiesAvailable: 10, shelf: 'A-110' }
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
              <span className="crumb-current">Library Management</span>
            </div>
            <h1 className="module-title">Central Library Inventory & Circulation</h1>
            <p className="module-subtitle">
              Manage library catalogue titles, track physical book circulation loans, and monitor overdue returns.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => showToast('Overdue book return reminders sent to 84 students.', 'info')}
            >
              <i className="fa-solid fa-bell"></i>
              <span>Send Overdue Reminders</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">14,200</span>
              <span className="stat-label">Total Library Volumes</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-book-open"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">1,240</span>
              <span className="stat-label">Active Book Loans</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>12,960</span>
              <span className="stat-label">Available on Shelves</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fb7185' }}>84 Books</span>
              <span className="stat-label">Overdue Returns</span>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Catalogue Book Master List</h3>
              <p className="c1-card-subtitle">Verified reference textbooks and monographs</p>
            </div>
            <span className="c1-badge c1-badge-cyan">DDC Classified</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>ISBN / Reference</th>
                  <th>Book Title</th>
                  <th>Author(s)</th>
                  <th>Department</th>
                  <th>Shelf Location</th>
                  <th>Stock Available</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.isbn}>
                    <td><span className="course-code-cell">{b.isbn}</span></td>
                    <td><strong style={{ color: 'var(--text-primary)' }}>{b.title}</strong></td>
                    <td>{b.author}</td>
                    <td>{b.department}</td>
                    <td><strong style={{ color: '#38bdf8' }}>Shelf {b.shelf}</strong></td>
                    <td>
                      <span className="c1-badge c1-badge-success">
                        {b.copiesAvailable} / {b.copiesTotal} Available
                      </span>
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

export default AdminLibrary;
