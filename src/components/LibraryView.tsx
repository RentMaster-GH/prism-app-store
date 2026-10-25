import React, { useState, useMemo } from 'react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder, getOptimizedImageUrl } from '../utils/media';
import { 
  Download, RefreshCw, Trash2, RotateCcw, 
  HardDrive, CheckCircle2, Play, Sparkles, ExternalLink, Search, PackageOpen 
} from 'lucide-react';

interface LibraryViewProps {
  apps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  onUninstall: (appId: string) => void;
  onUpdateApp: (app: AppItem) => void;
  onUpdateAll: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  apps,
  installedMap,
  onOpenDetails,
  onOpenSandbox,
  onUninstall,
  onUpdateApp,
  onUpdateAll
}) => {
  const [cleanedCache, setCleanedCache] = useState(false);
  const [query, setQuery] = useState('');

  // Installed packages strictly deduplicated by app.id
  const allInstalled = useMemo(() => Array.from(
    new Map(apps.filter(a => !!installedMap[a.id]).map(a => [a.id, a])).values()
  ), [apps, installedMap]);

  const installedApps = useMemo(() => {
    if (!query.trim()) return allInstalled;
    const q = query.toLowerCase();
    return allInstalled.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [allInstalled, query]);

  const totalStorageMB = allInstalled.reduce((acc, app) => {
    return acc + (installedMap[app.id]?.storageUsedMB || app.sizeMB);
  }, 0);

  const updatesAvailable = allInstalled.filter(app => {
    const installed = installedMap[app.id];
    return installed && installed.installedVersion !== app.currentVersion;
  });

  const handleCleanCache = () => {
    setCleanedCache(true);
    if ('vibrate' in navigator) navigator.vibrate(10);
    setTimeout(() => setCleanedCache(false), 2500);
  };

  const handleLaunch = (app: AppItem) => {
    if ('vibrate' in navigator) navigator.vibrate(15);
    if (app.liveAppUrl) window.open(app.liveAppUrl, '_blank', 'noopener,noreferrer');
    else onOpenSandbox(app);
  };

  return (
    <div className="space-y-6">
      {/* Storage and Updates Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 tracking-wider uppercase block mb-1">
              Local Device Management
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Installed Software & Updates
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Transparent local package storage. No background bloat, automatic telemetry cleanup, and instant rollback.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search library..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-40 sm:w-52"
              />
            </div>

            <button
              onClick={handleCleanCache}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{cleanedCache ? 'Purged 18.2 MB Cache' : 'Clean Cache'}</span>
            </button>

            {updatesAvailable.length > 0 && (
              <button
                onClick={onUpdateAll}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update All ({updatesAvailable.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Storage Bar Breakdown */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Installed Footprint · {allInstalled.length} apps</span>
            </div>
            <span className="font-mono text-white">
              {totalStorageMB.toFixed(1)} MB <span className="text-slate-500">/ 64.0 GB free</span>
            </span>
          </div>

          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
            {allInstalled.slice(0,10).map((app, idx) => {
              const colors = ['bg-indigo-500', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];
              const pct = Math.max(3, Math.min(30, (app.sizeMB / 200) * 100));
              return (
                <div
                  key={app.id}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${colors[idx % colors.length]}`}
                  title={`${app.name}: ${app.sizeMB} MB`}
                />
              );
            })}
            {allInstalled.length === 0 && <div className="h-full w-full bg-slate-800/50" />}
          </div>
        </div>
      </div>

      {/* Installed List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            Installed Packages ({installedApps.length})
            {query && <span className="text-xs font-normal text-slate-500">for "{query}"</span>}
          </h3>
          <span className="text-xs text-slate-500">
            {updatesAvailable.length === 0 ? 'All current' : `${updatesAvailable.length} updates pending`}
          </span>
        </div>

        {allInstalled.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-sm text-white font-semibold">No applications installed yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Browse Discover to install studio tools or test drive them instantly. All work offline.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {apps.slice(0,3).map(app => (
                <button key={app.id} onClick={()=>onOpenDetails(app)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-3 hover:border-slate-700 transition-colors text-left">
                  <img src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail),100)} alt={app.name} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0"><div className="text-xs font-semibold text-white truncate">{app.name}</div><div className="text-[11px] text-slate-500 truncate">{app.category}</div></div>
                </button>
              ))}
            </div>
          </div>
        ) : installedApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No apps match "{query}"</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {installedApps.map(app => {
              const state = installedMap[app.id];
              const isOutdated = state.installedVersion !== app.currentVersion;
              const isUpdating = state.status === 'updating';

              return (
                <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail),120)}
                      alt={app.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getAppCategoryPlaceholder(app.category, app.name);
                        if (target.src !== fallback) target.src = fallback;
                      }}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 onClick={() => onOpenDetails(app)} className="text-sm font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors truncate">
                        {app.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                        <span className="font-mono text-slate-300">v{state.installedVersion}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">{state.storageUsedMB || app.sizeMB} MB</span>
                        <span className="text-slate-600">·</span>
                        <span className="truncate">{app.category}</span>
                        {app.liveAppUrl && <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Live</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleLaunch(app)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      title={app.liveAppUrl ? `Launch ${app.liveAppUrl}` : 'Open test drive'}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Launch</span>
                    </button>

                    <button
                      onClick={() => onOpenSandbox(app)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 text-indigo-400 fill-current" />
                      <span>Test</span>
                    </button>

                    {isUpdating ? (
                      <div className="px-3 py-1.5 bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        <span>{state.progress}%</span>
                      </div>
                    ) : isOutdated ? (
                      <button onClick={() => onUpdateApp(app)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <RefreshCw className="w-3 h-3" />
                        <span>Update v{app.currentVersion}</span>
                      </button>
                    ) : (
                      <span className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 rounded border border-emerald-900/40 items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Up to date</span>
                    )}

                    <button onClick={() => onUninstall(app.id)} className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors" title="Uninstall">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};