import { useState } from 'react';
import { X, ExternalLink, Star, Shield, Download } from 'lucide-react';
import { AppItem } from '../types';
import { AppReviews } from './AppReviews';

export function AppDetailModal({ app, installedState, onClose, onInstall, onUninstall, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState('overview');
  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">{app.name} {(app as any).version_raw && <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">v{(app as any).version_raw}</span>} {(app as any).price_type_raw && (app as any).price_type_raw!=='free' && <span className="text-xs px-2 py-0.5 bg-amber-400 text-black rounded-full">{(app as any).price_type_raw}</span>}</h2>
            <p className="text-sm text-white/60">{app.tagline}</p>
            {(app as any).changelog_raw && <p className="text-xs mt-2 text-amber-200/70">Whats new: {(app as any).changelog_raw}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex gap-2">
            <button onClick={()=>setTab('overview')} className={`px-3 py-1.5 rounded-full text-xs ${tab==='overview'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Overview</button>
            <button onClick={()=>setTab('reviews')} className={`px-3 py-1.5 rounded-full text-xs ${tab==='reviews'?'bg-white text-black':'bg-white/10 text-white/70'}`}>Reviews & Opinions</button>
            <button onClick={()=>{ localStorage.setItem('prism_report_app', JSON.stringify(app)); window.dispatchEvent(new CustomEvent('open-report-portal', {detail: app})); }} className="px-3 py-1.5 rounded-full text-xs bg-amber-100 text-amber-800">Report this app</button>
          </div>
          {tab==='overview' && (
            <>
              <p className="text-sm text-white/70 leading-relaxed">{app.summary||app.tagline}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Category</div><div className="font-semibold text-white">{app.category}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Version</div><div className="font-semibold text-white">{app.currentVersion||(app as any).version_raw||'1.0.0'}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Developer</div><div className="font-semibold text-white">{app.developer}</div></div>
                <div className="p-3 bg-white/[0.04] rounded-xl"><div className="text-white/40">Size</div><div className="font-semibold text-white">{app.sizeMB} MB</div></div>
              </div>
              <div className="flex gap-2">
                {!installedState ? <button onClick={()=>onInstall(app)} className="flex-1 h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4"/> Install</button> : <button onClick={()=>onUninstall(app.id)} className="flex-1 h-11 bg-white/10 text-white rounded-full font-bold text-sm">Uninstall</button>}
                {app.liveAppUrl && <a href={app.liveAppUrl} target="_blank" className="h-11 px-5 bg-white/10 rounded-full flex items-center gap-2 text-sm text-white"><ExternalLink className="w-4 h-4"/> Open</a>}
              </div>
            </>
          )}
          {tab==='reviews' && <AppReviews appId={app.id} isManager={isStoreManager} />}
        </div>
      </div>
    </div>
  );
}
