import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentLibrary: React.FC = () => {
  const linkedStudents = getParentLinkedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(linkedStudents[0]?.id || '');

  const currentStudent: ParentLinkedStudent =
    linkedStudents.find((s) => s.id === selectedStudentId) || linkedStudents[0];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Parent Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Library Status</span>
            </div>
            <h1 className="module-title">Central Library Book Loans</h1>
            <p className="module-subtitle">
              Monitor active library borrowings, return deadlines, and circulation records for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-lib-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-lib-student"
                  className="c1-select"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'var(--accent-primary)', fontWeight: 700, color: '#ffffff' }}
                >
                  {linkedStudents.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="academic-stats-grid">
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-book-bookmark"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{currentStudent.libraryInfo.booksBorrowed} Volumes</span>
              <span className="stat-label">Active Book Loans</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-clock-rotate-left"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: currentStudent.libraryInfo.booksDueSoon > 0 ? '#fbbf24' : '#34d399' }}>
                {currentStudent.libraryInfo.booksDueSoon} Books
              </span>
              <span className="stat-label">Due for Return Soon</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{currentStudent.libraryInfo.overdueBooks} Books</span>
              <span className="stat-label">Overdue Returns</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-shield-check"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>₹0</span>
              <span className="stat-label">Outstanding Fine Balance</span>
            </div>
          </div>
        </div>

        {/* Borrowed Books Table */}
        <div className="c1-card student-roster-card">
          <div className="c1-card-header">
            <div>
              <h3 className="c1-card-title">Active Borrowing Ledger</h3>
              <p className="c1-card-subtitle">Books checked out on student RFID card</p>
            </div>
            <span className="c1-badge c1-badge-cyan">RFID Authenticated</span>
          </div>

          <div className="student-roster-table-wrap">
            <table className="c1-table">
              <thead>
                <tr>
                  <th>ISBN Reference</th>
                  <th>Book Title</th>
                  <th>Issued Date</th>
                  <th>Return Deadline</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentStudent.libraryInfo.borrowedList.map((b) => (
                  <tr key={b.isbn}>
                    <td><span className="course-code-cell">{b.isbn}</span></td>
                    <td><strong style={{ color: '#ffffff' }}>{b.title}</strong></td>
                    <td>{b.borrowDate}</td>
                    <td><strong>{b.dueDate}</strong></td>
                    <td>
                      {b.status === 'Due Soon' ? (
                        <span className="c1-badge c1-badge-warning">
                          <i className="fa-solid fa-clock"></i> Due Soon
                        </span>
                      ) : (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-book-open"></i> On Loan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentLibrary;
