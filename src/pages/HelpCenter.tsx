import React, { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

export const HelpCenter: React.FC = () => {

  const faqs: FAQItem[] = [
    {
      q: 'How do I submit an academic assignment?',
      a: 'Navigate to the Academic -> Assignments page from the sidebar navigation. Locate the assignment card in your dashboard, click "Upload File" or submit answers, and click confirm. The status will update to "Submitted".',
      category: 'Academic'
    },
    {
      q: 'How do I apply for hostel outstation leave?',
      a: 'Go to the Campus Life -> Hostel page. Under the "Hostel Services" section, click on the "Hostel Leave Request" card. Fill in leaving and return dates, destinations, emergency contacts, and click submit. You can check approvals on the Hostel Requests timeline.',
      category: 'Hostel'
    },
    {
      q: 'How do I check my placement job eligibility?',
      a: 'Go to the Placements portal from the sidebar. Locate any open job card and click "View Details". On the job details screen, click the "Check Eligibility" button. The system evaluates your CGPA, backlogs, and department criteria to show results.',
      category: 'Placements'
    },
    {
      q: 'How do I view and download my transport pass?',
      a: 'Navigate to the Campus Life -> Transport page. Under the left column, locate the "Digital Pass" section and click "View Transport Pass". A premium transit pass will pop up displaying your active QR code and validity. Click "Download Pass" to save.',
      category: 'Transport'
    },
    {
      q: 'How do I pay my tuition or hostel fees online?',
      a: 'Navigate to the Services -> Fees & Payments page. Locate your outstanding billing statement, select payment method (Credit card, Net banking, UPI), enter details, and confirm. Dues will update to paid instantly.',
      category: 'Fees'
    },
    {
      q: 'How do I borrow or renew library books?',
      a: 'Open the Services -> Library Catalog page. Search for textbooks by name, author, or publisher. Click "Request Issue" to borrow. Issued books appear in your borrowed listing with renewal limits and return alerts.',
      category: 'Library'
    }
  ];

  // Active expanded questions state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggleFAQ = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Campus Help Center</h1>
        <p>Get answers to frequently asked questions about academics, boarding lodging, payments, and digital services.</p>
      </div>

      {/* FAQs lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              className="card-panel"
              style={{ padding: '16px 20px', cursor: 'pointer', border: isExpanded ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', transition: 'border-color 0.2s' }}
              onClick={() => handleToggleFAQ(idx)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="subject-att-status info" style={{ fontSize: '8px', padding: '2px 6px' }}>{faq.category}</span>
                  <strong style={{ color: 'white', fontSize: '13.5px' }}>{faq.q}</strong>
                </div>
                <i className={`fa-solid ${isExpanded ? 'fa-angle-up' : 'fa-angle-down'}`} style={{ color: 'var(--text-secondary)' }}></i>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', animation: 'fadeIn 0.2s' }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default HelpCenter;
