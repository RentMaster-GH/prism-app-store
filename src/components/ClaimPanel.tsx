import { supabase } from '../lib/supabase';

export function ClaimPanel({ userUID }: { userUID: string }) {
  const claimSupabase = async () => {
    try {
      // Claim all anon apps to your current UID
      const { data: anonApps } = await supabase.from('apps').select('id, title').eq('owner_id', 'anon');
      const { data: nullApps } = await supabase.from('apps').select('id, title').is('owner_id', null);
      const total = (anonApps?.length||0) + (nullApps?.length||0);
      if(total===0) {
        alert('No anon/null apps in Supabase. Your 115 are local.');
        return;
      }
      if(!confirm(`Found ${total} apps with owner anon/null. Migrate to ${userUID}?`)) return;
      
      await supabase.from('apps').update({ owner_id: userUID }).eq('owner_id', 'anon');
      await supabase.from('apps').update({ owner_id: userUID }).is('owner_id', null);
      alert(`Migrated ${total} apps in Supabase to ${userUID}`);
      location.reload();
    } catch(e:any){ alert(e.message); }
  };

  const claimLocal = () => {
    const uid = userUID;
    let total=0;
    Object.keys(localStorage).forEach(k=>{
      try {
        const arr = JSON.parse(localStorage.getItem(k)||'');
        if(Array.isArray(arr) && arr[0]?.id) {
          const fixed = arr.map((a:any)=>({...a, ownerId: uid, owner_id: uid, owner_uid: uid}));
          localStorage.setItem(k, JSON.stringify(fixed));
          total+=arr.length;
        }
      } catch {}
    });
    alert(`Claimed ${total} local apps to ${uid}`);
    location.reload();
  };

  return (
    <div className="mt-3 flex flex-col gap-2 w-full">
      <button onClick={claimLocal} className="h-9 px-3 bg-amber-400 text-black rounded-full text-xs font-bold">Claim Local 115 Apps</button>
      <button onClick={claimSupabase} className="h-9 px-3 bg-white text-black rounded-full text-xs font-bold">Claim Supabase anon → {userUID.slice(-8)}</button>
      <div className="text-[10px] text-white/40">Current UID: {userUID}</div>
    </div>
  );
}
