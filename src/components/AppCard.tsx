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
}

export const AppCard: React.FC<Props> = ({ app, installedState, onOpenDetails, onQuickInstall, onOpenSandbox }) => {
  const installed = !!installedState && installedState.status === 'installed';
  const installing = installedState?.status === 'installing' || installedState?.status === 'updating';
  const progress = installedState?.progress || 0;

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(15);
    if (app.liveAppUrl) window.open(app.liveAppUrl, '_blank', 'noopener,noreferrer');
    else onOpenSandbox(app);
  };
  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('vibrate' in navigator) navigator.vibrate(10);
    onQuickInstall(app);
  };

  return (
    <div onClick={()=>onOpenDetails(app)} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer flex flex-col">
      <div className="relative h-36 bg-slate-950 overflow-hidden">
        <img src={getOptimizedImageUrl(resolveAppMedia(app.heroImage || app.thumbnail),400)} alt={app.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" onError={e=>{ const t=e.currentTarget; const fb=getAppCategoryPlaceholder(app.category, app.name); if(t.src!==fb) t.src=fb; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        {/* WHITE container for app icon - fixes black logo invisible in dark mode */}
        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
          <img src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail),80)} alt="" className="w-8 h-8 object-contain" loading="lazy" onError={e=>{ const t=e.currentTarget as HTMLImageElement; t.style.display='none'; }} />
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {app.liveAppUrl && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full animate-pulse" />LIVE</span>}
          {app.offlineCapable && <span className="px-2 py-0.5 bg-slate-800/80 backdrop-blur border border-slate-700 text-slate-300 text-[10px] font-mono rounded-full flex items-center gap-1"><Zap className="w-3 h-3" />Offline</span>}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${app.privacyGrade==='A+' ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50' : 'bg-slate-800/80 text-slate-400 border-slate-700'}`}><ShieldCheck className="w-3 h-3 inline mr-0.5" />{app.privacyGrade}</span>
        </div>
        <div className="absolute bottom-3 left-16 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-white/80"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-mono font-bold text-white">{app.rating.toFixed(1)}</span><span className="text-white/60">· {app.downloadsCount}</span></div>
          {installed && <span className="px-2 py-0.5 bg-white text-slate-900 text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Installed</span>}
        </div>
        {installing && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800"><div className="h-full bg-indigo-500 transition-all duration-300" style={{width:`${progress}%`}} /></div>}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="min-w-0"><h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{app.name}</h3><p className="text-xs text-slate-400 truncate mt-0.5">{app.tagline}</p><div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500"><span>{app.category}</span><span>·</span><span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{app.sizeMB} MB</span><span>·</span><span className="font-mono">{app.priceFormatted}</span></div></div>
        <div className="flex items-center gap-2 mt-auto">
          {installed ? (
            <><button onClick={handleLaunch} className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" />Launch</button><button onClick={(e)=>{e.stopPropagation(); onOpenSandbox(app);}} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs"><Play className="w-3.5 h-3.5" /></button></>
          ) : installing ? (
            <div className="flex-1 py-2 bg-slate-800 text-indigo-300 rounded-xl text-xs font-mono text-center flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />{progress}%</div>
          ) : (
            <><button onClick={handleInstall} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"><Download className="w-3.5 h-3.5" />Install</button><button onClick={(e)=>{e.stopPropagation(); onOpenSandbox(app);}} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5"><Play className="w-3 h-3 fill-current text-indigo-400" />Test</button></>
          )}
        </div>
      </div>
    </div>
  );
};