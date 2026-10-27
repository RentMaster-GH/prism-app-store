import { useState } from 'react';
import { supabase } from '../lib/supabase';
export function EditAppModal({ app, isOpen, onClose, onSaved }: any) {
  const [title, setTitle] = useState(app.title);
  const [desc, setDesc] = useState(app.description);
  const [cat, setCat] = useState(app.category||'Labyrinth');
  const [ver, setVer] = useState(app.version||'1.0.0');
  const [log, setLog] = useState(app.changelog||'');
  const [priceType, setPriceType] = useState(app.price_type||'free');
  const [saving, setSaving] = useState(false);
  if(!isOpen) return null;
  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('marketplace_apps').update({
      title, description: desc, category: cat, version: ver, changelog: log, price_type: priceType,
      updated_at: new Date().toISOString()
    }).eq('id', app.id);
    setSaving(false);
    if(error) alert(error.message); else { onSaved(); onClose(); }
  };
  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl w-full max-w-lg">
        <h2 className="font-bold text-lg mb-3">Edit {app.title}</h2>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded-lg mb-2 bg-transparent" placeholder="Title"/>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 border rounded-lg mb-2 bg-transparent" rows={3} placeholder="Description"/>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <select value={cat} onChange={e=>setCat(e.target.value)} className="p-2 border rounded-lg bg-transparent"><option>Labyrinth</option><option>Game</option><option>Tool</option><option>Utility</option><option>Other</option></select>
          <input value={ver} onChange={e=>setVer(e.target.value)} className="p-2 border rounded-lg bg-transparent" placeholder="Version"/>
        </div>
        <textarea value={log} onChange={e=>setLog(e.target.value)} className="w-full p-2 border rounded-lg mb-2 bg-transparent" rows={2} placeholder="What's new?"/>
        <select value={priceType} onChange={e=>setPriceType(e.target.value)} className="w-full p-2 border rounded-lg mb-3 bg-transparent"><option value="free">Free</option><option value="donate">Donate</option><option value="paid">Paid</option></select>
        <div className="flex gap-2 justify-end"><button onClick={onClose} className="px-4 py-2 rounded-full bg-zinc-200">Cancel</button><button onClick={save} disabled={saving} className="px-4 py-2 rounded-full bg-black text-white">{saving?'Saving...':'Save'}</button></div>
      </div>
    </div>
  );
}
