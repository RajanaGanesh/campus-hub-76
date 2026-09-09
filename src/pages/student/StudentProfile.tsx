import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { downloadStudentIdCard } from '../../utils/fileDownloader';
import { notifyProfileUpdated } from '../../utils/userProfile';

export interface StudentProfileData {
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  department: string;
  degree: string;
  semester: string;
  section: string;
  admissionYear: string;
  validUntil: string;
  advisor: string;
  cgpa: string;
  attendance: string;
  hostelRoom: string;
  busRoute: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  photoUrl?: string | null;
}

const STORAGE_KEY = 'campushub_student_profile_data';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive initial student profile data
  const defaultProfile: StudentProfileData = {
    name: user?.name && user.name !== 'New User' && user.name !== 'Campus User' 
      ? user.name 
      : (user?.email?.includes('rajanaganesh') ? 'Rajana Ganesh' : (user?.name || 'Rajana Ganesh')),
    rollNumber: '236F1A0551',
    email: user?.email || 'rajanaganesh143143@gmail.com',
    phone: '+91 98765 43210',
    dob: '14 May 2004',
    gender: 'Male',
    bloodGroup: 'O+ve',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech in Computer Science',
    semester: 'Semester 8 (Final Year)',
    section: 'CSE-A',
    admissionYear: '2023',
    validUntil: 'JULY 2027',
    advisor: 'Dr. Suresh Kumar (Professor & HOD)',
    cgpa: '9.24',
    attendance: '92.4%',
    hostelRoom: 'Block B - Room 304',
    busRoute: 'Route 4 - North Campus Express',
    address: 'Plot 42, Tech Park Enclave, University Boulevard, Hyderabad, India',
    guardianName: 'R. Srinivasa Rao',
    guardianPhone: '+91 98480 12345',
    guardianRelation: 'Father',
    photoUrl: null
  };

  // State
  const [profile, setProfile] = useState<StudentProfileData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultProfile;
  });

  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'documents'>('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<StudentProfileData>(profile);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync edit form data when opening modal
  const handleOpenEditModal = () => {
    setEditFormData(profile);
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5 MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...profile, photoUrl: result };
      setProfile(updated);
      setEditFormData((prev) => ({ ...prev, photoUrl: result }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        notifyProfileUpdated();
      } catch {}
      showToast('Profile photo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const updated = { ...profile, photoUrl: null };
    setProfile(updated);
    setEditFormData((prev) => ({ ...prev, photoUrl: null }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      notifyProfileUpdated();
    } catch {}
    showToast('Profile photo removed.', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      showToast('Student full name cannot be blank.', 'error');
      return;
    }
    setProfile(editFormData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editFormData));
      notifyProfileUpdated();
    } catch {}
    setIsEditModalOpen(false);
    showToast('Student profile details updated successfully!', 'success');
  };

  const handleDownloadId = () => {
    downloadStudentIdCard({
      studentName: profile.name,
      rollNumber: profile.rollNumber,
      department: profile.department,
      section: profile.section,
      year: profile.semester,
      bloodGroup: profile.bloodGroup,
      validUntil: profile.validUntil,
      email: profile.email,
      emergencyContact: profile.guardianPhone
    });
    showToast(`Digital ID Card for "${profile.name}" downloaded!`, 'success');
  };

  const handlePrintId = () => {
    window.print();
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header Row */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Account</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Student Profile & ID Card</span>
            </div>
            <h1 className="module-title">Student Profile & Digital ID</h1>
            <p className="module-subtitle">
              Verified institutional identity credential, academic enrollment records, emergency contacts, and downloadable documents.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleOpenEditModal}
            >
              <i className="fa-solid fa-pen-to-square"></i>
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleDownloadId}
            >
              <i className="fa-solid fa-id-card"></i>
              <span>Download ID Card</span>
            </button>
          </div>
        </div>

        {/* Top Student Banner Card */}
        <div className="c1-card" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'var(--gradient-primary)'
          }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Avatar with Verified Ring & Upload Trigger */}
              <div
                style={{
                  position: 'relative',
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: '700',
                  boxShadow: '0 8px 20px rgba(108, 75, 255, 0.25)',
                  flexShrink: 0,
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload profile photo"
              >
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(profile.name)
                )}

                {/* Camera Overlay on Hover */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.45)',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <i className="fa-solid fa-camera" style={{ fontSize: '16px', marginBottom: '2px' }}></i>
                  <span>Upload</span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  border: '2px solid var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  zIndex: 2
                }} title="Verified Student">
                  <i className="fa-solid fa-check"></i>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                    {profile.name}
                  </h2>
                  <span className="c1-badge c1-badge-primary">
                    <i className="fa-solid fa-graduation-cap"></i> ENROLLED SCHOLAR
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span><strong style={{ color: 'var(--text-primary)' }}>ID:</strong> {profile.rollNumber}</span>
                  <span>•</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Dept:</strong> {profile.department}</span>
                  <span>•</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>Class:</strong> {profile.section}</span>
                </div>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(108, 75, 255, 0.08)',
                border: '1px solid rgba(108, 75, 255, 0.2)',
                textAlign: 'center'
              }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-primary)', fontWeight: '600' }}>Cumulative CGPA</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>{profile.cgpa} <span style={{ fontSize: '12px', opacity: 0.8 }}>/ 10</span></strong>
              </div>

              <div style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center'
              }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: '600' }}>Overall Attendance</span>
                <strong style={{ fontSize: '18px', color: '#10b981' }}>{profile.attendance}</strong>
              </div>

              <div style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                textAlign: 'center'
              }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: '#0284c7', fontWeight: '600' }}>Academic Validity</span>
                <strong style={{ fontSize: '16px', color: '#0284c7' }}>{profile.validUntil}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout: Left = Digital ID Card, Right = Detailed Info Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* ============================================================
              LEFT COLUMN: DIGITAL STUDENT ID CARD BADGE
              ============================================================ */}
          <div>
            <div className="c1-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-id-badge" style={{ color: 'var(--accent-primary)' }}></i>
                  Digital Identity Badge
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`c1-btn ${idCardSide === 'front' ? 'c1-btn-gradient' : 'c1-btn-secondary'}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    onClick={() => setIdCardSide('front')}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    className={`c1-btn ${idCardSide === 'back' ? 'c1-btn-gradient' : 'c1-btn-secondary'}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    onClick={() => setIdCardSide('back')}
                  >
                    Back View
                  </button>
                </div>
              </div>

              {/* Physical Card Container with Cardboard / Glassmorphism Aesthetic */}
              <div style={{
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1e1e38 0%, #0f172a 100%)',
                color: '#ffffff',
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {/* Hologram Accent Bar */}
                <div style={{
                  height: '8px',
                  background: 'linear-gradient(90deg, #6C4BFF, #38BDF8, #34D399, #F59E0B, #6C4BFF)',
                  backgroundSize: '300% 100%'
                }} />

                {idCardSide === 'front' ? (
                  /* FRONT OF ID CARD */
                  <div style={{ padding: '22px 20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #6C4BFF, #06B6D4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          color: '#ffffff'
                        }}>
                          <i className="fa-solid fa-building-columns"></i>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>CAMPUSHUB UNIVERSITY</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px' }}>OFFICIAL STUDENT IDENTITY BADGE</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        ACTIVE
                      </span>
                    </div>

                    {/* Photo + Identity Details */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      {/* Photo Box with Upload Trigger */}
                      <div
                        style={{
                          width: '88px',
                          height: '104px',
                          borderRadius: '10px',
                          background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
                          border: '2px solid rgba(108, 75, 255, 0.6)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#a78bfa',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                          flexShrink: 0,
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to upload/change ID photo"
                      >
                        {profile.photoUrl ? (
                          <img
                            src={profile.photoUrl}
                            alt={profile.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <>
                            <div style={{ fontSize: '28px', fontWeight: '800' }}>
                              {getInitials(profile.name)}
                            </div>
                            <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>SCHOLAR</span>
                          </>
                        )}

                        {/* Hover Overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.55)',
                            color: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            fontSize: '10.5px',
                            fontWeight: '600'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <i className="fa-solid fa-camera" style={{ fontSize: '15px', marginBottom: '2px' }}></i>
                          <span>Change</span>
                        </div>
                      </div>

                      {/* Info lines */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {profile.name}
                        </h4>
                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '8px' }}>
                          ROLL NO: {profile.rollNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          <div><strong>Dept:</strong> {profile.department}</div>
                          <div><strong>Course:</strong> B.Tech ({profile.section})</div>
                          <div><strong>Blood:</strong> <span style={{ color: '#f87171', fontWeight: '700' }}>{profile.bloodGroup}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code + Validity Row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div>
                        <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VALID THROUGH</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24' }}>{profile.validUntil}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>SCAN TO VERIFY</div>
                          <div style={{ fontSize: '10px', color: '#34d399', fontWeight: '600' }}>RFID ENABLED</div>
                        </div>
                        {/* SVG QR Code */}
                        <div style={{ width: '40px', height: '40px', background: '#ffffff', padding: '3px', borderRadius: '4px' }}>
                          <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%' }} fill="none" stroke="black" strokeWidth="0.8">
                            <path d="M1 1h6v6H1V1zm16 0h6v6h-6V1zM1 17h6v6H1v-6zm3-12h1v1H4V5zm16 0h1v1h-1V5zm-16 16h1v1H4v-1zm14-14h1v1h-1V7zm1-5h1v1h-1V2zm-3 2h1v1h-1V4zm1 5h1v1h-1V9zm-5-3h1v1h-1V6zm0 4h1v1h-1v-1zm2 1h1v1h-1v-1zm-4 4h1v1h-1v-1zm5 1h1v1h-1v-1zm-1 3h1v1h-1v-1zm3 2h1v1h-1v-1zm-6-2h1v1h-1v-1z" fill="black" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF ID CARD */
                  <div style={{ padding: '22px 20px' }}>
                    <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '10px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>TERMS & EMERGENCY INFORMATION</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>CampusHub Central University Governance</div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px' }}>
                      <div style={{ marginBottom: '6px' }}><strong>Emergency Phone:</strong> {profile.guardianPhone}</div>
                      <div style={{ marginBottom: '6px' }}><strong>Guardian Name:</strong> {profile.guardianName} ({profile.guardianRelation})</div>
                      <div style={{ marginBottom: '6px' }}><strong>Hostel Residence:</strong> {profile.hostelRoom}</div>
                      <div style={{ marginBottom: '6px' }}><strong>Transit Route:</strong> {profile.busRoute}</div>
                    </div>

                    {/* Barcode representation */}
                    <div style={{
                      background: '#ffffff',
                      color: '#000000',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      marginBottom: '14px'
                    }}>
                      <div style={{ fontSize: '16px', letterSpacing: '4px', fontFamily: 'monospace', fontWeight: '900' }}>
                        ||| | |||| | |||||| || ||| |
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1px' }}>
                        LIB-RFID: {profile.rollNumber}-2027
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '10px', color: '#94a3b8' }}>
                      <div>
                        <div>If found, please return to:</div>
                        <div>Security Control Room, Block-A</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontStyle: 'italic', color: '#38bdf8', fontWeight: '700' }}>Dean, Student Affairs</div>
                        <div>Authorized Signature</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Card Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ flex: 1 }}
                  onClick={handleDownloadId}
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Download ID</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handlePrintId}
                >
                  <i className="fa-solid fa-print"></i>
                  <span>Print ID</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: DETAILED PROFILE INFORMATION TABS
              ============================================================ */}
          <div>
            {/* Tab Navigation */}
            <div className="exam-section-tabs" style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <i className="fa-solid fa-user"></i>
                <span>Personal & Contact</span>
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
                onClick={() => setActiveTab('academic')}
              >
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Academic Details</span>
              </button>
              <button
                type="button"
                className={`section-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveTab('documents')}
              >
                <i className="fa-solid fa-folder-closed"></i>
                <span>Official Documents</span>
              </button>
            </div>

            {/* TAB 1: PERSONAL & CONTACT */}
            {activeTab === 'personal' && (
              <div className="c1-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
                    Personal Particulars
                  </h3>
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '12px' }}
                    onClick={handleOpenEditModal}
                  >
                    <i className="fa-solid fa-pen"></i> Edit Profile
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 20px', fontSize: '13.5px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Full Legal Name</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.name}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Roll / Enrollment No</label>
                    <div style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{profile.rollNumber}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Institutional Email</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.email}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Student Mobile No</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.phone}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Date of Birth</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.dob}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Blood Group</label>
                    <div style={{ fontWeight: '600', color: '#ef4444' }}>{profile.bloodGroup}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Father / Guardian Name</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.guardianName} ({profile.guardianRelation})</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Guardian Emergency Contact</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.guardianPhone}</div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Permanent Residential Address</label>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4' }}>{profile.address}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC DETAILS */}
            {activeTab === 'academic' && (
              <div className="c1-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>
                  Institutional Academic Enrollment
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px 20px', fontSize: '13.5px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Degree & Major</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.degree}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Department</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.department}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Semester & Section</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.semester} • {profile.section}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Admission Batch Year</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Batch {profile.admissionYear} – 2027</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Academic Mentor / Advisor</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.advisor}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Hostel Allocation</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.hostelRoom}</div>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Transit Route & Boarding</label>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{profile.busRoute}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: OFFICIAL DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="c1-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>
                  Student Credentials & Verification Documents
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Item 1: Digital ID Card */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(108, 75, 255, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        <i className="fa-solid fa-id-card"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Digital Student ID Card (Badge Record)</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Official University Identity Certificate</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="c1-btn c1-btn-gradient"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={handleDownloadId}
                    >
                      <i className="fa-solid fa-download"></i> Download
                    </button>
                  </div>

                  {/* Item 2: Examination Hall Ticket */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        <i className="fa-solid fa-receipt"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Semester Examination Hall Ticket</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mid-Term & End-Semester Admit Card</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => navigate('/student/exams')}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Exams
                    </button>
                  </div>

                  {/* Item 3: Fee Receipts */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-hover)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        <i className="fa-solid fa-file-invoice-dollar"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Tuition & Campus Fee Receipts</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Official payment receipts and ledger</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => navigate('/student/fees')}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> View Fees
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input for Student Photo Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Student Profile Details"
            maxWidth="md"
          >
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Photo Management Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(108, 75, 255, 0.2)'
                }}>
                  {editFormData.photoUrl ? (
                    <img
                      src={editFormData.photoUrl}
                      alt="Student Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    getInitials(editFormData.name)
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    Student Identity Photo
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Upload a clear headshot photo for your Student Profile & Digital ID Badge.
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="c1-btn c1-btn-gradient"
                      style={{ padding: '5px 12px', fontSize: '11.5px' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      <span>Upload from Device</span>
                    </button>
                    {editFormData.photoUrl && (
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '11.5px', color: '#ef4444' }}
                        onClick={handleRemovePhoto}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="c1-form-label">Full Student Name *</label>
                <input
                  type="text"
                  className="c1-input"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Rajana Ganesh"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Student Phone Number</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="c1-form-label">Blood Group</label>
                  <select
                    className="c1-select"
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                  >
                    <option value="A+ve">A+ve</option>
                    <option value="A-ve">A-ve</option>
                    <option value="B+ve">B+ve</option>
                    <option value="B-ve">B-ve</option>
                    <option value="O+ve">O+ve</option>
                    <option value="O-ve">O-ve</option>
                    <option value="AB+ve">AB+ve</option>
                    <option value="AB-ve">AB-ve</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="c1-form-label">Father / Guardian Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.guardianName}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="c1-form-label">Guardian Contact Number</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.guardianPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="c1-form-label">Residential Address</label>
                <textarea
                  className="c1-input"
                  rows={3}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                >
                  <i className="fa-solid fa-floppy-disk"></i> Save Profile
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Toast Feedback */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card" style={{ marginTop: '24px' }}>
          <div className="bridge-text">
            <h4>Campus Navigation</h4>
            <p>Jump directly to your weekly timetable, exam schedules, or learning materials.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/timetable')}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>Class Timetable</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/lms')}
            >
              <i className="fa-solid fa-book-open-reader"></i>
              <span>LMS Center</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Dashboard Home</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentProfile;
