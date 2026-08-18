import React, { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { getParentLinkedStudents, ParentLinkedStudent } from '../../data/parentData';

export const ParentHostel: React.FC = () => {
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
              <span className="crumb-current">Hostel Residency</span>
            </div>
            <h1 className="module-title">Student Hostel & Campus Residency</h1>
            <p className="module-subtitle">
              Residential block details, room allotment, warden contact, and mess plan for {currentStudent.name}.
            </p>
          </div>

          {/* Student Switcher */}
          {linkedStudents.length > 1 && (
            <div className="module-header-meta">
              <div className="filter-select-item" style={{ minWidth: '220px' }}>
                <label htmlFor="select-hostel-student" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <i className="fa-solid fa-users" style={{ marginRight: '4px', color: 'var(--accent-blue)' }}></i> Selected Student
                </label>
                <select
                  id="select-hostel-student"
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

        {currentStudent.hostelInfo ? (
          <>
            {/* 4 Summary Stat Cards */}
            <div className="academic-stats-grid">
              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <i className="fa-solid fa-hotel"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{currentStudent.hostelInfo.block.split(' ')[0]} {currentStudent.hostelInfo.block.split(' ')[1]}</span>
                  <span className="stat-label">Residential Block</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fa-solid fa-door-open"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">{currentStudent.hostelInfo.room.split(' ')[1]}</span>
                  <span className="stat-label">Allotted Room</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <i className="fa-solid fa-bed"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num" style={{ color: '#34d399' }}>{currentStudent.hostelInfo.bed}</span>
                  <span className="stat-label">Allocated Bed Slot</span>
                </div>
              </div>

              <div className="c1-card academic-stat-card">
                <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <div className="stat-card-data">
                  <span className="stat-num">Active Plan</span>
                  <span className="stat-label">Mess Catering Plan</span>
                </div>
              </div>
            </div>

            {/* Hostel Residency Card */}
            <div className="c1-card" style={{ padding: '24px' }}>
              <div className="c1-card-header">
                <div>
                  <h3 className="c1-card-title">Residential Profile & Emergency Contacts</h3>
                  <p className="c1-card-subtitle">Official hostel authority contact and facility records</p>
                </div>
                <span className="c1-badge c1-badge-success">Verified Resident</span>
              </div>

              <div className="course-info-grid-compact" style={{ marginTop: '16px' }}>
                <div className="c-info-cell">
                  <i className="fa-solid fa-building"></i>
                  <span>Hostel Block: <strong>{currentStudent.hostelInfo.block}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-door-closed"></i>
                  <span>Room: <strong>{currentStudent.hostelInfo.room}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-user-tie"></i>
                  <span>Hostel Warden: <strong>{currentStudent.hostelInfo.warden}</strong></span>
                </div>
                <div className="c-info-cell">
                  <i className="fa-solid fa-phone"></i>
                  <span>Warden Phone: <strong>{currentStudent.hostelInfo.wardenPhone}</strong></span>
                </div>
                <div className="c-info-cell" style={{ gridColumn: 'span 2' }}>
                  <i className="fa-solid fa-utensils"></i>
                  <span>Mess Plan: <strong>{currentStudent.hostelInfo.messPlan}</strong></span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="c1-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <i className="fa-solid fa-hotel"></i>
            </div>
            <h3 style={{ color: '#ffffff' }}>No Hostel Residency Record</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              {currentStudent.name} is currently registered as a Day Scholar student.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ParentHostel;
