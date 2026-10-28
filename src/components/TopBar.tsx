import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

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

export function TopBar({ currentTab, onSelectTab, onOpenDevModal, onDirectInstall, userUID, isStoreManager, onOpenManagerAuth }: Props) {
  const [showFull, setShowFull] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060f]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black leading-none">P</div>
          <span className="font-bold text-sm">Prism Store</span>
          <nav className="hidden md:flex gap-1 ml-4">
            <button onClick={()=>onSelectTab('discover')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='discover'?'bg-white text-black':'text-white/60'}`}>Discover</button>
            <button onClick={()=>onSelectTab('apps')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='apps'?'bg-white text-black':'text-white/60'}`}>All Software</button>
            <button onClick={()=>onSelectTab('library')} className={`px-3 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none ${currentTab==='library'?'bg-white text-black':'text-white/60'}`}>Library</button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!isStoreManager ? (
            <button type="button" onClick={onOpenManagerAuth} className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/60 inline-flex items-center justify-center gap-1.5 leading-none">
              <Shield className="w-3.5 h-3.5"/> Manager Sign In
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

          {/* FIXED: perfectly centered Dev Submit */}
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
  );
}