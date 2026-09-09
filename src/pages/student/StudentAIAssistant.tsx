import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../../components/AppLayout';
import { detectIntentAndRespond, ChatMessage } from '../../services/assistantService';
import { Toast } from '../../components/Toast';
import { useEffectiveUserProfile } from '../../utils/userProfile';

const STORAGE_KEY = 'campushub_chat_history_student';

export const StudentAIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveProfile = useEffectiveUserProfile();
  const userRole = effectiveProfile.role || 'student';
  const studentName = effectiveProfile.name;

  // Load chat messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}

    // Default welcome messages
    return [
      {
        id: 'msg-init-1',
        sender: 'ai',
        text: `Hello ${studentName}! 👋\n\nI am your **CampusOne AI Intelligence Copilot**.\n\nI can instantly look up your attendance percentages, class schedules, exam hall tickets, fee ledger, placement drives, and study materials. How can I assist you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastIntent, setLastIntent] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Handle location state initialPrompt if passed from dashboard
  useEffect(() => {
    const initialPrompt = (location.state as any)?.initialPrompt;
    if (initialPrompt && typeof initialPrompt === 'string') {
      handleSendMessage(initialPrompt);
    }
  }, [location.state]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate natural AI thinking latency
    setTimeout(() => {
      const aiResult = detectIntentAndRespond(query, userRole, lastIntent);

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiResult.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: aiResult.actionButton
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLastIntent(aiResult.intent);
      setIsTyping(false);
    }, 600);
  };

  const handleClearChat = () => {
    const initial: ChatMessage[] = [
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'ai',
        text: `Conversation cleared. How can I help you today, ${studentName}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    setLastIntent(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch {}
    showToast('Conversation cleared.', 'info');
  };

  // Speech Recognition
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      showToast('Listening... Speak your query now.', 'info');
    };

    recognition.onresult = (event: any) => {
      const voiceText = event.results[0][0].transcript;
      setIsListening(false);
      handleSendMessage(voiceText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast('Voice recognition failed or was cancelled.', 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickChips = [
    { label: '📊 My Attendance', query: 'What is my current attendance percentage?' },
    { label: '📝 Pending Assignments', query: 'Show my pending assignments and deadlines' },
    { label: '📅 Upcoming Exams', query: 'When are my semester examinations scheduled?' },
    { label: '💳 Fee Balance', query: 'What is my tuition fee status and due amount?' },
    { label: '🚌 Bus Routes & Pass', query: 'What is my assigned transport route and bus timing?' },
    { label: '💼 Placement Drives', query: 'What placement opportunities am I eligible for?' },
    { label: '📚 Library Books', query: 'What books do I currently have issued from the library?' }
  ];

  return (
    <AppLayout>
      <div className="academic-module-page">
        {/* Module Header Row */}
        <div className="module-header-row">
          <div>
            <div className="module-breadcrumbs">
              <span>Intelligence</span>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">CampusOne AI Assistant</span>
            </div>
            <h1 className="module-title">CampusOne Intelligence & AI Copilot</h1>
            <p className="module-subtitle">
              Intelligent conversational AI for academic queries, class timetable lookups, hall ticket statuses, and campus service guidance.
            </p>
          </div>

          <div className="module-header-meta">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={handleClearChat}
              title="Reset conversation"
            >
              <i className="fa-solid fa-arrow-rotate-left"></i>
              <span>Clear Chat</span>
            </button>
            <button
              type="button"
              className={`c1-btn ${isListening ? 'c1-btn-gradient' : 'c1-btn-secondary'}`}
              onClick={handleVoiceInput}
              style={{ minWidth: '130px' }}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
              <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '14px',
          marginBottom: '18px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}
              onClick={() => handleSendMessage(chip.query)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* 2-Column AI Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          
          {/* Main Chat Panel */}
          <div className="c1-card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '620px',
            overflow: 'hidden',
            padding: 0,
            position: 'relative'
          }}>
            {/* Chat Messages Stream */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    maxWidth: '85%',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                  }}>
                    {/* Avatar Badge */}
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #6C4BFF 0%, #06B6D4 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      {msg.sender === 'user' ? (
                        studentName.slice(0, 2).toUpperCase()
                      ) : (
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div style={{
                      padding: '14px 18px',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender === 'user' ? 'var(--gradient-primary)' : 'var(--bg-hover)',
                      color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                      fontSize: '13.5px',
                      lineHeight: '1.55',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(108, 75, 255, 0.25)' : 'none'
                    }}>
                      {msg.text}

                      {/* Action Button Navigation Trigger */}
                      {msg.actionButton && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px' }}>
                          <button
                            type="button"
                            className="c1-btn c1-btn-gradient"
                            style={{
                              fontSize: '12px',
                              padding: '6px 14px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                            onClick={() => navigate(msg.actionButton!.path)}
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                            <span>{msg.actionButton.label}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '0 44px' }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6C4BFF 0%, #06B6D4 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>CampusOne AI is typing...</span>
                    <i className="fa-solid fa-ellipsis fa-fade" style={{ color: 'var(--accent-primary)' }}></i>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              <input
                ref={inputRef}
                type="text"
                className="c1-input"
                placeholder="Ask CampusOne AI anything (e.g., 'What is my attendance?' or 'When is my next bus?')..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                style={{ flex: 1, padding: '12px 16px', fontSize: '14px' }}
              />

              <button
                type="button"
                className="c1-btn c1-btn-gradient"
                onClick={() => handleSendMessage()}
                disabled={isTyping || !inputValue.trim()}
                style={{ padding: '12px 20px', fontSize: '14px', flexShrink: 0 }}
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI Context & Capabilities Info Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Scholar Context Card */}
            <div className="c1-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--gradient-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                  {studentName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                    {studentName}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Active Scholar Session
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Roll Number:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>236F1A0551</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>Computer Science</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current CGPA:</span>
                  <strong style={{ color: '#10b981' }}>9.24 / 10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance:</span>
                  <strong style={{ color: '#0284c7' }}>92.4%</strong>
                </div>
              </div>
            </div>

            {/* AI Engine Specs Card */}
            <div className="c1-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-microchip" style={{ color: 'var(--accent-primary)' }}></i>
                CampusOne Copilot Engine
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', margin: '0 0 12px 0' }}>
                Natural Language Understanding trained on the institutional database, course syllabus, and fee ledger.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Live Database Synchronization</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Voice Speech Dictation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Deep Link Routing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notification Container */}
        {toastMsg && (
          <Toast
            message={toastMsg.message}
            type={toastMsg.type}
            onClose={() => setToastMsg(null)}
          />
        )}

        {/* Academic Quick Route Bridge Footer */}
        <div className="module-footer-bridge c1-card" style={{ marginTop: '24px' }}>
          <div className="bridge-text">
            <h4>Quick Academic Destinations</h4>
            <p>Directly access your timetable, LMS course notes, or fee transaction ledger.</p>
          </div>
          <div className="bridge-actions">
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/timetable')}
            >
              <i className="fa-solid fa-calendar-days"></i>
              <span>Class Timetable</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/lms')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>LMS Learning</span>
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              onClick={() => navigate('/student/fees')}
            >
              <i className="fa-solid fa-wallet"></i>
              <span>Fees Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentAIAssistant;
