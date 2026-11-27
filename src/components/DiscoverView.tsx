import React, { useEffect, useState, useMemo } from 'react';
import { Search, TrendingUp, Sparkles, ArrowUpRight, Download } from 'lucide-react';
import { backend } from '../lib/backend';
import { AppCard } from './AppCard';

type AnyApp = any;

interface DiscoverProps {
  featuredApp?: AnyApp;
  becauseApps?: AnyApp[];
  filteredApps?: AnyApp[];
  installedMap?: Record<string, any>;
  onOpenDetails?: (app: AnyApp, tab?: any) => void;
  onQuickInstall?: (app: AnyApp) => void;
  onOpenSandbox?: (app: AnyApp) => void;
  onOpenManualModal?: () => void;
  onInstall?: (app: AnyApp) => void;
  onOpen?: (app: AnyApp) => void;
}

const CATEGORY_CHIPS = [
  { id: 'ALL', label: 'All Apps' },
  { id: 'finance', label: 'Finance & Web3' },
  { id: 'social', label: 'Social & Media' },
  { id: 'health', label: 'Health & Relief' },
  { id: 'tools', label: 'Tools & Productivity' },
  { id: 'creative', label: 'Creative & Games' },
];

export const DiscoverView: React.FC<DiscoverProps> = (props) => {
  const { featuredApp, becauseApps, filteredApps, installedMap, onOpenDetails, onQuickInstall, onOpenSandbox, onInstall, onOpen } = props as any;

  const [backendApps, setBackendApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const sourceApps = useMemo(() => {
    if (Array.isArray(filteredApps) && filteredApps.length > 0) return filteredApps;
    if (Array.isArray(becauseApps) && becauseApps.length > 0) return becauseApps;
    if (Array.isArray(backendApps) && backendApps.length > 0) return backendApps;
    return featuredApp ? [featuredApp] : [];
  }, [filteredApps, becauseApps, backendApps, featuredApp]);

  useEffect(() => {
    if (Array.isArray(filteredApps) && filteredApps.length > 0) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await backend.list('apps');
        const records = res?.records || [];
        const approved = records
          .map((r: any) => ({ id: r.id, ...(r.data || r), created_at: r.created_at || r.data?.created_at }))
          .filter((r: any) => r.status === 'approved')
          .sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
          .slice(0, 36);
        if (active && approved.length > 0) setBackendApps(approved);
      } catch {} finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [filteredApps]);

  const filtered = useMemo(() => {
    try {
      const list = Array.isArray(sourceApps) ? sourceApps : [];
      const q = String(search || '').toLowerCase().trim();
      return list.filter((a: any) => {
        if (!a) return false;
        const hay = `${String(a.title || a.name || '')} ${String(a.studio || a.developer || a.developer_handle || '')} ${String(a.tagline || a.summary || a.description || '')} ${String(a.category || a.blty || '')}`.toLowerCase();
        if (selectedCat !== 'ALL' && !hay.includes(selectedCat)) return false;
        if (q && !hay.includes(q)) return false;
        return true;
      });
    } catch {
      return sourceApps || [];
    }
  }, [sourceApps, search, selectedCat]);

  const trending = (filtered || []).slice(0, 18);

  const handleInstall = (app: any) => {
    if (onQuickInstall) onQuickInstall(app);
    else if (onInstall) onInstall(app);
  };
  const handleOpen = (app: any) => {
    if (onOpenDetails) onOpenDetails(app);
    else if (onOpen) onOpen(app);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search apps, studios, categories, or @handles..."
            className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white placeholder:text-slate-500 focus:border-violet-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORY_CHIPS.map((chip) => {
            const active = selectedCat === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedCat(chip.id)}
                className={`px-3 h-8 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-violet-600 text-white border border-violet-400/50'
                    : 'bg-white/[0.05] text-slate-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {featuredApp && (
        <div className="rounded-2xl bg-gradient-to-br from-[#161836] via-[#12132a] to-[#0c1a2e] border border-indigo-500/25 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-400">
              <Sparkles className="w-3.5 h-3.5" /> Featured Spotlight
            </div>
            <h1 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-white">
              {String(featuredApp.name || featuredApp.title || 'Featured App')}
            </h1>
            <p className="mt-1 text-[12.5px] text-slate-300 max-w-xl">
              {String(featuredApp.tagline || featuredApp.summary || 'Offline-ready, sovereign, zero tracking.')}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpen(featuredApp)}
              className="h-10 px-4 rounded-full bg-white text-slate-950 text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
            >
              Open Details <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInstall(featuredApp)}
              className="h-10 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-indigo-500 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Install
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-[13px] font-bold text-white">
              {selectedCat === 'ALL' ? 'Trending & Verified Apps' : `Filtered Apps (${trending.length})`} {loading && '(loading...)'}
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">{trending.length} shown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trending.map((app: any) => {
            const id = String(app?.id || app?.uuid || Math.random());
            return (
              <AppCard
                key={id}
                app={app}
                installedState={installedMap ? installedMap[app.id || app.uuid] : undefined}
                onOpenDetails={handleOpen}
                onQuickInstall={handleInstall}
                onOpenSandbox={onOpenSandbox ? () => onOpenSandbox(app) : handleOpen}
              />
            );
          })}
        </div>
        {trending.length === 0 && !loading && (
          <p className="text-[12px] text-white/40 text-center py-10">No apps matched your current filter or search "{search}"</p>
        )}
      </div>
    </div>
  );
};
