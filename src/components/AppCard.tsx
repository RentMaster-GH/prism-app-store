import React from 'react';
import { ExternalLink, Info, Pencil, Trash2, Star, Download, ShieldCheck } from 'lucide-react';
import { getUniqueThumbnail } from '../utils/storeHelpers';

export interface AppItem {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  developer?: string;
  studio?: string;
  version?: string;
  size?: string;
  live_web_url?: string;
  liveAppUrl?: string;
  websiteUrl?: string;
  apk_url?: string;
  thumbnail_url?: string;
  icon_url?: string;
  hero_image?: string;
  status?: string;
  featured?: boolean;
  owner_uid?: string;
  rating?: number;
  review_count?: number;
  install_count?: number;
  created_at?: string;
}

interface AppCardProps {
  app: AppItem;
  currentUid?: string;
  isManager?: boolean;
  onOpenApp?: (app: AppItem) => void;
  onSelectDetails?: (app: AppItem) => void;
  onEditApp?: (app: AppItem) => void;
  onDeleteApp?: (app: AppItem) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  currentUid,
  isManager = false,
  onOpenApp,
  onSelectDetails,
  onEditApp,
  onDeleteApp,
}) => {
  const displayTitle = app.title || app.name || 'Untitled App';
  const displayDeveloper = app.studio || app.developer || 'Community Developer';
  const displayCategory = app.category || 'Other';
  const isOwner = Boolean(currentUid && app.owner_uid && currentUid === app.owner_uid);
  const canEdit = isManager || isOwner;
  const canDelete = isManager || isOwner;

  const thumbnail = getUniqueThumbnail(app);
  const ratingValue = typeof app.rating === 'number' && app.rating > 0 ? app.rating.toFixed(1) : '5.0';
  const reviewCount = app.review_count || 0;
  const installCount = app.install_count || 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/90 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/50 hover:shadow-indigo-950/30">
      {/* Clickable Thumbnail Banner */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectDetails?.(app)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectDetails?.(app);
          }
        }}
        className="relative h-40 w-full cursor-pointer overflow-hidden bg-slate-950"
        title={`View details for ${displayTitle}`}
      >
        <img
          src={thumbnail}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

        {/* Status Pill */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-md border border-emerald-500/30">
            <ShieldCheck className="h-3 w-3" />
            {app.status === 'pending' ? 'Pending' : 'Approved'}
          </span>
        </div>

        {/* Rating & Installs Pill */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-0.5 text-xs font-medium text-amber-300 backdrop-blur-md border border-slate-800">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{ratingValue}</span>
          <span className="text-slate-400">({reviewCount})</span>
        </div>

        {/* Edit & Delete Floating Controls on Thumbnail Top-Right Hover or Action Bar */}
        {(canEdit || canDelete) && (
          <div
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && onEditApp && (
              <button
                type="button"
                onClick={() => onEditApp(app)}
                title={isOwner ? 'Edit (you own this)' : 'Edit app listing'}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/90 text-slate-200 shadow-md backdrop-blur-md transition hover:border-indigo-400 hover:bg-indigo-600 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && onDeleteApp && (
              <button
                type="button"
                onClick={() => onDeleteApp(app)}
                title={isManager ? 'Delete app (Manager)' : 'Delete your app'}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-950/90 text-rose-300 shadow-md backdrop-blur-md transition hover:border-rose-400 hover:bg-rose-600 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-bold text-white">{displayTitle}</h3>
            <span className="shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {displayCategory}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
            {app.description || 'No description provided.'}
          </p>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">{displayDeveloper}</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Download className="h-3 w-3" />
              {installCount}
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenApp?.(app)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </button>

            {canDelete && onDeleteApp && (
              <button
                type="button"
                onClick={() => onDeleteApp(app)}
                title={isManager ? 'Delete listing (Store Manager)' : 'Remove your listing'}
                className="flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-2 text-rose-400 transition hover:bg-rose-600 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectDetails?.(app)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/70 hover:text-white"
          >
            <Info className="h-3.5 w-3.5" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
