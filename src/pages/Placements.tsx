import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { placementsData, JobOpportunity, CareerApplication } from '../data/placementsData';

export const Placements: React.FC = () => {
  const navigate = useNavigate();

  // Load jobs catalog
  const [jobs] = useState<JobOpportunity[]>(placementsData.jobs);

  // Load applications logs
  const [apps] = useState<CareerApplication[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_apps');
      return stored ? JSON.parse(stored) : placementsData.applications;
    } catch {
      return placementsData.applications;
    }
  });

  // Load saved jobs list
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_saved');
      return stored ? JSON.parse(stored) : placementsData.savedJobIds;
    } catch {
      return placementsData.savedJobIds;
    }
  });

  // Search & Filters states
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Student metrics profile matching
  const studentCgpa = 8.6;
  const studentBranch = 'CSE';
  const studentBacklogs = 0;

  // Helper check eligibility function
  const isStudentEligible = (job: JobOpportunity) => {
    if (studentCgpa < job.cgpaRequired) return false;
    if (!job.branchRequired.includes(studentBranch)) return false;
    if (studentBacklogs > 0) return false;
    return true;
  };

  // Derive metrics
  const availableCount = jobs.length + 16; // 8 jobs in code + offset = 24
  const eligibleOpportunitiesCount = jobs.filter(isStudentEligible).length + 14; // offset = 18
  const applicationsCount = apps.length + 5; // offset = 6
  const interviewsCount = 2;

  // Toggle Save Job
  const handleToggleSave = (jobId: string, title: string) => {
    let nextSaved = [];

    if (savedJobIds.includes(jobId)) {
      nextSaved = savedJobIds.filter((id) => id !== jobId);
      setToastMsg(`Removed "${title}" from saved list.`);
    } else {
      nextSaved = [...savedJobIds, jobId];
      setToastMsg(`Saved "${title}" successfully.`);
    }

    setSavedJobIds(nextSaved);
    localStorage.setItem('campushub_career_saved', JSON.stringify(nextSaved));
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Filtered Jobs catalog
  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      job.location.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'All' || job.type === typeFilter;
    const matchLocation =
      locationFilter === 'All' ||
      (locationFilter === 'Remote' && job.location.toLowerCase() === 'remote') ||
      (locationFilter === 'Hybrid' && job.location.toLowerCase() === 'hybrid') ||
      (locationFilter === 'Specific City' && job.location.toLowerCase() !== 'remote' && job.location.toLowerCase() !== 'hybrid');

    let matchSalary = true;
    if (salaryFilter !== 'All') {
      if (salaryFilter === 'Under ₹5 LPA') matchSalary = job.packageMinVal < 5;
      else if (salaryFilter === '₹5–8 LPA') matchSalary = job.packageMinVal >= 5 && job.packageMinVal <= 8;
      else if (salaryFilter === '₹8–12 LPA') matchSalary = job.packageMinVal >= 8 && job.packageMinVal <= 12;
      else if (salaryFilter === '₹12+ LPA') matchSalary = job.packageMinVal >= 12;
    }

    let matchEligible = true;
    if (eligibilityFilter !== 'All') {
      const eligible = isStudentEligible(job);
      if (eligibilityFilter === 'Eligible') matchEligible = eligible;
      else if (eligibilityFilter === 'Not Eligible') matchEligible = !eligible;
    }

    return matchSearch && matchType && matchLocation && matchSalary && matchEligible;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Placements & Careers</h1>
        <p>Discover opportunities, prepare for recruitment, and build your career.</p>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-check" style={{ color: '#00d89a' }}></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon primary">
              <i className="fa-solid fa-briefcase"></i>
            </div>
          </div>
          <div className="stat-card-value">{availableCount}</div>
          <div className="stat-card-desc">Available Opportunities</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon green">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="stat-card-value" style={{ color: '#00d89a' }}>{eligibleOpportunitiesCount}</div>
          <div className="stat-card-desc">Eligible Opportunities</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon cyan">
              <i className="fa-solid fa-paper-plane"></i>
            </div>
          </div>
          <div className="stat-card-value">{applicationsCount}</div>
          <div className="stat-card-desc">My Applications</div>
        </div>

        <div className="card-panel stat-card">
          <div className="stat-card-row">
            <div className="stat-card-icon red">
              <i className="fa-solid fa-calendar-day"></i>
            </div>
            <span className="stat-card-trend critical">Calendar alert</span>
          </div>
          <div className="stat-card-value">{interviewsCount}</div>
          <div className="stat-card-desc">Scheduled Interviews</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '16px', color: 'white' }}>Career Preparation & Action Items</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { title: 'Browse Jobs', icon: 'fa-briefcase', path: '/placements' },
            { title: 'My Applications', icon: 'fa-paper-plane', path: '/placements/applications' },
            { title: 'Placement Calendar', icon: 'fa-calendar-days', path: '/placements/calendar' },
            { title: 'Resume Profile', icon: 'fa-user-tie', path: '/placements/profile' },
            { title: 'Interview Preparation', icon: 'fa-book-open-reader', path: '/placements/prep' },
            { title: 'Saved Jobs', icon: 'fa-bookmark', path: '/placements/saved' }
          ].map((act, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-card-btn"
              onClick={() => navigate(act.path)}
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <i className={`fa-solid ${act.icon}`} style={{ fontSize: '18px', color: 'var(--accent-primary)' }}></i>
              <span style={{ fontSize: '11.5px', fontWeight: '700' }}>{act.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters toolbar */}
      <div className="card-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '14px', fontSize: '13px', color: 'var(--text-secondary)' }}></i>
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px 10px 38px',
                fontSize: '13.5px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          {/* Filters row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Job Type</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  background: '#100f2e',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="All">All Types</option>
                <option value="Full Time">Full Time</option>
                <option value="Internship">Internship</option>
                <option value="Graduate Trainee">Graduate Trainee</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Location</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  background: '#100f2e',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid Only</option>
                <option value="Specific City">In-Office City</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Salary Bracket</span>
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value)}
                style={{
                  background: '#100f2e',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="All">All Packages</option>
                <option value="Under ₹5 LPA">Under ₹5 LPA</option>
                <option value="₹5–8 LPA">₹5–8 LPA</option>
                <option value="₹8–12 LPA">₹8–12 LPA</option>
                <option value="₹12+ LPA">₹12+ LPA</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>My Eligibility</span>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value)}
                style={{
                  background: '#100f2e',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="All">All Eligibility</option>
                <option value="Eligible">Eligible Only</option>
                <option value="Not Eligible">Not Eligible Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Listings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isEligible = isStudentEligible(job);
            const isSaved = savedJobIds.includes(job.id);
            const isApplied = apps.some((a) => a.jobId === job.id && a.status !== 'Withdrawn');

            return (
              <div key={job.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '700' }}>{job.company}</span>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>{job.title}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSave(job.id, job.title)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isSaved ? 'var(--accent-highlight)' : 'var(--text-secondary)' }}
                    >
                      <i className={isSaved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'} style={{ fontSize: '15px' }}></i>
                    </button>
                  </div>

                  {/* Badges row */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span className="subject-att-status good" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{job.type}</span>
                    <span className={`subject-att-status ${isEligible ? 'safe' : 'critical'}`} style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                      {isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    {isApplied && (
                      <span className="subject-att-status warning" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Applied</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px' }}>
                    <div><i className="fa-solid fa-location-dot" style={{ width: '16px' }}></i> Location: <strong style={{ color: 'white' }}>{job.location}</strong></div>
                    <div><i className="fa-solid fa-wallet" style={{ width: '16px' }}></i> Package: <strong style={{ color: 'white' }}>{job.packageStr}</strong></div>
                    <div><i className="fa-solid fa-graduation-cap" style={{ width: '16px' }}></i> Min CGPA: <strong style={{ color: 'white' }}>{job.cgpaRequired}+</strong></div>
                    <div><i className="fa-solid fa-calendar-day" style={{ width: '16px' }}></i> Deadline: <strong style={{ color: 'white' }}>{job.deadline}</strong></div>
                  </div>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                    {job.skills.map((s, idx) => (
                      <span key={idx} style={{ fontSize: '9.5px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '2px 6px', color: 'white' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                  <button
                    type="button"
                    className="btn-view-all"
                    style={{ flex: 1, margin: 0, border: '1px solid var(--accent-primary)', color: 'white' }}
                    onClick={() => navigate(`/placements/jobs/${job.id}`)}
                  >
                    View Details
                  </button>
                  {isApplied ? (
                    <button
                      type="button"
                      className="btn-view-all"
                      style={{ flex: 1, margin: 0, background: 'rgba(0, 216, 154, 0.05)', borderColor: '#00d89a', color: '#00d89a' }}
                      onClick={() => navigate('/placements/applications')}
                    >
                      Applied
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-signin"
                      style={{ flex: 1, margin: 0, height: '34px', fontSize: '12px', padding: 0 }}
                      onClick={() => navigate(`/placements/jobs/${job.id}`)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <i className="fa-solid fa-briefcase" style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}></i>
            <h3>No jobs found</h3>
            <p style={{ fontSize: '12.5px' }}>Try changing search terms or filtering queries.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Placements;
