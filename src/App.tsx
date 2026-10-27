import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Edit3, Ban, CheckCircle } from 'lucide-react';
import { APPS_DATA } from './data/appsData';
import { AppItem, CategoryType, DevicePlatform, InstalledAppState, DeletedAppAuditItem } from './types';
import { MySubmissionsView } from './components/MySubmissionsView';
import { ManagerPendingView } from './components/ManagerPendingView';
import { MyAppsDashboard } from './components/MyAppsDashboard';
import { TrashModal, addToTrash } from './components/TrashManager';
import { OfflineIndicator, UpdateNotificationToast } from './components/OfflinePWA';
import { TopBar } from './components/TopBar';
import { AppCard } from './components/AppCard';
import { AppDetailModal } from './components/AppDetailModal';
import { AppCompareView } from './components/AppCompareView';
import { LibraryView } from './components/LibraryView';
import { DevSubmitModal } from './components/DevSubmitModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { DirectInstallBanner } from './components/DirectInstallBanner';
import { ManagerAuthModal } from './components/ManagerAuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { EdgeSyncManagerModal } from './components/EdgeSyncManagerModal';
import { AdaptiveDeviceWrapper } from './components/AdaptiveDeviceWrapper';
import { SafeAreaProvider } from './context/SafeAreaContext';
import { usePWAInstall } from './hooks/usePWAInstall';
import { resolveAppMedia } from './utils/media';
import { useSupabaseSearch } from './hooks/useSupabaseSearch';
import { CommandPalette } from './components/CommandPalette';
import { DiscoverView } from './components/DiscoverView';
import { AppsSearchBar } from './components/AppsSearchBar';
import { supabase } from './lib/supabase';
import { useInstallAnalytics } from './hooks/useInstallAnalytics';
import ReportPortal from './components/ReportPortal';
import ManagerReports from './components/ManagerReports';
import { EditAppModal } from './components/EditAppModal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { AnnouncementBanner, AnnouncementManager } from './components/AnnouncementBanner';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';

const PAGE_SIZE = 24;

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

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(()=>{ const id=setTimeout(()=>setDebounced(value), delay); return ()=>clearTimeout(id); }, [value, delay]);
  return debounced;
}

// FIX 1+4: Real thumbnails with thum.io (mshots blocked on Vercel) + unique fallback
function getUniqueThumbnail(row: any) {
  if (row.thumbnail_url && row.thumbnail_url.startsWith('http')) return row.thumbnail_url;
  if (row.download_url && row.download_url.startsWith('http')) return row.download_url;
  if (row.hero_image && row.hero_image.startsWith('http')) return row.hero_image;
  // Rent Master + Ivory Labyrinth have live_web_url only -> real screenshot
  if (row.live_web_url && row.live_web_url.startsWith('http')) {
    return `https://image.thum.io/get/width/600/crop/400/noanimate/${row.live_web_url}`;
  }
  if (row.live_app_url && row.live_app_url.startsWith('http')) {
    return `https://image.thum.io/get/width/600/crop/400/noanimate/${row.live_app_url}`;
  }
  const seed = (row.uuid || row.id || row.title || row.jamz || 'prism').toString();
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/400`;
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
        const { data, error } = await supabase.from('apps').select('*').eq('status','approved').order('created_at', { ascending: false }).limit(200);
        console.log('SUPABASE apps fetch approved', { data, error });
        if (error) { console.log('Supabase error', error); return; }
        if (!data || data.length === 0) { console.log('No approved apps yet'); return; }
        const permanentApps: AppItem[] = data.map((row: any) => ({
          id: row.uuid || row.id,
          name: row.title || row.jamz || row.name || 'Untitled',
          tagline: row.tagline || row.description || row.jamz || 'User published',
          developer: row.studio || row.developer_name || 'Indie Engineer',
          developerVerified: true,
          category: row.category || row.blty || 'Labyrinth',
          price: 0, priceFormatted: 'Free', priceModel: 'Free' as any, rating: 5.0, reviewCount: 1,
          downloadsCount: String(row.downloads || row.install_count || 1),
          sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0',
          minOS: 'Android 12 / iOS 16 / macOS / Web',
          supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'] as any,
          heroImage: getUniqueThumbnail(row),
          thumbnail: getUniqueThumbnail(row),
          accentColor: '#38bdf8',
          summary: row.description || row.title || row.jamz || '',
          features: [row.changelog || 'Live'],
          offlineCapable: true, zeroTrackers: true, openSource: false, isUserUploaded: true,
          ownerId: row.owner_uid, owner_uid: row.owner_uid, owner_id: row.owner_uid,
          uploadedAt: 'Just now',
          liveAppUrl: row.live_web_url || row.live_app_url || row.download_url || '',
          websiteUrl: row.live_web_url || row.download_url || '',
          sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name,
          privacyGrade: 'A+', permissions: [], dataCollected: [],
          versionHistory: [{ version: row.version || '1.0.0', releaseDate: row.updated_at || 'Today', sizeMB: row.size_mb || 15, isLatest: true, highlights: [row.changelog||'Live'] } as any],
          reviews: [], sandboxType: 'terminal' as any,
          status: row.status || 'approved',
          studio: row.studio,
          title_raw: row.title,
          jamz_raw: row.jamz,
          raw: row
        } as any));
        // Merge without losing local official apps if supabase empty
        setApps(prev => {
          const map = new Map<string, AppItem>();
          permanentApps.forEach(a => map.set(a.id, a));
          prev.forEach(a => { if (!map.has(a.id)) map.set(a.id, a); });
          return Array.from(map.values()).filter((a:any)=> (a as any).status !== 'deleted');
        });
      } catch (e) { console.log('Supabase load failed', e); } finally { setIsSupabaseSyncing(false); }
    };
    loadPermanentApps();
    try {
      const channel = supabase.channel('apps_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'apps' }, () => { loadPermanentApps(); }).subscribe();
      return () => { try { supabase.removeChannel(channel); } catch {} };
    } catch {}
  }, []);

  const [userUID, setUserUID] = useState(()=> {
    const existing = localStorage.getItem('prism_user_uid');
    if (existing) return existing;
    const backup = localStorage.getItem('prism_user_uid_backup');
    if (backup) return backup;
    const newUid = 'PRISM-UID-' + Math.random().toString(36).substring(2,6).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();
    localStorage.setItem('prism_user_uid', newUid);
    localStorage.setItem('prism_user_uid_backup', newUid);
    return newUid;
  });

  const [isStoreManager, setIsStoreManager] = useState<boolean>(() => { try { return localStorage.getItem('prism_is_store_manager') === 'true'; } catch {} return false; });
  const [showMyApps, setShowMyApps] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isManagerAuthModalOpen, setIsManagerAuthModalOpen] = useState(false);
  const handleUpdateUID = (newUID: string) => { setUserUID(newUID); try { localStorage.setItem('prism_user_uid', newUID); localStorage.setItem('prism_user_uid_backup', newUID); } catch {} };
  const handleSetStoreManager = (status: boolean) => { setIsStoreManager(status); try { localStorage.setItem('prism_is_store_manager', status ? 'true' : 'false'); } catch {} };

  const [currentTab, setCurrentTab] = useState<'discover' | 'apps' | 'compare' | 'library' | 'myapps'>(() => { try { const saved = localStorage.getItem('prism_current_tab'); if (saved && ['discover','apps','compare','library','myapps'].includes(saved)) return saved as any; } catch {} return 'discover'; });
  const [view, setView] = useState<'all' | 'my' | 'featured'>('all');
  const [storeCategory, setStoreCategory] = useState<string>('All');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'test-drive'>('overview');
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [devModalInitialTab, setDevModalInitialTab] = useState<'publish' | 'owner-apps' | 'moderation' | 'guide' | 'audit-log'>('publish');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSyncHubOpen, setIsSyncHubOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [showReportPortal, setShowReportPortal] = useState(false);
  const [reportAppContext, setReportAppContext] = useState<any>(null);
  const [managerTab, setManagerTab] = useState<'all'|'deleted'|'reports'|'analytics'|'announcements'>('all');
  const [editingApp, setEditingApp] = useState<AppItem|null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommandOpen(o => !o); } };
    const onOpenReport = (e:any) => { setReportAppContext(e.detail||null); setShowReportPortal(true); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-report-portal' as any, onOpenReport);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-report-portal' as any, onOpenReport); };
  }, []);

  const handleForcePurgeCache = async () => {
    if (typeof window !== 'undefined' && 'caches' in window) { try { const names = await caches.keys(); await Promise.all(names.map(n => caches.delete(n))); } catch {} }
    try { const raw = localStorage.getItem('prism_user_uploaded_apps'); const saved: AppItem[] = raw ? JSON.parse(raw) : []; const ids = new Set(saved.map(a => a.id)); const fresh = [...saved, ...APPS_DATA.filter(a => !ids.has(a.id))]; setApps(fresh); } catch {}
  };
  const [deletedAppsLog, setDeletedAppsLog] = useState<DeletedAppAuditItem[]>(() => { try { const s = localStorage.getItem('prism_deleted_apps_log'); if (s) return JSON.parse(s); } catch {} return []; });
  const { isInstallable, isStandalone, install } = usePWAInstall();
  const handleDirectInstall = useCallback(async () => {
    if (isStandalone) return;
    if (isInstallable) { const ok = await install(); if (ok) return; }
    setIsInstallModalOpen(true);
  }, [isInstallable, isStandalone, install]);

  const [compareAppA, setCompareAppA] = useState<string | undefined>(undefined);
  const [compareAppB, setCompareAppB] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedDevice, setSelectedDevice] = useState<DevicePlatform>('All');
  const [selectedPriceModel, setSelectedPriceModel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'downloads' | 'size'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const { supabaseResults } = useSupabaseSearch(debouncedSearch, apps.length);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const openAppDetails = useCallback((app: AppItem, tab: 'overview' | 'test-drive' = 'overview') => { setModalInitialTab(tab); setSelectedApp(app); }, []);
  const [installedMap, setInstalledMap] = useState<Record<string, InstalledAppState>>(() => {
    try { const saved = localStorage.getItem('prism_installed_map'); if (saved) return JSON.parse(saved); } catch {}
    return { 'harmonics-synth-pro': { appId: 'harmonics-synth-pro', installedVersion: '3.4.2', installedAt: 'Yesterday', storageUsedMB: 38.4, status: 'installed', progress: 100 }, 'cipher-notes-studio': { appId: 'cipher-notes-studio', installedVersion: '3.0.2', installedAt: '3 days ago', storageUsedMB: 15.6, status: 'installed', progress: 100 } };
  });

  useEffect(() => { try { localStorage.setItem('prism_current_tab', currentTab); } catch {} }, [currentTab]);
  useEffect(() => { try { localStorage.setItem('prism_installed_map', JSON.stringify(installedMap)); } catch {} }, [installedMap]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [debouncedSearch, selectedCategory, selectedDevice, selectedPriceModel, sortBy, currentTab, view, storeCategory]);

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
    if (supabase) { supabase.from('apps').update({ status: 'deleted' } as any).eq('uuid', appId).then(()=>{}); }
    setApps(prev => prev.filter(a => a.id !== appId)); setInstalledMap(prev => { const c = { ...prev }; delete c[appId]; return c; }); if (selectedApp?.id === appId) setSelectedApp(null);
  }, [apps, selectedApp]);
  const handleRestoreApp = useCallback((appToRestore: AppItem) => { setApps(prev => prev.some(a => a.id === appToRestore.id) ? prev : [appToRestore, ...prev]); setDeletedAppsLog(prev => prev.filter(d => d.originalApp.id !== appToRestore.id)); }, []);
  const handleBanUser = useCallback(async (ownerId: string) => {
    if(!confirm(`Ban user ${ownerId}?`)) return;
    if (supabase) await supabase.from('banned_users').insert({ id: ownerId, reason: 'Spam', banned_by: userUID } as any);
    alert('User banned');
  }, [userUID]);

  const baseApps = useMemo(() => apps.filter((a:any) => (a as any).status !== 'deleted'), [apps]);
  const allApps = useMemo(() => { const map = new Map<string, AppItem>(); baseApps.forEach(a => { if (a?.id && !map.has(a.id)) map.set(a.id, a); }); return Array.from(map.values()); }, [baseApps]);
  const myApps = useMemo(() => baseApps.filter((a:any) => { const owner = (a as any).ownerId || (a as any).owner_uid || (a as any).owner_id; return owner === userUID; }), [baseApps, userUID]);
  const activeFilterCount = useMemo(() => [selectedCategory !== 'All', selectedDevice !== 'All', selectedPriceModel !== 'All', sortBy !== 'rating', storeCategory!=='All', view!=='all'].filter(Boolean).length, [selectedCategory, selectedDevice, selectedPriceModel, sortBy, storeCategory, view]);

  const filteredApps = useMemo(() => {
    if (view === 'my') return myApps;
    let list = view === 'featured' ? baseApps.filter((a:any)=> (a as any).is_featured || (a as any).isUserUploaded) : [...allApps];
    if (storeCategory !== 'All') { list = list.filter((a:any)=> { const cat = (a.category || '').toLowerCase(); return cat === storeCategory.toLowerCase() || cat.includes(storeCategory.toLowerCase()); }); }
    const seen = new Set<string>();
    return list.filter(app => {
      if (!app?.id || seen.has(app.id)) return false;
      seen.add(app.id);
      const q = debouncedSearch.toLowerCase().trim();
      const haystack = `${app.name} ${(app as any).title_raw||''} ${(app as any).jamz_raw||''} ${app.tagline} ${app.developer} ${(app as any).studio||''} ${app.category} ${app.summary} ${(app as any).liveAppUrl||''}`.toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const matchesDevice = selectedDevice === 'All' || app.supportedDevices.includes(selectedDevice);
      const matchesPrice = selectedPriceModel === 'All' || app.priceModel === selectedPriceModel;
      return matchesSearch && matchesCategory && matchesDevice && matchesPrice;
    }).sort((a,b) => { if (sortBy === 'rating') return b.rating - a.rating; if (sortBy === 'size') return a.sizeMB - b.sizeMB; return parseInt((b.downloadsCount||'0').replace(/[^0-9]/g,'')) - parseInt((a.downloadsCount||'0').replace(/[^0-9]/g,'')); });
  }, [allApps, baseApps, myApps, view, debouncedSearch, selectedCategory, selectedDevice, selectedPriceModel, sortBy, storeCategory]);

  const paginatedApps = useMemo(() => filteredApps.slice(0, visibleCount), [filteredApps, visibleCount]);
  const hasMore = visibleCount < filteredApps.length;
  const featuredApp = useMemo(() => allApps.find(a => (a as any).editorialHighlight) || allApps[0], [allApps]);
  const becauseApps = useMemo(() => allApps.filter(a => !installedMap[a.id]).slice(0, 8), [allApps, installedMap]);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisibleCount(v => v + PAGE_SIZE); }, { rootMargin: '600px' });
    const el = loadMoreRef.current; if (el) obs.observe(el); return () => obs.disconnect();
  }, [hasMore]);

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 antialiased">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_-20%,rgba(99,102,241,0.15),transparent),radial-gradient(40%_40%_at_100%_0%,rgba(168,85,247,0.12),transparent)] pointer-events-none" />
      <AnnouncementBanner />
      <TopBar currentTab={currentTab} onSelectTab={setCurrentTab} onOpenDevModal={() => { setDevModalInitialTab('publish'); setIsDevModalOpen(true); }} onOpenOwnerGuide={() => { setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} onOpenInstallModal={() => setIsInstallModalOpen(true)} onDirectInstall={handleDirectInstall} onOpenSyncHub={() => setIsSyncHubOpen(true)} isStandalone={isStandalone} installedCount={Object.keys(installedMap).length} userUID={userUID} isStoreManager={isStoreManager} onOpenManagerAuth={() => setIsManagerAuthModalOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-28 md:pb-8">
        <DirectInstallBanner onOpenManualModal={() => setIsInstallModalOpen(true)} />
        {isSupabaseSyncing && <div className="mb-4 px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-full text-xs text-indigo-200 flex items-center gap-2 w-fit"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Syncing permanent apps...</span></div>}
        {isStoreManager && (
          <div className="space-y-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl mb-6">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="font-bold text-sm">Manager Console (Owner Only) - UID {userUID}</h2>
              <div className="flex gap-2">
                <button onClick={()=>setManagerTab('all')} className={`px-3 py-1 rounded-full text-xs ${managerTab==='all'?'bg-white text-black':'bg-white/10'}`}>All</button>
                <button onClick={()=>setManagerTab('deleted')} className={`px-3 py-1 rounded-full text-xs ${managerTab==='deleted'?'bg-white text-black':'bg-white/10'}`}>Deleted</button>
                <button onClick={()=>setManagerTab('reports')} className={`px-3 py-1 rounded-full text-xs ${managerTab==='reports'?'bg-amber-200 text-amber-900':'bg-white/10'}`}>Reports</button>
                <button onClick={()=>setManagerTab('analytics')} className={`px-3 py-1 rounded-full text-xs ${managerTab==='analytics'?'bg-white text-black':'bg-white/10'}`}>Analytics</button>
                <button onClick={()=>setManagerTab('announcements')} className={`px-3 py-1 rounded-full text-xs ${managerTab==='announcements'?'bg-white text-black':'bg-white/10'}`}>Announce</button>
              </div>
            </div>
            {managerTab==='reports' && <ManagerReports isManager={isStoreManager} />}
            {managerTab==='analytics' && <AnalyticsDashboard isManager={isStoreManager} />}
            {managerTab==='announcements' && <AnnouncementManager isManager={isStoreManager} />}
            {managerTab==='all' && <ManagerPendingView managerKey={userUID} />}
          </div>
        )}

        {currentTab === 'discover' && (<DiscoverView featuredApp={featuredApp} becauseApps={becauseApps} filteredApps={filteredApps} installedMap={installedMap} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={(a)=>openAppDetails(a,'test-drive')} onOpenManualModal={() => setIsInstallModalOpen(true)} />)}

        {currentTab === 'apps' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={()=>setView('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='all' ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>All Software ({allApps.length})</button>
              <button onClick={()=>setView('featured')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='featured' ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>Featured</button>
              <button onClick={()=>setView('my')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='my' ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>My Uploads ({myApps.length})</button>
              <span className="text-[10px] text-white/30 ml-2">UID: {userUID}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['All','Labyrinth','Game','Tool','Utility','Other'].map(c=><button key={c} onClick={()=>setStoreCategory(c)} className={`px-3 py-1.5 rounded-full text-xs border ${storeCategory===c?'bg-white text-black border-white':'bg-white/5 border-white/10 text-white/60'}`}>{c}</button>)}
            </div>
            <AppsSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} selectedPriceModel={selectedPriceModel} setSelectedPriceModel={setSelectedPriceModel} sortBy={sortBy} setSortBy={setSortBy} showFilters={showFilters} setShowFilters={setShowFilters} filteredCount={filteredApps.length} categories={['All', ...Array.from(new Set(APPS_DATA.map(a => a.category)))]} activeFilterCount={activeFilterCount} onOpenCommand={() => setCommandOpen(true)} />
            {filteredApps.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3"><Search className="w-5 h-5 text-slate-500" /></div>
                <p className="text-sm font-medium">{view==='my' ? 'You have no uploads' : 'No apps found'}</p>
                <p className="text-xs text-slate-500 mt-1">Search title + studio: try "Rent Master" or "Digital Remote"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedApps.map((app, idx) => {
                  const isMine = (app as any).ownerId === userUID || (app as any).owner_uid === userUID;
                  const isApproved = (app as any).status === 'approved';
                  return (
                    <div key={app.id} className="relative group">
                      <AppCard index={idx} app={app} installedState={installedMap[app.id]} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={a=>openAppDetails(a,'test-drive')} />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {isApproved && <div className="px-2 py-0.5 bg-emerald-400 text-black text-[10px] font-bold rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved</div>}
                      </div>
                      {isMine && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={()=>setEditingApp(app)} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow hover:scale-105 transition" title="Edit (you own this)"><Edit3 className="w-4 h-4"/></button>
                          {isStoreManager && <button onClick={()=>handleBanUser((app as any).ownerId||(app as any).owner_uid)} className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"><Ban className="w-4 h-4"/></button>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center">
                  {hasMore ? (<button onClick={()=>setVisibleCount(v=>v+PAGE_SIZE)} className="h-10 px-5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 rounded-full text-xs font-medium transition flex items-center gap-2"><Loader2 className="w-3.5 h-3.5" />Load More ({filteredApps.length - visibleCount} left)</button>) : (<span className="text-[11px] text-slate-500">End - {filteredApps.length} apps</span>)}
                </div>
              </div>
            )}
          </div>
        )}
        {currentTab === 'compare' && <AppCompareView apps={allApps} initialAppAId={compareAppA} initialAppBId={compareAppB} onOpenDetails={openAppDetails} />}
        {currentTab === 'library' && <LibraryView apps={allApps} installedMap={installedMap} onOpenDetails={openAppDetails} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onUninstall={handleUninstallApp} onUpdateApp={handleUpdateApp} onUpdateAll={handleUpdateAll} />}
        {currentTab === 'myapps' && <MySubmissionsView userUID={userUID} />}
      </main>
      {selectedApp && <AppDetailModal key={`${selectedApp.id}-${modalInitialTab}`} app={selectedApp} initialTab={modalInitialTab} installedState={installedMap[selectedApp.id]} onClose={() => setSelectedApp(null)} onInstall={handleInstallApp} onUninstall={handleUninstallApp} onStartCompare={handleStartCompare} onAddReview={handleAddReview} onAppDeleted={handleAppDeleted} onOpenOwnerGuide={() => { setSelectedApp(null); setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} allApps={allApps} />}
      {isDevModalOpen && <DevSubmitModal onClose={() => setIsDevModalOpen(false)} apps={allApps} initialTab={devModalInitialTab} onAppPublished={handleAppPublished} onAppDeleted={handleAppDeleted} onRestoreApp={handleRestoreApp} deletedAppsLog={deletedAppsLog} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} onUpdateUID={handleUpdateUID} />}
      <ManagerAuthModal isOpen={isManagerAuthModalOpen} onClose={() => setIsManagerAuthModalOpen(false)} userUID={userUID} onUpdateUID={handleUpdateUID} isStoreManager={isStoreManager} onSetStoreManager={handleSetStoreManager} />
      {isInstallModalOpen && <PWAInstallModal onClose={() => setIsInstallModalOpen(false)} />}
      <MyAppsDashboard isOpen={showMyApps} onClose={()=>setShowMyApps(false)} apps={allApps} userUID={userUID} isManager={isStoreManager} onEdit={(app:any)=>setEditingApp(app)} onDelete={(app:any)=>{ const d = allApps.find((a:any)=>a.id===app.id); if(d) addToTrash(d, 'Deleted', userUID); setApps((prev:any)=>prev.filter((a:any)=>a.id!==app.id)); }} onSelectApp={(app:any)=>setSelectedApp(app)} />
      <TrashModal isOpen={showTrash} onClose={()=>setShowTrash(false)} onRestore={(app:any)=>{ setApps((prev:any)=>[app, ...prev]); }} />
      <OfflineIndicator /><UpdateNotificationToast />
      <PWAUpdatePrompt />
      <EdgeSyncManagerModal isOpen={isSyncHubOpen} onClose={() => setIsSyncHubOpen(false)} apps={allApps} installedApps={installedMap} onForcePurgeCache={handleForcePurgeCache} onRefreshRegistry={()=>{}} />
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} installedCount={Object.keys(installedMap).length} onOpenSyncHub={() => setIsSyncHubOpen(true)} />
      <CommandPalette apps={allApps} installedMap={installedMap} onOpenDetails={a=>openAppDetails(a)} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onInstall={handleInstallApp} isOpen={commandOpen} onClose={()=>setCommandOpen(false)} />
      <button onClick={()=>setCommandOpen(true)} className="fixed bottom-[88px] right-4 md:hidden z-40 w-12 h-12 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition"><Search className="w-5 h-5" /></button>
      <ReportPortal isOpen={showReportPortal} onClose={()=>setShowReportPortal(false)} appContext={reportAppContext} currentUserId={userUID} />
      {editingApp && <EditAppModal app={editingApp} isOpen={!!editingApp} onClose={()=>setEditingApp(null)} onSaved={()=>{ setEditingApp(null); }} />}
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