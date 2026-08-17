import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PrepTopic {
  id: string;
  title: string;
  progress: number;
  icon: string;
  resources: string[];
  questions: { q: string; a: string }[];
}

export const PlacementPrep: React.FC = () => {
  const navigate = useNavigate();

  // Selected Prep Topic for Practice modal
  const [selectedTopic, setSelectedTopic] = useState<PrepTopic | null>(null);
  
  // Show answer toggle state
  const [showAnswerIdx, setShowAnswerIdx] = useState<number | null>(null);

  const prepTopicsList: PrepTopic[] = [
    {
      id: 'aptitude',
      title: 'Quantitative & Logical Aptitude',
      progress: 65,
      icon: 'fa-calculator',
      resources: ['R.S. Aggarwal Quantitative Aptitude Guide', 'Indiabix online aptitude practice sets', 'Campus Hub weekly mocks sheet'],
      questions: [
        { q: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?', a: 'Length = Speed * Time. Convert speed to m/s: 60 * (5/18) = 16.67 m/s. Length = 16.67 * 9 = 150 meters.' },
        { q: 'Pointing to a photograph, a man said, "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph was it?', a: 'My father\'s son is "me" (since I have no brother or sister). So, the photograph is of "my son".' }
      ]
    },
    {
      id: 'dsa',
      title: 'Data Structures & Trees',
      progress: 80,
      icon: 'fa-network-wired',
      resources: ['GeeksforGeeks DSA Self-Paced course', 'LeetCode Top Interview 150 questions', 'Campus Hub binary trees handouts'],
      questions: [
        { q: 'What is the worst-case time complexity of lookup in a Binary Search Tree (BST)?', a: 'In the worst case (skewed tree), lookup takes O(N) where N is the number of nodes. In a balanced BST, lookup takes O(log N).' },
        { q: 'Explain the difference between a stack and a queue.', a: 'A stack follows Last-In-First-Out (LIFO) model where elements are pushed and popped from the same end. A queue follows First-In-First-Out (FIFO) model where elements are inserted at the rear and removed from the front.' }
      ]
    },
    {
      id: 'algos',
      title: 'Sorting & Algorithms',
      progress: 70,
      icon: 'fa-code-branch',
      resources: ['Introduction to Algorithms (CLRS)', 'LeetCode recursion patterns guide', 'Visualgo algorithm sorting animations'],
      questions: [
        { q: 'Which sorting algorithm is typically used in JavaScript\'s Array.prototype.sort()?', a: 'V8 uses Timsort (a hybrid of Merge Sort and Insertion Sort) for object arrays and stable sorting.' },
        { q: 'What is dynamic programming (DP) and when is it used?', a: 'DP is an algorithmic technique that solves complex problems by breaking them into overlapping subproblems, solving each subproblem once, and storing their solutions (memoization) to avoid redundant computations.' }
      ]
    },
    {
      id: 'tech-interview',
      title: 'Technical Interview Prep',
      progress: 50,
      icon: 'fa-comments',
      resources: ['Cracking the Coding Interview book', 'System Design Primer GitHub notes', 'Mock whiteboard sessions video playlist'],
      questions: [
        { q: 'What is the purpose of Virtual DOM in React?', a: 'The Virtual DOM is a lightweight representation of the real DOM in memory. When a component state changes, React updates the Virtual DOM first, runs a diffing algorithm (reconciliation) to find what changed, and updates only the modified nodes in the real DOM to optimize performance.' },
        { q: 'What is normalization in SQL databases?', a: 'Normalization is the process of organizing database tables to minimize redundancy and dependency. It involves dividing large tables into smaller ones and defining relationships between them (1NF, 2NF, 3NF, BCNF).' }
      ]
    },
    {
      id: 'hr-interview',
      title: 'HR & Behavior Round',
      progress: 90,
      icon: 'fa-user-check',
      resources: ['STAR interview method worksheets', 'Common HR questions answers guides', 'Mock video answers checklist'],
      questions: [
        { q: 'Tell me about yourself.', a: 'Use the Present-Past-Future model. Summarize your current studies and achievements, highlight key past projects or internships, and explain why you are excited about the target role and company.' },
        { q: 'What are your strengths and weaknesses?', a: 'Focus on strengths that align with the job (e.g. self-motivated learner). For weaknesses, name a real but minor professional skill you have actively improved (e.g. public speaking confidence by hosting mock talks).' }
      ]
    }
  ];

  const handleOpenPractice = (topic: PrepTopic) => {
    setSelectedTopic(topic);
    setShowAnswerIdx(null);
  };

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
          <i className="fa-solid fa-arrow-left"></i> Placements Center
        </button>
        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Careers / Interview Prep</span>
      </div>

      <div className="dashboard-header">
        <h1>Interview Preparation</h1>
        <p>Practice aptitude, code structures, and review mock technical interview answers.</p>
      </div>

      {/* Topics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {prepTopicsList.map((topic) => (
          <div key={topic.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(124,92,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '16px' }}>
                  <i className={`fa-solid ${topic.icon}`}></i>
                </div>
                <span className="subject-att-status safe" style={{ fontSize: '10px' }}>{topic.progress}% Progress</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>{topic.title}</h3>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden', margin: '10px 0' }}>
                <div style={{ width: `${topic.progress}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }} />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                <strong>Key Resources:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {topic.resources.slice(0, 2).map((res, idx) => (
                    <li key={idx}>{res}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              className="btn-signin"
              style={{ marginTop: '20px', height: '36px', fontSize: '12.5px', marginInline: 0 }}
              onClick={() => handleOpenPractice(topic)}
            >
              Start Practice
            </button>
          </div>
        ))}
      </div>

      {/* Practice Modal Overlay */}
      {selectedTopic && (
        <div className="search-modal-overlay" onClick={() => setSelectedTopic(null)}>
          <div className="search-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header" style={{ justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--accent-highlight)', display: 'block', textTransform: 'uppercase' }}>PRACTICE PORTAL</span>
                <h2 style={{ fontSize: '16.5px', marginTop: '2px' }}>{selectedTopic.title}</h2>
              </div>
              <button type="button" className="btn-search-close" onClick={() => setSelectedTopic(null)}>
                <i className="fa-solid fa-xmark" style={{ fontSize: '14px' }}></i>
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '70vh' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Practice Questions</h4>
                
                {selectedTopic.questions.map((q, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                      Q{idx + 1}: {q.q}
                    </div>
                    {showAnswerIdx === idx ? (
                      <div style={{ fontSize: '12.5px', color: '#00d89a', background: 'rgba(0,216,154,0.02)', borderLeft: '3px solid #00d89a', padding: '10px', borderRadius: '4px', lineHeight: '1.5' }}>
                        <strong>Solution:</strong> {q.a}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-retry-err"
                        style={{ margin: 0, width: '120px', height: '28px', fontSize: '11px', padding: 0 }}
                        onClick={() => setShowAnswerIdx(idx)}
                      >
                        Reveal Solution
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '13.5px', color: 'white', fontWeight: '700' }}>Preparation Resources</h4>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {selectedTopic.resources.map((res, idx) => (
                    <li key={idx}>{res}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlacementPrep;
