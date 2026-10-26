import React, { useEffect, useState, useMemo } from 'react';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppCard } from './AppCard';
import { useApprovedApps } from '../hooks/useApprovedApps'

interface App {
  id: string;
  title: string;
  studio: string;
  tagline: string;
  thumbnail_url: string;
  live_web_url: string;
  category: string;
  rating: number;
  package_size: string;
  monetization: string;
  installs: number;
  status: string;
}

const { apps: realApps, loading } = useApprovedApps()
const apps = realApps.length > 0 ? realApps : MOCK_APPS

export const DiscoverView: React.FC<{ onInstall: (app: any) => void; onOpen: (app: any) => void }> = ({ onInstall, onOpen }) => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('apps').select('*').eq('status', 'approved').order('installs', { ascending: false }).limit(24);
        if (error) throw error;
        setApps(data && data.length > 0 ? data : MOCK_APPS);
      } catch {
        setApps(MOCK_APPS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return apps;
    const q = search.toLowerCase();
    return apps.filter(a => a.title.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q) || a.studio.toLowerCase().includes(q));
  }, [apps, search]);

  const trending = filtered.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Search - fixes discovery */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search synth, effects, DAW..." className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:border-violet-500 outline-none" />
      </div>

      {/* Hero */}
      <div className="rounded-2xl bg-[#12132a] border border-white/[0.06] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-400"><Sparkles className="w-3 h-3"/>Featured</div>
          <h1 className="mt-2 text-xl font-bold text-white">The DAW-grade synthesizer that refuses subscription lock-in</h1>
          <p className="mt-1 text-[12px] text-slate-400 max-w-xl">Offline-ready, no tracking, open format. Built for producers who own their tools.</p>
        </div>
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-white"/><h2 className="text-[13px] font-bold text-white">Trending now {loading && '(loading...)'}</h2></div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-[13px] text-slate-400">No apps found for "{search}"</p>
            <button onClick={()=>setSearch('')} className="mt-3 h-8 px-4 rounded-full bg-white text-black text-[11px] font-bold">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trending.map(app => <AppCard key={app.id} app={app} onInstall={()=>onInstall(app)} onOpen={()=>onOpen(app)} />)}
          </div>
        )}
      </div>

      {/* Because you installed */}
      <div>
        <h2 className="text-[13px] font-bold text-white mb-3">Because you installed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 3).map(app => <AppCard key={'rec-'+app.id} app={app} onInstall={()=>onInstall(app)} onOpen={()=>onOpen(app)} />)}
        </div>
      </div>
    </div>
  );
};