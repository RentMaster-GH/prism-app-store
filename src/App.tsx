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

  const [isManager, setIsManager] = useState<boolean>(false);
  const [showManagerLoginModal, setShowManagerLoginModal] = useState<boolean>(false);
  const [showManagerConsole, setShowManagerConsole] = useState<boolean>(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [managerAuthError, setManagerAuthError] = useState<string>('');
  const [managerTab, setManagerTab] = useState<'pending' | 'all' | 'deleted' | 'announcements' | 'analytics'>('pending');

  useEffect(() => {
    const uid = getOrCreateDeveloperUid();
    setDeveloperUidState(uid);
    if (typeof window !== 'undefined' && sessionStorage.getItem('prism_manager_unlocked') === 'true') {
      setIsManager(true);
      localStorage.setItem('prism_is_manager', 'true');
    }
    fetchApps();
  }, []);

  const fetchApps = async () => {
    if (apps.length === 0) setLoading(true);
    try {
      const records = await backend.list('apps');
      const mapped: StoreApp[] = (records || []).map((item: any) => {
        const title = item.title || item.name || 'Untitled App';
        const category = item.category || 'Tools';
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
          description: item.description || item.summary || '',
          live_web_url: item.live_web_url || item.url || '',
          apk_url: item.apk_url || '',
          platform_type: item.platform_type || (item.apk_url ? 'android' : 'web'),
          hero_image: cover,
          thumbnail_url: item.thumbnail_url || cover,
          icon_url: item.icon_url || cover,
          status: item.status || 'pending',
          featured: Boolean(item.featured),
          owner_uid: item.owner_uid || '',
          installs: Number(item.installs || 0),
          rating: Number(item.rating || 5.0),
          reviews_count: Number(item.reviews_count || 0),
          version: item.version || '1.0.0',
          created_at: item.created_at || new Date().toISOString(),
        };
      });
      setApps(mapped);
      try {
        localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(mapped));
      } catch {}
    } catch (err) {
      console.error('Failed to load apps:', err);
      if (apps.length === 0) setApps([]);
    } finally {
      setLoading(false);
    }
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

  const handleDeleteApp = async (appOrId: StoreApp | string) => {
    const id = typeof appOrId === 'string' ? appOrId : appOrId.id;
    const title = typeof appOrId === 'string' ? 'this app' : appOrId.title;
    if (!window.confirm(`Remove "${title}" from the store?`)) return;
    try {
      await backend.remove('apps', id);
      await fetchApps();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || err}`);
    }
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
    () => apps.filter((a) => a.status === 'approved'),
    [apps]
  );

  const filteredApps = useMemo(() => {
    let list = activeCatalogApps;

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

    return [...list].sort((a, b) => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">Prism Store</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Self-Hosted Application Directory</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 transition"
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
              <span className="hidden md:inline">{developerUid}</span>
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
                placeholder="Search apps, creators, categories..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
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
                {cat}
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
              <AppCard
                key={app.id}
                app={app}
                isManager={isManager}
                currentUid={developerUid}
                onSelect={() => setSelectedApp(app)}
                onEdit={() => setEditingApp(app)}
                onDelete={() => handleDeleteApp(app)}
                onReport={() => setReportingApp(app)}
              />
            ))}
          </div>
        )}
      </main>

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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800"
                      >
                        <div className="flex items-center gap-3 min-w-0">
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
          </div>
        </div>
      )}

      {/* Feedback Portal Modal */}
      {showFeedbackModal && (
        <FeedbackPortal onClose={() => setShowFeedbackModal(false)} />
      )}

      {/* Report Portal Modal */}
      {reportingApp && (
        <ReportPortal
          app={reportingApp}
          onClose={() => setReportingApp(null)}
        />
      )}
    </div>
  );
}

export default App;
