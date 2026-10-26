import React, { useState } from 'react';
import { 
  X, ShieldCheck, Key, UserCheck, Copy, Check, 
  Lock, Unlock, AlertTriangle, Sparkles, RefreshCw, LogOut, ArrowRight
} from 'lucide-react';

interface ManagerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUID: string;
  onUpdateUID: (newUID: string) => void;
  isStoreManager: boolean;
  onSetStoreManager: (status: boolean) => void;
  initialTab?: 'uid' | 'manager';
}

export const ManagerAuthModal: React.FC<ManagerAuthModalProps> = ({
  isOpen,
  onClose,
  userUID,
  onUpdateUID,
  isStoreManager,
  onSetStoreManager,
  initialTab = 'uid'
}) => {
  const [activeTab, setActiveTab] = useState<'uid' | 'manager'>(initialTab);
  
  // UID State
  const [copiedUID, setCopiedUID] = useState(false);
  const [inputUID, setInputUID] = useState('');
  const [uidSwitchSuccess, setUidSwitchSuccess] = useState<string | null>(null);

  // Store Manager Passkey State
  const [managerPasskey, setManagerPasskey] = useState('');
  const [managerError, setManagerError] = useState<string | null>(null);
  const [managerSuccess, setManagerSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUID = () => {
    navigator.clipboard.writeText(userUID);
    setCopiedUID(true);
    setTimeout(() => setCopiedUID(false), 2000);
  };

  const handleGenerateNewUID = () => {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newUID = `PRISM-UID-${randomHex}-${suffix}`;
    onUpdateUID(newUID);
    setUidSwitchSuccess(`Generated new Unique Identifier: ${newUID}`);
    setTimeout(() => setUidSwitchSuccess(null), 3000);
  };

  const handleApplyCustomUID = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUID.trim()) return;
    const formatted = inputUID.trim().toUpperCase();
    onUpdateUID(formatted);
    setUidSwitchSuccess(`Active session switched to UID: ${formatted}`);
    setInputUID('');
    setTimeout(() => setUidSwitchSuccess(null), 3000);
  };

  const handleClaimDemoUID = () => {
    onUpdateUID('PRISM-USER-DEMO');
    setUidSwitchSuccess('Active session switched to PRISM-USER-DEMO (Owner of Adinkra Studio)');
    setTimeout(() => setUidSwitchSuccess(null), 3000);
  };

  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerError(null);

    // Standard Store Developer / Manager Key
    const validKeys = ['PRISM-DEV-ROOT-2026', 'PRISM-MANAGER-KEY', 'prism2026', 'root'];
    if (validKeys.includes(managerPasskey.trim())) {
      onSetStoreManager(true);
      setManagerSuccess('Access Granted: You are now authenticated as the Prism App Store Developer & Manager.');
      setManagerPasskey('');
      setTimeout(() => {
        setManagerSuccess(null);
        onClose();
      }, 1500);
    } else {
      setManagerError('Invalid Store Manager Key. Enter the authorized passkey or use the demo quick-access button.');
    }
  };

  const handleQuickManagerAuth = () => {
    onSetStoreManager(true);
    setManagerSuccess('Quick Authenticated: Verified as Prism App Store Developer & Manager.');
    setTimeout(() => {
      setManagerSuccess(null);
      onClose();
    }, 1500);
  };

  const handleManagerLogout = () => {
    onSetStoreManager(false);
    setManagerSuccess('Signed out of Store Manager mode. Restored to standard user permissions.');
    setTimeout(() => setManagerSuccess(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono mb-1">
            <Key className="w-4 h-4" />
            <span>AUTHENTICATION & ACCESS GOVERNANCE</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            User Identity & Store Manager Access
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Manage your unique owner identifier or authenticate as the Prism App Store developer to unlock moderation powers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs mb-5">
          <button
            onClick={() => setActiveTab('uid')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'uid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>User Unique Identifier</span>
          </button>

          <button
            onClick={() => setActiveTab('manager')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'manager'
                ? isStoreManager ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isStoreManager ? <Unlock className="w-3.5 h-3.5 text-amber-300" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
            <span>Store Developer Access {isStoreManager ? '(Active)' : ''}</span>
          </button>
        </div>

        {/* TAB 1: USER UNIQUE IDENTIFIER */}
        {activeTab === 'uid' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 space-y-2">
              <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
                Your Active Unique Identifier
              </span>
              <div className="flex items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide">
                  {userUID}
                </span>
                <button
                  onClick={handleCopyUID}
                  className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-md font-medium transition-colors flex items-center gap-1"
                  title="Copy UID"
                >
                  {copiedUID ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUID ? 'Copied' : 'Copy UID'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                This Unique Identifier anchors every application you upload to the Prism App Store. Only you (using this UID) have sovereignty to manage or delete your uploaded apps.
              </p>
            </div>

            {uidSwitchSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uidSwitchSuccess}</span>
              </div>
            )}

            {/* Switch / Claim UID Form */}
            <form onSubmit={handleApplyCustomUID} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div>
                <label className="font-semibold text-white block mb-1">
                  Switch or Restore Existing UID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PRISM-UID-7482-8X or PRISM-USER-DEMO"
                    value={inputUID}
                    onChange={e => setInputUID(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Set UID
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleClaimDemoUID}
                  className="px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Claim Adinkra Studio (PRISM-USER-DEMO)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateNewUID}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3 text-slate-400" />
                  <span>Generate New UID</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: PRISM STORE DEVELOPER & MANAGER ACCESS */}
        {activeTab === 'manager' && (
          <div className="space-y-4 text-xs text-slate-300">
            {/* Status card */}
            <div className={`p-4 rounded-xl border ${
              isStoreManager 
                ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-start gap-3">
                {isStoreManager ? (
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {isStoreManager ? 'Prism Store Developer / Manager: Active' : 'Restricted: Developer & Manager Access'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {isStoreManager 
                      ? 'You have root privileges. You can access Developer Moderation to delete inappropriate apps, modify store invariants, and reinstate software.'
                      : 'Developer Moderation: Delete Inappropriate Apps is exclusively accessible to the developer or manager of Prism App Store. Normal users can only delete their own uploaded apps.'}
                  </p>
                </div>
              </div>

              {isStoreManager && (
                <div className="mt-4 pt-3 border-t border-amber-900/40 flex items-center justify-between">
                  <span className="text-[11px] text-amber-300 font-mono">Root Permissions Granted</span>
                  <button
                    onClick={handleManagerLogout}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 hover:border-rose-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Exit Manager Mode</span>
                  </button>
                </div>
              )}
            </div>

            {managerSuccess && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{managerSuccess}</span>
              </div>
            )}

            {managerError && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-xl text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{managerError}</span>
              </div>
            )}

            {!isStoreManager && (
              <form onSubmit={handleManagerLogin} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <label className="font-semibold text-white block mb-1">
                    Store Developer / Manager Passkey:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter Prism Store Developer Passkey"
                      value={managerPasskey}
                      onChange={e => setManagerPasskey(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-sm"
                    >
                      Authenticate
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">Demo Key: <code className="text-amber-400">PRISM-DEV-ROOT-2026</code></span>
                  <button
                    type="button"
                    onClick={handleQuickManagerAuth}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Quick Unlock Store Manager Mode</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
