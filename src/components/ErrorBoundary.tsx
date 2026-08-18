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
            backgroundColor: '#060713',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '16px',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                marginBottom: '20px'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '24px' }}>
              An unexpected error occurred while rendering this page. Our technical team has been notified. You can safely return to your dashboard.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
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
