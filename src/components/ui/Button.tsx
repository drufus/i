import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 text-sm font-medium rounded-md transition-colors';
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  };

  return (
    <button
      disabled={loading || disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}