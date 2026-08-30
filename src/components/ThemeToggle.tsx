import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'dropdown', className = '' }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Light', icon: 'fa-sun' },
    { mode: 'dark', label: 'Dark', icon: 'fa-moon' },
    { mode: 'system', label: 'System', icon: 'fa-desktop' }
  ];

  const getCurrentIcon = () => {
    if (theme === 'system') return 'fa-desktop';
    return theme === 'dark' ? 'fa-moon' : 'fa-sun';
  };

  // Segmented control variant (useful for settings page or mobile menus)
  if (variant === 'segmented') {
    return (
      <div
        className={`theme-segmented-control ${className}`}
        role="group"
        aria-label="Theme selector"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          gap: '2px'
        }}
      >
        {options.map((opt) => {
          const isActive = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setTheme(opt.mode)}
              className={`theme-segment-btn ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <i className={`fa-solid ${opt.icon}`} style={{ fontSize: '0.8125rem', color: isActive ? 'var(--accent-primary)' : 'inherit' }}></i>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact one-click toggle (cycles through light -> dark -> system)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        className={`btn-nav-action ${className}`}
        onClick={() => {
          if (theme === 'light') setTheme('dark');
          else if (theme === 'dark') setTheme('system');
          else setTheme('light');
        }}
        title={`Theme: ${theme.toUpperCase()} (${resolvedTheme} active). Click to cycle.`}
        aria-label="Toggle color theme"
      >
        <i className={`fa-solid ${getCurrentIcon()}`} style={{ color: resolvedTheme === 'dark' ? '#fbbf24' : '#6366f1' }}></i>
      </button>
    );
  }

  // Dropdown variant (Default for TopNavbar)
  return (
    <div className={`theme-dropdown-container ${className}`} ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn-nav-action theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        aria-expanded={isOpen}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <i
          className={`fa-solid ${getCurrentIcon()}`}
          style={{
            color: resolvedTheme === 'dark' ? '#fbbf24' : 'var(--accent-primary)',
            fontSize: '1rem',
            transition: 'transform 0.2s ease'
          }}
        ></i>
      </button>

      {isOpen && (
        <div
          className="theme-dropdown-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '150px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: '6px',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'dropdownAnim 0.2s ease forwards'
          }}
        >
          <div
            style={{
              padding: '6px 10px 4px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Appearance
          </div>

          {options.map((opt) => {
            const isSelected = theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className={`fa-solid ${opt.icon}`} style={{ width: '14px', textAlign: 'center' }}></i>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
