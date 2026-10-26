import React from 'react';
import { Compass, LayoutGrid, Columns, Download, Globe, Sparkles } from 'lucide-react';
import { useSafeArea } from '../context/SafeAreaContext';

interface MobileBottomNavProps {
  currentTab: 'discover' | 'apps' | 'compare' | 'library';
  onSelectTab: (tab: 'discover' | 'apps' | 'compare' | 'library') => void;
  installedCount: number;
  onOpenSyncHub: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  installedCount,
  onOpenSyncHub
}) => {
  const { insets, platform } = useSafeArea();

  const isIOS = platform === 'ios';

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 transition-all"
      style={{
        paddingBottom: `max(${insets.bottom}px, env(safe-area-inset-bottom, 12px))`
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {/* Discover Tab */}
        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            currentTab === 'discover'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'discover' ? 'bg-indigo-500/15' : ''}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Discover</span>
        </button>

        {/* All Software Tab */}
        <button
          onClick={() => onSelectTab('apps')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            currentTab === 'apps'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'apps' ? 'bg-indigo-500/15' : ''}`}>
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Apps</span>
        </button>

        {/* Compare Tab */}
        <button
          onClick={() => onSelectTab('compare')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            currentTab === 'compare'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'compare' ? 'bg-indigo-500/15' : ''}`}>
            <Columns className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Compare</span>
        </button>

        {/* Library Tab */}
        <button
          onClick={() => onSelectTab('library')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            currentTab === 'library'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${currentTab === 'library' ? 'bg-indigo-500/15' : ''}`}>
            <Download className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Library</span>
          {installedCount > 0 && (
            <span className="absolute top-0.5 right-2 px-1.5 py-0.2 bg-indigo-500 text-white rounded-full text-[9px] font-mono font-bold leading-none">
              {installedCount}
            </span>
          )}
        </button>

        {/* Edge & Sync Hub Button */}
        <button
          onClick={onOpenSyncHub}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 text-sky-400 hover:text-sky-300 transition-all"
          title="CDN Edge Propagation & Cache Manager"
        >
          <div className="p-1 rounded-xl hover:bg-sky-500/15 transition-all">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 text-slate-300">Sync & CDN</span>
        </button>
      </div>
    </nav>
  );
};
