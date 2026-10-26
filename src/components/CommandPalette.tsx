import React, { useState, useMemo, useEffect } from 'react';
import { Search, Download, Play, ExternalLink, Star, Command, X, Clock, Zap } from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';

interface Props {
  apps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  onInstall: (app: AppItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<Props> = ({ apps, installedMap, onOpenDetails, onOpenSandbox, onInstall, isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return apps.slice(0, 8);
    return apps.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.tagline.toLowerCase().includes(q) || 
      a.category.toLowerCase().includes(q) ||
      a.developer.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [apps, query]);

  const installedApps = useMemo(() => apps.filter(a => installedMap[a.id]), [apps, installedMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#05060f]/80 backdrop-blur-xl" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-[640px] bg-[#0e0f22]/90 backdrop-blur-2xl border border-white/[0.12] rounded-[24px] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 h-[56px] border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps, categories, actions..."
            className="flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex h-6 px-2 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-400 items-center gap-1"><Command className="w-3 h-3" />K</span>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center hover:bg-white/[0.10] text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {query === '' && installedApps.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 flex items-center gap-1.5"><Clock className="w-3 h-3" /> RECENTLY INSTALLED</div>
              {installedApps.slice(0, 3).map(app => (
                <button key={`installed-${app.id}`} onClick={() => { onClose(); if (app.liveAppUrl) window.open(app.liveAppUrl, '_blank'); else onOpenSandbox(app); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-left transition group">
                  <img src={resolveAppMedia(app.thumbnail) || getAppCategoryPlaceholder(app.category, app.name)} alt="" className="w-8 h-8 rounded-lg bg-white object-contain p-1 border border-slate-200" />
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate group-hover:text-indigo-200">{app.name}</p><p className="text-[11px] text-slate-500 truncate">Installed • {installedMap[app.id]?.installedVersion}</p></div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>
              ))}
              <div className="h-px bg-white/[0.06] my-2 mx-3" />
            </div>
          )}

          <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 flex items-center gap-1.5"><Zap className="w-3 h-3" /> {query ? `RESULTS FOR "${query}"` : 'ALL APPS'}</div>
          
          {filtered.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-slate-400">No apps found for "{query}"</p><p className="text-xs text-slate-600 mt-1">Try a different search</p></div>
          ) : (
            filtered.map(app => {
              const installed = !!installedMap[app.id];
              return (
                <div key={app.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition group">
                  <img src={resolveAppMedia(app.thumbnail) || getAppCategoryPlaceholder(app.category, app.name)} alt="" className="w-8 h-8 rounded-lg bg-white object-contain p-1 border border-slate-200" />
                  <button onClick={() => { onClose(); onOpenDetails(app); }} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate group-hover:text-indigo-200 flex items-center gap-2">{app.name} <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-slate-400">{app.category}</span></p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{app.rating.toFixed(1)} • {app.priceFormatted}</p>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    {installed ? (
                      <button onClick={() => { onClose(); if (app.liveAppUrl) window.open(app.liveAppUrl, '_blank'); else onOpenSandbox(app); }} className="h-7 px-3 rounded-full bg-white text-black text-[11px] font-bold hover:bg-slate-100 transition">Launch</button>
                    ) : (
                      <button onClick={() => { onClose(); onInstall(app); }} className="h-7 px-3 rounded-full bg-white/[0.08] border border-white/10 text-white text-[11px] font-medium hover:bg-white/[0.12] transition flex items-center gap-1"><Download className="w-3 h-3" />Install</button>
                    )}
                    <button onClick={() => { onClose(); onOpenSandbox(app); }} className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] text-slate-400 hover:text-white transition"><Play className="w-3 h-3 fill-current" /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 h-[40px] border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-3"><span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10">↑↓</span> Navigate</span><span className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/10">↵</span> Open</span></span>
          <span>{filtered.length} apps</span>
        </div>
      </div>
    </div>
  );
};