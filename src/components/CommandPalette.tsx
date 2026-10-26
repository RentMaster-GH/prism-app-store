import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppItem, InstalledAppState } from '../types';
import { Search, ArrowRight, Command, PackageOpen, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl, resolveAppMedia } from '../utils/media';

interface CommandPaletteProps {
  apps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  onOpenDetails: (app: AppItem) => void;
  onOpenSandbox: (app: AppItem) => void;
  onInstall: (app: AppItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ apps, installedMap, onOpenDetails, onOpenSandbox, onInstall, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setQuery('');
      setSelectedIdx(0);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      const installed = apps.filter(a => installedMap[a.id]).slice(0,5);
      const featured = apps.filter(a => a.editorialHighlight).slice(0,5);
      return [...installed, ...featured].slice(0,8);
    }
    const q = query.toLowerCase();
    return apps.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.developer.toLowerCase().includes(q) ||
      a.tagline.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q))
    ).slice(0,12);
  }, [apps, installedMap, query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleSelect = (app: AppItem) => {
    onClose();
    onOpenDetails(app);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i+1, results.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i-1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[selectedIdx]) handleSelect(results[selectedIdx]); }
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4 bg-slate-950/70 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search apps, categories, developers..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
            <span>ESC</span>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <PackageOpen className="w-6 h-6 mx-auto mb-2 text-slate-600" />
              No apps found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {!query && <div className="px-3 py-2 text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3" /> {Object.keys(installedMap).length > 0 ? 'Installed & Featured' : 'Featured'}</div>}
              {results.map((app, idx) => {
                const installed = !!installedMap[app.id];
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={app.id}
                    onClick={()=>handleSelect(app)}
                    onMouseEnter={()=>setSelectedIdx(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${isSelected ? 'bg-slate-800 border border-slate-700' : 'border border-transparent hover:bg-slate-800/50'}`}
                  >
                    <img src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail),80)} alt={app.name} className="w-9 h-9 rounded-lg object-cover border border-slate-800 shrink-0" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate flex items-center gap-2">
                        {app.name}
                        {installed && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded font-mono">Installed</span>}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{app.category} · {app.tagline}</div>
                    </div>
                    {isSelected && <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-3 py-2.5 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px]">↑↓</span> Navigate</span>
            <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px]">↵</span> Open</span>
          </div>
          <div className="flex items-center gap-1"><Command className="w-3 h-3" /><span>K to open anywhere</span></div>
        </div>
      </div>
    </div>
  );
};
