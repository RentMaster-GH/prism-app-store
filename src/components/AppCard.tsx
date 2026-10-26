import React from 'react';
import { AppItem, InstalledAppState } from '../types';
import { Star, Download, Play, ExternalLink, ShieldCheck, Zap, HardDrive, CheckCircle2 } from 'lucide-react';
import { getOptimizedImageUrl, resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

interface Props {
  app: AppItem;
  installedState?: InstalledAppState;
  onOpenDetails: (app: AppItem) => void;
  onQuickInstall: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  index?: number;
}

export const AppCard: React.FC<Props> = ({ app, installedState, onOpenDetails, onQuickInstall, onOpenSandbox, index }) => {
  const installed = !!installedState && installedState.status === 'installed';
  const installing = installedState?.status === 'installing' || installedState?.status === 'updating';
  const progress = installedState?.progress || 0;
  const isEager = index !== undefined && index < 6;

  return (
    <div onClick={()=>onOpenDetails(app)} className="group bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.4)] transition-all duration-300 cursor-pointer flex flex-col">
      <div className="relative h-36 bg-[#0a0b18] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-fuchsia-600/30" />
        <img 
          src={getOptimizedImageUrl(resolveAppMedia(app.heroImage || app.thumbnail),400)} 
          alt={app.name} 
          className="w-full h-full object-cover mix-blend-overlay opacity-70 group-hover:scale-[1.05] transition-transform duration-700" 
          loading={isEager ? "eager" : "lazy"} width={400} height={144}
          onError={e=>{ const t=e.currentTarget; const fb=getAppCategoryPlaceholder(app.category, app.name); if(t.src!==fb) t.src=fb; }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xl flex items-center justify-center overflow-hidden">
          <img src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail),80)} alt="" className="w-8 h-8 object-contain" loading={isEager ? "eager" : "lazy"} width={80} height={80} onError={e=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }} />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {app.liveAppUrl && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow"><span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE</span>}
          {app.offlineCapable && <span className="px-2 py-0.5 bg-black/40 backdrop-blur border border-white/10 text-white/80 text-[10px] font-mono rounded-full flex items-center gap-1"><Zap className="w-3 h-3" />Offline</span>}
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur ${app.privacyGrade==='A+' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20' : 'bg-black/30 text-white/60 border-white/10'}`}><ShieldCheck className="w-3 h-3 inline mr-0.5" />{app.privacyGrade}</span>
        </div>
        <div className="absolute bottom-3 left-16 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-white/90"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-bold">{app.rating.toFixed(1)}</span><span className="text-white/50">· {app.downloadsCount}</span></div>
          {installed && <span className="px-2 py-0.5 bg-white text-black text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Installed</span>}
        </div>
        {installing && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10"><div className="h-full bg-indigo-400 transition-all duration-300" style={{width:`${progress}%`}} /></div>}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="min-w-0"><h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-200 transition-colors">{app.name}</h3><p className="text-xs text-slate-400 truncate mt-0.5">{app.tagline}</p><div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500"><span>{app.category}</span><span>·</span><span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{app.sizeMB} MB</span><span>·</span><span>{app.priceFormatted}</span></div></div>
        <div className="flex items-center gap-2 mt-auto">
          {installed ? (
            <><button onClick={(e)=>{e.stopPropagation(); if(app.liveAppUrl) window.open(app.liveAppUrl,'_blank'); else onOpenSandbox(app);}} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-[0.98] transition"><ExternalLink className="w-3.5 h-3.5" />Launch</button><button onClick={(e)=>{e.stopPropagation(); onOpenSandbox(app);}} className="px-3 py-2.5 bg-white/[0.06] border border-white/10 text-white rounded-full text-xs hover:bg-white/[0.10]"><Play className="w-3.5 h-3.5" /></button></>
          ) : installing ? (
            <div className="flex-1 py-2.5 bg-white/[0.06] border border-white/10 text-indigo-200 rounded-full text-xs font-mono text-center flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />{progress}%</div>
          ) : (
            <><button onClick={(e)=>{e.stopPropagation(); onQuickInstall(app);}} className="flex-1 py-2.5 bg-white text-black rounded-full text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 active:scale-[0.98] transition"><Download className="w-3.5 h-3.5" />Install</button><button onClick={(e)=>{e.stopPropagation(); onOpenSandbox(app);}} className="px-3 py-2.5 bg-white/[0.06] border border-white/10 text-white rounded-full text-xs hover:bg-white/[0.10] flex items-center gap-1.5"><Play className="w-3 h-3 fill-current" />Test</button></>
          )}
        </div>
      </div>
    </div>
  );
};