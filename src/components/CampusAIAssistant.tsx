import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  detectIntentAndRespond,
  getQuickPromptsForRole,
  ChatMessage,
  QuickPrompt
} from '../services/assistantService';

export const CampusAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts: QuickPrompt[] = getQuickPromptsForRole(userRole);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello ${user?.name || ''}! I'm your CampusOne Assistant.\n\nI can help you find information about your campus, academics, attendance, assignments, examinations, fee receipts, library books, placements, and notices.`,
          timestamp: 'Just now'
        }
      ]);
    }
  }, [isOpen, messages.length, user?.name]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { response, intent, actionButton } = detectIntentAndRespond(text, userRole, lastIntent);
      setLastIntent(intent);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `Conversation cleared. How can I help you today, ${user?.name || 'there'}?`,
        timestamp: 'Just now'
      }
    ]);
    setLastIntent(null);
  };

  const handleActionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Floating Trigger Button (NxtWave Purple Floating Chat FAB) */}
      {!isOpen && (
        <button
          type="button"
          className="campus-ai-fab-btn"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 998,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.45), 0 2px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            outline: 'none'
          }}
          aria-label="Open Campus AI Chat"
          title="CampusOne AI Chatbot"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
      )}

      {/* Slide-in Assistant Panel */}
      {isOpen && (
        <div
          className="campus-ai-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '600px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--gradient-logo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '1rem',
                  boxShadow: 'var(--glow-primary)'
                }}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>CampusOne Assistant</h3>
                <span style={{ fontSize: '0.6875rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
                  Online • {userRole.toUpperCase()} MODE
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem'
                }}
                title="Clear conversation"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                title="Close assistant"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Quick Action Prompt Chips */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-primary)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.query)}
                style={{
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '0.84375rem',
                    lineHeight: 1.5,
                    border: m.sender === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                    boxShadow: 'var(--shadow-card)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {m.text}

                  {m.actionButton && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.actionButton!.path)}
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--accent-secondary)',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        color: 'var(--accent-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{m.actionButton.label}</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.6875rem' }}></i>
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ color: 'var(--accent-blue)' }}></i>
                <span>CampusOne Assistant is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="c1-input"
              placeholder="Ask anything about your campus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                fontSize: '0.8125rem',
                padding: '10px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: 'none',
                background: input.trim() ? 'var(--gradient-primary)' : 'var(--bg-input)',
                color: input.trim() ? '#ffffff' : 'var(--text-muted)',
                cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                transition: 'all 0.15s ease'
              }}
            >
              <i className="fa-solid fa-arrow-up"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CampusAIAssistant;
