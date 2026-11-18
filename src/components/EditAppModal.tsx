import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { backend } from '../lib/backend';
import { STORE_CATEGORIES } from './DevSubmitModal';

interface Props {
  app: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

async function compressThumbnail(file: File, maxWidth = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas unavailable'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

export function EditAppModal({ app, isOpen, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changelog, setChangelog] = useState('');
  const [studio, setStudio] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [category, setCategory] = useState('Other');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!app) return;
    setTitle(app.name || app.title || app.jamz || app.title_raw || app.raw?.title || '');
    setDescription(app.tagline || app.summary || app.description || app.raw?.description || '');
    setChangelog(app.changelog || app.raw?.changelog || app.features?.[0] || 'Live');
    setStudio(app.developer || app.studio || app.raw?.studio || '');
    setLiveUrl(app.liveAppUrl || app.websiteUrl || app.raw?.live_web_url || app.raw?.live_app_url || '');
    setCategory(app.category || app.raw?.category || 'Other');
    setThumbnailUrl(
      app.thumbnail_url ||
        app.thumbnail ||
        app.heroImage ||
        app.icon_url ||
        app.raw?.thumbnail_url ||
        app.raw?.icon_url ||
        ''
    );
  }, [app]);

  if (!isOpen || !app) return null;

  const currentUID = localStorage.getItem('prism_user_uid') || localStorage.getItem('prism_uid') || '';
  const owner = app.ownerId || app.owner_uid || app.owner_id || app.raw?.owner_uid || '';
  const managerBypass = typeof window !== 'undefined' && localStorage.getItem('prism_is_manager') === 'true';
  const isOwner = managerBypass || owner === currentUID;

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressThumbnail(file);
      setThumbnailUrl(compressed);
    } catch (err: any) {
      alert(err.message || 'Could not process image');
    }
  };

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
      const targetId = String(app.raw?.id || app.raw?.uuid || app.id || '');
      const cleanThumb = thumbnailUrl.trim() || null;

      const updatePayload = {
        title: title.trim(),
        jamz: title.trim(),
        description: description.trim(),
        tagline: description.trim(),
        changelog: changelog.trim(),
        studio: studio.trim(),
        category,
        live_web_url: liveUrl.trim(),
        thumbnail_url: cleanThumb,
        icon_url: cleanThumb,
        updated_at: new Date().toISOString(),
      };

      if (targetId && !targetId.startsWith('app-')) {
        await backend.update('apps', targetId, updatePayload);
      }

      try {
        const raw = localStorage.getItem('prism_user_uploaded_apps');
        if (raw) {
          const arr = JSON.parse(raw);
          const updated = arr.map((a: any) =>
            a.id === app.id
              ? {
                  ...a,
                  name: title.trim(),
                  title: title.trim(),
                  tagline: description.trim(),
                  description: description.trim(),
                  studio: studio.trim(),
                  category,
                  liveAppUrl: liveUrl.trim(),
                  thumbnail: cleanThumb,
                  thumbnail_url: cleanThumb,
                  icon_url: cleanThumb,
                }
              : a
          );
          localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(updated));
        }
      } catch {}

      onSaved?.();
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
      <div className="relative w-full max-w-lg bg-[#12131f] border border-white/10 rounded-[24px] p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-white truncate">Edit {app.name || app.title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Custom Cover Thumbnail Upload & Preview */}
          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">App Cover Thumbnail</label>
            <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-black/50 border border-white/10 mb-2 flex items-center justify-center">
              {thumbnailUrl ? (
                <>
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl('')}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/75 text-white text-[10px] font-bold rounded-full hover:bg-red-500/80 transition"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <div className="text-center text-white/30 text-xs flex flex-col items-center gap-1">
                  <ImageIcon className="w-6 h-6" />
                  <span>Auto-generated unique gradient cover</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 h-10 bg-white/10 hover:bg-white/15 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shrink-0 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Image
              </button>
              <input
                value={thumbnailUrl.startsWith('data:') ? '' : thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder={thumbnailUrl.startsWith('data:') ? 'Custom uploaded image selected' : 'Or paste cover image URL (https://...)'}
                className="flex-1 h-10 px-4 bg-white/[0.06] border border-white/10 rounded-full text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rent Master, The Ivory Labyrinth..." className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Studio / Developer</label>
              <input value={studio} onChange={(e) => setStudio(e.target.value)} placeholder="Digital Remote Services" className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[13px] text-white focus:outline-none focus:border-white/20 transition">
                {STORE_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#12131f]">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does your app do?" className="w-full px-4 py-3 bg-white/[0.06] border border-white/10 rounded-2xl text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Live URL</label>
            <input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://rentmastergh.com" className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">What's new?</label>
            <input value={changelog} onChange={(e) => setChangelog(e.target.value)} placeholder="Live, Bug fixes..." className="w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition" />
          </div>

          {!isOwner && (
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
              <p className="text-[11px] text-amber-300">You don't own this app. Owner: {owner || 'anon'}. Editing is disabled.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={saving} className="flex-1 h-11 bg-white/10 hover:bg-white/15 rounded-full text-[13px] font-bold text-white transition disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !title.trim() || !isOwner} className="flex-1 h-11 bg-white text-black rounded-full text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white/90 transition">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAppModal;
