import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { InputField } from '../components/InputField';
import { PasswordField } from '../components/PasswordField';
import { AuthAlert } from '../components/AuthAlert';
import { SocialLoginButton } from '../components/SocialLoginButton';
import { Illustration } from '../components/Illustration';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field Errors (Inline)
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Main Alert Error (Card Top)
  const [authError, setAuthError] = useState<string | null>(null);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const demoAccounts = [
    { email: 'student@campushub.com', password: 'student123', role: 'student' as const, name: 'Aditya Sharma' },
    { email: 'faculty@campushub.com', password: 'faculty123', role: 'faculty' as const, name: 'Dr. S. Kumar' },
    { email: 'admin@campushub.com', password: 'admin123', role: 'admin' as const, name: 'Administrator' },
    { email: 'parent@campushub.com', password: 'parent123', role: 'parent' as const, name: 'Parent User' }
  ];

  const handleValidation = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError(null);

    if (!email) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setIsSubmitting(true);

    // Simulate Network Request
    setTimeout(() => {
      const matched = demoAccounts.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );

      setIsSubmitting(false);

      if (matched) {
        login(matched.email, matched.role, matched.name);
        if (matched.role === 'student') {
          navigate('/dashboard');
        } else {
          navigate(`/${matched.role}`);
        }
      } else {
        setAuthError('Invalid email or password.');
      }
    }, 1200);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  return (
    <div className="login-page">
      {/* LEFT COLUMN (Visual illustration) */}
      <div className="login-left">
        <div className="login-left-header">
          <Logo />
          <h2>Campus Hub</h2>
        </div>

        <div className="login-hero-text">
          <h1>Everything Your Campus<br />Needs,<br />In One Place.</h1>
          <p>
            Connect with academics, placements, campus services, events, and student resources through one intelligent platform.
          </p>
        </div>

        <div className="login-illustration-container">
          <Illustration />
        </div>

        <div className="login-features-row">
          <span className="feature-tag">
            <i className="fa-solid fa-circle-check"></i> Academic Management
          </span>
          <span className="feature-tag">
            <i className="fa-solid fa-circle-check"></i> Placement Services
          </span>
          <span className="feature-tag">
            <i className="fa-solid fa-circle-check"></i> Campus Services
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN (Credentials Authentication Form) */}
      <div className="login-right">
        <div className="login-card">
          {/* Shown on mobile only */}
          <div className="login-right-logo">
            <Logo />
            <h2>Campus Hub</h2>
          </div>

          <div className="login-welcome-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your Campus Hub account.</p>
          </div>

          <AuthAlert message={authError} />

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <InputField
              label="Email Address"
              type="email"
              id="login-email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              disabled={isSubmitting}
              autoComplete="email"
            />

            <PasswordField
              label="Password"
              id="login-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              disabled={isSubmitting}
              autoComplete="current-password"
            />

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a
                href="#"
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  triggerToast('Password reset link has been dispatched to your email.');
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn-signin" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span>Signing in...</span>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="auth-divider">OR</div>

          <div className="sso-buttons">
            <SocialLoginButton
              provider="google"
              onClick={() => triggerToast('Google SSO Authentication is simulated for this demo.')}
            />
            <SocialLoginButton
              provider="college-id"
              onClick={() => triggerToast('College ID Smart Login is simulated for this demo.')}
            />
          </div>

          <div className="login-card-footer">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                triggerToast('Student registration requires physical validation at the Registrar desk.');
              }}
            >
              Create Account
            </a>
          </div>

          <div className="legal-footer">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                triggerToast('Loading Campus Hub Terms & Conditions document...');
              }}
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                triggerToast('Loading Campus Hub Privacy Policy document...');
              }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="toast-msg">
          <i className="fa-solid fa-circle-info"></i>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
