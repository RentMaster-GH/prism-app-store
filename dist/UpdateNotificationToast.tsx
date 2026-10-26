import React, { useEffect, useState } from 'react';
import { RefreshCw, X, ShieldCheck } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const UpdateNotificationToast: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodically check for updates in background every 60 seconds without interrupting user sessions
        setInterval(() => {
          r.update().catch(() => {});
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('SW registration issue:', error);
    },
  });

  const handleApplyUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!needRefresh || dismissed) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <span>New Version Ready</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900/40">
              Cached
            </span>
          </div>
          <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
            A background update has been downloaded. Your current session will not be disrupted. You can update whenever you're ready.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleApplyUpdate}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update Now</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors"
            >
              Keep Session Active
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
