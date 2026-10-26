import React, { useState } from 'react';
import { Compass, Grid3x3, GitCompare, Library, Download, Settings2, Menu, X, Shield, Code2, MoreHorizontal } from 'lucide-react';

interface Props {
  currentTab: 'discover' | 'apps' | 'compare' | 'library';
  onSelectTab: (tab: any) => void;
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

export const TopBar: React.FC<Props> = ({ currentTab, onSelectTab, onOpenDevModal, onOpenOwnerGuide, onOpenInstallModal, onDirectInstall, onOpenSyncHub, isStandalone, installedCount, userUID, onOpenManagerAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Short UID: PRISM-UID-4729-AB12 -> PRISM-4729
  const shortUID = userUID?.split('-').slice(0, 3).join('-') || 'PRISM';
  const displayUID = shortUID.length > 14 ? shortUID.slice(0, 14) : shortUID;

  const tabs = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'apps', label: 'All Software', icon: Grid3x3, count: 11 },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'library', label: `Library (${installedCount})`, icon: Library, short: 'Library' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#05060f]/80 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center text-[11px] font-black">P</div>
            <span className="hidden sm:block text-[14px]">Prism Store</span>
          </div>
          
          {/* Desktop Tabs - hide on < lg */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map(t => {
              const active = currentTab === t.id;
              return (
                <button key={t.id} onClick={() => onSelectTab(t.id)} className={`h-8 px-3 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition border ${active ? 'bg-white text-black border-white font-bold' : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'}`}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions - compact */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* UID - compact badge, hidden on mobile, truncated on desktop */}
          <button onClick={onOpenManagerAuth} className="hidden md:flex h-8 px-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-white/[0.08] transition items-center gap-1.5 max-w-[140px] truncate">
            <Shield className="w-3 h-3 shrink-0" />
            <span className="truncate">{displayUID}</span>
          </button>

          <button onClick={onOpenOwnerGuide} className="hidden xl:flex h-8 px-3 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.08] transition">
            Owner Portal
          </button>

          <button onClick={onOpenDevModal} className="h-8 px-3 rounded-full bg-[#ff3b30]/90 hover:bg-[#ff3b30] text-white text-[11px] font-bold transition flex items-center gap-1">
            <Code2 className="w-3 h-3 hidden sm:block" />
            <span className="hidden sm:block">Dev Submit</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {!isStandalone && (
            <button onClick={onDirectInstall} className="h-8 px-3.5 rounded-full bg-white text-black text-[11px] font-bold hover:bg-slate-100 transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Install</span>
              <span className="sm:hidden">Get</span>
            </button>
          )}

          <button onClick={onOpenSyncHub} className="hidden md:flex w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition">
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Mobile hamburger - shows tabs */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0a0b18]/95 backdrop-blur-2xl px-4 py-3 space-y-2 animate-in slide-in-from-top-1">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map(t => {
              const active = currentTab === t.id;
              return (
                <button key={t.id} onClick={() => { onSelectTab(t.id); setMobileMenuOpen(false); }} className={`h-10 rounded-xl text-[12px] font-medium flex items-center justify-center gap-1.5 border ${active ? 'bg-white text-black border-white font-bold' : 'bg-white/[0.04] border-white/10 text-slate-300'}`}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <button onClick={() => { onOpenManagerAuth(); setMobileMenuOpen(false); }} className="flex-1 h-9 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />{displayUID}
            </button>
            <button onClick={() => { onOpenOwnerGuide(); setMobileMenuOpen(false); }} className="flex-1 h-9 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-slate-400">Owner Portal</button>
            <button onClick={() => { onOpenSyncHub(); setMobileMenuOpen(false); }} className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400"><Settings2 className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </header>
  );
};