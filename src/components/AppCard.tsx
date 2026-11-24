import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Star,
  Pencil,
  Trash2,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { backend } from '../lib/backend';

interface AppCardProps {
  app: any;
  onSelect?: (app: any) => void;
  onLaunch?: (app: any) => void;
  onEdit?: (app: any) => void;
  onDelete?: (app: any) => void;
  isManager?: boolean;
  currentUid?: string;
}

function getFallbackGradient(title: string): string {
  const palettes = [
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-emerald-600 via-teal-600 to-cyan-600',
    'from-amber-500 via-orange-600 to-rose-600',
    'from-blue-600 via-indigo-600 to-violet-700',
    'from-fuchsia-600 via-pink-600 to-rose-500',
    'from-cyan-600 via-sky-600 to-blue-700',
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palettes[Math.abs(hash) % palettes.length];
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onSelect,
  onLaunch,
  onEdit,
  onDelete,
  isManager = false,
  currentUid = '',
}) => {
  const [deleting, setDeleting] = useState(false);
  const [installCount, setInstallCount] = useState<number>(Number(app.install_count || app.installs || 0));
  const [installedLocal, setInstalledLocal] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("prism_installed_apps") || "[]");
      return Array.isArray(saved) && saved.includes(String(app.id));
    } catch { return false; }
  });

  const title = app.title || app.name || 'Untitled App';
  const developer = app.developer || app.studio || app.author || 'Independent Developer';
  const category = app.category || 'Other';
  const description =
    app.description ||
    app.summary ||
    app.tagline ||
    'Verified application hosted on Prism Store.';
  const coverImage =
    app.hero_image ||
    app.thumbnail_url ||
    app.icon_url ||
    app.image ||
    '';

  const rawLiveUrl = (app as any).live_web_url || (app as any).raw?.live_web_url || app.liveAppUrl || app.websiteUrl || app.url || '';
  const liveUrl = rawLiveUrl.replace("://" + "credibleartisans.com" + "/public/", "://" + "api.credibleartisans.com" + "/public/");
  const apkUrl = app.apk_url || app.apkUrl || (String(app.downloadUrl || '').endsWith('.apk') ? app.downloadUrl : '') || '';
  const desktopUrl = app.desktop_url || app.desktopUrl || '';
  const isAndroidDevice = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const preferredBinaryUrl = isAndroidDevice ? (apkUrl || desktopUrl) : (desktopUrl || apkUrl);
  const rating = Number(app.rating || app.average_rating || 5.0).toFixed(1);
  const reviewCount = Number(app.review_count || app.reviewsCount || 0);
  const installs = installCount;
  const isOwner = Boolean(currentUid && app.owner_uid && app.owner_uid === currentUid);
  const canManage = isManager || isOwner;

  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || '')
    .join('') || 'AP';

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    // Non-blocking instant delete (handled with Undo toast in App.tsx)

    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete(app);
      } else if (app.id) {
        await backend.remove('apps', app.id);
        window.dispatchEvent(new CustomEvent('prism:refresh-apps'));
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Could not delete app: ${err?.message || 'Unknown error'}`);
      setDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(app);
    }
  };

  const downloadWebShortcut = () => {
    const rawUrl = (typeof liveUrl !== "undefined" ? liveUrl : (app.live_web_url || app.liveAppUrl || app.websiteUrl || app.url || ""));
    const targetUrl = String(rawUrl).replace("://" + "credibleartisans" + ".com/public/", "://" + "api.credibleartisans" + ".com/public/");
    if (!targetUrl) return;
    const appTitle = String(typeof title !== "undefined" ? title : (app.title || "Sovereign App"));
    const appKey = String(app.id || appTitle).toLowerCase();
    try {
      const instMap = JSON.parse(localStorage.getItem("prism_installed_apps_v1") || "{}");
      if (instMap[appKey]) {
        const openNow = window.confirm(`✅ "${appTitle}" is already installed on your device!\n\nYou can launch it directly from your Home Screen or App Drawer.\n\nClick OK to open it now.`);
        if (openNow) window.open(targetUrl, "_blank", "noopener,noreferrer");
        return;
      }
      instMap[appKey] = Date.now();
      localStorage.setItem("prism_installed_apps_v1", JSON.stringify(instMap));
    } catch {}
    const sep = targetUrl.includes("?") ? "&" : "?";
    window.open(targetUrl + sep + "autoinstall=1", "_blank", "noopener,noreferrer");
  };

  const handleInstallClick = async (e: React.MouseEvent) => {
    trackListedAppMetric('app_install');
    e.stopPropagation();
    // 1. Increment install count in PostgreSQL (core_platform)
    if (app.id) {
      const updated = await backend.trackInstall(String(app.id));
      setInstallCount((prev) => (typeof updated === "number" ? updated : prev + 1));
    }
    try {
      const saved = JSON.parse(localStorage.getItem("prism_installed_apps") || "[]");
      if (Array.isArray(saved) && !saved.includes(String(app.id))) {
        saved.push(String(app.id));
        localStorage.setItem("prism_installed_apps", JSON.stringify(saved));
      }
      setInstalledLocal(true);
    if (!preferredBinaryUrl && liveUrl) downloadWebShortcut();
    } catch {}

    // 2. Trigger APK download if available, or installable standalone app window + offline shortcut
    if (preferredBinaryUrl) {
      const a = document.createElement("a");
      a.href = preferredBinaryUrl;
      a.download = "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (liveUrl) {
      const w = Math.min(window.screen.availWidth, 1280);
      const h = Math.min(window.screen.availHeight, 840);
      window.open(liveUrl, `prism_app_${app.id || title}`, `width=${w},height=${h},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`);
    } else if (onSelect) {
      onSelect(app);
    }
  };

  const trackListedAppMetric = (metricType: 'app_open' | 'app_install') => {
    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || (window.location.hostname !== 'localhost' ? 'https://api.credibleartisans.com' : 'http://localhost:3000');
      let vid = localStorage.getItem('prism_vid');
      if (!vid) { vid = 'V-' + Math.random().toString(36).slice(2, 10); localStorage.setItem('prism_vid', vid); }
      fetch(apiBase + '/api/store/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appSlug: String(app.id || title),
          visitorId: vid,
          eventType: metricType,
          actionLabel: title,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      }).catch(() => {});
    } catch {}
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    trackListedAppMetric('app_open');
    e.stopPropagation();
    if (onLaunch) {
      onLaunch(app);
    } else if (liveUrl) {
      window.open(liveUrl, '_blank', 'noopener,noreferrer');
    } else if (apkUrl) {
      window.open(apkUrl, '_blank', 'noopener,noreferrer');
    } else if (onSelect) {
      onSelect(app);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(app)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/60 hover:shadow-indigo-950/30 cursor-pointer"
    >
      {/* Clickable Cover Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${getFallbackGradient(
              title
            )} p-4 text-white`}
          >
            <span className="text-3xl font-extrabold tracking-wider drop-shadow">
              {initials}
            </span>
            <span className="mt-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
              {category}
            </span>
          </div>
        )}

        {/* Top-Left Status & Featured Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-950 shadow">
            <ShieldCheck className="h-3 w-3" />
            {app.status === 'pending' ? 'Pending' : 'Approved'}
          </span>
          {app.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2 py-0.5 text-[11px] font-semibold text-slate-950 shadow">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>

        {/* Top-Right Rating Pill */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-semibold text-amber-400 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{rating}</span>
          <span className="text-slate-400">({reviewCount})</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-white group-hover:text-indigo-300">
              {title}
            </h3>
            <p className="truncate text-xs text-slate-400">{developer}</p>
          </div>
          <span className="shrink-0 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {category}
          </span>
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-slate-300">
          {description}
        </p>

        {/* Action Row: Open + Details + Manager/Owner Edit & Trash Delete Buttons */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          {liveUrl && (
            <button
              type="button"
              onClick={handleOpenClick}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-indigo-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </button>
          )}

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 shadow-sm shadow-indigo-950/40"
          >
            <Download className="h-3.5 w-3.5" />
            {preferredBinaryUrl ? (isAndroidDevice && apkUrl ? "Get APK" : desktopUrl && !isAndroidDevice ? "Download" : "Get APK") : installedLocal ? "Installed" : "Install"}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(app);
            }}
            title="App Details"
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/90 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {canManage && onEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              title="Edit App"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-2 text-emerald-300 transition hover:bg-emerald-500/25"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleting}
              title="Delete App"
              aria-label="Delete App"
              className="inline-flex items-center justify-center rounded-xl border border-rose-500/40 bg-rose-500/15 px-2.5 py-2 text-rose-400 transition hover:bg-rose-500/30 hover:text-rose-200 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
          <span>{installs.toLocaleString()} installs</span>
          {liveUrl && <span className="truncate max-w-[160px] text-slate-500">{liveUrl.replace(/^https?:\/\//, '')}</span>}
        </div>
      </div>
    </div>
  );
};

export default AppCard;
