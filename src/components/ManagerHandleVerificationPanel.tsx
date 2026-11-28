import React, { useEffect, useState } from "react";
import { ShieldCheck, Search, RefreshCw, XCircle, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";

interface HandleRecord {
  id: number;
  wallet_code: string;
  handle: string;
  full_name?: string;
  display_name?: string;
  phone?: string;
  soul_balance?: number;
  kyc_verified: boolean;
  account_status?: "ACTIVE" | "SUSPENDED" | "SHADOW_BANNED" | "DELETED";
  moderation_reason?: string;
}

export const ManagerHandleVerificationPanel: React.FC = () => {
  const [secret, setSecret] = useState<string>(() => localStorage.getItem("prism_admin_secret") || "");
  const [query, setQuery] = useState("");
  const [directHandle, setDirectHandle] = useState("");
  const [handles, setHandles] = useState<HandleRecord[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
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

      const [reqRes, appRes] = await Promise.all([
        fetch(`${apiBase}/public/soulpay/admin/verification-requests`, { headers: { "x-admin-secret": activeSec } }),
        fetch(`${apiBase}/public/soulpay/admin/handle-appeals`, { headers: { "x-admin-secret": activeSec } }),
      ]);
      const reqData = await reqRes.json().catch(() => ({}));
      const appData = await appRes.json().catch(() => ({}));
      if (reqRes.ok && Array.isArray(reqData.requests)) setRequests(reqData.requests);
      if (appRes.ok && Array.isArray(appData.appeals)) setAppeals(appData.appeals);
    } catch {
      setStatusMsg("Network error connecting to Sovereign Identity registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) fetchHandles(secret, "");
  }, []);

  const reviewApplication = async (reqId: number, decision: "APPROVED" | "REJECTED", handleLabel: string) => {
    const activeSec = secret.trim() || prompt("Enter Prism App Store Manager Secret:") || "";
    if (!activeSec) return;
    let reason = "";
    let guidance = "";
    if (decision === "REJECTED") {
      reason = (prompt(`Reason why ${handleLabel}'s verification application was rejected:`) || "").trim();
      if (!reason) return;
      guidance = (prompt(`How ${handleLabel} can address the issue & reapply:`, "Upload clearer proof of role/organization with private details redacted and reapply.") || "").trim();
    }
    try {
      const r = await fetch(`${apiBase}/public/soulpay/admin/verification-requests/${reqId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": activeSec },
        body: JSON.stringify({ decision, reason, guidance }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || "Review failed"); return; }
      setStatusMsg(decision === "APPROVED" ? `✅ Approved Verified Status for ${handleLabel}!` : `❌ Returned ${handleLabel}'s application with guidance.`);
      fetchHandles(activeSec, query);
    } catch {
      alert("Network error submitting review.");
    }
  };

  const toggleVerify = async (targetHandle: string, nextVerified: boolean) => {
    const activeSec = secret.trim() || prompt("Enter Prism App Store Manager Secret:") || "";
    if (!activeSec) return;
    setSecret(activeSec);
    try {
      const r = await fetch(`${apiBase}/public/soulpay/admin/verify-handle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": activeSec },
        body: JSON.stringify({ handle: targetHandle, verified: nextVerified }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || "Unable to update verification status"); return; }
      localStorage.setItem("prism_admin_secret", activeSec);
      setStatusMsg(nextVerified ? `✅ Verified Badge assigned to ${d.wallet?.handle || targetHandle}!` : `Revoked Verified Badge from ${d.wallet?.handle || targetHandle}.`);
      setDirectHandle("");
      fetchHandles(activeSec, query);
    } catch {
      alert("Network error updating verification status.");
    }
  };

  const moderateHandle = async (targetHandle: string, nextStatus: "ACTIVE" | "SUSPENDED" | "SHADOW_BANNED" | "DELETED") => {
    const activeSec = secret.trim() || prompt("Enter Prism App Store Manager Secret:") || "";
    if (!activeSec) return;
    let reason = "";
    if (nextStatus !== "ACTIVE") {
      reason = (prompt(`Reason for setting ${targetHandle} to ${nextStatus}:`) || "").trim();
      if (!reason) return;
    }
    try {
      const r = await fetch(`${apiBase}/public/soulpay/admin/moderate-handle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": activeSec },
        body: JSON.stringify({ handle: targetHandle, status: nextStatus, reason }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || "Moderation update failed"); return; }
      setStatusMsg(`Updated ${targetHandle} status to ${nextStatus}.`);
      fetchHandles(activeSec, query);
    } catch {
      alert("Network error updating handle status.");
    }
  };

  const handleRestoreAction = async (targetHandle: string, decision: "RESTORED" | "DENIED") => {
    const activeSec = secret.trim() || prompt("Enter Prism App Store Manager Secret:") || "";
    if (!activeSec) return;
    const managerNote = (prompt(
      decision === "RESTORED"
        ? `Restoration note for ${targetHandle}:`
        : `Reason for denying restoration appeal for ${targetHandle}:`,
      decision === "RESTORED"
        ? "Appeal approved — @handle, wallet code, and SOUL balance fully restored to ACTIVE status."
        : "Appeal denied — policy violation unresolved. You may submit updated evidence."
    ) || "").trim();
    if (!managerNote) return;

    try {
      const r = await fetch(`${apiBase}/public/soulpay/admin/restore-handle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": activeSec },
        body: JSON.stringify({ handle: targetHandle, decision, managerNote }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || "Restoration action failed"); return; }
      setStatusMsg(
        decision === "RESTORED"
          ? `♻️ Restored ${d.wallet?.handle || targetHandle} back to ACTIVE status across all 65 portals!`
          : `Denied restoration appeal for ${targetHandle}.`
      );
      setDirectHandle("");
      fetchHandles(activeSec, query);
    } catch {
      alert("Network error restoring handle.");
    }
  };

  const pendingAppeals = appeals.filter((a) => a.status === "PENDING");

  return (
    <div className="mb-6 rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Ecosystem @Handle Verification, Appeals &amp; Restoration Control</h3>
            <p className="text-[11px] text-slate-400">Verify handles, review restoration appeals, and reinstate suspended, shadow-banned, or deleted accounts</p>
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
            placeholder="Direct @handle (e.g. @kwame)"
            className="flex-1 h-8 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300"
          />
          <button
            type="button"
            onClick={() => directHandle.trim() && toggleVerify(directHandle.trim(), true)}
            className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            ✅ Verify
          </button>
          <button
            type="button"
            onClick={() => directHandle.trim() && handleRestoreAction(directHandle.trim(), "RESTORED")}
            className="h-8 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0 cursor-pointer"
          >
            ♻️ Restore
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

      {pendingAppeals.length > 0 && (
        <div className="rounded-xl bg-amber-950/35 border border-amber-500/50 p-3 space-y-2">
          <div className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Pending @Handle Restoration Appeals ({pendingAppeals.length})</span>
          </div>
          {pendingAppeals.map((ap) => (
            <div key={ap.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/85 border border-slate-800 text-xs">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-emerald-300">{ap.handle}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[10px] font-bold">
                    Prior: {ap.prior_status}
                  </span>
                  {ap.contact_phone && <span className="text-[10.5px] text-slate-400">📞 {ap.contact_phone}</span>}
                </div>
                <p className="text-[11px] text-slate-200">{ap.appeal_reason}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRestoreAction(ap.handle, "RESTORED")}
                  className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> ♻️ Approve &amp; Restore
                </button>
                <button
                  type="button"
                  onClick={() => handleRestoreAction(ap.handle, "DENIED")}
                  className="h-7 px-2.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-[11px] font-bold cursor-pointer"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests.filter((r) => r.status === "PENDING").length > 0 && (
        <div className="rounded-xl bg-sky-950/30 border border-sky-500/40 p-3 space-y-2">
          <div className="text-xs font-extrabold text-sky-300">
            🔔 Pending Handle Verification Applications ({requests.filter((r) => r.status === "PENDING").length})
          </div>
          {requests.filter((r) => r.status === "PENDING").map((req) => (
            <div key={req.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-300">{req.handle}</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[10px] font-bold">{req.role_category}</span>
                </div>
                {req.note && <p className="text-[11px] text-slate-300">{req.note}</p>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => reviewApplication(req.id, "APPROVED", req.handle)}
                  className="h-7 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold cursor-pointer"
                >
                  ✅ Approve
                </button>
                <button
                  type="button"
                  onClick={() => reviewApplication(req.id, "REJECTED", req.handle)}
                  className="h-7 px-3 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-[11px] font-bold cursor-pointer"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {statusMsg && (
        <div className="text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-lg px-3 py-1.5">
          {statusMsg}
        </div>
      )}

      {handles.length > 0 && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/70">
          {handles.map((item) => {
            const st = item.account_status || "ACTIVE";
            const isRestricted = st !== "ACTIVE";
            return (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-bold text-emerald-300">{item.handle}</span>
                    {item.kyc_verified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      st === "ACTIVE"
                        ? "bg-slate-800 text-slate-300"
                        : "bg-rose-500/20 border border-rose-400/40 text-rose-200"
                    }`}>
                      {st}
                    </span>
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    {item.full_name || item.display_name || "Sovereign Member"} • {Number(item.soul_balance || 0).toLocaleString()} SOUL
                    {item.moderation_reason ? ` • Note: ${item.moderation_reason}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {isRestricted ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreAction(item.handle, "RESTORED")}
                      className="h-7 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> ♻️ Restore Account
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => moderateHandle(item.handle, "SUSPENDED")}
                        className="h-7 px-2 rounded-lg bg-slate-800 hover:bg-amber-900/50 border border-slate-700 text-amber-200 text-[10.5px] font-semibold cursor-pointer"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateHandle(item.handle, "SHADOW_BANNED")}
                        className="h-7 px-2 rounded-lg bg-slate-800 hover:bg-purple-900/50 border border-slate-700 text-purple-200 text-[10.5px] font-semibold cursor-pointer"
                      >
                        Shadow-Ban
                      </button>
                    </>
                  )}
                  {item.kyc_verified ? (
                    <button
                      type="button"
                      onClick={() => toggleVerify(item.handle, false)}
                      className="h-7 px-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3 h-3" /> Revoke
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleVerify(item.handle, true)}
                      className="h-7 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Verify
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
