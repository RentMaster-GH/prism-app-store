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
    /* === ☀️ STUDIO DAYLIGHT MODE (Layered Pearl-Gallery & Crisp Ink) === */
    "html.sov-theme-day, html.sov-theme-day body { background: radial-gradient(circle at 85% 8%, rgba(79,70,229,0.08), transparent 40%), radial-gradient(circle at 12% 90%, rgba(16,185,129,0.08), transparent 40%), #eef2f6 !important; color: #0b1120 !important; -webkit-font-smoothing: subpixel-antialiased !important; }" +
    "html.sov-theme-day header, html.sov-theme-day nav, html.sov-theme-day footer { background: rgba(255,255,255,0.92) !important; color: #0b1120 !important; border-color: #dbe3ee !important; backdrop-filter: blur(14px) !important; box-shadow: 0 4px 20px rgba(15,23,42,0.05) !important; }" +
    "html.sov-theme-day article, html.sov-theme-day [class*='bg-slate-900'], html.sov-theme-day [class*='bg-slate-950'], html.sov-theme-day [class*='bg-[#0a0d1c]'], html.sov-theme-day [class*='bg-[#05060f]'] { background-color: #ffffff !important; color: #0b1120 !important; border-color: #dbe3ee !important; box-shadow: 0 10px 26px -6px rgba(15,23,42,0.09), 0 2px 6px rgba(15,23,42,0.04) !important; }" +
    "html.sov-theme-day article:hover { border-color: #6366f1 !important; box-shadow: 0 16px 34px -6px rgba(79,70,229,0.18) !important; }" +
    "html.sov-theme-day [class*='bg-slate-800'], html.sov-theme-day [class*='bg-white/5'], html.sov-theme-day [class*='bg-white/10'] { background-color: #f1f5f9 !important; color: #1e293b !important; border-color: #cbd5e1 !important; }" +
    "html.sov-theme-day h1, html.sov-theme-day h2, html.sov-theme-day h3, html.sov-theme-day h4, html.sov-theme-day .text-white, html.sov-theme-day .text-slate-100, html.sov-theme-day .text-slate-200 { color: #0b1120 !important; }" +
    "html.sov-theme-day .text-slate-300, html.sov-theme-day .text-slate-400 { color: #334155 !important; }" +
    "html.sov-theme-day .h-40 span, html.sov-theme-day .bg-indigo-600, html.sov-theme-day .bg-indigo-600 *, html.sov-theme-day .bg-emerald-600, html.sov-theme-day .bg-emerald-600 * { color: #ffffff !important; }" +
    "html.sov-theme-day .h-40 .bg-slate-950\/85 { background-color: rgba(15,23,42,0.88) !important; color: #fbbf24 !important; }" +
    "html.sov-theme-day .h-40 .bg-slate-950\/85 .text-slate-400 { color: #e2e8f0 !important; }" +
    "html.sov-theme-day a.bg-white, html.sov-theme-day button.bg-white { background-color: #0f172a !important; color: #ffffff !important; border: none !important; }" +
    "html.sov-theme-day a.bg-white:hover, html.sov-theme-day button.bg-white:hover { background-color: #1e293b !important; }" +
    "html.sov-theme-day .text-emerald-300, html.sov-theme-day .text-emerald-400 { color: #047857 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-sky-300, html.sov-theme-day .text-sky-400 { color: #0369a1 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-amber-200, html.sov-theme-day .text-amber-300 { color: #b45309 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day input, html.sov-theme-day select { background-color: #ffffff !important; color: #0b1120 !important; border: 1.5px solid #cbd5e1 !important; font-weight: 600 !important; box-shadow: 0 1px 3px rgba(15,23,42,0.05) !important; }" +
    "html.sov-theme-day [class*='border-white/'] { border-color: #dbe3ee !important; }" +

    /* === 👁️ LUMINOUS HIGH-CONTRAST MODE (WCAG AAA 21:1 + Enlarged Type + Crisp Cyan/Gold Rim) === */
    "html.sov-theme-hc { font-size: 115% !important; }" +
    "html.sov-theme-hc, html.sov-theme-hc body { background: radial-gradient(circle at 80% 10%, rgba(56,189,248,0.14), transparent 42%), #02040a !important; color: #ffffff !important; line-height: 1.6 !important; letter-spacing: 0.015em !important; }" +
    "html.sov-theme-hc header, html.sov-theme-hc nav, html.sov-theme-hc footer { background: #02040a !important; border-bottom: 2px solid #38bdf8 !important; }" +
    "html.sov-theme-hc article, html.sov-theme-hc [class*='bg-slate-900'], html.sov-theme-hc [class*='bg-slate-950'], html.sov-theme-hc [class*='bg-[#0a0d1c]'] { background-color: #070b14 !important; color: #ffffff !important; border: 2px solid #38bdf8 !important; box-shadow: 0 0 24px rgba(56,189,248,0.16) !important; }" +
    "html.sov-theme-hc article:hover { border-color: #fbbf24 !important; box-shadow: 0 0 28px rgba(251,191,36,0.28) !important; }" +
    "html.sov-theme-hc h1, html.sov-theme-hc h2, html.sov-theme-hc h3, html.sov-theme-hc .text-white, html.sov-theme-hc .text-slate-100, html.sov-theme-hc .text-slate-200 { color: #ffffff !important; font-weight: 800 !important; }" +
    "html.sov-theme-hc .text-slate-300, html.sov-theme-hc .text-slate-400 { color: #f1f5f9 !important; font-weight: 600 !important; }" +
    "html.sov-theme-hc a.bg-white, html.sov-theme-hc button.bg-white { background-color: #fbbf24 !important; color: #02040a !important; font-weight: 900 !important; border: 2px solid #fde68a !important; }" +
    "html.sov-theme-hc .bg-indigo-600 { background-color: #0284c7 !important; color: #ffffff !important; font-weight: 900 !important; border: 2px solid #7dd3fc !important; }" +
    "html.sov-theme-hc input, html.sov-theme-hc select { min-height: 44px !important; font-size: 15px !important; font-weight: 800 !important; border: 2px solid #fbbf24 !important; background: #070b14 !important; color: #ffffff !important; }" +
    "html.sov-theme-hc button { min-height: 40px !important; font-weight: 800 !important; }" +
    "html.sov-theme-hc *:focus { outline: 3px solid #fbbf24 !important; outline-offset: 3px !important; }";
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
