let deferredInstallPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    window.dispatchEvent(new Event("prism-install-ready"));
  });
}

export function downloadStandaloneCapsule() {
  const catalog = Array.from(document.querySelectorAll("h3.prism-react-tr")).map((el, i) => {
    const card = el.closest(".group");
    const desc = card?.querySelector("p.prism-react-tr")?.textContent || "";
    return `<div style="padding:14px;border:1px solid #334155;border-radius:12px;background:#0f172a;margin-bottom:10px">
      <strong style="color:#34d399;font-size:15px">${i + 1}. ${el.textContent || "Sovereign App"}</strong>
      <p style="color:#cbd5e1;font-size:12px;margin:6px 0 0">${desc}</p>
    </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Prism App Store — Sovereign Offline Capsule</title></head>
<body style="margin:0;padding:20px;background:#020617;color:#f8fafc;font-family:system-ui,sans-serif">
  <div style="max-width:860px;margin:0 auto">
    <h1 style="color:#38bdf8;margin:0 0 6px">🛡️ Prism App Store — Portable Sovereign Capsule</h1>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 18px">Self-contained local directory snapshot. Works offline on Windows, macOS, Linux, Android & iOS without external store gatekeepers.</p>
    <div style="margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap">
      <a href="https://vercel.app" style="padding:10px 16px;border-radius:10px;background:#059669;color:#fff;text-decoration:none;font-weight:700;font-size:13px">🌐 Open Live Prism Store</a>
      <a href="https://credibleartisans.com" style="padding:10px 16px;border-radius:10px;background:#0284c7;color:#fff;text-decoration:none;font-weight:700;font-size:13px">🚀 Launch Sovereign Hub (hub.soul)</a>
    </div>
    ${catalog}
  </div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "prism-app-store-offline-capsule.html";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

export async function triggerMultiChannelInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const res = await deferredInstallPrompt.userChoice.catch(() => null);
    if (res && res.outcome === "accepted") {
      deferredInstallPrompt = null;
      return;
    }
  }
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIos) {
    alert("📲 Install on iPhone / iPad:\n1. Tap the Share button (square with arrow) in Safari.\n2. Tap 'Add to Home Screen'.\n\nDownloading a portable offline HTML capsule as backup...");
    downloadStandaloneCapsule();
    return;
  }
  const choice = window.confirm(
    "📲 Multi-Channel Sovereign Installer:\n\n" +
    "• Click OK to download the Self-Contained Offline App Capsule (.html) that runs directly on any device without browser or store restrictions.\n" +
    "• Or use your browser menu (⋮ → 'Install App' / 'Add to Home screen') for native home-screen installation."
  );
  if (choice) downloadStandaloneCapsule();
}
