import React, { useState, useEffect } from 'react';
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

const PALETTES = [
  ['#4f46e5', '#7c3aed', '#ec4899'],
  ['#0284c7', '#2563eb', '#14b8a6'],
  ['#059669', '#10b981', '#06b6d4'],
  ['#d97706', '#ea580c', '#dc2626'],
  ['#9333ea', '#c026d3', '#f43f5e'],
  ['#0f766e', '#0369a1', '#4338ca'],
  ['#be185d', '#9d174d', '#6d28d9'],
  ['#1d4ed8', '#3730a3', '#0e7490'],
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = (name || 'App').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function AppCard({ app, installedState, onOpenDetails, onQuickInstall }: Props) {
  const customImage =
    (app as any).thumbnail ||
    (app as any).thumbnail_url ||
    (app as any).icon_url ||
    (app as any).heroImage ||
    (app as any).raw?.thumbnail_url ||
    (app as any).raw?.icon_url ||
    '';

  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [customImage]);

  const liveUrl =
    (app as any).liveAppUrl ||
    (app as any).websiteUrl ||
    (app as any).raw?.live_web_url ||
    (app as any).raw?.live_app_url ||
    '';
  const apkUrl =
    (app as any).apkUrl ||
    (app as any).raw?.apk_url ||
    (app as any).downloadUrl ||
    (app as any).raw?.download_url ||
    '';
  const isApproved = (app as any).status === 'approved';
  const studio = (app as any).studio || app.developer || 'Indie Studio';
  const category = String(app.category || (app as any).raw?.category || 'App');
  const hasWeb = !!liveUrl && liveUrl.startsWith('http') && !liveUrl.endsWith('.apk');
  const hasApk = !!apkUrl && (apkUrl.includes('.apk') || apkUrl.startsWith('data:application'));
  const isAndroid = /Android/i.test(navigator.userAgent);

  const reviewCount = Number((app as any).reviewCount || (app as any).review_count || 0);
  const installCount = Number((app as any).installCount || (app as any).install_count || (app as any).downloads || 0);
  const ratingVal = Number(app.rating || 0) > 0 ? Number(app.rating).toFixed(1) : '5.0';

  const seed = hashString(`${app.id || ''}-${app.name || ''}-${category}`);
  const palette = PALETTES[seed % PALETTES.length];
  const angle = 115 + (seed % 50);
  const initials = getInitials(app.name || 'App');
  const showCustomImage = Boolean(customImage) && !imgFailed;

  const handleOpenWeb = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickInstall(app);
    if (hasWeb) window.open(liveUrl, '_blank');
  };

  const handleInstallApk = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickInstall(app);
    if (hasApk) {
      const a = document.createElement('a');
      a.href = apkUrl;
      a.download = `${(app.name || 'app').replace(/\s+/g, '-').toLowerCase()}.apk`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <div
      onClick={() => onOpenDetails(app)}
      className="group relative overflow-hidden rounded-[24px] bg-[#12131f] border border-white/10 hover:border-white/25 transition-all cursor-pointer flex flex-col"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetails(app);
        }}
        title={`Open ${app.name} details`}
        className="relative h-[160px] w-full overflow-hidden bg-[#0a0b14] cursor-pointer"
      >
        {showCustomImage ? (
          <img
            src={customImage}
            alt={app.name}
            loading={app.name.includes('Rent Master') || app.name.includes('Ivory') ? 'eager' : 'lazy'}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div
            className="w-full h-full relative flex items-center justify-center overflow-hidden group-hover:scale-105 transition duration-500"
            style={{
              background: `linear-gradient(${angle}deg, ${palette[0]}, ${palette[1]} 55%, ${palette[2]})`,
            }}
          >
            <div
              className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-25 blur-xl"
              style={{ backgroundColor: '#ffffff' }}
            />
            <div
              className="absolute -left-6 -bottom-10 w-32 h-32 rounded-full opacity-20"
              style={{ backgroundColor: '#000000' }}
            />
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-2xl bg-black/30 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg">
                <span className="text-xl font-black tracking-tight text-white">{initials}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-sm">
                {category}
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#12131f] via-transparent to-transparent pointer-events-none" />

        {isApproved && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-400 text-black text-[10px] font-bold rounded-full flex items-center gap-1 shadow">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" /> Approved
          </div>
        )}

        {hasApk && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow"
            style={{ marginTop: isApproved ? 28 : 0 }}
          >
            <Smartphone className="w-3 h-3" /> Android APK
          </div>
        )}

        <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/65 backdrop-blur text-[10px] text-white rounded-full flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="font-bold">{ratingVal}</span>
          {reviewCount > 0 && <span className="text-white/60">({reviewCount})</span>}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[14px] leading-tight text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {app.name}
          </h3>
          <span className="text-[10px] text-white/40 shrink-0">{app.sizeMB}MB</span>
        </div>

        <p className="text-[12px] text-white/50 line-clamp-2 leading-relaxed">
          {app.tagline || (app as any).summary || 'No description'}
        </p>

        <div className="flex items-center justify-between gap-2 mt-1 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="w-3 h-3 shrink-0" />
            <span className="truncate">{studio}</span>
          </div>
          {installCount > 0 && (
            <span className="text-[10px] font-mono text-white/50 shrink-0">
              {installCount.toLocaleString()} {installCount === 1 ? 'install' : 'installs'}
            </span>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          {hasWeb && (
            <button
              onClick={handleOpenWeb}
              className="flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition bg-white text-black hover:bg-white/90"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </button>
          )}
          {hasApk && (
            <button
              onClick={handleInstallApk}
              className={`flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 transition ${
                hasWeb ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              <Download className="w-3.5 h-3.5" /> {isAndroid ? 'Install APK' : 'Get APK'}
            </button>
          )}
          {!hasWeb && !hasApk && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickInstall(app);
              }}
              className="flex-1 h-9 rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 bg-white text-black hover:bg-white/90"
            >
              <Download className="w-3.5 h-3.5" /> {installedState ? 'Open' : 'Install'}
            </button>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(app);
          }}
          className="h-8 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-full text-[11px] font-medium text-white/70 transition"
        >
          Details
        </button>

        {hasWeb && <div className="text-[10px] text-white/30 text-center mt-1 truncate">{liveUrl}</div>}
        {hasApk && isAndroid && (
          <div className="text-[10px] text-violet-300/70 text-center">
            Tap Install APK → Allow unknown sources → Install
          </div>
        )}
      </div>
    </div>
  );
}
