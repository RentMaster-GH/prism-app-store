import React, { useState } from 'react';
import { X, Upload, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const DevSubmitModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ title: '', studio: '', tagline: '', live_web_url: '', thumbnail_url: '', category: 'Synth', package_size: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.live_web_url.startsWith('https://')) { setMsg('live_web_url must be https://'); return; }
    setLoading(true);
    const { error } = await supabase.from('apps').insert([{
      title: form.title,
      studio: form.studio,
      tagline: form.tagline,
      live_web_url: form.live_web_url,
      thumbnail_url: form.thumbnail_url || `https://picsum.photos/seed/${form.title}/600/400`,
      category: form.category,
      package_size: form.package_size || '10 MB',
      monetization: 'Free',
      rating: 5.0,
      installs: 0,
      status: 'pending'
    }]);
    setLoading(false);
    if (error) { setMsg(error.message); } 
    else { setMsg('Submitted! Pending owner approval.'); setTimeout(()=>{ onClose(); setMsg(''); setForm({ title: '', studio: '', tagline: '', live_web_url: '', thumbnail_url: '', category: 'Synth', package_size: '' }) }, 1500); }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#12132a] border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-[14px] flex items-center gap-2"><Upload className="w-4 h-4"/>Submit your app to Prism Store</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white grid place-items-center"><X className="w-4 h-4"/></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="App Title - e.g. Prism Synth" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.studio} onChange={e=>setForm({...form, studio:e.target.value})} placeholder="Studio name" className="h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
            <input value={form.package_size} onChange={e=>setForm({...form, package_size:e.target.value})} placeholder="Package size - e.g. 24 MB" className="h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          </div>
          <input required value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} placeholder="Tagline - one line description" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <input required value={form.live_web_url} onChange={e=>setForm({...form, live_web_url:e.target.value})} placeholder="https://your-app.vercel.app" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <input value={form.thumbnail_url} onChange={e=>setForm({...form, thumbnail_url:e.target.value})} placeholder="Thumbnail URL (optional)" className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none" />
          <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none">
            <option>Synth</option><option>Effect</option><option>DAW</option><option>Notes</option><option>Tool</option>
          </select>
          <div className="flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck className="w-3 h-3 text-green-400"/>We sandbox apps - no access to Prism UID or localStorage</div>
          <button disabled={loading} className="w-full h-11 rounded-full bg-white text-black font-bold text-[13px] disabled:opacity-50">{loading ? 'Submitting...' : 'Submit for Review'}</button>
          {msg && <p className="text-[12px] text-violet-300 text-center">{msg}</p>}
        </form>
      </div>
    </div>
  );
};
