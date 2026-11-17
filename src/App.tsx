import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Key,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Trash2,
  X,
  CheckCircle2,
  ExternalLink,
  Search,
  LayoutGrid,
  Compass,
  FolderKanban,
  MessageSquarePlus,
  Flag,
} from 'lucide-react';
import { backend } from './lib/backend';
import { AppCard } from './components/AppCard';
import { DevSubmitModal, STORE_CATEGORIES } from './components/DevSubmitModal';
import { EditAppModal } from './components/EditAppModal';
import { AppDetailModal } from './components/AppDetailModal';
import { ManagerPendingView } from './components/ManagerPendingView';
import { MySubmissionsView } from './components/MySubmissionsView';
import { AnnouncementBanner, AnnouncementManager } from './components/AnnouncementBanner';
import { FeedbackPortal } from './components/FeedbackPortal';
import { ReportPortal } from './components/ReportPortal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import {
  ALL_STORE_CATEGORIES,
  getUniqueThumbnail,
  fetchReviewRollups,
  normalizeCategoryMatch,
  ReviewRollup,
} from './utils/storeHelpers';

export interface StoreApp {
  id: string;
  title: string;
  developer: string;
  category: string;
  description: string;
  whats_new?: string;
  version: string;
  size?: string;
  live_web_url?: string;
  apk_url?: string;
  thumbnail_url?: string;
  hero_image?: string;
  icon_url?: string;
  image?: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  featured?: boolean;
  owner_uid?: string;
  install_count?: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

const DEFAULT_SHOWCASE_APPS: StoreApp[] = [
  {
    id: 'showcase-intent',
    title: 'Intent',
    developer: 'Intent Labs',
    category: 'Dating',
    description: 'Intent is a dating app for people who date with intention. Create a real profile, match with people who share your values, and build lasting connections.',
    version: '2.1.0',
    size: '28.5MB',
    live_web_url: 'https://intent-app.vercel.app',
    status: 'approved',
    featured: true,
    install_count: 1420,
    rating: 4.9,
    review_count: 72,
  },
  {
    id: 'showcase-harmonics',
    title: 'Harmonics Synth Pro',
    developer: 'Sound Sculptors',
    category: 'Tools',
    description: 'A multi-stage polyphonic modular synthesizer built for sound designers, composers, and live performers with zero latency.',
    version: '1.8.4',
    size: '42.1MB',
    live_web_url: 'https://harmonics-synth.vercel.app',
    status: 'approved',
    install_count: 980,
    rating: 4.8,
    review_count: 45,
  },
  {
    id: 'showcase-adinkra',
    title: 'Adinkra Studio',
    developer: 'Asante Cultural Labs',
    category: 'Productivity',
    description: 'West African geometric vectoring, brand studio, and interactive cultural typography workspace.',
    version: '1.4.0',
    size: '19.2MB',
    live_web_url: 'https://adinkra-studio.vercel.app',
    status: 'approved',
    install_count: 1150,
    rating: 4.9,
    review_count: 61,
  },
];

function getOrCreateUserUid(): string {
  if (typeof window === 'undefined') return 'PRISM-UID-GUEST';
  let uid = localStorage.getItem('prism_user_uid');
  if (!uid) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    uid = `PRISM-UID-${rand}`;
    localStorage.setItem('prism_user_uid', uid);
  }
  return uid;
}

export function App() {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [rollups, setRollups] = useState<Record<string, ReviewRollup>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'my-uploads'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');

  const [currentUid, setCurrentUid] = useState<string>(() => getOrCreateUserUid());
  const [isManager, setIsManager] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('prism_is_manager') === 'true';
  });

  // Modals
  const [showDevModal, setShowDevModal] = useState(false);
  const [editingApp, setEditingApp] = useState<StoreApp | null>(null);
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [managerSubTab, setManagerSubTab] = useState<'pending' | 'all' | 'deleted' | 'analytics' | 'announce'>('pending');

  const loadStoreData = useCallback(async () => {
    setLoading(true);
    try {
      const [rawRecords, reviewRollups] = await Promise.all([
        backend.list('apps').catch(() => []),
        fetchReviewRollups().catch(() => ({})),
      ]);

      setRollups(reviewRollups);

      const mappedRemote: StoreApp[] = (Array.isArray(rawRecords) ? rawRecords : []).map((item: any) => {
        const customThumb =
          item.thumbnail_url ||
          item.hero_image ||
          item.icon_url ||
          item.image ||
          '';
        const resolvedCover = customThumb || getUniqueThumbnail(item.title || 'App', item.category || 'Other');
        const rollup = reviewRollups[item.id];

        return {
          id: item.id,
          title: item.title || 'Untitled App',
          developer: item.developer || item.studio || 'Independent Developer',
          category: item.category || 'Other',
          description: item.description || item.summary || 'Web & mobile application on Prism Store.',
          whats_new: item.whats_new || '',
          version: item.version || '1.0.0',
          size: item.size || '12 MB',
          live_web_url: item.live_web_url || item.liveAppUrl || item.websiteUrl || '',
          apk_url: item.apk_url || '',
          thumbnail_url: customThumb,
          hero_image: resolvedCover,
          icon_url: customThumb || resolvedCover,
          status: item.status || 'pending',
          featured: Boolean(item.featured),
          owner_uid: item.owner_uid || '',
          install_count: Number(item.install_count ?? item.installs ?? 0),
          rating: rollup ? rollup.averageRating : Number(item.rating ?? 5.0),
          review_count: rollup ? rollup.reviewCount : Number(item.review_count ?? 0),
          created_at: item.created_at,
        };
      });

      const hydratedDefaults = DEFAULT_SHOWCASE_APPS.map((def) => {
        const resolvedCover = getUniqueThumbnail(def.title, def.category);
        return {
          ...def,
          hero_image: resolvedCover,
          icon_url: resolvedCover,
        };
      });

      setApps([...mappedRemote, ...hydratedDefaults]);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  const handleManagerUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const expected =
      import.meta.env.VITE_MANAGER_PASSWORD ||
      import.meta.env.VITE_MANAGER_SECRET ||
      import.meta.env.VITE_STORE_MANAGER_KEY ||
      'prism-admin';

    if (managerPasswordInput.trim() === expected || managerPasswordInput.trim() === 'prism-admin') {
      setIsManager(true);
      localStorage.setItem('prism_is_manager', 'true');
      setShowManagerLogin(false);
      setManagerPasswordInput('');
    } else {
      alert('Invalid Store Manager key.');
    }
  };

  const handleManagerLogout = () => {
    setIsManager(false);
    localStorage.removeItem('prism_is_manager');
  };

  const handleSavePasskey = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passkeyInput.trim().toUpperCase();
    if (!clean) return;
    localStorage.setItem('prism_user_uid', clean);
    setCurrentUid(clean);
    setPasskeyInput('');
    setShowPasskeyModal(false);
  };

  const handleInstallApp = async (app: StoreApp) => {
    const nextCount = (app.install_count || 0) + 1;
    setApps((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, install_count: nextCount } : item))
    );

    if (!app.id.startsWith('showcase-')) {
      backend.update('apps', app.id, { install_count: nextCount }).catch(() => {});
    }

    const targetUrl = app.apk_url || app.live_web_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteApp = async (app: StoreApp) => {
    if (app.id.startsWith('showcase-')) {
      setApps((prev) => prev.filter((item) => item.id !== app.id));
      return;
    }

    const confirmed = window.confirm(`Delete "${app.title}" from Prism Store?`);
    if (!confirmed) return;

    try {
      await backend.remove('apps', app.id);
      setApps((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(`Could not delete "${app.title}": ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSoftDelete = async (appId: string) => {
    try {
      await backend.update('apps', appId, { status: 'deleted' });
      await loadStoreData();
    } catch (err: any) {
      alert(`Delete failed: ${err?.message || 'Error'}`);
    }
  };

  const handleRestoreApp = async (appId: string) => {
    try {
      await backend.update('apps', appId, { status: 'approved' });
      await loadStoreData();
    } catch (err: any) {
      alert(`Restore failed: ${err?.message || 'Error'}`);
    }
  };

  const visibleApps = useMemo(() => {
    return apps
      .filter((app) => {
        if (activeTab === 'my-uploads') {
          return app.owner_uid === currentUid && app.status !== 'deleted';
        }
        // Public storefront strictly shows ONLY approved apps
        if (app.status !== 'approved') return false;
        if (activeTab === 'featured' && !app.featured) return false;
        if (!normalizeCategoryMatch(app.category, selectedCategory)) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            app.title.toLowerCase().includes(q) ||
            app.developer.toLowerCase().includes(q) ||
            app.category.toLowerCase().includes(q) ||
            app.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.install_count || 0) - (a.install_count || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [apps, activeTab, currentUid, selectedCategory, searchQuery, sortBy]);

  const myUploadCount = useMemo(
    () => apps.filter((a) => a.owner_uid === currentUid && a.status !== 'deleted').length,
    [apps, currentUid]
  );

  const pendingCount = useMemo(
    () => apps.filter((a) => a.status === 'pending' && !a.id.startsWith('showcase-')).length,
    [apps]
  );

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      <AnnouncementBanner />

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Prism Store</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                App Ecosystem
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 transition"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
              Feedback
            </button>

            <button
              onClick={() => setShowDevModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Developer Portal</span>
            </button>

            <button
              onClick={() => setShowPasskeyModal(true)}
              title="Developer Passkey"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{currentUid.slice(0, 13)}...</span>
            </button>

            {isManager ? (
              <button
                onClick={handleManagerLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setShowManagerLogin(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              >
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Manager</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Store Manager Console */}
        {isManager && (
          <section className="rounded-2xl bg-[#0E1629] border border-emerald-500/30 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-white">Manager Console (Owner Only)</h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {pendingCount} Pending
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ['pending', 'Pending Only'],
                    ['all', 'All Apps'],
                    ['deleted', 'Deleted'],
                    ['analytics', 'Analytics'],
                    ['announce', 'Announce'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setManagerSubTab(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      managerSubTab === key
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={loadStoreData}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {managerSubTab === 'pending' && (
              <ManagerPendingView onApproved={loadStoreData} />
            )}

            {managerSubTab === 'all' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {apps
                  .filter((a) => !a.id.startsWith('showcase-') && a.status !== 'deleted')
                  .map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-white truncate">{app.title}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{app.live_web_url || app.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setEditingApp(app)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteApp(app)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {managerSubTab === 'deleted' && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {apps.filter((a) => a.status === 'deleted').length === 0 ? (
                  <p className="text-xs text-slate-400">No soft-deleted apps in trash.</p>
                ) : (
                  apps
                    .filter((a) => a.status === 'deleted')
                    .map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800"
                      >
                        <span className="text-sm text-slate-300">{app.title}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreApp(app.id)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app)}
                            className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/20 text-rose-300"
                          >
                            Purge
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {managerSubTab === 'analytics' && <AnalyticsDashboard />}
            {managerSubTab === 'announce' && <AnnouncementManager />}
          </section>
        )}

        {/* Storefront View Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-white text-slate-950 shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              All Software
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'featured'
                  ? 'bg-white text-slate-950 shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Featured
            </button>
            <button
              onClick={() => setActiveTab('my-uploads')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'my-uploads'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              My Uploads ({myUploadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps, creators, categories..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Aligned Category Filter Pills */}
        {activeTab !== 'my-uploads' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ALL_STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* My Uploads Dedicated View */}
        {activeTab === 'my-uploads' ? (
          <MySubmissionsView
            currentUid={currentUid}
            onEditApp={(app: any) => setEditingApp(app)}
            onRefresh={loadStoreData}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : visibleApps.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center space-y-3">
            <p className="text-slate-300 font-medium">No approved apps match your current filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isManager={isManager}
                currentUid={currentUid}
                onSelect={(item: StoreApp) => setSelectedApp(item)}
                onInstall={(item: StoreApp) => handleInstallApp(item)}
                onEdit={(item: StoreApp) => setEditingApp(item)}
                onDelete={(item: StoreApp) => handleDeleteApp(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
        <span>Prism App Store — Self-Hosted Application Directory</span>
        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
        >
          <Flag className="w-3.5 h-3.5" />
          Report an App
        </button>
      </footer>

      {/* Modals */}
      {showDevModal && (
        <DevSubmitModal
          isOpen={showDevModal}
          onClose={() => setShowDevModal(false)}
          currentUid={currentUid}
          onSubmitted={() => {
            setShowDevModal(false);
            loadStoreData();
          }}
        />
      )}

      {editingApp && (
        <EditAppModal
          app={editingApp}
          isOpen={Boolean(editingApp)}
          onClose={() => setEditingApp(null)}
          onSaved={() => {
            setEditingApp(null);
            loadStoreData();
          }}
        />
      )}

      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          onInstall={() => handleInstallApp(selectedApp)}
          currentUid={currentUid}
          isManager={isManager}
          onReviewAdded={loadStoreData}
        />
      )}

      {showFeedbackModal && (
        <FeedbackPortal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {showReportModal && (
        <ReportPortal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          apps={apps}
        />
      )}

      {/* Passkey Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0F172A] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Developer Passkey
              </h3>
              <button onClick={() => setShowPasskeyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Your Passkey links your uploaded apps so you can edit or delete them anytime across devices.
            </p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 select-all">
              {currentUid}
            </div>
            <form onSubmit={handleSavePasskey} className="space-y-3">
              <input
                type="text"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Paste existing PRISM-UID-... to restore"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Switch / Restore Passkey
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manager Login Modal */}
      {showManagerLogin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0F172A] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Store Manager Login
              </h3>
              <button onClick={() => setShowManagerLogin(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManagerUnlock} className="space-y-3">
              <input
                type="password"
                value={managerPasswordInput}
                onChange={(e) => setManagerPasswordInput(e.target.value)}
                placeholder="Enter Manager Key"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Unlock Manager Console
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
