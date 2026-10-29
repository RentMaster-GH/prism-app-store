import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ManagerReports({ isManager }: { isManager: boolean }) {
  const [reports, setReports] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('prism_reports') || '[]'); } catch { return []; }
  });
  const [filter, setFilter] = useState<'all'|'open'|'resolved'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase.from('reports').select('*').order('created_at',{ascending:false}).limit(50);
        if (Array.isArray(data) && data.length > 0) {
          setReports(data);
          localStorage.setItem('prism_reports', JSON.stringify(data));
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = reports.filter(r => {
    if (filter === 'all') return true;
    const s = String(r.status || 'open').toLowerCase();
    return s.includes(filter);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">User Reports (Private)</h3>
        <div className="flex gap-2 items-center">
          <span className="text-[10px] text-white/40">{filtered.length} reports</span>
          {/* FIX: Never disabled, styled as active */}
          <select 
            value={filter} 
            onChange={e=>setFilter(e.target.value as any)}
            className="h-8 px-3 bg-white text-black rounded-full text-xs font-bold border border-white outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center bg-white/[0.02] border border-white/10 rounded-xl">
          <p className="text-xs text-white/50">No reports yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r:any, i:number) => (
            <div key={r.id || i} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-white">{r.app_name || r.title || 'App Report'}</div>
                <div className="text-[11px] text-white/50">{r.reason || r.description || 'No reason'}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${String(r.status).toLowerCase()==='open'?'bg-amber-200 text-amber-900':'bg-emerald-200 text-emerald-900'}`}>{String(r.status||'open').toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}