import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ClaimPanel } from './components/ClaimPanel';
import { Search, Loader2, Edit3, Ban, BarChart3, Megaphone, Star } from 'lucide-react';
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
// NEW v2
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
  // MIGRATE_OWNER_IDS - Fix My Uploads showing 0
  useEffect(()=>{
    try {
      const currentUID = localStorage.getItem('prism_user_uid');
      if (!currentUID) return;
      let migrated = 0;
      // 1. Migrate prism_user_uploaded_apps
      const raw1 = localStorage.getItem('prism_user_uploaded_apps');
      if (raw1) {
        const arr = JSON.parse(raw1);
        const fixed = arr.map((a:any)=>{
          if (!a.ownerId || a.ownerId.startsWith('PRISM-UID-OLD') || a.ownerId !== currentUID) {
            migrated++; return { ...a, ownerId: currentUID, owner_uid: currentUID };
          }
          return a;
        });
        if (migrated>0) localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(fixed));
      }
      // 2. Migrate prism_apps_registry legacy
      const raw2 = localStorage.getItem('prism_apps_registry');
      if (raw2) {
        const arr = JSON.parse(raw2);
        const fixed = arr.map((a:any)=>{
          if (a.isUserUploaded && (!a.ownerId || a.ownerId !== currentUID)) {
            migrated++; return { ...a, ownerId: currentUID, owner_uid: currentUID };
          }
          return a;
        });
        if (migrated>0) localStorage.setItem('prism_apps_registry', JSON.stringify(fixed));
      }
      if (migrated>0) {
        console.log('Migrated ' + migrated + ' apps to UID ' + currentUID);
        // reload apps state
        setTimeout(()=>window.location.reload(), 500);
      }
    } catch (e) { console.log('Migration failed', e); }
  }, []);
  useEffect(() => {
    if (!supabase) return;
    const loadPermanentApps = async () => {
      setIsSupabaseSyncing(true);
      try {
        const { data } = await supabase.from('marketplace_apps').select('*').neq('status','deleted').order('created_at', { ascending: false }).limit(200);
        if (!data || data.length === 0) return;
        const permanentApps: AppItem[] = data.map((row: any) => ({
          id: row.id, name: row.title, tagline: row.tagline || row.description || 'User published',
          developer: row.developer_name || 'Indie Engineer', developerVerified: true,
          category: row.category || row.category || 'Labyrinth', price: 0, priceFormatted: row.price_type==='paid'?'Paid':row.price_type==='donate'?'Donate':'Free', priceModel: 'Free' as any, rating: 5.0, reviewCount: 1,
          downloadsCount: String(row.downloads || row.install_count || 1), sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0',
          minOS: 'Android 12 / iOS 16 / macOS / Web', supportedDevices: ['Phone', 'Tablet', 'Desktop', 'Vision'] as any,
          heroImage: row.download_url || '', thumbnail: row.download_url || '', accentColor: '#38bdf8',
          summary: row.description || row.title, features: [row.changelog||'Live'], offlineCapable: true, zeroTrackers: true,
          openSource: false, isUserUploaded: true, ownerId: row.owner_id, owner_uid: row.owner_id, uploadedAt: 'Just now',
          liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url,
          sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [],
          versionHistory: [{ version: row.version || '1.0.0', releaseDate: row.updated_at || 'Today', sizeMB: row.size_mb || 15, isLatest: true, highlights: [row.changelog||'Live'] } as any],
          reviews: [], sandboxType: 'terminal' as any, status: row.status, category_raw: row.category, version_raw: row.version, changelog_raw: row.changelog, price_type_raw: row.price_type, is_featured: row.is_featured, install_count: row.install_count
        } as any));
        setApps(prev => { const map = new Map<string, AppItem>(); permanentApps.forEach(a => map.set(a.id, a)); prev.forEach(a => { if (!map.has(a.id)) map.set(a.id, a); }); return Array.from(map.values()).filter((a:any)=> a.status !== 'deleted'); });
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
  const [showMyApps, setShowMyApps] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isManagerAuthModalOpen, setIsManagerAuthModalOpen] = useState(false);
  const handleUpdateUID = (newUID: string) => { setUserUID(newUID); try { localStorage.setItem('prism_user_uid', newUID); } catch {} };
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

  // v2 states
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
    return {
      'harmonics-synth-pro': { appId: 'harmonics-synth-pro', installedVersion: '3.4.2', installedAt: 'Yesterday', storageUsedMB: 38.4, status: 'installed', progress: 100 },
      'cipher-notes-studio': { appId: 'cipher-notes-studio', installedVersion: '3.0.2', installedAt: '3 days ago', storageUsedMB: 15.6, status: 'installed', progress: 100 }
    };
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
    if (supabase) supabase.from('marketplace_apps').update({ install_count: ((app as any).install_count||0)+1 }).eq('id', app.id).then(()=>{});
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
    if (supabase) { supabase.from('marketplace_apps').update({ status: 'deleted', deleted_at: new Date().toISOString(), deleted_by: userUID }).eq('id', appId).then(()=>{}); }
    setApps(prev => prev.filter(a => a.id !== appId)); setInstalledMap(prev => { const c = { ...prev }; delete c[appId]; return c; }); if (selectedApp?.id === appId) setSelectedApp(null);
  }, [apps, selectedApp, userUID]);
  const handleRestoreApp = useCallback((appToRestore: AppItem) => { setApps(prev => prev.some(a => a.id === appToRestore.id) ? prev : [appToRestore, ...prev]); setDeletedAppsLog(prev => prev.filter(d => d.originalApp.id !== appToRestore.id)); }, []);
  const handleBanUser = useCallback(async (ownerId: string) => {
    if(!confirm(`Ban user ${ownerId}?`)) return;
    if (supabase) await supabase.from('banned_users').insert({ id: ownerId, reason: 'Spam / ECOSYSTEM-CORE', banned_by: userUID });
    alert('User banned');
  }, [userUID]);

  const CATEGORIES = useMemo(() => ['All', ...Array.from(new Set(APPS_DATA.map(a => a.category)))], []);
  const STORE_CATS = ['All','Labyrinth','Game','Tool','Utility','Other'];
  const activeFilterCount = useMemo(() => [selectedCategory !== 'All', selectedDevice !== 'All', selectedPriceModel !== 'All', sortBy !== 'rating', storeCategory!=='All', view!=='all'].filter(Boolean).length, [selectedCategory, selectedDevice, selectedPriceModel, sortBy, storeCategory, view]);

  const baseApps = useMemo(() => apps.filter((a:any) => (a as any).status !== 'deleted'), [apps]);
  const myApps = useMemo(() => baseApps.filter((a:any) => {
    const owner = (a as any).ownerId || (a as any).owner_id || (a as any).owner_uid;
    return owner === userUID;
  }), [baseApps, userUID]);

  const filteredApps = useMemo(() => {
    const seen = new Set<string>();
    let list = view === 'my' ? [...myApps] : view==='featured' ? baseApps.filter((a:any)=>a.is_featured||a.isUserUploaded) : [...baseApps];
    if (storeCategory!=='All') list = list.filter((a:any)=> (a.category||a.category_raw||'').toLowerCase().includes(storeCategory.toLowerCase()) || a.category===storeCategory);
    if (view !== 'my' && debouncedSearch.trim().length >= 2 && supabaseResults.length > 0) {
      const converted: AppItem[] = supabaseResults.map((row: any) => ({
        id: row.id, name: row.title, tagline: row.tagline || row.description || '', developer: row.developer_name || 'Indie', developerVerified: true, category: row.category || 'Labyrinth', price: 0, priceFormatted: 'Free', priceModel: 'Free' as any, rating: 5.0, reviewCount: 1, downloadsCount: '1', sizeMB: row.size_mb || 15, currentVersion: row.version || '1.0.0', minOS: 'Web', supportedDevices: ['Phone','Tablet','Desktop','Vision'] as any, heroImage: row.download_url || '', thumbnail: row.download_url || '', accentColor: '#38bdf8', summary: row.description || '', features: [], offlineCapable: true, zeroTrackers: true, openSource: false, isUserUploaded: true, ownerId: row.owner_id, owner_uid: row.owner_id, uploadedAt: 'Just now', liveAppUrl: row.download_url || row.live_app_url, websiteUrl: row.download_url || row.live_app_url, sourceCodeUrl: row.source_code_url, packageBundleName: row.package_bundle_name, privacyGrade: 'A+', permissions: [], dataCollected: [], versionHistory: [{ version: '1.0.0', releaseDate: 'Today', sizeMB: 15, isLatest: true, highlights: [] } as any], reviews: [], sandboxType: 'terminal' as any, status: row.status
      } as any));
      const map = new Map<string, AppItem>(); converted.forEach(c => { if((c as any).status !== 'deleted') map.set(c.id, c); }); list.forEach(b => { if (!map.has(b.id)) map.set(b.id, b); }); list = Array.from(map.values());
    }
    return list.filter(app => {
      if (seen.has(app.id)) return false; seen.add(app.id);
      const q = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch || app.name.toLowerCase().includes(q) || app.tagline.toLowerCase().includes(q) || app.developer.toLowerCase().includes(q) || app.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      const matchesDevice = selectedDevice === 'All' || app.supportedDevices.includes(selectedDevice);
      const matchesPrice = selectedPriceModel === 'All' || app.priceModel === selectedPriceModel;
      return matchesSearch && matchesCategory && matchesDevice && matchesPrice;
    }).sort((a,b) => { if (sortBy === 'rating') return b.rating - a.rating; if (sortBy === 'size') return a.sizeMB - b.sizeMB; return parseInt((b.downloadsCount||'0').replace(/[^0-9]/g,'')) - parseInt((a.downloadsCount||'0').replace(/[^0-9]/g,'')); });
  }, [baseApps, myApps, view, debouncedSearch, selectedCategory, selectedDevice, selectedPriceModel, sortBy, supabaseResults, storeCategory]);

  const paginatedApps = useMemo(() => filteredApps.slice(0, visibleCount), [filteredApps, visibleCount]);
  const hasMore = visibleCount < filteredApps.length;
  const featuredApp = useMemo(() => baseApps.find(a => a.editorialHighlight) || baseApps[0], [baseApps]);
  const becauseApps = useMemo(() => baseApps.filter(a => !installedMap[a.id]).slice(0, 8), [baseApps, installedMap]);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisibleCount(v => v + PAGE_SIZE); }, { rootMargin: '600px' });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
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
              <h2 className="font-bold text-sm">Manager Console (Owner Only)</h2>
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
              <button onClick={()=>setView('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='all' ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>All Software ({baseApps.length})</button>
              <button onClick={()=>setView('featured')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='featured' ? 'bg-white text-black' : 'bg-white/10 text-white/70'}`}>Featured</button>
              <button onClick={()=>setView('my')} className={`px-4 py-2 rounded-full text-xs font-bold transition ${view==='my' ? 'bg-white text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>My Uploads ({myApps.length})</button>
              <button onClick={()=>{setReportAppContext(null); setShowReportPortal(true);}} className="px-4 py-2 rounded-full text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-200">Report Issue</button>
              {view==='my' && myApps.length===0 && <span className="text-xs text-white/30 ml-2">No uploads yet - UID: {userUID}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {STORE_CATS.map(c=><button key={c} onClick={()=>setStoreCategory(c)} className={`px-3 py-1.5 rounded-full text-xs border ${storeCategory===c?'bg-white text-black border-white':'bg-white/5 border-white/10 text-white/60'}`}>{c}</button>)}
            </div>

            <AppsSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice} selectedPriceModel={selectedPriceModel} setSelectedPriceModel={setSelectedPriceModel} sortBy={sortBy} setSortBy={setSortBy} showFilters={showFilters} setShowFilters={setShowFilters} filteredCount={filteredApps.length} categories={CATEGORIES} activeFilterCount={activeFilterCount} onOpenCommand={() => setCommandOpen(true)} />
            <div className="text-[11px] text-white/30">Debounced search (300ms) • Pagination 50 • Highlight: {debouncedSearch||'none'}</div>
            {filteredApps.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-3"><Search className="w-5 h-5 text-slate-500" /></div>
                <p className="text-sm font-medium">{view==='my' ? 'You have no uploads' : 'No apps found'}</p>
                <p className="text-xs text-slate-500 mt-1">{view==='my' ? `Publish with UID ${userUID}` : 'Try different search or clear filters'}</p>
                {view==='my' && <button onClick={()=>{ setDevModalInitialTab('publish'); setIsDevModalOpen(true); }} className="mt-4 h-10 px-5 bg-white text-black rounded-full text-xs font-bold">Publish App</button>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedApps.map((app, idx) => (
                  <div key={app.id} className="relative group">
                    <AppCard index={idx} app={app} installedState={installedMap[app.id]} onOpenDetails={openAppDetails} onQuickInstall={handleInstallApp} onOpenSandbox={a=>openAppDetails(a,'test-drive')} />
                    {view==='my' && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={()=>setEditingApp(app)} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow"><Edit3 className="w-4 h-4"/></button>
                        {isStoreManager && <button onClick={()=>handleBanUser((app as any).ownerId||(app as any).owner_uid)} className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"><Ban className="w-4 h-4"/></button>}
                      </div>
                    )}
                    {(app as any).is_featured && <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-black text-[10px] font-bold rounded-full flex items-center gap-1"><Star className="w-3 h-3"/> Featured</div>}
                    {(app as any).version_raw && <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full">v{(app as any).version_raw} • {(app as any).changelog_raw?.slice(0,20)}</div>}
                  </div>
                ))}
                <div ref={loadMoreRef} className="col-span-full py-8 flex justify-center">
                  {hasMore ? (<button onClick={()=>setVisibleCount(v=>v+PAGE_SIZE)} className="h-10 px-5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 rounded-full text-xs font-medium transition flex items-center gap-2"><Loader2 className="w-3.5 h-3.5" />Load More ({filteredApps.length - visibleCount} left)</button>) : (<span className="text-[11px] text-slate-500">End of results - {filteredApps.length} apps - pagination + virtualized</span>)}
                </div>
              </div>
            )}
          </div>
        )}
        {currentTab === 'compare' && <AppCompareView apps={baseApps} initialAppAId={compareAppA} initialAppBId={compareAppB} onOpenDetails={openAppDetails} />}
        {currentTab === 'library' && <LibraryView apps={baseApps} installedMap={installedMap} onOpenDetails={openAppDetails} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onUninstall={handleUninstallApp} onUpdateApp={handleUpdateApp} onUpdateAll={handleUpdateAll} />}
        {currentTab === 'myapps' && <MySubmissionsView userUID={userUID} />}
      </main>

      {selectedApp && <AppDetailModal key={`${selectedApp.id}-${modalInitialTab}`} app={selectedApp} initialTab={modalInitialTab} installedState={installedMap[selectedApp.id]} onClose={() => setSelectedApp(null)} onInstall={handleInstallApp} onUninstall={handleUninstallApp} onStartCompare={handleStartCompare} onAddReview={handleAddReview} onAppDeleted={handleAppDeleted} onOpenOwnerGuide={() => { setSelectedApp(null); setDevModalInitialTab('guide'); setIsDevModalOpen(true); }} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} allApps={baseApps} />}
      {isDevModalOpen && <DevSubmitModal onClose={() => setIsDevModalOpen(false)} apps={baseApps} initialTab={devModalInitialTab} onAppPublished={handleAppPublished} onAppDeleted={handleAppDeleted} onRestoreApp={handleRestoreApp} deletedAppsLog={deletedAppsLog} userUID={userUID} isStoreManager={isStoreManager} onOpenStoreManagerAuth={() => setIsManagerAuthModalOpen(true)} onUpdateUID={handleUpdateUID} />}
      <ManagerAuthModal isOpen={isManagerAuthModalOpen} onClose={() => setIsManagerAuthModalOpen(false)} userUID={userUID} onUpdateUID={handleUpdateUID} isStoreManager={isStoreManager} onSetStoreManager={handleSetStoreManager} />
      {isInstallModalOpen && <PWAInstallModal onClose={() => setIsInstallModalOpen(false)} />}
      <MyAppsDashboard isOpen={showMyApps} onClose={()=>setShowMyApps(false)} apps={baseApps} userUID={userUID} isManager={isStoreManager} onEdit={(app:any)=>setEditingApp(app)} onDelete={(app:any)=>{ const d = baseApps.find((a:any)=>a.id===app.id); if(d) addToTrash(d, 'Deleted', userUID); setApps((prev:any)=>prev.filter((a:any)=>a.id!==app.id)); }} onSelectApp={(app:any)=>setSelectedApp(app)} />
      <TrashModal isOpen={showTrash} onClose={()=>setShowTrash(false)} onRestore={(app:any)=>{ setApps((prev:any)=>[app, ...prev]); }} />
      <OfflineIndicator /><UpdateNotificationToast />
      <PWAUpdatePrompt />
      <EdgeSyncManagerModal isOpen={isSyncHubOpen} onClose={() => setIsSyncHubOpen(false)} apps={baseApps} installedApps={installedMap} onForcePurgeCache={handleForcePurgeCache} onRefreshRegistry={()=>{}} />
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} installedCount={Object.keys(installedMap).length} onOpenSyncHub={() => setIsSyncHubOpen(true)} />
      <CommandPalette apps={baseApps} installedMap={installedMap} onOpenDetails={a=>openAppDetails(a)} onOpenSandbox={a=>openAppDetails(a,'test-drive')} onInstall={handleInstallApp} isOpen={commandOpen} onClose={()=>setCommandOpen(false)} />
      <button onClick={()=>setCommandOpen(true)} className="fixed bottom-[88px] right-4 md:hidden z-40 w-12 h-12 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition"><Search className="w-5 h-5" /></button>
      
      <ReportPortal isOpen={showReportPortal} onClose={()=>setShowReportPortal(false)} appContext={reportAppContext} currentUserId={userUID} />
      {editingApp && <EditAppModal app={editingApp} isOpen={!!editingApp} onClose={()=>setEditingApp(null)} onSaved={()=>{ window.location.reload(); }} />}
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





