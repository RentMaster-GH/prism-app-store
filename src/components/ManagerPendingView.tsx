import { useEffect, useState } from 'react';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ManagerPendingView({ managerKey }: { managerKey: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending'|'all'>('pending');

  const load = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('apps').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) {
      const sorted = [...data].sort((a,b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1));
      setApps(sorted);
    }
  };

  useEffect(()=>{ load(); }, []);

  const updateStatus = async (app:any, status:string) => {
    if (!supabase) return;
    await supabase.from('apps').update({ status } as any).eq('id', app.id);
    load();
  };

  const del = async (app:any) => {
    if (!confirm(`Delete ${app.title}?`)) return;
    if (!supabase) return;
    await supabase.from('apps').delete().eq('id', app.id);
    load();
  };

  const pendingCount = apps.filter(a=>a.status==='pending').length;
  const displayApps = filter==='pending' ? apps.filter(a=>a.status==='pending') : apps;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          Submissions 
          <span className={`px-2.5 py-0.5 rounded-full text-xs ${pendingCount>0 ? 'bg-amber-400 text-black animate-pulse' : 'bg-white/10'}`}>
            Pending ({pendingCount})
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/5">Total {apps.length}</span>
        </h3>
        <div className="flex gap-1.5">
          <button onClick={()=>setFilter('pending')} className={`px-3 py-1 rounded-full text-xs font-bold ${filter==='pending'?'bg-amber-400 text-black':'bg-white/10'}`}>Pending Only</button>
          <button onClick={()=>setFilter('all')} className={`px-3 py-1 rounded-full text-xs ${filter==='all'?'bg-white text-black':'bg-white/10'}`}>All</button>
          <button onClick={load} className="px-3 py-1 rounded-full text-xs bg-white/10">Refresh</button>
        </div>
      </div>

      {displayApps.length===0 && <div className="py-10 text-center text-sm text-white/40">No {filter} apps. 🎉 All caught up!</div>}

      {displayApps.map(app => (
        <div key={app.id} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-2xl">
          <img src={app.thumbnail_url || app.download_url} className="w-12 h-12 rounded-xl object-cover bg-white/5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{app.title} — {app.status}</div>
            <div className="text-[11px] text-white/50 truncate">{app.live_web_url}</div>
            <div className="text-[10px] mt-1"><span className={`px-2 py-0.5 rounded-full ${app.status==='pending' ? 'bg-amber-500/20 text-amber-300' : app.status==='approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}`}>{app.status}</span></div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <a href={app.live_web_url} target="_blank" className="h-7 w-7 grid place-items-center bg-white/10 rounded-full"><ExternalLink className="w-3.5 h-3.5"/></a>
            {app.status!=='approved' && <button onClick={()=>updateStatus(app, 'approved')} className="h-7 px-3 bg-emerald-500 text-black rounded-full text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3"/>Approve</button>}
            {app.status!=='rejected' && <button onClick={()=>updateStatus(app, 'rejected')} className="h-7 px-3 bg-white/10 rounded-full text-xs flex items-center gap-1"><X className="w-3 h-3"/>Reject</button>}
            <button onClick={()=>del(app)} className="h-7 w-7 grid place-items-center bg-red-500/20 text-red-300 rounded-full"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      ))}
    </div>
  );
}