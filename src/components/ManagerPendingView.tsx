import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Star, Loader2, ExternalLink } from 'lucide-react';

export function ManagerPendingView({ managerKey }: { managerKey: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('apps').select('*').order('created_at', { ascending: false }).limit(100);
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (uuid: string, status: string) => {
    if (!supabase) return;
    await supabase.from('apps').update({ status, updated_at: new Date().toISOString() }).eq('uuid', uuid);
    load();
  };

  const toggleFeatured = async (uuid: string, current: boolean) => {
    if (!supabase) return;
    await supabase.from('apps').update({ is_featured: !current } as any).eq('uuid', uuid);
    load();
  };

  if (loading) return <div className="flex gap-2 text-xs text-white/50"><Loader2 className="w-4 h-4 animate-spin"/> Loading apps...</div>;

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/50">{apps.length} total • {apps.filter(a=>a.status==='approved').length} approved • {apps.filter(a=>a.status==='pending').length} pending</div>
      <div className="grid gap-2 max-h-[400px] overflow-auto pr-2">
        {apps.map(app => (
          <div key={app.uuid} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-xl">
            <img src={app.thumbnail_url || app.download_url || `https://picsum.photos/seed/${app.uuid}/100/100`} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold truncate">{app.title || app.jamz}</p>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${app.status==='approved'?'bg-emerald-400 text-black':app.status==='pending'?'bg-amber-300 text-black':'bg-white/10 text-white/50'}`}>{app.status}</span>
                {app.is_featured && <Star className="w-3 h-3 text-amber-400" />}
              </div>
              <p className="text-[11px] text-white/40 truncate">{app.studio || app.owner_uid} • {app.live_web_url || app.live_app_url || ''}</p>
            </div>
            <div className="flex gap-1">
              {app.live_web_url && <a href={app.live_web_url} target="_blank" className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><ExternalLink className="w-3.5 h-3.5"/></a>}
              <button onClick={()=>toggleFeatured(app.uuid, app.is_featured)} className={`w-7 h-7 rounded-full flex items-center justify-center ${app.is_featured?'bg-amber-400 text-black':'bg-white/10'}`}><Star className="w-3.5 h-3.5"/></button>
              <button onClick={()=>updateStatus(app.uuid,'approved')} className="w-7 h-7 bg-emerald-400 text-black rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5"/></button>
              <button onClick={()=>updateStatus(app.uuid,'rejected')} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}