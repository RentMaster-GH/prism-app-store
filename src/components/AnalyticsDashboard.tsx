import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Eye, MousePointerClick, Activity, Globe, RefreshCw, MapPin, Smartphone } from 'lucide-react';
import { backend } from '../lib/backend';

interface AnalyticsDashboardProps {
  apps?: any[];
}

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://credibleartisans.com'
    : 'http://localhost:3000');

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apps: propApps }) => {
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState({ totalApps: 0, approvedApps: 0, totalInstalls: 0 });
  const [ecosystem, setEcosystem] = useState<{
    totals: { total_views: number; unique_visitors: number; total_interactions: number; active_24h: number };
    apps: Array<{ app_slug: string; views: number; unique_visitors: number; interactions: number; last_active: string }>;
    countries: Array<{ country: string; visitors: number; events: number }>;
    recentEvents: Array<{ app_slug: string; visitor_id: string; event_type: string; action_label: string; country: string; device_info: string; created_at: string }>;
  }>({
    totals: { total_views: 0, unique_visitors: 0, total_interactions: 0, active_24h: 0 },
    apps: [],
    countries: [],
    recentEvents: [],
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [appsList, ecoRes] = await Promise.all([
        propApps && propApps.length > 0 ? Promise.resolve(propApps) : backend.list('apps').catch(() => []),
        fetch(`${API_BASE}/api/store/analytics`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      const approved = appsList.filter((a: any) => a.status === 'approved').length;
      const installs = appsList.reduce((sum: number, a: any) => sum + (Number(a.install_count || a.installs) || 0), 0);
      setStoreStats({ totalApps: appsList.length, approvedApps: approved, totalInstalls: installs });
      if (ecoRes && ecoRes.totals) {
        setEcosystem({
          totals: ecoRes.totals,
          apps: ecoRes.apps || [],
          countries: ecoRes.countries || [],
          recentEvents: ecoRes.recentEvents || [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 20000);
    return () => clearInterval(timer);
  }, [propApps]);

  const kpis = [
    { label: 'Total Page Views', value: Number(ecosystem.totals.total_views || 0).toLocaleString(), icon: Eye, color: 'text-sky-400' },
    { label: 'Unique Visitors', value: Number(ecosystem.totals.unique_visitors || 0).toLocaleString(), icon: Users, color: 'text-emerald-400' },
    { label: 'User Interactions', value: Number(ecosystem.totals.total_interactions || 0).toLocaleString(), icon: MousePointerClick, color: 'text-amber-400' },
    { label: 'Active (Last 24h)', value: Number(ecosystem.totals.active_24h || 0).toLocaleString(), icon: Activity, color: 'text-purple-400' },
    { label: 'Live Ecosystem Apps', value: storeStats.approvedApps.toLocaleString(), icon: Globe, color: 'text-indigo-400' },
    { label: 'Total App Installs', value: storeStats.totalInstalls.toLocaleString(), icon: BarChart3, color: 'text-pink-400' },
  ];

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Live Ecosystem Visitors, Countries &amp; Interaction Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time public telemetry across Prism App Store, SoulPay, SoulMarket, Digital Remote Services &amp; all hosted apps.
          </p>
        </div>
        <button type="button" onClick={loadAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white">{card.value}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">App-by-App Visitor &amp; Engagement Breakdown</span>
            <span className="text-[11px] text-emerald-400 font-mono">LIVE SYNC</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Application / Domain</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                  <th className="py-2.5 px-3 text-right">Interactions</th>
                  <th className="py-2.5 px-3 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {ecosystem.apps.map((row) => (
                  <tr key={row.app_slug} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-indigo-300">{row.app_slug}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{Number(row.views).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-300">{Number(row.unique_visitors).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300">{Number(row.interactions).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-slate-400">{row.last_active ? formatDateTime(row.last_active) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Visitors by Country</span>
          </div>
          <div className="p-3 space-y-2">
            {ecosystem.countries.length > 0 ? (
              ecosystem.countries.map((cRow) => (
                <div key={cRow.country} className="flex items-center justify-between text-xs bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2">
                  <span className="font-semibold text-slate-200">{cRow.country}</span>
                  <span className="font-mono text-emerald-400">{cRow.visitors} visitors • {cRow.events} events</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 p-2">Collecting location telemetry...</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300">Detailed Live Visitor &amp; Interaction Log (Date, Time, Country &amp; Device)</div>
        {ecosystem.recentEvents.length > 0 ? (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {ecosystem.recentEvents.map((ev, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between text-xs bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${ev.event_type === 'interaction' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>
                    {ev.event_type === 'interaction' ? 'CLICK' : 'VISIT'}
                  </span>
                  <span className="font-mono text-emerald-400">[{ev.app_slug}]</span>
                  <span className="text-slate-200 font-medium">{ev.action_label || 'Visited Page'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-rose-300 font-semibold">{ev.country}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1"><Smartphone className="w-3 h-3" />{ev.device_info}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-300">{formatDateTime(ev.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500">No events logged yet.</div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
