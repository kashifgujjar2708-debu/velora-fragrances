import React from 'react';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start justify-between gap-3 bg-[#252525] text-white px-4 py-3 border border-[#D4AF6A]/45 shadow-lg text-sm"
        >
          <div className="flex items-center gap-2.5">
            {toast.tone === 'success' && <Check className="h-4 w-4 text-[#D4AF6A] shrink-0" />}
            {toast.tone === 'info' && <Info className="h-4 w-4 text-[#D4AF6A] shrink-0" />}
            {toast.tone === 'error' && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-white/60 hover:text-white transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
