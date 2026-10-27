import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // When new SW takes over, reload once - but DO NOT clear localStorage
      if (show) window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.ready.then(registration => {
      // Check for waiting worker immediately
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShow(true);
      }

      // Listen for new updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });

    // Check every 60s for updates (Vercel deploy)
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then(reg => reg.update().catch(()=>{}));
    }, 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, [show]);

  const handleUpdate = () => {
    if (!waitingWorker) {
      window.location.reload();
      return;
    }
    // IMPORTANT: Preserve sessions - only skip waiting, never clear storage
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setShow(false);
    // controllerchange will trigger reload automatically
    setTimeout(() => window.location.reload(), 500);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-[90] max-w-[360px]">
      <div className="bg-[#1a1c2e] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><RefreshCw className="w-4 h-4 text-black" /></div>
            <div>
              <p className="text-[13px] font-bold text-white">New version available</p>
              <p className="text-[11px] text-white/50">Your UID, My Uploads & Library are preserved</p>
            </div>
          </div>
          <button onClick={()=>setShow(false)} className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={()=>setShow(false)} className="flex-1 h-9 bg-white/10 hover:bg-white/15 rounded-full text-[12px] font-bold text-white transition">Later</button>
          <button onClick={handleUpdate} className="flex-1 h-9 bg-white text-black rounded-full text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-white/90 transition"><RefreshCw className="w-3.5 h-3.5" /> Update</button>
        </div>
        <p className="text-[9px] text-white/20 text-center mt-2">Update keeps PRISM-UID-{localStorage.getItem('prism_user_uid')?.slice(-4) || '8015'} safe</p>
      </div>
    </div>
  );
}

export default PWAUpdatePrompt;