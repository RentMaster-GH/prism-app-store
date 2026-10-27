import React, { useState, useMemo } from 'react';
import { 
  X, Star, Download, Play, Check, ShieldCheck, 
  RotateCcw, Lock, Radio, HardDrive, Smartphone,
  Layers, ArrowLeftRight, CheckCircle2, AlertTriangle, ExternalLink,
  Trash2, ShieldAlert, BookOpen, Key, UserCheck, Share2, Globe, Github, Sparkles
} from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder, getOptimizedImageUrl } from '../utils/media';
import { AudioSynthSandbox } from './sandboxes/AudioSynthSandbox';
import { VectorCanvasSandbox } from './sandboxes/VectorCanvasSandbox';
import { BiomechanicsSandbox } from './sandboxes/BiomechanicsSandbox';
import { MarkdownSandbox } from './sandboxes/MarkdownSandbox';
import { TerminalSandbox } from './sandboxes/TerminalSandbox';
import { AdinkraSandbox } from './sandboxes/AdinkraSandbox';
import { VerifiedBadge } from './VerifiedBadge';
import { DownloadTicker } from './DownloadTicker';
import { RelatedApps } from './RelatedApps';

interface AppDetailModalProps {
  app: AppItem;
  initialTab?: 'overview' | 'test-drive' | 'privacy' | 'history' | 'reviews';
  installedState?: InstalledAppState;
  onClose: () => void;
  onInstall: (app: AppItem, version?: string) => void;
  onUninstall: (appId: string) => void;
  onStartCompare: (app: AppItem) => void;
  onAddReview: (appId: string, rating: number, title: string, content: string) => void;
  onAppDeleted?: (appId: string, reason: string, deletedBy: 'Owner' | 'Prism Store Developer / Manager') => void;
  onOpenOwnerGuide?: () => void;
  userUID: string;
  isStoreManager: boolean;
  onOpenStoreManagerAuth: () => void;
  allApps?: AppItem[]; // For Related Apps
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  initialTab = 'overview',
  installedState,
  onClose,
  onInstall,
  onUninstall,
  onStartCompare,
  onAddReview,
  onAppDeleted,
  onOpenOwnerGuide,
  userUID,
  isStoreManager,
  onOpenStoreManagerAuth,
  allApps = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'test-drive' | 'privacy' | 'history' | 'reviews'>(initialTab);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const targetOwnerUID = app.ownerId || (app.id === 'adinkra-studio' ? 'PRISM-USER-DEMO' : '');
  const isOwner = Boolean(app.isUserUploaded && (
    app.ownerId === userUID || 
    (app.id === 'adinkra-studio' && (!app.ownerId || app.ownerId === 'PRISM-USER-DEMO' || app.ownerId === userUID))
  ));
  const isOwnerSessionMatch = Boolean(
    app.isUserUploaded && (
      (app.ownerId && userUID && app.ownerId.toUpperCase() === userUID.toUpperCase()) ||
      (app.id === 'adinkra-studio' && (!app.ownerId || app.ownerId === 'PRISM-USER-DEMO' || app.ownerId === userUID))
    )
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'owner' | 'moderator'>('owner');
  const [ownerAuthKeyInput, setOwnerAuthKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>(
    app.isFlagged ? 'Inappropriate Content / Violates Guidelines' : 'Owner Request / Decommissioning Application'
  );
  const [customReason, setCustomReason] = useState('');

  const isOwnerAuthenticated = useMemo(() => {
    if (deleteMode === 'moderator') {
      return isStoreManager || ownerAuthKeyInput.trim() === (import.meta.env.VITE_STORE_MANAGER_KEY as string || '').trim();
    }
    const input = ownerAuthKeyInput.trim().toUpperCase();
    if (!input) return false;
    if (isOwnerSessionMatch) {
      return input === 'DELETE' || (targetOwnerUID && input === targetOwnerUID.toUpperCase());
    }
    return (targetOwnerUID && input === targetOwnerUID.toUpperCase()) || input === (import.meta.env.VITE_STORE_MANAGER_KEY as string || '').trim();
  }, [deleteMode, isStoreManager, ownerAuthKeyInput, isOwnerSessionMatch, targetOwnerUID]);

  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submittedReview, setSubmittedReview] = useState(false);

  const isInstalled = installedState?.status === 'installed';
  const isInstalling = installedState?.status === 'installing';
  const isUpdating = installedState?.status === 'updating';

  const handleRollback = (ver: string) => {
    onInstall(app, ver);
    setRollbackSuccess(`Installed package version ${ver}`);
    setTimeout(() => setRollbackSuccess(null), 3000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddReview(app.id, newRating, newTitle, newContent);
    setSubmittedReview(true);
    setNewTitle('');
    setNewContent('');
  };

  const handleInstall = () => {
    if ('vibrate' in navigator) navigator.vibrate(20);
    onInstall(app);
  };

  const handleShare = async () => {
    const url = app.liveAppUrl || window.location.href;
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000); } catch {}
  };

  const renderSandbox = () => {
    switch (app.sandboxType) {
      case 'audio-synth': return <AudioSynthSandbox />;
      case 'vector-canvas': return <VectorCanvasSandbox />;
      case 'biomechanics': return <BiomechanicsSandbox />;
      case 'markdown-editor': return <MarkdownSandbox />;
      case 'terminal': return <TerminalSandbox />;
      case 'adinkra-vector': return <AdinkraSandbox />;
      default: return <AudioSynthSandbox />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full sm:max-w-4xl bg-slate-900 border border-slate-800 sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-8 max-h-[100vh] sm:max-h-[92vh] flex flex-col">
        {/* Top bar with Share */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
        <button onClick={handleShare} className="absolute top-4 right-14 z-20 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors" title="Copy link">
          <Share2 className="w-4 h-4" />
        </button>
        {copied && <div className="absolute top-14 right-4 z-20 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded">Copied!</div>}

        <div className="relative shrink-0 border-b border-slate-800">
          {app.isFlagged && (
            <div className="bg-rose-950 border-b border-rose-800/80 p-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 relative">
              <div className="flex items-center gap-2 text-xs text-rose-200"><AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /><span><strong>Policy Violation:</strong> {app.flagReason || 'Flagged for violating Zero-Tracker Constitution'}</span></div>
              <button onClick={() => { setDeleteMode('moderator'); setShowDeleteModal(true); }} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></button>
            </div>
          )}

          {app.heroImage ? (
            <div className="h-48 sm:h-56 w-full relative overflow-hidden bg-slate-950">
              <img src={getOptimizedImageUrl(resolveAppMedia(app.heroImage), 800)} alt={app.name} referrerPolicy="no-referrer" onError={(e) => { const target = e.currentTarget; const fallback = getAppCategoryPlaceholder(app.category, app.name); if (target.src !== fallback) target.src = fallback; }} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>
          ) : (
            <div className="h-28 w-full bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900" />
          )}

          <div className="px-4 sm:px-6 pb-5 pt-2 relative -mt-12 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5 sm:gap-4 min-w-0 flex-1">
              <img src={getOptimizedImageUrl(resolveAppMedia(app.thumbnail), 200)} alt={app.name} referrerPolicy="no-referrer" onError={(e) => { const target = e.currentTarget; const fallback = getAppCategoryPlaceholder(app.category, app.name); if (target.src !== fallback) target.src = fallback; }} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-800 shadow-xl bg-slate-950 shrink-0" loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <span className="truncate">{app.category}</span><span className="text-slate-600">Â·</span>
                  <span className="truncate">{app.developer}</span>
                  <VerifiedBadge verified={app.developerVerified} size="sm" />
                  <span className="hidden sm:inline-flex items-center gap-1"><span className="text-slate-600">Â·</span><DownloadTicker baseCount={app.downloadsCount} /></span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">{app.name}</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-2 max-w-xl">{app.tagline}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-w-full">
              {isInstalling || isUpdating ? (
                <div className="px-4 py-2 bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono border border-slate-700 flex items-center gap-2 whitespace-nowrap"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" /><span>{installedState?.progress || 0}%</span></div>
              ) : isInstalled ? (
                <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                  <span className="px-3.5 py-2 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /><span>Installed v{installedState?.installedVersion}</span></span>
                  <button onClick={() => onUninstall(app.id)} className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/40">Uninstall</button>
                </div>
              ) : (
                <button onClick={handleInstall} className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 active:scale-95 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"><Download className="w-4 h-4 text-indigo-600" /><span>{app.price === 0 ? 'Install Free' : `Buy ${app.priceFormatted}`}</span></button>
              )}
              <button onClick={() => setActiveTab('test-drive')} className="px-3.5 py-2 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/60 rounded-lg flex items-center gap-1.5 whitespace-nowrap"><Play className="w-3.5 h-3.5 fill-current" /><span>Test Drive</span></button>
              {app.liveAppUrl && <a href={app.liveAppUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/50 rounded-lg flex items-center gap-1.5 whitespace-nowrap"><ExternalLink className="w-3.5 h-3.5" /><span>Live</span></a>}
              <button onClick={() => onStartCompare(app)} className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg flex items-center gap-1.5 whitespace-nowrap"><ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" /><span>Compare</span></button>
              {app.isUserUploaded && <button onClick={() => { setDeleteMode('owner'); setOwnerAuthKeyInput(''); setAuthError(null); setShowDeleteModal(true); }} className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg flex items-center gap-1.5 whitespace-nowrap"><Key className="w-3.5 h-3.5" /><span>Delete (Owner)</span></button>}
              {!isOwner && isStoreManager && <button onClick={() => { setDeleteMode('moderator'); setOwnerAuthKeyInput(''); setAuthError(null); setShowDeleteModal(true); }} className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-center gap-1.5 whitespace-nowrap"><ShieldAlert className="w-3.5 h-3.5" /><span>Delete (Manager)</span></button>}
            </div>
          </div>

          <div className="px-6 py-2.5 bg-slate-950/50 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-white font-medium tabular-nums">{app.rating.toFixed(1)}</span><span className="text-slate-500">({app.reviewCount.toLocaleString()})</span></div>
            <span className="text-slate-700">Â·</span>
            <div className="flex items-center gap-1.5"><span className="text-slate-500">Live:</span><DownloadTicker baseCount={app.downloadsCount} /></div>
            <span className="text-slate-700">Â·</span>
            <div><span className="text-slate-500">Size: </span><span className="text-slate-200 font-mono">{app.sizeMB} MB</span></div>
            <span className="text-slate-700">Â·</span>
            <div><span className="text-slate-500">v</span><span className="text-slate-200 font-mono">{app.currentVersion}</span></div>
            <span className="text-slate-700">Â·</span>
            <div className="flex items-center gap-1"><span className="text-slate-500">Privacy:</span><span className="text-emerald-400 font-semibold">{app.privacyGrade}</span><VerifiedBadge verified={app.developerVerified} size="sm" /></div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-900/60">
          {(['overview','test-drive','privacy','history','reviews'] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${activeTab===t ? 'bg-slate-800 text-white shadow-sm border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}>
              {t==='test-drive' && <Play className="w-3 h-3 fill-current" />}
              {t==='history' && <RotateCcw className="w-3 h-3" />}
              <span className="capitalize">{t==='test-drive' ? 'Test Drive' : t==='history' ? 'Rollback' : t}</span>
              {t==='reviews' && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">{app.reviews.length}</span>}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {rollbackSuccess && <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /><span>{rollbackSuccess}</span></div>}

          {activeTab === 'overview' && (
            <div className="space-y-6 text-sm text-slate-300">
              {app.editorialHighlight && <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl"><span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">Editorial Selection</span><h4 className="text-base font-semibold text-white">{app.editorialHighlight.headline}</h4><p className="text-xs text-slate-400 mt-2 italic">"{app.editorialHighlight.curatorQuote}"</p></div>}
              <div><h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> About</h4><p className="text-xs sm:text-sm leading-relaxed">{app.summary}</p></div>
              <div><h4 className="text-sm font-semibold text-white mb-3">Key Highlights</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{app.features.map((feat, idx) => <div key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60"><Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" /><span className="text-xs leading-snug">{feat}</span></div>)}</div></div>
              <div className="pt-4 border-t border-slate-800"><h4 className="text-sm font-semibold text-white mb-2">Platform Compatibility</h4><div className="flex flex-wrap gap-2 text-xs">{app.supportedDevices.map(dev => <span key={dev} className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">{dev}</span>)}<span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-mono">OS: {app.minOS}</span></div></div>
              {(app.liveAppUrl || app.sourceCodeUrl || app.packageBundleName) && <div className="pt-4 border-t border-slate-800"><h4 className="text-sm font-semibold text-white mb-2">Distribution</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">{app.liveAppUrl && <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"><div className="min-w-0"><span className="text-[11px] text-slate-400 block">Live URL</span><a href={app.liveAppUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1.5 truncate underline">{app.liveAppUrl}<ExternalLink className="w-3 h-3 shrink-0" /></a></div></div>}{app.sourceCodeUrl && <div className="bg-slate-950 p-3 rounded-xl border border-slate-800"><span className="text-[11px] text-slate-400 block">Source</span><a href={app.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1.5 underline"><span className="truncate">{app.sourceCodeUrl}</span><ExternalLink className="w-3 h-3" /></a></div>}{app.packageBundleName && <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:col-span-2"><div><span className="text-[11px] text-slate-400 block">Package</span><span className="text-slate-200 font-mono text-xs">{app.packageBundleName}</span></div><span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">Verified</span></div>}</div></div>}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs"><ShieldCheck className="w-4 h-4" /><span>Ownership & Moderation</span></div>{onOpenOwnerGuide && <button onClick={onOpenOwnerGuide} className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Guide</button>}</div><p className="text-xs text-slate-400 leading-relaxed">{isOwner ? `You are owner (UID: ${userUID}). Full sovereignty.` : isStoreManager ? "Manager Mode Active: root permissions." : `Protected: Owner UID (${app.ownerId || 'Prism Ecosystem'}).`}</p></div>
              {/* Related Apps Discovery */}
              {allApps.length > 0 && <RelatedApps currentApp={app} allApps={allApps} installedMap={{}} onOpenDetails={(a)=>{ onClose(); setTimeout(()=>onInstall(a),100); }} onQuickInstall={onInstall} onOpenSandbox={()=>setActiveTab('test-drive')} />}
            </div>
          )}

          {activeTab === 'test-drive' && <div className="space-y-4"><div className="bg-indigo-950/30 border border-indigo-800/40 p-3 rounded-lg text-xs text-indigo-300"><strong className="block text-white">Instant Test Drive Environment</strong><span>Local WASM/JS runtime. Zero disk write.</span></div>{renderSandbox()}</div>}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-[11px] text-slate-400 block mb-1">Privacy Grade</span><div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-2">{app.privacyGrade} <VerifiedBadge verified /></div><span className="text-xs text-slate-400 mt-1 block">Independent Audit</span></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-[11px] text-slate-400 block mb-1">Trackers</span><div className="text-2xl font-bold text-white font-mono flex items-center gap-2">0 <DownloadTicker baseCount={app.downloadsCount} /></div><span className="text-xs text-slate-400 mt-1 block">No Ad SDKs</span></div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><span className="text-[11px] text-slate-400 block mb-1">Offline</span><div className="text-2xl font-bold text-white font-mono">{app.offlineCapable ? '100% Offline' : 'Hybrid'}</div><span className="text-xs text-slate-400 mt-1 block">Zero Cloud</span></div>
              </div>
              <div><h4 className="text-sm font-semibold text-white mb-2">Permission Audit</h4>{app.permissions.length===0 ? <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">No hardware permissions. Hermetic sandbox.</div> : <div className="space-y-2">{app.permissions.map(perm=><div key={perm.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-slate-200">{perm.name}</span><span className="text-[10px] font-mono text-slate-500">[{perm.category}]</span><span className={`text-[10px] ${perm.required ? 'text-amber-400' : 'text-slate-400'}`}>{perm.required ? 'Required' : 'Optional'}</span></div><p className="text-xs text-slate-400">{perm.reason}</p></div><span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${perm.safetyImpact==='Low' ? 'text-emerald-400 border-emerald-900/60 bg-emerald-950/30' : 'text-amber-400 border-amber-900/60 bg-amber-950/30'}`}>{perm.safetyImpact} Risk</span></div>)}</div>}</div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"><div><h4 className="text-sm font-semibold text-white">Full Version Rollback Archive</h4><p className="text-xs text-slate-400 mt-0.5">Pin or rollback to any verified release.</p></div></div>
              <div className="space-y-3">{app.versionHistory.map((ver)=> <div key={ver.version} className={`bg-slate-950 p-4 rounded-xl border ${ver.isLatest ? 'border-indigo-500/40 bg-indigo-950/10' : 'border-slate-800'}`}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="text-sm font-bold font-mono text-white">v{ver.version}</span>{ver.isLatest && <span className="text-[11px] text-indigo-400">Current</span>}<span className="text-slate-600">Â·</span><span className="text-xs text-slate-400">{ver.releaseDate}</span><span className="text-slate-600">Â·</span><span className="text-xs font-mono text-slate-400">{ver.sizeMB} MB</span></div><button onClick={()=>handleRollback(ver.version)} className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"><RotateCcw className="w-3 h-3 text-indigo-400" /><span>Install {ver.version}</span></button></div><ul className="space-y-1 mt-2 text-xs text-slate-400">{ver.highlights.map((note,hIdx)=><li key={hIdx} className="flex gap-1.5"><span className="text-indigo-400">â€¢</span><span>{note}</span></li>)}</ul></div>)}</div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="space-y-3">{app.reviews.map(rev=> <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800"><div className="flex items-center justify-between mb-2"><div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-white">{rev.author}</span>{rev.verifiedPurchase && <span className="text-[11px] text-emerald-400">Verified</span>}<span className="text-slate-600">Â·</span><span className="text-[11px] text-slate-400">{rev.device}</span></div><div className="flex items-center gap-1 mt-1">{[...Array(5)].map((_,i)=><Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />)}<span className="text-xs text-slate-300 ml-1.5">{rev.title}</span></div></div><span className="text-[11px] text-slate-500">{rev.date}</span></div><p className="text-xs text-slate-300 leading-relaxed mt-2">{rev.content}</p></div>)}</div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800"><h4 className="text-sm font-semibold text-white mb-2">Leave a Verified Review</h4>{submittedReview ? <div className="text-xs text-emerald-400 flex items-center gap-2 py-2"><CheckCircle2 className="w-4 h-4" /><span>Your review was published.</span></div> : <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs"><div className="flex items-center gap-2"><span className="text-slate-400">Rating:</span><div className="flex gap-1">{[1,2,3,4,5].map(star=> <button type="button" key={star} onClick={()=>setNewRating(star)} className="p-1"><Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} /></button>)}</div></div><input type="text" placeholder="Headline" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" /><textarea placeholder="Your thoughts..." value={newContent} onChange={e=>setNewContent(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none" /><button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg">Publish Review</button></form>}</div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Install Bar - Excellent UX */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0"><div className="text-sm font-bold text-white truncate flex items-center gap-2">{app.priceFormatted} {app.priceModel==='Open Source' && <span className="text-teal-400 font-mono text-[10px]">Open Source</span>}</div><div className="text-[11px] text-slate-400 flex items-center gap-1.5"><VerifiedBadge verified={app.developerVerified} size="sm" /><span>Â·</span><DownloadTicker baseCount={app.downloadsCount} /></div></div>
            <div className="flex items-center gap-2 shrink-0">
              {isInstalled ? <><button onClick={()=>onUninstall(app.id)} className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs">Uninstall</button>{app.liveAppUrl && <a href={app.liveAppUrl} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5"><ExternalLink className="w-4 h-4" /> Launch</a>}</> : <button onClick={handleInstall} disabled={!!isInstalling} className="px-6 py-2.5 bg-white hover:bg-slate-100 disabled:bg-slate-700 text-slate-900 disabled:text-slate-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg min-w-[120px] justify-center">{isInstalling ? <><div className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-slate-900 animate-spin" /><span>{installedState?.progress}%</span></> : <><Download className="w-4 h-4" /><span>{copied ? 'Link Copied!' : 'Get App'}</span></>}</button>}
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400"><Key className="w-5 h-5" /></div><div><h4 className="text-base font-bold text-white">{deleteMode==='owner' ? 'Owner Auth & Deletion' : 'Moderator Removal'}</h4><p className="text-xs text-rose-300">Unpublishing <strong className="text-white">{app.name}</strong></p></div></div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"><div className="flex items-center justify-between text-slate-400"><span>Registered Owner UID:</span><span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 font-semibold">{targetOwnerUID || 'PRISM-ECOSYSTEM-CORE'}</span></div><div className="flex items-center justify-between text-slate-400"><span>Current Session UID:</span><span className="font-mono text-slate-300">{userUID}</span></div><div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">{isOwnerSessionMatch ? <span className="text-[11px] text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /><span>Session matches owner. Auth required below.</span></span> : <span className="text-[11px] text-amber-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /><span>Enter registered Owner UID to authorize.</span></span>}</div></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-200 block">{deleteMode==='owner' ? (isOwnerSessionMatch ? <span>Confirm (Type <span className="font-mono text-rose-400">DELETE</span> or Owner UID):</span> : <span>Enter Registered Owner UID:</span>) : <span>Enter Manager Passkey (<span className="font-mono text-amber-400">Manager Passkey</span>):</span>}</label><div className="relative"><input type="text" value={ownerAuthKeyInput} onChange={e=>{setOwnerAuthKeyInput(e.target.value); setAuthError(null);}} placeholder={deleteMode==='owner' ? (isOwnerSessionMatch ? 'Type DELETE' : `Enter ${targetOwnerUID || 'Owner UID'}`) : 'Enter Manager Passkey'} className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none ${isOwnerAuthenticated ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : 'border-slate-700 focus:border-rose-500'}`} />{isOwnerAuthenticated && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-slate-950 px-1"><CheckCircle2 className="w-4 h-4" /><span>Authenticated</span></div>}</div>{authError && <p className="text-[11px] text-rose-400 font-medium">{authError}</p>}</div>
              <div className="space-y-1.5 text-xs"><label className="text-slate-300 block font-medium">Reason:</label><select value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500">{deleteMode==='owner' ? <><option>Owner Request / Decommissioning Application</option><option>Replaced by Upgraded Release</option><option>Outdated or Broken Live Website URL</option><option>Other</option></> : <><option>Inappropriate Content / Violates Guidelines</option><option>Zero-Tracker Policy Violation</option><option>Malicious, Phishing, or Broken Code</option><option>Deceptive Subscription / Payment Trap</option><option>Other</option></>}</select>{deleteReason==='Other' && <input type="text" placeholder="Specify reason..." value={customReason} onChange={e=>setCustomReason(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-rose-500 mt-1" />}</div>
              <div className="pt-2 flex items-center justify-end gap-2.5"><button onClick={()=>{setShowDeleteModal(false); setOwnerAuthKeyInput(''); setAuthError(null);}} className="px-3.5 py-2 text-xs text-slate-400 hover:text-white">Cancel</button><button onClick={()=>{ if(!isOwnerAuthenticated){ setAuthError('Auth required: Enter valid Owner UID or type DELETE.'); return; } const finalReason = deleteReason==='Other' && customReason.trim() ? customReason : deleteReason; if(onAppDeleted){ onAppDeleted(app.id, finalReason, deleteMode==='owner' ? 'Owner' : 'Prism Store Developer / Manager'); } setShowDeleteModal(false); setOwnerAuthKeyInput(''); onClose(); }} disabled={!isOwnerAuthenticated} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md ${isOwnerAuthenticated ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95' : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'}`}><Trash2 className="w-3.5 h-3.5" /><span>{isOwnerAuthenticated ? 'Permanently Delete' : 'Authenticate to Delete'}</span></button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};






