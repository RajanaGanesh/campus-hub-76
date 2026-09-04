import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { PasswordField } from '../components/PasswordField';
import { Alert } from '../components/Alert';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmError('');
    setGeneralError(null);

    let isValid = true;

    if (!password) {
      setPasswordError('Please enter your new password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const res = await resetPassword(password);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setGeneralError(res.error || 'Failed to reset password. The link may be expired.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative'
      }}
    >
      <div
        className="c1-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo size="md" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Set New Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Create a secure password with at least 6 characters for your CampusOne account.
          </p>
        </div>

        {generalError && (
          <Alert type="error" onDismiss={() => setGeneralError(null)}>
            {generalError}
          </Alert>
        )}

        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <Alert type="success">
              Password has been successfully updated! Redirecting to Sign In...
            </Alert>
            <Link
              to="/login"
              className="c1-btn c1-btn-gradient"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <PasswordField
              label="New Password"
              id="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              disabled={isSubmitting}
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirm New Password"
              id="confirm-password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError('');
              }}
              error={confirmError}
              disabled={isSubmitting}
              autoComplete="new-password"
            />

            <button
              type="submit"
              className="btn-signin"
              disabled={isSubmitting}
              style={{ marginTop: '6px' }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="#ffffff" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none'
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span>Cancel and Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
