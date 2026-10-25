import { AppItem, InstalledAppState } from '../types';
import { AppCard } from './AppCard';

export const RelatedApps: React.FC<{ currentApp: AppItem; allApps: AppItem[]; installedMap: Record<string, InstalledAppState>; onOpenDetails: (a: AppItem) => void; onQuickInstall: (a: AppItem) => void; onOpenSandbox: (a: AppItem) => void; }> = ({ currentApp, allApps, installedMap, onOpenDetails, onQuickInstall, onOpenSandbox }) => {
  const related = allApps.filter(a => a.id !== currentApp.id && (a.category === currentApp.category || a.developer === currentApp.developer)).slice(0, 3);
  if (related.length === 0) return null;
  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <h4 className="text-sm font-bold text-white mb-3">Related Apps in {currentApp.category}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {related.map(app => <AppCard key={app.id} app={app} installedState={installedMap[app.id]} onOpenDetails={onOpenDetails} onQuickInstall={onQuickInstall} onOpenSandbox={onOpenSandbox} />)}
      </div>
    </div>
  );
};