import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AnalyticsDashboard({ isManager }: { isManager: boolean }) {
  const [stats, setStats] = useState({
    total: 0,
    deleted: 0,
    featured: 0,
    reports: 0,
    banned: 0,
    installs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const load = async () => {
      try {
        setLoading(true);
        // Use allSettled so one missing table doesn't break all
        const [appsRes, deletedRes, bannedRes, reportsRes] = await Promise.allSettled([
          supabase.from('apps').select('install_count,status,is_featured', { count: 'exact' }),
          supabase.from('apps').select('*', { count: 'exact', head: true }).eq('status','deleted'),
          supabase.from('banned_users').select('*', { count: 'exact', head: true }),
          supabase.from('reports').select('*', { count: 'exact', head: true })
        ]);

        const appsData = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : [];
        const appsCount = appsRes.status === 'fulfilled' ? (appsRes.value.count ?? appsData.length) : 0;

        const total = appsCount || appsData.length || 0;
        const deleted = deletedRes.status === 'fulfilled' ? (deletedRes.value.count ?? 0) : Number(localStorage.getItem('prism_deleted_apps_log') ? JSON.parse(localStorage.getItem('prism_deleted_apps_log')!).length : 0);
        const banned = bannedRes.status === 'fulfilled' ? (bannedRes.value.count ?? 0) : 0;
        const reports = reportsRes.status === 'fulfilled' ? (reportsRes.value.count ?? 0) : Number(localStorage.getItem('prism_reports') ? JSON.parse(localStorage.getItem('prism_reports')!).length : 0);
        
        let installs = 0;
        let featured = 0;
        try {
          (appsData as any[]).forEach((r:any) => {
            installs += Number(r.install_count || r.downloads || 0);
            if (r.is_featured) featured++;
          });
        } catch {}

        setStats({ total, deleted, featured, reports, banned, installs });
      } catch (e) {
        console.log('analytics error', e);
        // Fallback to local counts so UI never spins forever
        try {
          const localDeleted = JSON.parse(localStorage.getItem('prism_deleted_apps_log') || '[]').length;
          setStats(s => ({ ...s, deleted: localDeleted }));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
    // Safety timeout - never spin more than 3s
    const t = setTimeout(()=> setLoading(false), 3000);
    return ()=> clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {['TOTAL','DELETED','FEATURED','REPORTS','BANNED','INSTALLS'].map(k=>(
          <div key={k} className="h-[76px] bg-white/[0.04] border border-white/10 rounded-xl animate-pulse flex items-center justify-center text-[10px] text-white/30">{k}...</div>
        ))}
      </div>
    );
  }

  const Card = ({ label, value }: any) => (
    <div className="p-4 bg-white border border-black/5 rounded-xl">
      <div className="text-[10px] tracking-widest text-black/40 font-bold">{label}</div>
      <div className="text-2xl font-black text-black mt-1">{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Card label="TOTAL" value={stats.total} />
      <Card label="DELETED" value={stats.deleted} />
      <Card label="FEATURED" value={stats.featured} />
      <Card label="REPORTS" value={stats.reports} />
      <Card label="BANNED" value={stats.banned} />
      <Card label="INSTALLS" value={stats.installs} />
    </div>
  );
}