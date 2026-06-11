// frontend/src/components/ui/Toast.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-surface border-green-neon/40 shadow-glow-green/10',
      icon: <CheckCircle className="text-green-neon w-5 h-5 flex-shrink-0" />,
      text: 'text-green-neon',
    },
    info: {
      bg: 'bg-surface border-blue-neon/40 shadow-glow-blue/10',
      icon: <Info className="text-blue-neon w-5 h-5 flex-shrink-0" />,
      text: 'text-blue-neon',
    },
    warning: {
      bg: 'bg-surface border-gold/40 shadow-glow-gold/10',
      icon: <AlertTriangle className="text-gold w-5 h-5 flex-shrink-0" />,
      text: 'text-gold',
    },
    error: {
      bg: 'bg-surface border-red-neon/40 shadow-[0_0_20px_rgba(255,68,102,0.1)]',
      icon: <XCircle className="text-red-neon w-5 h-5 flex-shrink-0" />,
      text: 'text-red-neon',
    },
  }[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} shadow-lg backdrop-blur-md`}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 text-sm text-text-primary font-medium pr-2">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
