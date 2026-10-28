import React, { useState } from 'react';
import { X, Shield, Lock, Eye, EyeOff, Copy, Check } from 'lucide-react';

const MANAGER_SECRET = import.meta.env.VITE_MANAGER_SECRET || 'PRISM-OWNER-CHANGE-ME';

function maskUID(uid: string) {
  if (!uid) return '••••••••';
  if (uid.length < 10) return '••••••••';
  return uid.slice(0, 9) + '••••' + uid.slice(-3);
}

export function ManagerAuthModal({ isOpen, onClose, userUID, onUpdateUID, isStoreManager, onSetStoreManager }: any) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleBecomeManager = () => {
    if (input.trim() === MANAGER_SECRET) {
      onSetStoreManager(true);
      localStorage.setItem('prism_is_store_manager', 'true');
      setInput(''); setError(''); onClose();
    } else {
      setError('Invalid manager secret');
    }
  };

  const handleCopy = async () => {
    if (!isStoreManager) return;
    try { await navigator.clipboard.writeText(userUID); setCopied(true); setTimeout(()=>setCopied(false), 1200); } catch {}
  };

  const masked = showFull && isStoreManager ? userUID : maskUID(userUID);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10111f] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-[11px] tracking-widest font-bold text-white/60 flex items-center gap-2"><Shield className="w-4 h-4"/> AUTH & GOVERNANCE</h2>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-100/10 border border-amber-200/20 rounded-xl">
            <p className="text-[11px] font-bold text-amber-200">Restricted Access</p>
            <p className="text-[10px] text-amber-100/60 mt-1">Passkeys are private. Only owner can reveal.</p>
          </div>

          <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
            <div className="text-[10px] text-white/40 uppercase flex justify-between">
              Current UID {isStoreManager && <span className="text-[10px] px-2 py-0.5 bg-emerald-400 text-black rounded-full">Owner Verified</span>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 font-mono text-xs text-white select-none">{masked}</div>
              {isStoreManager && (
                <>
                  <button onClick={()=>setShowFull(v=>!v)} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                    {showFull ? <EyeOff className="w-3.5 h-3.5"/> : <Eye className="w-3.5 h-3.5"/>}
                  </button>
                  <button onClick={handleCopy} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </>
              )}
            </div>
            {!isStoreManager && <p className="text-[10px] text-white/30 mt-2">Sign in as manager to reveal your passkey</p>}
          </div>

          {!isStoreManager ? (
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> Manager Secret (not UID)</label>
              <input value={input} onChange={e=>setInput(e.target.value)} placeholder="••••••••" type="password" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white outline-none"/>
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <button onClick={handleBecomeManager} className="w-full h-11 bg-white text-black rounded-full text-sm font-bold">Authenticate</button>
            </div>
          ) : (
            <div className="space-y-2">
              <button onClick={()=>{ onSetStoreManager(false); localStorage.removeItem('prism_is_store_manager'); onClose(); }} className="w-full h-10 bg-red-500/20 text-red-300 border border-red-500/20 rounded-full text-xs">Logout & Hide Passkey</button>
              <button onClick={onClose} className="w-full h-10 bg-white/10 text-white rounded-full text-xs">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}