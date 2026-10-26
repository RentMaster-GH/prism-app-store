import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Star, Download, Play, ArrowRight, Command, Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
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
import { resolveAppMedia, getAppCategoryPlaceholder } from './utils/media';
import { useSupabaseSearch } from './hooks/useSupabaseSearch';
import { BecauseYouInstalled } from './components/BecauseYouInstalled';
import { CommandPalette } from './components/CommandPalette';
import { supabase } from './lib/supabase';
import { useInstallAnalytics } from './hooks/useInstallAnalytics';

const PAGE_SIZE = 12;

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: any }> {
  state = { error: null as any };
  static getDerivedStateFromError(e: any) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#05060f] text-white p-6 flex items-center justify-center">
          <div className="max-w-lg w-full">
            <h1 className="text-red-400 font-bold mb-3">Prism crashed</h1>
            <pre className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 overflow-auto text-xs whitespace-pre-wrap">{String(this.state.error?.message)}</pre>
            <button onClick={() => { try { localStorage.clear(); } catch {} location.reload(); }} className="mt-4 w-full h-11 bg-white text-black rounded-full font-bold text-sm">Clear cache & Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

function AppStoreContent() {
  useInstallAnalytics();

  const [apps, setApps] = useState<AppItem[]>(() => {
    try {
      const savedUserAppsRaw = localStorage.getItem('prism_user_uploaded_apps');
      const savedUserApps: AppItem[] = savedUserAppsRaw ? JSON.parse(savedUserAppsRaw) : [];
      const savedRegistryRaw = localStorage.getItem('prism_apps_registry');
      const savedRegistry: AppItem[] = savedRegistryRaw ? JSON.parse(savedRegistryRaw) : [];
      const legacyUserApps = savedRegistry.filter((a: any) => a.isUserUploaded);
      const userAppsMap = new Map<string, AppItem>();
      [...legacyUserApps, ...savedUserApps].forEach(app => {
        try { userAppsMap.set(app.id, { ...app, heroImage: app.heroImage ? resolveAppMedia(app.heroImage) : app.heroImage, thumbnail: resolveAppMedia(app.thumbnail) }); } catch {}
      });
      const deletedLogRaw = localStorage.getItem('prism_deleted_apps_log');
      const deletedIds = new Set<string>();
      if (deletedLogRaw) { try { const parsedLog = JSON.parse(deletedLogRaw); parsedLog.forEach((d: any) => { if (d.originalApp?.id) deletedIds.add(d.originalApp.id); if (d.appId) deletedIds.add(d.appId); }); } catch {} }
      const officialApps = APPS_DATA.filter((a: any) => !deletedIds.has(a.id));
      const activeUserApps = Array.from(userAppsMap.values()).filter(a => !deletedIds.has(a.id));
      const seen = new Set<string>(); const combined: AppItem[] = [];
      for (const app of activeUserApps) { if (!seen.has(app.id)) { seen.add(app.id); combined.push(app); } }
      for (const app of officialApps) { if (!seen.has(app.id)) { seen.add(app.id); combined.push({ ...app, heroImage: app.heroImage ? resolveAppMedia(app.heroImage) : app.heroImage, thumbnail: resolveAppMedia(app.thumbnail) }); } }
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
        const permanentApps: AppItem[] = data.map((row: any) => ({
          id: row.id, name: row.title, tagline: row.tagline || row.description || 'User published',
          developer: row.developer_name || 'Indie Engineer', developerVerified: true,
          category: row.category || 'Developer Tools', price: 0, priceFormatted: 'Free', priceModel: 'Free' as any, rating: 5.0, reviewCount: 1,
          downloadsCount: String(row.downloads || 1), sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0',
          minOS: 'Android 12 / iOS 16 / macOS / Web', supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'] as any,
          heroImage: row.download_url || '', thumbnail: row.download_url || '', accentColor: '#38bdf8',
          summary: row.description || row.title, features: ['Zero trackers', 'Permanent hosting'], offlineCapable: true, zeroTrackers: true,
          openSource: false, isUserUploaded: true, ownerId: row.owner_id, uploadedAt: 'Just now',
          liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url,
          sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [],
          versionHistory: [{ version: row.version || '1.0.0', releaseDate: 'Today', sizeMB: row.size_mb || 15, isLatest: true, highlights: ['Live'] } as any],
          reviews: [], sandboxType: 'terminal' as any
        }));
        setApps(prev => { const map = new Map<string, AppItem>(); permanentApps.forEach(a => map.set(a.id, a)); prev.forEach(a => { if (!map.has(a.id)) map.set(a.id, a); }); return Array.from(map.values()); });
      } catch {} finally { setIsSupabaseSyncing(false); }
    };
    loadPermanentApps();
    try {
      const channel = supabase.channel('marketplace_apps_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_apps' }, () => { loadPermanentApps(); }).subscribe();
      return () => { try { supabase.removeChannel(channel); } catch {} };
    } catch {}
  }, []);

  const [userUID, setUserUID] = useState<string>(() => { try { const saved = localStorage.getItem('prism_user_uid'); if (saved) return saved; } catch {} const id = `PRISM-UID-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2,6).toUpperCase()}`; try { localStorage.setItem('prism_user_uid', id); } catch {} return id; });
  const [isStoreManager, setIsStoreManager] = useState<boolean>(() => { try { return localStorage.getItem('prism_is_store_manager') === 'true'; } catch {} return false; });
  const [isManagerAuthModalOpen, setIsManagerAuthModalOpen] = useState(false);
  const handleUpdateUID = (newUID: string) => { setUserUID(newUID); try { localStorage.setItem('prism_user_uid', newUID); } catch {} };
  const handleSetStoreManager = (status: boolean) => { setIsStoreManager(status); try { localStorage.setItem('prism_is_store_manager', status ? 'true' : 'false'); } catch {} };

  const [currentTab, setCurrentTab] = useState<'discover' | 'apps' | 'compare' | 'library'>(() => { try { const saved = localStorage.getItem('prism_current_tab'); if (saved && ['discover','apps','compare','library'].includes(saved)) return saved as any; } catch {} return 'discover'; });
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'test-drive'>('overview');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devModalInitialTab, setDevModalInitialTab] = useState<'publish' | 'owner-apps' | 'moderation' | 'guide' | 'audit-log'>('publish');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSyncHubOpen, setIsSyncHubOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommandOpen(o => !o); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleForcePurgeCache = async () => {
    if (typeof window !== 'undefined' && 'caches' in window) { try { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); } catch {} }
    try { const raw = localStorage.getItem('prism_user_uploaded_apps'); const saved: AppItem[] = raw ? JSON.parse(raw) : []; const ids = new Set(saved.map(a => a.id)); const fresh = [...saved, ...APPS_DATA.filter(a => !ids.has(a.id))]; setApps(fresh); } catch {}
  };
  const [deletedAppsLog, setDeletedAppsLog] = useState<DeletedAppAuditItem[]>(() => { try { const s = localStorage.getItem('prism_deleted_apps_log'); if (s) return JSON.parse(s); } catch {} return []; });
  const { isInstallable, isStandalone, install } = usePWAInstall();

  const handleDirectInstall = useCallback(async () => {
    if (isStandalone) return;
    if (isInstallable) {
      const ok = await install();
      if (ok) return;
    }
    setIsInstallModalOpen(true);
  }, [isInstallable, isStandalone, install]);

  const [compareAppA, setCompareAppA] = useState<string | undefined>(undefined);
  const [compareAppB, setCompareAppB] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedDevice, setSelectedDevice] = useState<DevicePlatform>('All');
  const [selectedPriceModel, setSelectedPriceModel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'size'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const { supabaseResults } = useSupabaseSearch(searchQuery, apps.length);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const openAppDetails = useCallback((app: AppItem, tab: 'overview' | 'test-drive' = 'overview') => { setModalInitialTab(tab); setSelectedApp(app); }, []);

  const [installedMap, setInstalledMap] = useState<Record<string, InstalledAppState>>(() => {
    try { const saved = localStorage.getItem('prism_installed_map'); if (saved) return JSON.parse(saved); } catch {}
    return {
      'harmonics-synth-pro': { appId: 'harmonics-synth-pro', installedVersion: '3.4.2', installedAt: 'Yesterday', storageUsedMB: 38.4, status: 'installed', progress: 100 },
      'cipher-notes-studio': { appId: 'cipher-notes-studio', installedVersion: '3.0.2', installedAt: '3 days ago', storageUsedMB: 15.6, status: 'installed', progress: 100 }
    };
  });

  useEffect(() => { try { localStorage.setItem('prism_current_tab', currentTab); } catch {} }, [currentTab]);
  useEffect(() => { try { localStorage.setItem('prism_installed_map', JSON.stringify(installedMap)); } catch {} }, [installedMap]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, selectedCategory, selectedDevice, selectedPriceModel, sortBy, currentTab]);

  const handleInstallApp = useCallback((app: AppItem) => {
    setInstalledMap(prev => ({ ...prev, [app.id]: { appId: app.id, installedVersion: app.currentVersion, installedAt: 'Just now', storageUsedMB: app.sizeMB, status: 'installing', progress: 15 } as any }));
    setTimeout(() => setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], progress: 55 } } : prev), 400);
    setTimeout(() => setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], progress: 85 } } : prev), 800);
    setTimeout(() => setInstalledMap(prev => prev[app.id] ? { ...prev, [app.id]: { ...prev[app.id], status: 'installed', progress: 100 } } : prev), 1200);
    if (app.liveAppUrl) setTimeout(() => window.open(app.liveAppUrl, '_blank'), 1400);
  }, []);
  const handleUninstallApp = useCallback((appId: string) => { setInstalledMap(prev => { const c = { ...prev }; delete c[appId]; return c; }); }, []);
  const handleUpdateApp = useCallback((app: AppItem) => {
    if (installedMap[app.id]?.status === 'updating') return;
    setInstalledMap(prev => ({ ...prev, [app.id]: { ...prev[app.id], status: 'updating', progress: 35 } } as any));
    setTimeout(() => setInstalledMap(prev => ({ ...prev, [app.id]: { ...prev[app.id], installedVersion: app.currentVersion, status: 'installed', progress: 100 } } as any)), 700);
  }, [installedMap]);
  const handleUpdateAll = useCallback(() => { Object.keys(installedMap).forEach(id => { const app = apps.find(a => a.id === id); if (app && installedMap[id].installedVersion !== app.currentVersion) handleUpdateApp(app); }); }, [apps, installedMap, handleUpdateApp]);
  const handleStartCompare = useCallback((app: AppItem) => { setCompareAppA(app.id); const other = apps.find(a => a.id !== app.id); if (other) setCompareAppB(other.id); setSelectedApp(null); setCurrentTab('compare'); }, [apps]);
  const handleAddReview = useCallback((appId: string, rating: number, title: string, content: string) => {
    setApps(prev => prev.map(a => { if (a.id === appId) { const rev = { id: `rev-${Date.now()}`, author: 'You', rating, date: 'Just now', device: 'Desktop', title, content, helpfulCount: 0, verifiedPurchase: true }; return { ...a, reviewCount: a.reviewCount + 1, reviews: [rev as any, ...a.reviews] }; } return a; }));
  }, []);
  const handleAppPublished = useCallback((newApp: AppItem) => { setApps(prev => [newApp, ...prev]); }, []);
  const handleAppDeleted = useCallback((appId: string, reason: string, deletedBy: any) => {
    const target = apps.find(a => a.id === appId);
    if (target) { const entry: DeletedAppAuditItem = { id: `del-${Date.now()}`, name: target.name, developer: target.developer, category: target.category, reason, deletedBy, deletedAt: new Date().toLocaleTimeString(), originalApp: target } as any; setDeletedAppsLog(prev => { const n=[entry,...prev]; try{localStorage.setItem('prism_deleted_apps_log', JSON.stringify(n));}catch{} return n; }); }
    if (supabase) { supabase.from('marketplace_apps').delete().eq('id', appId).then(()=>{}); }
    setApps(prev => prev.filter(a => a.id !== appId)); setInstalledMap(prev => { const c = { ...prev }; delete c[appId]; return c; }); if (selectedApp?.id === appId) setSelectedApp(null);
  }, [apps, selectedApp]);
  const handleRestoreApp = useCallback((appToRestore: AppItem) => { setApps(prev => prev.some(a => a.id === appToRestore.id) ? prev : [appToRestore, ...prev]); setDeletedAppsLog(prev => prev.filter(d => d.originalApp.id !== appToRestore.id)); }, []);

  const CATEGORIES = useMemo(() => ['All', ...Array.from(new Set(APPS_DATA.map(a => a.category)))], []);
  const DEVICES: (DevicePlatform | 'All')[] = ['All', 'Phone', 'Tablet', 'Desktop', 'Vision'];
  const PRICES = ['All', 'Free', 'Paid', 'Subscription'];
  const SORTS = [{ id: 'rating', label: 'Top Rated' }, { id: 'downloads', label: 'Popular' }, { id: 'size', label: 'Smallest' }] as const;

  const filteredApps = useMemo(() => {
    const seen = new Set<string>();
    let baseList = [...apps];
    if (searchQuery.trim().length >= 2 && supabaseResults.length > 0) {
      const converted: AppItem[] = supabaseResults.map((row: any) => ({
        id: row.id, name: row.title, tagline: row.tagline || row.description || '', developer: row.developer_name || 'Indie', developerVerified: true, category: row.category || 'Developer Tools', price: 0, priceFormatted: 'Free', priceModel: 'Free' as any, rating: 5.0, reviewCount: 1, downloadsCount: '1', sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0', minOS: 'Web', supportedDevices: ['Phone','Tablet','Desktop','Vision'] as any, heroImage: row.download_url || '', thumbnail: row.download_url || '', accentColor: '#38bdf8', summary: row.description || '', features: [], offlineCapable: true, zeroTrackers: true, openSource: false, isUserUploaded: true, ownerId: row.owner_id, uploadedAt: 'Just now', liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url, sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [], versionHistory: [{ version: '1.0.0', releaseDate: 'Today', sizeMB: 15, isLatest: true, highlights: [] } as any], reviews: [], sandboxType: 'terminal' as any
      }));
      const map = new Map<string, AppItem>(); converted.forEach(c => map.set(c.id, c)); baseList.forEach(b => { if (!map.has(b.id)) map.set(b.id, b); }); baseList = Array.from(map.values());
    }
    return baseList.filter(app => {
      if (seen.has(app.id)) return false; seen.add(app.id);
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || app.name.toLowerCase().includes(q) || app.tagline.toLowerCase().includes(q) || app.developer.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const matchesDevice = selectedDevice === 'All' || app.supportedDevices.includes(selectedDevice);
      const matchesPrice = selectedPriceModel === 'All' || app.priceModel === selectedPriceModel;
      return matchesSearch && matchesCategory && matchesDevice && matchesPrice;
    }).sort((a,b) => { if (sortBy === 'rating') return b.rating - a.rating; if (sortBy === 'size') return a.sizeMB - b.sizeMB; return parseInt((b.downloadsCount||'0').replace(/[^0-9]/g,'')) - parseInt((a.downloadsCount||'0').replace(/[^0-9]/g,'')); });
  }, [apps, searchQuery, selectedCategory, selectedDevice, selectedPriceModel, sortBy, supabaseResults]);

  const paginatedApps = useMemo(() => filteredApps.slice(0, visibleCount), [filteredApps, visibleCount]);
  const hasMore = visibleCount < filteredApps.length;
  const heroApp = apps[0];
  const activeFilterCount = [selectedCategory !== 'All', selectedDevice !== 'All', selectedPriceModel !== 'All', sortBy !== 'rating'].filter(Boolean).length;

  // FIXED: This useEffect must be AFTER filteredApps is defined
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisibleCount(v => v + PAGE_SIZE); }, { rootMargin: '600px' });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 antialiased">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent),radial-gradient(40%_40%_at_100%_0%,rgba(168,85,247,0.12),transparent)] pointer-events-none" />
      <TopBar currentTab={currentTab} onSelectTab={setCurrentTab} onOpenDevModal={() => { setDevModalInitialTab('publish'); setIsDevModalOpen(true); }} onOpenOwnerGuide={() => { setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} onOpenInstallModal={() => setIsInstallModalOpen(true)} onDirectInstall={handleDirectInstall} onOpenSyncHub={() => setIsSyncHubOpen(true)} isStandalone={isStandalone} installedCount={Object.keys(installedMap).length} userUID={userUID} isStoreManager={isStoreManager} onOpenManagerAuth={() => setIsManagerAuthModalOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-8">
        <DirectInstallBanner onOpenManualModal={() => setIsInstallModalOpen(true)} />
        {isSupabaseSyncing && <div className="mb-4 px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-full text-xs text-indigo-200 flex items-center gap-2 w-fit"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Syncing permanent apps...</span></div>}

        {currentTab === 'discover' && (
          <div className="space-y-8 sm:space-y-10">
            {heroApp && (
              <section className="relative rounded-[28px] overflow-hidden border border-white/[0.08] bg-[#0a0b18] backdrop-blur-xl shadow-2xl shadow-black/50 group">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
                  <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-[10px] text-indigo-200 font-mono tracking-widest mb-5">EDITOR'S SPOTLIGHT • LIVE • OFFLINE READY</div>
                      <h1 className="text-[30px] sm:text-[44px] font-black tracking-[-0.04em] leading-[0.9] text-white">{heroApp.editorialHighlight?.headline || heroApp.name}</h1>
                      <p className="text-[14px] sm:text-[16px] text-slate-300/80 mt-4 leading-relaxed max-w-[50ch] line-clamp-3">{heroApp.summary}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-5">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{heroApp.rating.toFixed(1)} • {heroApp.reviewCount > 1000 ? `${Math.floor(heroApp.reviewCount/1000)}K+` : heroApp.reviewCount}</span>
                        <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10">{heroApp.category}</span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-200">Privacy {heroApp.privacyGrade}</span>
                      </div>
                    </div>
                    <div className="flex gap-2.5 mt-8">
                      <button onClick={() => openAppDetails(heroApp)} className="h-[44px] px-6 bg-white text-slate-950 font-bold rounded-full text-[14px] flex items-center gap-2 hover:bg-slate-100 transition active:scale-[0.98]"><Download className="w-4 h-4" />Get {heroApp.name}</button>
                      <button onClick={() => openAppDetails(heroApp,'test-drive')} className="h-[44px] px-5 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-white rounded-full text-[14px] flex items-center gap-2 backdrop-blur transition active:scale-[0.98]"><Play className="w-3.5 h-3.5 fill-current" />Test Drive</button>
                    </div>
                  </div>
                  <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600">
                    <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_30%_20%,rgba(255,255,255,0.25),transparent)]" />
                    <img src={resolveAppMedia(heroApp.thumbnail) || getAppCategoryPlaceholder(heroApp.category, heroApp.name)} alt={heroApp.name} loading="eager" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70 group-hover:scale-[1.03] transition duration-700" onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b18] via-[#0a0b18]/10 to-transparent lg:bg-gradient-to-r lg:from-[#0a0b18] lg:via-[#0a0b18]/30 lg:to-transparent" />
                  </div>
                </div>
              </section>
            )}
            {Object.keys(installedMap).length > 0 && <BecauseYouInstalled installedMap={installedMap} allApps={apps} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={(a)=>openAppDetails(a,'test-drive')} />}
            <section>
              <div className="flex items-center justify-between mb-5"><h3 className="text-[18px] font-bold tracking-tight">Editor's Choice</h3><button onClick={() => setCurrentTab('apps')} className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">View All<ArrowRight className="w-3 h-3" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedApps.slice(0,6).map((app, idx) => (<AppCard key={app.id} index={idx} app={app} installedState={installedMap[app.id]} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={a=>openAppDetails(a,'test-drive')} />))}
              </div>
            </section>
          </div>
        )}

        {currentTab === 'apps' && (
          <div className="space-y-4">
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[20px] p-3 sm:p-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search apps, creators, categories (⌘K)..." className="w-full h-[44px] bg-[#0a0b18] border border-white/10 rounded-full pl-10 pr-10 text-[14px] focus:outline-none focus:border-indigo-500/50 focus:bg-[#0e0f22] transition placeholder:text-slate-500" />{searchQuery && <button onClick={()=>setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10"><X className="w-3 h-3" /></button>}</div>
                <button onClick={()=>setCommandOpen(true)} className="h-[44px] px-3 bg-[#0a0b18] border border-white/10 rounded-full text-xs flex items-center gap-1.5 hover:bg-white/[0.06] transition"><Command className="w-3.5 h-3.5" />K</button>
                <button onClick={()=>setShowFilters(!showFilters)} className={`h-[44px] px-4 rounded-full text-[13px] font-medium flex items-center gap-2 border transition ${showFilters || activeFilterCount ? 'bg-white text-black border-white' : 'bg-[#0a0b18] border-white/10 hover:bg-white/[0.06]'}`}><SlidersHorizontal className="w-4 h-4" />Filters {activeFilterCount > 0 && <span className="bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}</button>
              </div>
              {showFilters && (
                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">{CATEGORIES.map(cat => (<button key={cat} onClick={()=>setSelectedCategory(cat as CategoryType)} className={`whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-medium border transition ${selectedCategory===cat ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'}`}>{cat}</button>))}</div>
                  <div className="flex flex-wrap gap-2">{DEVICES.map(d => (<button key={d} onClick={()=>setSelectedDevice(d as DevicePlatform)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${selectedDevice===d ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/[0.04] border-white/10'}`}>{d}</button>))}<div className="w-px h-5 bg-white/10 mx-1 self-center" />{PRICES.map(p => (<button key={p} onClick={()=>setSelectedPriceModel(p)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${selectedPriceModel===p ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white/[0.04] border-white/10'}`}>{p}</button>))}<div className="w-px h-5 bg-white/10 mx-1 self-center" />{SORTS.map(s => (<button key={s.id} onClick={()=>setSortBy(s.id as any)} className={`px-3 py-1.5 rounded-full text-[11px] border transition ${sortBy===s.id ? 'bg-white text-black border-white' : 'bg-white/[0.04] border-white/10'}`}>{s.label}</button>))}</div>
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] text-slate-400"><Filter className="w-3 h-3" />{filteredApps.length} apps • {searchQuery ? `for "${searchQuery}"` : 'all categories'}{activeFilterCount > 0 && <button onClick={()=>{setSelectedCategory('All'); setSelectedDevice('All'); setSelectedPriceModel('All'); setSortBy('rating');}} className="ml-2 text-indigo-300 hover:text-indigo-200">Clear filters</button>}</div>
            </div>
            {filteredApps.length === 0 ? (<div className="py-20 text-center"><div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3"><Search className="w-5 h-5 text-slate-500" /></div><p className="text-sm font-medium">No apps found</p><p className="text-xs text-slate-500 mt-1">Try different search or clear filters</p></div>) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedApps.map((app, idx) => (<AppCard key={app.id} index={idx} app={app} installedState={installedMap[app.id]} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={a=>openAppDetails(a,'test-drive')} />))}
                <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center">{hasMore ? (<button onClick={()=>setVisibleCount(v=>v+PAGE_SIZE)} className="h-10 px-5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 rounded-full text-xs font-medium transition flex items-center gap-2"><Loader2 className="w-3.5 h-3.5" />Load More ({filteredApps.length - visibleCount} left)</button>) : (<span className="text-[11px] text-slate-500">End of results • {filteredApps.length} apps</span>)}</div>
              </div>
            )}
          </div>
        )}
        {currentTab === 'compare' && <AppCompareView apps={apps} initialAppAId={compareAppA} initialAppBId={compareAppB} onOpenDetails={openAppDetails} />}
        {currentTab === 'library' && <LibraryView apps={apps} installedMap={installedMap} onOpenDetails={openAppDetails} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onUninstall={handleUninstallApp} onUpdateApp={handleUpdateApp} onUpdateAll={handleUpdateAll} />}
      </main>
      {selectedApp && <AppDetailModal key={`${selectedApp.id}-${modalInitialTab}`} app={selectedApp} initialTab={modalInitialTab} installedState={installedMap[selectedApp.id]} onClose={() => setSelectedApp(null)} onInstall={handleInstallApp} onUninstall={handleUninstallApp} onStartCompare={handleStartCompare} onAddReview={handleAddReview} onAppDeleted={handleAppDeleted} onOpenOwnerGuide={() => { setSelectedApp(null); setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} allApps={apps} />}
      {isDevModalOpen && <DevSubmitModal onClose={() => setIsDevModalOpen(false)} apps={apps} initialTab={devModalInitialTab} onAppPublished={handleAppPublished} onAppDeleted={handleAppDeleted} onRestoreApp={handleRestoreApp} deletedAppsLog={deletedAppsLog} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} onUpdateUID={handleUpdateUID} />}
      <ManagerAuthModal isOpen={isManagerAuthModalOpen} onClose={() => setIsManagerAuthModalOpen(false)} userUID={userUID} onUpdateUID={handleUpdateUID} isStoreManager={isStoreManager} onSetStoreManager={handleSetStoreManager} />
      {isInstallModalOpen && <PWAInstallModal onClose={() => setIsInstallModalOpen(false)} />}
      <OfflineIndicator /><UpdateNotificationToast />
      <EdgeSyncManagerModal isOpen={isSyncHubOpen} onClose={() => setIsSyncHubOpen(false)} apps={apps} installedApps={installedMap} onForcePurgeCache={handleForcePurgeCache} onRefreshRegistry={()=>{}} />
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} installedCount={Object.keys(installedMap).length} onOpenSyncHub={() => setIsSyncHubOpen(true)} />
      <CommandPalette apps={apps} installedMap={installedMap} onOpenDetails={a=>openAppDetails(a)} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onInstall={handleInstallApp} isOpen={commandOpen} onClose={()=>setCommandOpen(false)} />
      <button onClick={()=>setCommandOpen(true)} className="fixed bottom-[88px] right-4 md:hidden z-40 w-12 h-12 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition"><Search className="w-5 h-5" /></button>
    </div>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AdaptiveDeviceWrapper>
        <ErrorBoundary><AppStoreContent /></ErrorBoundary>
      </AdaptiveDeviceWrapper>
    </SafeAreaProvider>
  );
}