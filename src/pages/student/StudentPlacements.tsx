import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { placementsData, JobOpportunity, CareerApplication, PlacementEvent } from '../../data/placementsData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StudentPlacements: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Active section tab
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'drives' | 'interviews' | 'saved' | 'resources' | 'analytics'>('jobs');

  // Sync tab from URL path if navigated directly
  useEffect(() => {
    if (location.pathname.includes('/applications')) {
      setActiveTab('applications');
    } else if (location.pathname.includes('/drives')) {
      setActiveTab('drives');
    } else if (location.pathname.includes('/saved')) {
      setActiveTab('saved');
    }
  }, [location.pathname]);

  // Student Profile Data for Eligibility Matching
  const studentProfile = {
    name: user?.name || 'Aditya Sharma',
    email: user?.email || 'aditya.sharma@campusone.edu',
    phone: '+91 98765 43210',
    rollNumber: '236F1A0551',
    branch: 'CSE',
    cgpa: 8.6,
    graduationYear: 2026,
    activeBacklogs: 0,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker']
  };

  // Jobs catalog state
  const [jobs] = useState<JobOpportunity[]>(placementsData.jobs);

  // Applications state seeded with stored items or initial mock
  const [applications, setApplications] = useState<CareerApplication[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_apps');
      return stored ? JSON.parse(stored) : placementsData.applications;
    } catch {
      return placementsData.applications;
    }
  });

  // Saved Jobs state
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('campushub_career_saved');
      return stored ? JSON.parse(stored) : ['job-cloudcore-get', 'job-websphere-fe'];
    } catch {
      return ['job-cloudcore-get', 'job-websphere-fe'];
    }
  });

  // Campus Placement Drives state
  const [drives, setDrives] = useState<PlacementEvent[]>(placementsData.events);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'salary' | 'company'>('newest');

  // Modals state
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [applyingJob, setApplyingJob] = useState<JobOpportunity | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);
  const [selectedDrive, setSelectedDrive] = useState<PlacementEvent | null>(null);

  // Application Form State
  const [appFullName, setAppFullName] = useState(studentProfile.name);
  const [appEmail, setAppEmail] = useState(studentProfile.email);
  const [appPhone, setAppPhone] = useState(studentProfile.phone);
  const [appCoverLetter, setAppCoverLetter] = useState('');
  const [appPortfolio, setAppPortfolio] = useState('https://github.com/adityasharma/campus-hub');
  const [appLinkedIn, setAppLinkedIn] = useState('https://linkedin.com/in/adityasharma');
  const [appGithub, setAppGithub] = useState('https://github.com/adityasharma');

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('Aditya_Sharma_Resume_2026.pdf');
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(100);
  const [isSubmittingApp, setIsSubmittingApp] = useState<boolean>(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Eligibility Engine
  const checkEligibility = (job: JobOpportunity) => {
    const cgpaEligible = studentProfile.cgpa >= job.cgpaRequired;
    const branchEligible = job.branchRequired.includes(studentProfile.branch);
    const backlogsEligible = studentProfile.activeBacklogs === 0;

    const isEligible = cgpaEligible && branchEligible && backlogsEligible;

    return {
      isEligible,
      cgpaEligible,
      branchEligible,
      backlogsEligible,
      reason: !isEligible
        ? !cgpaEligible
          ? `Minimum CGPA required is ${job.cgpaRequired} (Your CGPA: ${studentProfile.cgpa})`
          : !branchEligible
          ? `Eligible branches: ${job.branchRequired.join(', ')} (Your branch: ${studentProfile.branch})`
          : 'Zero active backlogs required'
        : 'You satisfy all institutional eligibility criteria.'
    };
  };

  // Check if job is already applied
  const isJobApplied = (jobId: string) => {
    return applications.some((app) => app.jobId === jobId);
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (jobId: string, jobTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter((id) => id !== jobId);
      showToast(`Removed "${jobTitle}" from saved jobs.`, 'info');
    } else {
      updated = [...savedJobIds, jobId];
      showToast(`Saved "${jobTitle}" to your career bookmarks.`, 'success');
    }
    setSavedJobIds(updated);
    try {
      localStorage.setItem('campushub_career_saved', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle Resume File Change
  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      showToast('Please select a valid PDF, DOC, or DOCX document.', 'error');
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Resume file size must be less than 5MB.', 'error');
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
    setIsUploadingResume(true);
    setUploadProgress(15);

    // Simulate animated upload progress
    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploadingResume(false);
          showToast(`Resume "${file.name}" uploaded successfully!`, 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Handle Application Submit
  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    if (isJobApplied(applyingJob.id)) {
      showToast('You have already submitted an application for this position.', 'warning');
      return;
    }

    const elig = checkEligibility(applyingJob);
    if (!elig.isEligible) {
      showToast(`Cannot submit application: ${elig.reason}`, 'error');
      return;
    }

    setIsSubmittingApp(true);

    setTimeout(() => {
      setIsSubmittingApp(false);

      const newAppId = `APP-2026-00${Math.floor(100 + Math.random() * 900)}`;
      const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newApp: CareerApplication = {
        id: newAppId,
        jobId: applyingJob.id,
        company: applyingJob.company,
        role: applyingJob.title,
        appliedDate: nowStr,
        deadline: applyingJob.deadline,
        status: 'Applied',
        nextStep: 'Application Under Initial Review',
        resumeName: resumeFileName || 'Aditya_Sharma_Resume.pdf',
        timeline: [
          { date: `${nowStr} ${nowTimeStr}`, statusText: 'Application Submitted Online' },
          { date: `${nowStr} ${nowTimeStr}`, statusText: 'Application Received by Training & Placement Cell' }
        ]
      };

      const nextApps = [newApp, ...applications];
      setApplications(nextApps);
      try {
        localStorage.setItem('campushub_career_apps', JSON.stringify(nextApps));
      } catch {
        // ignore
      }

      setApplyingJob(null);
      showToast(`Application for ${applyingJob.title} at ${applyingJob.company} submitted successfully!`, 'success');
    }, 1200);
  };

  // Register for Placement Drive
  const handleRegisterDrive = (driveId: string, company: string) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, isRegistered: true } : d))
    );
    showToast(`Registered successfully for ${company} recruitment drive!`, 'success');
    if (selectedDrive?.id === driveId) {
      setSelectedDrive((prev) => (prev ? { ...prev, isRegistered: true } : null));
    }
  };

  // Filtered and Sorted Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q);

      const matchType = typeFilter === 'All' || job.type === typeFilter;

      const matchLocation =
        locationFilter === 'All' ||
        (locationFilter === 'Remote' && job.location.toLowerCase() === 'remote') ||
        (locationFilter === 'Bangalore' && job.location.toLowerCase().includes('bangalore')) ||
        (locationFilter === 'Hyderabad' && job.location.toLowerCase().includes('hyderabad')) ||
        (locationFilter === 'Pune' && job.location.toLowerCase().includes('pune'));

      let matchSalary = true;
      if (salaryFilter !== 'All') {
        if (salaryFilter === 'Under ₹5 LPA') matchSalary = job.packageMinVal < 5;
        else if (salaryFilter === '₹5–8 LPA') matchSalary = job.packageMinVal >= 5 && job.packageMinVal <= 8;
        else if (salaryFilter === '₹8–12 LPA') matchSalary = job.packageMinVal >= 8 && job.packageMinVal <= 12;
        else if (salaryFilter === '₹12+ LPA') matchSalary = job.packageMinVal >= 12;
      }

      let matchEligible = true;
      if (eligibilityFilter === 'Eligible Only') {
        matchEligible = checkEligibility(job).isEligible;
      } else if (eligibilityFilter === 'Check Required') {
        matchEligible = !checkEligibility(job).isEligible;
      }

      let matchStatus = true;
      const applied = isJobApplied(job.id);
      if (statusFilter === 'Applied') matchStatus = applied;
      else if (statusFilter === 'Not Applied') matchStatus = !applied;

      return matchSearch && matchType && matchLocation && matchSalary && matchEligible && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'salary') return b.packageMinVal - a.packageMinVal;
      if (sortBy === 'company') return a.company.localeCompare(b.company);
      if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
      return 0; // newest
    });
  }, [jobs, searchQuery, typeFilter, locationFilter, salaryFilter, eligibilityFilter, statusFilter, sortBy, applications]);

  const hasActiveFilters =
    searchQuery !== '' ||
    typeFilter !== 'All' ||
    locationFilter !== 'All' ||
    salaryFilter !== 'All' ||
    eligibilityFilter !== 'All' ||
    statusFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setLocationFilter('All');
    setSalaryFilter('All');
    setEligibilityFilter('All');
    setStatusFilter('All');
    setSortBy('newest');
    showToast('Job filters reset to default.', 'info');
  };

  // Analytics Metrics
  const totalAvailableJobs = 24; // 8 catalog + 16 active on campus network
  const totalApplications = applications.length + 7; // realistic total
  const shortlistedCount = 3;
  const interviewsCount = 2;
  const offersCount = 1;
  const successRate = Math.round((shortlistedCount / totalApplications) * 100);

  // Status Badge Helper
  const getAppStatusBadge = (status: CareerApplication['status']) => {
    switch (status) {
      case 'Selected':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-trophy"></i> Offer Selected</span>;
      case 'Interview':
        return <span className="c1-badge c1-badge-cyan"><i className="fa-solid fa-video"></i> Interview Scheduled</span>;
      case 'Shortlisted':
        return <span className="c1-badge c1-badge-purple"><i className="fa-solid fa-circle-check"></i> Shortlisted</span>;
      case 'Under Review':
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-spinner"></i> Under Review</span>;
      case 'Rejected':
        return <span className="c1-badge c1-badge-error"><i className="fa-solid fa-circle-xmark"></i> Not Shortlisted</span>;
      case 'Applied':
      default:
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-clock"></i> Applied</span>;
    }
  };

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Career & Placements</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Placement Portal</span>
            </div>
            <h1 className="module-title">Placement & Careers</h1>
            <p className="module-subtitle">
              Discover opportunities, track applications, prepare with mock rounds, and connect with top campus recruiters.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setActiveTab('applications')}
            >
              <i className="fa-solid fa-briefcase"></i>
              <span>My Applications ({applications.length})</span>
            </button>
          </div>
        </div>

        {/* 5 Key Metric Summary Cards */}
        <div className="academic-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <i className="fa-solid fa-building"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalAvailableJobs}</span>
              <span className="stat-label">Available Jobs</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num">{totalApplications}</span>
              <span className="stat-label">Applications</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#c084fc' }}>{shortlistedCount}</span>
              <span className="stat-label">Shortlisted</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <i className="fa-solid fa-comments"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#fbbf24' }}>{interviewsCount}</span>
              <span className="stat-label">Interviews</span>
            </div>
          </div>

          <div className="c1-card academic-stat-card">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div className="stat-card-data">
              <span className="stat-num" style={{ color: '#34d399' }}>{offersCount}</span>
              <span className="stat-label">Offer Received</span>
            </div>
          </div>
        </div>

        {/* Large Career Hero Section */}
        <div className="c1-card career-hero-card">
          <div className="hero-content">
            <span className="c1-badge c1-badge-purple" style={{ marginBottom: '10px' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i> CampusOne Placement Season 2025–2026
            </span>
            <h2 className="hero-title">Build Your Career With CampusOne</h2>
            <p className="hero-desc">
              Explore jobs, internships, campus recruitment drives, and elite tech opportunities curated specifically for your academic specialization.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setActiveTab('jobs')}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                <span>Explore Opportunities</span>
              </button>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setActiveTab('applications')}
              >
                <i className="fa-solid fa-list-check"></i>
                <span>My Applications</span>
              </button>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setActiveTab('drives')}
              >
                <i className="fa-solid fa-calendar-day"></i>
                <span>Placement Drives</span>
              </button>
            </div>
          </div>
          <div className="hero-badge-art">
            <div className="hero-circle-stat">
              <span className="h-stat-num">₹14 LPA</span>
              <span className="h-stat-label">Highest Package</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="exam-section-tabs">
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="fa-solid fa-briefcase"></i>
            <span>Job Opportunities ({jobs.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <i className="fa-solid fa-file-signature"></i>
            <span>My Applications ({applications.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'drives' ? 'active' : ''}`}
            onClick={() => setActiveTab('drives')}
          >
            <i className="fa-solid fa-calendar-check"></i>
            <span>Placement Drives ({drives.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('interviews')}
          >
            <i className="fa-solid fa-user-tie"></i>
            <span>Interviews ({interviewsCount})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <i className="fa-solid fa-bookmark"></i>
            <span>Saved Jobs ({savedJobIds.length})</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <i className="fa-solid fa-graduation-cap"></i>
            <span>Career Resources</span>
          </button>
          <button
            type="button"
            className={`section-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fa-solid fa-chart-pie"></i>
            <span>Analytics</span>
          </button>
        </div>

        {/* ============================================================
            TAB 1: JOB OPPORTUNITIES CATALOG
            ============================================================ */}
        {activeTab === 'jobs' && (
          <div className="placement-jobs-view">
            {/* Search & Filters Card */}
            <div className="c1-card academic-filters-card" style={{ marginBottom: '24px' }}>
              <div className="search-filter-input-wrap">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  className="c1-input search-filter-input"
                  placeholder="Search jobs by company, role title, skills (React, Python), or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>

              <div className="filters-row-wrap">
                <div className="filter-select-item">
                  <label htmlFor="filter-job-type">Job Type</label>
                  <select
                    id="filter-job-type"
                    className="c1-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Job Types</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Graduate Trainee">Graduate Trainee</option>
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="filter-job-location">Location / Mode</label>
                  <select
                    id="filter-job-location"
                    className="c1-select"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="All">All Locations</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="filter-job-salary">Salary Range</label>
                  <select
                    id="filter-job-salary"
                    className="c1-select"
                    value={salaryFilter}
                    onChange={(e) => setSalaryFilter(e.target.value)}
                  >
                    <option value="All">All Packages</option>
                    <option value="Under ₹5 LPA">Under ₹5 LPA</option>
                    <option value="₹5–8 LPA">₹5–8 LPA</option>
                    <option value="₹8–12 LPA">₹8–12 LPA</option>
                    <option value="₹12+ LPA">₹12+ LPA</option>
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="filter-job-eligibility">Eligibility</label>
                  <select
                    id="filter-job-eligibility"
                    className="c1-select"
                    value={eligibilityFilter}
                    onChange={(e) => setEligibilityFilter(e.target.value)}
                  >
                    <option value="All">All Eligibility</option>
                    <option value="Eligible Only">Eligible to Apply</option>
                    <option value="Check Required">Eligibility Check Required</option>
                  </select>
                </div>

                <div className="filter-select-item">
                  <label htmlFor="filter-job-sort">Sort By</label>
                  <select
                    id="filter-job-sort"
                    className="c1-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary">Highest Package</option>
                    <option value="deadline">Application Deadline</option>
                    <option value="company">Company Name (A-Z)</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-clear-filters"
                    onClick={resetFilters}
                  >
                    <i className="fa-solid fa-arrow-rotate-left"></i>
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Jobs Cards Grid */}
            {filteredJobs.length > 0 ? (
              <div className="jobs-cards-grid">
                {filteredJobs.map((job) => {
                  const elig = checkEligibility(job);
                  const applied = isJobApplied(job.id);
                  const isSaved = savedJobIds.includes(job.id);

                  return (
                    <div key={job.id} className="c1-card job-opportunity-card">
                      <div className="job-card-header">
                        <div className="company-logo-badge">
                          {job.company.substring(0, 2).toUpperCase()}
                        </div>

                        <div className="job-header-info">
                          <span className="job-company-name">{job.company}</span>
                          <h3 className="job-role-title">{job.title}</h3>
                        </div>

                        <button
                          type="button"
                          className={`btn-job-save ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => handleToggleSave(job.id, job.title, e)}
                          title={isSaved ? 'Remove from saved' : 'Save job'}
                          aria-label="Save opportunity"
                        >
                          <i className={`fa-${isSaved ? 'solid' : 'regular'} fa-bookmark`}></i>
                        </button>
                      </div>

                      <div className="job-tags-row">
                        <span className="job-tag-chip location">
                          <i className="fa-solid fa-location-dot"></i> {job.location}
                        </span>
                        <span className="job-tag-chip type">
                          <i className="fa-solid fa-briefcase"></i> {job.type}
                        </span>
                        <span className="job-tag-chip package">
                          <i className="fa-solid fa-sack-dollar"></i> {job.packageStr}
                        </span>
                      </div>

                      <div className="job-skills-chips">
                        {job.skills.map((skill) => (
                          <span key={skill} className="skill-chip">{skill}</span>
                        ))}
                      </div>

                      <p className="job-short-desc">{job.description}</p>

                      <div className="job-eligibility-strip">
                        {elig.isEligible ? (
                          <span className="elig-badge eligible">
                            <i className="fa-solid fa-circle-check"></i> Eligible to Apply (Min {job.cgpaRequired} CGPA)
                          </span>
                        ) : (
                          <span className="elig-badge not-eligible" title={elig.reason}>
                            <i className="fa-solid fa-circle-exclamation"></i> Eligibility Check Required
                          </span>
                        )}
                        <span className="deadline-alert">
                          <i className="fa-regular fa-clock"></i> Closes {job.deadline}
                        </span>
                      </div>

                      <div className="job-card-actions">
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          onClick={() => setSelectedJob(job)}
                        >
                          <i className="fa-solid fa-circle-info"></i>
                          <span>View Details</span>
                        </button>

                        {applied ? (
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary btn-applied"
                            onClick={() => setActiveTab('applications')}
                          >
                            <i className="fa-solid fa-check"></i>
                            <span>Applied</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="c1-btn c1-btn-gradient"
                            onClick={() => {
                              setApplyingJob(job);
                            }}
                          >
                            <i className="fa-solid fa-paper-plane"></i>
                            <span>Apply Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-briefcase empty-card-icon"></i>
                <h4>No opportunities match your filter criteria</h4>
                <p>Try resetting the search terms or widening the salary and location filters.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: MY APPLICATIONS TRACKER
            ============================================================ */}
        {activeTab === 'applications' && (
          <div className="c1-card my-applications-card">
            <div className="c1-card-header">
              <div>
                <h3 className="c1-card-title">My Career Applications</h3>
                <p className="c1-card-subtitle">Real-time status tracking, assessment dates, and interview calls</p>
              </div>
              <span className="c1-badge c1-badge-cyan">{applications.length} Active Records</span>
            </div>

            {applications.length > 0 ? (
              <div className="applications-table-wrap">
                <table className="c1-table">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Company & Role</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Next Milestone</th>
                      <th>Submitted Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td><span className="course-code-cell">{app.id}</span></td>
                        <td>
                          <div>
                            <strong style={{ color: 'var(--text-primary)' }}>{app.role}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.company}</div>
                          </div>
                        </td>
                        <td>{app.appliedDate}</td>
                        <td>{getAppStatusBadge(app.status)}</td>
                        <td>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                            {app.nextStep || 'Review Pending'}
                          </span>
                        </td>
                        <td>
                          <span className="resume-tag">
                            <i className="fa-solid fa-file-pdf"></i> {app.resumeName}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="c1-btn c1-btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            onClick={() => setSelectedApplication(app)}
                          >
                            <i className="fa-solid fa-timeline"></i>
                            <span>Track</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-file-circle-check empty-card-icon"></i>
                <h4>No applications submitted yet</h4>
                <p>Browse open job opportunities and apply to kickstart your recruitment process.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-gradient"
                  onClick={() => setActiveTab('jobs')}
                >
                  Explore Jobs
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: CAMPUS PLACEMENT DRIVES
            ============================================================ */}
        {activeTab === 'drives' && (
          <div className="placement-drives-grid">
            {drives.map((drv) => (
              <div key={drv.id} className="c1-card drive-card-item">
                <div className="drive-card-top">
                  <div className="company-logo-badge">
                    {drv.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="course-code-tag">{drv.type}</span>
                    <h3 className="drive-card-title">{drv.title}</h3>
                    <span className="drive-company-name">{drv.company}</span>
                  </div>
                </div>

                <div className="drive-meta-box">
                  <div className="d-meta-item">
                    <i className="fa-regular fa-calendar"></i>
                    <span><strong>{drv.date}</strong> at {drv.time}</span>
                  </div>
                  <div className="d-meta-item">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{drv.venue}</span>
                  </div>
                  <div className="d-meta-item">
                    <i className="fa-solid fa-user-graduate"></i>
                    <span>{drv.eligibility}</span>
                  </div>
                </div>

                <p className="drive-desc">{drv.description}</p>

                <div className="drive-card-actions">
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => setSelectedDrive(drv)}
                  >
                    <i className="fa-solid fa-circle-info"></i>
                    <span>Drive Schedule</span>
                  </button>

                  {drv.isRegistered ? (
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary btn-applied"
                      disabled
                    >
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Registered</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="c1-btn c1-btn-gradient"
                      onClick={() => handleRegisterDrive(drv.id, drv.company)}
                    >
                      <i className="fa-solid fa-id-card"></i>
                      <span>Register for Drive</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================
            TAB 4: UPCOMING INTERVIEWS
            ============================================================ */}
        {activeTab === 'interviews' && (
          <div className="interviews-section-wrap">
            <div className="interviews-grid">
              <div className="c1-card interview-schedule-card">
                <div className="interview-top-row">
                  <span className="c1-badge c1-badge-purple">Technical Round 1</span>
                  <span className="interview-mode-pill online">
                    <i className="fa-solid fa-video"></i> Online Video Assessment
                  </span>
                </div>
                <h3 className="interview-company-title">CloudCore Technologies</h3>
                <p className="interview-role">Graduate Engineer Trainee (Cloud Infrastructure)</p>

                <div className="interview-timings-box">
                  <div className="time-col">
                    <span className="t-lbl">Date</span>
                    <span className="t-val">27 Aug 2026</span>
                  </div>
                  <div className="time-col">
                    <span className="t-lbl">Time Slot</span>
                    <span className="t-val">10:00 AM – 11:00 AM</span>
                  </div>
                  <div className="time-col">
                    <span className="t-lbl">Format</span>
                    <span className="t-val">Live Coding + System Architecture</span>
                  </div>
                </div>

                <div className="interview-instructions">
                  <strong>Instructions:</strong> Keep your institutional ID card ready. Ensure a stable internet connection and webcam for the proctored code pairing environment.
                </div>

                <div className="interview-footer">
                  <span className="interviewer-tag">
                    <i className="fa-solid fa-user-tie"></i> Interviewer: Senior Cloud Architect
                  </span>
                  <span className="c1-badge c1-badge-success">Confirmed</span>
                </div>
              </div>

              <div className="c1-card interview-schedule-card">
                <div className="interview-top-row">
                  <span className="c1-badge c1-badge-cyan">HR & Managerial Discussion</span>
                  <span className="interview-mode-pill onsite">
                    <i className="fa-solid fa-building"></i> Placement Cell Room 3
                  </span>
                </div>
                <h3 className="interview-company-title">TechNova Solutions</h3>
                <p className="interview-role">Software Developer (Full Stack)</p>

                <div className="interview-timings-box">
                  <div className="time-col">
                    <span className="t-lbl">Date</span>
                    <span className="t-val">02 Sep 2026</span>
                  </div>
                  <div className="time-col">
                    <span className="t-lbl">Time Slot</span>
                    <span className="t-val">02:30 PM – 03:15 PM</span>
                  </div>
                  <div className="time-col">
                    <span className="t-lbl">Format</span>
                    <span className="t-val">Behavioral & Cultural Alignment</span>
                  </div>
                </div>

                <div className="interview-instructions">
                  <strong>Instructions:</strong> Bring 2 printed copies of your updated resume and portfolio project documentation.
                </div>

                <div className="interview-footer">
                  <span className="interviewer-tag">
                    <i className="fa-solid fa-user-tie"></i> Interviewer: Lead HR Partner
                  </span>
                  <span className="c1-badge c1-badge-warning">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 5: SAVED JOBS
            ============================================================ */}
        {activeTab === 'saved' && (
          <div className="saved-jobs-view">
            {savedJobIds.length > 0 ? (
              <div className="jobs-cards-grid">
                {jobs.filter((j) => savedJobIds.includes(j.id)).map((job) => (
                  <div key={job.id} className="c1-card job-opportunity-card">
                    <div className="job-card-header">
                      <div className="company-logo-badge">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="job-header-info">
                        <span className="job-company-name">{job.company}</span>
                        <h3 className="job-role-title">{job.title}</h3>
                      </div>
                      <button
                        type="button"
                        className="btn-job-save saved"
                        onClick={(e) => handleToggleSave(job.id, job.title, e)}
                        title="Remove bookmark"
                      >
                        <i className="fa-solid fa-bookmark"></i>
                      </button>
                    </div>

                    <div className="job-tags-row">
                      <span className="job-tag-chip location"><i className="fa-solid fa-location-dot"></i> {job.location}</span>
                      <span className="job-tag-chip package"><i className="fa-solid fa-sack-dollar"></i> {job.packageStr}</span>
                    </div>

                    <p className="job-short-desc">{job.description}</p>

                    <div className="job-card-actions">
                      <button
                        type="button"
                        className="c1-btn c1-btn-secondary"
                        onClick={() => setSelectedJob(job)}
                      >
                        <span>View Details</span>
                      </button>
                      <button
                        type="button"
                        className="c1-btn c1-btn-gradient"
                        onClick={() => setApplyingJob(job)}
                      >
                        <span>Apply Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="c1-card academic-empty-card">
                <i className="fa-solid fa-bookmark empty-card-icon"></i>
                <h4>No saved opportunities</h4>
                <p>Bookmark jobs that interest you to compare requirements and apply later.</p>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setActiveTab('jobs')}
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 6: CAREER RESOURCES
            ============================================================ */}
        {activeTab === 'resources' && (
          <div className="career-resources-grid">
            <div className="c1-card resource-item-card">
              <div className="res-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <i className="fa-solid fa-file-invoice"></i>
              </div>
              <h3>Resume Preparation Guide</h3>
              <p>ATS-friendly templates, action-oriented bullet points, and project formatting best practices for campus hiring.</p>
              <span className="resource-tag">Interactive Checklist</span>
            </div>

            <div className="c1-card resource-item-card">
              <div className="res-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <i className="fa-solid fa-code"></i>
              </div>
              <h3>Data Structures & Algorithms</h3>
              <p>Curated 100+ coding challenge set spanning Arrays, Trees, Graphs, Dynamic Programming, and SQL optimization.</p>
              <span className="resource-tag">Coding Practice</span>
            </div>

            <div className="c1-card resource-item-card">
              <div className="res-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <i className="fa-solid fa-brain"></i>
              </div>
              <h3>Quantitative Aptitude & Logic</h3>
              <p>Timed practice mock tests for speed mathematics, syllogisms, data interpretation, and verbal comprehension.</p>
              <span className="resource-tag">Mock Assessments</span>
            </div>

            <div className="c1-card resource-item-card">
              <div className="res-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <i className="fa-solid fa-comments"></i>
              </div>
              <h3>Technical Interview Playbook</h3>
              <p>Frequently asked architectural questions, mock behavioral scenarios (STAR method), and salary negotiation tips.</p>
              <span className="resource-tag">Interview Prep</span>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 7: PLACEMENT ANALYTICS
            ============================================================ */}
        {activeTab === 'analytics' && (
          <div className="placement-analytics-wrap">
            <div className="c1-card analytics-hero-card">
              <div className="analytics-hero-left">
                <h3 className="analytics-title">Student Recruitment Funnel</h3>
                <p className="analytics-sub">
                  Your candidate application metrics for the 2025–2026 Academic Placement Season.
                </p>

                <div className="funnel-progress-bars">
                  <div className="funnel-bar-row">
                    <div className="f-bar-lbl">
                      <span>Total Applications Submitted</span>
                      <strong>{totalApplications}</strong>
                    </div>
                    <div className="f-track"><div className="f-fill" style={{ width: '100%' }}></div></div>
                  </div>

                  <div className="funnel-bar-row">
                    <div className="f-bar-lbl">
                      <span>Shortlisted for Coding / Rounds</span>
                      <strong>{shortlistedCount}</strong>
                    </div>
                    <div className="f-track"><div className="f-fill" style={{ width: `${(shortlistedCount / totalApplications) * 100}%`, background: '#c084fc' }}></div></div>
                  </div>

                  <div className="funnel-bar-row">
                    <div className="f-bar-lbl">
                      <span>Technical & HR Interviews</span>
                      <strong>{interviewsCount}</strong>
                    </div>
                    <div className="f-track"><div className="f-fill" style={{ width: `${(interviewsCount / totalApplications) * 100}%`, background: '#fbbf24' }}></div></div>
                  </div>

                  <div className="funnel-bar-row">
                    <div className="f-bar-lbl">
                      <span>Official Offers Received</span>
                      <strong>{offersCount}</strong>
                    </div>
                    <div className="f-track"><div className="f-fill" style={{ width: `${(offersCount / totalApplications) * 100}%`, background: '#34d399' }}></div></div>
                  </div>
                </div>
              </div>

              <div className="analytics-hero-right">
                <div className="rate-radial-gauge">
                  <span className="rate-num">{successRate}%</span>
                  <span className="rate-label">SHORTLIST RATE</span>
                </div>
                <p className="rate-desc">
                  Based on <strong>{totalApplications}</strong> submissions, your profile has a high conversion rate in software and cloud domains.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL 1: JOB DETAILS & ELIGIBILITY BREAKDOWN
            ============================================================ */}
        {selectedJob && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedJob(null)}
            title={`${selectedJob.title} — ${selectedJob.company}`}
            maxWidth="lg"
          >
            <div className="job-details-dialog-content">
              {/* Header meta */}
              <div className="job-dialog-header-meta">
                <div className="company-logo-badge large">
                  {selectedJob.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="job-dialog-title">{selectedJob.title}</h2>
                  <div className="job-dialog-company-loc">
                    <strong>{selectedJob.company}</strong> • <i className="fa-solid fa-location-dot"></i> {selectedJob.location} • <span className="package-highlight">{selectedJob.packageStr}</span>
                  </div>
                </div>
              </div>

              {/* Automatic Eligibility Card */}
              {(() => {
                const elig = checkEligibility(selectedJob);
                return (
                  <div className={`c1-card eligibility-result-box ${elig.isEligible ? 'eligible' : 'not-eligible'}`}>
                    <div className="elig-header-row">
                      <div className="elig-title-badge">
                        <i className={`fa-solid ${elig.isEligible ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
                        <span>{elig.isEligible ? 'You are Eligible to Apply' : 'Eligibility Check Required'}</span>
                      </div>
                      <span className="elig-summary-tag">
                        {elig.isEligible ? 'Criteria Met' : 'Review Requirements'}
                      </span>
                    </div>

                    <div className="elig-checklist-grid">
                      <div className="elig-check-item">
                        <i className={`fa-solid ${elig.cgpaEligible ? 'fa-check text-success' : 'fa-xmark text-error'}`}></i>
                        <span>CGPA: Min <strong>{selectedJob.cgpaRequired}</strong> (Your CGPA: <strong>{studentProfile.cgpa}</strong>)</span>
                      </div>
                      <div className="elig-check-item">
                        <i className={`fa-solid ${elig.branchEligible ? 'fa-check text-success' : 'fa-xmark text-error'}`}></i>
                        <span>Branch: <strong>{selectedJob.branchRequired.join(', ')}</strong> (Your Branch: <strong>{studentProfile.branch}</strong>)</span>
                      </div>
                      <div className="elig-check-item">
                        <i className={`fa-solid ${elig.backlogsEligible ? 'fa-check text-success' : 'fa-xmark text-error'}`}></i>
                        <span>Active Backlogs: <strong>0 Required</strong> (Your Backlogs: <strong>0</strong>)</span>
                      </div>
                      <div className="elig-check-item">
                        <i className="fa-solid fa-check text-success"></i>
                        <span>Graduation Year: <strong>2026 Batch</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Job Description */}
              <div className="job-desc-section">
                <h4 className="section-h4">Role Overview</h4>
                <p>{selectedJob.description}</p>
              </div>

              {/* Key Responsibilities */}
              <div className="job-desc-section">
                <h4 className="section-h4">Key Responsibilities</h4>
                <ul className="bullet-list">
                  {selectedJob.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Required Skills & Qualifications */}
              <div className="job-desc-section">
                <h4 className="section-h4">Required Skills & Technologies</h4>
                <div className="job-skills-chips" style={{ marginBottom: '12px' }}>
                  {selectedJob.skills.map((skill) => (
                    <span key={skill} className="skill-chip">{skill}</span>
                  ))}
                </div>
                <ul className="bullet-list">
                  {selectedJob.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="job-desc-section">
                <h4 className="section-h4">Compensation & Benefits</h4>
                <ul className="bullet-list">
                  {selectedJob.benefits.map((ben, idx) => (
                    <li key={idx}>{ben}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </button>
                {isJobApplied(selectedJob.id) ? (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary"
                    onClick={() => {
                      setSelectedJob(null);
                      setActiveTab('applications');
                    }}
                  >
                    <i className="fa-solid fa-check"></i>
                    <span>Already Applied (View Tracker)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => {
                      const job = selectedJob;
                      setSelectedJob(null);
                      setApplyingJob(job);
                    }}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Apply for Position</span>
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 2: APPLY FOR JOB MODAL & RESUME UPLOADER
            ============================================================ */}
        {applyingJob && (
          <Modal
            isOpen={true}
            onClose={() => !isSubmittingApp && setApplyingJob(null)}
            title={`Apply: ${applyingJob.title} at ${applyingJob.company}`}
            maxWidth="md"
          >
            <form onSubmit={handleApplicationSubmit} className="job-application-form">
              {/* Profile Overview */}
              <div className="c1-alert c1-alert-info" role="alert">
                <i className="fa-solid fa-id-card"></i>
                <div style={{ fontSize: '0.8125rem' }}>
                  Applying with verified student identity: <strong>{studentProfile.name}</strong> ({studentProfile.rollNumber} • {studentProfile.branch} • CGPA: {studentProfile.cgpa})
                </div>
              </div>

              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="c1-input"
                    value={appFullName}
                    onChange={(e) => setAppFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    className="c1-input"
                    value={appEmail}
                    onChange={(e) => setAppEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="c1-input"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                  required
                />
              </div>

              {/* Resume File Uploader */}
              <div className="form-field-wrap">
                <label className="form-label">Upload Resume / CV (PDF, DOC, DOCX - Max 5MB)</label>
                <div className="resume-upload-zone">
                  <input
                    type="file"
                    id="resume-file-input"
                    className="file-hidden-input"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeFileSelect}
                  />

                  <div className="upload-zone-content">
                    <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                    <div className="upload-texts">
                      <span className="upload-main-text">
                        {resumeFile ? resumeFile.name : resumeFileName}
                      </span>
                      <span className="upload-sub-text">
                        Click to browse or replace document
                      </span>
                    </div>

                    <label htmlFor="resume-file-input" className="c1-btn c1-btn-secondary btn-browse-file">
                      Browse File
                    </label>
                  </div>

                  {isUploadingResume && (
                    <div className="upload-progress-wrap">
                      <div className="progress-bar-large-track">
                        <div className="progress-bar-large-fill" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="progress-pct">{uploadProgress}% Uploading...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="form-fields-two-col">
                <div className="form-field-wrap">
                  <label className="form-label">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    className="c1-input"
                    value={appLinkedIn}
                    onChange={(e) => setAppLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="form-field-wrap">
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="c1-input"
                    value={appGithub}
                    onChange={(e) => setAppGithub(e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="form-field-wrap">
                <label className="form-label">Portfolio / Project Demo URL (Optional)</label>
                <input
                  type="url"
                  className="c1-input"
                  value={appPortfolio}
                  onChange={(e) => setAppPortfolio(e.target.value)}
                  placeholder="https://portfolio-name.dev"
                />
              </div>

              {/* Cover Letter */}
              <div className="form-field-wrap">
                <label className="form-label">Cover Letter / Personal Statement (Optional)</label>
                <textarea
                  className="c1-textarea"
                  rows={3}
                  placeholder="Summarize your technical experience, relevant projects, and interest in this role..."
                  value={appCoverLetter}
                  onChange={(e) => setAppCoverLetter(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setApplyingJob(null)}
                  disabled={isSubmittingApp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="c1-btn c1-btn-gradient"
                  disabled={isSubmittingApp || isUploadingResume}
                >
                  {isSubmittingApp ? (
                    <>
                      <LoadingSpinner size="sm" color="#ffffff" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ============================================================
            MODAL 3: APPLICATION TRACKING TIMELINE MODAL
            ============================================================ */}
        {selectedApplication && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedApplication(null)}
            title={`Application Tracker: ${selectedApplication.id}`}
            maxWidth="md"
          >
            <div className="app-tracker-dialog-content">
              <div className="tracker-header-box">
                <div>
                  <h3 className="tracker-role">{selectedApplication.role}</h3>
                  <span className="tracker-company">{selectedApplication.company}</span>
                </div>
                {getAppStatusBadge(selectedApplication.status)}
              </div>

              <div className="tracker-meta-grid">
                <div className="t-cell">
                  <span className="t-lbl">Date Applied:</span>
                  <span className="t-val">{selectedApplication.appliedDate}</span>
                </div>
                <div className="t-cell">
                  <span className="t-lbl">Resume File:</span>
                  <span className="t-val">{selectedApplication.resumeName}</span>
                </div>
              </div>

              {/* Stage Progress Timeline */}
              <h4 className="timeline-title">Recruitment Stage History</h4>
              <div className="application-timeline-list">
                {selectedApplication.timeline.map((item, idx) => (
                  <div key={idx} className="timeline-entry-item active">
                    <div className="t-node-marker">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="t-node-body">
                      <span className="t-node-text">{item.statusText}</span>
                      <span className="t-node-time">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close Tracker
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================
            MODAL 4: DRIVE DETAILS MODAL
            ============================================================ */}
        {selectedDrive && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedDrive(null)}
            title={`Recruitment Drive: ${selectedDrive.company}`}
            maxWidth="md"
          >
            <div className="drive-dialog-content">
              <div className="drive-dialog-header">
                <span className="course-code-tag">{selectedDrive.type}</span>
                <h3 className="drive-dialog-title">{selectedDrive.title}</h3>
                <span className="drive-company-name">{selectedDrive.company}</span>
              </div>

              <div className="drive-dialog-info-grid">
                <div className="d-cell">
                  <span className="d-lbl">Date & Time:</span>
                  <span className="d-val">{selectedDrive.date} at {selectedDrive.time}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Campus Venue:</span>
                  <span className="d-val">{selectedDrive.venue}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Eligibility:</span>
                  <span className="d-val">{selectedDrive.eligibility}</span>
                </div>
                <div className="d-cell">
                  <span className="d-lbl">Registration Deadline:</span>
                  <span className="d-val">{selectedDrive.registrationDeadline}</span>
                </div>
              </div>

              <div className="drive-dialog-desc">
                <h4>Drive Overview</h4>
                <p>{selectedDrive.description}</p>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedDrive(null)}
                >
                  Close
                </button>
                {selectedDrive.isRegistered ? (
                  <button
                    type="button"
                    className="c1-btn c1-btn-secondary btn-applied"
                    disabled
                  >
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Already Registered</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => handleRegisterDrive(selectedDrive.id, selectedDrive.company)}
                  >
                    <i className="fa-solid fa-id-card"></i>
                    <span>Confirm Registration</span>
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card">
          <div className="bridge-text">
            <h4>Check Academic Records & Schedule</h4>
            <p>Access your semester grade sheets, results transcript, or exam hall tickets.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/results')}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Results & Grades</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/dashboard')}
            >
              <i className="fa-solid fa-house"></i>
              <span>Student Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPlacements;
