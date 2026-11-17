import React, { useEffect, useState } from 'react';
import { BarChart3, Package, ShieldAlert, Flag, CheckCircle2, Clock } from 'lucide-react';
import { backend } from '../lib/backend';

interface AnalyticsDashboardProps {
  apps?: any[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ apps: propApps }) => {
  const [stats, setStats] = useState({
    totalApps: 0,
    approvedApps: 0,
    pendingApps: 0,
    totalInstalls: 0,
    totalReports: 0,
    bannedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const [appsList, reportsList, bannedList] = await Promise.all([
          propApps && propApps.length > 0 ? Promise.resolve(propApps) : backend.list('apps').catch(() => []),
          backend.list('reports').catch(() => []),
          backend.list('banned_users').catch(() => []),
        ]);

        if (!active) return;

        const approved = appsList.filter((a: any) => a.status === 'approved').length;
        const pending = appsList.filter((a: any) => a.status === 'pending').length;
        const installs = appsList.reduce((sum: number, a: any) => sum + (Number(a.install_count || a.installs) || 0), 0);

        setStats({
          totalApps: appsList.length,
          approvedApps: approved,
          pendingApps: pending,
          totalInstalls: installs,
          totalReports: reportsList.length,
          bannedUsers: bannedList.length,
        });
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStats();
    return () => {
      active = false;
    };
  }, [propApps]);

  const cards = [
    { label: 'Total Apps', value: stats.totalApps, icon: Package, color: 'text-indigo-400' },
    { label: 'Approved Live', value: stats.approvedApps, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Pending Review', value: stats.pendingApps, icon: Clock, color: 'text-amber-400' },
    { label: 'Total Installs', value: stats.totalInstalls.toLocaleString(), icon: BarChart3, color: 'text-sky-400' },
    { label: 'User Reports', value: stats.totalReports, icon: Flag, color: 'text-rose-400' },
    { label: 'Banned Passkeys', value: stats.bannedUsers, icon: ShieldAlert, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Store Telemetry & Backend Metrics
        </h3>
        {loading && <span className="text-xs text-slate-400">Syncing...</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-xl font-bold text-white">{card.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
