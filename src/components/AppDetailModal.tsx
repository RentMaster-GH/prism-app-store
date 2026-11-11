import { useState } from 'react';
import { X, ExternalLink, Star, Shield, Download, Smartphone, Globe, Copy, Check } from 'lucide-react';
import { AppItem } from '../types';
import { AppReviews } from './AppReviews';

export function AppDetailModal({ app, installedState, onClose, onInstall, onUninstall, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState<'overview' | 'reviews'>('overview');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  if (!app) return null;

  const safeName = String(app.name || app.title || 'Untitled');
  const safeTagline = String(app.tagline || app.summary || '');
  const safeCategory = String(app.category || (app as any).blty || 'Other');
  const safeVersion = String(app.currentVersion || (app as any).version_raw || (app as any).version || (app as any).raw?.version_name || '1.0.0');
  const safeDeveloper = String(app.developer || (app as any).studio || 'Indie Engineer');
  const safeSize = String(app.sizeMB || (app as any).package_size || '15');
  const safePackage = String((app as any).packageName || (app as any).package_name || (app as any).raw?.package_name || '');
  const safeAppType = String((app as any).appType || (app as any).app_type || (app as any).raw?.app_type || '');

  // --- WEB URL: must be http AND NOT an .apk file ---
  const rawLive = String(app.liveAppUrl || app.websiteUrl || (app as any).live_web_url || (app as any).live_app_url || (app as any).raw?.live_web_url || '');
  const safeLiveUrl = rawLive.endsWith('.apk') ? '' : rawLive;

  // --- APK URL: check every possible field ---
  const rawDownload = String((app as any).downloadUrl || (app as any).download_url || (app as any).raw?.download_url || '');
  const rawApk = String((app as any).apkUrl || (app as any).apk_url || (app as any).raw?.apk_url || '');
  const safeApkUrl = rawApk || (rawDownload.endsWith('.apk') ? rawDownload : '') || (safeLiveUrl.endsWith('.apk') ? safeLiveUrl : '');

  const hasWeb = !!safeLiveUrl && safeLiveUrl.startsWith('http');
  const hasApk = !!safeApkUrl && safeApkUrl.startsWith('http') && safeApkUrl.includes('.apk');
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isPC = /Windows|Macintosh|Linux/i.test(navigator.userAgent);
  const isInstalled = installedState?.status === 'installed';

  const handleOpen = () => {
    if (hasWeb) window.open(safeLiveUrl, '_blank');
  };

  const handleInstallApk = () => {
    if (!hasApk) return;
    setDownloading(true);
    // Android: direct navigation triggers system installer prompt
    // PC / iOS: downloads file so user can send it to their Android phone
    const a = document.createElement('a');
    a.href = safeApkUrl;
    a.download = `${safeName.replace(/\s+/g, '-').toLowerCase()}.apk`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setDownloading(false), 2000);
  };

  const handleCopyApkLink = async () => {
    try {
      await navigator.clipboard.writeText(safeApkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const safeChangelog = String((app as any).changelog_raw || (app as any).changelog || '');
  const safeSummary = String(app.summary || app.tagline || (app as any).description || (app as any).raw?.description || '');

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
              <span className="truncate">{safeName}</span>
              {safeVersion && <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full shrink-0">v{safeVersion}</span>}
              {hasApk && <span className="text-xs px-2 py-0.5 bg-violet-600 text-white rounded-full shrink-0 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Android APK</span>}
              {hasWeb && <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full shrink-0 flex items-center gap-1"><Globe className="w-3 h-3" /> Web</span>}
              {(app as any).price_type_raw && String((app as any).price_type_raw).toLowerCase() !== 'free' && <span className="text-xs px-2 py-0.5 bg-amber-400 text-black rounded-full shrink-0">{String((app as any).price_type_raw)}</span>}
            </h2>
            <p className="text-sm text-white/60 truncate">{safeTagline}</p>
            {safeChangelog && <p className="text-xs mt-2 text-amber-200/70 line-clamp-2">Whats new: {safeChangelog}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full shrink-0"><X className="w-5 h-5 text-white" /></button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setTab('overview')} className={`px-3 py-1.5 rounded-full text-xs ${tab === 'overview' ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>Overview</button>
            <button onClick={() => setTab('reviews')} className={`px-3 py-1.5 rounded-full text-xs ${tab === 'reviews' ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>Reviews</button>
            <button onClick={() => { try { localStorage.setItem('prism_report_app', JSON.stringify(app)); } catch {} window.dispatchEvent(new CustomEvent('open-report-portal', { detail: app })); }} className="px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-800">Report this app</button>
          </div>

          {tab === 'overview' && (
            <>
              <p className="text-sm text-white/70 leading-relaxed">{safeSummary || 'No description.'}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Category</div><div className="font-semibold text-white truncate">{safeCategory}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Version</div><div className="font-semibold text-white">{safeVersion}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Developer</div><div className="font-semibold text-white truncate">{safeDeveloper}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Size</div><div className="font-semibold text-white">{safeSize} MB</div></div>
              </div>

              {safePackage && (
                <div className="p-3 bg-white/[0.04] rounded-xl text-xs flex items-center justify-between gap-2">
                  <div><div className="text-white/40">Package Name</div><div className="font-mono text-white truncate">{safePackage}</div></div>
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              )}

              {/* --- ACTIONS: Web + APK side by side --- */}
              <div className="flex gap-2">
                {hasWeb && (
                  <button onClick={handleOpen} className="flex-1 h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Open
                  </button>
                )}

                {hasApk && (
                  <button onClick={handleInstallApk} disabled={downloading} className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> {downloading ? 'Downloading...' : isAndroid ? 'Download APK' : 'Download APK'}
                  </button>
                )}

                {!hasWeb && !hasApk && (
                  <>
                    {!isInstalled
                      ? <button onClick={() => onInstall && onInstall(app)} className="flex-1 h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Install</button>
                      : <button onClick={() => onUninstall && onUninstall(app.id || app.uuid)} className="flex-1 h-11 bg-white/10 text-white rounded-full font-bold text-sm">Uninstall</button>}
                  </>
                )}
              </div>

              {/* APK help text - shows on every device so PC users know what to do */}
              {hasApk && (
                <div className="p-3 bg-violet-600/10 border border-violet-500/20 rounded-xl text-xs text-violet-200 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> How to install on Android</p>
                  <p>1. Tap Download APK → allow download in Chrome</p>
                  <p>2. Open the downloaded file → Allow “Install unknown apps” if asked</p>
                  <p>3. Tap Install → Open</p>
                  {isPC && <p className="text-white/50">On PC? Download the APK, then send it to your phone via WhatsApp / USB / Google Drive.</p>}
                  <button onClick={handleCopyApkLink} className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-[11px] font-bold">
                    {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Link copied!</> : <><Copy className="w-3 h-3" /> Copy APK link</>}
                  </button>
                </div>
              )}

              {hasWeb && hasApk && (
                <p className="text-[11px] text-white/40 text-center">Want instant try? Click Open. Want full native app? Click Download APK.</p>
              )}
            </>
          )}
          {tab === 'reviews' && <AppReviews appId={String(app.id || app.uuid || '')} isManager={!!isStoreManager} />}
        </div>
      </div>
    </div>
  );
}