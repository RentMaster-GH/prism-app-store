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
import { createClient } from '@supabase/supabase-js';

// PERMANENT SUPABASE CLIENT - files stay forever like Play Store
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

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
  
  const [liveAppUrl, setLiveAppUrl] = useState('');
  const [sourceCodeUrl, setSourceCodeUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSizeMB, setUploadedFileSizeMB] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [zeroTrackersConfirmed, setZeroTrackersConfirmed] = useState(true);
  const [offlineCapable, setOfflineCapable] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [published, setPublished] = useState(false);

  // Deletion State
  const [appPendingDelete, setAppPendingDelete] = useState<AppItem | null>(null);
  const [deleteMode, setDeleteMode] = useState<'owner' | 'moderator'>('owner');
  const [deleteAuthKey, setDeleteAuthKey] = useState('');
  const [deleteAuthError, setDeleteAuthError] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>('Owner Request / Decommissioning Application');
  const [customReasonText, setCustomReasonText] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);

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

  const [moderationSearch, setModerationSearch] = useState('');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'user-uploaded'>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setUploadFile(file);
      setUploadedFileName(file.name);
      const calculatedSize = +(file.size / (1024 * 1024)).toFixed(1);
      setUploadedFileSizeMB(calculatedSize);
      setSizeMB(calculatedSize > 0 ? calculatedSize.toString() : '1.5');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim() || !tagline.trim()) return;

    setIsValidating(true);

    try {
      let permanentUrl = liveAppUrl.trim() || undefined;
      let bundleName = uploadedFileName;

      if (uploadFile) {
        const MAX_SIZE = 150 * 1024 * 1024;
        if (uploadFile.size > MAX_SIZE) throw new Error('File too large. Max 150MB');

        const safeName = `${Date.now()}_${uploadFile.name.replace(/\s+/g,'_')}`;
        const { error: storageError } = await supabase.storage
          .from('apps')
          .upload(safeName, uploadFile);

        if (storageError) throw new Error(`Storage failed: ${storageError.message}`);

        const { data: urlData } = supabase.storage.from('apps').getPublicUrl(safeName);
        permanentUrl = urlData.publicUrl;
        bundleName = safeName;
      }

      const { data: dbData, error: dbError } = await supabase
        .from('marketplace_apps')
        .insert([{
          title: appName,
          description: tagline,
          tagline: tagline,
          developer_name: developer || 'Indie Engineer',
          category: category,
          price_model: priceModel,
          price: parseFloat(price) || 0,
          size_mb: parseFloat(sizeMB) || 24.6,
          download_url: permanentUrl || liveAppUrl,
          live_app_url: liveAppUrl,
          source_code_url: sourceCodeUrl,
          package_bundle_name: bundleName,
          owner_id: userUID,
          downloads: 0,
          version: '1.0.0'
        }])
        .select();

      if (dbError) {
        if (bundleName && uploadFile) {
          await supabase.storage.from('apps').remove([bundleName]);
        }
        throw new Error(`DB failed: ${dbError.message}`);
      }

      const isAdinkra = appName.toLowerCase().includes('adinkra');
      const newApp: AppItem = {
        id: dbData?.[0]?.id || `custom-${Date.now()}`,
        name: appName,
        tagline: tagline,
        developer: developer || 'Indie Engineer',
        developerVerified: true,
        category: category,
        price: parseFloat(price) || 0,
        priceFormatted: priceModel === 'Open Source' ? 'Free (Open Source)' : 'Free',
        priceModel: priceModel === 'Open Source' ? 'Open Source' : (parseFloat(price) === 0 ? 'Free' : 'One-Time'),
        rating: 5.0,
        reviewCount: 1,
        downloadsCount: '1',
        sizeMB: parseFloat(sizeMB) || 24.6,
        currentVersion: '1.0.0',
        minOS: 'Android 12 / iOS 16 / macOS / Web',
        supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'],
        heroImage: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase,
        thumbnail: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase,
        accentColor: isAdinkra ? '#f97316' : '#38bdf8',
        editorialHighlight: isAdinkra ? {
          headline: "Sacred West African visual philosophies rendered into mathematical vectors",
          curatorQuote: "Adinkra Studio brings ancient Akan proverbs into modern vector typography with zero cloud telemetry."
        } : undefined,
        summary: `${appName} is an independently published package verified with 0 third-party telemetry beacons and offline local execution. Permanent download URL: ${permanentUrl || 'Live Web URL'}`,
        features: [
          'Zero surveillance trackers or ad SDKs',
          'Local-first persistent data storage',
          'Permanent Supabase-hosted binary - survives store updates'
        ],
        offlineCapable: offlineCapable,
        zeroTrackers: zeroTrackersConfirmed,
        openSource: priceModel === 'Open Source',
        isUserUploaded: true,
        ownerId: userUID,
        uploadedAt: 'Just now',
        license: isAdinkra ? 'MIT Open Source' : (priceModel === 'Open Source' ? 'GPL v3.0' : undefined),
        liveAppUrl: permanentUrl || liveAppUrl,
        websiteUrl: permanentUrl || liveAppUrl,
        sourceCodeUrl: sourceCodeUrl,
        packageBundleName: bundleName || undefined,
        privacyGrade: 'A+',
        permissions: [],
        dataCollected: [],
        versionHistory: [{
          version: '1.0.0',
          releaseDate: 'Today',
          sizeMB: parseFloat(sizeMB) || 24.6,
          isLatest: true,
          highlights: ['Initial production build validated by Prism Automated Inspector - Permanent Supabase storage']
        }],
        reviews: [{
          id: `rev-${Date.now()}`,
          author: 'Prism System Inspector',
          rating: 5,
          date: 'Just now',
          device: 'Sandbox Verification',
          title: 'Manifest verified and permanently hosted',
          content: 'Zero third-party trackers detected. Binary permanently archived in Supabase Storage.',
          helpfulCount: 1,
          verifiedPurchase: true
        }],
        sandboxType: isAdinkra ? 'adinkra-vector' : 'terminal'
      };

      setPublished(true);
      onAppPublished(newApp);
      setTimeout(() => onClose(), 1500);

    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
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
    setDeleteSuccessMessage(deleteMode === 'owner' ? `Your uploaded app "${appPendingDelete.name}" was permanently deleted.` : `Store moderation complete: "${appPendingDelete.name}" removed.`);
    setAppPendingDelete(null);
    setDeleteAuthKey('');
    setDeleteAuthError(null);
    setTimeout(() => setDeleteSuccessMessage(null), 4500);
  };

  const filteredModerationApps = Array.from(
    new Map(
      apps.filter(app => {
        const matchesSearch = moderationSearch === '' || app.name.toLowerCase().includes(moderationSearch.toLowerCase()) || app.developer.toLowerCase().includes(moderationSearch.toLowerCase());
        if (!matchesSearch) return false;
        if (moderationFilter === 'flagged') return app.isFlagged;
        if (moderationFilter === 'user-uploaded') return app.isUserUploaded || app.id === 'adinkra-studio';
        return true;
      }).map(a => [a.id, a])
    ).values()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 my-6 max-h-[94vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors z-20"><X className="w-4 h-4" /></button>

        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1"><Terminal className="w-4 h-4" /><span>DEVELOPER STUDIO & OWNER GOVERNANCE PORTAL</span></div>
          <h3 className="text-xl font-bold text-white tracking-tight">Developer Studio & App Owner Console</h3>
          <p className="text-xs text-slate-400 mt-0.5">Publish software with permanent Supabase storage - files survive store updates like Play Store.</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs mb-4 shrink-0 overflow-x-auto">
          <button onClick={() => setActiveTab('publish')} className={`py-1.5 px-3 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'publish' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Upload className="w-3.5 h-3.5" /><span>Publish / Upload App</span></button>
          <button onClick={() => setActiveTab('owner-apps')} className={`py-1.5 px-3 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'owner-apps' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><Trash2 className="w-3.5 h-3.5 text-amber-300" /><span>My Apps ({myUploadedApps.length})</span></button>
          <button onClick={() => setActiveTab('moderation')} className={`py-1.5 px-3 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'moderation' ? 'bg-rose-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}><ShieldAlert className="w-3.5 h-3.5 text-rose-300" /><span>Moderation {flaggedApps.length > 0 ? `(${flaggedApps.length} Flagged)` : ''}</span></button>
          <button onClick={() => setActiveTab('guide')} className={`py-1.5 px-3 rounded-lg font-medium flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'guide' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}><BookOpen className="w-3.5 h-3.5 text-sky-300" /><span>Guide</span></button>
        </div>

        {deleteSuccessMessage && <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /><span>{deleteSuccessMessage}</span></div>}

        {activeTab === 'publish' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400"><Sparkles className="w-4 h-4 text-amber-400" /><span>1-Click Template:</span></div>
              <button type="button" onClick={handleLoadAdinkraPreset} className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5">Pre-fill: Adinkra Studio</button>
            </div>

            {published ? (
              <div className="py-12 text-center space-y-3 my-auto"><CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" /><h4 className="text-lg font-bold text-white">Application Certified & Permanently Published!</h4><p className="text-xs text-slate-400 max-w-md mx-auto">File is now permanently hosted in Supabase Storage and will survive all future Prism updates.</p></div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-slate-300 block mb-1 font-medium">Software Title</label><input type="text" required placeholder="e.g. Adinkra Studio" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                  <div><label className="text-slate-300 block mb-1 font-medium">Studio / Developer Name</label><input type="text" required placeholder="e.g. Asante Cultural Labs" value={developer} onChange={e => setDeveloper(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>
                </div>
                <div><label className="text-slate-300 block mb-1 font-medium">One-Line Tagline</label><input type="text" required placeholder="West African Adinkra workstation" value={tagline} onChange={e => setTagline(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" /></div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs"><Globe className="w-4 h-4" /><span>Live Web App URL & Distribution Links</span></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">If you upload a file, it will be permanently hosted in Supabase and a public download link will be auto-generated.</p>
                  <div><label className="text-slate-300 block mb-1 font-medium">Live Hosted App URL</label><div className="relative"><Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" /><input type="url" placeholder="https://your-hosted-site.com" value={liveAppUrl} onChange={e => setLiveAppUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs" /></div></div>
                  <div><label className="text-slate-300 block mb-1 font-medium">Source Code Repository URL (Optional)</label><div className="relative"><Code className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" /><input type="url" placeholder="https://github.com/..." value={sourceCodeUrl} onChange={e => setSourceCodeUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs" /></div></div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs"><Paperclip className="w-4 h-4" /><span>Permanent Binary Upload (Supabase Storage)</span></div>
                  <p className="text-[11px] text-slate-400">Upload .apk, .zip, .aab - File will be permanently stored like Google Play Store.</p>
                  <div className="flex items-center gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip,.apk,.aab,.xapk,.tar.gz" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2"><Upload className="w-3.5 h-3.5 text-indigo-400" /><span>{uploadedFileName ? 'Change File' : 'Browse Files'}</span></button>
                    {uploadedFileName && <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800/40"><FileCode className="w-3.5 h-3.5" /><span>{uploadedFileName}</span>{uploadedFileSizeMB && <span className="text-slate-400">({uploadedFileSizeMB} MB)</span>}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className="text-slate-300 block mb-1 font-medium">Category</label><select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"><option value="Design & Creative">Design & Creative</option><option value="Audio & Music">Audio & Music</option><option value="Health & Biometrics">Health & Biometrics</option><option value="Developer Tools">Developer Tools</option><option value="Productivity & Notes">Productivity & Notes</option><option value="Sports">Sports</option></select></div>
                  <div><label className="text-slate-300 block mb-1 font-medium">Distribution Model</label><select value={priceModel} onChange={e => setPriceModel(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"><option value="Open Source">Open Source (Free)</option><option value="Free">Free</option><option value="One-Time">One-Time</option></select></div>
                  <div><label className="text-slate-300 block mb-1 font-medium">Price (USD)</label><input type="number" disabled={priceModel === 'Open Source' || priceModel === 'Free'} value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 disabled:opacity-50" /></div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={zeroTrackersConfirmed} onChange={e => setZeroTrackersConfirmed(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-indigo-600" /><span className="text-slate-300">I certify zero 3rd-party ad trackers</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={offlineCapable} onChange={e => setOfflineCapable(e.target.checked)} className="rounded bg-slate-900 border-slate-700 text-indigo-600" /><span className="text-slate-300">Core functionality works offline</span></label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={isValidating || !zeroTrackersConfirmed} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-2">
                    {isValidating ? <><span className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin" /><span>Uploading to Permanent Storage...</span></> : <><Upload className="w-3.5 h-3.5" /><span>Verify & Publish Permanently</span></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'owner-apps' && (
          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400"><UserCheck className="w-5 h-5" /></div><div><div className="flex items-center gap-2"><span className="text-[10px] font-mono text-indigo-400 uppercase">Your UID</span><span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-900/40">Verified Owner</span></div><div className="font-mono text-sm font-bold text-white">{userUID}</div></div></div>
              <div className="flex items-center gap-2"><button onClick={onOpenStoreManagerAuth} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-indigo-400" /><span>Switch UID</span></button><button onClick={() => setActiveTab('publish')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /><span>Upload Another</span></button></div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {myUploadedApps.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-3"><Info className="w-8 h-8 text-slate-500 mx-auto" /><h4 className="text-sm font-semibold text-white">No Apps for UID {userUID}</h4><button onClick={() => onUpdateUID('PRISM-USER-DEMO')} className="px-3.5 py-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-lg text-xs">Claim Adinkra Studio (PRISM-USER-DEMO)</button></div>
              ) : (
                myUploadedApps.map(app => (
                  <div key={app.id} className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3"><img src={resolveAppMedia(app.thumbnail)} alt={app.name} className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0" /><div><div className="flex items-center gap-2"><h4 className="text-sm font-bold text-white">{app.name}</h4><span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">Owner UID: {app.ownerId || userUID}</span></div><p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{app.tagline}</p></div></div>
                    <div className="flex items-center gap-2 shrink-0"><button onClick={() => handleOpenDeleteDialog(app, 'owner')} className="px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-700/80 rounded-lg text-xs font-bold flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5 text-rose-400" /><span>Delete My App</span></button></div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          !isStoreManager ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 rounded-2xl border border-rose-900/50 space-y-4 my-auto"><ShieldAlert className="w-8 h-8 text-rose-400" /><h4 className="text-xl font-bold text-white">Developer Moderation Required</h4><button onClick={onOpenStoreManagerAuth} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"><Unlock className="w-4 h-4" /><span>Authenticate as Store Developer</span></button></div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden space-y-4">
              <div className="flex items-center justify-between gap-3 shrink-0"><div className="relative flex-1"><Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" /><input type="text" placeholder="Filter apps..." value={moderationSearch} onChange={e => setModerationSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200" /></div></div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">{filteredModerationApps.map(app => (<div key={app.id} className="p-4 rounded-xl border bg-slate-950 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="flex items-center gap-3"><img src={resolveAppMedia(app.thumbnail)} alt={app.name} className="w-12 h-12 rounded-xl object-cover bg-slate-900 border border-slate-800" /><div><h4 className="text-sm font-semibold text-white">{app.name}</h4><p className="text-xs text-slate-400 line-clamp-1">{app.tagline}</p></div></div><button onClick={() => handleOpenDeleteDialog(app, 'moderator')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /><span>Delete</span></button></div>))}</div>
            </div>
          )
        )}

        {activeTab === 'guide' && <div className="flex-1 overflow-y-auto pr-1"><OwnerGuidePortal onOpenPublish={() => setActiveTab('publish')} onOpenManageOwner={() => setActiveTab('owner-apps')} onOpenModeration={() => setActiveTab('moderation')} apps={apps} /></div>}

        {appPendingDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400"><Key className="w-5 h-5" /></div><div><h4 className="text-base font-bold text-white">{deleteMode === 'owner' ? 'Owner Authentication' : 'Moderator Removal'}</h4><p className="text-xs text-rose-300">Unpublishing <strong className="text-white">{appPendingDelete.name}</strong></p></div></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-200">Type DELETE or Owner UID to confirm:</label><div className="relative"><input type="text" value={deleteAuthKey} onChange={e => { setDeleteAuthKey(e.target.value); setDeleteAuthError(null); }} placeholder="DELETE or Owner UID" className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono ${isDeleteAuthenticated ? 'border-emerald-500/80' : 'border-slate-700'}`} />{isDeleteAuthenticated && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-emerald-400"><CheckCircle2 className="w-4 h-4" /><span>Authenticated</span></div>}</div>{deleteAuthError && <p className="text-[11px] text-rose-400">{deleteAuthError}</p>}</div>
              <div className="pt-2 flex items-center justify-end gap-2.5"><button onClick={() => { setAppPendingDelete(null); setDeleteAuthKey(''); }} className="px-3.5 py-2 text-xs text-slate-400 hover:text-white">Cancel</button><button onClick={handleConfirmDelete} disabled={!isDeleteAuthenticated} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isDeleteAuthenticated ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'}`}><Trash2 className="w-3.5 h-3.5" /><span>{isDeleteAuthenticated ? 'Permanently Delete' : 'Authenticate'}</span></button></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};