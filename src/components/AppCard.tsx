import React from 'react';
import { ExternalLink, Download, Star, Globe } from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';

interface Props {
  index: number;
  app: AppItem;
  installedState?: InstalledAppState;
  onOpenDetails: (app: AppItem) => void;
  onQuickInstall: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
}

export function AppCard({ app, installedState, onOpenDetails, onQuickInstall }: Props) {
  const thumbnail = (app as any).thumbnail || (app as any).heroImage || `https://picsum.photos/seed/${app.id}/600/400`;
  const isExternal = !!(app as any).liveAppUrl && (app as any).liveAppUrl.startsWith('http') && !(app as any).download_url;
  const liveUrl = (app as any).liveAppUrl || (app as any).websiteUrl || (app as any).raw?.live_web_url || '';
  const isApproved = (app as any).status === 'approved';
  const studio = (app as any).studio || app.developer;

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExternal && liveUrl) {
      window.open(liveUrl, '_blank');
    } else {
      onQuickInstall(app);
    }
  };

  return (
    <div onClick={() => onOpenDetails(app)} className="group relative overflow-hidden rounded-[24px] bg-[#12131f] border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col">
      <div className="relative h-[160px] w-full overflow-hidden bg-[#0a0b14]">
        <img 
          src={thumbnail} 
          alt={app.name} 
          loading={app.name.includes('Rent Master') || app.name.includes('Ivory') ? "eager" : "lazy"}
          onError={(e) => { (e.target as any).src = `https://picsum.photos/seed/${app.id}/600/400`; }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12131f] via-transparent to-transparent" />
        {isApproved && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-400 text-black text-[10px] font-bold rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> Approved
          </div>
        )}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur text-[10px] text-white/70 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" /> {app.rating?.toFixed(1) || '5.0'}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[14px] leading-tight text-white line-clamp-1">{app.name}</h3>
          <span className="text-[10px] text-white/40 shrink-0">{app.sizeMB}MB</span>
        </div>
        <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">{app.tagline || (app as any).summary || 'No description'}</p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/30">
          <Globe className="w-3 h-3" /> <span className="truncate">{studio}</span>
        </div>

        <div className="flex gap-2 mt-3">
          <button onClick={handleAction} className={`flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition ${isExternal ? 'bg-white text-black hover:bg-white/90' : 'bg-white text-black hover:bg-white/90'}`}>
            {isExternal ? <><ExternalLink className="w-3.5 h-3.5" /> Open</> : <><Download className="w-3.5 h-3.5" /> {installedState ? 'Open' : 'Install'}</>}
          </button>
          <button onClick={(e)=>{ e.stopPropagation(); onOpenDetails(app); }} className="h-9 px-4 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-full text-[11px] font-medium text-white/70">
            Details
          </button>
        </div>

        {isExternal && <div className="text-[10px] text-white/30 text-center mt-1 truncate">{liveUrl}</div>}
      </div>
    </div>
  );
}