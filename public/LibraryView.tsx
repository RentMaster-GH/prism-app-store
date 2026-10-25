import React, { useState } from 'react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';
import { 
  Download, RefreshCw, Trash2, RotateCcw, 
  HardDrive, CheckCircle2, Play, Sparkles, ExternalLink 
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

  // Installed packages strictly deduplicated by app.id
  const installedApps = Array.from(
    new Map(apps.filter(a => !!installedMap[a.id]).map(a => [a.id, a])).values()
  );

  const totalStorageMB = installedApps.reduce((acc, app) => {
    return acc + (installedMap[app.id]?.storageUsedMB || app.sizeMB);
  }, 0);

  const updatesAvailable = installedApps.filter(app => {
    const installed = installedMap[app.id];
    return installed && installed.installedVersion !== app.currentVersion;
  });

  const handleCleanCache = () => {
    setCleanedCache(true);
    setTimeout(() => setCleanedCache(false), 2500);
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
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCleanCache}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{cleanedCache ? 'Purged 18.2 MB Cache' : 'Clean Sandbox Cache'}</span>
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
              <span>Installed Apps Footprint</span>
            </div>
            <span className="font-mono text-white">
              {totalStorageMB.toFixed(1)} MB <span className="text-slate-500">/ 64.0 GB free</span>
            </span>
          </div>

          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
            {installedApps.map((app, idx) => {
              const colors = ['bg-indigo-500', 'bg-sky-400', 'bg-emerald-400', 'bg-amber-400', 'bg-purple-400'];
              const pct = Math.max(2, Math.min(40, (app.sizeMB / 200) * 100));
              return (
                <div
                  key={app.id}
                  style={{ width: `${pct}%` }}
                  className={`h-full ${colors[idx % colors.length]}`}
                  title={`${app.name}: ${app.sizeMB} MB`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Installed List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Installed Packages ({installedApps.length})
          </h3>
          <span className="text-xs text-slate-500">
            {updatesAvailable.length === 0 ? 'All packages are current' : `${updatesAvailable.length} updates pending`}
          </span>
        </div>

        {installedApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <HardDrive className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm text-slate-300 font-medium">No applications installed yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse the Discover tab to install studio tools or test drive them instantly in your browser.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {installedApps.map(app => {
              const state = installedMap[app.id];
              const isOutdated = state.installedVersion !== app.currentVersion;
              const isUpdating = state.status === 'updating';

              return (
                <div key={app.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={resolveAppMedia(app.thumbnail)}
                      alt={app.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = getAppCategoryPlaceholder(app.category, app.name);
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                    <div>
                      <h4
                        onClick={() => onOpenDetails(app)}
                        className="text-sm font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        {app.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300">v{state.installedVersion}</span>
                        <span className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">{state.storageUsedMB || app.sizeMB} MB</span>
                        <span className="text-slate-600">·</span>
                        <span>{app.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this installed app */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenSandbox(app)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 text-indigo-400 fill-current" />
                      <span>Launch / Test</span>
                    </button>

                    {isUpdating ? (
                      <div className="px-3 py-1.5 bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                        <span>Updating {state.progress}%</span>
                      </div>
                    ) : isOutdated ? (
                      <button
                        onClick={() => onUpdateApp(app)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Update to v{app.currentVersion}</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 rounded border border-emerald-900/40">
                        Up to date
                      </span>
                    )}

                    <button
                      onClick={() => onUninstall(app.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Uninstall application"
                    >
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
