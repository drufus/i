/**
 * Utility to handle ResizeObserver errors by preventing them from being logged
 * These errors are non-critical and only occur in development
 */
export function setupResizeObserverErrorHandler() {
  const errorHandler = (e: ErrorEvent) => {
    // Suppress specific ResizeObserver errors
    if (
      e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded'
    ) {
      e.stopImmediatePropagation();
    }
  };

  // Add error handler
  window.addEventListener('error', errorHandler);

  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason?.message?.includes('ResizeObserver')) {
      e.preventDefault();
    }
  });

  // Return cleanup function
  return () => {
    window.removeEventListener('error', errorHandler);
  };
}