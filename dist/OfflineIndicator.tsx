import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 px-3.5 py-2 text-xs font-medium text-emerald-200 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-1.5 font-bold text-white">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>100% Offline Ready</span>
      </div>
      <span className="text-slate-500">·</span>
      <span className="text-slate-300">All apps, sandboxes & libraries execute locally from device cache with zero network dependency.</span>
    </aside>
  );
};
