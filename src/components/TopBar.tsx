import React, { useState } from 'react';
import { Search, Code2, Download, Box, Shield, Eye, EyeOff } from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (t: any) => void;
  onOpenDevModal: () => void;
  onOpenOwnerGuide: () => void;
  onOpenInstallModal: () => void;
  onDirectInstall: () => void;
  onOpenSyncHub: () => void;
  isStandalone: boolean;
  installedCount: number;
  userUID: string;
  isStoreManager: boolean;
  onOpenManagerAuth: () => void;
}

function maskUID(uid: string) {
  if (!uid) return '••••';
  // PRISM-UID-8015-A3M -> PRISM-••••-A3M
  const parts = uid.split('-');
  if (parts.length >= 4) return `${parts[0]}-${parts[1]}-••••-${parts[3]}`;
  return uid.slice(0, 8) + '••••';
}

export function TopBar({ currentTab, onSelectTab, onOpenDevModal, onOpenInstallModal, onDirectInstall, userUID, isStoreManager, onOpenManagerAuth }: Props) {
  const [showFull, setShowFull] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060f]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black">P</div>
          <span className="font-bold text-sm hidden sm:block">Prism Store</span>
          <nav className="hidden md:flex gap-1 ml-4">
            <button onClick={()=>onSelectTab('discover')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='discover'?'bg-white text-black':'text-white/60'}`}>Discover</button>
            <button onClick={()=>onSelectTab('apps')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='apps'?'bg-white text-black':'text-white/60'}`}>All Software</button>
            <button onClick={()=>onSelectTab('library')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='library'?'bg-white text-black':'text-white/60'}`}>Library</button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* SECURE: Public NEVER sees PRISM-UID-8015. Only Guest/Sign In */}
          {!isStoreManager ? (
            <button
              onClick={onOpenManagerAuth}
              className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/60 hover:bg-white/10 flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5"/> Manager Sign In
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenManagerAuth}
                className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-bold flex items-center gap-1.5"
                title="Owner only - masked"
              >
                {showFull ? userUID : maskUID(userUID)} • Manager
              </button>
              <button onClick={()=>setShowFull(v=>!v)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {showFull ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
              </button>
            </div>
          )}

          <button onClick={onOpenDevModal} className="h-8 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold hidden sm:flex">Dev Submit</button>
          <button onClick={onDirectInstall} className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold">Install</button>
        </div>
      </div>
    </header>
  );
}