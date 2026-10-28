import React, { useState } from 'react';
import { X, Shield, Lock } from 'lucide-react';

const MANAGER_SECRET = import.meta.env.VITE_MANAGER_SECRET || 'PRISM-OWNER-2025'; // Set this in Vercel env, not in code

export function ManagerAuthModal({ isOpen, onClose, userUID, onUpdateUID, isStoreManager, onSetStoreManager }: any) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'view'|'restore'>('view');

  if (!isOpen) return null;

  const handleBecomeManager = () => {
    if (input.trim() === MANAGER_SECRET) {
      onSetStoreManager(true);
      onUpdateUID(userUID); // keep own UID, just elevate
      localStorage.setItem('prism_is_store_manager', 'true');
      setInput('');
      setError('');
      onClose();
    } else {
      setError('Invalid manager key');
    }
  };

  const handleRestore = () => {
    // Restore only works if you ALSO know secret + old UID format
    const val = input.trim();
    if (!val.startsWith('PRISM-UID-')) {
      setError('Invalid UID format');
      return;
    }
    if (!val.includes('-')) {
      setError('Invalid UID');
      return;
    }
    // Require secret still stored
    const isManager = localStorage.getItem('prism_is_store_manager') === 'true';
    if (!isManager) {
      setError('Manager auth required first');
      return;
    }
    onUpdateUID(val);
    localStorage.setItem('prism_user_uid_backup', val);
    setInput('');
    onClose();
    location.reload();
  };

  const handleLogout = () => {
    onSetStoreManager(false);
    localStorage.removeItem('prism_is_store_manager');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10111f] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-[11px] tracking-widest font-bold text-white/60 flex items-center gap-2">
            <Shield className="w-4 h-4"/> AUTHENTICATION & ACCESS GOVERNANCE
          </h2>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><X className="w-4 h-4"/></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 h-8 bg-white/[0.06] rounded-full text-[11px]">Your Unique Identifier</button>
            <button className="flex-1 h-8 bg-amber-200 text-amber-950 rounded-full text-[11px] font-bold">Store Developer Access</button>
          </div>

          <div className="p-3 bg-amber-100/10 border border-amber-200/20 rounded-xl">
            <p className="text-[11px] font-bold text-amber-200">Restricted Developer & Manager Access</p>
            <p className="text-[10px] text-amber-100/60 mt-1">Manager Console is hidden from public. Manager login requires secret key, not just UID.</p>
          </div>

          <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
            <div className="text-[10px] text-white/40">Current UID</div>
            <div className="text-xs font-mono text-white mt-1 flex items-center gap-2">
              {userUID} {isStoreManager && <span className="text-[10px] px-2 py-0.5 bg-emerald-400 text-black rounded-full">Manager Authenticated</span>}
            </div>
          </div>

          {!isStoreManager ? (
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-bold">Enter Manager Secret</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30"/>
                <input
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  placeholder="Enter secret key"
                  type="password"
                  className="w-full h-11 pl-10 pr-4 bg-black/40 border border-white/10 rounded-full text-sm text-white outline-none focus:border-white/20"
                />
              </div>
              {error && <p className="text-[11px] text-red-400">{error}</p>}
              <button onClick={handleBecomeManager} className="w-full h-11 bg-white text-black rounded-full text-sm font-bold">Authenticate Manager</button>
            </div>
          ) : (
            <div className="space-y-3">
              {step === 'view' ? (
                <button onClick={()=>setStep('restore')} className="w-full h-10 bg-white/10 text-white rounded-full text-xs">Restore Identity (backup)</button>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase">Restore backup UID</label>
                  <input
                    value={input}
                    onChange={e=>setInput(e.target.value)}
                    placeholder="Enter backup UID"
                    className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm text-white outline-none"
                  />
                  {error && <p className="text-[11px] text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <button onClick={()=>setStep('view')} className="flex-1 h-10 bg-white/10 rounded-full text-xs">Cancel</button>
                    <button onClick={handleRestore} className="flex-1 h-10 bg-white text-black rounded-full text-xs font-bold">Restore</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 h-10 bg-white/10 text-white rounded-full text-xs">Close</button>
            {isStoreManager && <button onClick={handleLogout} className="flex-1 h-10 bg-red-500/20 text-red-300 border border-red-500/20 rounded-full text-xs">Logout Manager</button>}
          </div>

          <p className="text-[9px] text-white/20 text-center">Manager secret stored in Vercel env VITE_MANAGER_SECRET. UIDs are not secrets.</p>
        </div>
      </div>
    </div>
  );
}