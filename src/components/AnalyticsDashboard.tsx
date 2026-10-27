import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
export default function AnalyticsDashboard({ isManager }: {isManager:boolean}) {
  const [stats, setStats] = useState({total:0, deleted:0, featured:0, reports:0, banned:0, installs:0});
  useEffect(()=>{ (async()=>{
    const [a,b,c,d,e] = await Promise.all([
      supabase.from('marketplace_apps').select('id',{count:'exact'}).eq('status','approved'),
      supabase.from('marketplace_apps').select('id',{count:'exact'}).eq('status','deleted'),
      supabase.from('store_reports').select('id',{count:'exact'}).eq('status','open'),
      supabase.from('banned_users').select('id',{count:'exact'}),
      supabase.from('marketplace_apps').select('install_count')
    ]);
    const installs = e.data?.reduce((s:any,r:any)=>s+(r.install_count||0),0)||0;
    setStats({total:a.count||0, deleted:b.count||0, reports:c.count||0, banned:d.count||0, featured:0, installs});
  })() }, []);
  if(!isManager) return null;
  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {Object.entries(stats).map(([k,v])=><div key={k} className="p-4 bg-white dark:bg-zinc-900 border rounded-xl"><div className="text-xs text-zinc-500 uppercase">{k}</div><div className="text-2xl font-bold">{v}</div></div>)}
    </div>
  );
}
