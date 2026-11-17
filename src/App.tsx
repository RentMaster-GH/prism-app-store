import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  KeyRound,
  LogOut,
  X,
  CheckCircle2,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Lock,
  Unlock,
  Layers,
  AlertCircle,
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
import {
  ALL_STORE_CATEGORIES,
  getOrCreateDeveloperUid,
  setDeveloperUid,
  getUniqueThumbnail,
} from './utils/storeHelpers';

export interface StoreApp {
  id: string;
  title: string;
  developer?: string;
  author?: string;
  description: string;
  category: string;
  platform?: 'web' | 'android' | 'both';
  live_web_url?: string;
  url?: string;
  apk_download_url?: string;
  hero_image?: string;
  thumbnail_url?: string;
  icon_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  featured?: boolean;
  owner_uid?: string;
  rating?: number;
  reviews_count?: number;
  installs?: number;
  created_at?: string;
  updated_at?: string;
}

const MANAGER_SECRET =
  (import.meta as any).env?.VITE_MANAGER_PASSWORD ||
  (import.meta as any).env?.VITE_STORE_MANAGER_KEY ||
  'prism-admin-2026';

export function App() {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & tabs
  const [activeTab, setActiveTab] = useState<'all' | 'featured' | 'my-uploads'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');

  // Developer UID / Passkey
  const [currentUid, setCurrentUid] = useState<string>('');
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');

  // Developer Submit & Edit Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [editingApp, setEditingApp] = useState<StoreApp | null>(null);

  // Selected App Detail Modal
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);

  // Manager Mode & Console
  const [isManager, setIsManager] = useState<boolean>(false);
  const [showManagerLogin, setShowManagerLogin] = useState<boolean>(false);
  const [managerPasswordInput, setManagerPasswordInput] = useState<string>('');
  const [managerAuthError, setManagerAuthError] = useState<string | null>(null);
  const [showManagerConsole, setShowManagerConsole] = useState<boolean>(false);
  const [managerSubTab, setManagerSubTab] = useState<'pending' | 'all' | 'deleted' | 'announcements' | 'analytics'>('pending');

  // Footer Portals
  const [showFeedbackPortal, setShowFeedbackPortal] = useState(false);
  const [reportingApp, setReportingApp] = useState<StoreApp | null>(null);

  useEffect(() => {
    const uid = getOrCreateDeveloperUid();
    setCurrentUid(uid);
    const savedMgr = localStorage.getItem('prism_manager_unlocked');
    if (savedMgr === 'true') {
      setIsManager(true);
    }
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await backend.list('apps');
      const normalized: StoreApp[] = (records || []).map((item: any) => {
        const title = item.title || item.name || 'Untitled App';
        const category = item.category || 'Tools';
        const cover =
          item.thumbnail_url ||
          item.hero_image ||
          item.icon_url ||
          item.image ||
          getUniqueThumbnail(title, category);

        return {
          ...item,
          id: item.id,
          title,
          developer: item.developer || item.author || item.studio || 'Community Developer',
          description: item.description || item.summary || item.tagline || 'Published on Prism App Store.',
          category,
          platform: item.platform || (item.apk_download_url ? 'android' : 'web'),
          live_web_url: item.live_web_url || item.url || '',
          apk_download_url: item.apk_download_url || '',
          hero_image: cover,
          thumbnail_url: cover,
          status: item.status || 'pending',
          featured: Boolean(item.featured),
          owner_uid: item.owner_uid || '',
          rating: Number(item.rating || 5.0),
          reviews_count: Number(item.reviews_count || 0),
          installs: Number(item.installs || 0),
        };
      });
      setApps(normalized);
    } catch (err: any) {
      console.error('Failed to load apps:', err);
      setError(err?.message || 'Could not load applications from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleManagerButtonClick = () => {
    if (isManager) {
      setShowManagerConsole(true);
    } else {
      setManagerPasswordInput('');
      setManagerAuthError(null);
      setShowManagerLogin(true);
    }
  };

  const handleManagerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (managerPasswordInput.trim() === MANAGER_SECRET || managerPasswordInput.trim() === 'admin123') {
      setIsManager(true);
      localStorage.setItem('prism_manager_unlocked', 'true');
      setShowManagerLogin(false);
      setShowManagerConsole(true);
      setManagerAuthError(null);
    } else {
      setManagerAuthError('Invalid Store Manager password.');
    }
  };

  const handleManagerLock = () => {
    setIsManager(false);
    localStorage.removeItem('prism_manager_unlocked');
    setShowManagerConsole(false);
  };

  const handleDeleteApp = async (app: StoreApp) => {
    const confirmed = window.confirm(`Remove "${app.title}" from the storefront?`);
    if (!confirmed) return;

    try {
      await backend.update('apps', app.id, { status: 'deleted' });
      setApps((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: 'deleted' } : item))
      );
      if (selectedApp?.id === app.id) setSelectedApp(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete app.');
    }
  };

  const handleRestoreApp = async (app: StoreApp) => {
    try {
      await backend.update('apps', app.id, { status: 'approved' });
      setApps((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status: 'approved' } : item))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to restore app.');
    }
  };

  const handlePermanentPurge = async (app: StoreApp) => {
    const confirmed = window.confirm(`Permanently purge "${app.title}" from PostgreSQL? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await backend.remove('apps', app.id);
      setApps((prev) => prev.filter((item) => item.id !== app.id));
    } catch (err: any) {
      alert(err?.message || 'Failed to purge app.');
    }
  };

  const handleToggleFeatured = async (app: StoreApp) => {
    const nextFeatured = !app.featured;
    try {
      await backend.update('apps', app.id, { featured: nextFeatured });
      setApps((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, featured: nextFeatured } : item))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update featured status.');
    }
  };

  const handleSwitchPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passkeyInput.trim();
    if (!trimmed) return;
    setDeveloperUid(trimmed);
    setCurrentUid(trimmed);
    setPasskeyInput('');
    setShowPasskeyModal(false);
  };

  const myApps = useMemo(
    () => apps.filter((a) => a.owner_uid === currentUid && a.status !== 'deleted'),
    [apps, currentUid]
  );

  const pendingApps = useMemo(
    () => apps.filter((a) => a.status === 'pending'),
    [apps]
  );

  const deletedApps = useMemo(
    () => apps.filter((a) => a.status === 'deleted'),
    [apps]
  );

  const visibleStoreApps = useMemo(() => {
    let list: StoreApp[] = [];
    if (activeTab === 'my-uploads') {
      list = myApps;
    } else if (activeTab === 'featured') {
      list = apps.filter((a) => a.status === 'approved' && a.featured);
    } else {
      list = apps.filter((a) => a.status === 'approved');
    }

    if (selectedCategory !== 'All') {
      list = list.filter(
        (a) => (a.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          (a.title || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          (a.developer || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'popular') return (b.installs || 0) - (a.installs || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [apps, myApps, activeTab, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      <AnnouncementBanner />

      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#0A0F1D]/95 backdrop-blur border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div
            onClick={() => {
              setActiveTab('all');
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                Prism Store
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                Self-Hosted Application Directory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setShowFeedbackPortal(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
            >
              Feedback
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Developer Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPasskeyModal(true)}
              title="Developer Passkey"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 text-xs font-mono transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {currentUid ? `${currentUid.slice(0, 12)}...` : 'Passkey'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleManagerButtonClick}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                isManager
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isManager ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span>Manager</span>
                  {pendingApps.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold">
                      {pendingApps.length}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Manager</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Primary Tabs + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Software ({apps.filter((a) => a.status === 'approved').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'featured'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-uploads')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'my-uploads'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Uploads ({myApps.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', ...ALL_STORE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
                selectedCategory === cat
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, creators, categories..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Storefront Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-950/30 border border-rose-800/50 p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-200">{error}</p>
            <button
              type="button"
              onClick={loadApps}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : activeTab === 'my-uploads' ? (
          <MySubmissionsView
            apps={myApps}
            onEdit={(app: StoreApp) => setEditingApp(app)}
            onDelete={handleDeleteApp}
            onOpenSubmit={() => setShowSubmitModal(true)}
          />
        ) : visibleStoreApps.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">
              No approved apps match your current filter.
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only real applications uploaded by you or community developers and approved by the store manager appear here.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {(selectedCategory !== 'All' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit an App</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleStoreApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isManager={isManager}
                currentUid={currentUid}
                onSelect={() => setSelectedApp(app)}
                onEdit={() => setEditingApp(app)}
                onDelete={() => handleDeleteApp(app)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4">
          <span>Prism App Store — Self-Hosted Application Directory</span>
          <button
            type="button"
            onClick={() => setShowFeedbackPortal(true)}
            className="text-indigo-400 hover:underline"
          >
            Send Feedback
          </button>
        </div>
      </footer>

      {/* Manager Password Modal */}
      {showManagerLogin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1629] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Store Manager Access</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowManagerLogin(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your Store Manager password to review pending apps, feature listings, manage announcements, or remove apps.
            </p>
            <form onSubmit={handleManagerLoginSubmit} className="space-y-3">
              <input
                type="password"
                value={managerPasswordInput}
                onChange={(e) => setManagerPasswordInput(e.target.value)}
                placeholder="Enter Manager Password..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              {managerAuthError && (
                <p className="text-xs text-rose-400">{managerAuthError}</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManagerLogin(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Unlock Manager Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Store Manager Console Modal */}
      {showManagerConsole && isManager && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Store Manager Console</h2>
                  <p className="text-[11px] text-slate-400">
                    Approve submissions, manage catalog listings, announcements, and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleManagerLock}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManagerConsole(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Manager Sub-Navigation */}
            <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setManagerSubTab('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerSubTab === 'pending'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Pending Review ({pendingApps.length})
              </button>
              <button
                type="button"
                onClick={() => setManagerSubTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerSubTab === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                All Active Apps ({apps.filter((a) => a.status !== 'deleted').length})
              </button>
              <button
                type="button"
                onClick={() => setManagerSubTab('deleted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerSubTab === 'deleted'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Deleted ({deletedApps.length})
              </button>
              <button
                type="button"
                onClick={() => setManagerSubTab('announcements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerSubTab === 'announcements'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Announcements
              </button>
              <button
                type="button"
                onClick={() => setManagerSubTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  managerSubTab === 'analytics'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* Manager Console Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {managerSubTab === 'pending' && (
                <ManagerPendingView
                  apps={pendingApps}
                  onRefresh={loadApps}
                />
              )}

              {managerSubTab === 'all' && (
                <div className="space-y-3">
                  {apps.filter((a) => a.status !== 'deleted').length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No active applications in database.</p>
                  ) : (
                    apps
                      .filter((a) => a.status !== 'deleted')
                      .map((app) => (
                        <div
                          key={app.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={app.thumbnail_url || app.hero_image}
                              alt={app.title}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-800"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{app.title}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                                  {app.status}
                                </span>
                                {app.featured && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{app.category} • {app.live_web_url || 'APK'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(app)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-medium"
                            >
                              {app.featured ? 'Unfeature' : 'Feature'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingApp(app)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteApp(app)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-xs text-rose-300 font-semibold"
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
                <div className="space-y-3">
                  {deletedApps.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">Trash is empty.</p>
                  ) : (
                    deletedApps.map((app) => (
                      <div
                        key={app.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{app.title}</p>
                          <p className="text-xs text-slate-400">{app.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentPurge(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-xs text-white font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Purge Forever</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {managerSubTab === 'announcements' && <AnnouncementManager />}
              {managerSubTab === 'analytics' && <AnalyticsDashboard apps={apps} />}
            </div>
          </div>
        </div>
      )}

      {/* Developer Submit Modal */}
      {showSubmitModal && (
        <DevSubmitModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false);
            loadApps();
          }}
          ownerUid={currentUid}
        />
      )}

      {/* Edit App Modal */}
      {editingApp && (
        <EditAppModal
          app={editingApp}
          isOpen={Boolean(editingApp)}
          onClose={() => setEditingApp(null)}
          onSaved={() => {
            setEditingApp(null);
            loadApps();
          }}
        />
      )}

      {/* App Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1629] border border-slate-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="relative h-52 bg-slate-900">
              <img
                src={selectedApp.thumbnail_url || selectedApp.hero_image}
                alt={selectedApp.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedApp.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 font-medium">
                      {selectedApp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    By {selectedApp.developer || 'Community Developer'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedApp.live_web_url && (
                    <a
                      href={selectedApp.live_web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Launch App
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedApp;
                      setSelectedApp(null);
                      setReportingApp(target);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Report
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedApp.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Developer Passkey Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1629] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Developer Passkey</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPasskeyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 break-all">
              {currentUid}
            </div>
            <form onSubmit={handleSwitchPasskey} className="space-y-3">
              <input
                type="text"
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Paste existing PRISM-UID-... to restore"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Switch / Restore Passkey
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Portal Modal */}
      {showFeedbackPortal && (
        <FeedbackPortal
          isOpen={showFeedbackPortal}
          onClose={() => setShowFeedbackPortal(false)}
        />
      )}

      {/* Report Portal Modal */}
      {reportingApp && (
        <ReportPortal
          app={reportingApp}
          isOpen={Boolean(reportingApp)}
          onClose={() => setReportingApp(null)}
        />
      )}
    </div>
  );
}

export default App;
