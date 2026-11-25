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
    /* === ☀️ DAYLIGHT: SUNLIT PEARL & ROYAL COBALT (Supreme Light Mode) === */
    "html.sov-theme-day, html.sov-theme-day body, html.sov-theme-day #root > div { background: radial-gradient(circle at 12% 0%, rgba(99,102,241,0.10), transparent 42%), radial-gradient(circle at 88% 15%, rgba(16,185,129,0.09), transparent 40%), #f3f6fb !important; color: #090d16 !important; -webkit-font-smoothing: antialiased !important; }" +
    "html.sov-theme-day header { background: rgba(255,255,255,0.88) !important; border-bottom: 1px solid rgba(148,163,184,0.32) !important; backdrop-filter: blur(20px) saturate(180%) !important; box-shadow: 0 4px 24px -4px rgba(15,23,42,0.06) !important; }" +
    "html.sov-theme-day footer { background: rgba(255,255,255,0.92) !important; border-top: 1px solid #cbd5e1 !important; color: #334155 !important; }" +
    "html.sov-theme-day article, html.sov-theme-day article.bg-slate-900\/90 { background-color: #ffffff !important; background-image: linear-gradient(180deg, #ffffff 0%, #fafbff 100%) !important; color: #090d16 !important; border: 1px solid #cbd5e1 !important; box-shadow: 0 12px 30px -8px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.04) !important; transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease !important; }" +
    "html.sov-theme-day article:hover { transform: translateY(-3px) !important; border-color: #4f46e5 !important; box-shadow: 0 20px 38px -10px rgba(79,70,229,0.20) !important; }" +
    "html.sov-theme-day div[class*='bg-slate-900'], html.sov-theme-day div[class*='bg-slate-950']:not(.h-40):not(.h-40 *), html.sov-theme-day div[class*='bg-[#0'], html.sov-theme-day a[class*='bg-slate-950'] { background: #ffffff !important; color: #090d16 !important; border-color: #cbd5e1 !important; }" +
    "html.sov-theme-day h1, html.sov-theme-day h2, html.sov-theme-day h3, html.sov-theme-day h4, html.sov-theme-day .text-white, html.sov-theme-day .text-slate-100, html.sov-theme-day .text-slate-200 { color: #090d16 !important; }" +
    "html.sov-theme-day .text-slate-300, html.sov-theme-day .text-slate-400, html.sov-theme-day .text-slate-500 { color: #334155 !important; }" +
    "html.sov-theme-day button[class*='bg-slate-800'], html.sov-theme-day button[class*='bg-slate-900'] { background: #ffffff !important; color: #0f172a !important; border: 1px solid #cbd5e1 !important; box-shadow: 0 1px 3px rgba(15,23,42,0.05) !important; }" +
    "html.sov-theme-day button[class*='bg-slate-800']:hover, html.sov-theme-day button[class*='bg-slate-900']:hover { background: #eef2ff !important; border-color: #6366f1 !important; color: #3730a3 !important; }" +
    "html.sov-theme-day button.bg-slate-100 { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; color: #ffffff !important; border: none !important; box-shadow: 0 4px 12px rgba(15,23,42,0.20) !important; }" +
    "html.sov-theme-day .bg-indigo-600, html.sov-theme-day .bg-indigo-600 *, html.sov-theme-day .bg-emerald-600, html.sov-theme-day .bg-emerald-600 *, html.sov-theme-day .h-40 span, html.sov-theme-day a.bg-white, html.sov-theme-day button.bg-white { color: #ffffff !important; }" +
    "html.sov-theme-day a.bg-white, html.sov-theme-day button.bg-white { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%) !important; }" +
    "html.sov-theme-day .h-40 .bg-slate-950\/85 { background: rgba(15,23,42,0.88) !important; color: #fbbf24 !important; }" +
    "html.sov-theme-day .text-emerald-300, html.sov-theme-day .text-emerald-400 { color: #047857 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-sky-300, html.sov-theme-day .text-sky-400 { color: #0369a1 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-amber-200, html.sov-theme-day .text-amber-300 { color: #b45309 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day input, html.sov-theme-day select { background: #ffffff !important; color: #090d16 !important; border: 1px solid #cbd5e1 !important; box-shadow: 0 2px 6px rgba(15,23,42,0.04) !important; }" +

    /* === 👁️ HIGH-CONTRAST: CYBER-OBSIDIAN & LUMINOUS GOLD X-FACTOR === */
    "html.sov-theme-hc { font-size: 111% !important; }" +
    "html.sov-theme-hc, html.sov-theme-hc body, html.sov-theme-hc #root > div { background: radial-gradient(circle at 82% 8%, rgba(251,191,36,0.13), transparent 38%), radial-gradient(circle at 12% 88%, rgba(16,185,129,0.11), transparent 40%), #020308 !important; color: #ffffff !important; line-height: 1.58 !important; }" +
    "html.sov-theme-hc header { background: rgba(3,5,12,0.94) !important; border-bottom: 1.5px solid rgba(251,191,36,0.68) !important; backdrop-filter: blur(18px) !important; box-shadow: 0 4px 28px rgba(251,191,36,0.12) !important; }" +
    "html.sov-theme-hc article { background: linear-gradient(180deg, #090d1a 0%, #05070f 100%) !important; border: 1.5px solid rgba(251,191,36,0.58) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.85), inset 0 1px 0 rgba(251,191,36,0.24) !important; transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease !important; }" +
    "html.sov-theme-hc article:hover { transform: translateY(-3px) !important; border-color: #34d399 !important; box-shadow: 0 16px 38px rgba(52,211,153,0.24), 0 0 0 1px #34d399 !important; }" +
    "html.sov-theme-hc button[class*='bg-slate-900'], html.sov-theme-hc button[class*='bg-slate-800'] { background: #090d1a !important; color: #ffffff !important; border: 1.5px solid rgba(148,163,184,0.68) !important; }" +
    "html.sov-theme-hc button[class*='bg-slate-900']:hover, html.sov-theme-hc button[class*='bg-slate-800']:hover { border-color: #fbbf24 !important; color: #fde68a !important; }" +
    "html.sov-theme-hc button.bg-slate-100 { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important; color: #020308 !important; font-weight: 900 !important; }" +
    "html.sov-theme-hc .text-slate-300, html.sov-theme-hc .text-slate-400, html.sov-theme-hc .text-slate-500 { color: #f8fafc !important; }" +
    "html.sov-theme-hc input, html.sov-theme-hc select { background: #090d1a !important; color: #ffffff !important; border: 1.5px solid rgba(251,191,36,0.68) !important; }" +
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
