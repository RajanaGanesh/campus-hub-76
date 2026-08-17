import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { detectIntentAndRespond, ChatMessage } from '../services/assistantService';

export const CampusAI: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(`campushub_chat_history_${userRole}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      localStorage.setItem(`campushub_chat_history_${userRole}`, JSON.stringify(messages));
    }
  }, [messages, userRole]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulate AI thinking typing latency
    setTimeout(() => {
      const aiResult = detectIntentAndRespond(text, userRole, lastIntent);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResult.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: aiResult.actionButton
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLastIntent(aiResult.intent);
    }, 800);
  };

  const handleClearChat = () => {
    setMessages([]);
    setLastIntent(null);
    localStorage.removeItem(`campushub_chat_history_${userRole}`);
    setToastMsg('Chat history cleared.');
    setTimeout(() => setToastMsg(null), 2000);
  };

  // Voice Speech recognition setup
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToastMsg('Voice input is not available in this browser.');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const voiceText = event.results[0][0].transcript;
      setInputValue(voiceText);
      setIsListening(false);
      handleSendMessage(voiceText);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setToastMsg('Speech recognition error. Please try again.');
      setTimeout(() => setToastMsg(null), 2500);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const suggestions = [
    'What is my attendance?',
    'Show my pending assignments.',
    'When is my next exam?',
    'What jobs am I eligible for?',
    'When is my next bus?',
    'Show my hostel requests.',
    'Show my fee status.',
    'Find books in the library.'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '450px', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1>Campus AI</h1>
            <span style={{ fontSize: '9px', background: 'rgba(124,92,255,0.08)', color: 'var(--accent-highlight)', border: '1px solid rgba(124,92,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
              DEMO MODE
            </span>
          </div>
          <p>Your intelligent campus companion</p>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            className="btn-retry-err"
            onClick={handleClearChat}
            style={{ width: 'auto', padding: '0 12px', height: '32px', margin: 0, background: 'rgba(217, 83, 79, 0.05)', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
          >
            <i className="fa-solid fa-trash-can" style={{ marginRight: '6px' }}></i> Clear Chat
          </button>
        )}
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-info"></i>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Chat Space */}
      <div className="card-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {/* Messages list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '20px', padding: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124,92,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '28px' }}>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'white' }}>Welcome to Campus AI</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', marginTop: '6px', lineHeight: '1.5' }}>
                  Your intelligent assistant for academics, campus services and career support.
                </p>
              </div>

              {/* Suggestions */}
              {userRole === 'student' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '500px', justifyContent: 'center', marginTop: '10px' }}>
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      className="btn-sso"
                      onClick={() => handleSendMessage(sug)}
                      style={{ fontSize: '11.5px', padding: '6px 12px', margin: 0, height: 'auto', background: 'rgba(255,255,255,0.01)', borderColor: 'var(--border-color)', borderRadius: '6px' }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%',
                  animation: 'fadeInUp 0.3s ease-out'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.text}

                  {msg.actionButton && (
                    <button
                      type="button"
                      className="btn-signin"
                      style={{ height: '30px', margin: 0, marginTop: '12px', fontSize: '11px', width: 'auto', padding: '0 14px' }}
                      onClick={() => navigate(msg.actionButton!.path)}
                    >
                      {msg.actionButton.label}
                    </button>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: '#555365', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp} {msg.sender === 'ai' ? '• Campus AI' : ''}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input panel */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleVoiceInput}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: isListening ? 'var(--color-error)' : 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              color: isListening ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          </button>

          <input
            type="text"
            placeholder={isListening ? 'Listening voice input...' : 'Ask Campus AI about attendance, assignments, exams...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputValue);
            }}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '10px 18px',
              fontSize: '13px',
              color: 'white',
              outline: 'none'
            }}
          />

          <button
            type="button"
            onClick={() => handleSendMessage(inputValue)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px'
            }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
export default CampusAI;
