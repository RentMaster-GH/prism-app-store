// app/page.tsx - Prism App Store with 3 Portals + Manager Reports View - FINAL
'use client';

import { useState, useEffect } from 'react';

type AppItem = {
  id: string;
  name: string;
  category: 'Labyrinth' | 'Game' | 'Tool' | 'Utility' | 'Other';
  status: 'approved' | 'pending';
  owner?: string;
  image: string;
};

type FeedbackItem = {
  id: string;
  uid: string;
  type: 'issue' | 'suggestion';
  category: string;
  app_name: string | null;
  message: string;
  status: 'open' | 'reviewing' | 'resolved' | 'closed';
  created_at: string;
};

const MOCK_APPS: AppItem[] = [
  { id: '1', name: 'Rant Master', category: 'Tool', status: 'approved', image: 'https://picsum.photos/seed/rant/400/300', owner: 'rantmaster@prism.app' },
  { id: '2', name: 'Credible artisans', category: 'Other', status: 'approved', image: 'https://picsum.photos/seed/credible/400/300', owner: 'Ason' },
  { id: '3', name: 'Horror - The ivory labyrinth', category: 'Labyrinth', status: 'approved', image: 'https://picsum.photos/seed/horror/400/300' },
];

export default function PrismStorePage() {
  const [userUid, setUserUid] = useState<string | null>(null);
  const [managerGid, setManagerGid] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  
  const [showManagerAuth, setShowManagerAuth] = useState(false);
  const [showUserPortal, setShowUserPortal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [gidInput, setGidInput] = useState('PRIZM-GID-***-MLR');
  const [secretInput, setSecretInput] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [userSaving, setUserSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Labyrinth' | 'Game' | 'Tool' | 'Utility' | 'Other' | 'Featured' | 'My Uploads'>('All');
  const [feedbackType, setFeedbackType] = useState<'issue' | 'suggestion'>('issue');
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // NEW: Manager Console states
  const [managerView, setManagerView] = useState<'all' | 'detailed' | 'reports' | 'analytics'>('all');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    let uid = localStorage.getItem('prism_uid');
    if (!uid) {
      uid = `PRISM-UID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      localStorage.setItem('prism_uid', uid);
    }
    setUserUid(uid);
    
    const savedManager = localStorage.getItem('prism_manager_gid');
    if (savedManager) {
      setManagerGid(savedManager);
      setIsManager(true);
    }
  }, []);

  // NEW: Fetch feedbacks when manager opens Reports tab
  useEffect(() => {
    if (isManager && managerView === 'reports') {
      fetchFeedbacks();
    }
  }, [isManager, managerView]);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (Array.isArray(data)) setFeedbacks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const updateFeedbackStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: status as any } : f));
    } catch (e) {
      alert('Failed to update');
    }
  };

  const handleManagerAuth = () => {
    if (gidInput.includes('PRIZM') && secretInput.length >= 6) {
      localStorage.setItem('prism_manager_gid', gidInput);
      setManagerGid(gidInput);
      setIsManager(true);
      setShowManagerAuth(false);
    } else {
      alert('Invalid Manager Secret Key');
    }
  };

  const handleContinueAsUser = async () => {
    if (!userUid) return;
    setUserSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userUid, display_name: displayName.trim() || null, email: email.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setShowUserPortal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setUserSaving(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userUid) return;
    setFeedbackSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        uid: userUid,
        type: feedbackType,
        category: formData.get('category'),
        message: formData.get('message'),
        appName: formData.get('appName') || null,
      };
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      alert(`Thanks ${userUid}! Your ${feedbackType} was recorded.`);
      setShowFeedback(false);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setFeedbackSaving(false);
    }
  };

  const filteredApps = MOCK_APPS.filter(app => {
    if (activeTab !== 'All' && activeTab !== 'Featured' && activeTab !== 'My Uploads') {
      if (app.category !== activeTab) return false;
    }
    if (search && !app.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080a14] text-white selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#080a14]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-black tracking-tight">
              <span className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center text-[12px]">P</span>
              Prism Store
            </div>
            <nav className="hidden md:flex items-center gap-1 text-xs">
              <button className="px-3 py-1.5 rounded-full bg-white text-black font-bold">Store</button>
              <button className="px-3 py-1.5 rounded-full hover:bg-white/10 opacity-60">Discover</button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowFeedback(true)} className="hidden md:inline-flex h-8 px-3 rounded-full border border-white/20 text-xs hover:bg-white/10">
              Report / Suggest
            </button>
            <button onClick={() => setShowUserPortal(true)} className="h-8 px-3 rounded-full bg-white/10 border border-white/10 text-xs font-medium hover:bg-white/15">
              {userUid ? `${userUid.slice(0,12)}... • User` : 'User Portal'}
            </button>
            {isManager ? (
              <div className="h-8 px-3 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {managerGid} • Manager
              </div>
            ) : (
              <button onClick={() => setShowManagerAuth(true)} className="h-8 px-3 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10">
                Manager Sign In
              </button>
            )}
            <button className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold">Install</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 mt-4">
        <div className="h-12 rounded-xl bg-[#111328] border border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-lg bg-[#7c4dff] flex items-center justify-center">◍</span>
            <span className="font-medium">Install Prism Store Directly To Your Device</span>
          </div>
          <button className="h-7 px-3 rounded-full bg-white text-black text-xs font-bold">Direct Install Now</button>
        </div>
      </div>

      {/* MANAGER CONSOLE WITH REPORTS VIEW */}
      {isManager && (
        <div className="mx-auto max-w-[1400px] px-4 mt-6">
          <div className="rounded-2xl bg-[#111328] border border-white/10 p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-bold">Manager Console (Owner Only) — {feedbacks.length} feedbacks</h2>
              <div className="flex gap-2 text-[10px]">
                <button onClick={() => setManagerView('all')} className={`px-3 py-1 rounded-full ${managerView==='all'?'bg-white text-black':'bg-white/10'}`}>All</button>
                <button onClick={() => setManagerView('detailed')} className={`px-3 py-1 rounded-full ${managerView==='detailed'?'bg-white text-black':'bg-white/10'}`}>Detailed</button>
                <button onClick={() => setManagerView('reports')} className={`px-3 py-1 rounded-full ${managerView==='reports'?'bg-white text-black font-bold':'bg-amber-400/20 text-amber-300 border border-amber-400/20'}`}>Reports ({feedbacks.length})</button>
                <button onClick={() => setManagerView('analytics')} className={`px-3 py-1 rounded-full ${managerView==='analytics'?'bg-white text-black':'bg-white/10'}`}>Analytics</button>
              </div>
            </div>

            {managerView === 'reports' ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {feedbackLoading ? (
                  <p className="text-xs opacity-50 py-8 text-center">Loading reports...</p>
                ) : feedbacks.length === 0 ? (
                  <p className="text-xs opacity-50 py-8 text-center">No reports yet. Users will appear here when they submit.</p>
                ) : (
                  feedbacks.map(f => (
                    <div key={f.id} className="rounded-xl bg-black/40 border border-white/10 p-3">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[10px] mb-1">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${f.type==='issue'?'bg-red-500/20 text-red-300':'bg-blue-500/20 text-blue-300'}`}>{f.type.toUpperCase()}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10">{f.category}</span>
                            <span className="font-mono opacity-60">{f.uid}</span>
                            <span className="opacity-40">{new Date(f.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm mt-1">{f.message}</p>
                          {f.app_name && <p className="text-[11px] opacity-50 mt-1">App: {f.app_name}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full text-center ${f.status==='open'?'bg-amber-500/20 text-amber-300': f.status==='resolved'?'bg-emerald-500/20 text-emerald-300':'bg-white/10'}`}>{f.status}</span>
                          <div className="flex gap-1">
                            <button onClick={() => updateFeedbackStatus(f.id, 'reviewing')} className="w-6 h-6 rounded-full bg-white/10 text-[10px]">👁</button>
                            <button onClick={() => updateFeedbackStatus(f.id, 'resolved')} className="w-6 h-6 rounded-full bg-emerald-500/20 text-[10px]">✓</button>
                            <button onClick={() => updateFeedbackStatus(f.id, 'closed')} className="w-6 h-6 rounded-full bg-red-500/20 text-[10px]">✕</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {MOCK_APPS.map(app => (
                  <div key={app.id} className="h-12 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between px-3 text-xs">
                    <span>{app.name} <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">approved</span></span>
                    <div className="flex gap-2">
                      <button className="px-2 py-1 rounded-full bg-white/10">Open</button>
                      <button className="w-6 h-6 rounded-full bg-amber-400/20">✎</button>
                      <button className="w-6 h-6 rounded-full bg-red-500/20">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-4 mt-6 flex items-center gap-2 text-xs">
        <button onClick={() => setActiveTab('All')} className={`px-3 py-1.5 rounded-full ${activeTab === 'All' ? 'bg-white text-black' : 'bg-white/10'}`}>All Software (13)</button>
        <button onClick={() => setActiveTab('Featured')} className={`px-3 py-1.5 rounded-full ${activeTab === 'Featured' ? 'bg-white text-black' : 'bg-white/10'}`}>Featured</button>
        <div className="h-4 w-px bg-white/10 mx-2" />
        {['All','Labyrinth','Game','Tool','Utility','Other'].map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat as any)} className={`px-3 py-1.5 rounded-full ${activeTab === cat ? 'bg-white text-black' : 'bg-white/5 border border-white/10'}`}>{cat}</button>
        ))}
      </div>

      <div className="mx-auto max-w-[1400px] px-4 mt-4">
        <div className="h-10 rounded-full bg-[#111328] border border-white/10 flex items-center px-4 gap-3">
          <span className="opacity-40">⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search apps..." className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40" />
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
        {filteredApps.map(app => (
          <div key={app.id} className="rounded-[16px] overflow-hidden bg-[#111328] border border-white/10">
            <div className="h-[140px] bg-white/5 relative">
              <img src={app.image} alt={app.name} className="w-full h-full object-cover opacity-60" />
              <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-black font-bold">{app.status}</span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-bold">{app.name}</h3>
              <p className="text-[11px] opacity-50">{app.owner || 'Prism'}</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-8 rounded-full bg-white text-black text-xs font-bold">Open</button>
                <button className="flex-1 h-8 rounded-full bg-white/10 border border-white/10 text-xs">Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showManagerAuth && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] rounded-[20px] bg-[#151727] border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs tracking-widest opacity-60">AUTH & GOVERNANCE</h3>
              <button onClick={() => setShowManagerAuth(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] opacity-60">Restricted Access</p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-[10px] opacity-60">MANAGER GID</p>
                <input value={gidInput} onChange={e => setGidInput(e.target.value)} className="w-full bg-transparent text-sm font-mono mt-1 outline-none" />
              </div>
              <div className="rounded-xl bg-black/40 border border-white/10 p-3">
                <p className="text-[10px] opacity-60">MANAGER SECRET KEY</p>
                <input value={secretInput} onChange={e => setSecretInput(e.target.value)} type="password" placeholder="Enter secret" className="w-full bg-transparent text-sm mt-1 outline-none" />
              </div>
              <button onClick={handleManagerAuth} className="w-full h-11 rounded-full bg-white text-black font-bold text-sm">Authenticate</button>
            </div>
          </div>
        </div>
      )}

      {showUserPortal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] rounded-[20px] bg-[#151727] border border-white/10 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs tracking-widest opacity-60">USER PORTAL</h3>
              <button onClick={() => setShowUserPortal(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>
            <div className="rounded-xl bg-white/[0.06] border border-white/10 p-4 mb-4">
              <p className="text-[10px] opacity-60">YOUR UNIQUE PRISM UID</p>
              <p className="font-mono font-bold text-sm mt-1">{userUid}</p>
            </div>
            <div className="space-y-3">
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display Name (optional)" className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm outline-none" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (optional)" className="w-full h-11 rounded-xl bg-black/30 border border-white/10 px-4 text-sm outline-none" />
            </div>
            <button onClick={handleContinueAsUser} disabled={userSaving} className="w-full h-11 rounded-full bg-white text-black font-bold text-sm mt-4 disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {userSaving ? 'Saving...' : `Continue as ${userUid?.slice(0,12)}`}
            </button>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[20px] bg-[#151727] border border-white/10 p-5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Report Issue / Suggest Improvement</h3>
              <button onClick={() => setShowFeedback(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setFeedbackType('issue')} className={`h-8 px-4 rounded-full text-xs font-bold ${feedbackType==='issue'?'bg-white text-black':'bg-white/10'}`}>Report Issue</button>
              <button onClick={() => setFeedbackType('suggestion')} className={`h-8 px-4 rounded-full text-xs font-bold ${feedbackType==='suggestion'?'bg-white text-black':'bg-white/10'}`}>Suggestion</button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input name="uid" defaultValue={userUid || ''} className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-xs font-mono" readOnly />
                <select name="category" className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm">
                  <option>Installation</option>
                  <option>App Crash</option>
                  <option>UI / Design</option>
                  <option>New Feature</option>
                  <option>Other</option>
                </select>
              </div>
              <input name="appName" placeholder="Which app? (optional)" className="w-full h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm outline-none" />
              <textarea name="message" required placeholder={feedbackType==='issue' ? "What went wrong?" : "How can we improve?"} className="w-full min-h-[110px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm outline-none" />
              <button type="submit" disabled={feedbackSaving} className="w-full h-11 rounded-full bg-white text-black font-bold text-sm disabled:opacity-50">
                {feedbackSaving ? 'Submitting...' : `Submit as ${userUid?.slice(0,12)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}