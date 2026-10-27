import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const MySubmissionsView = ({ userUID }: { userUID: string }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('apps').select('*').eq('owner_uid', userUID).order('created_at',{ascending:false});
    if (data) setApps(data);
    setLoading(false);
  };
  useEffect(()=>{ load() }, [userUID]);

  const del = async (id:string) => {
    if (!confirm('Delete this app?')) return;
    await supabase.from('apps').delete().eq('id', id);
    load();
  };

  const save = async () => {
    if (!editing) return;
    await supabase.from('apps').update({ title: editing.title, tagline: editing.tagline, live_web_url: editing.live_web_url, thumbnail_url: editing.thumbnail_url, category: editing.category }).eq('id', editing.id);
    setEditing(null);
    load();
  };

  if (loading) return <div className="text-slate-400 text-[13px] p-6">Loading your apps...</div>;
  if (apps.length===0) return <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><p className="text-white font-bold text-[14px]">No submissions yet</p><p className="text-slate-400 text-[12px] mt-1">Click Dev Submit to publish your first app</p></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-[16px]">My Apps ({apps.length}) - Edit / Delete</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {apps.map(app=>(
          <div key={app.id} className="rounded-xl bg-[#12132a] border border-white/10 p-4 space-y-3">
            <div className="flex gap-3">
              <img src={app.thumbnail_url} className="w-16 h-16 rounded-lg object-cover bg-[#0a0b18]" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-[13px] truncate">{app.title}</div>
                <div className="text-[11px] text-slate-400">{app.status} • {app.installs} installs</div>
                <div className="text-[11px] text-slate-500 truncate">{app.live_web_url}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setEditing(app)} className="flex-1 h-8 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center gap-1"><Edit3 className="w-3 h-3"/>Edit</button>
              <button onClick={()=>del(app.id)} className="flex-1 h-8 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1"><Trash2 className="w-3 h-3"/>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#12132a] border border-white/10 p-6 space-y-3">
            <div className="flex justify-between items-center"><h3 className="text-white font-bold">Edit App</h3><button onClick={()=>setEditing(null)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center"><X className="w-4 h-4 text-white"/></button></div>
            <input value={editing.title} onChange={e=>setEditing({...editing, title:e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]" />
            <input value={editing.tagline} onChange={e=>setEditing({...editing, tagline:e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]" />
            <input value={editing.live_web_url} onChange={e=>setEditing({...editing, live_web_url:e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]" />
            <div className="flex gap-2"><ImageIcon className="w-4 h-4 text-slate-400 mt-2"/><input value={editing.thumbnail_url} onChange={e=>setEditing({...editing, thumbnail_url:e.target.value})} placeholder="https://... thumbnail" className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]" /></div>
            {editing.thumbnail_url && <img src={editing.thumbnail_url} className="w-full h-32 object-cover rounded-lg" />}
            <button onClick={save} className="w-full h-11 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};
