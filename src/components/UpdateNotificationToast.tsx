import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export const UpdateNotificationToast: React.FC = () => {
  const [show, setShow] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    // Listen for PWA events if plugin exists
    const handleSWUpdated = () => setShow(true);
    const handleOfflineReady = () => setOfflineReady(true);
    
    window.addEventListener('sw-updated', handleSWUpdated as any);
    window.addEventListener('sw-offline-ready', handleOfflineReady as any);
    
    // Fallback: check if service worker exists
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        // App is offline ready after first load
      }).catch(()=>{});
    }
    
    return () => {
      window.removeEventListener('sw-updated', handleSWUpdated as any);
      window.removeEventListener('sw-offline-ready', handleOfflineReady as any);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  if (!show && !offlineReady) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[200] animate-[slideUp_0.3s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white">
            {offlineReady ? 'Ready to work offline' : 'New update available'}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {offlineReady ? 'Prism Store is cached for offline use.' : 'A new version is available. Reload to update.'}
          </p>
          {show && (
            <button onClick={handleUpdate} className="mt-2 px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold">
              Reload
            </button>
          )}
        </div>
        <button onClick={()=>{setShow(false); setOfflineReady(false);}} className="p-1 text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};