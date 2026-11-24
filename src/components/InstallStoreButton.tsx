import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share, PlusSquare, Monitor, Smartphone, HardDrive, FileArchive } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.credibleartisans.com';

interface ReleaseFile {
  name: string;
  sizeBytes: number;
  updatedAt: string;
  url: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function InstallStoreButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [installCount, setInstallCount] = useState<number | null>(null);
  const [releaseFiles, setReleaseFiles] = useState<ReleaseFile[]>([]);

  const recordInstall = () => {
    fetch(`${BACKEND_URL}/api/store/installs`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.count === 'number') setInstallCount(d.count);
        else setInstallCount((p) => (p !== null ? p + 1 : 1));
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true || localStorage.getItem('prism_store_installed') === '1') {
      setIsInstalled(true);
    }
    if ((navigator as any).getInstalledRelatedApps) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        if (apps && apps.length > 0) { setIsInstalled(true); localStorage.setItem('prism_store_installed', '1'); }
      }).catch(() => {});
    }
    fetch(`${BACKEND_URL}/api/store/installs`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d && typeof d.count === 'number') setInstallCount(d.count);
    }).catch(() => {});
    fetch(`${BACKEND_URL}/api/store/releases`).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d && Array.isArray(d.files)) setReleaseFiles(d.files);
    }).catch(() => {});

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { setIsInstalled(true); localStorage.setItem('prism_store_installed', '1'); setDeferredPrompt(null); setShowFallbackModal(false); recordInstall(); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowFallbackModal(true);
    }
  };

  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={() => {
          if (window.confirm('✅ Prism Store is already installed on this device!\n\nOpen it directly from your Home Screen, Desktop, or App Drawer.\n\nClick OK if you still want to open the installer options.')) {
            setShowFallbackModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/40 transition cursor-pointer"
      >
        <span>✅ Installed on Device</span>
      </button>
    );
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const getMeta = (n: string) => {
    const l = n.toLowerCase();
    if (l.endsWith('.apk')) return { label: 'Android APK', icon: <Smartphone className="w-4 h-4" />, accent: 'bg-emerald-500/10 text-emerald-400', border: 'hover:border-emerald-500/40' };
    if (['.exe', '.msix', '.dmg', '.appimage', '.deb'].some((e) => l.endsWith(e))) return { label: 'Desktop Installer', icon: <HardDrive className="w-4 h-4" />, accent: 'bg-indigo-500/10 text-indigo-400', border: 'hover:border-indigo-500/40' };
    return { label: 'Installer Package', icon: <FileArchive className="w-4 h-4" />, accent: 'bg-sky-500/10 text-sky-400', border: 'hover:border-sky-500/40' };
  };

  return (
    <>
      <button type="button" onClick={handleClick} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer">
        <Download className="w-3.5 h-3.5" />
        <span>Install Store</span>
        {installCount !== null && installCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-200 border border-emerald-400/30">{installCount}</span>
        )}
      </button>

      {showFallbackModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-200 shadow-2xl">
            <button type="button" onClick={() => setShowFallbackModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon-192.png" alt="Prism Store" className="w-10 h-10 rounded-xl border border-slate-700" />
              <div>
                <h3 className="text-base font-bold text-white">Install Prism Store</h3>
                <p className="text-xs text-slate-400">{installCount !== null ? `${installCount} installs • Web App or Standalone Installer` : 'Install as Web App or download standalone installer'}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Direct Installers</p>
              {releaseFiles.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {releaseFiles.map((f) => {
                    const m = getMeta(f.name);
                    const s = formatBytes(f.sizeBytes);
                    return (
                      <a key={f.name} href={`${BACKEND_URL}${f.url}`} download={f.name} onClick={recordInstall} className={`flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 ${m.border} transition group`}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${m.accent}`}>{m.icon}</div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{m.label}</div>
                            <div className="text-[10px] text-slate-400 truncate">{f.name}{s ? ` • ${s}` : ''}</div>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0 ml-2" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <a href={`${BACKEND_URL}/api/store/releases/prism-store.apk`} download="prism-store.apk" onClick={recordInstall} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Smartphone className="w-4 h-4" /></div>
                    <div><div className="text-xs font-semibold text-white">Android APK</div><div className="text-[10px] text-slate-400">Direct .apk</div></div>
                  </a>
                  <a href={`${BACKEND_URL}/api/store/releases/prism-store-desktop.zip`} download="prism-store-desktop.zip" onClick={recordInstall} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 transition">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><HardDrive className="w-4 h-4" /></div>
                    <div><div className="text-xs font-semibold text-white">Desktop App</div><div className="text-[10px] text-slate-400">Win / Mac / Linux</div></div>
                  </a>
                </div>
              )}
            </div>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Browser App (Instant)</p>
            {isIOS ? (
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <p className="flex items-center gap-2"><span className="font-bold text-indigo-400">1.</span>Tap <Share className="w-3.5 h-3.5 inline text-sky-400" /> <strong>Share</strong> in Safari&apos;s toolbar.</p>
                <p className="flex items-center gap-2"><span className="font-bold text-indigo-400">2.</span>Tap <PlusSquare className="w-3.5 h-3.5 inline text-slate-300" /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <p className="flex items-start gap-2"><Monitor className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><span>Open in <strong>Chrome, Edge, or Brave</strong> and click the install icon in the address bar for instant offline-ready installation.</span></p>
              </div>
            )}

            <button type="button" onClick={() => setShowFallbackModal(false)} className="mt-5 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer">Close</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
