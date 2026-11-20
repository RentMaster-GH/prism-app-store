import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share, PlusSquare, Monitor, Smartphone, HardDrive } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://credibleartisans.com';

// Update these URLs once you host your packaged .apk and desktop installers (e.g., GitHub Releases or self-hosted storage)
const APK_DOWNLOAD_URL =
  import.meta.env.VITE_STORE_APK_URL ||
  `${BACKEND_URL}/api/store/releases/prism-store.apk`;
const DESKTOP_DOWNLOAD_URL =
  import.meta.env.VITE_STORE_DESKTOP_URL ||
  `${BACKEND_URL}/api/store/releases/prism-store.apk`;

export function InstallStoreButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [installCount, setInstallCount] = useState<number | null>(null);

  const recordInstall = () => {
    fetch(`${BACKEND_URL}/api/store/installs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setInstallCount(data.count);
        } else {
          setInstallCount((prev) => (prev !== null ? prev + 1 : 1));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    fetch(`${BACKEND_URL}/api/store/installs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setInstallCount(data.count);
        }
      })
      .catch(() => {});

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowFallbackModal(false);
      recordInstall();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowFallbackModal(true);
    }
  };

  if (isInstalled) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install Store</span>
        {installCount !== null && installCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-200 border border-emerald-400/30">
            {installCount}
          </span>
        )}
      </button>

      {showFallbackModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 text-slate-200 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowFallbackModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/icon-192.png"
                  alt="Prism Store"
                  className="w-10 h-10 rounded-xl border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white">Install Prism Store</h3>
                  <p className="text-xs text-slate-400">
                    {installCount !== null
                      ? `${installCount} installs • Web App or Standalone Installer`
                      : 'Install as Web App or download standalone installer'}
                  </p>
                </div>
              </div>

              {/* Direct Standalone Downloads */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Direct Installers
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={APK_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={recordInstall}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">Android APK</div>
                      <div className="text-[10px] text-slate-400">Direct .apk</div>
                    </div>
                  </a>

                  <a
                    href={DESKTOP_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={recordInstall}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 transition group"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">Desktop App</div>
                      <div className="text-[10px] text-slate-400">Win / Mac / Linux</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Browser / PWA Instructions */}
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Browser App (Instant)
              </p>
              {isIOS ? (
                <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400">1.</span>
                    Tap <Share className="w-3.5 h-3.5 inline text-sky-400" /> <strong>Share</strong> in Safari&apos;s toolbar.
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400">2.</span>
                    Tap <PlusSquare className="w-3.5 h-3.5 inline text-slate-300" /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <p className="flex items-start gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      Open in <strong>Chrome, Edge, or Brave</strong> and click the install icon in the address bar for instant offline-ready installation.
                    </span>
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowFallbackModal(false)}
                className="mt-5 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
