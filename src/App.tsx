import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Shield,
  Key,
  Sparkles,
  RefreshCw,
  Trash2,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  BarChart3,
  Megaphone,
  CheckCircle2,
  XCircle,
  Layers,
  Filter
} from 'lucide-react';
import { backend } from './lib/backend';
import { AppCard } from './components/AppCard';
import { AppDetailModal } from './components/AppDetailModal';
import { DevSubmitModal } from './components/DevSubmitModal';
import { EditAppModal } from './components/EditAppModal';
import { ManagerPendingView } from './components/ManagerPendingView';
import { MySubmissionsView } from './components/MySubmissionsView';
import { ManagerAuthModal } from './components/ManagerAuthModal';
import { AnnouncementBanner, AnnouncementManager } from './components/AnnouncementBanner';
import { FeedbackPortal, ManagerFeedbackView } from './components/FeedbackPortal';
import { ReportPortal } from './components/ReportPortal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import {
  ALL_STORE_CATEGORIES,
  getUniqueThumbnail,
  fetchReviewRollups,
  normalizeCategoryMatch
} from './utils/storeHelpers';

export interface StoreApp {
  id: string;
  title: string;
  developer: string;
  category: string;
  description: string;
  live_web_url?: string;
  apk_url?: string;
  thumbnail_url?: string;
  hero_image?: string;
  icon_url?: string;
  version?: string;
  whats_new?: string;
  status: 'approved' | 'pending' | 'rejected' | 'deleted';
  featured?: boolean;
  install_count?: number;
  rating?: number;
  review_count?: number;
  owner_uid?: string;
  created_at?: string;
}

const UID_STORAGE_KEY = 'prism_user_uid';
const MANAGER_SESSION_KEY = 'prism_manager_authenticated';

function getOrCreatePasskey(): string {
  try {
    const existing = localStorage.getItem(UID_STORAGE_KEY);
    if (existing && existing.startsWith('PRISM-UID-')) return existing;
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
    const generated = `PRISM-UID-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}-${randomPart.slice(8, 12)}`;
    localStorage.setItem(UID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return 'PRISM-UID-LOCAL-GUEST';
  }
}

export function App() {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'my-uploads'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating'>('recent');

  const [currentUid, setCurrentUid] = useState<string>(() => getOrCreatePasskey());
  const [isManager, setIsManager] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(MANAGER_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [editingApp, setEditingApp] = useState<StoreApp | null>(null);
  const [showDevModal, setShowDevModal] = useState<boolean>(false);
  const [showManagerLogin, setShowManagerLogin] = useState<boolean>(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState<boolean>(false);
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [showFeedbackPortal, setShowFeedbackPortal] = useState<boolean>(false);
  const [reportingApp, setReportingApp] = useState<StoreApp | null>(null);

  const [managerSubTab, setManagerSubTab] = useState<
    'pending' | 'all' | 'deleted' | 'reports' | 'analytics' | 'announce' | 'feedback'
  >('pending');

  const loadStoreData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [rawApps, reviewRollups] = await Promise.all([
        backend.list<any>('apps'),
        fetchReviewRollups().catch(() => ({} as Record<string, { average: number; count: number }>))
      ]);

      const mapped: StoreApp[] = (Array.isArray(rawApps) ? rawApps : []).map((item: any) => {
        const title = item.title || item.name || 'Untitled App';
        const category = item.category || 'Other';
        const customImage =
          item.thumbnail_url || item.hero_image || item.icon_url || item.image || '';
        const resolvedBanner =
          customImage && customImage.trim().length > 0
            ? customImage
            : getUniqueThumbnail(title, category);

        const rollup = reviewRollups[item.id];
        return {
          ...item,
          id: item.id,
          title,
          developer: item.developer || item.studio || 'Community Developer',
          category,
          description: item.description || item.summary || '',
          live_web_url: item.live_web_url || item.liveAppUrl || item.websiteUrl || '',
          apk_url: item.apk_url || item.apkUrl || '',
          thumbnail_url: customImage || resolvedBanner,
          hero_image: resolvedBanner,
          version: item.version || '1.0.0',
          whats_new: item.whats_new || '',
          status: item.status || 'pending',
          featured: Boolean(item.featured),
          install_count: Number(item.install_count || 0),
          rating: rollup ? rollup.average : Number(item.rating || 5.0),
          review_count: rollup ? rollup.count : Number(item.review_count || 0),
          owner_uid: item.owner_uid || ''
        };
      });

      setApps(mapped);
    } catch (err) {
      console.error('Failed to load apps from backend:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  const handleLaunchOrInstall = async (app: StoreApp) => {
    const nextCount = (app.install_count || 0) + 1;
    setApps((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, install_count: nextCount } : item))
    );
    try {
      await backend.update('apps', app.id, { install_count: nextCount });
    } catch (err) {
      console.warn('Could not persist install increment:', err);
    }
  };

  const handleDeleteApp = async (app: StoreApp) => {
    const confirmed = window.confirm(`Remove "${app.title}" from the public storefront?`);
    if (!confirmed) return;

    try {
      await backend.update('apps', app.id, { status: 'deleted' });
      setApps((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: 'deleted' } : item))
      );
      if (selectedApp?.id === app.id) setSelectedApp(null);
    } catch (err: any) {
      alert(`Failed to delete app: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleRestoreApp = async (app: StoreApp) => {
    try {
      await backend.update('apps', app.id, { status: 'approved' });
      setApps((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: 'approved' } : item))
      );
    } catch (err: any) {
      alert(`Failed to restore app: ${err?.message || 'Unknown error'}`);
    }
  };

  const handlePermanentPurge = async (app: StoreApp) => {
    const confirmed = window.confirm(
      `Permanently delete "${app.title}" from PostgreSQL? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await backend.remove('apps', app.id);
      setApps((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err: any) {
      alert(`Failed to purge app: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSwitchPasskey = () => {
    const trimmed = passkeyInput.trim().toUpperCase();
    if (!trimmed) return;
    localStorage.setItem(UID_STORAGE_KEY, trimmed);
    setCurrentUid(trimmed);
    setPasskeyInput('');
    setShowPasskeyModal(false);
  };

  const approvedApps = useMemo(
    () => apps.filter((app) => app.status === 'approved'),
    [apps]
  );

  const myApps = useMemo(
    () => apps.filter((app) => app.owner_uid === currentUid && app.status !== 'deleted'),
    [apps, currentUid]
  );

  const pendingApps = useMemo(
    () => apps.filter((app) => app.status === 'pending'),
    [apps]
  );

  const deletedApps = useMemo(
    () => apps.filter((app) => app.status === 'deleted'),
    [apps]
  );

  const visibleApps = useMemo(() => {
    let pool =
      activeTab === 'my-uploads'
        ? myApps
        : activeTab === 'featured'
        ? approvedApps.filter((a) => a.featured)
        : approvedApps;

    if (selectedCategory !== 'All') {
      pool = pool.filter((a) => normalizeCategoryMatch(a.category, selectedCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    const sorted = [...pool];
    if (sortBy === 'popular') {
      sorted.sort((a, b) => (b.install_count || 0) - (a.install_count || 0));
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    }
    return sorted;
  }, [activeTab, approvedApps, myApps, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <AnnouncementBanner />

      <header className="sticky top-0 z-30 bg-[#0b1120]/95 backdrop-blur border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                Prism Store
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Self-Hosted Application Directory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFeedbackPortal((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700/60"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Feedback</span>
            </button>

            <button
              onClick={() => setShowDevModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Developer Portal</span>
            </button>

            <button
              onClick={() => setShowPasskeyModal(true)}
              title="Manage Developer Passkey"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 border border-slate-700/60"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{currentUid.slice(0, 14)}...</span>
            </button>

            {isManager ? (
              <button
                onClick={() => {
                  sessionStorage.removeItem(MANAGER_SESSION_KEY);
                  setIsManager(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                onClick={() => setShowManagerLogin(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Manager</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isManager && (
          <section className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  Manager Console (Owner Only)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Pending ({pendingApps.length})
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
                  Total {apps.length}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setManagerSubTab('pending')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    managerSubTab === 'pending'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Pending Only
                </button>
                <button
                  onClick={() => setManagerSubTab('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    managerSubTab === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All ({approvedApps.length})
                </button>
                <button
                  onClick={() => setManagerSubTab('deleted')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    managerSubTab === 'deleted'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Deleted ({deletedApps.length})
                </button>
                <button
                  onClick={() => setManagerSubTab('analytics')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    managerSubTab === 'analytics'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
                <button
                  onClick={() => setManagerSubTab('announce')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    managerSubTab === 'announce'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Announce</span>
                </button>
                <button
                  onClick={() => setManagerSubTab('feedback')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    managerSubTab === 'feedback'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Feedback
                </button>
                <button
                  onClick={() => loadStoreData(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {managerSubTab === 'pending' && (
              <ManagerPendingView
                apps={pendingApps}
                onRefresh={() => loadStoreData(true)}
              />
            )}

            {managerSubTab === 'all' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {approvedApps.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No approved apps listed yet.
                  </p>
                ) : (
                  approvedApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{app.title}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {app.category} • {app.live_web_url || 'APK Release'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setEditingApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-rose-500/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {managerSubTab === 'deleted' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {deletedApps.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Trash is empty.</p>
                ) : (
                  deletedApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between gap-3 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{app.title}</p>
                        <p className="text-xs text-slate-400 truncate">{app.category}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestoreApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-emerald-500/30"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePermanentPurge(app)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {managerSubTab === 'analytics' && <AnalyticsDashboard />}
            {managerSubTab === 'announce' && <AnnouncementManager />}
            {managerSubTab === 'feedback' && <ManagerFeedbackView />}
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Software ({approvedApps.length})
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'featured'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Featured</span>
            </button>
            <button
              onClick={() => setActiveTab('my-uploads')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'my-uploads'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              My Uploads ({myApps.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="recent">Newest First</option>
              <option value="popular">Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ALL_STORE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === category
                  ? 'bg-white text-slate-950 font-semibold'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, creators, categories..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {activeTab === 'my-uploads' ? (
          <MySubmissionsView
            currentUid={currentUid}
            onEditApp={(app) => setEditingApp(app)}
            onRefreshStore={() => loadStoreData(true)}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-slate-900/70 border border-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : visibleApps.length === 0 ? (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <p className="text-sm text-slate-300 font-medium">
              No approved apps match your current filter.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only real applications uploaded by you or community developers and approved by the
              store manager appear here.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {selectedCategory !== 'All' || searchQuery ? (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Reset Filters
                </button>
              ) : null}
              <button
                onClick={() => setShowDevModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit an App</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isManager={isManager}
                currentUid={currentUid}
                onSelect={() => setSelectedApp(app)}
                onLaunch={() => handleLaunchOrInstall(app)}
                onEdit={() => setEditingApp(app)}
                onDelete={() => handleDeleteApp(app)}
              />
            ))}
          </div>
        )}

        {showFeedbackPortal && (
          <div className="pt-4">
            <FeedbackPortal />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-4">
        <span>Prism App Store — Self-Hosted Application Directory</span>
        <button
          onClick={() => setShowFeedbackPortal((v) => !v)}
          className="text-indigo-400 hover:underline"
        >
          Send Feedback
        </button>
      </footer>

      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onInstall={() => handleLaunchOrInstall(selectedApp)}
          onReport={() => {
            setReportingApp(selectedApp);
            setSelectedApp(null);
          }}
        />
      )}

      {showDevModal && (
        <DevSubmitModal
          currentUid={currentUid}
          onClose={() => setShowDevModal(false)}
          onSubmitted={() => {
            setShowDevModal(false);
            loadStoreData(true);
          }}
        />
      )}

      {editingApp && (
        <EditAppModal
          app={editingApp}
          onClose={() => setEditingApp(null)}
          onSaved={() => {
            setEditingApp(null);
            loadStoreData(true);
          }}
        />
      )}

      {reportingApp && (
        <ReportPortal
          app={reportingApp}
          onClose={() => setReportingApp(null)}
        />
      )}

      {showManagerLogin && (
        <ManagerAuthModal
          onClose={() => setShowManagerLogin(false)}
          onAuthenticated={() => {
            sessionStorage.setItem(MANAGER_SESSION_KEY, 'true');
            setIsManager(true);
            setShowManagerLogin(false);
          }}
        />
      )}

      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Developer Passkey</span>
              </h3>
              <button
                onClick={() => setShowPasskeyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Your Passkey links your uploaded apps so you can edit or delete them across devices.
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-xs text-emerald-400 select-all">
              {currentUid}
            </div>
            <div className="space-y-2">
              <label className="block text-xs text-slate-400">
                Paste existing PRISM-UID-... to restore
              </label>
              <input
                type="text"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="PRISM-UID-XXXX-XXXX-XXXX"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <button
                onClick={handleSwitchPasskey}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                Switch / Restore Passkey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
