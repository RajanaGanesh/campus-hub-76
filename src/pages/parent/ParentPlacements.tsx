import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentPlacements: React.FC = () => {
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
              <span className="crumb-current">Placements & Career</span>
            </div>
            <h1 className="module-title">Placement Progress & Job Offers</h1>
            <p className="module-subtitle">
              Campus recruitment applications, interview statuses, and employment offer letters for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-place-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-place-student"
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

        {currentStudent.placementInfo?.eligible ? (
          <>
            {/* 4 Summary Stat Cards */}
            <div className="academic-stats-grid">
              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-file-signature"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{currentStudent.placementInfo.appliedCount}</span>
                  <span className="stat-label">Applications Submitted</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-building-circle-check"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{currentStudent.placementInfo.shortlistedCount}</span>
                  <span className="stat-label">Company Shortlists</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-comments"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{currentStudent.placementInfo.interviewsCount}</span>
                  <span className="stat-label">Interviews Conducted</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num" style={{ color: '#34d399' }}>{currentStudent.placementInfo.offersCount} Offer</span>
                  <span className="stat-label">Official Placement Offers</span>
                </div>
              </div>
            </div>

            {/* Latest Offer Card */}
            {currentStudent.placementInfo.latestOffer && (
              <div className="c1-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <span className="c1-badge c1-badge-success" style={{ marginBottom: '8px' }}>
                      <i className="fa-solid fa-award"></i> {currentStudent.placementInfo.latestOffer.status}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 800 }}>
                      {currentStudent.placementInfo.latestOffer.company}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Role: <strong>{currentStudent.placementInfo.latestOffer.role}</strong> • Annual CTC: <strong style={{ color: '#34d399' }}>{currentStudent.placementInfo.latestOffer.packageStr}</strong>
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                      {currentStudent.placementInfo.latestOffer.packageStr}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed Salary Package</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="c1-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
            <h3 style={{ color: '#ffffff' }}>Placement Drives Commencing in Final Year</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto' }}>
              {currentStudent.name} is currently enrolled in Year {currentStudent.year}. Campus placement drives and company recruitment registrations will begin during the 7th Semester.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ParentPlacements;
