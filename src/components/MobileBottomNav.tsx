import React from 'react';
import { LayoutGrid, Search, Columns2, Library, HardDrive } from 'lucide-react';

interface Props {
  currentTab: 'discover' | 'apps' | 'compare' | 'library';
  onSelectTab: (tab: 'discover' | 'apps' | 'compare' | 'library') => void;
  installedCount: number;
  onOpenSyncHub: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({ currentTab, onSelectTab, installedCount, onOpenSyncHub }) => {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: LayoutGrid },
    { id: 'apps', label: 'Search', icon: Search },
    { id: 'compare', label: 'Compare', icon: Columns2 },
    { id: 'library', label: 'Library', icon: Library, badge: installedCount },
  ] as const;

  return (
    <>
      {/* Spacer to prevent content being hidden behind nav */}
      <div className="md:hidden h-[88px]" />

      {/* Floating pill nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none">
        <div className="pointer-events-auto mx-auto mb-[max(12px,env(safe-area-inset-bottom))] w-[calc(100%-16px)] max-w-[420px]">
          <div className="flex items-center justify-between gap-1 p-1.5 rounded-[24px] bg-[#0e0f22]/90 backdrop-blur-2xl border border-white/[0.10] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
            {tabs.map(t => {
              const active = currentTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTab(t.id as any)}
                  className={`relative flex-1 h-[48px] rounded-[16px] flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.96] ${active ? 'bg-white text-black shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="relative">
                    <t.icon className={`w-5 h-5 ${active ? 'text-black' : ''}`} />
                    {'badge' in t && t.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center border border-[#0e0f22]">
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-medium tracking-wide">{t.label}</span>
                </button>
              );
            })}
            
            <div className="w-px h-8 bg-white/[0.08] mx-0.5" />
            
            <button onClick={onOpenSyncHub} className="w-[48px] h-[48px] rounded-[16px] bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.10] transition active:scale-[0.96]">
              <HardDrive className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};