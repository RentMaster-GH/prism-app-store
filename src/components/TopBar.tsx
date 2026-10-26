import React, { useEffect, useState } from 'react';
import { Terminal, Download, Check, BookOpen, ShieldCheck, UserCheck, Globe, Wifi, WifiOff } from 'lucide-react';
import { useSafeArea } from '../context/SafeAreaContext';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  currentTab: 'discover' | 'apps' | 'compare' | 'library';
  onSelectTab: (tab: 'discover' | 'apps' | 'compare' | 'library') => void;
  onOpenDevModal: () => void;
  onOpenOwnerGuide: () => void;
  onOpenInstallModal: () => void;
  onDirectInstall?: () => void;
  onOpenSyncHub: () => void;
  isStandalone: boolean;
  installedCount: number;
  userUID: string;
  isStoreManager: boolean;
  onOpenManagerAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDevModal,
  onOpenOwnerGuide,
  onOpenInstallModal,
  onDirectInstall,
  isStandalone,
  installedCount,
  userUID,
  isStoreManager,
  onOpenManagerAuth,
  onOpenSyncHub
}) => {
  const { insets } = useSafeArea();
  const { theme, toggle } = useTheme();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnected, setShowReconnected] = useState(false);

  // #2 PWA + Offline polish
  useEffect(() => {
    const goOnline = () => { 
      setIsOnline(true); 
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all supports-[backdrop-filter]:bg-slate-950/70
        /* #3 Light mode ready: invert colors later */
        dark:bg-slate-950/90 dark:border-slate-800/80
        light:bg-white/90 light:border-slate-200/80
        "
        style={{ paddingTop: `max(${insets.top}px, env(safe-area-inset-top, 0px))` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark - #3 WHITE LOGO VERSION */}
          <button
            onClick={() => onSelectTab('discover')}
            className="group text-lg font-bold tracking-tight whitespace-nowrap shrink-0 transition-colors text-left flex items-center gap-2.5
            text-white hover:text-slate-200
            dark:text-white dark:hover:text-slate-200
            /* future light mode: text-slate-900 */ 
            "
          >
            {/* White container logo = visible in both dark and light */}
            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-indigo-600 to-sky-500 inline-block" />
            </span>
            <span className="flex items-center gap-2">
              Prism App Store
              {/* Offline indicator dot polished */}
              <span className="relative flex h-2 w-2 ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
            </span>
          </button>

          {/* Zone 2: single-line text links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {[
              { id: 'discover', label: 'Discover' },
              { id: 'apps', label: 'All Software' },
              { id: 'compare', label: 'Side-by-Side Compare' },
              { id: 'library', label: `Library & Updates${installedCount > 0 ? ` (${installedCount})` : ''}` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as any)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                  currentTab === tab.id
                    ? 'text-white font-semibold border-indigo-500 dark:text-white dark:border-indigo-500'
                    : 'text-slate-400 hover:text-slate-200 border-transparent dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenManagerAuth}
              className={`flex px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm ${
                isStoreManager
                  ? 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/60 text-amber-200'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
            >
              {isStoreManager ? <><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /><span className="hidden sm:inline font-bold">Store Manager</span></> : <><UserCheck className="w-3.5 h-3.5 text-indigo-400" /><span className="hidden sm:inline">UID: {userUID.slice(0,13)}…</span><span className="sm:hidden">UID</span></>}
            </button>

            <button onClick={onOpenOwnerGuide} className="hidden sm:flex px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/50 transition-colors items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /><span>Owner Portal</span>
            </button>

            {/* #2 PWA install polish: only show when installable and online */}
            {!isStandalone && isOnline && (
              <button
                onClick={onDirectInstall || onOpenInstallModal}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" /><span className="hidden xs:inline">Install</span><span className="xs:hidden">Install</span>
              </button>
            )}
            {isStandalone && (
              <span className="hidden sm:flex px-2.5 py-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg items-center gap-1"><Check className="w-3 h-3" />Installed</span>
            )}

            <button onClick={onOpenSyncHub} className="flex px-2.5 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/40 border border-sky-800/60 rounded-lg items-center gap-1.5"><Globe className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sync</span></button>

	    <button onClick={toggle} className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
</button>

            <button onClick={onOpenDevModal} className="flex px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-indigo-400" /><span className="hidden md:inline">Studio</span></button>
          </div>
        </div>

        {/* #2 Offline banner - only when offline */}
        {!isOnline && (
          <div className="bg-red-950/80 border-t border-red-800/50 backdrop-blur px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-mono text-red-300">
            <WifiOff className="w-3.5 h-3.5" /> You are offline - installed apps still work
          </div>
        )}
      </header>

      {/* Reconnected toast */}
      {showReconnected && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-emerald-950/90 border border-emerald-800 text-emerald-200 px-4 py-2 rounded-full text-xs font-mono flex items-center gap-2 shadow-xl backdrop-blur animate-in slide-in-from-top-2">
          <Wifi className="w-3.5 h-3.5" /> Back online
        </div>
      )}
    </>
  );
};