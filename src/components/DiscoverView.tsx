import React, { useEffect, useState, useMemo } from 'react';
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppCard } from './AppCard';

const MOCK_APPS = [
  { id: '1', title: 'Prism Synth', studio: 'Prism Labs', tagline: 'The DAW-grade synthesizer that refuses subscription lock-in', thumbnail_url: '', live_web_url: 'https://example.com', category: 'Synth', rating: 4.9, package_size: '36.4 MB', monetization: 'Free', installs: 1200, status: 'approved' },
  { id: '2', title: 'Prism FX', studio: 'Prism Labs', tagline: 'Analog modeled FX chain', thumbnail_url: '', live_web_url: 'https://example.com', category: 'Effect', rating: 4.7, package_size: '18.2 MB', monetization: 'Free', installs: 800, status: 'approved' },
];

export const DiscoverView: React.FC<{ onInstall: (app: any) => void; onOpen: (app: any) => void }> = ({ onInstall, onOpen }) => {
  const [apps, setApps] = useState<any[]>(MOCK_APPS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('apps').select('*').eq('status','approved').order('installs',{ascending:false}).limit(24);
      if (data && data.length > 0) setApps(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return apps;
    const q = search.toLowerCase();
    return apps.filter((a:any) => a.title?.toLowerCase().includes(q) || a.tagline?.toLowerCase().includes(q) || a.studio?.toLowerCase().includes(q));
  }, [apps, search]);

  const trending = filtered.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search synth, effects, DAW..." className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white placeholder:text-slate-600 focus:border-violet-500 outline-none" />
      </div>
      <div className="rounded-2xl bg-[#12132a] border border-white/[0.06] p-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-violet-400"><Sparkles className="w-3 h-3"/>Featured</div>
        <h1 className="mt-2 text-xl font-bold text-white">The DAW-grade synthesizer that refuses subscription lock-in</h1>
        <p className="mt-1 text-[12px] text-slate-400 max-w-xl">Offline-ready, no tracking, open format. Built for producers who own their tools.</p>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-white"/><h2 className="text-[13px] font-bold text-white">Trending now {loading && '(loading...)'}</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trending.map((app:any) => <AppCard key={app.id} app={app} onInstall={()=>onInstall(app)} onOpen={()=>onOpen(app)} />)}
        </div>
      </div>
    </div>
  );
};
