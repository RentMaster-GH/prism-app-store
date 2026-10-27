import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

export const ManagerPendingView = ({ managerKey }: { managerKey: string }) => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('apps').select('*').eq('status','pending').order('created_at', { ascending: false });
    if (data) setPending(data);
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const approve = async (id: string) => {
    await supabase.from('apps').update({ status: 'approved' }).eq('id', id);
    setPending(p=>p.filter(a=>a.id!==id));
  };

  const reject = async (id: string) => {
    if (!confirm('Reject and delete this app?')) return;
    await supabase.from('apps').update({ status: 'rejected' }).eq('id', id);
    setPending(p=>p.filter(a=>a.id!==id));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="rounded-xl bg-[#12132a] border border-amber-500/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold"><ShieldCheck className="w-5 h-5 text-amber-400"/>Manager Dashboard — Pending Approvals ({pending.length})</div>
        <div className="text-[10px] text-slate-400 font-mono">Key: {managerKey.slice(0,6)}... ✓</div>
      </div>

      {loading && <div className="text-slate-400 text-[13px]">Loading pending...</div>}
      
      {!loading && pending.length===0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <p className="text-white font-bold">No pending apps</p>
          <p className="text-slate-500 text-[12px] mt-1">All caught up! Pending submissions will appear here</p>
          <p className="text-[11px] text-slate-600 mt-4">Query: SELECT * FROM apps WHERE status='pending'</p>
        </div>
      )}

      <div className="grid gap-3">
        {pending.map(app=>(
          <div key={app.id} className="rounded-xl bg-[#12132a] border border-white/10 p-4 flex gap-4">
            <img src={app.thumbnail_url} className="w-20 h-20 rounded-lg object-cover bg-[#0a0b18]" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-[14px]">{app.title}</div>
              <div className="text-[12px] text-slate-400 line-clamp-2">{app.tagline || app.description}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span>{app.category}</span>
                <span>•</span>
                <a href={app.live_web_url} target="_blank" className="flex items-center gap-1 text-violet-400 hover:text-violet-300"><ExternalLink className="w-3 h-3"/>{app.live_web_url?.slice(0,30)}</a>
                <span>•</span>
                <span className="font-mono text-[10px]">{app.owner_uid?.slice(0,12)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={()=>approve(app.id)} className="h-9 px-4 rounded-full bg-white text-black font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3"/>Approve</button>
              <button onClick={()=>reject(app.id)} className="h-9 px-4 rounded-full bg-red-500/20 text-red-300 font-bold text-[11px] flex items-center gap-1"><X className="w-3 h-3"/>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
