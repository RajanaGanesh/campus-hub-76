import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/Toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading } = useAuth();

  // Form state fields (defaults to 'student' to avoid blocking email login)
  const [loginType, setLoginType] = useState<string>('student');
  const [userCode, setUserCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Field validation error states
  const [loginTypeError, setLoginTypeError] = useState<string>('');
  const [userCodeError, setUserCodeError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Submission & feedback states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);

  // Clear fields on mount to prevent browser cached/autofilled credentials from appearing
  useEffect(() => {
    setUserCode('');
    setPassword('');
    const timer = setTimeout(() => {
      setUserCode('');
      setPassword('');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && fromPath !== '/login') {
        navigate(fromPath, { replace: true });
      } else {
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate, location.state]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setLoginTypeError('');
    setUserCodeError('');
    setPasswordError('');
    setAuthError(null);

    const trimmedCode = userCode.trim();
    if (!trimmedCode) {
      setUserCodeError('Please enter your name, roll number, mobile, or email.');
      isValid = false;
    }

    if (!loginType && !trimmedCode.includes('@')) {
      setLoginTypeError('Please select your log-in type.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setAuthError(null);

    const enteredIdentifier = userCode.trim();

    try {
      const res = await login(enteredIdentifier, password, rememberMe, loginType);

      if (res.success && res.profile) {
        showToast(`Welcome back, ${res.profile.name}!`, 'success');
        const fromPath = (location.state as any)?.from?.pathname;
        if (fromPath && fromPath !== '/login') {
          navigate(fromPath, { replace: true });
        } else {
          navigate(`/${res.profile.role}/dashboard`, { replace: true });
        }
      } else {
        setAuthError(res.error || 'Invalid User Code or Password for selected role.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication service error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cms-login-page">
      {/* ====================================================================
          LEFT HERO PANEL: CAMPUS ARCHITECTURE & PURPLE GRADIENT
          ==================================================================== */}
      <div className="cms-hero-section">
        {/* Campus Architecture Photography Backdrop */}
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1800&auto=format&fit=crop"
          alt="College Campus Architecture"
          className="cms-hero-backdrop"
        />

        {/* Purple / Violet Atmospheric Gradient Overlay */}
        <div className="cms-hero-overlay"></div>
        <div className="cms-hero-lighting"></div>

        {/* Hero Branding Lockup */}
        <div className="cms-hero-content">
          <span className="cms-inst-name">YOUR COLLEGE OR INSTITUTE NAME</span>

          {/* Background Watermark Repetition */}
          <div className="cms-watermark-bg" aria-hidden="true">
            College Management System
          </div>

          <div className="cms-welcome-lockup">
            <div className="cms-vertical-bar"></div>
            <div className="cms-welcome-text-group">
              <h1 className="cms-welcome-title">WELCOME</h1>
              <span className="cms-to-subtitle">To</span>
              <div className="cms-system-title-row">
                <span className="cms-logo-badge">CMS</span>
                <span className="cms-system-name">College Management System</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          RIGHT AUTHENTICATION PANEL: "Get Into CMS"
          ==================================================================== */}
      <div className="cms-form-section">
        <div className="cms-form-container">

          {/* Error Banner */}
          {authError && (
            <div className="cms-alert-banner">
              <span>{authError}</span>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                aria-label="Dismiss error"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Authentication Form */}
          <form className="cms-auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
            {/* 1. Select Log-In Type */}
            <div className={`cms-field-group ${loginTypeError ? 'has-error' : ''}`}>
              <label htmlFor="cms-login-type" className="cms-field-label">
                Select Log-In Type
              </label>
              <div className="cms-select-wrapper">
                <select
                  id="cms-login-type"
                  name="cms_auth_role"
                  className="cms-select-input"
                  value={loginType}
                  onChange={(e) => {
                    setLoginType(e.target.value);
                    if (loginTypeError) setLoginTypeError('');
                  }}
                  disabled={isSubmitting}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Teacher</option>
                  <option value="admin">Administrator</option>
                </select>
                <i className="fa-solid fa-chevron-down cms-select-arrow"></i>
              </div>
              {loginTypeError && (
                <span className="cms-field-error-text">{loginTypeError}</span>
              )}
            </div>

            {/* 2. User Code */}
            <div className={`cms-field-group ${userCodeError ? 'has-error' : ''}`}>
              <label htmlFor="cms-user-code" className="cms-field-label">
                User Code / Student Name / Email
              </label>
              <div className="cms-input-wrapper">
                <input
                  id="cms-user-code"
                  name="cms_auth_identifier"
                  type="text"
                  className="cms-text-input"
                  placeholder="Enter Student Name, Roll No, or Email"
                  value={userCode}
                  onChange={(e) => {
                    setUserCode(e.target.value);
                    if (userCodeError) setUserCodeError('');
                  }}
                  disabled={isSubmitting}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              {userCodeError && (
                <span className="cms-field-error-text">{userCodeError}</span>
              )}
            </div>

            {/* 3. Password */}
            <div className={`cms-field-group ${passwordError ? 'has-error' : ''}`}>
              <label htmlFor="cms-password" className="cms-field-label">
                Password
              </label>
              <div className="cms-input-wrapper">
                <input
                  id="cms-password"
                  name="cms_auth_secret"
                  type={showPassword ? 'text' : 'password'}
                  className="cms-text-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="cms-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                </button>
              </div>
              {passwordError && (
                <span className="cms-field-error-text">{passwordError}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="cms-form-options">
              <label className="cms-checkbox-label" htmlFor="cms-remember">
                <input
                  type="checkbox"
                  id="cms-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="cms-forgot-link">
                Forgot password?
              </Link>
            </div>

            {/* Log-in Pill Button */}
            <button
              type="submit"
              className="cms-btn-submit"
              disabled={isSubmitting}
              id="cms-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="cms-spinner"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Log-in</span>
              )}
            </button>
          </form>

          <div className="cms-form-footer">
            <span>© {new Date().getFullYear()} College Management System • Institutional Access</span>
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
    </div>
  );
};

export default Login;
