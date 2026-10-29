import React from 'react';
import { AppItem, InstalledAppState } from '../types';
import { ExternalLink, Play, Trash2, Download, HardDrive, Rocket, RefreshCw } from 'lucide-react';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

interface Props {
  apps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  onUninstall: (appId: string) => void;
  onUpdateApp: (app: AppItem) => void;
  onUpdateAll: () => void;
}

export const LibraryView: React.FC<Props> = ({ apps, installedMap, onOpenDetails, onOpenSandbox, onUninstall, onUpdateApp, onUpdateAll }) => {
  const installedApps = apps.filter(a => installedMap[a.id]);
  const hasUpdates = installedApps.some(a => installedMap[a.id]?.installedVersion !== a.currentVersion);

  if (installedApps.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 rounded-[20px] bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4">
          <HardDrive className="w-7 h-7 text-slate-500" />
        </div>
        <h3 className="text-white font-bold">Your library is empty</h3>
        <p className="text-sm text-slate-500 mt-1">Install apps from Discover to see them here offline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold tracking-tight">Library & Updates • {installedApps.length}</h2>
        {hasUpdates && (
          <button onClick={onUpdateAll} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold flex items-center gap-2 hover:bg-slate-100 active:scale-[0.98] transition">
            <RefreshCw className="w-3.5 h-3.5" /> Update All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {installedApps.map(app => {
          const state = installedMap[app.id];
          const needsUpdate = state.installedVersion !== app.currentVersion;
          
          const handleLaunch = () => {
            if (app.liveAppUrl) {
              window.open(app.liveAppUrl, '_blank', 'noopener,noreferrer');
            } else {
              onOpenSandbox(app);
            }
          };

          return (
            <div key={app.id} className="group bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-4 flex gap-4 hover:bg-white/[0.05] transition">
              <img 
                src={resolveAppMedia(app.thumbnail) || getAppCategoryPlaceholder(app.category, app.name)} 
                alt={app.name} 
                className="w-14 h-14 rounded-xl bg-white object-contain p-1.5 shrink-0 border border-slate-200"
                onError={e => { (e.currentTarget as HTMLImageElement).src = getAppCategoryPlaceholder(app.category, app.name); }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{app.name}</h3>
                <p className="text-[11px] text-slate-400 truncate">{app.tagline}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                  <span>v{state.installedVersion}</span><span>·</span><span>{state.storageUsedMB} MB</span>
                  {needsUpdate && <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/20">Update: v{app.currentVersion}</span>}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={handleLaunch} className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 active:scale-[0.98] transition">
                    <ExternalLink className="w-3.5 h-3.5" /> Launch
                  </button>
                  {needsUpdate ? (
                    <button onClick={() => onUpdateApp(app)} className="h-8 px-3 rounded-full bg-indigo-500 text-white text-xs font-medium hover:bg-indigo-400 transition">Update</button>
                  ) : (
                    <button onClick={() => onOpenSandbox(app)} className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-white text-xs flex items-center gap-1 hover:bg-white/[0.10] transition"><Play className="w-3 h-3" /> Test</button>
                  )}
                  <button onClick={() => onUninstall(app.id)} className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-red-500/15 hover:border-red-500/20 hover:text-red-300 text-slate-500 transition ml-auto">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};