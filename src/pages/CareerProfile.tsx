import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementsData, CareerCertification, CareerProject } from '../data/placementsData';

export const CareerProfile: React.FC = () => {
  const navigate = useNavigate();

  // Load skills list state
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_skills');
      return stored ? JSON.parse(stored) : placementsData.skills;
    } catch {
      return placementsData.skills;
    }
  });

  // Load certifications list state
  const [certs, setCerts] = useState<CareerCertification[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_certs');
      return stored ? JSON.parse(stored) : placementsData.certifications;
    } catch {
      return placementsData.certifications;
    }
  });

  // Load projects state
  const [projs, setProjs] = useState<CareerProject[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_projects');
      return stored ? JSON.parse(stored) : placementsData.projects;
    } catch {
      return placementsData.projects;
    }
  });

  // Load LinkedIn state
  const [linkedinUrl, setLinkedinUrl] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_linkedin');
      return stored || '';
    } catch {
      return '';
    }
  });

  // Modals / Input states
  const [showCertModal, setShowCertModal] = useState(false);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certIdNum, setCertIdNum] = useState('');

  const [showProjModal, setShowProjModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projLink, setProjLink] = useState('');

  const [newSkillInput, setNewSkillInput] = useState('');
  const [editLinkedin, setEditLinkedin] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState(linkedinUrl);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dynamic score calculator
  const hasBasicInfo = true; // Complete
  const hasEducation = true; // Complete
  const hasResume = true; // Complete
  const hasSkills = skills.length > 0;
  const hasProjects = projs.length > 0;
  const hasCertifications = certs.length > 0;
  const hasLinkedin = linkedinUrl.trim().length > 0;

  let calculatedScore = 0;
  if (hasBasicInfo) calculatedScore += 15;
  if (hasEducation) calculatedScore += 15;
  if (hasSkills) calculatedScore += 15;
  if (hasProjects) calculatedScore += 15;
  if (hasResume) calculatedScore += 20;
  if (hasCertifications) calculatedScore += 10;
  if (hasLinkedin) calculatedScore += 10;

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;

    if (skills.includes(newSkillInput.trim())) {
      setNewSkillInput('');
      return;
    }

    const nextSkills = [...skills, newSkillInput.trim()];
    setSkills(nextSkills);
    localStorage.setItem('campushub_career_skills', JSON.stringify(nextSkills));
    setNewSkillInput('');
    setToastMsg(`Skill "${newSkillInput.trim()}" added successfully.`);
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Remove Skill
  const handleRemoveSkill = (skillName: string) => {
    const nextSkills = skills.filter((s) => s !== skillName);
    setSkills(nextSkills);
    localStorage.setItem('campushub_career_skills', JSON.stringify(nextSkills));
  };

  // Add Certification Submit
  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certOrg.trim() || !certDate.trim() || !certIdNum.trim()) {
      setToastMsg('Please fill in all fields.');
      setTimeout(() => setToastMsg(null), 2000);
      return;
    }

    const newCert: CareerCertification = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      organization: certOrg.trim(),
      issueDate: certDate.trim(),
      credentialId: certIdNum.trim()
    };

    const nextCerts = [...certs, newCert];
    setCerts(nextCerts);
    localStorage.setItem('campushub_career_certs', JSON.stringify(nextCerts));

    setCertName('');
    setCertOrg('');
    setCertDate('');
    setCertIdNum('');
    setShowCertModal(false);
    setToastMsg('Certification registered successfully.');
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Add Project Submit
  const handleAddProjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projDesc.trim() || !projTech.trim()) {
      setToastMsg('Please fill in all required fields.');
      setTimeout(() => setToastMsg(null), 2000);
      return;
    }

    const newProj: CareerProject = {
      id: `proj-${Date.now()}`,
      name: projName.trim(),
      description: projDesc.trim(),
      technologies: projTech.trim(),
      link: projLink.trim() || undefined
    };

    const nextProjs = [...projs, newProj];
    setProjs(nextProjs);
    localStorage.setItem('campushub_career_projects', JSON.stringify(nextProjs));

    setProjName('');
    setProjDesc('');
    setProjTech('');
    setProjLink('');
    setShowProjModal(false);
    setToastMsg('Project logged successfully.');
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Save LinkedIn link
  const handleSaveLinkedin = () => {
    setLinkedinUrl(linkedinInput);
    localStorage.setItem('campushub_career_linkedin', linkedinInput);
    setEditLinkedin(false);
    setToastMsg('LinkedIn link updated successfully.');
    setTimeout(() => setToastMsg(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header back toggles */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/placements')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Placements Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Careers / Career Profile</span>
      </div>

      <div className="dashboard-header">
        <h1>Career Profile</h1>
        <p>Track your recruitment profile readiness, manage skills, and add project portfolios.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Split grid: dynamic progress meter on left, checklist on right */}
      <div className="dashboard-main-grid">
        {/* Progress meter */}
        <div className="card-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '20px', alignSelf: 'flex-start' }}>Profile Completion Score</h3>
          
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent-primary)"
                strokeDasharray={`${calculatedScore}, 100`}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease-in-out' }}
              />
            </svg>
            <strong style={{ position: 'absolute', fontSize: '24px', fontWeight: '900', color: 'white' }}>{calculatedScore}%</strong>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Ready for recruitment drives</span>
        </div>

        {/* Readiness Checklist */}
        <div className="card-panel" style={{ flex: 1.4 }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Readiness Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Basic Personal Details</span>
              </div>
              <span className="subject-att-status safe" style={{ fontSize: '9px' }}>Complete (15%)</span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Education & CGPA</span>
              </div>
              <span className="subject-att-status safe" style={{ fontSize: '9px' }}>Complete (15%)</span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className={hasSkills ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'} style={{ color: hasSkills ? '#00d89a' : 'var(--text-secondary)' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Skill Tags</span>
              </div>
              <span className={`subject-att-status ${hasSkills ? 'safe' : 'critical'}`} style={{ fontSize: '9px' }}>
                {hasSkills ? 'Complete (15%)' : 'Missing (15%)'}
              </span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className={hasProjects ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'} style={{ color: hasProjects ? '#00d89a' : 'var(--text-secondary)' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Projects Portfolios</span>
              </div>
              <span className={`subject-att-status ${hasProjects ? 'safe' : 'critical'}`} style={{ fontSize: '9px' }}>
                {hasProjects ? 'Complete (15%)' : 'Missing (15%)'}
              </span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Academic Resume</span>
              </div>
              <span className="subject-att-status safe" style={{ fontSize: '9px' }}>Complete (20%)</span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className={hasCertifications ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'} style={{ color: hasCertifications ? '#00d89a' : 'var(--text-secondary)' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>Professional Certifications</span>
              </div>
              <span className={`subject-att-status ${hasCertifications ? 'safe' : 'critical'}`} style={{ fontSize: '9px' }}>
                {hasCertifications ? 'Complete (10%)' : 'Missing (10%)'}
              </span>
            </div>

            <div className="timetable-item" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <i className={hasLinkedin ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'} style={{ color: hasLinkedin ? '#00d89a' : 'var(--text-secondary)' }}></i>
                <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>LinkedIn Profile Link</span>
              </div>
              <span className={`subject-att-status ${hasLinkedin ? 'safe' : 'critical'}`} style={{ fontSize: '9px' }}>
                {hasLinkedin ? 'Complete (10%)' : 'Missing (10%)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Management Section */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Recruitment Skill Tags</h3>
          <i className="fa-solid fa-code" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '8px', maxWidth: '400px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Add new skill (e.g. Docker, AWS, RTOS...)"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
          />
          <button type="submit" className="btn-signin" style={{ height: '34px', margin: 0, fontSize: '12px', padding: '0 16px' }}>
            Add Skill
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map((s) => (
            <span
              key={s}
              style={{
                fontSize: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '4px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'white'
              }}
            >
              {s}
              <button
                type="button"
                onClick={() => handleRemoveSkill(s)}
                style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: '11px' }}></i>
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Certifications Management */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>Professional Certifications</h3>
          <button
            type="button"
            className="btn-view-all"
            style={{ margin: 0, border: '1px solid var(--accent-primary)', color: 'white', padding: '0 12px', height: '32px', fontSize: '11.5px' }}
            onClick={() => setShowCertModal(true)}
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add Certification
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {certs.map((c) => (
            <div key={c.id} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span className="class-subject-name">{c.name}</span>
                <i className="fa-solid fa-award" style={{ color: 'var(--accent-primary)', fontSize: '15px' }}></i>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>Org: <strong style={{ color: 'white' }}>{c.organization}</strong></div>
                <div>Issued: <strong style={{ color: 'white' }}>{c.issueDate}</strong></div>
                <div style={{ marginTop: '2px', fontSize: '11.5px' }}>ID: <code>{c.credentialId}</code></div>
              </div>
            </div>
          ))}
          {certs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No certifications registered yet.
            </div>
          )}
        </div>
      </div>

      {/* Projects Management */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3>Project Portfolios</h3>
          <button
            type="button"
            className="btn-view-all"
            style={{ margin: 0, border: '1px solid var(--accent-primary)', color: 'white', padding: '0 12px', height: '32px', fontSize: '11.5px' }}
            onClick={() => setShowProjModal(true)}
          >
            <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i> Add Project
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {projs.map((p) => (
            <div key={p.id} className="timetable-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <strong style={{ fontSize: '14px', color: 'white' }}>{p.name}</strong>
                {p.link && (
                  <a href={`https://${p.link}`} target="_blank" rel="noreferrer" style={{ fontSize: '11.5px', color: 'var(--accent-highlight)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Link
                  </a>
                )}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{p.description}</p>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Tech stack: <strong style={{ color: 'white' }}>{p.technologies}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Links */}
      <div className="card-panel">
        <div className="card-panel-header" style={{ marginBottom: '16px' }}>
          <h3>Professional Networks</h3>
          <i className="fa-solid fa-link" style={{ color: 'var(--text-secondary)' }}></i>
        </div>

        {editLinkedin ? (
          <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="e.g. linkedin.com/in/adityasharma"
              value={linkedinInput}
              onChange={(e) => setLinkedinInput(e.target.value)}
              style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
            />
            <button type="button" className="btn-signin" style={{ height: '34px', margin: 0, fontSize: '12px' }} onClick={handleSaveLinkedin}>
              Save Link
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>LinkedIn Profile:</span>{' '}
              {linkedinUrl ? (
                <strong style={{ color: 'white' }}>{linkedinUrl}</strong>
              ) : (
                <span style={{ fontStyle: 'italic', color: 'var(--color-error)' }}>Not set</span>
              )}
            </div>
            <button
              type="button"
              className="btn-retry-err"
              style={{ margin: 0, padding: '4px 12px', fontSize: '11.5px' }}
              onClick={() => {
                setLinkedinInput(linkedinUrl);
                setEditLinkedin(true);
              }}
            >
              {linkedinUrl ? 'Edit Link' : 'Set Link'}
            </button>
          </div>
        )}
      </div>

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="search-modal-overlay" onClick={() => setShowCertModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '16.5px' }}>Register Certification</h2>
              <button type="button" className="btn-search-close" onClick={() => setShowCertModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <form onSubmit={handleAddCertSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Certification Name</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Cloud Practitioner"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Issuing Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services"
                  value={certOrg}
                  onChange={(e) => setCertOrg(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Issue Date</label>
                <input
                  type="text"
                  placeholder="e.g. Aug 2026"
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Credential ID / License No.</label>
                <input
                  type="text"
                  placeholder="e.g. AWS-CP-98246"
                  value={certIdNum}
                  onChange={(e) => setCertIdNum(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-signin" style={{ height: '38px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                Save Certification
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjModal && (
        <div className="search-modal-overlay" onClick={() => setShowProjModal(false)}>
          <div className="search-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <h2 style={{ fontSize: '16.5px' }}>Add Project Portfolio</h2>
              <button type="button" className="btn-search-close" onClick={() => setShowProjModal(false)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <form onSubmit={handleAddProjSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chatbot system, e-commerce backend..."
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Short description of core features..."
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Technologies Sourced</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, SQLite, Python..."
                  value={projTech}
                  onChange={(e) => setProjTech(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>GitHub / Demo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/username/project"
                  value={projLink}
                  onChange={(e) => setProjLink(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', outline: 'none' }}
                />
              </div>

              <button type="submit" className="btn-signin" style={{ height: '38px', margin: 0, marginTop: '10px', fontSize: '13px' }}>
                Log Project Portfolio
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CareerProfile;
