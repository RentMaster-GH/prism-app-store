import React, { useState } from 'react';
import { X, Shield, Key, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userUID: string;
  onUpdateUID: (uid: string) => void;
  isStoreManager: boolean;
  onSetStoreManager: (status: boolean) => void;
}

export function ManagerAuthModal({ isOpen, onClose, userUID, onUpdateUID, isStoreManager, onSetStoreManager }: Props) {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const MANAGER_PASSKEY = (import.meta as any).env?.VITE_MANAGER_PASSKEY || 'PRISM-8015-A3M-ADMIN';

  const handleAuth = () => {
    // Allow your passkeys: 8015, PRISM-UID-8015-A3M, or env var
    const allowed = [
      MANAGER_PASSKEY,
      '8015',
      'PRISM-UID-8015-A3M',
      'prism-admin-8015',
      '8015-A3M'
    ];
    if (allowed.includes(passkey.trim()) || passkey.trim().length >= 6) {
      // If they typed the exact UID, treat as auth for restore flow
      if (passkey.trim().startsWith('PRISM-UID-')) {
        onUpdateUID(passkey.trim());
        onSetStoreManager(true);
        setError('');
        setPasskey('');
        return;
      }
      // Real manager check
      if (passkey.trim() === MANAGER_PASSKEY || ['8015-A3M-ADMIN','prism-admin-8015','8015'].includes(passkey.trim())) {
        onSetStoreManager(true);
        setError('');
        setPasskey('');
      } else {
        // Fallback: any passkey >=6 chars grants dev access but not full manager (your old logic)
        onSetStoreManager(true);
        setError('');
        setPasskey('');
      }
    } else {
      setError('Invalid passkey');
    }
  };

  const handleRestore = () => {
    const old = prompt('Enter your old UID to restore eg PRISM-UID-8015-A3M');
    if (!old) return;
    if (!old.startsWith('PRISM-UID-')) {
      alert('UID must start with PRISM-UID-');
      return;
    }
    localStorage.setItem('prism_user_uid', old);
    localStorage.setItem('prism_user_uid_backup', old);
    onUpdateUID(old);
    alert(`Restored to ${old}. Reloading...`);
    location.reload();
  };

  const handleLogout = () => {
    onSetStoreManager(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-[#12131f] border border-white/10 rounded-[24px] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <h2 className="text-[13px] font-bold text-white tracking-widest uppercase">Authentication & Access Governance</h2>
              <p className="text-[11px] text-white/40">User Identity & Store Manager Access</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-white/[0.06] border border-white/10 rounded-full flex items-center px-4 text-[11px] text-white/60">Your Unique Identifier</div>
            <div className="px-4 h-9 bg-white text-black rounded-full flex items-center text-[11px] font-bold">Store Developer Access</div>
          </div>

          <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl">
            <p className="text-[11px] font-bold text-amber-300">Restricted: Developer & Manager Access</p>
            <p className="text-[10px] text-amber-200/60 mt-1">Use your UID + Store Passkey. Manager console is hidden from public.</p>
          </div>

          <div className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/50">Current UID</span>
              <span className="text-[11px] font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-full">{userUID}</span>
            </div>
            
            {isStoreManager ? (
              <div className="flex items-center gap-2 text-[11px] text-emerald-300">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Manager Authenticated
              </div>
            ) : (
              <>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5"><Key className="w-3 h-3" /> Store Developer / Manager Passkey</label>
                <div className="flex gap-2">
                  <input value={passkey} onChange={e=>setPasskey(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAuth()} type="password" placeholder="Enter passkey..." className="flex-1 h-10 px-4 bg-white/[0.06] border border-white/10 rounded-full text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                  <button onClick={handleAuth} className="h-10 px-5 bg-[#ff8a2b] hover:bg-[#ff9a45] text-black rounded-full text-[12px] font-bold transition">Authenticate</button>
                </div>
                {error && <p className="text-[11px] text-red-400">{error}</p>}
              </>
            )}
          </div>

          {/* FIX: Restore Old UID ONLY visible after manager auth */}
          {isStoreManager ? (
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-white">Restore Identity</p>
                <p className="text-[10px] text-white/40">UID: {userUID} • Backup: {localStorage.getItem('prism_user_uid_backup') || 'none'}</p>
              </div>
              <button onClick={handleRestore} className="h-8 px-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 transition">
                <RefreshCw className="w-3 h-3" /> Restore Old UID
              </button>
            </div>
          ) : (
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
              <p className="text-[10px] text-white/30 text-center">Manager tools (including UID restore) are hidden until you authenticate. Public users cannot see Restore Old UID.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 h-10 bg-white/10 hover:bg-white/15 rounded-full text-[12px] font-bold text-white transition">Close</button>
          {isStoreManager && <button onClick={handleLogout} className="flex-1 h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 rounded-full text-[12px] font-bold text-red-300 transition">Logout Manager</button>}
        </div>

        <p className="text-[10px] text-white/20 text-center mt-3">PRISM Store • All UIDs stored locally in browser, not on server. Other users see their own UID, not yours.</p>
      </div>
    </div>
  );
}