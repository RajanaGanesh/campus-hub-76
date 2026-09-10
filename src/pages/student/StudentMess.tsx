import React, { useState, useMemo } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import {
  mobilityData,
  DayMenu,
  MessFeedback,
  MessRebateRequest,
  DietaryProfile,
  MealAttendanceRecord,
  getMessFeedbacks,
  saveMessFeedbacks,
  getMessRebates,
  saveMessRebates,
  getDietaryProfile,
  saveDietaryProfile,
  getMealAttendance,
  saveMealAttendance
} from '../../data/mobilityData';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';

export const StudentMess: React.FC = () => {
  const { user } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'menu' | 'pass' | 'rebates' | 'feedback' | 'diet'>('menu');

  // Day selector for menu
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Map Sun(0)->6, Mon(1)->0
  const [selectedDay, setSelectedDay] = useState<string>(dayNames[currentDayIndex] || 'Monday');
  const [dietFilter, setDietFilter] = useState<'all' | 'Veg' | 'Non-Veg' | 'Egg' | 'Jain'>('all');

  // Meal Attendance State
  const [mealAttendance, setMealAttendance] = useState<MealAttendanceRecord>(() => {
    try {
      return getMealAttendance();
    } catch {
      return {
        date: new Date().toISOString().split('T')[0],
        breakfast: true,
        lunch: false,
        snacks: false,
        dinner: false
      };
    }
  });

  // Rebates State
  const [rebates, setRebates] = useState<MessRebateRequest[]>(() => {
    try {
      const r = getMessRebates();
      return Array.isArray(r) ? r : [];
    } catch {
      return [];
    }
  });

  const [rebateFilter, setRebateFilter] = useState<'all' | 'Approved' | 'Under Review' | 'Credited'>('all');
  const [isRebateModalOpen, setIsRebateModalOpen] = useState(false);
  const [selectedRebateDetail, setSelectedRebateDetail] = useState<MessRebateRequest | null>(null);

  // New Rebate Form State
  const [rebateStartDate, setRebateStartDate] = useState('');
  const [rebateEndDate, setRebateEndDate] = useState('');
  const [rebateReason, setRebateReason] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Krishna Block');
  const [roomNumber, setRoomNumber] = useState('B-304');

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>(() => {
    try {
      const f = getMessFeedbacks();
      return Array.isArray(f) ? f : [];
    } catch {
      return [];
    }
  });

  const [ratingMeal, setRatingMeal] = useState<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('Lunch');
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingHover, setRatingHover] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Great Taste', 'Hot & Fresh']);
  const [ratingComments, setRatingComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dietary Preferences State
  const [dietProfile, setDietProfile] = useState<DietaryProfile>(() => {
    try {
      return getDietaryProfile() || mobilityData.dietaryProfile;
    } catch {
      return mobilityData.dietaryProfile;
    }
  });

  // Sick Diet Modal
  const [isSickDietModalOpen, setIsSickDietModalOpen] = useState(false);
  const [sickMealChoice, setSickMealChoice] = useState<'Khichdi & Curd' | 'Clear Soup & Toast' | 'Boiled Rice & Dal'>('Khichdi & Curd');
  const [sickRoomDelivery, setSickRoomDelivery] = useState(true);
  const [sickNotes, setSickNotes] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3800);
  };

  // Calculate rebate days & savings on the fly
  const calculatedRebateDays = useMemo(() => {
    if (!rebateStartDate || !rebateEndDate) return 0;
    const start = new Date(rebateStartDate);
    const end = new Date(rebateEndDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [rebateStartDate, rebateEndDate]);

  const calculatedRebateAmount = calculatedRebateDays * 140;

  // Selected Day Menu lookup with defensive fallbacks
  const currentMenu = useMemo<DayMenu>(() => {
    const found = mobilityData.weeklyMenu.find((m) => m && m.day && m.day.toLowerCase() === selectedDay.toLowerCase());
    return found || mobilityData.weeklyMenu[0];
  }, [selectedDay]);

  // Handle Meal Attendance Check-in Simulation
  const handleAvailMeal = (mealKey: 'breakfast' | 'lunch' | 'snacks' | 'dinner', mealTitle: string) => {
    if (mealAttendance[mealKey]) {
      showToast(`${mealTitle} has already been availed for today.`, 'info');
      return;
    }
    const updated = {
      ...mealAttendance,
      [mealKey]: true
    };
    setMealAttendance(updated);
    saveMealAttendance(updated);
    showToast(`Dining Pass validated! Check-in confirmed for ${mealTitle}. Bon Appétit!`, 'success');
  };

  // Submit New Mess Rebate
  const handleSubmitRebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rebateStartDate || !rebateEndDate || !rebateReason.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (calculatedRebateDays < 2) {
      showToast('University policy requires a minimum of 2 consecutive days for mess rebate eligibility.', 'warning');
      return;
    }

    const newReq: MessRebateRequest = {
      id: `MESS-REB-${new Date().getFullYear()}-${100 + rebates.length + 1}`,
      studentName: user?.name || 'Rajana Ganesh',
      studentId: '236F1A0551',
      hostelBlock: hostelBlock,
      roomNumber: roomNumber,
      startDate: rebateStartDate,
      endDate: rebateEndDate,
      daysCount: calculatedRebateDays,
      rebatePerDay: 140,
      totalRebate: calculatedRebateAmount,
      reason: rebateReason,
      status: 'Under Review',
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      remarks: 'Application forwarded to Hostel Warden & Catering Manager for verification.'
    };

    const updated = [newReq, ...rebates];
    setRebates(updated);
    saveMessRebates(updated);

    setIsRebateModalOpen(false);
    setRebateStartDate('');
    setRebateEndDate('');
    setRebateReason('');
    showToast(`Mess rebate claim for ${calculatedRebateDays} days (₹${calculatedRebateAmount}) submitted successfully!`, 'success');
  };

  // Submit Feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingComments.trim() && selectedTags.length === 0) {
      showToast('Please provide a comment or select feedback tags.', 'warning');
      return;
    }

    const newFeedback: MessFeedback = {
      id: `FB-${300 + feedbacks.length + 1}`,
      studentName: isAnonymous ? 'Anonymous Student' : user?.name || 'Rajana Ganesh',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      meal: ratingMeal,
      rating: ratingStars,
      tags: selectedTags,
      comments: ratingComments.trim() || `${ratingStars}-Star rating submitted with tags: ${selectedTags.join(', ')}`,
      response: 'Thank you for your rating! The mess supervisor will review this in daily kitchen audit.',
      isAnonymous
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    saveMessFeedbacks(updated);

    setRatingComments('');
    setSelectedTags(['Great Taste', 'Hot & Fresh']);
    showToast(`Thank you! Your feedback for ${ratingMeal} has been recorded.`, 'success');
  };

  // Toggle feedback tag
  const toggleFeedbackTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Save dietary profile
  const handleSaveDietaryProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveDietaryProfile(dietProfile);
    showToast('Dietary preferences updated successfully!', 'success');
  };

  // Submit Sick Diet Request
  const handleSubmitSickDiet = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: DietaryProfile = {
      ...dietProfile,
      sickDietActive: true,
      sickDietMeal: sickMealChoice,
      sickDietRoomDelivery: sickRoomDelivery,
      sickDietNotes: sickNotes
    };
    setDietProfile(updatedProfile);
    saveDietaryProfile(updatedProfile);
    setIsSickDietModalOpen(false);
    showToast(`Sick Diet request for "${sickMealChoice}" registered. Mess staff notified for room delivery.`, 'success');
  };

  // Cancel sick diet
  const handleCancelSickDiet = () => {
    const updatedProfile: DietaryProfile = {
      ...dietProfile,
      sickDietActive: false
    };
    setDietProfile(updatedProfile);
    saveDietaryProfile(updatedProfile);
    showToast('Sick diet status marked as recovered. Standard dining meal plan resumed.', 'info');
  };

  const getStatusBadge = (status: MessRebateRequest['status']) => {
    switch (status) {
      case 'Credited':
        return <span className="c1-badge c1-badge-success"><i className="fa-solid fa-check-double"></i> Credited</span>;
      case 'Approved':
        return <span className="c1-badge c1-badge-primary"><i className="fa-solid fa-circle-check"></i> Approved</span>;
      case 'Rejected':
        return <span className="c1-badge c1-badge-error"><i className="fa-solid fa-circle-xmark"></i> Rejected</span>;
      case 'Under Review':
      default:
        return <span className="c1-badge c1-badge-warning"><i className="fa-solid fa-clock"></i> Under Review</span>;
    }
  };

  const availableTags = [
    'Great Taste',
    'Hot & Fresh',
    'Adequate Portions',
    'Good Hygiene',
    'Quick Service',
    'Low Spice',
    'Needs More Salt',
    'Slightly Cold',
    'Oil Quantity High'
  ];

  const userInitial = user?.name ? (user.name.split(' ').map((n) => n[0] || '').join('') || 'RG') : 'RG';

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header Row */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Campus Life</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">Mess & Dining Services</span>
            </div>
            <h1 className="module-title">Mess & Dining Services</h1>
            <p className="module-subtitle">
              Live dining schedules, digital QR meal pass, mess rebate claims, dietary management, and meal quality ratings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => setActiveTab('pass')}
            >
              <i className="fa-solid fa-qrcode" style={{ color: 'var(--accent-blue)' }}></i>
              <span>Digital QR Pass</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              onClick={() => setIsRebateModalOpen(true)}
            >
              <i className="fa-solid fa-receipt"></i>
              <span>Apply for Mess Rebate</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Summary Cards */}
        <div className="dashboard-grid-4" style={{ marginBottom: '24px' }}>
          <div className="c1-card stat-summary-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Current Meal Session</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)' }}>
                <i className="fa-solid fa-utensils"></i>
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem' }}>Lunch Session</div>
            <div className="stat-card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="c1-badge c1-badge-success" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '6px' }}></i> Active Now
              </span>
              <span>12:30 PM – 2:00 PM</span>
            </div>
          </div>

          <div className="c1-card stat-summary-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Kaveri Dining Hall</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--color-success)' }}>
                <i className="fa-solid fa-users"></i>
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem' }}>66% Capacity</div>
            <div className="stat-card-subtitle" style={{ color: 'var(--color-success)' }}>
              <i className="fa-solid fa-circle-check"></i> Normal Queue • Ground Floor
            </div>
          </div>

          <div className="c1-card stat-summary-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Today's Meal Check-ins</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
                <i className="fa-solid fa-id-card-clip"></i>
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem' }}>
              {[mealAttendance.breakfast, mealAttendance.lunch, mealAttendance.snacks, mealAttendance.dinner].filter(Boolean).length} / 4 Availed
            </div>
            <div className="stat-card-subtitle">
              <span>Breakfast: Availed • Lunch: Ready</span>
            </div>
          </div>

          <div className="c1-card stat-summary-card">
            <div className="stat-card-header">
              <span className="stat-card-title">Mess Rebate Savings</span>
              <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
                <i className="fa-solid fa-wallet"></i>
              </div>
            </div>
            <div className="stat-card-value" style={{ fontSize: '1.35rem' }}>₹1,120 Credited</div>
            <div className="stat-card-subtitle" style={{ color: 'var(--text-muted)' }}>
              <span>2 Approved Claims • ₹140/day rate</span>
            </div>
          </div>
        </div>

        {/* Sick Diet Alert Banner if Active */}
        {dietProfile.sickDietActive && (
          <div
            className="c1-card"
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-warning)',
                  fontSize: '1.25rem'
                }}
              >
                <i className="fa-solid fa-notes-medical"></i>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  Active Sick Diet Request: {dietProfile.sickDietMeal || 'Khichdi & Curd'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {dietProfile.sickDietRoomDelivery
                    ? 'Hostel room delivery enabled for Krishna Block B-304.'
                    : 'Collection from Special Care counter in Kaveri Hall.'}
                  {dietProfile.sickDietNotes && ` Note: "${dietProfile.sickDietNotes}"`}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleCancelSickDiet}
              style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
            >
              <i className="fa-solid fa-circle-xmark"></i>
              <span>Mark as Recovered</span>
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="tab-navigation-bar" style={{ marginBottom: '24px' }}>
          <button
            type="button"
            className={`tab-item-btn ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <i className="fa-solid fa-calendar-days"></i>
            <span>Weekly Menu & Dining Halls</span>
          </button>
          <button
            type="button"
            className={`tab-item-btn ${activeTab === 'pass' ? 'active' : ''}`}
            onClick={() => setActiveTab('pass')}
          >
            <i className="fa-solid fa-qrcode"></i>
            <span>Digital QR Dining Pass</span>
          </button>
          <button
            type="button"
            className={`tab-item-btn ${activeTab === 'rebates' ? 'active' : ''}`}
            onClick={() => setActiveTab('rebates')}
          >
            <i className="fa-solid fa-receipt"></i>
            <span>Mess Rebates & Leave ({rebates.length})</span>
          </button>
          <button
            type="button"
            className={`tab-item-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
          >
            <i className="fa-solid fa-star-half-stroke"></i>
            <span>Meal Ratings & Feedback</span>
          </button>
          <button
            type="button"
            className={`tab-item-btn ${activeTab === 'diet' ? 'active' : ''}`}
            onClick={() => setActiveTab('diet')}
          >
            <i className="fa-solid fa-leaf"></i>
            <span>Dietary Preferences & Sick Diet</span>
          </button>
        </div>

        {/* TAB 1: WEEKLY MENU & DINING HALLS */}
        {activeTab === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Dining Halls Status Strip */}
            <div className="c1-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-building-columns" style={{ color: 'var(--accent-blue)' }}></i>
                  Live Dining Hall Status & Seating Capacity
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-rotate" style={{ marginRight: '4px' }}></i> Updated 2 mins ago
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {mobilityData.diningHalls.map((hall) => {
                  const percent = Math.round((hall.currentCapacity / (hall.maxCapacity || 1)) * 100);
                  const isHigh = percent > 75;
                  return (
                    <div
                      key={hall.id}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{hall.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hall.location}</div>
                        </div>
                        <span className={`c1-badge ${isHigh ? 'c1-badge-warning' : 'c1-badge-success'}`}>
                          {hall.status}
                        </span>
                      </div>

                      <div style={{ margin: '12px 0 6px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <span>Occupancy ({hall.currentCapacity} / {hall.maxCapacity} Seats)</span>
                          <span style={{ fontWeight: 600, color: isHigh ? 'var(--color-warning)' : 'var(--color-success)' }}>{percent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: isHigh
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : 'linear-gradient(90deg, #22c55e, #38bdf8)',
                              borderRadius: '4px',
                              transition: 'width 0.4s ease'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-hat-chef" style={{ color: 'var(--accent-blue)' }}></i>
                        <span>Lead Chef: {hall.chefToday}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day Selector & Dietary Filter Toolbar */}
            <div
              className="c1-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              {/* Day Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {dayNames.map((day, idx) => {
                  const isToday = idx === currentDayIndex;
                  const isSelected = selectedDay.toLowerCase() === day.toLowerCase();
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: isSelected ? 600 : 500,
                        border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{day}</span>
                      {isToday && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            background: 'var(--color-success)',
                            color: '#fff',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}
                        >
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Diet filter dropdown/pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Filter Diet:</span>
                <select
                  value={dietFilter}
                  onChange={(e) => setDietFilter(e.target.value as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">All Diets (Veg & Non-Veg)</option>
                  <option value="Veg">🌱 Pure Vegetarian</option>
                  <option value="Non-Veg">🍗 Non-Vegetarian Included</option>
                  <option value="Egg">🥚 Eggitarian Options</option>
                </select>
              </div>
            </div>

            {/* 4 Meal Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
              {/* 1. Breakfast */}
              <div className="c1-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.15rem'
                        }}
                      >
                        <i className="fa-solid fa-mug-saucer"></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>Breakfast</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock"></i> {currentMenu?.Breakfast?.timing || '7:30 AM – 9:00 AM'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="c1-badge c1-badge-success">🌱 Veg</span>
                      {currentMenu?.Breakfast?.calories && (
                        <span className="c1-badge c1-badge-primary">~{currentMenu.Breakfast.calories} kcal</span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}
                  >
                    {currentMenu?.Breakfast?.menuItems || 'Idli, Sambar, Coconut Chutney, Tea / Coffee'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Protein: <strong>{currentMenu?.Breakfast?.protein || '12g'}</strong></span>
                    {currentMenu?.Breakfast?.allergens && currentMenu.Breakfast.allergens.length > 0 && (
                      <span style={{ marginLeft: '12px', color: 'var(--color-warning)' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Allergens: {currentMenu.Breakfast.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingMeal('Breakfast');
                      setActiveTab('feedback');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Rate Meal <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>

              {/* 2. Lunch */}
              <div className="c1-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                {currentMenu?.Lunch?.isSpecial && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      color: '#fff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <i className="fa-solid fa-crown"></i> Chef Special
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.15rem'
                        }}
                      >
                        <i className="fa-solid fa-bowl-rice"></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>Lunch Feast</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock"></i> {currentMenu?.Lunch?.timing || '12:30 PM – 2:00 PM'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginRight: currentMenu?.Lunch?.isSpecial ? '100px' : '0' }}>
                      <span className={`c1-badge ${currentMenu?.Lunch?.dietType === 'Non-Veg' ? 'c1-badge-error' : currentMenu?.Lunch?.dietType === 'Egg' ? 'c1-badge-warning' : 'c1-badge-success'}`}>
                        {currentMenu?.Lunch?.dietType === 'Non-Veg' ? '🍗 Non-Veg' : currentMenu?.Lunch?.dietType === 'Egg' ? '🥚 Egg' : '🌱 Veg'}
                      </span>
                      {currentMenu?.Lunch?.calories && (
                        <span className="c1-badge c1-badge-primary">~{currentMenu.Lunch.calories} kcal</span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}
                  >
                    {currentMenu?.Lunch?.menuItems || 'Veg Biryani, Raita, Mixed Veg Curry, Steamed Rice, Sambar'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Protein: <strong>{currentMenu?.Lunch?.protein || '18g'}</strong></span>
                    {currentMenu?.Lunch?.allergens && currentMenu.Lunch.allergens.length > 0 && (
                      <span style={{ marginLeft: '12px', color: 'var(--color-warning)' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Allergens: {currentMenu.Lunch.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingMeal('Lunch');
                      setActiveTab('feedback');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Rate Meal <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>

              {/* 3. High Tea & Snacks */}
              <div className="c1-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: 'var(--accent-purple)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.15rem'
                        }}
                      >
                        <i className="fa-solid fa-cookie-bite"></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>Evening Tea & Snacks</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock"></i> {currentMenu?.Snacks?.timing || '4:30 PM – 5:30 PM'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="c1-badge c1-badge-success">🌱 Veg</span>
                      {currentMenu?.Snacks?.calories && (
                        <span className="c1-badge c1-badge-primary">~{currentMenu.Snacks.calories} kcal</span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}
                  >
                    {currentMenu?.Snacks?.menuItems || 'Hot Crispy Samosa, Mint Chutney, Masala Chai / Milk'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Protein: <strong>{currentMenu?.Snacks?.protein || '6g'}</strong></span>
                    {currentMenu?.Snacks?.allergens && currentMenu.Snacks.allergens.length > 0 && (
                      <span style={{ marginLeft: '12px', color: 'var(--color-warning)' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Allergens: {currentMenu.Snacks.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingMeal('Snacks');
                      setActiveTab('feedback');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Rate Meal <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>

              {/* 4. Dinner */}
              <div className="c1-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                {currentMenu?.Dinner?.isSpecial && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      color: '#fff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    <i className="fa-solid fa-crown"></i> Chef Special
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.15rem'
                        }}
                      >
                        <i className="fa-solid fa-plate-wheat"></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dinner Banquet</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <i className="fa-regular fa-clock"></i> {currentMenu?.Dinner?.timing || '7:30 PM – 9:00 PM'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginRight: currentMenu?.Dinner?.isSpecial ? '100px' : '0' }}>
                      <span className={`c1-badge ${currentMenu?.Dinner?.dietType === 'Non-Veg' ? 'c1-badge-error' : currentMenu?.Dinner?.dietType === 'Egg' ? 'c1-badge-warning' : 'c1-badge-success'}`}>
                        {currentMenu?.Dinner?.dietType === 'Non-Veg' ? '🍗 Non-Veg' : currentMenu?.Dinner?.dietType === 'Egg' ? '🥚 Egg' : '🌱 Veg'}
                      </span>
                      {currentMenu?.Dinner?.calories && (
                        <span className="c1-badge c1-badge-primary">~{currentMenu.Dinner.calories} kcal</span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '16px',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px'
                    }}
                  >
                    {currentMenu?.Dinner?.menuItems || 'Butter Roti, Paneer Butter Masala, Dal Tadka, Rice, Curd'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Protein: <strong>{currentMenu?.Dinner?.protein || '22g'}</strong></span>
                    {currentMenu?.Dinner?.allergens && currentMenu.Dinner.allergens.length > 0 && (
                      <span style={{ marginLeft: '12px', color: 'var(--color-warning)' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i> Allergens: {currentMenu.Dinner.allergens.join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRatingMeal('Dinner');
                      setActiveTab('feedback');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Rate Meal <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL QR DINING PASS & MEAL TRACKER */}
        {activeTab === 'pass' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Digital Pass Card */}
            <div
              className="c1-card"
              style={{
                padding: '28px',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25), transparent)',
                  pointerEvents: 'none'
                }}
              ></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--accent-blue)', fontSize: '1.25rem' }}></i>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', letterSpacing: '0.5px' }}>CAMPUSONE DINING</span>
                </div>
                <span className="c1-badge c1-badge-success" style={{ fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-shield-check"></i> VERIFIED
                </span>
              </div>

              {/* Student Identity Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  {userInitial}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                    {user?.name || 'Rajana Ganesh'}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.7)' }}>ID: 236F1A0551 • B.Tech CSE</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>Hostel: Krishna Block (Room B-304)</div>
                </div>
              </div>

              {/* Dynamic QR Code Simulation Box */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* SVG Simulated Barcode / QR matrix */}
                <div
                  style={{
                    width: '180px',
                    height: '180px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    padding: '8px',
                    background: '#fff',
                    borderRadius: '8px'
                  }}
                >
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: (i * 7) % 3 === 0 || i === 0 || i === 5 || i === 30 || i === 35 ? '#0f172a' : (i % 2 === 0 ? '#334155' : '#e2e8f0'),
                        borderRadius: '2px'
                      }}
                    ></div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', letterSpacing: '1px' }}>
                  TOKEN: 8849-DINING-ACTIVE-PASS
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Refreshes automatically in 30 seconds</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <span>Diet: <strong>{dietProfile.primaryDiet}</strong></span>
                <span>Valid: <strong>30 Jun 2027</strong></span>
              </div>
            </div>

            {/* Right Column: Daily 4-Meal Pass Check-in System */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="c1-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Today's Meal Check-in Status
                  </h3>
                  <span className="c1-badge c1-badge-primary">
                    <i className="fa-solid fa-calendar-check"></i> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  Present this digital QR token at the turnstile barcode scanner at Kaveri or Godavari dining hall entrance.
                  You can also click to simulate check-in below:
                </p>

                {/* 4 Meal Check-in Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Breakfast */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: mealAttendance.breakfast ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: mealAttendance.breakfast ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: mealAttendance.breakfast ? 'var(--color-success)' : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        <i className={`fa-solid ${mealAttendance.breakfast ? 'fa-check' : 'fa-mug-saucer'}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Breakfast Slot</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>07:30 AM – 09:00 AM • Kaveri Hall</div>
                      </div>
                    </div>

                    <div>
                      {mealAttendance.breakfast ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Checked In (08:14 AM)
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          onClick={() => handleAvailMeal('breakfast', 'Breakfast')}
                          style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                        >
                          <i className="fa-solid fa-qrcode"></i> Scan Token
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lunch */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: mealAttendance.lunch ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: mealAttendance.lunch ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: mealAttendance.lunch ? 'var(--color-success)' : 'var(--accent-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        <i className={`fa-solid ${mealAttendance.lunch ? 'fa-check' : 'fa-bowl-rice'}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          Lunch Slot <span className="c1-badge c1-badge-primary" style={{ fontSize: '0.6875rem', marginLeft: '6px' }}>ACTIVE</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12:30 PM – 02:00 PM • Kaveri & Godavari Halls</div>
                      </div>
                    </div>

                    <div>
                      {mealAttendance.lunch ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Checked In
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="c1-btn c1-btn-gradient"
                          onClick={() => handleAvailMeal('lunch', 'Lunch')}
                          style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                        >
                          <i className="fa-solid fa-barcode-read"></i> Avail Lunch
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Snacks */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: mealAttendance.snacks ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: mealAttendance.snacks ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: mealAttendance.snacks ? 'var(--color-success)' : 'var(--accent-purple)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        <i className={`fa-solid ${mealAttendance.snacks ? 'fa-check' : 'fa-cookie-bite'}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Evening Snacks Slot</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>04:30 PM – 05:30 PM • Dining Hall Counters</div>
                      </div>
                    </div>

                    <div>
                      {mealAttendance.snacks ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Checked In
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          onClick={() => handleAvailMeal('snacks', 'Evening Snacks')}
                          style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                        >
                          <i className="fa-solid fa-qrcode"></i> Scan Token
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dinner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'var(--bg-secondary)',
                      border: mealAttendance.dinner ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: mealAttendance.dinner ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                          color: mealAttendance.dinner ? 'var(--color-success)' : 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}
                      >
                        <i className={`fa-solid ${mealAttendance.dinner ? 'fa-check' : 'fa-plate-wheat'}`}></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Dinner Banquet Slot</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>07:30 PM – 09:00 PM • Kaveri & Godavari Halls</div>
                      </div>
                    </div>

                    <div>
                      {mealAttendance.dinner ? (
                        <span className="c1-badge c1-badge-success">
                          <i className="fa-solid fa-circle-check"></i> Checked In
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="c1-btn c1-btn-secondary"
                          onClick={() => handleAvailMeal('dinner', 'Dinner')}
                          style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                        >
                          <i className="fa-solid fa-qrcode"></i> Scan Token
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MESS REBATES & LEAVE SYSTEM */}
        {activeTab === 'rebates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Policy Info Card */}
            <div
              className="c1-card"
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(99, 102, 241, 0.08))',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}></i>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Institutional Mess Rebate & Cut Policy
                  </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, maxWidth: '720px' }}>
                  Hostel residents taking official leave, participating in external university events, or visiting home for <strong>2 or more consecutive days</strong> are entitled to a rebate rate of <strong>₹140.00 per day</strong>. Approved rebates are automatically credited to the following month's mess ledger.
                </p>
              </div>

              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => setIsRebateModalOpen(true)}
              >
                <i className="fa-solid fa-plus"></i>
                <span>Submit Rebate Claim</span>
              </button>
            </div>

            {/* Rebates Filter & List Table */}
            <div className="c1-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--accent-blue)' }}></i>
                  My Rebate Application History ({rebates.length})
                </h3>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['all', 'Approved', 'Credited', 'Under Review'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setRebateFilter(filter)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: rebateFilter === filter ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                        background: rebateFilter === filter ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                        color: rebateFilter === filter ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {filter.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {rebates.filter((r) => rebateFilter === 'all' || r.status === rebateFilter).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block' }}></i>
                  <p>No mess rebate applications found matching this status filter.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="c1-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Application ID</th>
                        <th>Leave Dates</th>
                        <th>Days</th>
                        <th>Rebate Amount</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Submitted On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rebates
                        .filter((r) => rebateFilter === 'all' || r.status === rebateFilter)
                        .map((rebate) => (
                          <tr key={rebate.id}>
                            <td style={{ fontWeight: 600, color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                              {rebate.id}
                            </td>
                            <td>
                              <div style={{ fontWeight: 500 }}>{rebate.startDate} → {rebate.endDate}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rebate.hostelBlock}, {rebate.roomNumber}</span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{rebate.daysCount} Days</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                              ₹{rebate.totalRebate} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(@₹140/d)</span>
                            </td>
                            <td style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rebate.reason}
                            </td>
                            <td>{getStatusBadge(rebate.status)}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{rebate.submittedDate}</td>
                            <td>
                              <button
                                type="button"
                                className="c1-btn c1-btn-secondary"
                                onClick={() => setSelectedRebateDetail(rebate)}
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                <i className="fa-solid fa-eye"></i> View Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MEAL RATINGS & FEEDBACK */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Left Column: Submit Rating Form */}
            <div className="c1-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
                Rate Today's Meal
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '20px' }}>
                Your feedback directly impacts catering vendor quality scores and daily kitchen audits.
              </p>

              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Meal select */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Select Meal Slot
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    {(['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setRatingMeal(meal)}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: ratingMeal === meal ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                          background: ratingMeal === meal ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                          color: ratingMeal === meal ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {meal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5-Star Rating System */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Overall Rating ({ratingStars} / 5 Stars)
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRatingStars(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.75rem',
                          color: (ratingHover || ratingStars) >= star ? '#f59e0b' : 'var(--border-subtle)',
                          transition: 'color 0.15s ease, transform 0.15s ease',
                          transform: (ratingHover || ratingStars) >= star ? 'scale(1.1)' : 'scale(1)'
                        }}
                        aria-label={`Rate ${star} star`}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      {ratingStars === 5 ? 'Exceptional' : ratingStars === 4 ? 'Good' : ratingStars === 3 ? 'Average' : ratingStars === 2 ? 'Needs Work' : 'Poor'}
                    </span>
                  </div>
                </div>

                {/* Feedback Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Feedback Tags (Select all that apply)
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {availableTags.map((tag) => {
                      const isSel = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleFeedbackTag(tag)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            border: isSel ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                            background: isSel ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                            color: isSel ? 'var(--accent-blue)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSel ? '✓ ' : '+ '} {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comments Textarea */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Detailed Comments / Suggestions
                  </label>
                  <textarea
                    value={ratingComments}
                    onChange={(e) => setRatingComments(e.target.value)}
                    placeholder="Provide any specific dish feedback or hygiene observations..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  ></textarea>
                </div>

                {/* Anonymous Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="anonCheck" style={{ cursor: 'pointer' }}>
                    Submit anonymously (Identity hidden from kitchen contractor)
                  </label>
                </div>

                <button type="submit" className="c1-btn c1-btn-gradient" style={{ width: '100%' }}>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Meal Quality Review</span>
                </button>
              </form>
            </div>

            {/* Right Column: Historical Feedback Ledger */}
            <div className="c1-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-comments" style={{ color: 'var(--accent-blue)' }}></i>
                  Mess Committee Audit Ledger ({feedbacks.length})
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Student Feedback Feed</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                          {fb.studentName || 'Student'}
                        </span>
                        <span className="c1-badge c1-badge-primary" style={{ fontSize: '0.6875rem' }}>
                          {fb.meal}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {fb.date}</span>
                      </div>

                      <div style={{ color: '#f59e0b', fontSize: '0.875rem', letterSpacing: '2px' }}>
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '10px' }}>
                      "{fb.comments}"
                    </p>

                    {fb.tags && fb.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {fb.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: '0.6875rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {fb.response && (
                      <div
                        style={{
                          background: 'rgba(56, 189, 248, 0.08)',
                          borderLeft: '3px solid var(--accent-blue)',
                          padding: '8px 12px',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '0.8125rem',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <strong style={{ color: 'var(--accent-blue)', fontSize: '0.75rem', display: 'block' }}>
                          Mess Supervisor Response:
                        </strong>
                        {fb.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIETARY PREFERENCES & SICK DIET */}
        {activeTab === 'diet' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
            {/* Left Card: Dietary Profile Settings */}
            <div className="c1-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-leaf" style={{ color: 'var(--color-success)' }}></i>
                Student Dietary Preference Profile
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '20px' }}>
                Your dietary profile determines menu recommendations, special non-veg token allocations, and kitchen prep.
              </p>

              <form onSubmit={handleSaveDietaryProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Primary Diet Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Primary Dietary Requirement
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { id: 'Pure Vegetarian', icon: '🌱', desc: 'Plant-based with Dairy, no meat or seafood' },
                      { id: 'Non-Vegetarian', icon: '🍗', desc: 'Chicken/Egg included on scheduled dinner days' },
                      { id: 'Eggitarian', icon: '🥚', desc: 'Vegetarian + Eggs permissible' },
                      { id: 'Jain (No Onion/Garlic)', icon: '🌿', desc: 'Prepared strictly without root vegetables, onion or garlic' },
                      { id: 'Vegan', icon: '🥑', desc: '100% Plant based, zero dairy or animal derivatives' }
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: dietProfile.primaryDiet === opt.id ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                          background: dietProfile.primaryDiet === opt.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name="dietRadio"
                          checked={dietProfile.primaryDiet === opt.id}
                          onChange={() => setDietProfile({ ...dietProfile, primaryDiet: opt.id as any })}
                          style={{ cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {opt.icon} {opt.id}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Spice Level */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Spice Preference Level
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['Mild', 'Medium', 'Spicy'] as const).map((spice) => (
                      <button
                        key={spice}
                        type="button"
                        onClick={() => setDietProfile({ ...dietProfile, spiceLevel: spice })}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          border: dietProfile.spiceLevel === spice ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                          background: dietProfile.spiceLevel === spice ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-secondary)',
                          color: dietProfile.spiceLevel === spice ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {spice === 'Mild' ? '🌶️ Mild' : spice === 'Medium' ? '🌶️🌶️ Medium' : '🌶️🌶️🌶️ Spicy'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergies List */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Known Food Allergies & Intolerances
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {['Peanuts', 'Dairy/Lactose', 'Gluten', 'Soy', 'Eggs', 'Mustard'].map((allergy) => {
                      const has = dietProfile.allergies.includes(allergy);
                      return (
                        <label
                          key={allergy}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8125rem',
                            cursor: 'pointer'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={has}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDietProfile({ ...dietProfile, allergies: [...dietProfile.allergies, allergy] });
                              } else {
                                setDietProfile({ ...dietProfile, allergies: dietProfile.allergies.filter((a) => a !== allergy) });
                              }
                            }}
                          />
                          <span>{allergy}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="c1-btn c1-btn-gradient" style={{ marginTop: '8px' }}>
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Dietary Preferences</span>
                </button>
              </form>
            </div>

            {/* Right Card: Sick Diet & Emergency Room Delivery Care */}
            <div className="c1-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: 'var(--color-error)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem'
                    }}
                  >
                    <i className="fa-solid fa-notes-medical"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Special Sick Diet & Room Delivery
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Medical Care & Convalescent Meal Support
                    </span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '20px' }}>
                  If you are feeling unwell, experiencing digestive issues, or recovering in your hostel room, you can request easily digestible bland meals (Moong Dal Khichdi, Clear Soups, Toast) delivered directly to your hostel room.
                </p>

                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '18px',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '20px'
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    Available Convalescent Meals:
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Moong Dal Khichdi & Fresh Curd:</strong> Lightly seasoned with cumin and ghee.</li>
                    <li><strong>Vegetable Clear Soup & Butter Toast:</strong> Steamed seasonal greens and crispy bread.</li>
                    <li><strong>Boiled Basmati Rice & Yellow Dal:</strong> Low oil, easy digestion.</li>
                  </ul>
                </div>

                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    marginBottom: '20px'
                  }}
                >
                  <i className="fa-solid fa-phone-volume" style={{ color: 'var(--accent-blue)', marginRight: '6px' }}></i>
                  Emergency Hostel Mess Hotline: <strong>+91 9440-CAMPUS (Ext: 404)</strong>
                </div>
              </div>

              <div>
                {dietProfile.sickDietActive ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="c1-btn c1-btn-secondary"
                      onClick={handleCancelSickDiet}
                      style={{ flex: 1 }}
                    >
                      <i className="fa-solid fa-circle-check"></i>
                      <span>Mark Fully Recovered</span>
                    </button>
                    <button
                      type="button"
                      className="c1-btn c1-btn-primary"
                      onClick={() => setIsSickDietModalOpen(true)}
                    >
                      <i className="fa-solid fa-pen"></i> Edit Request
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="c1-btn c1-btn-gradient"
                    onClick={() => setIsSickDietModalOpen(true)}
                    style={{ width: '100%' }}
                  >
                    <i className="fa-solid fa-bed-pulse"></i>
                    <span>Request Special Sick Diet / Room Delivery</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: SUBMIT NEW MESS REBATE */}
        <Modal
          isOpen={isRebateModalOpen}
          onClose={() => setIsRebateModalOpen(false)}
          title="Apply for Mess Fee Rebate (Mess Cut)"
          maxWidth="md"
        >
          <form onSubmit={handleSubmitRebate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.8125rem',
                color: 'var(--text-primary)'
              }}
            >
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--accent-blue)', marginRight: '6px' }}></i>
              Minimum 2 consecutive leave days required. Rebate credit is calculated at <strong>₹140 / day</strong>.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Student Name & ID
                </label>
                <input
                  type="text"
                  disabled
                  value={`${user?.name || 'Rajana Ganesh'} (236F1A0551)`}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Hostel Block & Room
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    style={{
                      width: '60%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem'
                    }}
                  />
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    style={{
                      width: '40%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Leave Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={rebateStartDate}
                  onChange={(e) => setRebateStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Leave End Date *
                </label>
                <input
                  type="date"
                  required
                  value={rebateEndDate}
                  onChange={(e) => setRebateEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            {/* Live Rebate Calculation Box */}
            {calculatedRebateDays > 0 && (
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Leave Duration</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>
                    {calculatedRebateDays} Days
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Eligible Rebate (₹140/day)</div>
                  <div style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '1.25rem' }}>
                    ₹{calculatedRebateAmount}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Reason for Leave / Off-Campus Absence *
              </label>
              <textarea
                required
                rows={3}
                value={rebateReason}
                onChange={(e) => setRebateReason(e.target.value)}
                placeholder="e.g., Home visit for family function, attending technical hackathon, medical leave..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setIsRebateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="c1-btn c1-btn-gradient">
                <i className="fa-solid fa-paper-plane"></i>
                <span>Submit Rebate Application</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: SICK DIET REQUEST */}
        <Modal
          isOpen={isSickDietModalOpen}
          onClose={() => setIsSickDietModalOpen(false)}
          title="Special Sick Diet & Room Delivery Request"
          maxWidth="md"
        >
          <form onSubmit={handleSubmitSickDiet} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Choose your convalescent meal preference. The hostel mess will prepare special mild food and deliver it to your room if requested.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Select Convalescent Meal Option
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'Khichdi & Curd', desc: 'Moong dal and rice khichdi with fresh curd. Mild, easy on digestion.' },
                  { id: 'Clear Soup & Toast', desc: 'Warm vegetable broth with toasted butter bread.' },
                  { id: 'Boiled Rice & Dal', desc: 'Steamed plain rice with yellow moong dal (low spice/oil).' }
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: sickMealChoice === item.id ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                      background: sickMealChoice === item.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="sickMealRadio"
                      checked={sickMealChoice === item.id}
                      onChange={() => setSickMealChoice(item.id as any)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{item.id}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <input
                type="checkbox"
                id="sickDeliveryCheck"
                checked={sickRoomDelivery}
                onChange={(e) => setSickRoomDelivery(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="sickDeliveryCheck" style={{ cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <strong>Deliver directly to Hostel Room</strong> ({hostelBlock}, {roomNumber})
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Doctor / Medical Notes or Symptoms (Optional)
              </label>
              <textarea
                rows={2}
                value={sickNotes}
                onChange={(e) => setSickNotes(e.target.value)}
                placeholder="e.g., Doctor advised zero oil, high fever, recovering from viral infection..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="c1-btn c1-btn-secondary"
                onClick={() => setIsSickDietModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="c1-btn c1-btn-gradient">
                <i className="fa-solid fa-notes-medical"></i>
                <span>Confirm Sick Diet Request</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: VIEW REBATE DETAIL / APPROVAL SLIP */}
        <Modal
          isOpen={!!selectedRebateDetail}
          onClose={() => setSelectedRebateDetail(null)}
          title="Mess Rebate Claim Approval Slip"
          maxWidth="md"
        >
          {selectedRebateDetail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>APPLICATION VOUCHER</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'monospace', fontSize: '1rem' }}>
                      {selectedRebateDetail.id}
                    </div>
                  </div>
                  <div>{getStatusBadge(selectedRebateDetail.status)}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.875rem', marginBottom: '16px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Student Identity</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedRebateDetail.studentName}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {selectedRebateDetail.studentId}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Hostel Residency</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedRebateDetail.hostelBlock}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Room: {selectedRebateDetail.roomNumber}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Leave Period</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedRebateDetail.startDate} → {selectedRebateDetail.endDate}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration: {selectedRebateDetail.daysCount} Days</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Rebate Valuation</span>
                    <strong style={{ color: 'var(--color-success)', fontSize: '1.125rem' }}>₹{selectedRebateDetail.totalRebate}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>@ ₹140.00 / day rate</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Official Remarks & Audit Log</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '4px' }}>
                    {selectedRebateDetail.remarks || 'Under administrative review by Hostel Warden.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="c1-btn c1-btn-secondary"
                  onClick={() => setSelectedRebateDetail(null)}
                >
                  Close Slip
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Toast Component */}
        <Toast
          message={toastMsg?.message || null}
          type={toastMsg?.type || 'info'}
          onClose={() => setToastMsg(null)}
        />
      </div>
    </AppLayout>
  );
};

export default StudentMess;
