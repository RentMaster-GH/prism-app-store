import React from 'react';
import { AppItem, InstalledAppState } from '../types';
import { AppCard } from './AppCard';
import { BecauseYouInstalled } from './BecauseYouInstalled';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Star } from 'lucide-react';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

interface Props {
  featuredApp: AppItem | undefined;
  becauseApps: AppItem[];
  filteredApps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem, tab?: 'overview' | 'test-drive') => void;
  onQuickInstall: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  onOpenManualModal: () => void;
}

export const DiscoverView: React.FC<Props> = ({ featuredApp, becauseApps, filteredApps, installedMap, onOpenDetails, onQuickInstall, onOpenSandbox }) => {
  if (!featuredApp) return null;

  // FIX DOUBLE TEXT: Prevent "Video/Audio AI editor" appearing twice
  const rawHeadline = featuredApp.editorialHighlight?.headline || featuredApp.name;
  const headline = rawHeadline;
  const tagline = featuredApp.tagline || '';
  const isDuplicate = tagline.toLowerCase().trim() === headline.toLowerCase().trim() || headline.toLowerCase().includes(tagline.toLowerCase()) && tagline.length > 0;
  const showTagline = tagline && !isDuplicate;
  const summary = featuredApp.summary || (featuredApp as any).description || 'Professional AI-powered editor that works 100% offline. No cloud, no tracking.';

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* HERO - NO FLICKER, NO DOUBLE TEXT */}
      <section className="relative rounded-[28px] overflow-hidden isolate bg-[#0a0b18] border border-white/[0.08] min-h-[400px] shadow-2xl shadow-black/50">
        <div className="absolute inset-0 pointer-events-none gpu" style={{ transform: 'translateZ(0)' } as any}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-700" />
          <div className="absolute -top-20 -right-20 w-[340px] h-[340px] rounded-full bg-fuchsia-400/40 blur-[60px]" style={{ transform: 'translateZ(0)' } as any} />
          <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] rounded-full bg-indigo-400/50 blur-[70px]" style={{ transform: 'translateZ(0)' } as any} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-[10px] font-mono tracking-widest text-white flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> EDITOR'S SPOTLIGHT
              </span>
              <span className="hidden sm:flex px-2.5 py-1 rounded-full bg-black/20 backdrop-blur border border-white/10 text-[10px] font-mono text-white/70 items-center gap-1"><Zap className="w-3 h-3" /> Offline • {featuredApp.sizeMB}MB</span>
              <span className="hidden sm:flex px-2.5 py-1 rounded-full bg-black/20 backdrop-blur border border-white/10 text-[10px] font-mono text-white/70 items-center gap-1"><ShieldCheck className="w-3 h-3" /> {featuredApp.privacyGrade}</span>
            </div>

            <div className="mt-auto pt-8">
              <h1 className="text-[30px] sm:text-[44px] font-black tracking-[-0.04em] leading-[0.9] text-white max-w-[12ch]">
                {headline}
              </h1>
              {showTagline && (
                <p className="text-[16px] sm:text-[18px] font-light text-white/70 mt-2 tracking-tight max-w-[30ch]">
                  {tagline}
                </p>
              )}
              <p className="mt-3 text-[13px] sm:text-[14px] text-white/70 max-w-[48ch] leading-relaxed line-clamp-2">
                {summary}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-[11px] text-white/80"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{featuredApp.rating.toFixed(1)}</span>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/60">{featuredApp.category}</span>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => onOpenDetails(featuredApp)} className="h-11 px-6 rounded-full bg-white text-black text-sm font-bold flex items-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition">
                  Get App <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => onOpenSandbox(featuredApp)} className="h-11 px-5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-medium hover:bg-white/15 active:scale-[0.98] transition">
                  Test Drive
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30">
            <img src={resolveAppMedia(featuredApp.thumbnail) || getAppCategoryPlaceholder(featuredApp.category, featuredApp.name)} alt={featuredApp.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/20 to-transparent lg:bg-gradient-to-r lg:from-[#0a0b18] lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </section>

      {becauseApps.length > 0 && (
        <BecauseYouInstalled apps={becauseApps} installedMap={installedMap} onOpenDetails={onOpenDetails} onQuickInstall={onQuickInstall} onOpenSandbox={onOpenSandbox} />
      )}

      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold tracking-tight">Trending now</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.slice(0, 6).map((app, i) => (
            <AppCard key={app.id} app={app} installedState={installedMap[app.id]} onOpenDetails={onOpenDetails} onQuickInstall={onQuickInstall} onOpenSandbox={onOpenSandbox} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};