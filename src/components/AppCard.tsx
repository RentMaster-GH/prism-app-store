import React from 'react';
import { ExternalLink, Download, Star, Globe, Smartphone } from 'lucide-react';
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
  const liveUrl = (app as any).liveAppUrl || (app as any).websiteUrl || (app as any).raw?.live_web_url || (app as any).raw?.live_app_url || '';
  const apkUrl = (app as any).apkUrl || (app as any).raw?.apk_url || (app as any).downloadUrl || (app as any).raw?.download_url || '';
  const isApproved = (app as any).status === 'approved';
  const studio = (app as any).studio || app.developer;
  const hasWeb = !!liveUrl && liveUrl.startsWith('http') && !liveUrl.endsWith('.apk');
  const hasApk = !!apkUrl && apkUrl.includes('.apk');
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleOpenWeb = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasWeb) window.open(liveUrl, '_blank');
  };

  const handleInstallApk = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasApk) {
      // Use <a download> via location - triggers Android installer prompt
      window.location.href = apkUrl;
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
        {hasApk && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1" style={{ marginTop: isApproved ? 28 : 0 }}>
            <Smartphone className="w-3 h-3" /> Android APK
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
          {/* WEB - always available if it exists */}
          {hasWeb && (
            <button onClick={handleOpenWeb} className="flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition bg-white text-black hover:bg-white/90">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </button>
          )}
          {/* APK - show on Android, or on PC show as Download */}
          {hasApk && (
            <button onClick={handleInstallApk} className={`flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition ${hasWeb ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-white text-black hover:bg-white/90'}`}>
              <Download className="w-3.5 h-3.5" /> {isAndroid ? 'Install APK' : 'Get APK'}
            </button>
          )}
          {/* No web, no APK - old flow */}
          {!hasWeb && !hasApk && (
            <button onClick={(e) => { e.stopPropagation(); onQuickInstall(app); }} className="flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 bg-white text-black">
              <Download className="w-3.5 h-3.5" /> {installedState ? 'Open' : 'Install'}
            </button>
          )}
        </div>

        <button onClick={(e) => { e.stopPropagation(); onOpenDetails(app); }} className="h-8 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-full text-[11px] font-medium text-white/70">
          Details
        </button>

        {hasWeb && <div className="text-[10px] text-white/30 text-center mt-1 truncate">{liveUrl}</div>}
        {hasApk && isAndroid && <div className="text-[10px] text-violet-300/70 text-center">Tap Install APK → Allow unknown sources → Install</div>}
      </div>
    </div>
  );
}