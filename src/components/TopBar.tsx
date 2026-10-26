import React from 'react';
import { LayoutGrid, Search, Columns2, Library, Box, Download, Rocket, Shield, HardDrive } from 'lucide-react';

interface TopBarProps {
  currentTab: 'discover' | 'apps' | 'compare' | 'library';
  onSelectTab: (tab: 'discover' | 'apps' | 'compare' | 'library') => void;
  onOpenDevModal: () => void;
  onOpenOwnerGuide: () => void;
  onOpenInstallModal: () => void;
  onDirectInstall: () => void;
  onOpenSyncHub: () => void;
  isStandalone: boolean;
  installedCount: number;
  userUID: string;
  isStoreManager: boolean;
  onOpenManagerAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab, onSelectTab, onOpenDevModal, onOpenOwnerGuide, onOpenInstallModal,
  onDirectInstall, onOpenSyncHub, isStandalone, installedCount, userUID, isStoreManager, onOpenManagerAuth
}) => {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: LayoutGrid },
    { id: 'apps', label: 'All Software', icon: Search },
    { id: 'compare', label: 'Side-by-Side Compare', icon: Columns2 },
    { id: 'library', label: `Library & Updates (${installedCount})`, icon: Library },
  ] as const;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#05060f]/80 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-3">
        {/* Left - Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-[12px]">P</div>
          <span className="font-bold text-[14px] tracking-tight hidden sm:block">Prism App Store</span>
          <div className="hidden lg:flex items-center gap-1 ml-4">
            {tabs.map(t => {
              const active = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTab(t.id as any)}
                  className={`h-7 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition border ${active ? 'bg-white text-black border-white shadow' : 'bg-white/[0.04] text-slate-400 border-white/10 hover:bg-white/[0.08] hover:text-slate-200'}`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={onOpenManagerAuth} className="hidden sm:flex h-7 px-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-400 hover:text-slate-200 items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {userUID.slice(0, 12)}...
          </button>

          <button onClick={onOpenOwnerGuide} className="h-7 px-3 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] hidden md:flex items-center gap-1">
            <Shield className="w-3 h-3" /> Owner Portal
          </button>

          <button onClick={onOpenDevModal} className="h-7 px-3 rounded-full bg-amber-500/15 border border-amber-500/20 text-[11px] font-medium text-amber-200 hover:bg-amber-500/20 hidden sm:flex items-center gap-1">
            <Rocket className="w-3 h-3" /> Dev Submit
          </button>

          {!isStandalone && (
            <button onClick={onDirectInstall} className="h-7 px-3 rounded-full bg-[#c6ff41] text-black text-[11px] font-bold hover:bg-[#d4ff6a] flex items-center gap-1 shadow-[0_0_20px_rgba(198,255,65,0.3)]">
              <Download className="w-3 h-3" /> Install
            </button>
          )}

          <button onClick={onOpenSyncHub} className="h-7 w-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/[0.08]">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Mobile tabs - scrollable */}
      <div className="lg:hidden border-t border-white/[0.04] px-2 h-[44px] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {tabs.map(t => {
          const active = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id as any)}
              className={`whitespace-nowrap h-7 px-3 rounded-full text-[11px] font-medium flex items-center gap-1.5 transition border shrink-0 ${active ? 'bg-white text-black border-white' : 'bg-white/[0.04] text-slate-400 border-white/10'}`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};