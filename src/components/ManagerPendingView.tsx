import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, ExternalLink } from 'lucide-react';

function getOpenUrl(app: any): string {
  const candidates = [
    app.live_web_url,
    app.download_url,
    app.websiteUrl,
    app.thumbnail_url,
  ];
  for (const u of candidates) {
    if (u && typeof u === 'string' && u.trim().startsWith('http')) return u.trim();
  }
  return '';
}

export function ManagerPendingView({ managerKey }: { managerKey: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase.from('apps').select('*').order('created_at', { ascending: false }).limit(100);
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('load apps failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (app: any, status: string) => {
    if (!supabase) return;
    try {
      // Try id first, then uuid, then owner_uid+title as fallback
      let res;
      if (app.id) res = await supabase.from('apps').update({ status }).eq('id', app.id);
      else if (app.uuid) res = await supabase.from('apps').update({ status }).eq('uuid', app.uuid);
      else res = await supabase.from('apps').update({ status }).eq('owner_uid', app.owner_uid).eq('title', app.title);
      
      if (res.error) throw res.error;
      alert(`${app.title} -> ${status}`);
    } catch (e:any) {
      alert(`Update failed: ${e.message}`);
    }
    load();
  };

  const deleteApp = async (app: any) => {
    if (!confirm(`Delete ${app.title}?`)) return;
    try {
      let res;
      if (app.id) res = await supabase.from('apps').delete().eq('id', app.id);
      else if (app.uuid) res = await supabase.from('apps').delete().eq('uuid', app.uuid);
      else res = await supabase.from('apps').delete().eq('owner_uid', app.owner_uid).eq('title', app.title);
      if (res.error) throw res.error;
    } catch (e:any) { alert(e.message); }
    load();
  };

  if (loading) return <div className="p-8 text-center text-white/50 text-xs">Loading apps...</div>;

  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold">Pending / All Apps ({apps.length})</h3>
        <button onClick={load} className="h-7 px-3 bg-white/10 rounded-full text-xs">Refresh</button>
      </div>

      {apps.length === 0 && <div className="text-xs text-white/40">No apps found</div>}

      {apps.map((app) => {
        const openUrl = getOpenUrl(app);
        return (
          <div key={app.id || app.uuid || app.title} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex gap-3 items-center">
            <img src={app.thumbnail_url || app.download_url || openUrl} className="w-12 h-12 rounded-lg bg-white/10 object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{app.title}</div>
              <div className="text-[10px] text-white/40 truncate">{openUrl} • {app.status} • owner: {String(app.owner_uid||'').slice(0,8)}...</div>
              <div className="text-[10px] mt-1"><span className={`px-2 py-0.5 rounded-full ${app.status==='pending' ? 'bg-amber-500/20 text-amber-300' : app.status==='approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}`}>{app.status}</span></div>
            </div>
            <div className="flex flex-col gap-1">
              {openUrl && <a href={openUrl} target="_blank" className="h-7 px-3 bg-white/10 rounded-full text-xs flex items-center gap-1"><ExternalLink className="w-3 h-3"/>Preview</a>}
              <button onClick={()=>updateStatus(app, 'approved')} className="h-7 px-3 bg-emerald-500 text-black rounded-full text-xs font-bold flex items-center gap-1"><Check className="w-3 h-3"/>Approve</button>
              <button onClick={()=>updateStatus(app, 'rejected')} className="h-7 px-3 bg-white/10 rounded-full text-xs">Reject</button>
              <button onClick={()=>deleteApp(app)} className="h-6 px-3 bg-red-500/10 text-red-400 rounded-full text-[10px] flex items-center gap-1"><X className="w-3 h-3"/>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}