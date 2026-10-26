import React, { useState } from 'react';
import { X, Upload, Shield, Link2, Code2, Globe, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userUID: string;
}

export const DevSubmitModal: React.FC<Props> = ({ isOpen, onClose, userUID }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    studio: '',
    tagline: '',
    description: '',
    live_web_url: '',
    hosted_url: '',
    source_url: '',
    thumbnail_url: '',
    category: 'Synth',
    monetization: 'Free',
  });
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const validate = (): string | null => {
    if (form.title.trim().length < 3) return "Software Title must be at least 3 chars";
    if (form.studio.trim().length < 2) return "Studio / Developer required";
    if (!form.live_web_url.startsWith('https://')) return "Live Web App URL must start with https://";
    try { new URL(form.live_web_url); } catch { return "Live Web App URL is not a valid URL"; }
    if (form.hosted_url && !form.hosted_url.startsWith('https://')) return "Hosted URL must be https:// or empty";
    if (form.source_url && form.source_url.length > 0 && !form.source_url.startsWith('https://')) return "Source URL must be https:// or empty";
    if (form.tagline.length > 120) return "Tagline max 120 chars";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      // 1. Rate limit: 3 per 24h per UID
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error: countErr } = await supabase
        .from('apps')
        .select('id', { count: 'exact', head: true })
        .eq('owner_uid', userUID)
        .gte('created_at', since);
      
      if (countErr) throw countErr;
      if ((count || 0) >= 3) {
        throw new Error("Rate limit: max 3 submissions per 24h. Try tomorrow.");
      }

      // 2. Upload thumbnail if selected
      let finalThumb = form.thumbnail_url;
      if (thumbFile) {
        if (thumbFile.size > 2 * 1024 * 1024) throw new Error("Thumbnail max 2MB");
        const fileName = `${userUID}/${Date.now()}-${thumbFile.name.replace(/[^a-z0-9.]/gi,'-')}`;
        const { error: upErr } = await supabase.storage.from('app-media').upload(fileName, thumbFile, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('app-media').getPublicUrl(fileName);
        finalThumb = data.publicUrl;
      }

      // 3. Insert as pending
      const { error: insErr } = await supabase.from('apps').insert({
        owner_uid: userUID,
        title: form.title.trim(),
        studio: form.studio.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        live_web_url: form.live_web_url.trim(),
        hosted_url: form.hosted_url.trim() || null,
        source_url: form.source_url.trim() || null,
        thumbnail_url: finalThumb || null,
        category: form.category,
        monetization: form.monetization,
        status: 'pending', // <-- crucial: not auto-approved
        rating: 5.0,
        is_offline: true,
        package_size: '36.4 MB',
      });

      if (insErr) throw insErr;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setForm({ title: '', studio: '', tagline: '', description: '', live_web_url: '', hosted_url: '', source_url: '', thumbnail_url: '', category: 'Synth', monetization: 'Free' });
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to submit. Check Supabase tables exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-[#12132a] border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30] flex items-center justify-center"><Code2 className="w-4 h-4 text-white"/></div>
            <div>
              <h2 className="text-[14px] font-bold text-white">Developer Studio & Submit</h2>
              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1"><Shield className="w-3 h-3"/>{userUID}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><X className="w-4 h-4"/></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && <div className="flex gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]"><AlertCircle className="w-4 h-4 shrink-0"/>{error}</div>}
          {success && <div className="flex gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-[11px]"><Check className="w-4 h-4"/>Submitted! Pending moderation — will appear after approval.</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Software Title *</label>
              <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="e.g. Prism Synth" className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white placeholder:text-slate-600 focus:border-violet-500 outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Studio / Developer *</label>
              <input value={form.studio} onChange={e=>setForm({...form, studio:e.target.value})} placeholder="e.g. Prism Labs" className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
              <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white">
                <option>Synth</option><option>Effect</option><option>DAW</option><option>Utility</option><option>All</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">One-line Tagline</label>
              <input value={form.tagline} onChange={e=>setForm({...form, tagline:e.target.value})} maxLength={120} placeholder="The DAW-grade synth that refuses subscription lock-in" className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white"/>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3"/> Live Web App URL * (must be https)</label>
              <input value={form.live_web_url} onChange={e=>setForm({...form, live_web_url:e.target.value})} placeholder="https://your-app.vercel.app" className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Link2 className="w-3 h-3"/> Live Hosted App URL (optional)</label>
              <input value={form.hosted_url} onChange={e=>setForm({...form, hosted_url:e.target.value})} placeholder="https://..." className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white"/>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1"><Code2 className="w-3 h-3"/> Source Code URL (optional)</label>
              <input value={form.source_url} onChange={e=>setForm({...form, source_url:e.target.value})} placeholder="https://github.com/..." className="mt-1 w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3 text-[13px] text-white"/>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thumbnail (max 2MB)</label>
            <div className="mt-1 flex gap-2">
              <input type="file" accept="image/*" onChange={e=>setThumbFile(e.target.files?.[0] || null)} className="flex-1 text-[11px] text-slate-400 file:mr-2 file:h-8 file:px-3 file:rounded-full file:border-0 file:bg-white file:text-black file:text-[11px] file:font-bold"/>
              {thumbFile && <span className="text-[10px] text-green-400 self-center">{(thumbFile.size/1024).toFixed(0)}KB</span>}
            </div>
          </div>

          <button disabled={loading || success} type="submit" className="w-full h-11 rounded-full bg-white text-black text-[13px] font-bold hover:bg-slate-100 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? "Publishing..." : success ? "Submitted!" : <><Upload className="w-4 h-4"/> Publish (Pending Review)</>}
          </button>
          
          <p className="text-[10px] text-center text-slate-500">Apps are manually reviewed. Pending apps don't appear in Discover until approved. Max 3/day per UID.</p>
        </form>
      </div>
    </div>
  );
};