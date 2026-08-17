import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel, NotificationItem } from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import { detectIntentAndRespond, ChatMessage } from '../services/assistantService';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'student';

  // Persistence of sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('campushub_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sliding AI companion panel state
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [panelInput, setPanelInput] = useState('');
  const [panelMessages, setPanelMessages] = useState<ChatMessage[]>([]);
  const [panelLastIntent, setPanelLastIntent] = useState<string | null>(null);

  // Demo Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      category: 'academic',
      title: 'Attendance Alert',
      desc: 'Your attendance in Data Structures is below 75%.',
      time: '10m ago',
      unread: true
    },
    {
      id: 2,
      category: 'academic',
      title: 'Assignment Due',
      desc: 'Database Management assignment is due tomorrow.',
      time: '2h ago',
      unread: true
    },
    {
      id: 3,
      category: 'academic',
      title: 'Exam Reminder',
      desc: 'Your Computer Networks examination is approaching.',
      time: '1d ago',
      unread: true
    },
    {
      id: 4,
      category: 'placement',
      title: 'Placement Update',
      desc: 'A new placement opportunity is available at Microsoft.',
      time: '2d ago',
      unread: true
    }
  ]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      const nextVal = !isCollapsed;
      setIsCollapsed(nextVal);
      localStorage.setItem('campushub_sidebar_collapsed', String(nextVal));
    }
  };

  // Close dropdowns on page body click
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
    };

    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSendPanelMessage = () => {
    if (!panelInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `panel-msg-${Date.now()}-user`,
      sender: 'user',
      text: panelInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPanelMessages((prev) => [...prev, userMsg]);
    setPanelInput('');

    setTimeout(() => {
      const aiResult = detectIntentAndRespond(panelInput, userRole, panelLastIntent);

      const aiMsg: ChatMessage = {
        id: `panel-msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResult.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: aiResult.actionButton
      };

      setPanelMessages((prev) => [...prev, aiMsg]);
      setPanelLastIntent(aiResult.intent);
    }, 700);
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="app-layout">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="main-content">
        <TopNavbar
          onSidebarToggle={toggleSidebar}
          onSearchOpen={() => setIsSearchOpen(true)}
          unreadNotifCount={unreadNotifCount}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
        />

        <main className="page-container">{children}</main>
      </div>

      {/* Dropdown Notification panel placement */}
      {isNotificationsOpen && (
        <div style={{ position: 'fixed', top: '70px', right: '100px', zIndex: 1000 }} onClick={(e) => e.stopPropagation()}>
          <NotificationPanel
            isOpen={isNotificationsOpen}
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>
      )}

      {/* Command Search Window Popup */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Floating AI companion bubble */}
      <button
        type="button"
        title="Ask Campus AI"
        onClick={(e) => {
          e.stopPropagation();
          setIsAiPanelOpen(!isAiPanelOpen);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-highlight))',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 15px rgba(124,92,255,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          zIndex: 9999,
          transition: 'transform 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className="fa-solid fa-wand-magic-sparkles"></i>
      </button>

      {/* Sliding Right AI Panel */}
      {isAiPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '380px',
            maxWidth: '100vw',
            background: '#100f2e',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-4px 0 25px rgba(0,0,0,0.4)',
            zIndex: 100000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(124,92,255,0.1), rgba(0,216,154,0.02))' }}>
            <div>
              <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-highlight)' }}></i>
                Campus AI Companion
              </h3>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Active Demo Mode</span>
            </div>
            <button
              type="button"
              className="btn-search-close"
              onClick={() => setIsAiPanelOpen(false)}
              style={{ background: 'rgba(255,255,255,0.03)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Chat feeds stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {panelMessages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '14px', color: 'var(--text-secondary)', padding: '20px' }}>
                <i className="fa-solid fa-comments" style={{ fontSize: '24px', opacity: 0.2 }}></i>
                <p style={{ fontSize: '12px', lineHeight: '1.4' }}>Ask me anything about attendance, assignments, schedules, jobs, or hostel rooms!</p>
              </div>
            ) : (
              panelMessages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start', width: '100%' }}>
                  <div style={{
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.02)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    borderRadius: msg.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    color: 'white',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}
                    {msg.actionButton && (
                      <button
                        type="button"
                        className="btn-signin"
                        style={{ height: '28px', margin: 0, marginTop: '8px', fontSize: '10.5px', width: 'auto', padding: '0 10px' }}
                        onClick={() => {
                          setIsAiPanelOpen(false);
                          window.location.href = msg.actionButton!.path;
                        }}
                      >
                        {msg.actionButton.label}
                      </button>
                    )}
                  </div>
                  <span style={{ fontSize: '9px', color: '#555365', marginTop: '3px', padding: '0 2px' }}>{msg.timestamp}</span>
                </div>
              ))
            )}
          </div>

          {/* Footer input */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Type your question..."
              value={panelInput}
              onChange={(e) => setPanelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendPanelMessage();
              }}
              style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '8px 14px', color: 'white', fontSize: '12.5px', outline: 'none' }}
            />
            <button
              type="button"
              onClick={handleSendPanelMessage}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppLayout;
