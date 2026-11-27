import React, { useEffect, useState } from "react";
import { ShieldCheck, Search, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";

interface HandleRecord {
  id: number;
  wallet_code: string;
  handle: string;
  full_name?: string;
  display_name?: string;
  soul_balance?: number;
  kyc_verified: boolean;
}

export const ManagerHandleVerificationPanel: React.FC = () => {
  const [secret, setSecret] = useState<string>(() => localStorage.getItem("prism_admin_secret") || "");
  const [query, setQuery] = useState("");
  const [directHandle, setDirectHandle] = useState("");
  const [handles, setHandles] = useState<HandleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const apiBase = "https://" + "api." + "credibleartisans" + ".com";

  const fetchHandles = async (secOverride?: string, qOverride?: string) => {
    const activeSec = (secOverride !== undefined ? secOverride : secret).trim();
    if (!activeSec) return;
    setLoading(true);
    setStatusMsg("");
    try {
      const searchQ = qOverride !== undefined ? qOverride : query;
      const r = await fetch(`${apiBase}/public/soulpay/admin/handles?q=${encodeURIComponent(searchQ)}`, {
        headers: { "x-admin-secret": activeSec },
      });
      const d = await r.json();
      if (!r.ok) {
        setStatusMsg(d.error || "Invalid Manager Secret");
        setHandles([]);
        return;
      }
      localStorage.setItem("prism_admin_secret", activeSec);
      setHandles(Array.isArray(d.handles) ? d.handles : []);
    } catch {
      setStatusMsg("Network error connecting to Sovereign Identity registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) fetchHandles(secret, "");
  }, []);

  const toggleVerify = async (targetHandle: string, nextVerified: boolean) => {
    const activeSec = secret.trim() || prompt("Enter Prism App Store Manager Secret:") || "";
    if (!activeSec) return;
    setSecret(activeSec);
    try {
      const r = await fetch(`${apiBase}/public/soulpay/admin/verify-handle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": activeSec,
        },
        body: JSON.stringify({ handle: targetHandle, verified: nextVerified }),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Unable to update verification status");
        return;
      }
      localStorage.setItem("prism_admin_secret", activeSec);
      setStatusMsg(
        nextVerified
          ? `✅ Official Verified Badge assigned to ${d.wallet?.handle || targetHandle} across the entire ecosystem!`
          : `Revoked Verified Badge from ${d.wallet?.handle || targetHandle}.`
      );
      setDirectHandle("");
      fetchHandles(activeSec, query);
    } catch {
      alert("Network error updating verification status.");
    }
  };

  return (
    <div className="mb-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Ecosystem @Handle Verification Control</h3>
            <p className="text-[11px] text-slate-400">Assign or revoke official Verified status across Prism Store &amp; all 58 .soul portals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Manager Secret"
            className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white w-36"
          />
          <button
            type="button"
            onClick={() => fetchHandles(secret, query)}
            className="h-8 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Load Handles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={directHandle}
            onChange={(e) => setDirectHandle(e.target.value)}
            placeholder="Direct @handle to verify (e.g. @madina_clinic)"
            className="flex-1 h-8 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300"
          />
          <button
            type="button"
            onClick={() => directHandle.trim() && toggleVerify(directHandle.trim(), true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            ✅ Verify
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (secret) fetchHandles(secret, e.target.value);
            }}
            placeholder="Search registered @handles or names..."
            className="flex-1 h-8 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
          />
        </div>
      </div>

      {statusMsg && (
        <div className="text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-lg px-3 py-1.5">
          {statusMsg}
        </div>
      )}

      {handles.length > 0 && (
        <div className="max-h-56 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/70">
          {handles.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-300">{item.handle}</span>
                  {item.kyc_verified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] text-slate-400 truncate">
                  {item.full_name || item.display_name || "Sovereign Member"} • {Number(item.soul_balance || 0).toLocaleString()} SOUL
                </div>
              </div>
              {item.kyc_verified ? (
                <button
                  type="button"
                  onClick={() => toggleVerify(item.handle, false)}
                  className="h-7 px-2.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <XCircle className="w-3 h-3" /> Revoke
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleVerify(item.handle, true)}
                  className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" /> Assign Verified
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
