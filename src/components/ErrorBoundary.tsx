import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Campus Hub:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '20px'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>
              An unexpected error occurred while rendering this page. Our technical team has been notified. You can safely return to your dashboard.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--gradient-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                boxShadow: 'var(--glow-primary)'
              }}
            >
              <i className="fa-solid fa-rotate-right" style={{ marginRight: '8px' }}></i>
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
