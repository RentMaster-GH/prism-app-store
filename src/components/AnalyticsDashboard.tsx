import React, { useEffect, useState } from 'react';
import { backend } from '../lib/backend';

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
    const load = async () => {
      try {
        setLoading(true);
        const [appsRes, bannedRes, reportsRes] = await Promise.allSettled([
          backend.list('apps'),
          backend.list('banned_users'),
          backend.list('reports')
        ]);

        const rawApps = appsRes.status === 'fulfilled'
          ? (Array.isArray(appsRes.value?.items) ? appsRes.value.items : Array.isArray(appsRes.value) ? appsRes.value : [])
          : [];
        const rawBanned = bannedRes.status === 'fulfilled'
          ? (Array.isArray(bannedRes.value?.items) ? bannedRes.value.items : Array.isArray(bannedRes.value) ? bannedRes.value : [])
          : [];
        const rawReports = reportsRes.status === 'fulfilled'
          ? (Array.isArray(reportsRes.value?.items) ? reportsRes.value.items : Array.isArray(reportsRes.value) ? reportsRes.value : [])
          : [];

        let total = 0;
        let deleted = 0;
        let featured = 0;
        let installs = 0;

        rawApps.forEach((item: any) => {
          const r = item?.data || item || {};
          if (r.status === 'deleted') {
            deleted++;
          } else {
            total++;
          }
          if (r.is_featured) featured++;
          installs += Number(r.install_count || r.downloads || 0);
        });

        const localDeleted = (() => {
          try {
            return JSON.parse(localStorage.getItem('prism_deleted_apps_log') || '[]').length;
          } catch {
            return 0;
          }
        })();

        const localReports = (() => {
          try {
            return JSON.parse(localStorage.getItem('prism_reports') || '[]').length;
          } catch {
            return 0;
          }
        })();

        setStats({
          total,
          deleted: Math.max(deleted, localDeleted),
          featured,
          reports: Math.max(rawReports.length, localReports),
          banned: rawBanned.length,
          installs
        });
      } catch (e) {
        console.warn('Analytics load warning:', e);
        try {
          const localDeleted = JSON.parse(localStorage.getItem('prism_deleted_apps_log') || '[]').length;
          setStats(s => ({ ...s, deleted: localDeleted }));
        } catch {}
      } finally {
        setLoading(false);
      }
    };

    load();
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {['TOTAL', 'DELETED', 'FEATURED', 'REPORTS', 'BANNED', 'INSTALLS'].map(k => (
          <div key={k} className="h-[76px] bg-white/[0.04] border border-white/10 rounded-xl animate-pulse flex items-center justify-center text-[10px] text-white/30">
            {k}...
          </div>
        ))}
      </div>
    );
  }

  const Card = ({ label, value }: { label: string; value: number }) => (
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
