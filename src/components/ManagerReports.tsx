import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Clock } from 'lucide-react';
export default function ManagerReports({ isManager }: {isManager:boolean}) {
  const [reports, setReports] = useState<any[]>([]); const [filter, setFilter] = useState('open');
  const load = async () => {
    let q = supabase.from('store_reports').select('*').order('created_at',{ascending:false});
    if (filter!=='all') q = q.eq('status', filter);
    const { data } = await q; setReports(data||[]);
  };
  useEffect(()=>{ if(isManager) load(); }, [filter, isManager]);
  const updateStatus = async (id:string, status:string) => { await supabase.from('store_reports').update({ status }).eq('id', id); load(); };
  if(!isManager) return null;
  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center"><h3 className="text-lg font-bold">User Reports (Private)</h3><select value={filter} onChange={e=>setFilter(e.target.value)} className="p-2 rounded-lg border bg-transparent text-sm"><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="all">All</option></select></div>
      {reports.map(r=>(
        <div key={r.id} className="p-4 border rounded-xl bg-white dark:bg-zinc-900">
          <div className="flex justify-between"><span className="text-xs px-2 py-1 rounded-full bg-zinc-100">{r.type}</span><span className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleString()}</span></div>
          <h4 className="font-bold mt-2">{r.title}</h4><p className="text-sm mt-1 whitespace-pre-wrap">{r.description}</p>
          <div className="text-xs mt-2">From: {r.reporter_name}</div>
          <div className="flex gap-2 mt-3">
            {r.status==='open' && <button onClick={()=>updateStatus(r.id,'in_progress')} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs"><Clock className="w-3 h-3 inline"/> Start</button>}
            <button onClick={()=>updateStatus(r.id,'resolved')} className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs"><Check className="w-3 h-3 inline"/> Resolve</button>
            <button onClick={()=>updateStatus(r.id,'rejected')} className="px-3 py-1 bg-zinc-200 rounded-lg text-xs"><X className="w-3 h-3 inline"/> Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
