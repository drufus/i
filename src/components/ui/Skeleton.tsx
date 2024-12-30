import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'avatar' | 'button' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  repeat?: number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  repeat = 1
}: SkeletonProps) {
  const baseStyles = 'bg-gray-200 rounded';
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'avatar':
        return 'rounded-full w-10 h-10';
      case 'button':
        return 'rounded-md h-9';
      case 'card':
        return 'rounded-lg';
      default:
        return 'rounded';
    }
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined)
  };

  const items = Array(repeat).fill(0);

  return (
    <div className="space-y-2">
      {items.map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${getVariantStyles()} ${animationStyles[animation]} ${className}`}
          style={style}
          role="status"
          aria-label="loading"
        />
      ))}
    </div>
  );
}

// Specialized skeleton components for common use cases
export function TextSkeleton({ lines = 3, ...props }: Omit<SkeletonProps, 'variant' | 'repeat'> & { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array(lines).fill(0).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '75%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ 
  cols = 4,
  ...props 
}: Omit<SkeletonProps, 'variant'> & { cols?: number }) {
  return (
    <tr>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <Skeleton variant="text" {...props} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ header = true, footer = true, ...props }: SkeletonProps & { 
  header?: boolean;
  footer?: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {header && (
        <div className="p-4 border-b border-gray-200">
          <Skeleton variant="text" width="40%" {...props} />
        </div>
      )}
      <div className="p-4 space-y-4">
        <TextSkeleton lines={3} {...props} />
      </div>
      {footer && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end space-x-2">
            <Skeleton variant="button" width={100} {...props} />
            <Skeleton variant="button" width={100} {...props} />
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileSkeleton(props: Omit<SkeletonProps, 'variant'>) {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton variant="avatar" {...props} />
      <div className="space-y-2">
        <Skeleton variant="text" width={120} {...props} />
        <Skeleton variant="text" width={160} {...props} />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4, ...props }: Omit<SkeletonProps, 'variant'> & { 
  fields?: number;
}) {
  return (
    <div className="space-y-6">
      {Array(fields).fill(0).map((_, i) => (
        <div key={i} className="space-y-1">
          <Skeleton variant="text" width={120} height={20} {...props} />
          <Skeleton variant="rectangular" height={40} {...props} />
        </div>
      ))}
      <Skeleton variant="button" width={120} {...props} />
    </div>
  );
}