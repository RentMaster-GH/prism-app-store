import React from 'react';
class PrismSafeBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#020617", color: "#f8fafc", fontFamily: "system-ui, sans-serif", padding: "24px", textAlign: "center" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>Refreshing Prism App Store...</h2>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>A display update occurred. Tap below to reload cleanly.</p>
            <button onClick={() => location.reload()} style={{ padding: "10px 20px", borderRadius: "999px", background: "#10b981", color: "#022c22", fontWeight: 800, border: "none", cursor: "pointer" }}>Reload Store</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

(function initPrismEyeComfort() {
  try {
    const saved = (localStorage.getItem("sov_eye_theme_v1") || "night").toLowerCase();
    document.documentElement.classList.remove("sov-theme-night", "sov-theme-day", "sov-theme-hc");
    document.documentElement.classList.add("sov-theme-" + (["night", "day", "hc"].includes(saved) ? saved : "night"));
  } catch {}
})();

import "./lib/i18nDom";
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__pwaDeferredPrompt = e as any;
  window.dispatchEvent(new Event('pwa-install-available'));
});

createRoot(document.getElementById('root')!).render(
  <PrismSafeBoundary>
  <ThemeProvider>
    <App />
  </ThemeProvider>
  </PrismSafeBoundary>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
      reg.update().catch(() => {});
      setInterval(() => reg.update().catch(() => {}), 30000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          reg.update().catch(() => {});
          window.dispatchEvent(new Event('prism-sync-catalog'));
        }
      });
    }).catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
  });
}

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const r of regs) r.unregister();
  }).catch(() => {});
}


(function initPrismSoulCoinDropdown() {
  const ICON_HTML = '<svg viewBox="0 0 128 128" width="22" height="22" style="min-width:22px;min-height:22px;width:22px;height:22px;border-radius:999px;background:#f8fafc;border:1.5px solid #fbbf24;padding:1.5px;display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M34 10 Q64 5 94 10 L90 42 Q64 38 38 42 Z" fill="#09090b"/><path d="M18 43 Q64 35 110 43 Q114 49 104 54 Q64 46 24 54 Q14 49 18 43 Z" fill="#09090b"/><path d="M33 49 Q64 45 95 49 L97 77 Q93 101 64 122 Q35 101 31 77 Z" fill="#4a3728" stroke="#09090b" stroke-width="3"/><path d="M39 61 Q50 54 59 60" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M89 61 Q78 54 69 60" fill="none" stroke="#09090b" stroke-width="4" stroke-linecap="round"/><path d="M40 69 Q50 63 59 69 Q50 73 40 69 Z" fill="#09090b"/><path d="M88 69 Q78 63 69 69 Q78 73 88 69 Z" fill="#09090b"/><path d="M61 62 L59 81 Q64 84 69 81 L67 62" fill="none" stroke="#09090b" stroke-width="2.5" stroke-linecap="round"/><path d="M42 85 Q53 95 64 89 Q75 95 86 85 Q81 98 64 94 Q47 98 42 85 Z" fill="#09090b"/><path d="M51 97 Q64 103 77 97" fill="none" stroke="#09090b" stroke-width="2.8" stroke-linecap="round"/><path d="M59 101 L64 119 L69 101 Z" fill="#09090b"/></svg>';
  function enhance() {
    const sel = document.getElementById("sov_currency_select") as HTMLSelectElement | null;
    if (!sel || sel.dataset.sovRichAttached) return;
    sel.dataset.sovRichAttached = "1";
    sel.style.position = "absolute";
    sel.style.opacity = "0";
    sel.style.pointerEvents = "none";
    sel.style.width = "1px";
    sel.style.height = "1px";

    const wrap = document.createElement("div");
    wrap.style.cssText = "position:relative;display:inline-block;vertical-align:middle";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;background:#0f172a;color:#7dd3fc;border:1px solid rgba(14,165,233,0.4);cursor:pointer;white-space:nowrap";
    const menu = document.createElement("div");
    menu.style.cssText = "display:none;position:absolute;right:0;top:calc(100% + 4px);z-index:2147483647;min-width:225px;max-height:300px;overflow-y:auto;background:#0f172a;border:1px solid rgba(56,189,248,0.45);border-radius:10px;padding:4px;box-shadow:0 18px 40px rgba(0,0,0,0.85)";

    const renderTrigger = () => {
      const opt = sel.options[sel.selectedIndex];
      const isSoul = opt && opt.value === "SOUL";
      trigger.innerHTML = (isSoul ? ICON_HTML + "<span>SOUL (Sovereign Coin)</span>" : "<span>" + (opt ? opt.textContent : "GHS") + "</span>") + '<span style="font-size:10px;opacity:.75;margin-left:4px">▼</span>';
    };
    const buildMenu = () => {
      menu.innerHTML = "";
      Array.from(sel.children).forEach((child: any) => {
        if (child.tagName === "OPTGROUP") {
          const g = document.createElement("div");
          g.textContent = child.label || "";
          g.style.cssText = "padding:6px 8px 3px;font-size:10.5px;font-weight:800;color:#94a3b8;text-transform:uppercase";
          menu.appendChild(g);
          Array.from(child.children).forEach(addBtn);
        } else if (child.tagName === "OPTION") addBtn(child);
      });
    };
    const addBtn = (opt: any) => {
      const b = document.createElement("button");
      b.type = "button";
      const isSoul = opt.value === "SOUL";
      const isSel = opt.value === sel.value;
      b.style.cssText = "width:100%;text-align:left;display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:7px;border:none;font-size:12px;font-weight:600;cursor:pointer;background:" + (isSel ? "rgba(14,165,233,0.22)" : "transparent") + ";color:" + (isSel ? "#e0f2fe" : "#cbd5e1");
      b.innerHTML = isSoul ? (ICON_HTML + "<span>SOUL (Sovereign Coin)</span>") : ("<span>" + opt.textContent + "</span>");
      b.onclick = (e) => {
        e.stopPropagation();
        sel.value = opt.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        renderTrigger();
        buildMenu();
        menu.style.display = "none";
      };
      menu.appendChild(b);
    };
    trigger.onclick = (e) => {
      e.stopPropagation();
      const open = menu.style.display === "block";
      menu.style.display = open ? "none" : "block";
      if (!open) buildMenu();
    };
    document.addEventListener("click", () => { menu.style.display = "none"; });
    renderTrigger();
    wrap.appendChild(trigger);
    wrap.appendChild(menu);
    sel.parentNode?.insertBefore(wrap, sel.nextSibling);
  }
  setInterval(enhance, 600);
})();
