import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2, Sparkles, ExternalLink, X } from "lucide-react";

export const EcosystemInboxBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [recs, setRecs] = useState<any[]>([]);
  const [verifyInfo, setVerifyInfo] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const apiBase = "https://" + "api." + "credibleartisans" + ".com";

  const refreshInbox = async () => {
    const tok = typeof window !== "undefined" ? localStorage.getItem("soul_trader_token") || "" : "";
    const h = typeof window !== "undefined" ? localStorage.getItem("soul_active_handle") || "" : "";
    if (!tok && !h) {
      setRecs([]);
      setVerifyInfo(null);
      setUnreadCount(0);
      return;
    }
    try {
      const [recRes, verRes] = await Promise.all([
        fetch(`${apiBase}/public/soulpay/recommendations/inbox?token=${encodeURIComponent(tok)}&handle=${encodeURIComponent(h)}`).then((r) => r.json()).catch(() => null),
        h ? fetch(`${apiBase}/public/soulpay/handle-verify/status?handle=${encodeURIComponent(h)}`).then((r) => r.json()).catch(() => null) : Promise.resolve(null),
      ]);
      const forMe = Array.isArray(recRes?.forMe) ? recRes.forMe : [];
      setRecs(forMe.slice(0, 10));
      setVerifyInfo(verRes);
      const seenId = Number(localStorage.getItem("prism_last_seen_rec_id") || 0);
      const freshRecs = forMe.filter((x: any) => Number(x.id || 0) > seenId).length;
      const hasVerifyAlert = verRes?.latestApplication && verRes.latestApplication.status !== "PENDING" ? 1 : 0;
      setUnreadCount(freshRecs + hasVerifyAlert);
    } catch {}
  };

  useEffect(() => {
    refreshInbox();
    const iv = setInterval(() => {
      if (!document.hidden) refreshInbox();
    }, 30000);
    return () => clearInterval(iv);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (recs.length > 0) {
      const maxId = Math.max(...recs.map((r: any) => Number(r.id || 0)));
      if (maxId > 0) localStorage.setItem("prism_last_seen_rec_id", String(maxId));
    }
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        title="Ecosystem Activity & Recommendations Inbox"
        className="relative h-9 w-9 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white/80 flex items-center justify-center cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-11 w-[calc(100vw-16px)] sm:w-80 max-h-[75vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-4 z-50 text-slate-100 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <strong className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ecosystem Inbox
            </strong>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {verifyInfo?.kycVerified && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Your @handle is officially <strong>Verified</strong> across the entire ecosystem!</span>
            </div>
          )}

          {!verifyInfo?.kycVerified && verifyInfo?.latestApplication && (
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px]">
              <strong>Verification Application ({verifyInfo.latestApplication.status}):</strong>{" "}
              {verifyInfo.latestApplication.status === "PENDING"
                ? "Awaiting Prism Store Manager review."
                : verifyInfo.latestApplication.manager_reason || "Please update and reapply."}
            </div>
          )}

          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-sky-300">🌟 Personal Recommendations for You</div>
            {recs.length === 0 ? (
              <p className="text-[11px] text-slate-400">No direct recommendations yet. Claim or unlock your @handle below to receive recommendations.</p>
            ) : (
              recs.map((r: any) => (
                <div key={r.id} className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px]">
                  <div className="flex justify-between gap-1">
                    <span>
                      <strong className="text-amber-300">{r.from_handle}</strong> → <strong className="text-emerald-300">{r.recommended_handle}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400">{r.category}</span>
                  </div>
                  <p className="text-slate-200 mt-1">“{r.opinion}”</p>
                </div>
              ))
            )}
          </div>

          <a
            href={`${apiBase}/public/aetherhost/live/ledger.soul`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-[11px] font-bold text-emerald-300"
          >
            Open My Private Ledger &amp; Tips <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
