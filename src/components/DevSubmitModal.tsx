import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DevSubmitModal = ({ isOpen, onClose, userUID }: { isOpen: boolean; onClose: () => void; userUID?: string }) => {
  const [form, setForm] = useState({ title: '', studio: '', tagline: '', live_web_url: '', thumbnail_url: '', category: 'Synth', package_size: '' });
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.live_web_url.startsWith('https://')) { setMsg('live_web_url must be https://'); return; }
    setLoading(true);
    try {
      let thumbUrl = form.thumbnail_url;
      if (file) {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g,'')}`;
        const { error: upErr } = await supabase.storage.from('app-thumbnails').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('app-thumbnails').getPublicUrl(path);
        thumbUrl = data.publicUrl;
      }
      if (!thumbUrl) thumbUrl = `https://picsum.photos/seed/${form.title}/600/400`;

      const { error } = await supabase.from('apps').insert([{
        title: form.title,
        studio: form.studio,
        tagline: form.tagline,
        live_web_url: form.live_web_url,
        thumbnail_url: thumbUrl,
        category: form.category,
        package_size: form.package_size || '10 MB',
        monetization: 'Free',
        rating: 5.0,
        installs: 0,
        status: 'pending',
        owner_uid: userUID || 'anonymous'
      }]);
      if (error) throw error;
      setMsg('Submitted! Pending approval. Check My Apps to edit.');
      setTimeout(()=>{ onClose(); setForm({ title: '', studio: '', tagline: '', live_web_url: '', thumbnail_url: '', category: 'Synth', package_size: '' }); setFile(null); setPreview(''); setMsg(''); }, 1500);
    } catch (err:any) { setMsg(err.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#12132a] border border-white/10 p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-[14px] flex items-center gap-2"><Upload className="w-4 h-4"/>Submit your app</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white grid place-items-center"><X className="w-4 h-4"/></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="App Title" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.studio} onChange={e=>setForm({...form, studio:e.target.value})} placeholder="Studio name" className="h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
            <input value={form.package_size} onChange={e=>setForm({...form, package_size:e.target.value})} placeholder="10 MB" className="h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          </div>
          <input required value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} placeholder="One line tagline" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <input required value={form.live_web_url} onChange={e=>setForm({...form, live_web_url:e.target.value})} placeholder="https://your-app.vercel.app" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <div className="rounded-lg bg-[#0a0b18] border border-white/10 p-3">
            <label className="text-[11px] text-slate-400 flex items-center gap-2 mb-2"><ImageIcon className="w-3 h-3"/>App Thumbnail (upload or paste URL)</label>
            <input type="file" accept="image/*" onChange={onFile} className="w-full text-[11px] text-slate-400 file:mr-2 file:h-8 file:px-3 file:rounded-full file:bg-white file:text-black file:text-[11px] file:font-bold file:border-0" />
            <div className="flex gap-2 mt-2">
              <input value={form.thumbnail_url} onChange={e=>setForm({...form, thumbnail_url:e.target.value})} placeholder="https://.../thumbnail.png (optional)" className="flex-1 h-9 px-3 rounded-lg bg-[#12132a] border border-white/10 text-white text-[12px] outline-none" />
            </div>
            {preview && <img src={preview} className="mt-3 w-full h-32 object-cover rounded-lg border border-white/10" />}
            {!preview && form.thumbnail_url && <img src={form.thumbnail_url} className="mt-3 w-full h-32 object-cover rounded-lg border border-white/10" />}
          </div>
          <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none"><option>Synth</option><option>Effect</option><option>DAW</option><option>Notes</option><option>Tool</option></select>
          <div className="flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck className="w-3 h-3 text-green-400"/>Sandboxed - no access to Prism data</div>
          <button disabled={loading} className="w-full h-11 rounded-full bg-white text-black font-bold text-[13px] disabled:opacity-50">{loading ? 'Uploading...' : 'Submit for Review'}</button>
          {msg && <p className="text-[12px] text-violet-300 text-center">{msg}</p>}
        </form>
      </div>
    </div>
  );
};
