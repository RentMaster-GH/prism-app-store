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
  const ICON_HTML = '<img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fw3.org%22%20viewBox%3D%220%200%20128%20128%22%20width%3D%22128%22%20height%3D%22128%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22ds%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23352d28%22%2F%3E%3Cstop%20offset%3D%2255%25%22%20stop-color%3D%22%233e352f%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2326201c%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M36%2012%20Q64%207%2092%2012%20L88%2042%20Q64%2039%2040%2042%20Z%22%20fill%3D%22%23110f0e%22%20stroke%3D%22%23070606%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M21%2043%20Q64%2036%20107%2043%20Q111%2049%20102%2053%20Q64%2046%2026%2053%20Q17%2049%2021%2043%20Z%22%20fill%3D%22%23110f0e%22%20stroke%3D%22%23070606%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M34%2049%20Q64%2045%2094%2049%20L96%2076%20Q92%2099%2064%20120%20Q36%2099%2032%2076%20Z%22%20fill%3D%22url(%23ds)%22%20stroke%3D%22%230d0b0a%22%20stroke-width%3D%222.5%22%2F%3E%3Cpath%20d%3D%22M40%2061%20Q50%2055%2059%2060%22%20fill%3D%22none%22%20stroke%3D%22%230d0b0a%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M88%2061%20Q78%2055%2069%2060%22%20fill%3D%22none%22%20stroke%3D%22%230d0b0a%22%20stroke-width%3D%223.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M41%2068%20Q50%2063%2058%2068%20Q50%2071%2041%2068%20Z%22%20fill%3D%22%230d0b0a%22%2F%3E%3Cpath%20d%3D%22M87%2068%20Q78%2063%2070%2068%20Q78%2071%2087%2068%20Z%22%20fill%3D%22%230d0b0a%22%2F%3E%3Cpath%20d%3D%22M61%2062%20L59%2080%20Q64%2083%2069%2080%20L67%2062%22%20fill%3D%22none%22%20stroke%3D%22%23141110%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M39%2077%20Q44%2084%2043%2090%22%20fill%3D%22none%22%20stroke%3D%22%23181412%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M89%2077%20Q84%2084%2085%2090%22%20fill%3D%22none%22%20stroke%3D%22%23181412%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M43%2084%20Q53%2093%2064%2088%20Q75%2093%2085%2084%20Q80%2096%2064%2092%20Q48%2096%2043%2084%20Z%22%20fill%3D%22%230d0b0a%22%2F%3E%3Cpath%20d%3D%22M51%2095%20Q64%20101%2077%2095%22%20fill%3D%22none%22%20stroke%3D%22%230d0b0a%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M60%2099%20L64%20116%20L68%2099%20Z%22%20fill%3D%22%230d0b0a%22%2F%3E%3C%2Fsvg%3E" alt="SOUL" style="width:17px;height:17px;object-fit:contain;vertical-align:middle;border-radius:999px;background:#f8fafc;padding:1px;display:inline-block;flex-shrink:0" />';
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
