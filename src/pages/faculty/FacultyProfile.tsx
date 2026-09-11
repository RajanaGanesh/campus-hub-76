import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { downloadFacultyIdCard } from '../../utils/fileDownloader';
import { notifyProfileUpdated, getEffectiveInitials } from '../../utils/userProfile';
import { getManagementData, getFacultyAssignedCourses, CourseRecord, FacultyRecord } from '../../data/managementData';

export interface FacultyProfileData {
  name: string;
  empId: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  department: string;
  designation: string;
  highestQualification: string;
  experience: string;
  specialization: string;
  cabinRoom: string;
  officeHours: string;
  doj: string;
  validUntil: string;
  address: string;
  emergencyContact: string;
  bio: string;
  publicationsCount: number;
  photoUrl?: string | null;
}

const STORAGE_KEY = 'campushub_faculty_profile_data';

export const FacultyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Match faculty record from management data
  const mgmtFaculty = useMemo(() => {
    const mgmt = getManagementData();
    const uId = (user?.id || '').toLowerCase().trim();
    const uEmail = (user?.email || '').toLowerCase().trim();
    const uName = (user?.name || '').toLowerCase().trim();

    return mgmt.faculty.find(
      (f: FacultyRecord) =>
        (uId && f.id.toLowerCase() === uId) ||
        (uEmail && f.email.toLowerCase() === uEmail) ||
        (uName && f.name.toLowerCase() === uName)
    ) || mgmt.faculty[0];
  }, [user]);

  // Load faculty assigned courses
  const [assignedCourses, setAssignedCourses] = useState<CourseRecord[]>(() => getFacultyAssignedCourses(user));

  useEffect(() => {
    const handleSync = () => setAssignedCourses(getFacultyAssignedCourses(user));
    window.addEventListener('storage', handleSync);
    window.addEventListener('campushub_management_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campushub_management_updated', handleSync);
    };
  }, [user]);

  // Derive initial faculty profile data
  const defaultProfile: FacultyProfileData = useMemo(() => {
    return {
      name: user?.name || mgmtFaculty?.name || 'Dr. Suresh Kumar',
      empId: user?.id || mgmtFaculty?.id || 'FAC-101',
      email: user?.email || mgmtFaculty?.email || 'faculty@campushub.com',
      phone: '+91 98765 43201',
      dob: '12 Aug 1982',
      gender: 'Male',
      bloodGroup: 'A+ve',
      department: user?.department || mgmtFaculty?.department || 'Computer Science & Engineering',
      designation: mgmtFaculty?.designation || 'Professor & Department Chair',
      highestQualification: 'Ph.D. in Computer Science (IIT Bombay)',
      experience: '14+ Years Academic & Industry',
      specialization: 'Distributed Systems, Advanced Algorithms & Cloud Architecture',
      cabinRoom: 'Cabin 302, Academic Block 2',
      officeHours: 'Mon, Wed, Fri (03:00 PM – 05:00 PM)',
      doj: '15 July 2016',
      validUntil: 'PERMANENT (TENURED)',
      address: 'Staff Quarters Villa Q-14, University Greens, Hyderabad, Telangana, India',
      emergencyContact: '+91 98765 00000',
      bio: 'Dr. Suresh Kumar is a senior professor specializing in distributed systems, high-performance database architectures, and algorithm design. He mentors graduate research candidates and leads institutional accreditation initiatives.',
      publicationsCount: 28,
      photoUrl: user?.avatar_url || null
    };
  }, [user, mgmtFaculty]);

  const userScopedKey = user?.id ? `${STORAGE_KEY}_${user.id}` : `${STORAGE_KEY}_default`;

  // State
  const [profile, setProfile] = useState<FacultyProfileData>(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (saved) {
          return { ...defaultProfile, ...JSON.parse(saved) };
        }
      }
    } catch {}
    return defaultProfile;
  });

  // Re-sync profile when active user changes
  useEffect(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (saved) {
          setProfile({ ...defaultProfile, ...JSON.parse(saved) });
          return;
        }
      }
    } catch {}
    setProfile(defaultProfile);
  }, [user?.id, defaultProfile]);

  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'documents'>('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<FacultyProfileData>(profile);

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
        localStorage.setItem(userScopedKey, JSON.stringify(updated));
        notifyProfileUpdated({
          name: updated.name,
          email: updated.email,
          role: 'faculty',
          photoUrl: result,
          initials: getEffectiveInitials(updated.name)
        });
      } catch {}
      showToast('Faculty ID photo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      showToast('Faculty name cannot be empty.', 'error');
      return;
    }

    setProfile(editFormData);
    try {
      localStorage.setItem(userScopedKey, JSON.stringify(editFormData));
      notifyProfileUpdated({
        name: editFormData.name,
        email: editFormData.email,
        role: 'faculty',
        photoUrl: editFormData.photoUrl || null,
        initials: getEffectiveInitials(editFormData.name)
      });
    } catch {}

    setIsEditModalOpen(false);
    showToast('Faculty Profile & Credentials updated successfully!', 'success');
  };

  const handleDownloadBadge = () => {
    downloadFacultyIdCard({
      facultyName: profile.name,
      empId: profile.empId,
      department: profile.department,
      designation: profile.designation,
      email: profile.email,
      phone: profile.phone,
      bloodGroup: profile.bloodGroup,
      validUntil: profile.validUntil,
      specialization: profile.specialization,
      cabinRoom: profile.cabinRoom,
      emergencyContact: profile.emergencyContact
    });
    showToast('Official Faculty ID Badge downloaded.', 'success');
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Hidden File Input for Avatar / ID Photo */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handlePhotoUpload}
        />

        {/* Top Breadcrumb & Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Faculty Portal</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Faculty Profile & Digital ID</span>
            </div>
            <h1 className="module-title">Faculty Profile & Digital ID</h1>
            <p className="module-subtitle">
              Institutional credentials, teaching portfolio, academic appointment records, and official staff identity badge.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleDownloadBadge}
            >
              <i className="fa-solid fa-download"></i>
              <span>Download ID Card</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={handleOpenEditModal}
            >
              <i className="fa-solid fa-user-pen"></i>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Hero Banner Card */}
        <div
          className="c1-card"
          style={{
            padding: '24px 28px',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(56, 189, 248, 0.05) 100%)',
            border: '1px solid var(--border-medium)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            {/* Left: Avatar + Core Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div
                style={{
                  position: 'relative',
                  width: '92px',
                  height: '92px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #6C4BFF, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '32px',
                  fontWeight: '800',
                  boxShadow: '0 8px 24px rgba(108, 75, 255, 0.35)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to update profile photo"
              >
                {profile.photoUrl ? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getEffectiveInitials(profile.name)
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    color: '#ffffff',
                    fontSize: '18px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                >
                  <i className="fa-solid fa-camera"></i>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {profile.name}
                  </h2>
                  <span className="c1-badge c1-badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Active Tenured Faculty</span>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span><i className="fa-solid fa-id-card-clip" style={{ color: 'var(--accent-primary)', marginRight: '6px' }}></i>Emp ID: <strong style={{ color: 'var(--text-primary)' }}>{profile.empId}</strong></span>
                  <span>•</span>
                  <span><i className="fa-solid fa-building-columns" style={{ color: 'var(--accent-cyan)', marginRight: '6px' }}></i>{profile.department}</span>
                  <span>•</span>
                  <span><i className="fa-solid fa-user-tie" style={{ color: '#fbbf24', marginRight: '6px' }}></i>{profile.designation}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ padding: '10px 16px', background: 'var(--bg-surface-2)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Assigned Courses</span>
                <strong style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>{assignedCourses.length}</strong>
              </div>
              <div style={{ padding: '10px 16px', background: 'var(--bg-surface-2)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Publications</span>
                <strong style={{ fontSize: '18px', color: '#10B981' }}>{profile.publicationsCount}</strong>
              </div>
              <div style={{ padding: '10px 16px', background: 'var(--bg-surface-2)', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Office / Cabin</span>
                <strong style={{ fontSize: '14px', color: '#38BDF8' }}>{profile.cabinRoom.split(',')[0]}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid: Left = Digital ID Card, Right = Multi-Tab Portfolio */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* ============================================================
              LEFT COLUMN: DIGITAL FACULTY ID CARD BADGE
              ============================================================ */}
          <div>
            <div className="c1-card" style={{ padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-id-badge" style={{ color: 'var(--accent-primary)' }}></i>
                  Digital Faculty Identity Badge
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
                background: 'linear-gradient(135deg, #181c2e 0%, #0d111d 100%)',
                color: '#ffffff',
                boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                {/* Holographic Accent Bar */}
                <div style={{
                  height: '8px',
                  background: 'linear-gradient(90deg, #6C4BFF, #38BDF8, #10B981, #F59E0B, #6C4BFF)',
                  backgroundSize: '300% 100%'
                }} />

                {idCardSide === 'front' ? (
                  /* FRONT OF FACULTY ID CARD */
                  <div style={{ padding: '22px 20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
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
                          <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px' }}>OFFICIAL FACULTY & STAFF BADGE</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        FACULTY
                      </span>
                    </div>

                    {/* Photo + Identity Details */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      {/* Photo Box with Upload Trigger */}
                      <div
                        style={{
                          width: '92px',
                          height: '110px',
                          borderRadius: '10px',
                          background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
                          border: '2px solid rgba(108, 75, 255, 0.6)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#a78bfa',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          flexShrink: 0,
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to upload/change photo"
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
                              {getEffectiveInitials(profile.name)}
                            </div>
                            <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>FACULTY</span>
                          </>
                        )}
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
                            fontSize: '11px',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <i className="fa-solid fa-camera"></i>
                          <span>Change</span>
                        </div>
                      </div>

                      {/* Main Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {profile.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#a78bfa', fontWeight: '700', marginBottom: '6px' }}>
                          {profile.designation}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#cbd5e1' }}>
                          <div><span style={{ color: '#94a3b8' }}>Emp ID:</span> <strong style={{ color: '#38bdf8' }}>{profile.empId}</strong></div>
                          <div><span style={{ color: '#94a3b8' }}>Dept:</span> {profile.department}</div>
                          <div><span style={{ color: '#94a3b8' }}>Cabin:</span> {profile.cabinRoom.split(',')[0]}</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata Chip Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      marginBottom: '14px',
                      fontSize: '11px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px', textTransform: 'uppercase' }}>Blood Group</span>
                        <strong style={{ color: '#f43f5e' }}>{profile.bloodGroup}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px', textTransform: 'uppercase' }}>Validity Status</span>
                        <strong style={{ color: '#34d399' }}>{profile.validUntil}</strong>
                      </div>
                    </div>

                    {/* Barcode & Security Strip */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                      <div style={{ letterSpacing: '3px', fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
                        ||| | |||| | ||||| ||| |||
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>
                        AUTONOMOUS FACULTY RFID
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BACK OF FACULTY ID CARD */
                  <div style={{ padding: '22px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.8px', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      Official Terms & Contact Registry
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#cbd5e1', marginBottom: '14px' }}>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px' }}>Institutional Email</span>
                        <strong style={{ color: '#ffffff' }}>{profile.email}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px' }}>Official Mobile / Extension</span>
                        <strong style={{ color: '#ffffff' }}>{profile.phone}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px' }}>Campus Cabin Location</span>
                        <span>{profile.cabinRoom}</span>
                      </div>
                      <div>
                        <span style={{ color: '#94a3b8', display: 'block', fontSize: '9.5px' }}>Emergency Contact Desk</span>
                        <strong style={{ color: '#fbbf24' }}>{profile.emergencyContact}</strong>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '9.5px',
                      color: '#94a3b8',
                      lineHeight: '1.4',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      marginBottom: '12px'
                    }}>
                      This credential certifies that the holder is a verified faculty staff of CampusHub University. Authorized for academic buildings, research laboratories, and university libraries 24/7.
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                      <div style={{ fontSize: '9px', color: '#64748b' }}>
                        Registrar & Senate Seal
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', fontStyle: 'italic' }}>
                        CampusHub Senate
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Card Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  style={{ flex: 1, fontSize: '12px', padding: '8px 0' }}
                  onClick={() => setIdCardSide((prev) => (prev === 'front' ? 'back' : 'front'))}
                >
                  <i className="fa-solid fa-arrows-rotate"></i>
                  <span>Flip Badge</span>
                </button>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  style={{ flex: 1, fontSize: '12px', padding: '8px 0' }}
                  onClick={handleDownloadBadge}
                >
                  <i className="fa-solid fa-file-arrow-down"></i>
                  <span>Download Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: DETAILED MULTI-TAB FACULTY DOSSIER
              ============================================================ */}
          <div>
            <div className="c1-card" style={{ padding: '24px' }}>
              {/* Tab Navigation */}
              <div className="c1-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '8px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`c1-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personal')}
                >
                  <i className="fa-solid fa-user-circle"></i>
                  <span>Personal Particulars</span>
                </button>
                <button
                  type="button"
                  className={`c1-tab-btn ${activeTab === 'academic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('academic')}
                >
                  <i className="fa-solid fa-chalkboard-user"></i>
                  <span>Teaching & Portfolio</span>
                </button>
                <button
                  type="button"
                  className={`c1-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setActiveTab('documents')}
                >
                  <i className="fa-solid fa-folder-open"></i>
                  <span>Institutional Credentials</span>
                </button>
              </div>

              {/* TAB 1: PERSONAL PARTICULARS */}
              {activeTab === 'personal' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Full Name</span>
                      <strong className="profile-detail-value">{profile.name}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Employee ID</span>
                      <strong className="profile-detail-value" style={{ color: 'var(--accent-primary)' }}>{profile.empId}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Institutional Email</span>
                      <strong className="profile-detail-value">{profile.email}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Primary Mobile Phone</span>
                      <strong className="profile-detail-value">{profile.phone}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Date of Birth</span>
                      <strong className="profile-detail-value">{profile.dob}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Gender</span>
                      <strong className="profile-detail-value">{profile.gender}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Blood Group</span>
                      <strong className="profile-detail-value" style={{ color: '#f43f5e' }}>{profile.bloodGroup}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Date of Joining</span>
                      <strong className="profile-detail-value">{profile.doj}</strong>
                    </div>
                  </div>

                  <div className="profile-detail-box">
                    <span className="profile-detail-label">Campus Residential / Official Address</span>
                    <strong className="profile-detail-value">{profile.address}</strong>
                  </div>

                  <div className="profile-detail-box">
                    <span className="profile-detail-label">Professional Biography & Summary</span>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                      {profile.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: TEACHING & PORTFOLIO */}
              {activeTab === 'academic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Department</span>
                      <strong className="profile-detail-value">{profile.department}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Designation / Rank</span>
                      <strong className="profile-detail-value" style={{ color: 'var(--accent-primary)' }}>{profile.designation}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Highest Qualification</span>
                      <strong className="profile-detail-value">{profile.highestQualification}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Experience</span>
                      <strong className="profile-detail-value">{profile.experience}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Cabin Location</span>
                      <strong className="profile-detail-value">{profile.cabinRoom}</strong>
                    </div>
                    <div className="profile-detail-box">
                      <span className="profile-detail-label">Office Consultation Hours</span>
                      <strong className="profile-detail-value" style={{ color: '#10B981' }}>{profile.officeHours}</strong>
                    </div>
                  </div>

                  <div className="profile-detail-box">
                    <span className="profile-detail-label">Core Research & Teaching Specialization</span>
                    <strong className="profile-detail-value">{profile.specialization}</strong>
                  </div>

                  {/* Assigned Courses Cards */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
                      Active Semester Assigned Courses ({assignedCourses.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                      {assignedCourses.map((c) => (
                        <div
                          key={c.code}
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            background: 'var(--bg-surface-2)',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="course-code-tag">{c.code}</span>
                            <span className="c1-badge c1-badge-success">{c.status}</span>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-users" style={{ marginRight: '5px' }}></i>
                            {c.studentsCount} Students Enrolled • {c.semester}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ flex: 1, fontSize: '11px', padding: '5px 0' }}
                              onClick={() => navigate('/faculty/attendance')}
                            >
                              Attendance
                            </button>
                            <button
                              type="button"
                              className="c1-btn c1-btn-secondary"
                              style={{ flex: 1, fontSize: '11px', padding: '5px 0' }}
                              onClick={() => navigate('/faculty/assignments')}
                            >
                              Assignments
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INSTITUTIONAL CREDENTIALS & DOCUMENTS */}
              {activeTab === 'documents' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    {
                      name: 'Official Faculty Appointment & Tenure Order',
                      code: 'APPT-DOC-2016-FAC101',
                      date: '15 Jul 2016',
                      type: 'Verified PDF',
                      icon: 'fa-file-signature'
                    },
                    {
                      name: 'Ph.D. Doctoral Degree & Senate Authentication',
                      code: 'DEG-VERIF-IITB-2015',
                      date: '20 Aug 2015',
                      type: 'Verified PDF',
                      icon: 'fa-graduation-cap'
                    },
                    {
                      name: 'Institutional Research Grant Allocation Document',
                      code: 'GRANT-UGC-2025-08',
                      date: '10 Jan 2025',
                      type: 'Active Grant',
                      icon: 'fa-award'
                    },
                    {
                      name: 'Autonomous RFID & Bio-Metric Smart Keycard Clearance',
                      code: 'RFID-SECURITY-TIER4',
                      date: '01 Jun 2026',
                      type: 'Clearance Token',
                      icon: 'fa-id-card'
                    }
                  ].map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}
                        >
                          <i className={`fa-solid ${doc.icon}`}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Ref: {doc.code} • Issued: {doc.date}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="c1-badge c1-badge-cyan" style={{ fontSize: '11px' }}>
                          <i className="fa-solid fa-circle-check"></i> {doc.type}
                        </span>
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                          onClick={() => showToast(`Document "${doc.name}" verified from registrar records.`, 'info')}
                        >
                          <i className="fa-solid fa-eye"></i>
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            MODAL: EDIT FACULTY PROFILE DETAILS
            ============================================================ */}
        {isEditModalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Faculty Profile & Office Details"
            maxWidth="md"
          >
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="c1-input"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    disabled
                    className="c1-input"
                    value={editFormData.empId}
                    style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="c1-input"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Designation / Rank
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.designation}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Cabin Location
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.cabinRoom}
                    onChange={(e) => setEditFormData({ ...editFormData, cabinRoom: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Office Consultation Hours
                  </label>
                  <input
                    type="text"
                    className="c1-input"
                    value={editFormData.officeHours}
                    onChange={(e) => setEditFormData({ ...editFormData, officeHours: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Areas of Research & Specialization
                </label>
                <input
                  type="text"
                  className="c1-input"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Residential Address
                </label>
                <input
                  type="text"
                  className="c1-input"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Professional Biography
                </label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
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
                  <i className="fa-solid fa-check"></i>
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Toast Container */}
        {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
      </div>
    </AppLayout>
  );
};

export default FacultyProfile;
