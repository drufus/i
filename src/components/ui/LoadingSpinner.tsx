import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  className?: string;
  label?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  showLabel?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  color = 'primary',
  className = '',
  label = 'Loading...',
  fullscreen = false,
  overlay = false,
  showLabel = false
}: LoadingSpinnerProps) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  const variants = {
    spinner: (
      <Loader2 
        className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
        aria-hidden="true"
      />
    ),
    dots: (
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`${sizes[size]} rounded-full ${colors[color]} animate-pulse`}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    ),
    pulse: (
      <div 
        className={`${sizes[size]} rounded-full ${colors[color]} animate-pulse ${className}`}
      />
    )
  };

  const content = (
    <div className={`flex items-center gap-3 ${showLabel ? 'flex-col' : ''}`}>
      {variants[variant]}
      {showLabel && (
        <span className={`text-sm ${colors[color]}`}>{label}</span>
      )}
      {!showLabel && label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );

  if (fullscreen || overlay) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          overlay ? 'bg-black bg-opacity-50' : ''
        }`}
      >
        {content}
      </div>
    );
  }

  return content;
}

// Convenience components for common use cases
export function FullscreenLoading(props: Omit<LoadingSpinnerProps, 'fullscreen'>) {
  return <LoadingSpinner {...props} fullscreen />;
}

export function OverlayLoading(props: Omit<LoadingSpinnerProps, 'overlay'>) {
  return <LoadingSpinner {...props} overlay />;
}

export function TableRowLoading({ cols = 1, ...props }: LoadingSpinnerProps & { cols?: number }) {
  return (
    <tr>
      <td 
        colSpan={cols}
        className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500"
      >
        <LoadingSpinner {...props} size="sm" />
      </td>
    </tr>
  );
}

export function CardLoading(props: LoadingSpinnerProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 flex items-center justify-center">
      <LoadingSpinner {...props} />
    </div>
  );
}

export function ButtonLoading(props: LoadingSpinnerProps) {
  return <LoadingSpinner {...props} size="sm" showLabel={false} />;
}