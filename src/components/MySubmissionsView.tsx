import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Save, X, Image as ImageIcon, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const MySubmissionsView = ({ userUID }: { userUID: string }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importUID, setImportUID] = useState('');
  const [activeUID, setActiveUID] = useState(userUID);

  const load = async (uid: string) => {
    setLoading(true);
    const { data } = await supabase.from('apps').select('*').eq('owner_uid', uid).order('created_at',{ascending:false});
    if (data) setApps(data);
    setLoading(false);
  };
  
  useEffect(()=>{ 
    const saved = localStorage.getItem('prism_imported_uid') || userUID;
    setActiveUID(saved);
    load(saved); 
  }, [userUID]);

  const handleImport = () => {
    if (!importUID.trim()) return;
    localStorage.setItem('prism_imported_uid', importUID.trim());
    localStorage.setItem('prism_uid', importUID.trim());
    setActiveUID(importUID.trim());
    load(importUID.trim());
    alert('UID imported! Your apps will now show on this device.');
  };

  const del = async (id:string) => {
    if (!confirm('Delete this app?')) return;
    await supabase.from('apps').delete().eq('id', id);
    load(activeUID);
  };

  const save = async () => {
    if (!editing) return;
    await supabase.from('apps').update({ title: editing.title, tagline: editing.tagline, live_web_url: editing.live_web_url, thumbnail_url: editing.thumbnail_url, category: editing.category }).eq('id', editing.id);
    setEditing(null);
    load(activeUID);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">
      <div className="rounded-xl bg-[#12132a] border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-bold text-[13px]"><KeyRound className="w-4 h-4"/>Your Portable Owner Key (UID)</div>
        <div className="mt-2 flex gap-2">
          <div className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-violet-300 font-mono text-[12px] flex items-center">{activeUID}</div>
          <button onClick={()=>{navigator.clipboard.writeText(activeUID); alert('Copied UID - save it to access on any device')}} className="h-10 px-4 rounded-full bg-white text-black font-bold text-[11px]">Copy</button>
        </div>
        <div className="mt-3 flex gap-2">
          <input value={importUID} onChange={e=>setImportUID(e.target.value)} placeholder="Have a UID from another device? Paste PRISM-..." className="flex-1 h-9 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[12px] outline-none" />
          <button onClick={handleImport} className="h-9 px-4 rounded-full bg-white/10 text-white font-bold text-[11px]">Import</button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Save your UID. It's your passkey across all devices. No email needed.</p>
      </div>

      <h2 className="text-white font-bold text-[16px]">My Apps ({apps.length}) - Edit / Delete on any device</h2>
      {loading && <div className="text-slate-400 text-[13px]">Loading...</div>}
      {!loading && apps.length===0 && <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><p className="text-white font-bold text-[14px]">No submissions for {activeUID}</p><p className="text-slate-400 text-[12px] mt-1">Click Dev Submit or import a different UID</p></div>}
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
            <div className="flex gap-2"><ImageIcon className="w-4 h-4 text-slate-400 mt-2"/><input value={editing.thumbnail_url} onChange={e=>setEditing({...editing, thumbnail_url:e.target.value})} className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]" /></div>
            {editing.thumbnail_url && <img src={editing.thumbnail_url} className="w-full h-32 object-cover rounded-lg" />}
            <button onClick={save} className="w-full h-11 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};
