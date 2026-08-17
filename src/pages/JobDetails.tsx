import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placementsData, CareerApplication } from '../data/placementsData';

export const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentName = user?.name || 'Aditya Sharma';
  const studentCgpa = 8.6;
  const studentBranch = 'CSE';
  const studentBacklogs = 0;

  // Find job details
  const job = placementsData.jobs.find((j) => j.id === jobId);

  // Load applications to check status
  const [apps, setApps] = useState<CareerApplication[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_apps');
      return stored ? JSON.parse(stored) : placementsData.applications;
    } catch {
      return placementsData.applications;
    }
  });

  // Modal / Wizard states
  const [showApplyWizard, setShowApplyWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 = Profile, 2 = Resume, 3 = Questions, 4 = Review
  const [resumeChoice, setResumeChoice] = useState<'Existing' | 'Upload'>('Existing');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Custom answers state
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Eligibility check state
  const [eligibilityCheckMsg, setEligibilityCheckMsg] = useState<{ isEligible: boolean; reason: string } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [appliedApp, setAppliedApp] = useState<CareerApplication | null>(null);

  if (!job) {
    return (
      <div className="card-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '32px', color: 'var(--color-error)', marginBottom: '12px' }}></i>
        <h3>Job Opportunity Not Found</h3>
        <button type="button" className="btn-sso" onClick={() => navigate('/placements')} style={{ marginTop: '16px' }}>
          Back to Placements
        </button>
      </div>
    );
  }

  // Check eligibility logic
  const handleCheckEligibility = () => {
    if (studentCgpa < job.cgpaRequired) {
      setEligibilityCheckMsg({
        isEligible: false,
        reason: `Required CGPA: ${job.cgpaRequired}. Your CGPA: ${studentCgpa} (Below requirement).`
      });
    } else if (!job.branchRequired.includes(studentBranch)) {
      setEligibilityCheckMsg({
        isEligible: false,
        reason: `Required branch: ${job.branchRequired.join('/')}. Your branch: ${studentBranch} (Mismatch).`
      });
    } else if (studentBacklogs > 0) {
      setEligibilityCheckMsg({
        isEligible: false,
        reason: 'Candidates with active academic backlogs are not eligible to apply.'
      });
    } else {
      setEligibilityCheckMsg({
        isEligible: true,
        reason: 'Eligible: You meet all listed eligibility requirements.'
      });
    }
  };

  const handleApplyClick = () => {
    setWizardStep(1);
    setResumeChoice('Existing');
    setUploadedFileName('');
    setCustomAnswers({});
    setAppliedApp(null);
    setShowApplyWizard(true);
  };

  const handleNextStep = () => {
    if (wizardStep === 3 && job.questions) {
      // Validate answers
      for (const q of job.questions) {
        if (!customAnswers[q]?.trim()) {
          setToastMsg('Please answer all application questions.');
          setTimeout(() => setToastMsg(null), 2000);
          return;
        }
      }
    }
    setWizardStep(wizardStep + 1);
  };

  const handlePrevStep = () => {
    setWizardStep(wizardStep - 1);
  };

  const handleConfirmSubmit = () => {
    const nextAppIdNum = 100125 + apps.length;
    const appId = `APP-2026-00${nextAppIdNum}`;
    const todayStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const newApp: CareerApplication = {
      id: appId,
      jobId: job.id,
      company: job.company,
      role: job.title,
      appliedDate: todayStr,
      deadline: job.deadline,
      status: 'Applied',
      resumeName: resumeChoice === 'Existing' ? 'Aditya_Sharma_Resume.pdf' : uploadedFileName || 'Uploaded_Resume.pdf',
      answers: customAnswers,
      timeline: [
        { date: `${todayStr} 12:00 PM`, statusText: 'Application Submitted' },
        { date: `${todayStr} 12:00 PM`, statusText: 'Application Under Review' }
      ]
    };

    const nextApps = [newApp, ...apps];
    setApps(nextApps);
    localStorage.setItem('campushub_career_apps', JSON.stringify(nextApps));

    setAppliedApp(newApp);
    setToastMsg('Application submitted successfully.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const isAlreadyApplied = apps.some((a) => a.jobId === job.id && a.status !== 'Withdrawn');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header back navigation */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-sso"
          onClick={() => navigate('/placements')}
          style={{ margin: 0, padding: '0 12px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <i className="fa-solid fa-arrow-left"></i> Back to Placements
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Placements / Job Listings / {job.company}</span>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Job Title Card Header */}
      <div className="card-panel" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--accent-highlight)', fontWeight: '700', textTransform: 'uppercase' }}>{job.company}</span>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginTop: '4px' }}>{job.title}</h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <div><i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i> {job.location}</div>
              <div><i className="fa-solid fa-wallet" style={{ marginRight: '6px' }}></i> {job.packageStr}</div>
              <div><i className="fa-solid fa-briefcase" style={{ marginRight: '6px' }}></i> {job.type}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-view-all"
              style={{ border: '1px solid var(--accent-primary)', color: 'white', margin: 0 }}
              onClick={handleCheckEligibility}
            >
              Check My Eligibility
            </button>
            {isAlreadyApplied ? (
              <button
                type="button"
                className="btn-view-all"
                style={{ background: 'rgba(0, 216, 154, 0.05)', borderColor: '#00d89a', color: '#00d89a', margin: 0 }}
                onClick={() => navigate('/placements/applications')}
              >
                Applied - View Status
              </button>
            ) : (
              <button
                type="button"
                className="btn-signin"
                style={{ width: 'auto', padding: '0 24px', height: '36px', margin: 0 }}
                onClick={handleApplyClick}
                disabled={!placementsData.jobs.find((j) => j.id === job.id) || (eligibilityCheckMsg !== null && !eligibilityCheckMsg.isEligible)}
              >
                Apply Now
              </button>
            )}
          </div>
        </div>

        {/* Eligibility Check Results Alerts */}
        {eligibilityCheckMsg && (
          <div
            className="login-error-box"
            style={{
              marginTop: '20px',
              marginInline: 0,
              borderColor: eligibilityCheckMsg.isEligible ? 'rgba(0,216,154,0.3)' : 'rgba(217,83,79,0.3)',
              background: eligibilityCheckMsg.isEligible ? 'rgba(0,216,154,0.02)' : 'rgba(217,83,79,0.02)'
            }}
          >
            <i className={`fa-solid ${eligibilityCheckMsg.isEligible ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} style={{ color: eligibilityCheckMsg.isEligible ? '#00d89a' : 'var(--color-error)' }}></i>
            <span style={{ color: eligibilityCheckMsg.isEligible ? '#00d89a' : 'var(--color-error)' }}>
              <strong>Eligibility Check:</strong> {eligibilityCheckMsg.reason}
            </span>
          </div>
        )}
      </div>

      {/* Main descriptions grid */}
      <div className="dashboard-main-grid">
        {/* Left column details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1.4 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>About the Role</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{job.description}</p>
          </div>

          <div className="card-panel">
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Responsibilities</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {job.responsibilities.map((resp, idx) => (
                <li key={idx}>{resp}</li>
              ))}
            </ul>
          </div>

          <div className="card-panel">
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Requirements & Skills</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {job.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {job.skills.map((s, idx) => (
                <span key={idx} className="subject-att-status good" style={{ fontSize: '9.5px' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column sidebar summaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div className="card-panel">
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '14px' }}>Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Salary Bracket:</span> <strong style={{ color: 'white' }}>{job.packageStr}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Job Type:</span> <strong style={{ color: 'white' }}>{job.type}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Min CGPA:</span> <strong style={{ color: 'white' }}>{job.cgpaRequired}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Branches:</span> <strong style={{ color: 'white' }}>{job.branchRequired.join(', ')}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Openings:</span> <strong style={{ color: 'white' }}>{job.openings} positions</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deadline:</span>
                <strong style={{ color: 'var(--color-error)' }}>{job.deadline}</strong>
              </div>
            </div>
          </div>

          <div className="card-panel">
            <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Compensation & Benefits</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {job.benefits.map((ben, idx) => (
                <li key={idx}>{ben}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4-Step Application Wizard Modal */}
      {showApplyWizard && (
        <div className="search-modal-overlay" onClick={() => !appliedApp && setShowApplyWizard(false)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>Applying for {job.company}</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{job.title}</h2>
              </div>
              {!appliedApp && (
                <button type="button" className="btn-search-close" onClick={() => setShowApplyWizard(false)}>
                  <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
                </button>
              )}
            </div>

            {/* Wizard progress tracker */}
            {!appliedApp && (
              <div style={{ display: 'flex', padding: '12px 24px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.06)', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {['Profile', 'Resume', 'Questions', 'Submit'].map((stepName, idx) => {
                  const stepNum = idx + 1;
                  const isActive = wizardStep === stepNum;
                  const isCompleted = wizardStep > stepNum;
                  return (
                    <span key={idx} style={{ color: isActive ? 'var(--accent-highlight)' : isCompleted ? '#00d89a' : 'inherit', fontWeight: '700' }}>
                      {stepNum}. {stepName}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {appliedApp ? (
                /* Success screen */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 216, 154, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d89a', fontSize: '24px' }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>Application Submitted Successfully</h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Your recruitment credentials have been registered for review.</p>
                  </div>

                  <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', textAlign: 'left' }}>
                    <div>Company: <strong style={{ color: 'white' }}>{job.company}</strong></div>
                    <div>Role: <strong style={{ color: 'white' }}>{job.title}</strong></div>
                    <div>Application ID: <strong style={{ color: 'var(--accent-highlight)' }}>{appliedApp.id}</strong></div>
                    <div>Submitted Date: <strong style={{ color: 'white' }}>{appliedApp.appliedDate}</strong></div>
                    <div>Status: <span className="subject-att-status safe" style={{ fontSize: '9px' }}>Applied</span></div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-retry-err"
                      style={{ flex: 1, margin: 0 }}
                      onClick={() => {
                        setShowApplyWizard(false);
                        navigate('/placements');
                      }}
                    >
                      Back to Placements
                    </button>
                    <button
                      type="button"
                      className="btn-signin"
                      style={{ flex: 1, margin: 0, height: '38px', padding: 0 }}
                      onClick={() => {
                        setShowApplyWizard(false);
                        navigate('/placements/applications');
                      }}
                    >
                      View Applications
                    </button>
                  </div>
                </div>
              ) : (
                /* Step-wise screens */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {wizardStep === 1 && (
                    /* Step 1: Review Profile */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Confirm Student Information</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Review the profile details that will be shared with the recruiter.</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12.5px' }}>
                        <div>Name: <strong style={{ color: 'white' }}>{studentName}</strong></div>
                        <div>ID: <strong style={{ color: 'white' }}>236F1A0551</strong></div>
                        <div>Dept: <strong style={{ color: 'white' }}>{studentBranch}</strong></div>
                        <div>CGPA: <strong style={{ color: 'white' }}>{studentCgpa}</strong></div>
                        <div>Email: <strong style={{ color: 'white' }}>student@campushub.com</strong></div>
                        <div>Phone: <strong style={{ color: 'white' }}>+91 9876543210</strong></div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    /* Step 2: Resume selection */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Select Academic Resume</h4>
                      
                      <button
                        type="button"
                        className={`btn-sso ${resumeChoice === 'Existing' ? 'active' : ''}`}
                        onClick={() => setResumeChoice('Existing')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', width: '100%', height: 'auto', textAlign: 'left' }}
                      >
                        <div>
                          <strong style={{ color: 'white', display: 'block', fontSize: '12.5px' }}>Use Registered Resume</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Aditya_Sharma_Resume.pdf (Last updated Today)</span>
                        </div>
                        <i className="fa-solid fa-file-pdf" style={{ fontSize: '18px', color: 'var(--accent-primary)' }}></i>
                      </button>

                      <div
                        style={{
                          border: '1px dashed var(--border-color)',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(255,255,255,0.01)'
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '20px', color: 'var(--text-secondary)' }}></i>
                        <span style={{ fontSize: '12px', color: 'white' }}>Upload New PDF Resume file</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setResumeChoice('Upload');
                              setUploadedFileName(e.target.files[0].name);
                            }
                          }}
                          style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                        />
                        {uploadedFileName && (
                          <span style={{ fontSize: '11px', color: '#00d89a' }}>Selected: {uploadedFileName}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    /* Step 3: Job Questions */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Recruiter Screening Questions</h4>
                      {job.questions && job.questions.length > 0 ? (
                        job.questions.map((q, idx) => (
                          <div key={idx} className="form-group">
                            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', lineHeight: '1.4' }}>{q}</label>
                            <textarea
                              rows={2}
                              value={customAnswers[q] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [q]: e.target.value })}
                              placeholder="Write your answer..."
                              style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 10px', color: 'white', fontSize: '12.5px', resize: 'none', fontFamily: 'inherit' }}
                            />
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No screening questions required for this opportunity. Click next to review.</p>
                      )}
                    </div>
                  )}

                  {wizardStep === 4 && (
                    /* Step 4: Review and Submit */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Review Application</h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Double-check your choices before submitting to the placement cell.</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12.5px' }}>
                        <div>Company: <strong style={{ color: 'white' }}>{job.company}</strong></div>
                        <div>Role: <strong style={{ color: 'white' }}>{job.title}</strong></div>
                        <div>Resume: <strong style={{ color: 'white' }}>{resumeChoice === 'Existing' ? 'Aditya_Sharma_Resume.pdf' : uploadedFileName || 'Uploaded_Resume.pdf'}</strong></div>
                        <div>Deadline: <strong style={{ color: 'var(--color-error)' }}>{job.deadline}</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Wizard actions buttons */}
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', marginTop: '10px' }}>
                    {wizardStep > 1 && (
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{ flex: 1, margin: 0 }}
                        onClick={handlePrevStep}
                      >
                        Back
                      </button>
                    )}
                    {wizardStep < 4 ? (
                      <button
                        type="button"
                        className="btn-signin"
                        style={{ flex: 1, margin: 0, height: '38px', padding: 0 }}
                        onClick={handleNextStep}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-signin"
                        style={{ flex: 1, margin: 0, height: '38px', padding: 0 }}
                        onClick={handleConfirmSubmit}
                      >
                        Submit Application
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobDetails;
