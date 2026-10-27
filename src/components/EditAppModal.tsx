import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  app: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditAppModal({ app, isOpen, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changelog, setChangelog] = useState('');
  const [studio, setStudio] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!app) return;
    setTitle(app.name || app.title || app.jamz || app.title_raw || app.raw?.title || '');
    setDescription(app.tagline || app.summary || app.description || app.raw?.description || '');
    setChangelog(app.changelog || app.raw?.changelog || app.features?.[0] || 'Live');
    setStudio(app.developer || app.studio || app.raw?.studio || '');
    setLiveUrl(app.liveAppUrl || app.websiteUrl || app.raw?.live_web_url || app.raw?.live_app_url || '');
  }, [app]);

  if (!isOpen || !app) return null;

  const currentUID = localStorage.getItem('prism_user_uid');
  const owner = app.ownerId || app.owner_uid || app.owner_id || app.raw?.owner_uid || '';
  const isOwner = owner === currentUID;

  const handleSave = async () => {
    if (!isOwner) {
      alert(`You can't edit this app. Owner is ${owner}, you are ${currentUID}`);
      return;
    }
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);
    try {
      if (supabase) {
        const uuid = app.raw?.uuid || app.id;
        
        // FIX: ONLY update editable fields - NEVER touch status, is_featured, owner_uid, uuid
        // This prevents 14 -> 10 bug where approved gets overwritten to null
        const updatePayload = {
          title: title.trim(),
          jamz: title.trim(),
          description: description.trim(),
          tagline: description.trim(),
          changelog: changelog.trim(),
          studio: studio.trim(),
          live_web_url: liveUrl.trim(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('apps').update(updatePayload).eq('uuid', uuid);
        
        if (error) {
          console.warn('Update by uuid failed, trying id:', error.message);
          await supabase.from('apps').update(updatePayload).eq('id', app.id);
        }
      }

      // Update local cache too
      try {
        const raw = localStorage.getItem('prism_user_uploaded_apps');
        if (raw) {
          const arr = JSON.parse(raw);
          const updated = arr.map((a: any) =>
            a.id === app.id ? { ...a, name: title, tagline: description, title, description, studio, liveAppUrl: liveUrl } : a
          );
          localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(updated));
        }
      } catch {}

      onSaved();
      onClose();
    } catch (e: any) {
      alert('Save failed: ' + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#12131f] border border-white/10 rounded-[24px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-bold text-white truncate">Edit {app.name || app.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition"><X className="w-4 h-4 text-white" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Rent Master, The Ivory Labyrinth..." className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Studio / Developer</label>
            <input value={studio} onChange={e => setStudio(e.target.value)} placeholder="Digital Remote Services, Anon..." className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What does your app do?" className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-2xl text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] resize-none transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Live URL</label>
            <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://rentmastergh.com" className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">What's new?</label>
            <input value={changelog} onChange={e => setChangelog(e.target.value)} placeholder="Live, Bug fixes..." className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition" />
          </div>

          {!isOwner && (
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              <p className="text-[11px] text-amber-300">You don't own this app. Owner: {owner || 'anon'}. Editing is disabled to protect Rent Master (anon).</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 h-11 bg-white/10 hover:bg-white/15 rounded-full text-[13px] font-bold text-white transition disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !title.trim() || !isOwner} className="flex-1 h-11 bg-white text-black rounded-full text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white/90 transition">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>

        <div className="mt-3 text-[10px] text-white/20 text-center truncate">UID: {currentUID} | ID: {app.id} | Owner: {owner} | Status preserved: {(app as any).status || app.raw?.status}</div>
      </div>
    </div>
  );
}

export default EditAppModal;