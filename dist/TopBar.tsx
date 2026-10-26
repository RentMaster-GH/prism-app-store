import React from 'react';
import { Terminal, Download, Check, BookOpen, Key, ShieldCheck, UserCheck, Globe } from 'lucide-react';
import { useSafeArea } from '../context/SafeAreaContext';

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

  return (
    <header 
      className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all"
      style={{
        paddingTop: `max(${insets.top}px, env(safe-area-inset-top, 0px))`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onSelectTab('discover')}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-slate-200 transition-colors text-left flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-br from-indigo-500 to-sky-400 inline-block" />
          <span>Prism App Store</span>
        </button>

        {/* Zone 2: single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('discover')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'discover'
                ? 'text-white font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Discover
          </button>
          
          <button
            onClick={() => onSelectTab('apps')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'apps'
                ? 'text-white font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Software
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'compare'
                ? 'text-white font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Side-by-Side Compare
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'library'
                ? 'text-white font-semibold border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Library & Updates</span>
            {installedCount > 0 && (
              <span className="text-[11px] font-mono text-indigo-400 tabular-nums">
                ({installedCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Owner Guide + Install on Device + Dev Studio + UID/Manager) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* User UID / Manager Access Badge */}
          <button
            onClick={onOpenManagerAuth}
            className={`flex px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm ${
              isStoreManager
                ? 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-500/60 text-amber-200'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
            title={isStoreManager ? 'Prism Store Developer / Manager Active — Click to manage root privileges' : `Your Unique Identifier: ${userUID} — Click to manage identity or unlock Store Developer access`}
          >
            {isStoreManager ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-bold">Store Manager</span>
                <span className="sm:hidden font-bold">Manager</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">UID: {userUID.length > 15 ? `${userUID.slice(0, 13)}…` : userUID}</span>
                <span className="sm:hidden">UID</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenOwnerGuide}
            className="hidden sm:flex px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/50 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm"
            title="Open step-by-step portal for app owners"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Owner Portal</span>
          </button>

          {!isStandalone && (
            <button
              onClick={onDirectInstall || onOpenInstallModal}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              title="Install Prism App Store directly to this device without 3-dots menus"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">1-Click Install</span>
              <span className="xs:hidden">Install</span>
            </button>
          )}

          <button
            onClick={onOpenSyncHub}
            className="flex px-2.5 py-1.5 text-xs font-medium text-sky-300 hover:text-white bg-sky-950/40 border border-sky-800/60 rounded-lg hover:bg-sky-900/50 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm cursor-pointer"
            title="Global Edge CDN Propagation & App Store Caching Hub"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Edge & Cache Sync</span>
            <span className="sm:hidden">Sync</span>
          </button>

          <button
            onClick={onOpenDevModal}
            className="flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 shadow-sm"
            title="Upload, manage, and delete apps via Developer Studio"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Dev & Owner Studio</span>
            <span className="md:hidden">Studio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
