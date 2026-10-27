import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export function AnnouncementBanner() {
  const [ann, setAnn] = useState<any>(null);
  useEffect(()=>{ supabase.from('store_announcements').select('*').eq('is_active', true).order('created_at',{ascending:false}).limit(1).then(({data})=>setAnn(data?.[0])) }, []);
  if(!ann) return null;
  return <div className={`p-2 text-center text-sm ${ann.type==='warning'?'bg-amber-100 text-amber-800':ann.type==='success'?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800'}`}>{ann.message}</div>;
}
export function AnnouncementManager({ isManager }: {isManager:boolean}) {
  const [msg, setMsg] = useState('');
  if(!isManager) return null;
  const post = async () => {
    if(!msg.trim()) return;
    await supabase.from('store_announcements').insert({message:msg, created_by: localStorage.getItem('prism_user_uid')});
    setMsg(''); alert('Posted');
  };
  return <div className="mt-4 p-3 border rounded-xl flex gap-2"><input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Store announcement..." className="flex-1 p-2 border rounded-lg bg-transparent"/><button onClick={post} className="px-4 py-2 bg-black text-white rounded-full text-sm">Post</button></div>;
}
