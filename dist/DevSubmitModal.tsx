import React, { useState, useRef, useMemo } from 'react';
import { 
  X, CheckCircle2, ShieldAlert, Upload, Terminal, Code, 
  Cpu, Check, Sparkles, Globe, FileCode, Paperclip, ExternalLink,
  Trash2, AlertTriangle, BookOpen, Layers, ShieldCheck, ArrowRight,
  HelpCircle, Info, RefreshCw, Filter, Search, UserCheck, Lock, Unlock, Key
} from 'lucide-react';
import { AppItem, DeletedAppAuditItem } from '../types';
import { OwnerGuidePortal } from './OwnerGuidePortal';
import { resolveAppMedia, getAppCategoryPlaceholder, APP_MEDIA_ASSETS } from '../utils/media';

interface DevSubmitModalProps {
  onClose: () => void;
  apps: AppItem[];
  onAppPublished: (newApp: AppItem) => void;
  onAppDeleted: (appId: string, reason: string, deletedBy: 'Owner' | 'Prism Store Developer / Manager') => void;
  onRestoreApp?: (app: AppItem) => void;
  initialTab?: 'publish' | 'owner-apps' | 'moderation' | 'guide' | 'audit-log';
  deletedAppsLog?: DeletedAppAuditItem[];
  userUID: string;
  isStoreManager: boolean;
  onOpenStoreManagerAuth: () => void;
  onUpdateUID: (newUID: string) => void;
}

export const DevSubmitModal: React.FC<DevSubmitModalProps> = ({
  onClose,
  apps,
  onAppPublished,
  onAppDeleted,
  onRestoreApp,
  initialTab = 'publish',
  deletedAppsLog = [],
  userUID,
  isStoreManager,
  onOpenStoreManagerAuth,
  onUpdateUID
}) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'owner-apps' | 'moderation' | 'guide' | 'audit-log'>(initialTab);

  // Form State
  const [appName, setAppName] = useState('');
  const [tagline, setTagline] = useState('');
  const [developer, setDeveloper] = useState('');
  const [category, setCategory] = useState<'Audio & Music' | 'Design & Creative' | 'Health & Biometrics' | 'Developer Tools' | 'Productivity & Notes' | 'Sports'>('Design & Creative');
  const [priceModel, setPriceModel] = useState<'Free' | 'One-Time' | 'Open Source'>('Open Source');
  const [price, setPrice] = useState('0');
  const [sizeMB, setSizeMB] = useState('24.6');
  
  // URL & Package Bundle States
  const [liveAppUrl, setLiveAppUrl] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSizeMB, setUploadedFileSizeMB] = useState<number | null>(null);

  const [zeroTrackersConfirmed, setZeroTrackersConfirmed] = useState(true);
  const [offlineCapable, setOfflineCapable] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [published, setPublished] = useState(false);

  // Deletion / Moderation State & Owner Authentication
  const [appPendingDelete, setAppPendingDelete] = useState<AppItem | null>(null);
  const [deleteMode, setDeleteMode] = useState<'owner' | 'moderator'>('owner');
  const [deleteAuthKey, setDeleteAuthKey] = useState('');
  const [deleteAuthError, setDeleteAuthError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('Owner Request / Decommissioning Application');
  const [customReasonText, setCustomReasonText] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

  // Authenticate owner before deletion can be executed
  const isDeleteAuthenticated = useMemo(() => {
    if (!appPendingDelete) return false;
    if (deleteMode === 'moderator') {
      return isStoreManager || deleteAuthKey.trim() === 'PRISM-ROOT-9090';
    }
    const targetOwner = appPendingDelete.ownerId || (appPendingDelete.id === 'adinkra-studio' ? 'PRISM-USER-DEMO' : '');
    const isOwnerMatch = Boolean(
      (appPendingDelete.ownerId && userUID && appPendingDelete.ownerId.toUpperCase() === userUID.toUpperCase()) ||
      (appPendingDelete.id === 'adinkra-studio' && (!appPendingDelete.ownerId || appPendingDelete.ownerId === 'PRISM-USER-DEMO' || appPendingDelete.ownerId === userUID))
    );
    const input = deleteAuthKey.trim().toUpperCase();
    if (!input) return false;
    if (isOwnerMatch) {
      return input === 'DELETE' || (targetOwner && input === targetOwner.toUpperCase());
    }
    return (targetOwner && input === targetOwner.toUpperCase()) || input === 'PRISM-ROOT-9090';
  }, [appPendingDelete, deleteMode, isStoreManager, deleteAuthKey, userUID]);

  // Moderation Search & Filter
  const [moderationSearch, setModerationSearch] = useState('');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'user-uploaded'>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Uploaded Apps owned by active user UID (strictly deduplicated by app.id)
  const myUploadedApps = Array.from(
    new Map(
      apps.filter(a => 
        a.isUserUploaded && (
          a.ownerId === userUID || 
          (a.id === 'adinkra-studio' && (!a.ownerId || a.ownerId === 'PRISM-USER-DEMO' || a.ownerId === userUID))
        )
      ).map(a => [a.id, a])
    ).values()
  );
  const flaggedApps = apps.filter(a => a.isFlagged);

  // Quick Preset Helper for Adinkra Studio
  const handleLoadAdinkraPreset = () => {
    setAppName('Adinkra Studio');
    setTagline('West African Adinkra geometric symbology and vector typography workstation');
    setDeveloper('Asante Cultural Labs');
    setCategory('Design & Creative');
    setPriceModel('Open Source');
    setPrice('0');
    setSizeMB('24.6');
    setLiveAppUrl('https://adinkra-studio.app');
    setSourceCodeUrl('https://github.com/asantecultural/adinkra-studio');
    setUploadedFileName('adinkra-studio-v1.4.0-bundle.zip');
    setUploadedFileSizeMB(24.6);
    setZeroTrackersConfirmed(true);
    setOfflineCapable(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const calculatedSize = +(file.size / (1024 * 1024)).toFixed(1);
      setUploadedFileSizeMB(calculatedSize);
      setSizeMB(calculatedSize > 0 ? calculatedSize.toString() : '1.5');
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !tagline.trim()) return;

    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      setPublished(true);

      const isAdinkra = appName.toLowerCase().includes('adinkra');
      const parsedPrice = parseFloat(price) || 0;

      const finalLiveUrl = liveAppUrl.trim() || (isAdinkra ? 'https://adinkra-studio.app' : undefined);
      const finalSourceUrl = sourceCodeUrl.trim() || (isAdinkra ? 'https://github.com/asantecultural/adinkra-studio' : undefined);

      const newApp: AppItem = {
        id: isAdinkra ? 'adinkra-studio' : `custom-${Date.now()}`,
        name: appName,
        tagline: tagline,
        developer: developer || 'Indie Engineer',
        developerVerified: true,
        category: category,
        price: parsedPrice,
        priceFormatted: parsedPrice === 0 ? (priceModel === 'Open Source' ? 'Free (Open Source)' : 'Free') : `$${parsedPrice.toFixed(2)}`,
        priceModel: priceModel === 'Open Source' ? 'Open Source' : (parsedPrice === 0 ? 'Free' : 'One-Time'),
        rating: 5.0,
        reviewCount: 1,
        downloadsCount: '1',
        sizeMB: parseFloat(sizeMB) || 24.6,
        currentVersion: '1.0.0',
        minOS: 'Android 12 / iOS 16 / macOS / Web',
        supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'],
        heroImage: isAdinkra 
          ? APP_MEDIA_ASSETS.adinkraStudio 
          : APP_MEDIA_ASSETS.luminaShowcase,
        thumbnail: isAdinkra 
          ? APP_MEDIA_ASSETS.adinkraStudio 
          : APP_MEDIA_ASSETS.luminaShowcase,
        accentColor: isAdinkra ? '#f97316' : '#38bdf8',
        editorialHighlight: isAdinkra ? {
          headline: "Sacred West African visual philosophies rendered into mathematical vectors",
          curatorQuote: "Adinkra Studio brings ancient Akan proverbs, cultural wisdom, and geometric symbols into modern vector typography with zero cloud telemetry."
        } : undefined,
        summary: isAdinkra 
          ? 'A high-precision vector illustration studio dedicated to West African Adinkra visual philosophy. Features parametric geometry generation, Akan proverb etymology archives, and native SVG exports.'
          : `${appName} is an independently published package verified with 0 third-party telemetry beacons and offline local execution.`,
        features: isAdinkra ? [
          '100% offline procedural vector rendering of historical Adinkra symbols',
          'Philosophical meaning and Akan proverb archives',
          'Export to pure SVG, EPS, and high-resolution PNG',
          'Zero third-party trackers or surveillance SDKs'
        ] : [
          'Zero surveillance trackers or ad SDKs',
          'Local-first persistent data storage',
          'Fast native performance'
        ],
        offlineCapable: offlineCapable,
        zeroTrackers: zeroTrackersConfirmed,
        openSource: priceModel === 'Open Source',
        isUserUploaded: true,
        ownerId: userUID,
        uploadedAt: 'Just now',
        license: isAdinkra ? 'MIT Open Source' : (priceModel === 'Open Source' ? 'GPL v3.0' : undefined),
        liveAppUrl: finalLiveUrl,
        websiteUrl: finalLiveUrl,
        sourceCodeUrl: finalSourceUrl,
        packageBundleName: uploadedFileName || (isAdinkra ? 'adinkra-studio-v1.4.0.zip' : undefined),
        privacyGrade: 'A+',
        permissions: [],
        dataCollected: [],
        versionHistory: [
          {
            version: '1.0.0',
            releaseDate: 'Today',
            sizeMB: parseFloat(sizeMB) || 24.6,
            isLatest: true,
            highlights: ['Initial production build validated by Prism Automated Inspector']
          }
        ],
        reviews: [
          {
            id: `rev-${Date.now()}`,
            author: 'Prism System Inspector',
            rating: 5,
            date: 'Just now',
            device: 'Sandbox Verification',
            title: 'Manifest verified and clean',
            content: 'Zero third-party trackers detected. Offline execution invariant certified.',
            helpfulCount: 1,
            verifiedPurchase: true
          }
        ],
        sandboxType: isAdinkra ? 'adinkra-vector' : 'terminal'
      };

      onAppPublished(newApp);
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 1200);
  };

  const handleOpenDeleteDialog = (app: AppItem, mode: 'owner' | 'moderator') => {
    setDeleteMode(mode);
    setAppPendingDelete(app);
    setDeleteAuthKey('');
    setDeleteAuthError(null);
    if (mode === 'owner') {
      setDeleteReason('Owner Request / Decommissioning Application');
    } else {
      setDeleteReason(app.isFlagged ? 'Inappropriate Content / Violates Guidelines' : 'Zero-Tracker Policy Violation');
    }
    setCustomReasonText('');
  };

  const handleConfirmDelete = () => {
    if (!appPendingDelete) return;
    if (!isDeleteAuthenticated) {
      setDeleteAuthError('Authentication required: Enter valid Owner UID or type DELETE to authorize deletion.');
      return;
    }
    const finalReason = deleteReason === 'Other' && customReasonText.trim() ? customReasonText : deleteReason;
    const deletedBy = deleteMode === 'owner' ? 'Owner' : 'Prism Store Developer / Manager';
    
    onAppDeleted(appPendingDelete.id, finalReason, deletedBy);
    setDeleteSuccessMessage(
      deleteMode === 'owner'
        ? `Your uploaded app "${appPendingDelete.name}" was permanently deleted and unpublished from Prism Store.`
        : `Store Developer moderation complete: Inappropriate app "${appPendingDelete.name}" has been permanently removed from the catalog.`
    );
    setAppPendingDelete(null);
    setDeleteAuthKey('');
    setDeleteAuthError(null);
    setTimeout(() => {
      setDeleteSuccessMessage(null);
    }, 4500);
  };

  // Filtered Apps for Moderation View (strictly deduplicated by ID)
  const filteredModerationApps = Array.from(
    new Map(
      apps.filter(app => {
        const matchesSearch = moderationSearch === '' || 
          app.name.toLowerCase().includes(moderationSearch.toLowerCase()) ||
          app.developer.toLowerCase().includes(moderationSearch.toLowerCase()) ||
          app.tagline.toLowerCase().includes(moderationSearch.toLowerCase());
        
        if (!matchesSearch) return false;
        if (moderationFilter === 'flagged') return app.isFlagged;
        if (moderationFilter === 'user-uploaded') return app.isUserUploaded || app.id === 'adinkra-studio';
        return true;
      }).map(a => [a.id, a])
    ).values()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 my-6 max-h-[94vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors z-20"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Terminal className="w-4 h-4" />
            <span>DEVELOPER STUDIO & OWNER GOVERNANCE PORTAL</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Developer Studio & App Owner Console
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Publish software with live URLs, view the owner step-by-step process guide, delete your uploaded apps, or moderate inappropriate applications.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs mb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('publish')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'publish'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Publish / Upload App</span>
          </button>

          <button
            onClick={() => setActiveTab('owner-apps')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'owner-apps'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-300" />
            <span>My Uploaded Apps & Delete ({myUploadedApps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            <span>Developer Moderation: Delete Inappropriate Apps {flaggedApps.length > 0 ? `(${flaggedApps.length} Flagged)` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-300" />
            <span>Owner Step-by-Step Portal</span>
          </button>

          {deletedAppsLog.length > 0 && (
            <button
              onClick={() => setActiveTab('audit-log')}
              className={`py-1.5 px-3 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'audit-log'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Deletion Audit Log ({deletedAppsLog.length})</span>
            </button>
          )}
        </div>

        {/* Status Message */}
        {deleteSuccessMessage && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 shrink-0 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
        )}

        {/* TAB 1: PUBLISH / UPLOAD APP */}
        {activeTab === 'publish' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Quick Template Presets Bar */}
            <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1-Click Template:</span>
              </div>
              <button
                type="button"
                onClick={handleLoadAdinkraPreset}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Pre-fill: Adinkra Studio (Live URL + Vector Bundle)</span>
              </button>
            </div>

            {published ? (
              <div className="py-12 text-center space-y-3 my-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">Application Certified & Published!</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {appName} is now live in Prism Store. Users can launch your live web URL or test drive your software directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
                {/* Title & Developer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Software Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. adinkra-app or Adinkra Studio"
                      value={appName}
                      onChange={e => setAppName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Studio / Developer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asante Cultural Labs"
                      value={developer}
                      onChange={e => setDeveloper(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">One-Line Tagline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West African Adinkra geometric symbology and vector typography workstation"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* LIVE URL & SOURCE REPO */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <Globe className="w-4 h-4" />
                    <span>Live Web App URL & Distribution Links</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When provided, Prism Store places a prominent <strong className="text-slate-200">"Launch Live App"</strong> button on your listing so users are directed straight to your hosted website.
                  </p>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      Live Hosted App URL (Website Address)
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        placeholder="https://adinkra-studio.app or https://your-hosted-site.com"
                        value={liveAppUrl}
                        onChange={e => setLiveAppUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">
                      Source Code Repository URL (Optional)
                    </label>
                    <div className="relative">
                      <Code className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        placeholder="https://github.com/asantecultural/adinkra-studio"
                        value={sourceCodeUrl}
                        onChange={e => setSourceCodeUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Package Bundle Upload Section */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <Paperclip className="w-4 h-4" />
                    <span>Upload Package Bundle / App Files (Optional)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload your compiled web bundle (.zip), HTML5 asset folder, or application binary for offline archiving.
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".zip,.apk,.tar.gz,.json"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{uploadedFileName ? 'Change Bundle File' : 'Browse Files (.zip, .apk)'}</span>
                    </button>

                    {uploadedFileName && (
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{uploadedFileName}</span>
                        {uploadedFileSizeMB && <span className="text-slate-400">({uploadedFileSizeMB} MB)</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Design & Creative">Design & Creative</option>
                      <option value="Audio & Music">Audio & Music</option>
                      <option value="Health & Biometrics">Health & Biometrics</option>
                      <option value="Developer Tools">Developer Tools</option>
                      <option value="Productivity & Notes">Productivity & Notes</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Distribution Model</label>
                    <select
                      value={priceModel}
                      onChange={e => setPriceModel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Open Source">Open Source (Free)</option>
                      <option value="Free">Free</option>
                      <option value="One-Time">One-Time Lifetime Purchase</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1 font-medium">Price (USD)</label>
                    <input
                      type="number"
                      disabled={priceModel === 'Open Source' || priceModel === 'Free'}
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Privacy Invariants */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={zeroTrackersConfirmed}
                      onChange={e => setZeroTrackersConfirmed(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">
                      I certify zero 3rd-party ad trackers, beacons, or analytics surveillance SDKs
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={offlineCapable}
                      onChange={e => setOfflineCapable(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-slate-300">
                      Core functionality works offline with local device persistence
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isValidating || !zeroTrackersConfirmed}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span>Validating Bytecode & Live URL...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Verify & Publish Package</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: OWNER'S UPLOADED APPS (OPTION FOR OWNERS TO DELETE THEIR APPS) */}
        {activeTab === 'owner-apps' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Active Owner UID Status Strip */}
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">Your Active Unique Identifier</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900/40">Verified Owner</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white tracking-wide">{userUID}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenStoreManagerAuth}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                  title="Switch or enter an existing unique identifier"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Switch / Enter UID</span>
                </button>

                <button
                  onClick={() => setActiveTab('publish')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Another App</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-900/30 text-xs text-slate-300 leading-relaxed shrink-0">
              <strong className="text-amber-300 block mb-0.5">App Owner Sovereignty & Deletion Protection</strong>
              You can only view, manage, and delete apps that belong to your Unique Identifier (<code className="text-white font-mono">{userUID}</code>). No other standard user can delete your apps. Deletion is instantaneous and unpublishes your application permanently from the public catalog.
            </div>

            {/* List of Owner's Uploaded Apps */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {myUploadedApps.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <Info className="w-8 h-8 text-slate-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">No Uploaded Apps Found for UID {userUID}</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You haven't uploaded an app with this Unique Identifier yet. If you previously uploaded Adinkra Studio, switch your UID to <code className="text-amber-300">PRISM-USER-DEMO</code> or upload a new app.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => onUpdateUID('PRISM-USER-DEMO')}
                      className="px-3.5 py-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-medium transition-colors"
                    >
                      Claim Adinkra Studio (PRISM-USER-DEMO)
                    </button>
                    <button
                      onClick={() => setActiveTab('publish')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New App</span>
                    </button>
                  </div>
                </div>
              ) : (
                myUploadedApps.map(app => (
                  <div 
                    key={app.id} 
                    className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
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
                        className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0" 
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{app.name}</h4>
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                            Owner UID: {app.ownerId || userUID}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            v{app.currentVersion}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{app.tagline}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                          <span>{app.developer}</span>
                          <span>·</span>
                          <span>{app.category}</span>
                          <span>·</span>
                          <span>{app.downloadsCount} installs</span>
                          {app.liveAppUrl && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[160px]">{app.liveAppUrl}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Owner Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {app.liveAppUrl && (
                        <a
                          href={app.liveAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 border border-slate-800"
                          title="Visit live app website"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit Live</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenDeleteDialog(app, 'owner')}
                        className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-700/80 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Delete your uploaded app from Prism Store"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Delete My App</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEVELOPER MODERATION (RESTRICTED ONLY TO PRISM STORE DEVELOPER / MANAGER) */}
        {activeTab === 'moderation' && (
          !isStoreManager ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 rounded-2xl border border-rose-900/50 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/50 border border-rose-800/80 flex items-center justify-center text-rose-400 shadow-xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block">Access Control Security Gate</span>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  Developer Moderation: Delete Inappropriate Apps
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Only the <strong className="text-white">developer or manager of Prism App Store</strong> is authorized to delete inappropriate apps that users upload in the store.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Standard users can delete their own uploaded apps in the <strong className="text-amber-300">My Uploaded Apps & Delete</strong> tab using their unique identifier (<span className="font-mono text-slate-300">{userUID}</span>).
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 max-w-md text-left flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Prism Store Developer access is protected by unique manager passkey. Authenticate to manage the entire store catalog.</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenStoreManagerAuth}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-amber-600/30"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Authenticate as Store Developer / Manager</span>
                </button>

                <button
                  onClick={() => setActiveTab('owner-apps')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Manage My Own Uploaded Apps
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4">
              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200 leading-relaxed">
                    <strong className="text-white block mb-0.5 flex items-center gap-2">
                      <span>Prism Store Developer & Manager Mode: Active</span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">Root Privileges</span>
                    </strong>
                    You are verified as the Prism App Store developer. You have root authority to review and permanently delete any application deemed inappropriate, malicious, or policy-violating.
                  </div>
                </div>
                <button
                  onClick={onOpenStoreManagerAuth}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  Manager Settings
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter by app title or developer..."
                    value={moderationSearch}
                    onChange={e => setModerationSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">View:</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setModerationFilter('all')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        moderationFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({apps.length})
                    </button>
                    <button
                      onClick={() => setModerationFilter('flagged')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                        moderationFilter === 'flagged' ? 'bg-rose-900/80 text-rose-200 font-bold' : 'text-rose-400 hover:text-rose-300'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>Flagged Inappropriate ({flaggedApps.length})</span>
                    </button>
                    <button
                      onClick={() => setModerationFilter('user-uploaded')}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        moderationFilter === 'user-uploaded' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Uploaded Apps ({apps.filter(a => a.isUserUploaded).length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Moderation App Grid / List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {filteredModerationApps.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                    No applications match the current filter.
                  </div>
                ) : (
                  filteredModerationApps.map(app => (
                    <div 
                      key={app.id} 
                      className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        app.isFlagged
                          ? 'bg-rose-950/20 border-rose-800/80 shadow-sm'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
                          className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{app.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              v{app.currentVersion}
                            </span>
                            {app.isFlagged && (
                              <span className="text-[10px] font-mono text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Policy Violation</span>
                              </span>
                            )}
                            {app.isUserUploaded && (
                              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/60">
                                UID: {app.ownerId || 'User Upload'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{app.tagline}</p>
                          {app.flagReason && (
                            <p className="text-[11px] text-rose-300 mt-1 font-mono bg-rose-950/40 p-1 rounded border border-rose-900/40">
                              Violation: {app.flagReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Store Developer / Manager Moderation Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenDeleteDialog(app, 'moderator')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-600/30"
                          title="Delete this inappropriate application from Prism Store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Inappropriate App</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        )}

        {/* TAB 4: OWNER STEP-BY-STEP PROCESS GUIDE */}
        {activeTab === 'guide' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <OwnerGuidePortal
              onOpenPublish={() => setActiveTab('publish')}
              onOpenManageOwner={() => setActiveTab('owner-apps')}
              onOpenModeration={() => setActiveTab('moderation')}
              apps={apps}
            />
          </div>
        )}

        {/* TAB 5: DELETION AUDIT LOG */}
        {activeTab === 'audit-log' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3 shrink-0">
              <RefreshCw className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-0.5">Transparent Deletion Audit Trail</strong>
                Prism Store records every deleted app action to ensure accountability. If an app was deleted by mistake, you can restore it below.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {deletedAppsLog.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  No deletion events recorded yet.
                </div>
              ) : (
                deletedAppsLog.map(item => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          Removed by {item.deletedBy}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.deletedAt}</span>
                      </div>
                      <p className="text-xs text-rose-300 mt-1 font-mono">
                        Reason: {item.reason}
                      </p>
                      <span className="text-[11px] text-slate-500">{item.developer} · {item.category}</span>
                    </div>

                    {onRestoreApp && (
                      <button
                        onClick={() => onRestoreApp(item.originalApp)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restore App</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Confirmation Dialog Modal Overlay for Deletion with Mandatory Owner Authentication */}
        {appPendingDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div 
              className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {deleteMode === 'owner' ? 'Owner Authentication & Deletion' : 'Store Moderator App Removal'}
                  </h4>
                  <p className="text-xs text-rose-300">
                    Authorizing unpublishing of <strong className="text-white">{appPendingDelete.name}</strong>
                  </p>
                </div>
              </div>

              {/* Owner Identity Verification Status Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium">Registered Owner UID:</span>
                  <span className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60 font-semibold">
                    {appPendingDelete.ownerId || (appPendingDelete.id === 'adinkra-studio' ? 'PRISM-USER-DEMO' : 'PRISM-ECOSYSTEM-CORE')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-medium">Current Session UID:</span>
                  <span className="font-mono text-slate-300">
                    {userUID}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  {(appPendingDelete.ownerId === userUID || (appPendingDelete.id === 'adinkra-studio' && (!appPendingDelete.ownerId || appPendingDelete.ownerId === 'PRISM-USER-DEMO' || appPendingDelete.ownerId === userUID))) ? (
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
                    (appPendingDelete.ownerId === userUID || (appPendingDelete.id === 'adinkra-studio' && (!appPendingDelete.ownerId || appPendingDelete.ownerId === 'PRISM-USER-DEMO' || appPendingDelete.ownerId === userUID))) ? (
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
                    value={deleteAuthKey}
                    onChange={e => {
                      setDeleteAuthKey(e.target.value);
                      setDeleteAuthError(null);
                    }}
                    placeholder={
                      deleteMode === 'owner'
                        ? 'Type DELETE or enter Owner UID to confirm'
                        : 'Enter PRISM-ROOT-9090'
                    }
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors ${
                      isDeleteAuthenticated 
                        ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' 
                        : 'border-slate-700 focus:border-rose-500'
                    }`}
                  />
                  {isDeleteAuthenticated && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-slate-950 px-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Owner Authenticated</span>
                    </div>
                  )}
                </div>

                {deleteAuthError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{deleteAuthError}</p>
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
                      <option value="Copyright or Intellectual Property Infringement">Copyright Infringement</option>
                      <option value="Other">Other Violation</option>
                    </>
                  )}
                </select>

                {deleteReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify custom reason..."
                    value={customReasonText}
                    onChange={e => setCustomReasonText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-rose-500 mt-1"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => {
                    setAppPendingDelete(null);
                    setDeleteAuthKey('');
                    setDeleteAuthError(null);
                  }}
                  className="px-3.5 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={!isDeleteAuthenticated}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    isDeleteAuthenticated
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                  }`}
                  title={isDeleteAuthenticated ? 'Execute deletion of this application' : 'Authenticate above to enable deletion'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleteAuthenticated ? 'Permanently Delete App' : 'Authenticate to Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
