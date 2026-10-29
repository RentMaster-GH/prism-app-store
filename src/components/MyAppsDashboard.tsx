import React, { useMemo } from 'react';
import { X, Edit3, Trash2, Eye, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { AppItem } from '../types';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  userUID: string;
  isManager: boolean;
  onEdit: (app: AppItem) => void;
  onDelete: (app: AppItem) => void;
  onSelectApp: (app: AppItem) => void;
}

export function MyAppsDashboard({ isOpen, onClose, apps, userUID, isManager, onEdit, onDelete, onSelectApp }: Props) {
  const myApps = useMemo(() => {
    return apps.filter((a: any) => {
      const owner = a.ownerId || a.owner_uid || a.owner_id;
      return owner === userUID;
    });
  }, [apps, userUID]);

  const handleDelete = async (app: AppItem) => {
    if (!confirm(`Delete "${app.name}"? This will move it to deleted status. You can restore from Manager Console.`)) return;
    try {
      if (supabase) {
        await supabase.from('apps').update({ status: 'deleted' } as any).eq('uuid', app.id);
      }
      // Also save to trash log for restore
      const logRaw = localStorage.getItem('prism_deleted_apps_log');
      const log = logRaw ? JSON.parse(logRaw) : [];
      log.unshift({
        id: `del-${Date.now()}`,
        name: app.name,
        developer: app.developer,
        category: app.category,
        reason: 'Deleted by owner',
        deletedBy: userUID,
        deletedAt: new Date().toLocaleTimeString(),
        originalApp: app
      });
      localStorage.setItem('prism_deleted_apps_log', JSON.stringify(log.slice(0, 50)));
    } catch {}
    onDelete(app);
  };

  const handleEdit = (app: AppItem) => {
    onEdit(app);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[720px] max-h-[85vh] bg-[#12131f] border border-white/10 rounded-[24px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-white">My Uploads</h2>
            <p className="text-[11px] text-white/40">UID: {userUID} • {myApps.length} app{myApps.length!==1?'s':''} • Persistent across updates</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {myApps.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3"><Eye className="w-5 h-5 text-white/30" /></div>
              <p className="text-[13px] font-bold text-white">No uploads yet</p>
              <p className="text-[11px] text-white/40 mt-1">Publish from Dev Portal — your UID {userUID} is auto-saved and never wiped on update</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myApps.map((app) => {
                const status = (app as any).status || 'approved';
                const thumb = (app as any).thumbnail || (app as any).heroImage || '';
                const liveUrl = (app as any).liveAppUrl || (app as any).websiteUrl || '';
                const installs = (app as any).raw?.install_count || (app as any).downloadsCount || 1;
                return (
                  <div key={app.id} className="group bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition">
                    <div className="aspect-[16/9] relative bg-black/40 overflow-hidden">
                      <img src={thumb} alt={app.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500" />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${status==='approved'?'bg-emerald-400 text-black':'bg-amber-400 text-black'}`}>
                          {status==='approved' ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> {status}</>}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button onClick={()=>handleEdit(app)} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow hover:scale-105 transition" title="Edit - you own this"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={()=>handleDelete(app)} className="w-8 h-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow hover:scale-105 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-bold text-white truncate">{app.name}</h3>
                          <p className="text-[11px] text-white/50 truncate">{app.category} • {installs} installs</p>
                        </div>
                        <button onClick={()=>onSelectApp(app)} className="shrink-0 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition"><Eye className="w-3.5 h-3.5" /></button>
                      </div>
                      {liveUrl && (
                        <a href={liveUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200 truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" /> {liveUrl.replace(/^https?:\/\//,'').slice(0,28)}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2 shrink-0">
          <button onClick={onClose} className="flex-1 h-10 bg-white/10 hover:bg-white/15 rounded-full text-[12px] font-bold text-white transition">Close</button>
          <button onClick={()=>{ onClose(); document.dispatchEvent(new CustomEvent('open-dev-portal')); }} className="flex-1 h-10 bg-white text-black rounded-full text-[12px] font-bold hover:bg-white/90 transition">Publish New</button>
        </div>
      </div>
    </div>
  );
}