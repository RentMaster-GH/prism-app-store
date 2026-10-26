import React, { useState, useEffect } from 'react';
import { X, Download, Rocket, Smartphone } from 'lucide-react';

interface Props {
  onOpenManualModal: () => void;
}

export const DirectInstallBanner: React.FC<Props> = ({ onOpenManualModal }) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('prism_banner_dismissed');
      if (v === 'true') setDismissed(true);
    } catch {}
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('prism_banner_dismissed', 'true'); } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="relative mb-6 rounded-[18px] bg-[#0e0f22] border border-white/[0.08] overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
      <div className="relative flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white flex items-center gap-2">
              Install Prism App Store Directly to Your Device
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-[9px] font-mono tracking-widest text-indigo-200">NATIVE PWA</span>
            </p>
            <p className="text-[11px] text-slate-400 truncate hidden sm:block">
              Add Prism App Store straight from this page with native PWA integration. Works 100% offline, retains all your uploaded apps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onOpenManualModal} className="h-8 px-4 rounded-full bg-white text-black text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-100 active:scale-[0.98] transition">
            <Download className="w-3.5 h-3.5" /> Direct Install Now
          </button>
          <button onClick={handleDismiss} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.10] transition text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};