import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://credibleartisans.com'
    : 'http://localhost:3000');

export const DeveloperEarningsPanel: React.FC<{ developerUid: string }> = ({ developerUid }) => {
  const [loading, setLoading] = useState(true);
  const [rep, setRep] = useState<{ badge: string; trustScore: number; approvedApps: number; completedTxs: number }>({ badge: "🛡️ Verified Edge Creator", trustScore: 95, approvedApps: 0, completedTxs: 0 });
  const [data, setData] = useState<{
    linked: boolean;
    handle?: string;
    soulBalance: number;
    slxBalance: number;
    tips: Array<{ id: number; tx_type: string; from_handle: string; amount_soul: number; note: string; created_at: string }>;
  }>({ linked: false, soulBalance: 0, slxBalance: 0, tips: [] });

  const loadEarnings = async () => {
    if (!developerUid) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/public/soulpay/developer-earnings?uid=${encodeURIComponent(developerUid)}`);
      if (r.ok) setData(await r.json());
      const rr = await fetch(`${API_BASE}/public/soulpay/reputation?uid=${encodeURIComponent(developerUid)}`);
      if (rr.ok) setRep(await rr.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [developerUid]);

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Developer Earnings &amp; Payouts • <span className="text-amber-300">{rep.badge} ({rep.trustScore}%)</span>
        </span>
        <button type="button" onClick={loadEarnings} className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">SOUL Balance (1:1 GH₵)</div>
          <div className="text-base font-extrabold text-emerald-400 font-mono">{Number(data.soulBalance).toLocaleString()} SOUL</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Mined SoulCoin (SLX)</div>
          <div className="text-base font-extrabold text-amber-400 font-mono">{Number(data.slxBalance).toLocaleString()} SLX</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/70 px-3 py-2 rounded-lg border border-slate-800/80">
        <span>Linked Handle: <strong className="text-indigo-300 font-mono">{data.handle || 'Auto-created on first tip'}</strong></span>
        <a
          href={`${API_BASE}/public/aetherhost/live/soulpay.soul`}
          target="_blank"
          rel="noreferrer"
          className="text-emerald-400 font-bold inline-flex items-center gap-0.5 hover:underline"
        >
          Cash Out MoMo/Bank <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>

      {data.tips && data.tips.length > 0 ? (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {data.tips.map((t) => (
            <div key={t.id} className="flex items-center justify-between text-[11px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <span className="text-slate-300 truncate max-w-[68%]">{t.from_handle || 'Supporter'}: {t.note || t.tx_type}</span>
              <span className="font-mono font-bold text-emerald-400">+{Number(t.amount_soul).toLocaleString()} SOUL</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[11px] text-slate-500">No tips or app payouts received on this passkey yet.</div>
      )}

      <a
        href={`${API_BASE}/public/aetherhost/live/ledger.soul`}
        target="_blank"
        rel="noreferrer"
        className="w-full py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Verify All Blocks on Public Audit Explorer (ledger.soul) ↗
      </a>
    </div>
  );
};
