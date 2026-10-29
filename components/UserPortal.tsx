'use client';
import { useState, useEffect } from 'react';

export function UserPortal() {
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored = localStorage.getItem('prism_uid');
    if (!stored) {
      stored = `PRISM-UID-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
      localStorage.setItem('prism_uid', stored);
    }
    setUid(stored);
  }, []);

  return (
    <>
      <button onClick={()=>setOpen(true)} className="h-8 px-4 rounded-full bg-white/10 border border-white/20 text-xs font-bold hover:bg-white/15">
        {uid ? `${uid} • User` : 'User Portal'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] rounded-[20px] bg-[#12131f] border border-white/10 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold tracking-wide">USER PORTAL</h3>
              <button onClick={()=>setOpen(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-4">
              <p className="text-[10px] opacity-60">YOUR PRISM USER ID</p>
              <p className="text-sm font-mono font-bold">{uid}</p>
              <p className="text-[11px] opacity-50 mt-1">Use this ID to track installs, reports & suggestions.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <input placeholder="Display name" className="h-10 rounded-full bg-black/30 border border-white/10 px-4 text-sm" />
              <input placeholder="Email (optional)" className="h-10 rounded-full bg-black/30 border border-white/10 px-4 text-sm" />
            </div>

            <button onClick={()=>setOpen(false)} className="w-full h-11 rounded-full bg-white text-black font-bold text-sm">Continue as {uid}</button>
            <p className="text-[11px] text-center opacity-50 mt-3">Guest access is allowed. Sign up later to save library.</p>
          </div>
        </div>
      )}
    </>
  );
}