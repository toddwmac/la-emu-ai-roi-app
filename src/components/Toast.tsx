import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast, ToastType } from '../types';

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          titleColor: 'text-slate-800',
          messageColor: 'text-slate-600',
        };
      case 'error':
        return {
          bg: 'bg-white',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-slate-800',
          messageColor: 'text-slate-600',
        };
      case 'warning':
        return {
          bg: 'bg-white',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          titleColor: 'text-slate-800',
          messageColor: 'text-slate-600',
        };
      case 'info':
      default:
        return {
          bg: 'bg-white',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-slate-800',
          messageColor: 'text-slate-600',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg border
        ${styles.bg} ${styles.border}
        transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'opacity-100 translate-x-0' 
          : 'opacity-0 translate-x-full'
        }
        max-w-md w-full
      `}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.iconColor}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={`text-sm mt-1 ${styles.messageColor}`}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;