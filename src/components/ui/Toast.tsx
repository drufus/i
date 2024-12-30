import React, { useEffect, createContext, useContext, useCallback, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  onClose: (id: string) => void;
}

interface ToastContextValue {
  addToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  removeAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  defaultPosition = 'bottom-right',
  defaultDuration = 5000
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback(({ 
    message,
    type,
    title,
    duration = defaultDuration,
    position = defaultPosition
  }: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, title, duration, position, onClose: removeToast }]);
  }, [defaultDuration, defaultPosition]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = {
    addToast,
    removeToast,
    removeAll
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  const positionGroups = toasts.reduce((acc, toast) => {
    const position = toast.position || 'bottom-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(toast);
    return acc;
  }, {} as Record<ToastPosition, ToastProps[]>);

  return createPortal(
    <>
      {Object.entries(positionGroups).map(([position, groupToasts]) => (
        <div key={position} className={getPositionStyles(position as ToastPosition)}>
          {groupToasts.map(toast => (
            <Toast key={toast.id} {...toast} />
          ))}
        </div>
      ))}
    </>,
    document.body
  );
}

function Toast({ 
  id,
  message,
  type,
  title,
  duration = 5000,
  onClose
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />
  };

  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200'
  };

  return (
    <div
      className={`
        max-w-sm w-full rounded-lg shadow-lg border p-4 mb-4
        transform transition-all duration-300 ease-in-out
        ${styles[type]}
      `}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        {icons[type]}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 ml-4"
          aria-label="Close"
        >
          <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      </div>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20">
          <div
            className="h-full bg-current opacity-50"
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}

function getPositionStyles(position: ToastPosition): string {
  const base = 'fixed z-50 p-4 flex flex-col pointer-events-none';
  const positions = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2'
  };
  return `${base} ${positions[position]}`;
}

// Add keyframes for the progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);