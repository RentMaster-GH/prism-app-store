import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Key, Copy, Check } from 'lucide-react';
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
}

function maskUID(uid: string) {
  if (!uid) return '••••';
  const p = uid.split('-');
  return p.length >= 4 ? `${p[0]}-••••-${p[3]}` : uid.slice(0, 8) + '••••';
}

function generateOwnerPasskey() {
  const raw = 'PRISM-' + crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase() 
            + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
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

  const handleCreatePortal = async () => {
    if (!userUID) return;
    if (creating) return;
    setCreating(true);
    try {
      const existing = localStorage.getItem('prism_portal_slug');
      if (existing) {
        onSelectTab('myapps');
        window.location.hash = `#/p/${existing}`;
        setCreating(false);
        return;
      }
      const { raw, slug } = generateOwnerPasskey();
      const hash = await hashPasskey(raw);
      
      if (supabase) {
        const { error } = await supabase.from('owner_portals').insert({
          owner_uid: userUID,
          slug,
          passkey_hash: hash
        });
        if (error) {
          const { data } = await supabase.from('owner_portals').select('slug').eq('owner_uid', userUID).single();
          if (data?.slug) {
            localStorage.setItem('prism_portal_slug', data.slug);
            setPortalSlug(data.slug);
            onSelectTab('myapps');
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
    } catch (e:any) {
      alert('Failed: ' + (e.message || String(e)));
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060f]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black leading-none">P</div>
            <span className="font-bold text-sm">Prism Store</span>
            <nav className="hidden md:flex gap-1 ml-4">
              <button onClick={()=>onSelectTab('discover')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='discover'?'bg-white text-black':'text-white/60'}`}>Discover</button>
              <button onClick={()=>onSelectTab('apps')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='apps'?'bg-white text-black':'text-white/60'}`}>All Software</button>
              <button onClick={()=>onSelectTab('library')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='library'?'bg-white text-black':'text-white/60'}`}>Library</button>
              <button onClick={()=>onSelectTab('feedback')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='feedback'?'bg-white text-black':'text-white/60'}`}>Feedback</button>
              {portalSlug && (
                <button onClick={()=>onSelectTab('myapps')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none gap-1 ${currentTab==='myapps'?'bg-indigo-600 text-white':'text-white/60 border border-white/10'}`}>
                  <Key className="w-3 h-3"/> My Portal
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreatePortal}
              disabled={creating}
              className={`h-8 px-3 rounded-full text-[11px] font-bold inline-flex items-center justify-center gap-1.5 leading-none border transition
                ${portalSlug ? 'bg-white/[0.06] border-white/10 text-white/80' : 'bg-white text-black border-white hover:bg-white/90'}`}
            >
              <Key className="w-3.5 h-3.5"/>
              {creating ? 'Creating...' : portalSlug ? `My Portal: ${portalSlug}` : 'Create Owner Portal'}
            </button>

            {!isStoreManager ? (
              <button type="button" onClick={onOpenManagerAuth} className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/60 inline-flex items-center justify-center gap-1.5 leading-none">
                <Shield className="w-3.5 h-3.5"/> Manager
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button type="button" onClick={onOpenManagerAuth} className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-bold inline-flex items-center justify-center leading-none">
                  {showFull ? userUID : maskUID(userUID)} • Manager
                </button>
                <button type="button" onClick={()=>setShowFull(v=>!v)} className="w-8 h-8 rounded-full bg-white/10 inline-flex items-center justify-center">
                  {showFull ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenDevModal}
              className="h-8 min-w-[92px] px-5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center justify-center leading-none text-center"
              style={{ lineHeight: '1', paddingTop: '0px', paddingBottom: '1px' }}
            >
              Dev Submit
            </button>

            <button type="button" onClick={onDirectInstall} className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold inline-flex items-center justify-center leading-none">
              Install
            </button>
          </div>
        </div>
      </header>

      {showKeyModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1020] border border-white/10 rounded-2xl max-w-md w-full p-5 space-y-4">
            <h3 className="font-bold text-white">Your Private Owner Portal Created!</h3>
            <p className="text-xs text-white/60">This key is shown ONCE. Save it — you need it to open your portal on any device.</p>
            <div className="bg-white/[0.05] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="text-[10px] text-white/40 uppercase">Portal URL</div>
              <div className="text-xs font-mono text-indigo-300">/p/{showKeyModal.slug}</div>
              <div className="text-[10px] text-white/40 uppercase mt-3">Passkey</div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-mono font-bold text-white break-all">{showKeyModal.key}</div>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(showKeyModal.key);
                    setCopied(true);
                    setTimeout(()=>setCopied(false), 1500);
                  }}
                  className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shrink-0"
                >
                  {copied ? <Check className="w-4 h-4"/> : <Copy className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button
              onClick={() => { setShowKeyModal(null); onSelectTab('myapps'); }}
              className="w-full h-10 bg-white text-black rounded-full font-bold text-sm"
            >
              I Saved My Key — Open My Portal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
