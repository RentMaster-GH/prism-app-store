import React, { useEffect, useState } from 'react';
import { Trash2, Edit3, Save, X, Image as ImageIcon, KeyRound } from 'lucide-react';
import { backend } from '../lib/backend';

export const MySubmissionsView = ({ userUID }: { userUID: string }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importUID, setImportUID] = useState('');
  const [activeUID, setActiveUID] = useState(userUID);
  const [merchantStats, setMerchantStats] = useState<{ totalTx: number; confirmedTx: number; volume: string } | null>(null);

  useEffect(() => {
    const ep = "https://" + ["api", "credibleartisans", "com"].join(".") + "/public/p2p-router/metrics";
    fetch(ep)
      .then((r) => r.json())
      .then((d) => {
        if (d?.totals) {
          setMerchantStats({
            totalTx: Number(d.totals.total_instructions || 0),
            confirmedTx: Number(d.totals.confirmed_instructions || 0),
            volume: String(d.totals.total_confirmed_volume || d.totals.total_volume || "0.00"),
          });
        }
      })
      .catch(() => {});
  }, []);

  const load = async (uid: string) => {
    setLoading(true);
    try {
      const res = await backend.list('apps');
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      const owned = items
        .map((item: any) => ({
          ...(item?.data || item || {}),
          id: item.id || item?.data?.id || item?.data?.uuid,
          created_at: item.created_at || item?.data?.created_at || '',
        }))
        .filter((a: any) => a.owner_uid === uid && a.status !== 'deleted')
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)));
      setApps(owned);
      window.dispatchEvent(new CustomEvent("prism-uploads-count", { detail: owned.length }));
    } catch (e) {
      console.warn('Failed to load user submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const del = async (id: string) => {
    if (!confirm('Delete this app?')) return;
    try {
      await backend.remove('apps', id);
      await load(activeUID);
    } catch (e: any) {
      alert('Delete failed: ' + (e?.message || e));
    }
  };

  const save = async () => {
    if (!editing) return;
    try {
      await backend.update('apps', editing.id, {
        ...editing,
        title: editing.title,
        jamz: editing.title,
        tagline: editing.tagline,
        description: editing.tagline,
        live_web_url: editing.live_web_url,
        thumbnail_url: editing.thumbnail_url,
        category: editing.category,
        updated_at: new Date().toISOString(),
      });
      setEditing(null);
      await load(activeUID);
    } catch (e: any) {
      alert('Save failed: ' + (e?.message || e));
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">

      <div className="rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/35 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">📊 Live Developer &amp; Merchant Settlement Telemetry</div>
          <div className="mt-1 flex flex-wrap gap-4 text-xs text-slate-200">
            <span>📦 My Apps: <strong>{apps.length}</strong></span>
            <span>✅ Confirmed P2P Settlements: <strong>{merchantStats ? merchantStats.confirmedTx : "—"}</strong></span>
            <span>💱 Verified Network Volume: <strong>{merchantStats ? merchantStats.volume : "—"}</strong></span>
          </div>
        </div>
        <a
          href={"https://" + ["api", "credibleartisans", "com"].join(".") + "/public/aetherhost/live/ledger.soul"}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
        >
          🛡️ Audit Ledger ↗
        </a>
      </div>

      <div className="rounded-xl bg-[#12132a] border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white font-bold text-[13px]">
          <KeyRound className="w-4 h-4" />Your Portable Owner Key (UID)
        </div>
        <div className="mt-2 flex gap-2">
          <div className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-violet-300 font-mono text-[12px] flex items-center">
            {activeUID}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeUID);
              alert('Copied UID - save it to access on any device');
            }}
            className="h-10 px-4 rounded-full bg-white text-black font-bold text-[11px]"
          >
            Copy
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={importUID}
            onChange={e => setImportUID(e.target.value)}
            placeholder="Have a UID from another device? Paste PRISM-..."
            className="flex-1 h-9 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[12px] outline-none"
          />
          <button onClick={handleImport} className="h-9 px-4 rounded-full bg-white/10 text-white font-bold text-[11px]">
            Import
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Save your UID. It's your passkey across all devices. No email needed.</p>
      </div>

      <h2 className="text-white font-bold text-[16px]">My Apps ({apps.length}) - Edit / Delete on any device</h2>
      {loading && <div className="text-slate-400 text-[13px]">Loading...</div>}
      {!loading && apps.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
          <p className="text-white font-bold text-[14px]">No submissions for {activeUID}</p>
          <p className="text-slate-400 text-[12px] mt-1">Click Dev Submit or import a different UID</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {apps.map(app => (
          <div key={app.id} className="rounded-xl bg-[#12132a] border border-white/10 p-4 space-y-3">
            <div className="flex gap-3">
              <img
                src={app.thumbnail_url || app.icon_url || `https://picsum.photos/seed/${encodeURIComponent(app.id || 'prism')}/120/120`}
                className="w-16 h-16 rounded-lg object-cover bg-[#0a0b18]"
                alt={app.title}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-[13px] truncate">{app.title}</div>
                <div className="text-[11px] text-slate-400">{app.status} • {app.install_count || app.installs || 0} installs</div>
                <div className="text-[11px] text-slate-500 truncate">{app.live_web_url || app.package_name || 'Android APK'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(app)}
                className="flex-1 h-8 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3 h-3" />Edit
              </button>
              <button
                onClick={() => del(app.id)}
                className="flex-1 h-8 rounded-full bg-red-500/20 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#12132a] border border-white/10 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold">Edit App</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              value={editing.title || ''}
              onChange={e => setEditing({ ...editing, title: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]"
            />
            <input
              value={editing.tagline || ''}
              onChange={e => setEditing({ ...editing, tagline: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]"
            />
            <input
              value={editing.live_web_url || ''}
              onChange={e => setEditing({ ...editing, live_web_url: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]"
            />
            <div className="flex gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400 mt-2" />
              <input
                value={editing.thumbnail_url || ''}
                onChange={e => setEditing({ ...editing, thumbnail_url: e.target.value })}
                placeholder="Thumbnail URL"
                className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px]"
              />
            </div>
            {editing.thumbnail_url && <img src={editing.thumbnail_url} className="w-full h-32 object-cover rounded-lg" alt="Preview" />}
            <button onClick={save} className="w-full h-11 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
