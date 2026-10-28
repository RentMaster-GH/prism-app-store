import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';

function maskUID(uid:string){
  if(!uid) return '••••';
  const p = uid.split('-');
  return p.length>=4 ? `${p[0]}-••••-${p[3]}` : uid.slice(0,8)+'••••';
}

export function TopBar({ currentTab, onSelectTab, onOpenDevModal, onDirectInstall, userUID, isStoreManager, onOpenManagerAuth }: any) {
  const [showFull, setShowFull] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#05060f]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-black">P</div>
          <span className="font-bold text-sm">Prism Store</span>
          <nav className="hidden md:flex gap-1 ml-4">
            <button onClick={()=>onSelectTab('discover')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='discover'?'bg-white text-black':'text-white/60'}`}>Discover</button>
            <button onClick={()=>onSelectTab('apps')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='apps'?'bg-white text-black':'text-white/60'}`}>All Software</button>
            <button onClick={()=>onSelectTab('library')} className={`px-3 py-1.5 rounded-full text-xs ${currentTab==='library'?'bg-white text-black':'text-white/60'}`}>Library</button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {!isStoreManager ? (
            <button onClick={onOpenManagerAuth} className="h-8 px-3 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-white/60 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5"/> Manager Sign In
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button onClick={onOpenManagerAuth} className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">
                {showFull ? userUID : maskUID(userUID)} • Manager
              </button>
              <button onClick={()=>setShowFull(v=>!v)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                {showFull ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
              </button>
            </div>
          )}
          {/* FIX: center aligned with flex items-center justify-center */}
          <button onClick={onOpenDevModal} className="h-8 px-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
            Dev Submit
          </button>
          <button onClick={onDirectInstall} className="h-8 px-4 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">Install</button>
        </div>
      </div>
    </header>
  );
}