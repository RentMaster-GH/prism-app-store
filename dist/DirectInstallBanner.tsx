import React, { useState } from 'react';
import { 
  Download, Sparkles, CheckCircle2, Monitor, 
  X, Check, ShieldCheck, ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DirectInstallBannerProps {
  onOpenManualModal?: () => void;
}

export const DirectInstallBanner: React.FC<DirectInstallBannerProps> = ({
  onOpenManualModal
}) => {
  const { 
    isInstallable, 
    isInstalled, 
    isStandalone, 
    isIOS,
    install, 
    launchStandaloneWindow 
  } = usePWAInstall();

  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('prism_direct_install_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'dismissed-prompt'>('idle');

  // If already running standalone as an installed app or user dismissed for session, hide
  if (isStandalone || isInstalled || dismissed) {
    return null;
  }

  const handleDirectInstall = async () => {
    setInstallStatus('installing');
    
    // 1. If native beforeinstallprompt event is caught, invoke it directly
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallStatus('success');
        return;
      } else {
        setInstallStatus('idle');
        return;
      }
    }

    // 2. If prompt is not yet ready or on iOS, guide the user directly without downloading any files
    setInstallStatus('idle');
    if (onOpenManualModal) {
      onOpenManualModal();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('prism_direct_install_dismissed', 'true');
    } catch {}
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-indigo-950/80 border border-indigo-500/30 p-4 sm:p-5 shadow-xl shadow-indigo-950/40 mb-8 transition-all">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        title="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pr-6">
        {/* Left Info Column */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <img src="/icon.svg" alt="Prism Store" className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-0.5">
              <span className="font-bold">DIRECT APP INSTALLATION</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">NATIVE SYSTEM PROMPT</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Install Prism App Store Directly to Your Device
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-2xl">
              Add Prism App Store straight from this page with native PWA integration. Works 100% offline, retains all your uploaded apps across updates, and requires no browser menus.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 lg:pt-0">
          {installStatus === 'success' ? (
            <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Installed Successfully! Launch from your device apps.</span>
            </div>
          ) : (
            <>
              {/* PRIMARY DIRECT INSTALL BUTTON (NATIVE PROMPT TRIGGER) */}
              <button
                onClick={handleDirectInstall}
                disabled={installStatus === 'installing'}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                title="Trigger native browser install prompt"
              >
                {installStatus === 'installing' ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Direct Install Now</span>
              </button>

              {/* LAUNCH STANDALONE WINDOW (IN-BROWSER STANDALONE) */}
              <button
                onClick={launchStandaloneWindow}
                className="px-3.5 py-2.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Launch in an isolated borderless application window"
              >
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Launch Standalone App</span>
                <span className="sm:hidden">Standalone</span>
              </button>

              {/* Manual Device Guide Trigger */}
              {onOpenManualModal && (
                <button
                  onClick={onOpenManualModal}
                  className="px-2.5 py-2 text-[11px] text-slate-400 hover:text-slate-200 underline transition-colors cursor-pointer"
                  title="View device-specific installation guide"
                >
                  Device Guide
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
