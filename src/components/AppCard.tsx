import React from 'react';
import { AppItem, InstalledAppState } from '../types';
import { Star, Download, Play, ShieldCheck } from 'lucide-react';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

export const AppCard: React.FC<any> = ({ app, installedState, onOpenDetails, onQuickInstall, onOpenSandbox, index = 0 }) => {
  const installed = !!installedState;
  const isInstalling = installedState?.status === 'installing' || installedState?.status === 'updating';
  const progress = installedState?.progress || 0;
  
  return (
    <div className="group relative rounded-[20px] bg-[#12132a] border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#161730] transition-all duration-300 overflow-hidden hover:shadow-[0_16px_48px_-16px_rgba(99,102,241,0.4)] hover:-translate-y-[2px] flex flex-col">
      {isInstalling && <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 z-20 transition-all" style={{width:`${progress}%`}} />}
      
      {/* Top image area - brighter than your video */}
      <div className="relative h-[132px] overflow-hidden bg-gradient-to-br from-violet-600/80 via-indigo-600/80 to-fuchsia-600/80">
        <img src={resolveAppMedia(app.thumbnail) || getAppCategoryPlaceholder(app.category, app.name)} alt={app.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-[1.05] transition duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12132a] via-transparent to-transparent" />
        
        {/* Badges - visible in your video but now cleaner */}
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <div className="flex gap-1.5">
            <span className="px-2 py-1 rounded-full bg-emerald-500 text-[9px] font-bold text-white">LIVE</span>
            <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[9px] font-medium text-white/80 flex items-center gap-1">OFFline</span>
          </div>
          <span className="px-2 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-[9px] font-medium text-white/80">{app.privacyGrade || 'A+'}</span>
        </div>
        
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-white"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{app.rating.toFixed(1)}</span>
          <span className="text-[10px] text-white/60">• {app.reviewCount > 1000 ? `${Math.floor(app.reviewCount/1000)}K+` : app.reviewCount}</span>
        </div>
      </div>
      
      <div className="p-3.5 flex-1 flex flex-col">
        <h4 className="text-[13px] font-bold text-white leading-tight truncate">{app.name}</h4>
        <p className="text-[11px] text-slate-400 truncate mt-1 line-clamp-1">{app.tagline}</p>
        <p className="text-[10px] text-slate-500 mt-1">{app.category} • {app.sizeMB} MB • {app.priceFormatted}</p>
        
        <div className="mt-3 flex items-center gap-2">
          {installed ? (
            <button onClick={()=>{ if (app.liveAppUrl) window.open(app.liveAppUrl,'_blank'); else onOpenSandbox(app); }} className="flex-1 h-8 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-100 active:scale-[0.98] transition flex items-center justify-center gap-1">
              {installedState?.installedVersion !== app.currentVersion ? 'Update' : 'Launch'}
            </button>
          ) : (
            <button onClick={()=>onQuickInstall(app)} disabled={isInstalling} className="flex-1 h-8 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-100 active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-60">
              {isInstalling ? `${progress}%` : <><Download className="w-3.5 h-3.5" />Install</>}
            </button>
          )}
          <button onClick={()=>onOpenSandbox(app)} className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-[11px] hover:bg-white/[0.10] hover:text-white transition">Test</button>
        </div>
      </div>
    </div>
  );
};