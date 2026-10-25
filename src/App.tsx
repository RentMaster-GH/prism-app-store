import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Star, Download, Play, Smartphone, Monitor, ArrowRight, Terminal, BookOpen, Trash2, Upload, Command } from 'lucide-react';
import { APPS_DATA } from './data/appsData';
import { AppItem, CategoryType, DevicePlatform, InstalledAppState, DeletedAppAuditItem } from './types';
import { TopBar } from './components/TopBar';
import { AppCard } from './components/AppCard';
import { AppDetailModal } from './components/AppDetailModal';
import { AppCompareView } from './components/AppCompareView';
import { LibraryView } from './components/LibraryView';
import { DevSubmitModal } from './components/DevSubmitModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { DirectInstallBanner } from './components/DirectInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UpdateNotificationToast } from './components/UpdateNotificationToast';
import { ManagerAuthModal } from './components/ManagerAuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { EdgeSyncManagerModal } from './components/EdgeSyncManagerModal';
import { AdaptiveDeviceWrapper } from './components/AdaptiveDeviceWrapper';
import { SafeAreaProvider } from './context/SafeAreaContext';
import { usePWAInstall } from './hooks/usePWAInstall';
import { resolveAppMedia, getAppCategoryPlaceholder, APP_MEDIA_ASSETS } from './utils/media';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseSearch } from './hooks/useSupabaseSearch';
import { BecauseYouInstalled } from './components/BecauseYouInstalled';
import { CommandPalette } from './components/CommandPalette';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const PAGE_SIZE = 12;

function AppStoreContent() {
  const [apps, setApps] = useState<AppItem[]>(() => {
    try {
      const savedUserAppsRaw = localStorage.getItem('prism_user_uploaded_apps');
      const savedUserApps: AppItem[] = savedUserAppsRaw ? JSON.parse(savedUserAppsRaw) : [];
      const savedRegistryRaw = localStorage.getItem('prism_apps_registry');
      const savedRegistry: AppItem[] = savedRegistryRaw ? JSON.parse(savedRegistryRaw) : [];
      const legacyUserApps = savedRegistry.filter(a => a.isUserUploaded);
      const userAppsMap = new Map<string, AppItem>();
      [...legacyUserApps, ...savedUserApps].forEach(app => {
        userAppsMap.set(app.id, { ...app, heroImage: app.heroImage ? resolveAppMedia(app.heroImage) : app.heroImage, thumbnail: resolveAppMedia(app.thumbnail) });
      });
      const deletedLogRaw = localStorage.getItem('prism_deleted_apps_log');
      const deletedIds = new Set<string>();
      if (deletedLogRaw) { try { const parsedLog = JSON.parse(deletedLogRaw); parsedLog.forEach((d: any) => { if (d.originalApp?.id) deletedIds.add(d.originalApp.id); if (d.appId) deletedIds.add(d.appId); }); } catch {} }
      const officialApps = APPS_DATA.filter(a => !deletedIds.has(a.id));
      const activeUserApps = Array.from(userAppsMap.values()).filter(a => !deletedIds.has(a.id));
      const seenAppIds = new Set<string>(); const combined: AppItem[] = [];
      for (const app of activeUserApps) { if (!seenAppIds.has(app.id)) { seenAppIds.add(app.id); combined.push(app); } }
      for (const app of officialApps) { if (!seenAppIds.has(app.id)) { seenAppIds.add(app.id); combined.push({ ...app, heroImage: app.heroImage ? resolveAppMedia(app.heroImage) : app.heroImage, thumbnail: resolveAppMedia(app.thumbnail) }); } }
      try { const cleanUserApps = combined.filter(a => a.isUserUploaded); localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(cleanUserApps)); localStorage.setItem('prism_apps_registry', JSON.stringify(combined)); } catch {}
      return combined;
    } catch { return APPS_DATA; }
  });

  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    const loadPermanentApps = async () => {
      setIsSupabaseSyncing(true);
      try {
        const { data } = await supabase.from('marketplace_apps').select('*').order('created_at', { ascending: false });
        if (!data || data.length === 0) return;
        const deletedLogRaw = localStorage.getItem('prism_deleted_apps_log');
        const deletedIds = new Set<string>();
        if (deletedLogRaw) { try { const parsed = JSON.parse(deletedLogRaw); parsed.forEach((d: any) => { if (d.originalApp?.id) deletedIds.add(d.originalApp.id); if (d.appId) deletedIds.add(d.appId); }); } catch {} }
        const permanentApps: AppItem[] = data.filter((row: any) => !deletedIds.has(row.id)).map((row: any) => {
          const isAdinkra = (row.title || '').toLowerCase().includes('adinkra');
          return { id: row.id, name: row.title, tagline: row.tagline || row.description || 'User published application', developer: row.developer_name || 'Indie Engineer', developerVerified: true, category: row.category || 'Developer Tools', price: row.price || 0, priceFormatted: row.price_model === 'Open Source' ? 'Free (Open Source)' : 'Free', priceModel: (row.price_model as any) || 'Free', rating: 5.0, reviewCount: 1, downloadsCount: String(row.downloads || 1), sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0', minOS: 'Android 12 / iOS 16 / macOS / Web', supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'], heroImage: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase, thumbnail: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase, accentColor: isAdinkra ? '#f97316' : '#38bdf8', summary: row.description || row.tagline || `${row.title} - permanently hosted`, features: ['Zero trackers', 'Permanent hosting', 'Offline capable'], offlineCapable: true, zeroTrackers: true, openSource: row.price_model === 'Open Source', isUserUploaded: true, ownerId: row.owner_id, uploadedAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Just now', liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url, sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [], versionHistory: [{ version: row.version || '1.0.0', releaseDate: 'Today', sizeMB: row.size_mb || 15, isLatest: true, highlights: ['Permanently hosted'] }], reviews: [], sandboxType: isAdinkra ? 'adinkra-vector' : 'terminal' } as AppItem;
        });
        setApps(prev => { const map = new Map<string, AppItem>(); permanentApps.forEach(a => map.set(a.id, a)); prev.forEach(a => { if (!map.has(a.id)) map.set(a.id, a); }); const merged = Array.from(map.values()); try { localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(merged.filter(a => a.isUserUploaded))); localStorage.setItem('prism_apps_registry', JSON.stringify(merged)); } catch {} return merged; });
      } finally { setIsSupabaseSyncing(false); }
    };
    loadPermanentApps();
    const channel = supabase.channel('marketplace_apps_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_apps' }, () => { loadPermanentApps(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const [userUID, setUserUID] = useState<string>(() => { try { const saved = localStorage.getItem('prism_user_uid'); if (saved) return saved; } catch {} const newUID = `PRISM-UID-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`; try { localStorage.setItem('prism_user_uid', newUID); } catch {} return newUID; });
  const [isStoreManager, setIsStoreManager] = useState<boolean>(() => { try { return localStorage.getItem('prism_is_store_manager') === 'true'; } catch {} return false; });
  const [isManagerAuthModalOpen, setIsManagerAuthModalOpen] = useState(false);
  const handleUpdateUID = (newUID: string) => { setUserUID(newUID); try { localStorage.setItem('prism_user_uid', newUID); } catch {} };
  const handleSetStoreManager = (status: boolean) => { setIsStoreManager(status); try { localStorage.setItem('prism_is_store_manager', status ? 'true' : 'false'); } catch {} };
  const [currentTab, setCurrentTab] = useState<'discover' | 'apps' | 'compare' | 'library'>(() => { try { const saved = localStorage.getItem('prism_current_tab'); if (saved && ['discover', 'apps', 'compare', 'library'].includes(saved)) return saved as any; } catch {} return 'discover'; });
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'test-drive'>('overview');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devModalInitialTab, setDevModalInitialTab] = useState<'publish' | 'owner-apps' | 'moderation' | 'guide' | 'audit-log'>('publish');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSyncHubOpen, setIsSyncHubOpen] = useState(false);
  // NEW: Command Palette state
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleForcePurgeCache = async () => {
    if (typeof window !== 'undefined' && 'caches' in window) { try { const cacheNames = await caches.keys(); await Promise.all(cacheNames.map(name => caches.delete(name))); } catch {} }
    try { const savedUserAppsRaw = localStorage.getItem('prism_user_uploaded_apps'); const savedUserApps: AppItem[] = savedUserAppsRaw ? JSON.parse(savedUserAppsRaw) : []; const userIds = new Set(savedUserApps.map(a => a.id)); const freshApps = [...savedUserApps, ...APPS_DATA.filter(a => !userIds.has(a.id))]; setApps(freshApps); localStorage.setItem('prism_apps_registry', JSON.stringify(freshApps)); } catch {}
  };
  const [deletedAppsLog, setDeletedAppsLog] = useState<DeletedAppAuditItem[]>(() => { try { const saved = localStorage.getItem('prism_deleted_apps_log'); if (saved) return JSON.parse(saved); } catch {} return []; });
  const { isInstallable, isStandalone, install, launchStandaloneWindow } = usePWAInstall();
  const handleDirectInstall = async () => { if (isInstallable) { const success = await install(); if (success) return; } setIsInstallModalOpen(true); };
  const [compareAppA, setCompareAppA] = useState<string | undefined>(undefined);
  const [compareAppB, setCompareAppB] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedDevice, setSelectedDevice] = useState<DevicePlatform>('All');
  const [selectedPriceModel, setSelectedPriceModel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'size'>('rating');

  const { supabaseResults, isSearching } = useSupabaseSearch(searchQuery, apps.length);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, selectedCategory, selectedDevice, selectedPriceModel, sortBy, currentTab]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisibleCount(v => v + PAGE_SIZE); }, { rootMargin: '400px' });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, []);

  const openAppDetails = (app: AppItem, tab: 'overview' | 'test-drive' = 'overview') => { setModalInitialTab(tab); setSelectedApp(app); };
  const [installedMap, setInstalledMap] = useState<Record<string, InstalledAppState>>(() => { try { const saved = localStorage.getItem('prism_installed_map'); if (saved) return JSON.parse(saved); } catch {} return { 'harmonics-synth-pro': { appId: 'harmonics-synth-pro', installedVersion: '3.4.2', installedAt: 'Yesterday', storageUsedMB: 38.4, status: 'installed', progress: 100 }, 'cipher-notes-studio': { appId: 'cipher-notes-studio', installedVersion: '3.0.2', installedAt: '3 days ago', storageUsedMB: 15.6, status: 'installed', progress: 100 } }; });
  useEffect(() => { try { const userApps = apps.filter(a => a.isUserUploaded); localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(userApps)); localStorage.setItem('prism_apps_registry', JSON.stringify(apps)); } catch {} }, [apps]);
  useEffect(() => { try { localStorage.setItem('prism_current_tab', currentTab); } catch {} }, [currentTab]);
  useEffect(() => { try { localStorage.setItem('prism_installed_map', JSON.stringify(installedMap)); } catch {} }, [installedMap]);
  useEffect(() => { setInstalledMap(prev => { let changed = false; const copy = { ...prev }; Object.keys(copy).forEach(appId => { const storeApp = apps.find(a => a.id === appId); if (storeApp && copy[appId].status === 'installed' && copy[appId].installedVersion !== storeApp.currentVersion) { copy[appId] = { ...copy[appId], installedVersion: storeApp.currentVersion, installedAt: 'Auto-updated silently' }; changed = true; } }); return changed ? copy : prev; }); }, [apps]);

  const handleInstallApp = (app: AppItem, targetVersion?: string) => {
    const versionToInstall = targetVersion || app.currentVersion;
    setInstalledMap(prev => ({ ...prev, [app.id]: { appId: app.id, installedVersion: versionToInstall, installedAt: 'Just now', storageUsedMB: app.sizeMB, status: 'installing', progress: 15 } }));
    setTimeout(() => { setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], progress: 55 } } : prev); }, 400);
    setTimeout(() => { setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], progress: 85 } } : prev); }, 800);
    setTimeout(() => { setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], status: 'installed', progress: 100 } } : prev); }, 1200);
    if (app.liveAppUrl) { setTimeout(() => window.open(app.liveAppUrl, '_blank'), 1400); }
  };
  const handleUninstallApp = (appId: string) => { setInstalledMap(prev => { const copy = { ...prev }; delete copy[appId]; return copy; }); };
  const handleUpdateApp = (app: AppItem) => {
    if (installedMap[app.id]?.status === 'updating') return;
    setInstalledMap(prev => ({ ...prev, [app.id]: { ...prev[app.id], status: 'updating', progress: 35 } }));
    setTimeout(() => { setInstalledMap(prev => { if (!prev[app.id]) return prev; const updatedItem = { ...prev[app.id], installedVersion: app.currentVersion, status: 'installed' as const, progress: 100 }; const nextMap = { ...prev, [app.id]: updatedItem }; try { localStorage.setItem('prism_installed_apps', JSON.stringify(nextMap)); } catch {} return nextMap; }); }, 700);
  };
  const handleUpdateAll = () => { Object.keys(installedMap).forEach(appId => { const app = apps.find(a => a.id === appId); if (app && installedMap[appId].installedVersion !== app.currentVersion) handleUpdateApp(app); }); };
  const handleStartCompare = (app: AppItem) => { setCompareAppA(app.id); const otherApp = apps.find(a => a.id !== app.id); if (otherApp) setCompareAppB(otherApp.id); setSelectedApp(null); setCurrentTab('compare'); };
  const handleAddReview = (appId: string, rating: number, title: string, content: string) => { setApps(prev => prev.map(a => { if (a.id === appId) { const newRev = { id: `rev-user-${Date.now()}`, author: 'You (Local User)', rating, date: 'Just now', device: 'Desktop Studio', title, content, helpfulCount: 0, verifiedPurchase: true }; return { ...a, reviewCount: a.reviewCount + 1, reviews: [newRev, ...a.reviews] }; } return a; })); };
  const handleAppPublished = (newApp: AppItem) => { setApps(prev => { const next = [newApp, ...prev]; try { const userApps = next.filter(a => a.isUserUploaded); localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(userApps)); localStorage.setItem('prism_apps_registry', JSON.stringify(next)); } catch {} return next; }); };
  const handleAppDeleted = (appId: string, reason: string, deletedBy: 'Owner' | 'Prism Store Developer / Manager') => {
    const targetApp = apps.find(a => a.id === appId);
    if (targetApp) { const auditEntry: DeletedAppAuditItem = { id: `del-${Date.now()}`, name: targetApp.name, developer: targetApp.developer, category: targetApp.category, reason, deletedBy, deletedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), originalApp: targetApp }; setDeletedAppsLog(prev => { const next = [auditEntry, ...prev]; try { localStorage.setItem('prism_deleted_apps_log', JSON.stringify(next)); } catch {} return next; }); }
    if (supabase) { supabase.from('marketplace_apps').delete().eq('id', appId).then(()=>{}); if (targetApp?.packageBundleName) { supabase.storage.from('apps').remove([targetApp.packageBundleName]).then(()=>{}); } }
    setApps(prev => { const next = prev.filter(a => a.id !== appId); try { const userApps = next.filter(a => a.isUserUploaded); localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(userApps)); localStorage.setItem('prism_apps_registry', JSON.stringify(next)); } catch {} return next; });
    setInstalledMap(prev => { if (prev[appId]) { const copy = { ...prev }; delete copy[appId]; try { localStorage.setItem('prism_installed_map', JSON.stringify(copy)); } catch {} return copy; } return prev; });
    if (selectedApp?.id === appId) setSelectedApp(null);
  };
  const handleRestoreApp = (appToRestore: AppItem) => {
    setApps(prev => { if (prev.some(a => a.id === appToRestore.id)) return prev; const next = [appToRestore, ...prev]; try { const userApps = next.filter(a => a.isUserUploaded); localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(userApps)); localStorage.setItem('prism_apps_registry', JSON.stringify(next)); } catch {} return next; });
    setDeletedAppsLog(prev => { const next = prev.filter(d => d.originalApp.id !== appToRestore.id); try { localStorage.setItem('prism_deleted_apps_log', JSON.stringify(next)); } catch {} return next; });
  };

  const filteredApps = useMemo(() => {
    const seen = new Set<string>();
    let baseList = [...apps];
    if (searchQuery.trim().length >= 2 && supabaseResults.length > 0) {
      const converted: AppItem[] = supabaseResults.map((row: any) => {
        const isAdinkra = (row.title || '').toLowerCase().includes('adinkra');
        return { id: row.id, name: row.title, tagline: row.tagline || row.description || 'User published', developer: row.developer_name || 'Indie Engineer', developerVerified: true, category: row.category || 'Developer Tools', price: row.price || 0, priceFormatted: row.price_model === 'Open Source' ? 'Free (Open Source)' : 'Free', priceModel: (row.price_model as any) || 'Free', rating: 5.0, reviewCount: 1, downloadsCount: String(row.downloads || 1), sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0', minOS: 'Android 12 / iOS 16 / macOS / Web', supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'], heroImage: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase, thumbnail: isAdinkra ? APP_MEDIA_ASSETS.adinkraStudio : APP_MEDIA_ASSETS.luminaShowcase, accentColor: isAdinkra ? '#f97316' : '#38bdf8', summary: row.description || row.tagline || '', features: ['Zero trackers', 'Permanent hosting'], offlineCapable: true, zeroTrackers: true, openSource: row.price_model === 'Open Source', isUserUploaded: true, ownerId: row.owner_id, uploadedAt: 'Just now', liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url, sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [], versionHistory: [{ version: row.version || '1.0.0', releaseDate: 'Today', sizeMB: row.size_mb || 15, isLatest: true, highlights: ['Live search result'] }], reviews: [], sandboxType: 'terminal' } as AppItem;
      });
      const map = new Map<string, AppItem>();
      converted.forEach(c => map.set(c.id, c));
      baseList.forEach(b => { if (!map.has(b.id)) map.set(b.id, b); });
      baseList = Array.from(map.values());
    }

    return baseList.filter(app => {
      if (seen.has(app.id)) return false; seen.add(app.id);
      const matchesSearch = searchQuery === '' || app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) || app.developer.toLowerCase().includes(searchQuery.toLowerCase()) || app.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const matchesDevice = selectedDevice === 'All' || app.supportedDevices.includes(selectedDevice);
      const matchesPrice = selectedPriceModel === 'All' || app.priceModel === selectedPriceModel;
      return matchesSearch && matchesCategory && matchesDevice && matchesPrice;
    }).sort((a, b) => { if (sortBy === 'rating') return b.rating - a.rating; if (sortBy === 'size') return a.sizeMB - b.sizeMB; return parseInt(b.downloadsCount) - parseInt(a.downloadsCount); });
  }, [apps, searchQuery, selectedCategory, selectedDevice, selectedPriceModel, sortBy, supabaseResults]);

  const paginatedApps = useMemo(() => filteredApps.slice(0, visibleCount), [filteredApps, visibleCount]);
  const hasMore = visibleCount < filteredApps.length;
  const heroApp = apps[0];

  const LoadMoreSentinel = () => (
    <div ref={loadMoreRef} className="col-span-full flex flex-col items-center justify-center py-8 gap-3">
      {hasMore ? (
        <>
          <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-4 h-4 rounded-full border-2 border-slate-600 border-t-indigo-400 animate-spin" /><span>Loading {Math.min(PAGE_SIZE, filteredApps.length - visibleCount)} more...</span></div>
          <button onClick={() => setVisibleCount(v => v + PAGE_SIZE)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium">Load More ({filteredApps.length - visibleCount} left)</button>
        </>
      ) : filteredApps.length > PAGE_SIZE ? (
        <div className="text-[11px] text-slate-500 font-mono">End — {filteredApps.length} apps shown • Live search from Supabase</div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <TopBar currentTab={currentTab} onSelectTab={setCurrentTab} onOpenDevModal={() => { setDevModalInitialTab('publish'); setIsDevModalOpen(true); }} onOpenOwnerGuide={() => { setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} onOpenInstallModal={() => setIsInstallModalOpen(true)} onDirectInstall={handleDirectInstall} onOpenSyncHub={() => setIsSyncHubOpen(true)} isStandalone={isStandalone} installedCount={Object.keys(installedMap).length} userUID={userUID} isStoreManager={isStoreManager} onOpenManagerAuth={() => setIsManagerAuthModalOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-28 md:pb-8 overflow-x-hidden">
        <DirectInstallBanner onOpenManualModal={() => setIsInstallModalOpen(true)} />
        {isSupabaseSyncing && <div className="mb-4 px-3 py-2 bg-indigo-950/50 border border-indigo-800/50 rounded-xl text-xs text-indigo-300 flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" /><span>Syncing permanent apps from Supabase...</span></div>}

        {currentTab === 'discover' && (
          <div className="space-y-8 sm:space-y-10 overflow-x-hidden">
            {heroApp && (
              <section className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-6 p-5 sm:p-10 flex flex-col justify-between z-10"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-indigo-400 font-mono mb-2"><span>EDITOR'S DAILY SPOTLIGHT</span><span className="text-slate-600">·</span><span>DSP KERNEL v3.4</span></div><h1 className="text-xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">{heroApp.editorialHighlight?.headline || heroApp.name}</h1><p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">{heroApp.summary}</p><div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-800/80"><div className="flex items-center gap-1 text-amber-400 font-medium"><Star className="w-3.5 h-3.5 fill-current" /><span className="text-white font-mono">{heroApp.rating.toFixed(1)}</span></div><span className="text-slate-700 hidden sm:inline">·</span><span className="truncate">{heroApp.category}</span><span className="text-slate-700 hidden sm:inline">·</span><span className="text-emerald-400 font-medium truncate">Privacy {heroApp.privacyGrade}</span><span className="text-slate-700 hidden sm:inline">·</span><span className="font-mono text-slate-300 truncate">{heroApp.priceFormatted}</span></div></div><div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-6"><button onClick={() => openAppDetails(heroApp, 'overview')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-lg flex items-center justify-center gap-2"><Download className="w-4 h-4" /><span>Get {heroApp.name}</span></button><button onClick={() => openAppDetails(heroApp, 'test-drive')} className="flex-1 sm:flex-none px-3 py-2.5 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 font-medium rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"><Play className="w-3.5 h-3.5 fill-current" /><span>Test Drive</span></button></div></div>
                  <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-full bg-slate-950">{heroApp.heroImage && <img src={resolveAppMedia(heroApp.heroImage)} alt={heroApp.name} referrerPolicy="no-referrer" onError={(e) => { const target = e.currentTarget; const fallback = getAppCategoryPlaceholder(heroApp.category, heroApp.name); if (target.src !== fallback) target.src = fallback; }} className="w-full h-full object-cover lg:absolute lg:inset-0" />}<div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent pointer-events-none" /></div>
                </div>
              </section>
            )}

            {Object.keys(installedMap).length > 0 && (
              <BecauseYouInstalled installedMap={installedMap} allApps={apps} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={(a)=>openAppDetails(a,'test-drive')} />
            )}

            <section className="bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-800 w-full overflow-hidden"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full"><div className="min-w-0"><h3 className="text-sm font-semibold text-white">Target Hardware Ecosystem</h3><p className="text-[11px] text-slate-400">Discover binaries for your device • Verified hardware</p></div><div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto">{(['All', 'Phone', 'Tablet', 'Desktop', 'Watch', 'Vision'] as DevicePlatform[]).map(dev => (<button key={dev} onClick={() => setSelectedDevice(dev)} className={`py-1.5 px-2 sm:px-3 rounded-md font-medium text-[11px] sm:text-xs transition-colors text-center truncate ${selectedDevice === dev ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>{dev}</button>))}</div></div></section>
            
            <section className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-2 mb-4"><div className="min-w-0"><h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Editor's Choice: Precision Software</h3><p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Zero surveillance telemetry, independent developers, live install counts.</p></div><button onClick={() => setCurrentTab('apps')} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"><span>View All</span><ArrowRight className="w-3 h-3" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{paginatedApps.slice(0, 6).map(app => (<AppCard key={app.id} app={app} installedState={installedMap[app.id]} onOpenDetails={appToOpen => openAppDetails(appToOpen, 'overview')} onQuickInstall={handleInstallApp} onOpenSandbox={appToTest => openAppDetails(appToTest, 'test-drive')} />))}</div></section>
          </div>
        )}

        {currentTab === 'apps' && (
          <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input type="text" placeholder="Instant search Supabase + local... (⌘K)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={()=>{/* hint */}} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    {isSearching && <div className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" />}
                    {searchQuery.length >=2 && !isSearching && supabaseResults.length > 0 && <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/50">{supabaseResults.length} cloud</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs w-full sm:w-auto">
                  <button onClick={()=>setCommandOpen(true)} className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"><Command className="w-3.5 h-3.5" /><span className="hidden sm:inline">⌘K</span><span className="sm:hidden">Search</span></button>
                  <span className="text-slate-400 whitespace-nowrap hidden sm:inline">Sort:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"><option value="rating">Rating</option><option value="downloads">Installed</option><option value="size">Size</option></select>
                </div>
              </div>
              <div className="space-y-3 pt-3 border-t border-slate-800 w-full overflow-hidden">
                <div className="w-full overflow-hidden"><p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Categories</p><div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-1.5 w-full">{(['All', 'Audio & Music', 'Design & Creative', 'Health & Biometrics', 'Developer Tools', 'Productivity & Notes', 'Sports'] as CategoryType[]).map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`py-2 px-2 sm:px-3 rounded-lg font-medium text-[11px] sm:text-xs text-center truncate transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'}`}>{cat}</button>))}</div></div>
                <div className="w-full overflow-hidden"><p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Price Model</p><div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto">{['All', 'Free', 'One-Time', 'Subscription', 'Open Source'].map(pm => (<button key={pm} onClick={() => setSelectedPriceModel(pm)} className={`py-1.5 px-2 sm:px-2.5 rounded text-[10px] sm:text-[11px] font-medium text-center truncate transition-colors ${selectedPriceModel === pm ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{pm}</button>))}</div></div>
                <div className="w-full overflow-hidden"><p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">Device</p><div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto">{(['All', 'Phone', 'Tablet', 'Desktop', 'Watch', 'Vision'] as DevicePlatform[]).map(dev => (<button key={dev} onClick={() => setSelectedDevice(dev)} className={`py-1.5 px-2 sm:px-3 rounded-md font-medium text-[11px] sm:text-xs text-center truncate transition-colors ${selectedDevice === dev ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{dev}</button>))}</div></div>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400 mb-3 sm:mb-4 px-1"><span className="truncate">Showing {paginatedApps.length} of {filteredApps.length} packages {isSupabaseSyncing || isSearching ? '(live syncing...)' : ''}</span><span className="hidden sm:inline">Zero tracker beacons certified • Live ticker</span></div>
              {filteredApps.length === 0 ? (<div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400 space-y-3"><p className="text-sm sm:text-base text-slate-200 font-semibold">No software matched</p><button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedPriceModel('All'); setSelectedDevice('All'); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors mt-2">Reset Filters</button></div>) : (
                <><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{paginatedApps.map(app => (<AppCard key={app.id} app={app} installedState={installedMap[app.id]} onOpenDetails={appToOpen => openAppDetails(appToOpen, 'overview')} onQuickInstall={handleInstallApp} onOpenSandbox={appToTest => openAppDetails(appToTest, 'test-drive')} />))}<LoadMoreSentinel /></div></>
              )}
            </div>
          </div>
        )}

        {currentTab === 'compare' && <AppCompareView apps={apps} initialAppAId={compareAppA} initialAppBId={compareAppB} onOpenDetails={appToOpen => openAppDetails(appToOpen, 'overview')} />}
        {currentTab === 'library' && <LibraryView apps={apps} installedMap={installedMap} onOpenDetails={appToOpen => openAppDetails(appToOpen, 'overview')} onOpenSandbox={appToTest => openAppDetails(appToTest, 'test-drive')} onUninstall={handleUninstallApp} onUpdateApp={handleUpdateApp} onUpdateAll={handleUpdateAll} />}
      </main>

      <footer className="mt-12 sm:mt-16 border-t border-slate-800/80 bg-slate-950 py-6 sm:py-8 text-xs text-slate-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2"><span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" /><span className="font-semibold text-slate-300">Prism App Store</span><span className="text-slate-600 hidden sm:inline">·</span><span className="text-[11px]">Independent Distribution {supabase ? '· Permanent' : ''} · {filteredApps.length} apps · Live ticker · Press ⌘K</span></div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px]"><span>0% Commission</span><span>Verified</span><span>Privacy Grades</span></div>
        </div>
      </footer>

      {selectedApp && <AppDetailModal key={`${selectedApp.id}-${modalInitialTab}`} app={selectedApp} initialTab={modalInitialTab} installedState={installedMap[selectedApp.id]} onClose={() => setSelectedApp(null)} onInstall={handleInstallApp} onUninstall={handleUninstallApp} onStartCompare={handleStartCompare} onAddReview={handleAddReview} onAppDeleted={handleAppDeleted} onOpenOwnerGuide={() => { setSelectedApp(null); setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} allApps={apps} />}
      {isDevModalOpen && <DevSubmitModal onClose={() => setIsDevModalOpen(false)} apps={apps} initialTab={devModalInitialTab} onAppPublished={handleAppPublished} onAppDeleted={handleAppDeleted} onRestoreApp={handleRestoreApp} deletedAppsLog={deletedAppsLog} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} onUpdateUID={handleUpdateUID} />}
      <ManagerAuthModal isOpen={isManagerAuthModalOpen} onClose={() => setIsManagerAuthModalOpen(false)} userUID={userUID} onUpdateUID={handleUpdateUID} isStoreManager={isStoreManager} onSetStoreManager={handleSetStoreManager} />
      {isInstallModalOpen && <PWAInstallModal onClose={() => setIsInstallModalOpen(false)} />}
      <OfflineIndicator />
      <UpdateNotificationToast />
      <EdgeSyncManagerModal isOpen={isSyncHubOpen} onClose={() => setIsSyncHubOpen(false)} apps={apps} installedApps={installedMap} onForcePurgeCache={handleForcePurgeCache} onRefreshRegistry={() => { try { const savedUserAppsRaw = localStorage.getItem('prism_user_uploaded_apps'); const savedUserApps: AppItem[] = savedUserAppsRaw ? JSON.parse(savedUserAppsRaw) : []; const userIds = new Set(savedUserApps.map(a => a.id)); const freshApps = [...savedUserApps, ...APPS_DATA.filter(a => !userIds.has(a.id))]; setApps(freshApps); } catch {} }} />
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} installedCount={Object.keys(installedMap).length} onOpenSyncHub={() => setIsSyncHubOpen(true)} />

      {/* Command Palette - Global */}
      <CommandPalette 
        apps={apps}
        installedMap={installedMap}
        onOpenDetails={(app)=>{ openAppDetails(app,'overview'); }}
        onOpenSandbox={(app)=>{ openAppDetails(app,'test-drive'); }}
        onInstall={handleInstallApp}
        isOpen={commandOpen}
        onClose={()=>setCommandOpen(false)}
      />

      {/* Floating cmd+K button on mobile */}
      <button 
        onClick={()=>setCommandOpen(true)}
        className="fixed bottom-20 right-4 md:hidden z-40 w-12 h-12 bg-white text-slate-900 rounded-full shadow-xl flex items-center justify-center border border-slate-200 active:scale-95 transition-transform"
        aria-label="Open command palette"
      >
        <Search className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AdaptiveDeviceWrapper>
        <AppStoreContent />
      </AdaptiveDeviceWrapper>
    </SafeAreaProvider>
  );
}
