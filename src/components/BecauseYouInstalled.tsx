import React, { useRef } from 'react';
import { AppItem, InstalledAppState } from '../types';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { AppCard } from './AppCard';

interface Props {
  apps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem) => void;
  onQuickInstall: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
}

export const BecauseYouInstalled: React.FC<Props> = ({ apps, installedMap, onOpenDetails, onQuickInstall, onOpenSandbox }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (apps.length === 0) return null;

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 280 + 16; // card + gap
    scrollRef.current.scrollBy({ left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
          Because you installed
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-indigo-200 tracking-widest">FOR YOU</span>
        </h3>
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.10] text-slate-400 hover:text-white transition active:scale-95">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.10] text-slate-400 hover:text-white transition active:scale-95">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GPU-accelerated native scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          willChange: 'scroll-position',
        } as React.CSSProperties}
      >
        {apps.map((app, i) => (
          <div key={app.id} className="snap-start shrink-0 w-[260px] sm:w-[280px] will-change-transform" style={{ transform: 'translateZ(0)' }}>
            <AppCard
              app={app}
              installedState={installedMap[app.id]}
              onOpenDetails={onOpenDetails}
              onQuickInstall={onQuickInstall}
              onOpenSandbox={onOpenSandbox}
              index={i}
            />
          </div>
        ))}
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};