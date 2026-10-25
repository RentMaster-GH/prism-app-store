import React, { useState, useMemo } from 'react';
import { 
  X, Star, Download, Play, Check, ShieldCheck, 
  RotateCcw, Lock, Radio, HardDrive, Smartphone,
  Layers, ArrowLeftRight, CheckCircle2, AlertTriangle, ExternalLink,
  Trash2, ShieldAlert, BookOpen, Key, UserCheck
} from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';
import { resolveAppMedia, getAppCategoryPlaceholder } from '../utils/media';
import { AudioSynthSandbox } from './sandboxes/AudioSynthSandbox';
import { VectorCanvasSandbox } from './sandboxes/VectorCanvasSandbox';
import { BiomechanicsSandbox } from './sandboxes/BiomechanicsSandbox';
import { MarkdownSandbox } from './sandboxes/MarkdownSandbox';
import { TerminalSandbox } from './sandboxes/TerminalSandbox';
import { AdinkraSandbox } from './sandboxes/AdinkraSandbox';

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
  onOpenStoreManagerAuth
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'test-drive' | 'privacy' | 'history' | 'reviews'>(initialTab);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  // App Ownership check
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

  // Deletion Modal State & Owner Authentication
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'owner' | 'moderator'>('owner');
  const [ownerAuthKeyInput, setOwnerAuthKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>(
    app.isFlagged ? 'Inappropriate Content / Violates Guidelines' : 'Owner Request / Decommissioning Application'
  );
  const [customReason, setCustomReason] = useState('');

  // Validate owner authentication before deletion is allowed
  const isOwnerAuthenticated = useMemo(() => {
    if (deleteMode === 'moderator') {
      return isStoreManager || ownerAuthKeyInput.trim() === 'PRISM-ROOT-9090';
    }
    const input = ownerAuthKeyInput.trim().toUpperCase();
    if (!input) return false;

    // If active session matches registered owner, user can authorize with their UID or type 'DELETE'
    if (isOwnerSessionMatch) {
      return input === 'DELETE' || (targetOwnerUID && input === targetOwnerUID.toUpperCase());
    }

    // If active session does not match registered owner, user MUST provide the registered Owner UID or Master Key
    return (targetOwnerUID && input === targetOwnerUID.toUpperCase()) || input === 'PRISM-ROOT-9090';
  }, [deleteMode, isStoreManager, ownerAuthKeyInput, isOwnerSessionMatch, targetOwnerUID]);

  // Review Form state
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

  const renderSandbox = () => {
    switch (app.sandboxType) {
      case 'audio-synth':
        return <AudioSynthSandbox />;
      case 'vector-canvas':
        return <VectorCanvasSandbox />;
      case 'biomechanics':
        return <BiomechanicsSandbox />;
      case 'markdown-editor':
        return <MarkdownSandbox />;
      case 'terminal':
        return <TerminalSandbox />;
      case 'adinkra-vector':
        return <AdinkraSandbox />;
      default:
        return <AudioSynthSandbox />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header / Banner */}
        <div className="relative shrink-0 border-b border-slate-800">
          {app.isFlagged && (
            <div className="bg-rose-950 border-b border-rose-800/80 p-3 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 relative">
              <div className="flex items-center gap-2 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong>Policy Violation Notice:</strong> {app.flagReason || 'Flagged for violating Zero-Tracker Constitution'}</span>
              </div>
              <button
                onClick={() => {
                  setDeleteMode('moderator');
                  setShowDeleteModal(true);
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inappropriate App</span>
              </button>
            </div>
          )}

          {app.heroImage ? (
            <div className="h-48 sm:h-56 w-full relative overflow-hidden bg-slate-950">
              <img
                src={resolveAppMedia(app.heroImage)}
                alt={app.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getAppCategoryPlaceholder(app.category, app.name);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>
          ) : (
            <div className="h-28 w-full bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900" />
          )}

          {/* Contiguous Purchase & Metadata Block */}
          <div className="px-4 sm:px-6 pb-5 pt-2 relative -mt-12 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            {/* App Branding & Metadata */}
            <div className="flex items-end gap-3.5 sm:gap-4 min-w-0 flex-1">
              <img
                src={resolveAppMedia(app.thumbnail)}
                alt={app.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = getAppCategoryPlaceholder(app.category, app.name);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-slate-800 shadow-xl bg-slate-950 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="truncate">{app.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="truncate">{app.developer}</span>
                  {app.developerVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline shrink-0" />
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {app.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-2 max-w-xl">
                  {app.tagline}
                </p>
              </div>
            </div>

            {/* CTAs: Responsive Flow Container - Fully visible on laptops and small screens */}
            <div className="flex flex-wrap items-center gap-2 max-w-full">
              {/* PRIMARY ACTION FIRST: Install Free / Buy / Installing / Installed */}
              {isInstalling || isUpdating ? (
                <div className="px-4 py-2 bg-slate-800 text-indigo-300 rounded-lg text-xs font-mono border border-slate-700 flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Installing {installedState?.progress || 0}%</span>
                </div>
              ) : isInstalled ? (
                <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                  <span className="px-3.5 py-2 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Installed (v{installedState?.installedVersion})</span>
                  </span>
                  <button
                    onClick={() => onUninstall(app.id)}
                    className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/40 cursor-pointer"
                  >
                    Uninstall
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onInstall(app)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 active:scale-95 rounded-xl text-xs font-bold transition-all shadow-lg shadow-white/10 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Install this application directly to your library"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span className="tracking-tight">{app.price === 0 ? 'Install Free' : `Buy ${app.priceFormatted}`}</span>
                </button>
              )}

              {/* SECONDARY ACTION: Test Drive */}
              <button
                onClick={() => setActiveTab('test-drive')}
                className="px-3.5 py-2 text-xs font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/60 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                title="Launch interactive instant playground"
              >
                <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                <span>Test Drive</span>
              </button>

              {/* SECONDARY ACTION: Launch Live App if available */}
              {app.liveAppUrl && (
                <a
                  href={app.liveAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                  title={`Open live web app directly at ${app.liveAppUrl}`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Launch Live App</span>
                </a>
              )}

              {/* SECONDARY ACTION: Compare */}
              <button
                onClick={() => onStartCompare(app)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                title="Compare side-by-side with another application"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compare</span>
              </button>

              {/* OWNER ACTION: Delete My App (Owner) - Protected by Owner Authentication */}
              {app.isUserUploaded && (
                <button
                  onClick={() => {
                    setDeleteMode('owner');
                    setOwnerAuthKeyInput('');
                    setAuthError(null);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Owner Action: Authenticate to delete your uploaded app"
                >
                  <Key className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete My App (Owner)</span>
                </button>
              )}

              {/* MODERATOR ACTION: Store Manager Delete */}
              {!isOwner && isStoreManager && (
                <button
                  onClick={() => {
                    setDeleteMode('moderator');
                    setOwnerAuthKeyInput('');
                    setAuthError(null);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Store Developer Action: Delete inappropriate app from store"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete App (Store Manager)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="px-6 py-2.5 bg-slate-950/50 border-t border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-white font-medium tabular-nums">{app.rating.toFixed(1)}</span>
              <span className="text-slate-500">({app.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <span className="text-slate-700">·</span>

            <div>
              <span className="text-slate-500">Downloads: </span>
              <span className="text-slate-200 font-mono">{app.downloadsCount}</span>
            </div>

            <span className="text-slate-700">·</span>

            <div>
              <span className="text-slate-500">Size: </span>
              <span className="text-slate-200 font-mono">{app.sizeMB} MB</span>
            </div>

            <span className="text-slate-700">·</span>

            <div>
              <span className="text-slate-500">Version: </span>
              <span className="text-slate-200 font-mono">v{app.currentVersion}</span>
            </div>

            <span className="text-slate-700">·</span>

            <div className="flex items-center gap-1">
              <span className="text-slate-500">Privacy Audit: </span>
              <span className="text-emerald-400 font-semibold">{app.privacyGrade} (0 Trackers)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Segmented interactive buttons) */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Specs
          </button>

          <button
            onClick={() => setActiveTab('test-drive')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'test-drive'
                ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/40'
                : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Interactive Test Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy & Permissions
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Version Rollback</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified Reviews ({app.reviews.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {rollbackSuccess && (
            <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{rollbackSuccess}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 text-sm text-slate-300">
              {app.editorialHighlight && (
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
                  <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                    Editorial Selection
                  </span>
                  <h4 className="text-base font-semibold text-white tracking-tight">
                    {app.editorialHighlight.headline}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
                    "{app.editorialHighlight.curatorQuote}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">About This Software</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {app.summary}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Key Architecture Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {app.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported Hardware Form Factors */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-2">Platform Compatibility</h4>
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  {app.supportedDevices.map(dev => (
                    <span key={dev} className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                      {dev}
                    </span>
                  ))}
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-mono">
                    OS: {app.minOS}
                  </span>
                </div>
              </div>

              {/* Distribution & Web Links */}
              {(app.liveAppUrl || app.sourceCodeUrl || app.packageBundleName) && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-semibold text-white mb-2">Distribution & Hosted URLs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {app.liveAppUrl && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Live Application URL</span>
                          <a
                            href={app.liveAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-xs flex items-center gap-1.5 font-medium underline"
                          >
                            <span>{app.liveAppUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {app.sourceCodeUrl && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Source Repository</span>
                          <a
                            href={app.sourceCodeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 font-mono text-xs flex items-center gap-1.5 font-medium underline"
                          >
                            <span>{app.sourceCodeUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    {app.packageBundleName && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between sm:col-span-2">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Verified Package Bundle</span>
                          <span className="text-slate-200 font-mono text-xs">{app.packageBundleName}</span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                          Package Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* App Ownership & Developer Moderation Governance */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>App Ownership & Moderation Governance</span>
                  </div>
                  {onOpenOwnerGuide && (
                    <button
                      onClick={onOpenOwnerGuide}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Owner Step-by-Step Guide</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {isOwner
                    ? `You are recognized as the owner of this application (UID: ${userUID}) in Prism Store. You have perpetual sovereignty to update live links, review owner guides, or permanently delete your uploaded app.`
                    : isStoreManager
                    ? "Prism Store Developer / Manager Mode Active: You have root permissions to moderate and delete inappropriate applications violating the Zero-Tracker Constitution."
                    : `Protected Listing: Managed by owner UID (${app.ownerId || 'Prism Ecosystem'}). Only the authentic app owner or Prism Store Manager can delete this software.`}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
                  {isOwner && (
                    <button
                      onClick={() => {
                        setDeleteMode('owner');
                        setShowDeleteModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Owner Action: Delete My Uploaded App</span>
                    </button>
                  )}

                  {isStoreManager && (
                    <button
                      onClick={() => {
                        setDeleteMode('moderator');
                        setShowDeleteModal(true);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Developer Moderation: Delete Inappropriate App</span>
                    </button>
                  )}

                  {!isOwner && !isStoreManager && (
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Non-owners cannot delete other developers' applications.</span>
                      </span>
                      <button
                        onClick={onOpenStoreManagerAuth}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-700/60 rounded-md font-medium text-[11px] transition-colors"
                      >
                        Store Developer Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE TEST DRIVE */}
          {activeTab === 'test-drive' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-800/40 p-3 rounded-lg text-xs text-indigo-300 flex items-center justify-between">
                <div>
                  <strong className="block text-white font-medium">Instant Test Drive Environment</strong>
                  <span>Running local WebAssembly/JS runtime directly in this view. Zero local disk write required.</span>
                </div>
              </div>
              {renderSandbox()}
            </div>
          )}

          {/* TAB 3: PRIVACY & PERMISSIONS */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Privacy Grade</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">{app.privacyGrade}</div>
                  <span className="text-xs text-slate-400 mt-1 block">Certified Independent Audit</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Third-Party Trackers</span>
                  <div className="text-2xl font-bold text-white font-mono">0 Detected</div>
                  <span className="text-xs text-slate-400 mt-1 block">No Ad SDKs or Telemetry</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Offline Resilience</span>
                  <div className="text-2xl font-bold text-white font-mono">
                    {app.offlineCapable ? '100% Offline' : 'Hybrid'}
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block">Zero Mandatory Cloud</span>
                </div>
              </div>

              {/* Permissions Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Hardware & System Permission Audit</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Unlike traditional stores that hide permissions in vague legal disclaimers, each requested capability is audited here with its architectural justification.
                </p>

                {app.permissions.length === 0 ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No hardware permissions requested. This application runs entirely in a hermetic local sandbox.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {app.permissions.map(perm => (
                      <div key={perm.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-200">{perm.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              [{perm.category}]
                            </span>
                            {perm.required ? (
                              <span className="text-[10px] text-amber-400">Required</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Optional</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{perm.reason}</p>
                        </div>
                        <span className={`text-[11px] font-mono shrink-0 px-2 py-0.5 rounded border ${
                          perm.safetyImpact === 'Low'
                            ? 'text-emerald-400 border-emerald-900/60 bg-emerald-950/30'
                            : 'text-amber-400 border-amber-900/60 bg-amber-950/30'
                        }`}>
                          {perm.safetyImpact} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VERSION ROLLBACK & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Full Version Rollback Archive</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Traditional stores force updates that can break workflows. In Prism Store, you can pin or rollback to any verified historical release at any time.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {app.versionHistory.map((ver, idx) => (
                  <div
                    key={ver.version}
                    className={`bg-slate-950 p-4 rounded-xl border transition-colors ${
                      ver.isLatest
                        ? 'border-indigo-500/40 bg-indigo-950/10'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-white">v{ver.version}</span>
                        {ver.isLatest && (
                          <span className="text-[11px] font-medium text-indigo-400">Current Production</span>
                        )}
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400">{ver.releaseDate}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs font-mono text-slate-400">{ver.sizeMB} MB</span>
                      </div>

                      <button
                        onClick={() => handleRollback(ver.version)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3 h-3 text-indigo-400" />
                        <span>Install {ver.version}</span>
                      </button>
                    </div>

                    <ul className="space-y-1 mt-2 text-xs text-slate-400">
                      {ver.highlights.map((note, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VERIFIED REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Existing Reviews */}
              <div className="space-y-3">
                {app.reviews.map(rev => (
                  <div key={rev.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{rev.author}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[11px] text-emerald-400">Verified User</span>
                          )}
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px] text-slate-400">{rev.device}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-medium text-slate-300 ml-1.5">{rev.title}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500">{rev.date}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-2">{rev.content}</p>
                  </div>
                ))}
              </div>

              {/* Add a Review Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-2">Leave a Verified Review</h4>
                {submittedReview ? (
                  <div className="text-xs text-emerald-400 flex items-center gap-2 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your review was published to the local registry.</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= newRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Review Headline (e.g. Flawless audio engine)"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <textarea
                        placeholder="Your thoughts on performance, offline capability, or workflow..."
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                    >
                      Publish Review
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Dialog Overlay for Deletion with Mandatory Owner Authentication */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div 
              className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {deleteMode === 'owner' ? 'Owner Authentication & Deletion' : 'Store Moderator App Removal'}
                  </h4>
                  <p className="text-xs text-rose-300">
                    Authorizing unpublishing of <strong className="text-white">{app.name}</strong>
                  </p>
                </div>
              </div>

              {/* Owner Identity Verification Status Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium">Registered Owner UID:</span>
                  <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 font-semibold">
                    {targetOwnerUID || 'PRISM-ECOSYSTEM-CORE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium">Current Session UID:</span>
                  <span className="font-mono text-slate-300">
                    {userUID}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  {isOwnerSessionMatch ? (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Active session matches registered App Owner. Authorization required below.</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Owner authentication required. Enter the registered Owner UID below to authorize.</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Authentication Challenge Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 block">
                  {deleteMode === 'owner' ? (
                    isOwnerSessionMatch ? (
                      <span>
                        Confirm Owner Authorization (Type <span className="font-mono text-rose-400">DELETE</span> or your Owner UID):
                      </span>
                    ) : (
                      <span>
                        Enter Registered Owner UID to Authenticate:
                      </span>
                    )
                  ) : (
                    <span>
                      Enter Store Manager Passkey (<span className="font-mono text-amber-400">PRISM-ROOT-9090</span>):
                    </span>
                  )}
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={ownerAuthKeyInput}
                    onChange={e => {
                      setOwnerAuthKeyInput(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder={
                      deleteMode === 'owner'
                        ? (isOwnerSessionMatch ? 'Type DELETE to confirm owner authorization' : `Enter ${targetOwnerUID || 'Owner UID'}`)
                        : 'Enter PRISM-ROOT-9090'
                    }
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors ${
                      isOwnerAuthenticated 
                        ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' 
                        : 'border-slate-700 focus:border-rose-500'
                    }`}
                  />
                  {isOwnerAuthenticated && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-slate-950 px-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Owner Authenticated</span>
                    </div>
                  )}
                </div>

                {authError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{authError}</p>
                )}
              </div>

              {/* Reason for Deletion */}
              <div className="space-y-1.5 text-xs">
                <label className="text-slate-300 block font-medium">Select Reason for Deletion:</label>
                <select
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {deleteMode === 'owner' ? (
                    <>
                      <option value="Owner Request / Decommissioning Application">Owner Request / Decommissioning Application</option>
                      <option value="Replaced by Upgraded Release">Replaced by Upgraded Release</option>
                      <option value="Outdated or Broken Live Website URL">Outdated or Broken Live Website URL</option>
                      <option value="Other">Other Reason</option>
                    </>
                  ) : (
                    <>
                      <option value="Inappropriate Content / Violates Guidelines">Inappropriate Content / Violates Guidelines</option>
                      <option value="Zero-Tracker Policy Violation (Excessive Ad Trackers)">Zero-Tracker Policy Violation (Excessive Ad Trackers)</option>
                      <option value="Malicious, Phishing, or Broken Code">Malicious, Phishing, or Broken Code</option>
                      <option value="Deceptive Subscription / Payment Trap">Deceptive Subscription / Payment Trap</option>
                      <option value="Other">Other Violation</option>
                    </>
                  )}
                </select>

                {deleteReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify custom reason..."
                    value={customReason}
                    onChange={e => setCustomReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-rose-500 mt-1"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOwnerAuthKeyInput('');
                    setAuthError(null);
                  }}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!isOwnerAuthenticated) {
                      setAuthError('Authentication required: Enter the valid Owner UID or type DELETE to authorize deletion.');
                      return;
                    }
                    const finalReason = deleteReason === 'Other' && customReason.trim() ? customReason : deleteReason;
                    if (onAppDeleted) {
                      onAppDeleted(app.id, finalReason, deleteMode === 'owner' ? 'Owner' : 'Prism Store Developer / Manager');
                    }
                    setShowDeleteModal(false);
                    setOwnerAuthKeyInput('');
                    onClose();
                  }}
                  disabled={!isOwnerAuthenticated}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    isOwnerAuthenticated
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                  }`}
                  title={isOwnerAuthenticated ? 'Execute deletion of this application' : 'Authenticate above to enable deletion'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isOwnerAuthenticated ? 'Permanently Delete App' : 'Authenticate to Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
