import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Insights: React.FC = () => {
  const navigate = useNavigate();

  const insightsList = [
    {
      category: 'Attendance Analysis',
      icon: 'fa-user-check',
      color: '#ffb236',
      status: '86% Overall Attendance',
      trend: 'Database Management is lowest at 72%',
      recommendation: 'Your attendance in Database Management (CSE-302) is below the recommended 75% threshold. We recommend attending the next 3 consecutive lectures to restore status.',
      actionLabel: 'Check Attendance Logs',
      actionPath: '/attendance'
    },
    {
      category: 'Assignments Tracker',
      icon: 'fa-file-invoice',
      color: '#ffb236',
      status: '2 Pending Assignments',
      trend: 'Binary Tree due in 9 days',
      recommendation: 'You have 2 pending assignments due this week. Prioritize "Binary Tree Implementation" (Data Structures) to avoid late penalties.',
      actionLabel: 'View Pending Tasks',
      actionPath: '/assignments'
    },
    {
      category: 'Academic Performance',
      icon: 'fa-award',
      color: '#00d89a',
      status: '8.60 CGPA Score',
      trend: 'Midterm 1: A/A+ Average',
      recommendation: 'Excellent academic progress. You ranked in the top 10% of CSE Section A in Midterm 1. Continue with the current study flow.',
      actionLabel: 'Review Grade Reports',
      actionPath: '/results'
    },
    {
      category: 'Career & Recruitment',
      icon: 'fa-briefcase',
      color: '#00d89a',
      status: '5 Eligible Job Drives',
      trend: 'TechNova hiring Developer role',
      recommendation: 'Your profile matches eligibility for 5 open recruiting companies. We recommend applying for TechNova Software Developer before the 22nd Aug deadline.',
      actionLabel: 'Open Placements Portal',
      actionPath: '/placements'
    },
    {
      category: 'Financial Dues',
      icon: 'fa-wallet',
      color: 'var(--color-error)',
      status: '₹65,000 Pending Balance',
      trend: 'Due Date: 24th Aug 2026',
      recommendation: 'The fee collection deadline is approaching. Ensure payment of the pending ₹65,000 before 24th Aug to prevent automated library access suspension.',
      actionLabel: 'Pay Outstanding Fees',
      actionPath: '/fees'
    },
    {
      category: 'Transit & Accommodation',
      icon: 'fa-hotel',
      color: 'var(--accent-highlight)',
      status: 'Room B-204 • Route 12',
      trend: 'Morning Bus at 08:05 AM',
      recommendation: 'Your digital transport pass is Active and Route 12 is On Time. Hostel Request HOSTEL-REQ-1001 was resolved today.',
      actionLabel: 'Manage Campus Mobility',
      actionPath: '/mobility'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Your Campus Insights</h1>
        <p>Personalized academic analysis and AI recommended actions based on your campus logs.</p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {insightsList.map((ins, idx) => (
          <div
            key={idx}
            className="card-panel"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '22px', borderLeft: `4px solid ${ins.color}` }}
          >
            <div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '14px' }}>
                  <i className={`fa-solid ${ins.icon}`}></i>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>{ins.category}</span>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>{ins.status}</h3>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Trend Status: <strong style={{ color: 'white' }}>{ins.trend}</strong>
              </div>

              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, marginBottom: '20px' }}>
                {ins.recommendation}
              </p>
            </div>

            <button
              type="button"
              className="btn-signin"
              style={{ width: '100%', height: '36px', margin: 0, fontSize: '12.5px' }}
              onClick={() => navigate(ins.actionPath)}
            >
              {ins.actionLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Insights;
