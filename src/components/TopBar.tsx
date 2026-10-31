import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Key, Copy, Check, Menu, X, MessageSquare, Library, Compass, AppWindow } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  currentTab: string;
  onSelectTab: (t: any) => void;
  onOpenDevModal: () => void;
  onOpenInstallModal: () => void;
  onDirectInstall: () => void;
  userUID: string;
  isStoreManager: boolean;
  onOpenManagerAuth: () => void;
  onOpenOwnerGuide?: () => void;
  onOpenSyncHub?: () => void;
  isStandalone?: boolean;
  installedCount?: number;
}

function maskUID(uid: string) {
  if (!uid) return '••••';
  const p = uid.split('-');
  return p.length >= 4 ? `${p[0]}-••••-${p[3]}` : uid.slice(0, 8) + '••••';
}
function generateOwnerPasskey() {
  const raw = 'PRISM-' + crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase() + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const slug = 'p-' + Math.random().toString(36).slice(2,9).toLowerCase();
  return { raw, slug };
}
async function hashPasskey(raw: string) {
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

export function TopBar({ currentTab, onSelectTab, onOpenDevModal, onDirectInstall, userUID, isStoreManager, onOpenManagerAuth }: Props) {
  const [showFull, setShowFull] = useState(false);
  const [portalSlug, setPortalSlug] = useState(() => localStorage.getItem('prism_portal_slug') || '');
  const [showKeyModal, setShowKeyModal] = useState<{slug:string, key:string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCreatePortal = async () => {
    if (!userUID || creating) return;
    setCreating(true);
    try {
      const existing = localStorage.getItem('prism_portal_slug');
      if (existing) {
        window.location.hash = `#/p/${existing}`;
        onSelectTab('portal');
        setMobileOpen(false);
        return;
      }
      const { raw, slug } = generateOwnerPasskey();
      const hash = await hashPasskey(raw);
      if (supabase) {
        const { error } = await supabase.from('owner_portals').insert({ owner_uid: userUID, slug, passkey_hash: hash });
        if (error) {
          const { data } = await supabase.from('owner_portals').select('slug').eq('owner_uid', userUID).single();
          if (data?.slug) {
            localStorage.setItem('prism_portal_slug', data.slug);
            setPortalSlug(data.slug);
            window.location.hash = `#/p/${data.slug}`;
            onSelectTab('portal');
            setCreating(false);
            return;
          }
          throw error;
        }
      }
      localStorage.setItem('prism_portal_slug', slug);
      localStorage.setItem('prism_portal_key', raw);
      setPortalSlug(slug);
      setShowKeyModal({ slug, key: raw });
      setMobileOpen(false);
    } catch (e:any) { alert('Failed: ' + (e.message || String(e))); }
    finally { setCreating(false); }
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060f]/90 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={()=>setMobileOpen(v=>!v)} className="md:hidden w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black leading-none shrink-0">P</div>
            <span className="font-bold text-sm hidden sm:block">Prism Store</span>
            
            <nav className="hidden md:flex gap-1 ml-2 overflow-x-auto scrollbar-hide">
              <button onClick={()=>onSelectTab('discover')} className={`px-3 h-8 rounded-full text-xs whitespace-nowrap ${currentTab==='discover'?'bg-white text-black':'text-white/60 hover:bg-white/10'}`}>Discover</button>
              <button onClick={()=>onSelectTab('apps')} className={`px-3 h-8 rounded-full text-xs whitespace-nowrap ${currentTab==='apps'?'bg-white text-black':'text-white/60 hover:bg-white/10'}`}>All Software</button>
              <button onClick={()=>onSelectTab('library')} className={`px-3 h-8 rounded-full text-xs whitespace-nowrap ${currentTab==='library'?'bg-white text-black':'text-white/60 hover:bg-white/10'}`}>Library</button>
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* ADDED NEXT TO DEV SUBMIT */}
            <button onClick={()=>onSelectTab('feedback')} className={`h-9 px-3 rounded-full text-[11px] font-bold border ${currentTab==='feedback'?'bg-white text-black border-white':'bg-white/[0.06] border-white/10 text-white/70 hover:bg-white/10'}`}>Feedback</button>
            
            <button onClick={()=>onSelectTab('myapps')} className={`h-9 px-3 rounded-full text-[11px] font-bold border flex items-center gap-1 ${currentTab==='myapps'?'bg-indigo-600 text-white border-indigo-600':'bg-white/[0.06] border-white/10 text-white/70'}`}>
              <Key className="w-3 h-3"/> My Apps
            </button>

            <button onClick={handleCreatePortal} disabled={creating} className={`h-9 px-3 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 border ${portalSlug ? 'bg-white/[0.06] border-white/10 text-white/80' : 'bg-white text-black border-white'}`}>
              <Key className="w-3.5 h-3.5"/>{creating ? '...' : portalSlug ? portalSlug : 'Create Portal'}
            </button>

            <button onClick={onOpenManagerAuth} className="h-9 w-9 sm:w-auto sm:px-3 rounded-full bg-white/[0.06] border border-white/10 text-white/70 flex items-center justify-center gap-1.5">
              <Shield className="w-4 h-4"/><span className="hidden sm:block text-[11px]">{isStoreManager ? (showFull ? userUID.slice(0,12) : maskUID(userUID)) : 'Manager'}</span>
            </button>
            {isStoreManager && <button onClick={()=>setShowFull(v=>!v)} className="hidden sm:flex w-9 h-9 rounded-full bg-white/10 items-center justify-center">{showFull ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button>}
            <button onClick={onOpenDevModal} className="h-9 px-3 sm:px-4 rounded-full bg-indigo-600 text-white text-xs font-bold">Dev</button>
            <button onClick={onDirectInstall} className="h-9 px-4 rounded-full bg-white text-black text-xs font-bold hidden sm:flex items-center justify-center text-center leading-none">Install</button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#080a14]/95 backdrop-blur-xl">
            <div className="p-3 grid grid-cols-2 gap-2">
              <button onClick={()=>{onSelectTab('discover'); setMobileOpen(false)}} className={`h-12 rounded-xl text-sm font-medium flex items-center gap-2 px-4 ${currentTab==='discover'?'bg-white text-black':'bg-white/[0.06] text-white/70'}`}><Compass className="w-4 h-4"/> Discover</button>
              <button onClick={()=>{onSelectTab('apps'); setMobileOpen(false)}} className={`h-12 rounded-xl text-sm font-medium flex items-center gap-2 px-4 ${currentTab==='apps'?'bg-white text-black':'bg-white/[0.06] text-white/70'}`}><AppWindow className="w-4 h-4"/> All Apps</button>
              <button onClick={()=>{onSelectTab('library'); setMobileOpen(false)}} className={`h-12 rounded-xl text-sm font-medium flex items-center gap-2 px-4 ${currentTab==='library'?'bg-white text-black':'bg-white/[0.06] text-white/70'}`}><Library className="w-4 h-4"/> Library</button>
              <button onClick={()=>{onSelectTab('feedback'); setMobileOpen(false)}} className={`h-12 rounded-xl text-sm font-medium flex items-center gap-2 px-4 ${currentTab==='feedback'?'bg-white text-black':'bg-white/[0.06] text-white/70'}`}><MessageSquare className="w-4 h-4"/> Feedback</button>
              <button onClick={()=>{onSelectTab('myapps'); setMobileOpen(false)}} className={`h-12 col-span-2 rounded-xl text-sm font-medium flex items-center gap-2 px-4 ${currentTab==='myapps'?'bg-indigo-600 text-white':'bg-white/[0.06] text-white/70'}`}><Key className="w-4 h-4"/> My Portal {portalSlug && `(${portalSlug})`}</button>
            </div>
          </div>
        )}
      </header>

      {showKeyModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1020] border border-white/10 rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-auto">
            <h3 className="font-bold text-white">Your Private Portal Created!</h3>
            <p className="text-xs text-white/60">Shown ONCE. Save it.</p>
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="text-[10px] text-white/40">PORTAL URL</div>
              <div className="text-xs font-mono text-indigo-300 break-all">#/p/{showKeyModal.slug}</div>
              <div className="text-[10px] text-white/40 mt-2">PASSKEY</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-mono font-bold text-white break-all flex-1">{showKeyModal.key}</div>
                <button onClick={async () => { await navigator.clipboard.writeText(showKeyModal.key); setCopied(true); setTimeout(()=>setCopied(false),1500); }} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shrink-0">{copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}</button>
              </div>
            </div>
            <button onClick={() => { setShowKeyModal(null); window.location.hash=`#/p/${showKeyModal.slug}`; onSelectTab('portal'); }} className="w-full h-11 bg-white text-black rounded-full font-bold text-sm">I Saved It — Open Portal</button>
          </div>
        </div>
      )}
    </>
  );
}