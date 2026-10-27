import { useEffect, useState } from 'react';

export const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(()=>{
    const onOnline = () => { setOnline(true); setShow(true); setTimeout(()=>setShow(false), 3000); };
    const onOffline = () => { setOnline(false); setShow(true); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return ()=>{ window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-full text-[12px] font-bold shadow-lg backdrop-blur-md border flex items-center gap-2 transition-all ${online ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200' : 'bg-rose-950/90 border-rose-800 text-rose-200'}`}>
      <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`}></span>
      {online ? 'Back online — synced' : 'Offline — showing cached apps'}
    </div>
  );
};

export const UpdateNotificationToast = ({ onRefresh }: { onRefresh: ()=>void }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(()=>{
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', ()=> setUpdateAvailable(true));
    }
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-full bg-[#12132a] border border-white/10 text-white text-[12px] font-bold shadow-xl flex items-center gap-3">
      <span>New version available</span>
      <button onClick={onRefresh} className="px-3 py-1 rounded-full bg-white text-black text-[11px]">Update</button>
    </div>
  );
};
