import React from 'react';
import { Star, Download, Play, Check, ShieldCheck, ExternalLink } from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

interface AppCardProps {
  app: AppItem;
  installedState?: InstalledAppState;
  onOpenDetails: (app: AppItem) => void;
  onQuickInstall: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  installedState,
  onOpenDetails,
  onQuickInstall,
  onOpenSandbox,
}) => {
  const isInstalled = installedState?.status === 'installed';
  const isInstalling = installedState?.status === 'installing';
  const isUpdating = installedState?.status === 'updating';

  return (
    <div className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top media thumbnail / preview */}
        {app.thumbnail && (
          <div
            onClick={() => onOpenDetails(app)}
            className="w-full aspect-[16/10] rounded-lg overflow-hidden mb-3.5 bg-slate-950 relative cursor-pointer border border-slate-800/60"
          >
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
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            {app.liveAppUrl && (
              <a
                href={app.liveAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-emerald-950/85 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-600/50 text-[10px] font-mono flex items-center gap-1 backdrop-blur-md shadow-md transition-colors"
                title="Open Live Web Application"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span>Live App</span>
              </a>
            )}
            {/* Quick Test Drive Overlay trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSandbox(app);
              }}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-[11px] font-medium text-slate-200 rounded border border-slate-700/60 flex items-center gap-1.5 shadow-lg transition-colors"
            >
              <Play className="w-2.5 h-2.5 fill-current text-indigo-400" />
              <span>Test Drive</span>
            </button>
          </div>
        )}

        {/* Clean Unboxed Metadata (NO PILLS) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1.5">
          <span>{app.category}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{app.developer}</span>
          {app.developerVerified && (
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline shrink-0" />
          )}
          {app.isFlagged && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-rose-400 font-mono text-[10px] font-bold">Flagged Policy Violation</span>
            </>
          )}
          {(app.isUserUploaded || app.id === 'adinkra-studio') && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-300 font-mono text-[10px]">Owner: You</span>
            </>
          )}
        </div>

        {/* App Title & Tagline */}
        <h3
          onClick={() => onOpenDetails(app)}
          className="text-base font-semibold text-white tracking-tight hover:text-indigo-300 transition-colors cursor-pointer"
        >
          {app.name}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {app.tagline}
        </p>

        {/* Unboxed Spec Strip */}
        <div className="flex items-center gap-2.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-slate-200 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="tabular-nums font-mono">{app.rating.toFixed(1)}</span>
            <span className="text-slate-500 text-[11px]">({app.reviewCount})</span>
          </div>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <span className="tabular-nums font-mono text-[11px] text-slate-400">
            {app.sizeMB} MB
          </span>

          <span aria-hidden="true" className="text-slate-700">·</span>

          <span className="text-[11px] font-medium text-emerald-400">
            Privacy {app.privacyGrade}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-3 border-t border-slate-800/60">
        <div>
          <span className="text-sm font-semibold text-white tabular-nums">
            {app.priceFormatted}
          </span>
          {app.priceModel === 'Open Source' && (
            <span className="text-[10px] text-teal-400 block font-mono">Open Source</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isInstalling || isUpdating ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{installedState?.progress || 0}%</span>
            </div>
          ) : isInstalled ? (
            <button
              onClick={() => onOpenDetails(app)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 rounded-lg text-xs font-medium hover:bg-emerald-900/30 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Installed</span>
            </button>
          ) : (
            <button
              onClick={() => onQuickInstall(app)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span>{app.price === 0 ? 'Get App' : `Buy ${app.priceFormatted}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
