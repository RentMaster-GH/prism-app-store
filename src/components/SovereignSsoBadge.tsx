import React, { useEffect, useState } from "react";

interface SsoProfile {
  authenticated: boolean;
  handle?: string;
  displayName?: string;
  soulBalance?: number;
  kycVerified?: boolean;
}

export const SovereignSsoBadge: React.FC = () => {
  const [profile, setProfile] = useState<SsoProfile | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState<"create" | "unlock">("create");
  const [handleInput, setHandleInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [checkMsg, setCheckMsg] = useState<string>("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [curPin, setCurPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [pinSaving, setPinSaving] = useState(false);
  const [showVerifyApplyModal, setShowVerifyApplyModal] = useState(false);
  const [verifyRole, setVerifyRole] = useState("Individual Creator");
  const [verifyNote, setVerifyNote] = useState("");
  const [verifyFile, setVerifyFile] = useState<File | null>(null);
  const [verifyAppStatus, setVerifyAppStatus] = useState<any>(null);
  const [verifySubmitting, setVerifySubmitting] = useState(false);
  const [showOnline, setShowOnline] = useState<boolean>(() => typeof window !== "undefined" && localStorage.getItem("sov_show_online_status") === "true");

  const apiBase = "https://" + "api." + "credibleartisans" + ".com";
  const hubUrl = apiBase + "/public/aetherhost/live/id.soul";

  useEffect(() => {
    let active = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const incoming = params.get("soul_sso");
      if (incoming) {
        localStorage.setItem("soul_trader_token", incoming);
        params.delete("soul_sso");
        const clean = params.toString();
        window.history.replaceState(null, "", window.location.pathname + (clean ? "?" + clean : "") + window.location.hash);
      }
    } catch {}

    const token = typeof window !== "undefined" ? localStorage.getItem("soul_trader_token") : null;
    if (!token) return;

    fetch(`${apiBase}/public/soulpay/sso/verify?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d || !d.authenticated) return;
        setProfile(d);
        try {
          localStorage.setItem("soul_active_handle", d.handle || "");
        } catch {}
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showAuthModal) return;
    const clean = handleInput.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2) {
      setCheckMsg("");
      setHandleAvailable(null);
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const tok = localStorage.getItem("soul_trader_token") || "";
        const r = await fetch(`${apiBase}/public/soulpay/handle-check?handle=${encodeURIComponent("@" + clean)}&ownerToken=${encodeURIComponent(tok)}`);
        const d = await r.json();
        if (d && d.ok) {
          setHandleAvailable(Boolean(d.available));
          setCheckMsg(d.message || "");
          setSuggestions(Array.isArray(d.suggestions) ? d.suggestions : []);
        }
      } catch {}
    }, 280);
    return () => clearTimeout(timer);
  }, [handleInput, showAuthModal]);

  
  useEffect(() => {
    if (!profile?.authenticated) return;
    const ping = async (explicit?: boolean) => {
      const activeOptIn = typeof explicit === "boolean" ? explicit : showOnline;
      if (!activeOptIn && typeof explicit !== "boolean") return;
      const tok = localStorage.getItem("soul_trader_token") || "";
      try {
        const body: any = { ownerToken: tok, handle: profile.handle || "" };
        if (typeof explicit === "boolean") body.showOnline = explicit;
        await fetch(`${apiBase}/public/soulpay/presence/ping`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {}
    };
    ping();
    const iv = setInterval(() => { if (!document.hidden) ping(); }, 45000);
    return () => clearInterval(iv);
  }, [profile?.authenticated, profile?.handle, showOnline]);

  const toggleOnlineVisibility = async () => {
    const next = !showOnline;
    setShowOnline(next);
    localStorage.setItem("sov_show_online_status", next ? "true" : "false");
    const tok = localStorage.getItem("soul_trader_token") || "";
    try {
      await fetch(`${apiBase}/public/soulpay/presence/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerToken: tok, handle: profile?.handle || "", showOnline: next }),
      });
    } catch {}
  };

  
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(newPin.trim())) {
      setPinMsg("New PIN must be 4–6 numeric digits.");
      return;
    }
    if (newPin.trim() !== confirmPin.trim()) {
      setPinMsg("New PIN and confirmation do not match.");
      return;
    }
    setPinSaving(true);
    setPinMsg("");
    try {
      const tok = localStorage.getItem("soul_trader_token") || "";
      const r = await fetch(`${apiBase}/public/soulpay/wallet/change-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerToken: tok,
          handle: profile?.handle || "",
          currentPin: curPin.trim(),
          newPin: newPin.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setPinMsg(d.error || "Could not update PIN");
        return;
      }
      setCurPin("");
      setNewPin("");
      setConfirmPin("");
      setShowPinModal(false);
      alert("🔑 " + (d.message || "Security PIN updated across the ecosystem!"));
    } catch {
      setPinMsg("Network error updating PIN.");
    } finally {
      setPinSaving(false);
    }
  };

  
  const openVerifyApplyModal = async () => {
    setShowVerifyApplyModal(true);
    try {
      const r = await fetch(`${apiBase}/public/soulpay/handle-verify/status?handle=${encodeURIComponent(profile?.handle || "")}`);
      const d = await r.json();
      if (d && d.ok) setVerifyAppStatus(d);
    } catch {}
  };

  const submitVerifyApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifySubmitting(true);
    try {
      let evidenceUrl = "";
      if (verifyFile) {
        const fd = new FormData();
        fd.append("file", verifyFile);
        const up = await fetch(`${apiBase}/public/soulmarket/upload`, { method: "POST", body: fd }).then((r) => r.json()).catch(() => ({}));
        if (up && up.mediaUrl) evidenceUrl = up.mediaUrl;
      }
      const tok = localStorage.getItem("soul_trader_token") || "";
      const r = await fetch(`${apiBase}/public/soulpay/handle-verify/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerToken: tok,
          handle: profile?.handle || "",
          roleCategory: verifyRole,
          evidenceUrl,
          note: verifyNote.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "Could not submit verification application");
        return;
      }
      setShowVerifyApplyModal(false);
      setVerifyNote("");
      setVerifyFile(null);
      alert("✅ " + (d.message || "Verification application submitted for Store Manager review!"));
    } catch {
      alert("Network error submitting verification application.");
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handleInput.trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9_]/g, "");
    if (clean.length < 2 || pinInput.trim().length < 4) {
      setCheckMsg("Enter a valid @handle (2+ characters) and 4–6 digit PIN.");
      return;
    }
    if (mode === "create" && handleAvailable === false) {
      setCheckMsg(`@${clean} is already taken. Pick one of the available suggestions below or add a number/character.`);
      return;
    }
    setSubmitting(true);
    try {
      const endpoint = mode === "create" ? "/public/soulpay/wallet/create" : "/public/soulpay/wallet/unlock";
      const r = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean, pin: pinInput.trim(), fullName: clean }),
      });
      const d = await r.json();
      if (!r.ok) {
        setCheckMsg(d.error || "Unable to complete request");
        if (Array.isArray(d.suggestions)) setSuggestions(d.suggestions);
        setHandleAvailable(false);
        return;
      }
      if (d.ownerToken) localStorage.setItem("soul_trader_token", d.ownerToken);
      const finalHandle = d.handle || `@${clean}`;
      localStorage.setItem("soul_active_handle", finalHandle);
      setProfile({
        authenticated: true,
        handle: finalHandle,
        soulBalance: Number(d.wallet?.soul_balance || 0),
        kycVerified: Boolean(d.wallet?.kyc_verified),
      });
      setShowAuthModal(false);
      setPinInput("");
    } catch {
      setCheckMsg("Network error connecting to Sovereign Identity server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        title="Expand Sovereign SSO Badge"
        style={{ position: "fixed", bottom: 14, right: 14, zIndex: 9990 }}
        className="px-2.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur"
      >
        {profile?.kycVerified ? "✅" : "🔐"}
      </button>
    );
  }

  return (
    <>
      <div
        style={{ position: "fixed", bottom: 14, right: 14, zIndex: 9990 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-emerald-500/40 text-xs font-semibold text-slate-100 shadow-xl backdrop-blur"
      >
        {profile?.authenticated ? (
          <>
            <a href={hubUrl} target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200 font-mono">
              {showOnline ? "🟢" : "⚫"} {profile.kycVerified ? "✅" : "🪙"} {profile.handle} • {Number(profile.soulBalance || 0).toLocaleString()} SOUL
            </a>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("soul_trader_token");
                localStorage.removeItem("soul_active_handle");
                setProfile(null);
              }}
              className="text-[10px] text-slate-400 hover:text-rose-300 border-l border-slate-700 pl-2"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={toggleOnlineVisibility}
              title="Optional: Toggle whether the public can see you are online"
              className={`text-[10px] border-l border-slate-700 pl-2 cursor-pointer ${showOnline ? "text-emerald-300 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              {showOnline ? "🟢 Online" : "⚫ Stealth"}
            </button>
            <button
              type="button"
              onClick={() => { setPinMsg(""); setShowPinModal(true); }}
              title="Change your @handle Security PIN"
              className="text-[10px] text-sky-300 hover:text-sky-200 border-l border-slate-700 pl-2 cursor-pointer"
            >
              🔑 PIN
            </button>
            {!profile.kycVerified && (
              <button
                type="button"
                onClick={openVerifyApplyModal}
                title="Apply for Official Verified Handle Badge"
                className="text-[10px] text-emerald-300 hover:text-emerald-200 border-l border-slate-700 pl-2 font-bold cursor-pointer"
              >
                ✓ Verify
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setShowAuthModal(true);
            }}
            className="text-sky-300 hover:text-sky-200 cursor-pointer"
          >
            🔐 Claim Unique @Handle / SSO
          </button>
        )}
        <button
          type="button"
          onClick={() => setMinimized(true)}
          aria-label="Minimize SSO badge"
          className="text-slate-400 hover:text-white border-l border-slate-700 pl-1.5 font-mono"
        >
          −
        </button>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z- flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-300">🔐 Sovereign Unique @Handle</h3>
              <button type="button" onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setMode("create")} className={`flex-1 py-1.5 rounded-lg font-bold ${mode === "create" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                Create New @Handle
              </button>
              <button type="button" onClick={() => setMode("unlock")} className={`flex-1 py-1.5 rounded-lg font-bold ${mode === "unlock" ? "bg-sky-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                Unlock Existing
              </button>
            </div>
            <div>
              <input
                type="text"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="Choose unique handle (e.g. @anon1)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
              />
              {checkMsg && (
                <p className={`mt-1.5 text-[11px] font-semibold ${handleAvailable === false && mode === "create" ? "text-amber-300" : "text-emerald-300"}`}>
                  {handleAvailable === false && mode === "create" ? "⚠️ " : "✅ "}
                  {checkMsg}
                </p>
              )}
              {mode === "create" && handleAvailable === false && suggestions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setHandleInput(sug)}
                      className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-[11px] font-mono hover:bg-emerald-500/30"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="4–6 Digit Security PIN"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={submitting || (mode === "create" && handleAvailable === false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              {submitting ? "⏳ Verifying..." : mode === "create" ? "✅ Claim Unique @Handle" : "🔓 Unlock @Handle"}
            </button>
          </form>
        </div>
      )}

      {showPinModal && profile?.authenticated && (
        <div className="fixed inset-0 z- flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleChangePinSubmit} className="w-full max-w-sm rounded-2xl bg-slate-900 border border-sky-500/40 p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-300">🔑 Change PIN ({profile.handle})</h3>
              <button type="button" onClick={() => setShowPinModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={curPin}
              onChange={(e) => setCurPin(e.target.value)}
              placeholder="Current 4–6 Digit PIN"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="New 4–6 Digit PIN"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm New 4–6 Digit PIN"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-400"
            />
            {pinMsg && <p className="text-[11px] font-semibold text-rose-300">⚠️ {pinMsg}</p>}
            <button
              type="submit"
              disabled={pinSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              {pinSaving ? "⏳ Updating PIN..." : "✅ Update Security PIN"}
            </button>
          </form>
        </div>
      )}

      {showVerifyApplyModal && profile?.authenticated && (
        <div className="fixed inset-0 z- flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={submitVerifyApplication} className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/40 p-5 text-slate-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-300">✓ Apply for Verified Handle ({profile.handle})</h3>
              <button type="button" onClick={() => setShowVerifyApplyModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            {verifyAppStatus?.latestApplication?.status === "PENDING" && (
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px]">
                ⏳ Application currently pending Store Manager review.
              </div>
            )}
            {verifyAppStatus?.latestApplication?.status === "REJECTED" && (
              <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-400/40 text-rose-200 text-[11px]">
                ❌ Returned: {verifyAppStatus.latestApplication.manager_reason}
                {verifyAppStatus.latestApplication.manager_guidance && (
                  <div className="mt-1 text-amber-200">💡 {verifyAppStatus.latestApplication.manager_guidance}</div>
                )}
              </div>
            )}
            <select
              value={verifyRole}
              onChange={(e) => setVerifyRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            >
              <option value="Individual Creator">🎨 Individual Creator / Developer</option>
              <option value="Clinic / Hospital">🏥 Clinic, Hospital or Health Worker</option>
              <option value="School / NGO">🎓 School, Church or Community NGO</option>
              <option value="Verified Merchant / Artisan">🛠️ Verified Merchant or Artisan</option>
              <option value="Community Leader">🤝 Community Elder / Organizer</option>
            </select>
            <input
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={(e) => setVerifyFile(e.target.files?.item(0) || null)}
              className="w-full text-xs text-slate-300"
            />
            <textarea
              rows={2}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              placeholder="Optional verification note (redact any sensitive personal details you feel uncomfortable sharing)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              disabled={verifySubmitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              {verifySubmitting ? "⏳ Submitting..." : "📤 Submit Verification Application"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
