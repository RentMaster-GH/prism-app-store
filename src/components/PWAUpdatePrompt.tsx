import { useEffect, useState } from 'react';
export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  useEffect(()=>{
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', ()=>window.location.reload());
      // Listen to vite PWA
      window.addEventListener('sw:update', ()=>setNeedRefresh(true));
      // @ts-ignore
      if(window.workbox) setNeedRefresh(false);
    }
  }, []);
  if(!needRefresh) return null;
  return <div className="fixed bottom-4 left-4 right-4 bg-black text-white p-4 rounded-xl flex justify-between items-center z-[200]"><span>New version available</span><button onClick={()=>window.location.reload()} className="px-4 py-1 bg-white text-black rounded-full">Update</button></div>;
}
