import { useState } from 'react';
import { X, ExternalLink, Star, Shield, Download } from 'lucide-react';
import { AppItem } from '../types';
import { AppReviews } from './AppReviews';

export function AppDetailModal({ app, installedState, onClose, onInstall, onUninstall, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState<'overview'|'reviews'>('overview');
  if (!app) return null;

  const safeName = String(app.name || app.title || 'Untitled');
  const safeTagline = String(app.tagline || app.summary || '');
  const safeCategory = String(app.category || (app as any).blty || 'Other');
  const safeVersion = String(app.currentVersion || (app as any).version_raw || (app as any).version || '1.0.0');
  const safeDeveloper = String(app.developer || (app as any).studio || 'Indie Engineer');
  const safeSize = String(app.sizeMB || (app as any).package_size || '15');
  const safeLiveUrl = String(app.liveAppUrl || app.websiteUrl || (app as any).live_web_url || (app as any).download_url || '');
  const safeChangelog = String((app as any).changelog_raw || (app as any).changelog || '');
  const safeSummary = String(app.summary || app.tagline || '');

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
              <span className="truncate">{safeName}</span>
              {(app as any).version_raw && <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full shrink-0">v{String((app as any).version_raw)}</span>}
              {(app as any).price_type_raw && String((app as any).price_type_raw).toLowerCase() !=='free' && <span className="text-xs px-2 py-0.5 bg-amber-400 text-black rounded-full shrink-0">{String((app as any).price_type_raw)}</span>}
            </h2>
            <p className="text-sm text-white/60 truncate">{safeTagline}</p>
            {safeChangelog && <p className="text-xs mt-2 text-amber-200/70 line-clamp-2">Whats new: {safeChangelog}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full shrink-0"><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setTab('overview')} className={`px-3 py-1.5 rounded-full text-xs ${tab==='overview'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Overview</button>
            <button onClick={()=>setTab('reviews')} className={`px-3 py-1.5 rounded-full text-xs ${tab==='reviews'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Reviews</button>
            <button onClick={()=>{ try{ localStorage.setItem('prism_report_app', JSON.stringify(app)); }catch{} window.dispatchEvent(new CustomEvent('open-report-portal', {detail: app})); }} className="px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-800">Report this app</button>
          </div>
          {tab==='overview' && (
            <>
              <p className="text-sm text-white/70 leading-relaxed">{safeSummary || 'No description.'}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Category</div><div className="font-semibold text-white truncate">{safeCategory}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Version</div><div className="font-semibold text-white">{safeVersion}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Developer</div><div className="font-semibold text-white truncate">{safeDeveloper}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Size</div><div className="font-semibold text-white">{safeSize} MB</div></div>
              </div>
              <div className="flex gap-2">
                {!installedState || installedState.status !== 'installed' ? 
                  <button onClick={()=>onInstall && onInstall(app)} className="flex-1 h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4"/> Install</button> 
                  : <button onClick={()=>onUninstall && onUninstall(app.id || app.uuid)} className="flex-1 h-11 bg-white/10 text-white rounded-full font-bold text-sm">Uninstall</button>}
                {safeLiveUrl && safeLiveUrl.startsWith('http') && <a href={safeLiveUrl} target="_blank" rel="noopener" className="h-11 px-5 bg-white/10 rounded-full flex items-center gap-2 text-sm text-white"><ExternalLink className="w-4 h-4"/> Open</a>}
              </div>
            </>
          )}
          {tab==='reviews' && <AppReviews appId={String(app.id || app.uuid || '')} isManager={!!isStoreManager} />}
        </div>
      </div>
    </div>
  );
}