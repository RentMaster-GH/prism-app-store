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
  const TKEY = "sov_eye_theme_v1";
  const st = document.createElement("style");
  st.id = "prism-eye-comfort-css";
  st.textContent =
    /* === ☀️ ULTRA-CLEAN DAYLIGHT MODE (Apple / Stripe Gallery Aesthetic) === */
    "html.sov-theme-day, html.sov-theme-day body { background: #f8fafc !important; color: #0f172a !important; -webkit-font-smoothing: antialiased !important; }" +
    "html.sov-theme-day header { background: rgba(255,255,255,0.88) !important; border-bottom: 1px solid #e2e8f0 !important; backdrop-filter: blur(16px) !important; box-shadow: 0 1px 3px rgba(15,23,42,0.04) !important; }" +
    "html.sov-theme-day footer { background: #ffffff !important; border-top: 1px solid #e2e8f0 !important; color: #475569 !important; }" +
    "html.sov-theme-day article { background: #ffffff !important; color: #0f172a !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 20px -4px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.04) !important; }" +
    "html.sov-theme-day article:hover { border-color: #6366f1 !important; box-shadow: 0 12px 28px -6px rgba(79,70,229,0.14) !important; }" +
    "html.sov-theme-day [class*='bg-[#0a0a0f]'], html.sov-theme-day [class*='bg-[#0f172a]'], html.sov-theme-day [class*='bg-[#0a0d1c]'] { background: #ffffff !important; color: #0f172a !important; border-color: #e2e8f0 !important; }" +
    "html.sov-theme-day h1, html.sov-theme-day h2, html.sov-theme-day h3, html.sov-theme-day h4, html.sov-theme-day .text-white, html.sov-theme-day .text-slate-100, html.sov-theme-day .text-slate-200 { color: #0f172a !important; }" +
    "html.sov-theme-day .text-slate-300, html.sov-theme-day .text-slate-400, html.sov-theme-day .text-slate-500 { color: #475569 !important; }" +
    "html.sov-theme-day button.bg-slate-800\/80, html.sov-theme-day button.bg-slate-800\/90, html.sov-theme-day button.bg-slate-900, html.sov-theme-day button.bg-slate-800 { background: #f1f5f9 !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }" +
    "html.sov-theme-day button.bg-slate-800\/80:hover, html.sov-theme-day button.bg-slate-800\/90:hover, html.sov-theme-day button.bg-slate-900:hover { background: #e2e8f0 !important; }" +
    "html.sov-theme-day .bg-indigo-600, html.sov-theme-day .bg-indigo-600 *, html.sov-theme-day .bg-emerald-600, html.sov-theme-day .bg-emerald-600 *, html.sov-theme-day .h-40 span, html.sov-theme-day a.bg-white, html.sov-theme-day button.bg-white { color: #ffffff !important; }" +
    "html.sov-theme-day a.bg-white, html.sov-theme-day button.bg-white { background: #0f172a !important; }" +
    "html.sov-theme-day a.bg-white:hover, html.sov-theme-day button.bg-white:hover { background: #1e293b !important; }" +
    "html.sov-theme-day .h-40 .bg-slate-950\/85 { background: rgba(15,23,42,0.85) !important; color: #fbbf24 !important; }" +
    "html.sov-theme-day .text-emerald-300, html.sov-theme-day .text-emerald-400 { color: #047857 !important; }" +
    "html.sov-theme-day .text-sky-300, html.sov-theme-day .text-sky-400 { color: #0369a1 !important; }" +
    "html.sov-theme-day .text-amber-200, html.sov-theme-day .text-amber-300 { color: #b45309 !important; }" +
    "html.sov-theme-day input, html.sov-theme-day select { background: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; }" +

    /* === 👁️ HIGH-CONTRAST NIGHT-PRO MODE (Same Sleek Night Layout + Pure White Ink & Crisp Borders) === */
    "html.sov-theme-hc { font-size: 109% !important; }" +
    "html.sov-theme-hc, html.sov-theme-hc body { background: #000000 !important; color: #ffffff !important; line-height: 1.55 !important; }" +
    "html.sov-theme-hc header { background: #05070e !important; border-bottom: 1.5px solid #64748b !important; }" +
    "html.sov-theme-hc article { background: #090d18 !important; border: 1.5px solid #64748b !important; box-shadow: 0 8px 24px rgba(0,0,0,0.7) !important; }" +
    "html.sov-theme-hc article:hover { border-color: #38bdf8 !important; }" +
    "html.sov-theme-hc .text-slate-300, html.sov-theme-hc .text-slate-400, html.sov-theme-hc .text-slate-500 { color: #f1f5f9 !important; }" +
    "html.sov-theme-hc input, html.sov-theme-hc select { background: #090d18 !important; color: #ffffff !important; border: 1.5px solid #94a3b8 !important; }" +
    "html.sov-theme-hc *:focus { outline: 2.5px solid #fbbf24 !important; outline-offset: 2px !important; }";
  document.head.appendChild(st);
  const saved = (localStorage.getItem(TKEY) || "night").toLowerCase();
  document.documentElement.classList.add("sov-theme-" + (["night", "day", "hc"].includes(saved) ? saved : "night"));
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
