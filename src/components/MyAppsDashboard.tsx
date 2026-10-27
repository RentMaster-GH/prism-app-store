import React, { useMemo } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apps: any[];
  userUID: string;
  isManager: boolean;
  onEdit: (app:any)=>void;
  onDelete: (app:any)=>void;
  onSelectApp: (app:any)=>void;
}

export const MyAppsDashboard: React.FC<Props> = ({ isOpen, onClose, apps, userUID, isManager, onEdit, onDelete, onSelectApp }) => {
  if (!isOpen) return null;

  const myApps = useMemo(()=>{
    return apps.filter((a:any) => a.ownerUID === userUID || a.ownerId === userUID || (isManager && a.isUserUploaded));
  }, [apps, userUID, isManager]);

  const stats = {
    total: myApps.length,
    live: myApps.filter((a:any)=>!a.isHidden).length,
    views: myApps.reduce((s:number,a:any)=> s + (a.views||0), 0)
  };

  return (
    <div className="fixed inset-0 z-[105] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#12132a] border border-white/10 p-6 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-[18px]">My Apps Dashboard</h3>
            <p className="text-[11px] text-slate-400">{stats.total} apps • {stats.live} live • {stats.views} total views • UID: <span className="font-mono text-violet-300">{userUID.slice(0,8)}...</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 text-white">✕</button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-[#0a0b18] border border-white/5 p-3"><p className="text-[10px] text-slate-400">TOTAL</p><p className="text-white font-bold text-[20px]">{stats.total}</p></div>
          <div className="rounded-xl bg-[#0a0b18] border border-white/5 p-3"><p className="text-[10px] text-slate-400">LIVE</p><p className="text-emerald-400 font-bold text-[20px]">{stats.live}</p></div>
          <div className="rounded-xl bg-[#0a0b18] border border-white/5 p-3"><p className="text-[10px] text-slate-400">VIEWS</p><p className="text-white font-bold text-[20px]">{stats.views}</p></div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {myApps.length===0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No apps yet</p>
              <p className="text-[11px] text-slate-600 mt-1">Upload your first app to see it here</p>
            </div>
          ) : myApps.map((app:any)=>(
            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b18] border border-white/5 hover:border-white/10">
              <div className="flex items-center gap-3 cursor-pointer" onClick={()=>onSelectApp(app)}>
                <img src={app.icon || app.logo} className="w-10 h-10 rounded-xl object-cover bg-white/10" alt="" />
                <div>
                  <p className="text-white text-[13px] font-semibold">{app.name}</p>
                  <p className="text-[11px] text-slate-400">{app.category || 'App'} • {app.isHidden ? 'Hidden' : 'Live'}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={()=>onEdit(app)} className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[11px] hover:bg-white/20">Edit</button>
                <button onClick={()=>onDelete(app)} className="px-3 py-1.5 rounded-full bg-rose-950/50 text-rose-300 text-[11px] border border-rose-900/50 hover:bg-rose-900/50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
