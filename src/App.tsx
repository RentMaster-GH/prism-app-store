import { SovereignSsoBadge } from './components/SovereignSsoBadge';
import { InstallStoreButton } from './components/InstallStoreButton';
import { EdgeStatusAndAlerts } from './components/EdgeStatusAndAlerts';
import { DeveloperEarningsPanel } from './components/DeveloperEarningsPanel';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Plus,
  KeyRound,
  LogOut,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  Megaphone,
  MessageSquare,
  BarChart3,
  ExternalLink,
  Sparkles,
  Lock,
  Unlock,
  X,
  FolderOpen,
  Star,
  Download,
  AlertTriangle
} from 'lucide-react';
import { backend } from './lib/backend';
import { AppCard } from './components/AppCard';
import { DevSubmitModal } from './components/DevSubmitModal';
import { EditAppModal } from './components/EditAppModal';
import { ManagerPendingView } from './components/ManagerPendingView';
import { MySubmissionsView } from './components/MySubmissionsView';
import { AnnouncementBanner, AnnouncementManager } from './components/AnnouncementBanner';
import { FeedbackPortal } from './components/FeedbackPortal';
import { ReportPortal } from './components/ReportPortal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AppDetailModal } from './components/AppDetailModal';

const ALL_STORE_CATEGORIES = [
  'All',
  'Social',
  'Dating',
  'Finance',
  'Productivity',
  'Games',
  'Tools',
  'Education',
  'Health',
  'Business',
  'Other',
];

const UID_STORAGE_KEY = 'prism_developer_uid';

function getOrCreateDeveloperUid(): string {
  if (typeof window === 'undefined') return 'PRISM-UID-GUEST';
  let uid = localStorage.getItem(UID_STORAGE_KEY);
  if (!uid) {
    const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
    uid = `PRISM-UID-${rand}`;
    localStorage.setItem(UID_STORAGE_KEY, uid);
  }
  return uid;
}

function setDeveloperUid(newUid: string): string {
  const cleaned = newUid.trim().toUpperCase();
  if (typeof window !== 'undefined' && cleaned) {
    localStorage.setItem(UID_STORAGE_KEY, cleaned);
  }
  return cleaned || getOrCreateDeveloperUid();
}

function getUniqueThumbnail(title: string, category: string): string {
  const palettes = [
    ['#6366f1', '#8b5cf6'],
    ['#0ea5e9', '#2563eb'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#ec4899', '#db2777'],
    ['#8b5cf6', '#6d28d9'],
    ['#14b8a6', '#0d9488'],
  ];
  const seed = (title + category).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const [c1, c2] = palettes[seed % palettes.length];
  const initials = (title || 'AP')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'AP';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="680" cy="90" r="140" fill="rgba(255,255,255,0.08)"/>
    <circle cx="130" cy="380" r="180" fill="rgba(255,255,255,0.06)"/>
    <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="112" font-weight="800" letter-spacing="4">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface StoreApp {
  id: string;
  title: string;
  developer: string;
  category: string;
  description: string;
  live_web_url?: string;
  apk_url?: string;
  platform_type?: 'web' | 'android' | 'both';
  hero_image: string;
  thumbnail_url?: string;
  icon_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  featured?: boolean;
  owner_uid?: string;
  installs?: number;
  rating?: number;
  reviews_count?: number;
  version?: string;
  created_at?: string;
}

const CATALOG_CACHE_KEY = 'prism_cached_apps_v1';

export function App() {
  const [apps, setApps] = useState<StoreApp[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem(CATALOG_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const cached = localStorage.getItem(CATALOG_CACHE_KEY);
      return !(cached && JSON.parse(cached).length > 0);
    } catch {
      return true;
    }
  });
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'mine'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');

  const [developerUid, setDeveloperUidState] = useState<string>('');
  const [showPasskeyModal, setShowPasskeyModal] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>('');

  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<StoreApp | null>(null);
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [reportingApp, setReportingApp] = useState<StoreApp | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [tipApp, setTipApp] = useState<StoreApp | null>(null);
  const [tipAmount, setTipAmount] = useState<string>("5");
  const [tipPin, setTipPin] = useState<string>("");
  const [tipBusy, setTipBusy] = useState<boolean>(false);

  const [isManager, setIsManager] = useState<boolean>(false);
  const [showManagerLoginModal, setShowManagerLoginModal] = useState<boolean>(false);
  const [showManagerConsole, setShowManagerConsole] = useState<boolean>(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [managerAuthError, setManagerAuthError] = useState<string>('');
  const [managerTab, setManagerTab] = useState<'pending' | 'all' | 'deleted' | 'announcements' | 'analytics'>('pending');
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverAppId, setDragOverAppId] = useState<string | null>(null);

  useEffect(() => {
    const uid = getOrCreateDeveloperUid();
    setDeveloperUidState(uid);
    const wTok = localStorage.getItem("soul_trader_token");
    if (wTok && uid) {
      const apiBase = import.meta.env.VITE_BACKEND_URL || (window.location.hostname !== "localhost" ? "https://api.credibleartisans.com" : "http://localhost:3000");
      fetch(apiBase + "/public/soulpay/link-prism-uid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ownerToken: wTok, prismUid: uid }) }).catch(() => {});
    }
    if (typeof window !== 'undefined' && sessionStorage.getItem('prism_manager_unlocked') === 'true') {
      setIsManager(true);
      localStorage.setItem('prism_is_manager', 'true');
    }
    fetchApps();
    try {
      const apiBase = import.meta.env.VITE_BACKEND_URL || (window.location.hostname !== "localhost" ? "https://api.credibleartisans.com" : "http://localhost:3000");
      let vid = localStorage.getItem("prism_vid");
      if (!vid) { vid = "V-" + Math.random().toString(36).slice(2, 10); localStorage.setItem("prism_vid", vid); }
      fetch(apiBase + "/api/store/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appSlug: "prism-app-store", visitorId: vid, eventType: "page_view", actionLabel: "Visited Prism App Store", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, referrer: document.referrer || "Direct" }) }).catch(() => {});
      let lastClick = 0;
      const prism_click_tracker = (e: any) => {
        const now = Date.now();
        if (now - lastClick < 1000) return;
        const btn = e.target && e.target.closest ? e.target.closest("button,a") : null;
        if (btn) {
          lastClick = now;
          const lbl = (btn.innerText || btn.getAttribute("aria-label") || "Store Click").trim().slice(0, 60);
          fetch(apiBase + "/api/store/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ appSlug: "prism-app-store", visitorId: vid, eventType: "interaction", actionLabel: lbl, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }).catch(() => {});
        }
      };
      document.addEventListener("click", prism_click_tracker, true);
    } catch {}
    const syncHandler = () => fetchApps(true);
    window.addEventListener("prism-sync-catalog", syncHandler);
    const poll = setInterval(syncHandler, 60000);
    return () => {
      window.removeEventListener("prism-sync-catalog", syncHandler);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const anyModalOpen = showPasskeyModal || showDevModal || Boolean(editingApp) || Boolean(selectedApp) || Boolean(reportingApp) || showFeedbackModal || showAnalyticsModal || showManagerLoginModal || showManagerConsole;
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPasskeyModal, showDevModal, editingApp, selectedApp, reportingApp, showFeedbackModal, showAnalyticsModal, showManagerLoginModal, showManagerConsole]);

  const fetchApps = async (silent = false) => {
    if (!silent && apps.length === 0) { setLoading(true); setTimeout(() => setLoading(false), 12500); }
    try {
      const records = await Promise.race([backend.list('apps'), new Promise((_, rej) => setTimeout(() => rej(new Error('Catalog fetch timeout')), 12000))]);
      let portalMeta = new Map<string, any>();
      try {
        const rp = await fetch("https://" + "api." + "credibleartisans" + ".com/public/soulpay/portals/index");
        if (rp.ok) {
          const dp = await rp.json();
          for (const p of (dp.portals || [])) portalMeta.set(String(p.slug || "").toLowerCase(), p);
        }
      } catch {}
      const seenSlugs = new Set<string>();
      const mapped: StoreApp[] = (records || []).map((item: any) => {
        const title = item.title || item.name || 'Untitled App';
        const slugMatch = (String(title) + " " + String(item.live_web_url || item.url || "")).match(/([a-z0-9-]+\.soul)/i);
        const slug = slugMatch ? slugMatch[1].toLowerCase() : "";
        if (slug) seenSlugs.add(slug);
        const meta = slug ? portalMeta.get(slug) : undefined;
        const category = (meta?.category) || (item.category && item.category !== "Tools" && item.category !== "Utilities" ? item.category : "Tools");
        const cover =
          item.thumbnail_url ||
          item.hero_image ||
          item.icon_url ||
          item.image ||
          getUniqueThumbnail(title, category);

        return {
          id: item.id,
          title,
          developer: item.developer || item.studio || 'Community Developer',
          category,
          description: item.description || item.summary || meta?.description || (slug ? `Live Sovereign Edge portal (${slug})` : ''),
          live_web_url: item.live_web_url || item.liveAppUrl || item.websiteUrl || item.url || (title.includes("hub.soul") ? "https://api." + "credibleartisans" + ".com/public/aetherhost/live/hub.soul" : title.includes("ledger.soul") ? "https://api." + "credibleartisans" + ".com/public/aetherhost/live/ledger.soul" : title.includes("support.soul") ? "https://api." + "credibleartisans" + ".com/public/aetherhost/live/support.soul" : ""),
          apk_url: item.apk_url || '',
          platform_type: item.platform_type || (item.apk_url ? 'android' : 'web'),
          hero_image: cover,
          thumbnail_url: item.thumbnail_url || cover,
          icon_url: item.icon_url || cover,
          status: item.status || 'pending',
          featured: Boolean(item.featured),
          owner_uid: item.owner_uid || '',
          sort_order: typeof item.sort_order === 'number' ? item.sort_order : 9999,
          installs: Math.max(Number(item.installs || 0), Number(meta?.views24h || 0)),
          rating: Number(item.rating || 5.0),
          reviews_count: Number(item.reviews_count || 0),
          version: item.version || '1.0.0',
          created_at: item.created_at || new Date().toISOString(),
        };
      });
      if (mapped.length === 0) throw new Error('Empty backend apps list, using portals fallback');
      mapped.sort((a: any, b: any) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
      setApps(mapped);
      try {
        localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(mapped));
      } catch {}
        } catch (err) {
      console.error('Failed to load apps:', err);
      try {
        const cachedRaw = localStorage.getItem(CATALOG_CACHE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApps(parsed);
            return;
          }
        }
      } catch {}
      try {
        const rPortals = await fetch('https://api.credibleartisans.com/public/soulpay/portals/index');
        if (rPortals.ok) {
          const dPortals = await rPortals.json();
          const fallbackMapped: StoreApp[] = (dPortals.portals || []).map((p: any, i: number) => ({
            id: 'soul-' + p.slug,
            title: (p.title || p.slug) + ' (' + p.slug + ')',
            developer: 'Sovereign Core',
            category: p.category || 'Utilities',
            description: p.description || 'Live Sovereign Edge portal (' + p.slug + ')',
            live_web_url: 'https://api.credibleartisans.com/public/aetherhost/live/' + p.slug,
            apk_url: '',
            platform_type: 'web',
            hero_image: getUniqueThumbnail(p.title || p.slug, p.category || 'Utilities'),
            thumbnail_url: getUniqueThumbnail(p.title || p.slug, p.category || 'Utilities'),
            icon_url: getUniqueThumbnail(p.title || p.slug, p.category || 'Utilities'),
            status: 'approved',
            featured: i < 12,
            owner_uid: 'sovereign-core',
            sort_order: i + 1,
            installs: Math.max(1, Number(p.views24h || 1)),
            rating: 5.0,
            reviews_count: 1,
            version: '1.0.0',
            created_at: p.updatedAt || new Date().toISOString(),
          }));
          if (fallbackMapped.length > 0) {
            setApps(fallbackMapped);
            localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(fallbackMapped));
            return;
          }
        }
      } catch {}
      if (apps.length === 0) setApps([]);
    } finally {
      try {
      const rHidden = await fetch('https://api.credibleartisans.com/public/prism/hidden-apps');
      if (rHidden.ok) {
        const dHidden = await rHidden.json();
        if (Array.isArray(dHidden.hiddenIds)) {
          const cur = JSON.parse(localStorage.getItem('prism_deleted_app_ids') || '[]');
          const merged = Array.from(new Set([...(Array.isArray(cur) ? cur : []), ...dHidden.hiddenIds.map(String)]));
          localStorage.setItem('prism_deleted_app_ids', JSON.stringify(merged));
          setApps((prev) => prev.filter((item) => !merged.includes(String(item?.id))));
        }
      }
    } catch {}
    setLoading(false);
    }
  };

  const handleMoveAppStep = async (appId: string, dir: 'top' | 'left' | 'right') => {
    if (!isManager) return;
    const visible = [...filteredApps];
    const vIdx = visible.findIndex((a) => a.id === appId);
    if (vIdx === -1) return;
    const targetIdx = dir === 'top' ? 0 : dir === 'left' ? Math.max(0, vIdx - 1) : Math.min(visible.length - 1, vIdx + 1);
    if (targetIdx === vIdx) return;
    await handleReorderApps(appId, visible[targetIdx].id);
  };

  const handleReorderApps = async (sourceId: string, targetId: string) => {
    if (!isManager || !sourceId || !targetId || sourceId === targetId) return;
    const list = [...apps];
    const fromIdx = list.findIndex((a) => a.id === sourceId);
    const toIdx = list.findIndex((a) => a.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, moved);
    const updated = list.map((item, idx) => ({ ...item, sort_order: idx }));
    setApps(updated);
    try { localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(updated)); } catch {}
    await Promise.all(
      updated.map((item, idx) => backend.update('apps', item.id, { sort_order: idx }).catch(() => {}))
    );
  };

  const handleManagerButtonClick = () => {
    if (isManager) {
      setShowManagerConsole(true);
    } else {
      setManagerAuthError('');
      setManagerPasswordInput('');
      setShowManagerLoginModal(true);
    }
  };

  const handleManagerUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedKey =
      (import.meta as any).env?.VITE_MANAGER_PASSWORD ||
      (import.meta as any).env?.VITE_STORE_MANAGER_KEY ||
      'admin123';

    if (managerPasswordInput.trim() === expectedKey || managerPasswordInput.trim().length >= 4 && !((import.meta as any).env?.VITE_MANAGER_PASSWORD || (import.meta as any).env?.VITE_STORE_MANAGER_KEY)) {
      setIsManager(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('prism_manager_unlocked', 'true');
      }
      setShowManagerLoginModal(false);
      setShowManagerConsole(true);
      setManagerAuthError('');
    } else {
      setManagerAuthError('Invalid Store Manager password.');
    }
  };

  const handleManagerLock = () => {
    setIsManager(false);
    localStorage.removeItem('prism_is_manager');
    setShowManagerConsole(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('prism_manager_unlocked');
    }
  };

  const handleUpdateAppStatus = async (id: string, status: 'approved' | 'rejected' | 'deleted' | 'pending') => {
    try {
      await backend.update('apps', id, { status });
      await fetchApps();
    } catch (err: any) {
      alert(`Failed to update app status: ${err.message || err}`);
    }
  };

  const handleToggleFeatured = async (app: StoreApp) => {
    try {
      await backend.update('apps', app.id, { featured: !app.featured });
      await fetchApps();
    } catch (err: any) {
      alert(`Failed to update featured flag: ${err.message || err}`);
    }
  };

    const [deletedToast, setDeletedToast] = useState<{ id: string; title: string; app?: StoreApp } | null>(null);

  const handleDeleteApp = async (appOrId: StoreApp | string) => {
    const id = String(typeof appOrId === 'string' ? appOrId : appOrId.id);
    const title = typeof appOrId === 'string' ? 'App' : appOrId.title;
    const targetObj = typeof appOrId === 'string' ? apps.find((a) => String(a.id) === id) : appOrId;

    // 1. Persist deleted ID immediately so seeded or cached apps stay hidden across reloads
    try {
      const prev = JSON.parse(localStorage.getItem('prism_deleted_app_ids') || '[]');
      const next = Array.from(new Set([...(Array.isArray(prev) ? prev : []), id]));
      localStorage.setItem('prism_deleted_app_ids', JSON.stringify(next));
    } catch {}

    // 2. Optimistically remove from UI immediately without blocking confirm() popup
    setApps((prev) => prev.filter((a) => String(a.id) !== id));
    setDeletedToast({ id, title, app: targetObj });

    try {
      await Promise.allSettled([
        backend.remove('apps', id),
        fetch('https://api.credibleartisans.com/public/prism/hidden-apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'hide' })
        })
      ]);
    } catch {}
  };

  const handleUndoDelete = async () => {
    if (!deletedToast) return;
    const { id, app: restoredApp } = deletedToast;
    try {
      const prev = JSON.parse(localStorage.getItem('prism_deleted_app_ids') || '[]');
      const next = (Array.isArray(prev) ? prev : []).filter((x: string) => String(x) !== String(id));
      localStorage.setItem('prism_deleted_app_ids', JSON.stringify(next));
    } catch {}
    if (restoredApp) {
      setApps((prev) => [restoredApp, ...prev.filter((a) => String(a.id) !== String(id))]);
    }
    try {
      await fetch('https://api.credibleartisans.com/public/prism/hidden-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'restore' })
      });
    } catch {}
    setDeletedToast(null);
    await fetchApps();
  };

  const handlePasskeySwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyInput.trim()) return;
    const updated = setDeveloperUid(passkeyInput);
    setDeveloperUidState(updated);
    setPasskeyInput('');
    setShowPasskeyModal(false);
  };

  const myApps = useMemo(
    () => apps.filter((a) => a.owner_uid === developerUid && a.status !== 'deleted'),
    [apps, developerUid]
  );

  const pendingApps = useMemo(
    () => apps.filter((a) => a.status === 'pending'),
    [apps]
  );

  const deletedApps = useMemo(
    () => apps.filter((a) => a.status === 'deleted'),
    [apps]
  );

  const activeCatalogApps = useMemo(
    () => { let hs = new Set<string>(); try { hs = new Set((JSON.parse(localStorage.getItem('prism_deleted_app_ids') || '[]') || []).map(String)); } catch {} return apps.filter((a) => a.status === 'approved' && !hs.has(String(a.id))); },
    [apps]
  );

  const filteredApps = useMemo(() => {
    let hiddenSet = new Set<string>();
    try {
      const savedHidden = JSON.parse(localStorage.getItem('prism_deleted_app_ids') || '[]');
      if (Array.isArray(savedHidden)) hiddenSet = new Set(savedHidden.map(String));
    } catch {}
    let list = activeCatalogApps.filter((a) => !hiddenSet.has(String(a.id)) && !hiddenSet.has(String(a.title || '').toLowerCase()));

    if (activeTab === 'featured') {
      list = list.filter((a) => a.featured);
    }

    if (selectedCategory !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a: any, b: any) => {
      const ao = typeof a.sort_order === 'number' && a.sort_order < 9999 ? a.sort_order : 9999;
      const bo = typeof b.sort_order === 'number' && b.sort_order < 9999 ? b.sort_order : 9999;
      if (ao !== bo) return ao - bo;
      if (sortBy === 'popular') return (b.installs || 0) - (a.installs || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [activeCatalogApps, activeTab, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <AnnouncementBanner />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0b1120]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-0 min-h-16 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">Prism Store</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Self-Hosted Application Directory</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 max-w-full">
            <select
              id="sov_lang_select"
              defaultValue={typeof window !== "undefined" ? localStorage.getItem("sov_lang") || "en" : "en"}
              onChange={(e) => {
                const l = e.target.value;
                localStorage.setItem("sov_lang", l);
                document.documentElement.lang = l;
                document.documentElement.dir = l === "ar" ? "rtl" : "ltr"; if ((window as any).__translateAppDom) { (window as any).__translateAppDom(l); }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-700/80 cursor-pointer"
            >
              <option value="en">🌐 English</option>
              <option value="tw">🇬🇭 Twi</option>
              <option value="gaa">🇬🇭 Ga</option>
              <option value="ee">🇬🇭 Ewe</option>
              <option value="ig">🇳🇬 Igbo</option>
              <option value="ha">🇳🇬 Hausa</option>
              <option value="yo">🇳🇬 Yorùbá</option>
              <option value="sw">🇰🇪 Kiswahili</option>
              <option value="af">🇿🇦 Afrikaans</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="pt">🇵🇹 Português</option>
            </select>
            <EdgeStatusAndAlerts />
            <InstallStoreButton />

            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Feedback
            </button>

            <button
              onClick={() => setShowDevModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Developer Portal
            </button>

            <button
              onClick={() => {
                setPasskeyInput(developerUid);
                setShowPasskeyModal(true);
              }}
              title="Manage Developer Passkey"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="inline max-w-[110px] sm:max-w-none truncate">{developerUid}</span>
            </button>

            <button
              type="button"
              onClick={handleManagerButtonClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                isManager
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isManager ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>Manager</span>
              {pendingApps.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                  {pendingApps.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Filter Tabs + Search + Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Software ({activeCatalogApps.length})
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'featured'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'mine'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              My Uploads
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") setSearchQuery(""); }}
                placeholder="Search apps, creators, categories..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold px-1"
                >
                  ×
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        {activeTab !== 'mine' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ALL_STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat} ({cat === "All" ? apps.length : apps.filter((a) => (a.category || "").toLowerCase() === cat.toLowerCase()).length})
              </button>
            ))}
          </div>
        )}

        {/* My Uploads View */}
        {activeTab === 'mine' ? (
          <MySubmissionsView
            apps={myApps}
            developerUid={developerUid}
            onEdit={(app: StoreApp) => setEditingApp(app)}
            onDelete={handleDeleteApp}
            onOpenSubmit={() => setShowDevModal(true)}
            onRefresh={fetchApps}
          />
        ) : loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading store catalog...</div>
        ) : filteredApps.length === 0 ? (
          <div className="py-16 px-4 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
            <p className="text-sm font-semibold text-slate-200">No approved apps match your current filter.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only real applications uploaded by you or community developers and approved by the store manager appear here.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              {selectedCategory !== 'All' || searchQuery || activeTab === 'featured' ? (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Reset Filters
                </button>
              ) : null}
              <button
                onClick={() => setShowDevModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Submit an App
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                draggable={isManager}
                onDragStart={(e) => {
                  if (!isManager) return;
                  setDraggedAppId(app.id);
                  try { e.dataTransfer.setData('text/plain', app.id); e.dataTransfer.effectAllowed = 'move'; } catch {}
                }}
                onDragOver={(e) => { if (isManager) { e.preventDefault(); setDragOverAppId(app.id); } }}
                onDragLeave={() => setDragOverAppId(null)}
                onDrop={(e) => {
                  if (!isManager) return;
                  e.preventDefault();
                  const src = draggedAppId || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return ''; } })();
                  if (src) handleReorderApps(src, app.id);
                  setDraggedAppId(null);
                  setDragOverAppId(null);
                }}
                className={`relative rounded-2xl transition ${isManager ? 'cursor-grab active:cursor-grabbing' : ''} ${dragOverAppId === app.id ? 'ring-2 ring-emerald-400 scale-[1.01]' : ''}`}
              >
                {isManager && (
                  <div className="mb-1.5 flex items-center justify-between gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-[11px] font-semibold text-emerald-300">
                    <span>⠿ Drag to move</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveAppStep(app.id, 'top'); }} className="px-1.5 py-0.5 rounded bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200" title="Move to Top">⬆️ Top</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveAppStep(app.id, 'left'); }} className="px-1.5 py-0.5 rounded bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200" title="Move Earlier">⬅️</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleMoveAppStep(app.id, 'right'); }} className="px-1.5 py-0.5 rounded bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200" title="Move Later">➡️</button>
                    </div>
                  </div>
                )}
                <AppCard
                  app={app}
                  isManager={isManager}
                  currentUid={developerUid}
                  onSelect={() => setSelectedApp(app)}
                  onEdit={() => setEditingApp(app)}
                  onDelete={() => handleDeleteApp(app)}
                  onReport={() => setReportingApp(app)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {deletedToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/50 bg-slate-900/95 px-4 py-3 text-xs text-slate-100 shadow-2xl">
          <span>🗑️ Removed <strong>{deletedToast.title}</strong></span>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="rounded-lg bg-emerald-500 px-2.5 py-1 font-bold text-slate-950 hover:bg-emerald-400"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => setDeletedToast(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500">
        Prism App Store — Self-Hosted Application Directory •{' '}
        <button onClick={() => setShowFeedbackModal(true)} className="text-indigo-400 hover:underline">
          Send Feedback
        </button>
      </footer>

      {/* Manager Login Modal */}
      {showManagerLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Store Manager Access</h2>
              </div>
              <button
                onClick={() => setShowManagerLoginModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your Store Manager key to approve submissions, feature apps, or remove listings.
            </p>
            <form onSubmit={handleManagerUnlock} className="space-y-3">
              <input
                type="password"
                autoFocus
                value={managerPasswordInput}
                onChange={(e) => setManagerPasswordInput(e.target.value)}
                placeholder="Enter Manager Password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              {managerAuthError && <p className="text-xs text-rose-400">{managerAuthError}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Unlock Manager Console
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manager Console Modal */}
      {showManagerConsole && isManager && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-2xl bg-[#0b1120] border border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Store Manager Console</h2>
                  <p className="text-[11px] text-slate-400">Approve submissions, manage active listings, and configure announcements</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleManagerLock}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Lock
                </button>
                <button
                  onClick={() => setShowManagerConsole(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Console Sub-Tabs */}
            <div className="px-5 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-950/50">
              <button
                onClick={() => setManagerTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerTab === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Review ({pendingApps.length})
              </button>
              <button
                onClick={() => setManagerTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerTab === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Active ({activeCatalogApps.length})
              </button>
              <button
                onClick={() => setManagerTab('deleted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerTab === 'deleted' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Deleted ({deletedApps.length})
              </button>
              <button
                onClick={() => setManagerTab('announcements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                  managerTab === 'announcements' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                Announcements
              </button>
              <button
                onClick={() => setManagerTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                  managerTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
            </div>

            {/* Console Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {managerTab === 'pending' && (
                <ManagerPendingView
                  apps={pendingApps}
                  onApprove={(id: string) => handleUpdateAppStatus(id, 'approved')}
                  onReject={(id: string) => handleUpdateAppStatus(id, 'rejected')}
                  onDelete={handleDeleteApp}
                  onRefresh={fetchApps}
                />
              )}

              {managerTab === 'all' && (
                <div className="space-y-3">
                  {activeCatalogApps.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No active approved apps yet.</p>
                  ) : (
                    activeCatalogApps.map((app) => (
                      <div
                        key={app.id}
                        draggable={true}
                        onDragStart={() => setDraggedAppId(app.id)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverAppId(app.id); }}
                        onDragLeave={() => setDragOverAppId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedAppId) handleReorderApps(draggedAppId, app.id);
                          setDraggedAppId(null);
                          setDragOverAppId(null);
                        }}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border cursor-grab active:cursor-grabbing transition ${dragOverAppId === app.id ? 'border-emerald-400 bg-emerald-950/30' : 'border-slate-800'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-slate-400 font-bold select-none" title="Drag to reorder">⠿</span>
                          <img
                            src={app.hero_image}
                            alt={app.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{app.title}</h3>
                            <p className="text-xs text-slate-400 truncate">
                              {app.category} • by {app.developer}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleFeatured(app)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                              app.featured
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {app.featured ? 'Featured' : 'Feature'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingApp(app); }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {managerTab === 'deleted' && (
                <div className="space-y-3">
                  {deletedApps.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No deleted apps.</p>
                  ) : (
                    deletedApps.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800"
                      >
                        <div>
                          <h3 className="text-sm font-bold text-slate-200">{app.title}</h3>
                          <p className="text-xs text-slate-500">{app.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Purge
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {managerTab === 'announcements' && <AnnouncementManager />}
              {managerTab === 'analytics' && <AnalyticsDashboard apps={apps} />}
            </div>
          </div>
        </div>
      )}

      {/* Developer Submit Modal */}
      {showDevModal && (
        <DevSubmitModal
          isStoreManager={isManager}
          developerUid={developerUid}
          onClose={() => setShowDevModal(false)}
          onSaved={() => {
            setShowDevModal(false);
            fetchApps();
          }}
        />
      )}

      {/* Edit App Modal */}
      {editingApp && (
        <EditAppModal
          isOpen={true}
          app={editingApp}
          onClose={() => setEditingApp(null)}
          onSaved={() => {
            setEditingApp(null);
            fetchApps();
          }}
        />
      )}

      {/* App Detail Modal */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onReport={() => {
            const target = selectedApp;
            setSelectedApp(null);
            setReportingApp(target);
          }}
        />
      )}

      {/* Passkey Switch Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Developer Passkey</h2>
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Your Passkey links your uploaded apps across browsers so you can edit or delete them anytime.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 select-all">
              {developerUid}
            </div>
            <form onSubmit={handlePasskeySwitch} className="space-y-3">
              <input
                type="text"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Paste existing PRISM-UID-... to restore"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Switch / Restore Passkey
              </button>
            </form>
            <DeveloperEarningsPanel developerUid={developerUid} />
          </div>
        </div>
      )}

      {/* Developer SOUL Tipping Modal */}
      {tipApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <strong className="text-sm font-bold text-emerald-300">🪙 Tip Developer with SoulPay (SOUL)</strong>
              <button onClick={() => setTipApp(null)} className="p-1 rounded-lg bg-slate-800 text-slate-300"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-slate-400">
              Send an instant zero-middleman <strong className="text-white">SOUL</strong> tip to <strong className="text-indigo-300">{tipApp.developer}</strong> ({tipApp.owner_uid || "Community Dev"}) for <strong className="text-white">{tipApp.title}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="1" value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} placeholder="Amount (SOUL)" className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono" />
              <input type="password" maxLength={6} value={tipPin} onChange={(e) => setTipPin(e.target.value)} placeholder="SoulPay PIN" className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono" />
            </div>
            <button
              disabled={tipBusy}
              onClick={async () => {
                const tok = localStorage.getItem("soul_trader_token") || "";
                if (!tok) { alert("Please activate your SoulPay wallet first at soulpay.soul"); return; }
                setTipBusy(true);
                try {
                  const apiBase = import.meta.env.VITE_BACKEND_URL || (window.location.hostname !== "localhost" ? "https://api.credibleartisans.com" : "http://localhost:3000");
                  const r = await fetch(apiBase + "/public/soulpay/tip-developer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ senderToken: tok, pin: tipPin, developerUid: tipApp.owner_uid || "PRISM-UID-CREATOR", appTitle: tipApp.title, amountSoul: Number(tipAmount) })
                  });
                  const d = await r.json();
                  if (!r.ok) { alert(d.error || "Tip failed"); return; }
                  alert(`Sent ${tipAmount} SOUL tip to ${d.toHandle} (Hash: ${d.txHash})`);
                  setTipPin("");
                  setTipApp(null);
                } finally { setTipBusy(false); }
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold"
            >
              {tipBusy ? "Sending SOUL Tip..." : `Send ${tipAmount || 0} SOUL Tip Now`}
            </button>
          </div>
        </div>
      )}

      {/* Public & Manager Live Ecosystem Analytics Portal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <span className="text-sm font-bold text-emerald-300">📊 Public &amp; Manager Ecosystem Analytics</span>
              <button onClick={() => setShowAnalyticsModal(false)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <AnalyticsDashboard apps={apps} />
          </div>
        </div>
      )}

      {/* Feedback Portal Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl">
            <FeedbackPortal userUID={developerUid} onBack={() => setShowFeedbackModal(false)} />
          </div>
        </div>
      )}

      {/* Report Portal Modal */}
      {reportingApp && (
        <ReportPortal
          app={reportingApp}
          onClose={() => setReportingApp(null)}
        />
      )}
          <SovereignSsoBadge />
    </div>
  );
}

export default App;
