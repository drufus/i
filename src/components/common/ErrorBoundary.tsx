import React from 'react';
import { AppError } from '../../lib/errors';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to error reporting service
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (error) {
      if (Fallback) {
        return <Fallback error={error} resetErrorBoundary={this.resetErrorBoundary} />;
      }

      return <DefaultErrorFallback error={error} resetErrorBoundary={this.resetErrorBoundary} />;
    }

    return children;
  }
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isAppError = error instanceof AppError;
  const errorCode = isAppError ? error.code : 'UNKNOWN_ERROR';
  const errorMessage = error.message || 'An unexpected error occurred';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="h-12 w-12 mx-auto text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <p className="text-xs text-gray-500">Error Code: {errorCode}</p>
              <pre className="mt-2 text-left text-xs bg-gray-100 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={resetErrorBoundary}>Try Again</Button>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
}

// Specialized error boundaries for different contexts
export function AsyncBoundary({ 
  children,
  onError,
  onReset,
  pendingFallback
}: ErrorBoundaryProps & { pendingFallback?: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={onError}
      onReset={onReset}
      fallback={({ error, resetErrorBoundary }) => (
        <AsyncErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          pendingFallback={pendingFallback}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

function AsyncErrorFallback({ 
  error, 
  resetErrorBoundary,
  pendingFallback
}: FallbackProps & { pendingFallback?: React.ReactNode }) {
  const [isPending, setPending] = React.useState(false);

  const handleReset = async () => {
    setPending(true);
    try {
      await resetErrorBoundary();
    } finally {
      setPending(false);
    }
  };

  if (isPending) {
    return pendingFallback || <DefaultErrorFallback error={error} resetErrorBoundary={handleReset} />;
  }

  return <DefaultErrorFallback error={error} resetErrorBoundary={handleReset} />;
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}