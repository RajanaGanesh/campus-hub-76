import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { InputField } from '../components/InputField';
import { PasswordField } from '../components/PasswordField';
import { AuthAlert } from '../components/AuthAlert';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { Illustration } from '../components/Illustration';
import { Toast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field-level inline errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Top banner auth error (only displayed on failed login attempt)
  const [authError, setAuthError] = useState<string | null>(null);

  // Submission & interactive feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [isCollegeIdModalOpen, setIsCollegeIdModalOpen] = useState(false);

  // Redirect if already logged in
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
    setEmailError('');
    setPasswordError('');
    setAuthError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const res = await login(email, password, rememberMe);

      if (res.success && res.profile) {
        showToast(`Welcome back, ${res.profile.name}!`, 'success');
        const fromPath = (location.state as any)?.from?.pathname;
        if (fromPath && fromPath !== '/login') {
          navigate(fromPath, { replace: true });
        } else {
          navigate(`/${res.profile.role}/dashboard`, { replace: true });
        }
      } else {
        setAuthError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setEmailError('');
    setPasswordError('');
    setAuthError(null);
  };

  return (
    <div className="login-page">
      {/* ================================================================
          LEFT PANEL - BRANDING & HERO INTRODUCTION
          ================================================================ */}
      <div className="login-left">
        <div className="login-left-header">
          <Logo size="md" />
        </div>

        <div className="login-hero-text">
          <h1>
            Everything Your Campus<br />
            Needs,<br />
            In One Place.
          </h1>
          <p>
            Connect with academics, placements, campus services, events and student resources through one intelligent platform.
          </p>
        </div>

        <div className="login-illustration-container">
          <Illustration />
        </div>

        <div className="login-left-footer">
          <div className="feature-pill">
            <i className="fa-solid fa-circle-check"></i>
            <span>Intelligent ERP & LMS</span>
          </div>
          <div className="feature-pill">
            <i className="fa-solid fa-circle-check"></i>
            <span>Placements & Careers</span>
          </div>
          <div className="feature-pill">
            <i className="fa-solid fa-circle-check"></i>
            <span>Campus Mobility & Services</span>
          </div>
        </div>
      </div>

      {/* ================================================================
          RIGHT PANEL - AUTHENTICATION FORM CARD
          ================================================================ */}
      <div className="login-right">
        <div className="login-card">
          {/* Mobile-only logo */}
          <div className="login-mobile-header">
            <Logo size="md" />
          </div>

          {/* Conditional Error Notification Area (Only displayed when login fails) */}
          <AuthAlert
            message={authError}
            onDismiss={() => setAuthError(null)}
          />

          {/* Main Credentials Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email Address"
              type="email"
              id="login-email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <PasswordField
              label="Password"
              id="login-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <div className="form-options">
              <label className="checkbox-container" htmlFor="login-remember">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-signin"
              disabled={isSubmitting}
              id="btn-signin-submit"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="#ffffff" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="auth-divider">OR</div>

          {/* Alternative SSO Methods */}
          <div className="sso-buttons">
            <SocialLoginButton
              provider="google"
              onClick={() => {
                showToast('Google Workspace SSO is in development mode. Please use demo credentials.', 'warning');
              }}
            />

            <SocialLoginButton
              provider="college-id"
              onClick={() => setIsCollegeIdModalOpen(true)}
            />
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="demo-credentials-card">
            <div className="demo-credentials-title">
              <span>Quick Test Credentials (Step 2 Roles)</span>
              <i className="fa-solid fa-key"></i>
            </div>
            <div className="demo-chips-grid">
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount('student@campushub.com', 'student123')}
              >
                Student
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount('faculty@campushub.com', 'faculty123')}
              >
                Faculty
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount('admin@campushub.com', 'admin123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => fillDemoAccount('parent@campushub.com', 'parent123')}
              >
                Parent
              </button>
            </div>
          </div>

          {/* Footer Legal Links */}
          <div className="legal-footer">
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                showToast('CampusOne Institutional Terms of Service.', 'info');
              }}
            >
              Terms & Conditions
            </a>
            <span>•</span>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                showToast('CampusOne Data Security & Privacy Policy.', 'info');
              }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* College ID Dialog Modal */}
      <Modal
        isOpen={isCollegeIdModalOpen}
        onClose={() => setIsCollegeIdModalOpen(false)}
        title="College Smart ID Authentication"
        maxWidth="sm"
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#6366f1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '16px'
          }}>
            <i className="fa-solid fa-id-card-clip"></i>
          </div>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#ffffff' }}>Tap or Select Campus ID</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '20px' }}>
            Institutional Single Sign-On via Campus Smart Card is active in development mode. Select a test profile:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="c1-btn c1-btn-gradient"
              style={{ width: '100%' }}
              onClick={() => {
                setIsCollegeIdModalOpen(false);
                fillDemoAccount('student@campushub.com', 'student123');
                showToast('Filled student credentials for quick evaluation.', 'success');
              }}
            >
              Use Student ID (Aditya Sharma)
            </button>
            <button
              type="button"
              className="c1-btn c1-btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                setIsCollegeIdModalOpen(false);
                fillDemoAccount('faculty@campushub.com', 'faculty123');
                showToast('Filled faculty credentials for quick evaluation.', 'success');
              }}
            >
              Use Faculty ID (Dr. S. Kumar)
            </button>
          </div>
        </div>
      </Modal>

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
