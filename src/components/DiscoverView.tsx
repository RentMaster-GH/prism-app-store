import React, { useEffect, useState, useMemo } from 'react';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppCard } from './AppCard';

type AnyApp = any;

interface DiscoverProps {
  // New App.tsx signature
  featuredApp?: AnyApp;
  becauseApps?: AnyApp[];
  filteredApps?: AnyApp[];
  installedMap?: Record<string, any>;
  onOpenDetails?: (app: AnyApp, tab?: any) => void;
  onQuickInstall?: (app: AnyApp) => void;
  onOpenSandbox?: (app: AnyApp) => void;
  onOpenManualModal?: () => void;
  // Old signature fallback
  onInstall?: (app: AnyApp) => void;
  onOpen?: (app: AnyApp) => void;
}

export const DiscoverView: React.FC<DiscoverProps> = (props) => {
  const { featuredApp, becauseApps, filteredApps, installedMap, onOpenDetails, onQuickInstall, onOpenSandbox, onInstall, onOpen } = props as any;
  
  const [supabaseApps, setSupabaseApps] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Support both data sources: App.tsx passes filteredApps, else fetch from supabase
  const sourceApps = useMemo(() => {
    if (Array.isArray(filteredApps) && filteredApps.length > 0) return filteredApps;
    if (Array.isArray(becauseApps) && becauseApps.length > 0) return becauseApps;
    if (Array.isArray(supabaseApps) && supabaseApps.length > 0) return supabaseApps;
    return featuredApp ? [featuredApp] : [];
  }, [filteredApps, becauseApps, supabaseApps, featuredApp]);

  useEffect(() => {
    if (!supabase) return;
    if (Array.isArray(filteredApps) && filteredApps.length > 0) return; // Don't fetch if App.tsx already provides
    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase.from('apps').select('*').eq('status','approved').order('created_at',{ascending:false}).limit(24);
        if (Array.isArray(data) && data.length > 0) setSupabaseApps(data);
      } catch {} finally { setLoading(false); }
    })();
  }, [filteredApps]);

  const filtered = useMemo(() => {
    try {
      const list = Array.isArray(sourceApps) ? sourceApps : [];
      const q = String(search || '').toLowerCase().trim();
      if (!q) return list;
      return list.filter((a:any) => {
        if (!a) return false;
        const hay = `${String(a.title||a.name||'')} ${String(a.studio||a.developer||'')} ${String(a.tagline||a.summary||'')} ${String(a.category||a.blty||'')}`.toLowerCase();
        return hay.includes(q);
      });
    } catch {
      return sourceApps || [];
    }
  }, [sourceApps, search]);

  const trending = (filtered || []).slice(0, 6);

  const handleInstall = (app: any) => {
    if (onQuickInstall) onQuickInstall(app);
    else if (onInstall) onInstall(app);
  };
  const handleOpen = (app: any) => {
    if (onOpenDetails) onOpenDetails(app);
    else if (onOpen) onOpen(app);
  };

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input 
          value={search} 
          onChange={e=>setSearch(e.target.value)} 
          placeholder="Search synth, effects, DAW..." 
          className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:border-violet-500 outline-none" 
        />
      </div>

      {featuredApp && (
        <div className="rounded-2xl bg-[#12132a] border border-white/[0.06] p-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-400"><Sparkles className="w-3 h-3"/>Featured</div>
          <h1 className="mt-2 text-xl font-bold text-white">{String(featuredApp.name || featuredApp.title || 'Featured App')}</h1>
          <p className="mt-1 text-[12px] text-slate-400 max-w-xl">{String(featuredApp.tagline || featuredApp.summary || 'Offline-ready, no tracking.')}</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-white"/><h2 className="text-[13px] font-bold text-white">Trending now {loading && '(loading...)'}</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trending.map((app:any) => {
            const id = String(app?.id || app?.uuid || Math.random());
            return (
              <AppCard 
                key={id} 
                app={app} 
                installedState={installedMap ? installedMap[app.id || app.uuid] : undefined}
                onOpenDetails={handleOpen} 
                onQuickInstall={handleInstall}
                onOpenSandbox={onOpenSandbox ? ()=>onOpenSandbox(app) : handleOpen}
              />
            );
          })}
        </div>
        {trending.length === 0 && !loading && (
          <p className="text-[12px] text-white/30 text-center py-10">No apps found for "{search}"</p>
        )}
      </div>
    </div>
  );
};