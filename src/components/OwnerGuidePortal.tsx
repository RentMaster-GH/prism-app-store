import React, { useState } from 'react';

interface Props {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onAuthenticated?: () => void;
  onSuccess?: () => void;
  setIsManager?: (v:boolean)=>void;
  userUID?: string;
}

export const ManagerAuthModal: React.FC<Props> = ({ isOpen, open, onClose, onAuthenticated, onSuccess, setIsManager, userUID = "unknown" }) => {
  const [tab, setTab] = useState<'user'|'manager'>('manager');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const visible = isOpen ?? open ?? true;
  if (!visible) return null;

  const doAuth = () => {
    const envKey = (import.meta.env.VITE_STORE_MANAGER_KEY as string || '').trim();
    const input = passkey.trim();
    if (!envKey) {
      setError('Manager key not configured. Check Vercel env.');
      return;
    }
    setLoading(true);
    setTimeout(()=>{
      if (input === envKey) {
        localStorage.setItem('prism_is_manager','true');
        setIsManager?.(true);
        onAuthenticated?.();
        onSuccess?.();
        setLoading(false);
        onClose();
      } else {
        setLoading(false);
        setError('Invalid Manager Passkey');
      }
    },400);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#12132a] border border-white/10 p-6 space-y-4">
        <div><p className="text-[10px] text-slate-400 uppercase">Authentication & Access Governance</p><h2 className="text-white font-bold">User Identity & Store Manager Access</h2></div>
        <div className="flex gap-2 bg-[#0a0b18] p-1 rounded-full">
          <button onClick={()=>setTab('user')} className={`flex-1 h-8 rounded-full text-[11px] font-bold ${tab==='user'?'bg-white text-black':'text-slate-400'}`}>Your Unique Identifier</button>
          <button onClick={()=>setTab('manager')} className={`flex-1 h-8 rounded-full text-[11px] font-bold ${tab==='manager'?'bg-white text-black':'text-slate-400'}`}>Store Developer Access</button>
        </div>
        {tab==='manager' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-950/30 border border-amber-800/30 p-3"><p className="text-amber-200 font-bold text-[11px]">Restricted: Developer & Manager Access</p></div>
            <div>
              <label className="text-[11px] text-slate-300">Store Developer / Manager Passkey:</label>
              <div className="mt-1 flex gap-2">
                <input type="password" value={passkey} onChange={e=>{setPasskey(e.target.value); setError('');}} placeholder="Enter Manager Passkey" className="flex-1 h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-white text-[13px] outline-none focus:border-amber-500" onKeyDown={e=>{if(e.key==='Enter') doAuth()}} />
                <button onClick={doAuth} disabled={loading} className="h-10 px-4 rounded-full bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400">{loading?'...':'Authenticate'}</button>
              </div>
              {error && <p className="text-[11px] text-rose-400 mt-2">{error}</p>}
            </div>
            <div className="text-[10px] text-slate-500">UID: <span className="font-mono text-violet-300">{userUID}</span></div>
          </div>
        )}
        {tab==='user' && (
          <div className="space-y-3"><p className="text-[12px] text-slate-300">Your UID is portable across devices.</p><div className="h-10 px-3 rounded-lg bg-[#0a0b18] border border-white/10 text-violet-300 font-mono text-[12px] flex items-center">{userUID}</div></div>
        )}
        <button onClick={onClose} className="w-full h-10 rounded-full bg-white/10 text-white font-bold text-[12px]">Close</button>
      </div>
    </div>
  );
};

export default ManagerAuthModal;
export const OwnerGuidePortal = ManagerAuthModal;
