import React, { useEffect, useState, useMemo } from 'react';
import { Key, Loader2, ShieldCheck, Lock, Copy, Check, Edit3, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppItem, InstalledAppState } from '../types';
import { AppCard } from './AppCard';

type PortalRow = {
  owner_uid: string;
  slug: string;
  passkey_hash: string;
  created_at: string;
}

async function hashPasskey(raw: string) {
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

interface Props {
  slug: string;
  allApps: AppItem[];
  installedMap: Record<string, InstalledAppState>;
  currentUserUID: string;
  onOpenDetails: (app: AppItem, tab?: 'overview'|'test-drive') => void;
  onQuickInstall: (app: AppItem) => void;
  onEdit: (app: AppItem) => void;
  onDelete: (appId: string) => void;
  onBack: () => void;
}

export function OwnerPortalView({ slug, allApps, installedMap, currentUserUID, onOpenDetails, onQuickInstall, onEdit, onDelete, onBack }: Props) {
  const [portal, setPortal] = useState<PortalRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-verify if user is owner on this device (has key saved)
  useEffect(() => {
    const savedKey = localStorage.getItem('prism_portal_key') || '';
    const savedSlug = localStorage.getItem('prism_portal_slug') || '';
    if (savedSlug === slug && savedKey) {
      setPasskeyInput(savedKey);
    }
  }, [slug]);

  useEffect(() => {
    const fetchPortal = async () => {
      setLoading(true);
      setError('');
      if (!supabase) {
        // fallback for local dev without supabase - allow if slug matches local
        const localSlug = localStorage.getItem('prism_portal_slug');
        const localUID = localStorage.getItem('prism_user_uid');
        if (localSlug === slug && localUID) {
          setPortal({ owner_uid: localUID, slug, passkey_hash: 'local', created_at: new Date().toISOString() });
        } else {
          setError('Portal not found locally. Create one from Top Bar.');
        }
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('owner_portals').select('*').eq('slug', slug).single();
      if (error || !data) {
        setError('Portal not found. Check slug: ' + slug);
        setLoading(false);
        return;
      }
      setPortal(data as PortalRow);
      setLoading(false);
    };
    fetchPortal();
  }, [slug]);

  const handleVerify = async () => {
    if (!portal || !passkeyInput.trim()) return;
    setVerifying(true);
    try {
      if (portal.passkey_hash === 'local') {
        // local fallback - any key works if owner_uid matches current user
        if (portal.owner_uid === currentUserUID) {
          setVerified(true);
        } else {
          setError('Local portal belongs to different UID. Use correct device.');
        }
        setVerifying(false);
        return;
      }
      const hash = await hashPasskey(passkeyInput.trim());
      if (hash === portal.passkey_hash) {
        setVerified(true);
        // remember verification for this slug session
        sessionStorage.setItem(`portal_verified_${slug}`, 'true');
      } else {
        setError('Invalid passkey. Ask owner for correct key.');
      }
    } catch (e:any) {
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  };

  // check session already verified
  useEffect(() => {
    if (sessionStorage.getItem(`portal_verified_${slug}`) === 'true') {
      setVerified(true);
    }
  }, [slug]);

  const ownerApps = useMemo(() => {
    if (!portal) return [];
    return allApps.filter((a:any) => {
      const owner = a.ownerId || a.owner_uid || a.owner_id || a.raw?.owner_uid;
      return owner === portal.owner_uid;
    });
  }, [allApps, portal]);

  const totalInstalls = useMemo(() => {
    return ownerApps.reduce((sum, a:any) => sum + (parseInt(String(a.downloadsCount||'0').replace(/\D/g,'')) || a.raw?.install_count || 0), 0);
  }, [ownerApps]);

  if (loading) {
    return <div className="py-20 flex flex-col items-center gap-3"><Loader2 className="w-6 h-6 animate-spin text-white/50"/><p className="text-xs text-white/50">Loading portal {slug}...</p></div>;
  }

  if (error && !portal) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto"><Lock className="w-6 h-6 text-red-400"/></div>
        <p className="text-sm text-red-300">{error}</p>
        <button onClick={onBack} className="h-9 px-4 bg-white text-black rounded-full text-xs font-bold">Back to Store</button>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white/[0.04] border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center"><Key className="w-5 h-5 text-white"/></div>
          <div>
            <h2 className="font-bold text-sm">Private Owner Portal</h2>
            <p className="text-[11px] text-white/50">/{slug} • Owner {portal?.owner_uid.slice(0,12)}••••</p>
          </div>
        </div>
        <div className="p-3 bg-black/30 rounded-xl border border-white/10">
          <p className="text-xs text-white/70">This portal is protected. Only the owner with the unique passkey can view and manage apps here.</p>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] text-white/50 uppercase">Enter Owner Passkey</label>
          <input
            value={passkeyInput}
            onChange={e=>setPasskeyInput(e.target.value)}
            placeholder="PRISM-xxxxxxxx-xxxx"
            className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-full text-sm font-mono text-white placeholder:text-white/20 focus:border-indigo-500 outline-none"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>
        <button onClick={handleVerify} disabled={verifying || !passkeyInput} className="w-full h-11 bg-white text-black rounded-full font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {verifying ? <><Loader2 className="w-4 h-4 animate-spin"/> Verifying...</> : <><ShieldCheck className="w-4 h-4"/> Unlock Portal</>}
        </button>
        <button onClick={onBack} className="w-full h-9 text-xs text-white/40 hover:text-white/70">← Back to public store</button>
      </div>
    );
  }

  // VERIFIED VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-black"/></div>
          <div>
            <h2 className="font-bold text-sm flex items-center gap-2">Owner Portal Verified <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full text-[10px]">/{slug}</span></h2>
            <p className="text-[11px] text-white/50">Owner UID: {portal?.owner_uid} • {ownerApps.length} apps • {totalInstalls} total installs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(()=>setCopied(false), 1500); }} className="h-8 px-3 bg-white/10 border border-white/10 rounded-full text-xs flex items-center gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5"/> : <Copy className="w-3.5 h-3.5"/>} {copied ? 'Copied Link' : 'Copy Portal Link'}
          </button>
          <button onClick={onBack} className="h-8 px-3 bg-white text-black rounded-full text-xs font-bold">Exit Portal</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl"><div className="text-[11px] text-white/40 flex items-center gap-1"><BarChart3 className="w-3 h-3"/> APPS</div><div className="text-xl font-bold">{ownerApps.length}</div></div>
        <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl"><div className="text-[11px] text-white/40">INSTALLS</div><div className="text-xl font-bold">{totalInstalls}</div></div>
        <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl"><div className="text-[11px] text-white/40">STATUS</div><div className="text-xl font-bold text-emerald-400">Private</div></div>
      </div>

      {ownerApps.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-sm">No apps in this portal yet.</p>
          <p className="text-xs text-white/40 mt-1">Publish via Dev Submit — it will auto-tag to your UID.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ownerApps.map((app, idx) => (
            <div key={app.id} className="relative group">
              <AppCard index={idx} app={app} installedState={installedMap[app.id]} onOpenDetails={onOpenDetails} onQuickInstall={onQuickInstall} onOpenSandbox={(a)=>onOpenDetails(a,'test-drive')} />
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={()=>onEdit(app)} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow"><Edit3 className="w-4 h-4"/></button>
                <button onClick={()=>{ if(confirm(`Delete ${app.name}?`)) onDelete(app.id); }} className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
              </div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <div className="px-2 py-0.5 bg-black/70 backdrop-blur text-[10px] rounded-full flex items-center gap-1"><ExternalLink className="w-3 h-3"/>{app.downloadsCount || 0} installs</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
