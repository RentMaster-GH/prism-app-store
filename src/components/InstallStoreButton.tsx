import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare, Monitor } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.credibleartisans.com';

export function InstallStoreButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [installCount, setInstallCount] = useState<number | null>(null);

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Fetch live store install count from custom backend
    fetch(`${BACKEND_URL}/api/store/installs`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setInstallCount(data.count);
        }
      })
      .catch(() => {});

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

      {showFallbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                    ? `${installCount} installs • Add to your device`
                    : 'Add to your home screen or desktop'}
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <p className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400">1.</span>
                  Tap the <Share className="w-4 h-4 inline text-sky-400" /> <strong>Share</strong> button in Safari&apos;s toolbar.
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400">2.</span>
                  Scroll down and tap <PlusSquare className="w-4 h-4 inline text-slate-300" /> <strong>Add to Home Screen</strong>.
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400">3.</span>
                  Tap <strong>Add</strong> in the top-right corner.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <p className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    For one-click installation, open <strong>Prism Store</strong> in <strong>Chrome, Edge, or Brave</strong> and click the install icon in the address bar.
                  </span>
                </p>
                <p className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                  Tip: In Firefox, you can bookmark this page or drag the URL icon to your desktop for quick access.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowFallbackModal(false)}
              className="mt-5 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
