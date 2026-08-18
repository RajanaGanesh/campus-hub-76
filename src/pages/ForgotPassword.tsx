import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import { InputField } from '../components/InputField';
import { Alert } from '../components/Alert';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ForgotPassword: React.FC = () => {
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendPasswordReset(trimmedEmail);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setGeneralError(res.error || 'Unable to process reset request. Please try again.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'A network error occurred.');
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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
            Reset your password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Enter your institutional email address and we'll dispatch password recovery instructions to your inbox.
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
              If an account exists for <strong>{email}</strong>, password reset instructions have been sent.
            </Alert>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Please check your spam or institutional inbox if you don't receive an email within a few minutes.
            </p>
            <Link
              to="/login"
              className="c1-btn c1-btn-gradient"
              style={{ width: '100%', textDecoration: 'none' }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <InputField
              label="Institutional Email Address"
              type="email"
              id="reset-email"
              placeholder="user@campushub.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
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
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
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
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
