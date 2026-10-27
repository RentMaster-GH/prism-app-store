import { useState } from 'react';

export function ClaimPanel({ userUID }: { userUID: string }) {
  const [log, setLog] = useState('');
  
  const claim = () => {
    try {
      const uid = userUID || localStorage.getItem('prism_user_uid') || '';
      let total = 0;
      const foundKeys: string[] = [];
      Object.keys(localStorage).forEach(k=>{
        try {
          const raw = localStorage.getItem(k);
          if(!raw) return;
          const arr = JSON.parse(raw);
          if(Array.isArray(arr) && arr.length>0 && arr[0]?.id) {
            foundKeys.push(`${k}(${arr.length})`);
            const fixed = arr.map((a:any)=>({...a, ownerId: uid, owner_id: uid, owner_uid: uid}));
            localStorage.setItem(k, JSON.stringify(fixed));
            total += arr.length;
          }
        } catch {}
      });
      if(total===0) {
        setLog(`No apps in localStorage. Keys: ${Object.keys(localStorage).join(', ')}`);
        return;
      }
      localStorage.setItem('prism_user_uploaded_apps', localStorage.getItem(foundKeys[0].split('(')[0]) || '[]');
      setLog(`Claimed ${total} apps from ${foundKeys.join(', ')} to ${uid}`);
      setTimeout(()=>location.reload(), 800);
    } catch(e:any){ setLog(e.message); }
  };

  return (
    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <div className="text-[11px] text-amber-200 mb-2">UID: {userUID} • Found: {log || 'click to scan'}</div>
      <button onClick={claim} className="h-9 px-4 bg-amber-400 text-black rounded-full text-xs font-bold w-full">Claim My Apps Now</button>
      {log && <div className="text-[10px] text-white/60 mt-2 break-all">{log}</div>}
    </div>
  );
}
