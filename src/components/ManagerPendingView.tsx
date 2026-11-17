import { useEffect, useState } from 'react';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { backend } from '../lib/backend';

export function ManagerPendingView({ managerKey }: { managerKey: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await backend.list('apps');
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      const normalized = items
        .map((item: any) => ({
          ...(item?.data || item || {}),
          id: item.id || item?.data?.id || item?.data?.uuid,
          created_at: item.created_at || item?.data?.created_at || '',
        }))
        .filter((a: any) => a.status !== 'deleted')
        .sort((a: any, b: any) => {
          const pA = a.status === 'pending' ? -1 : 1;
          const pB = b.status === 'pending' ? -1 : 1;
          if (pA !== pB) return pA - pB;
          return String(b.created_at).localeCompare(String(a.created_at));
        });
      setApps(normalized);
    } catch (e) {
      console.warn('Failed to load submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (app: any, status: string) => {
    try {
      await backend.update('apps', app.id, {
        ...app,
        status,
        updated_at: new Date().toISOString(),
      });
      await load();
    } catch (e: any) {
      alert('Failed to update status: ' + (e?.message || e));
    }
  };

  const del = async (app: any) => {
    if (!confirm(`Delete ${app.title}?`)) return;
    try {
      await backend.remove('apps', app.id);
      await load();
    } catch (e: any) {
      alert('Delete failed: ' + (e?.message || e));
    }
  };

  const pendingCount = apps.filter(a => a.status === 'pending').length;
  const displayApps = filter === 'pending' ? apps.filter(a => a.status === 'pending') : apps;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-bold text-sm flex items-center gap-2">
          Submissions
          <span className={`px-2.5 py-0.5 rounded-full text-xs ${pendingCount > 0 ? 'bg-amber-400 text-black animate-pulse' : 'bg-white/10'}`}>
            Pending ({pendingCount})
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/5">Total {apps.length}</span>
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-full text-xs font-bold ${filter === 'pending' ? 'bg-amber-400 text-black' : 'bg-white/10'}`}
          >
            Pending Only
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-xs ${filter === 'all' ? 'bg-white text-black' : 'bg-white/10'}`}
          >
            All
          </button>
          <button onClick={load} className="px-3 py-1 rounded-full text-xs bg-white/10">
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {displayApps.length === 0 && (
        <div className="py-10 text-center text-sm text-white/40">No {filter} apps. 🎉 All caught up!</div>
      )}

      {displayApps.map(app => (
        <div key={app.id} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-2xl">
          <img
            src={app.thumbnail_url || app.icon_url || app.download_url || `https://picsum.photos/seed/${encodeURIComponent(app.id || 'prism')}/120/120`}
            className="w-12 h-12 rounded-xl object-cover bg-white/5"
            alt={app.title}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{app.title} — {app.status}</div>
            <div className="text-[11px] text-white/50 truncate">{app.live_web_url || app.package_name || 'Android APK'}</div>
            <div className="text-[10px] mt-1">
              <span className={`px-2 py-0.5 rounded-full ${app.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10'}`}>
                {app.status}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {app.live_web_url && (
              <a href={app.live_web_url} target="_blank" rel="noreferrer" className="h-7 w-7 grid place-items-center bg-white/10 rounded-full">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {app.status !== 'approved' && (
              <button
                onClick={() => updateStatus(app, 'approved')}
                className="h-7 px-3 bg-emerald-500 text-black rounded-full text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3 h-3" />Approve
              </button>
            )}
            {app.status !== 'rejected' && (
              <button
                onClick={() => updateStatus(app, 'rejected')}
                className="h-7 px-3 bg-white/10 rounded-full text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />Reject
              </button>
            )}
            <button
              onClick={() => del(app)}
              className="h-7 w-7 grid place-items-center bg-red-500/20 text-red-300 rounded-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
