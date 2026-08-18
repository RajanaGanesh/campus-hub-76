import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AIAssistantPreview: React.FC = () => {
  const navigate = useNavigate();

  const prompts = [
    "What's my overall attendance status?",
    "What exams are coming up this week?",
    "Which assignments are due next?"
  ];

  const handlePromptClick = (promptText: string) => {
    navigate('/student/ai-assistant', { state: { initialPrompt: promptText } });
  };

  return (
    <div className="c1-card ai-assistant-preview-card">
      <div className="ai-card-glow-bg"></div>

      <div className="ai-card-header">
        <div className="ai-badge-icon">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <div>
          <h3 className="c1-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>CampusOne Assistant</span>
            <span className="c1-badge c1-badge-purple" style={{ fontSize: '0.6875rem' }}>AI Preview</span>
          </h3>
          <p className="c1-card-subtitle">Intelligent campus search & schedule helper</p>
        </div>
      </div>

      <p className="ai-description-text">
        Ask natural questions about your timetable, attendance criteria, fee dues, or placement eligibilities.
      </p>

      <div className="ai-prompts-stack">
        <span className="ai-prompts-label">Suggested Questions:</span>
        {prompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="ai-prompt-chip"
            onClick={() => handlePromptClick(p)}
          >
            <i className="fa-regular fa-comment-dots"></i>
            <span>"{p}"</span>
            <i className="fa-solid fa-arrow-right prompt-arrow"></i>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="c1-btn c1-btn-gradient btn-ask-ai"
        onClick={() => navigate('/student/ai-assistant')}
      >
        <i className="fa-solid fa-sparkles"></i>
        <span>Ask CampusOne Assistant</span>
      </button>
    </div>
  );
};
