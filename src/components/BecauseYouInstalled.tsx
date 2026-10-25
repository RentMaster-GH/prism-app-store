import { AppItem, InstalledAppState } from '../types';
import { AppCard } from './AppCard';

export const BecauseYouInstalled: React.FC<{ installedMap: Record<string, InstalledAppState>; allApps: AppItem[]; onOpenDetails: (a: AppItem) => void; onQuickInstall: (a: AppItem) => void; onOpenSandbox: (a: AppItem) => void; }> = ({ installedMap, allApps, onOpenDetails, onQuickInstall, onOpenSandbox }) => {
  const installedIds = Object.keys(installedMap).filter(id => installedMap[id].status === 'installed');
  if (installedIds.length === 0) return null;
  const lastInstalled = allApps.find(a => a.id === installedIds[0]);
  if (!lastInstalled) return null;
  const recommendations = allApps.filter(a => !installedIds.includes(a.id) && (a.category === lastInstalled.category || a.supportedDevices.some(d => lastInstalled.supportedDevices.includes(d)))).slice(0, 6);
  if (recommendations.length === 0) return null;
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-white">Because you installed <span className="text-indigo-300">{lastInstalled.name}</span></h3><span className="text-[10px] font-mono text-slate-500">{recommendations.length} picks</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{recommendations.map(app => <AppCard key={app.id} app={app} installedState={installedMap[app.id]} onOpenDetails={onOpenDetails} onQuickInstall={onQuickInstall} onOpenSandbox={onOpenSandbox} />)}</div>
    </section>
  );
};