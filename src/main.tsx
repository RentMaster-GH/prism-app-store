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
    /* === ☀️ CRISP DAYLIGHT MODE (High-Clarity Editorial Light Theme) === */
    "html.sov-theme-day, html.sov-theme-day body { background: #f1f5f9 !important; color: #0f172a !important; -webkit-font-smoothing: subpixel-antialiased !important; }" +
    "html.sov-theme-day header, html.sov-theme-day nav, html.sov-theme-day footer { background: rgba(255,255,255,0.96) !important; color: #0f172a !important; border-color: #cbd5e1 !important; backdrop-filter: blur(12px) !important; }" +
    "html.sov-theme-day [class*='bg-[#05060f]'], html.sov-theme-day [class*='bg-[#0a0d1c]'], html.sov-theme-day [class*='bg-slate-950'], html.sov-theme-day [class*='bg-slate-900'] { background-color: #ffffff !important; color: #0f172a !important; border-color: #cbd5e1 !important; box-shadow: 0 2px 10px rgba(15,23,42,0.06) !important; }" +
    "html.sov-theme-day [class*='bg-white/5'], html.sov-theme-day [class*='bg-white/10'] { background-color: #f8fafc !important; border-color: #cbd5e1 !important; }" +
    "html.sov-theme-day [class*='text-white'], html.sov-theme-day .text-slate-100, html.sov-theme-day .text-slate-200 { color: #0f172a !important; font-weight: 600; }" +
    "html.sov-theme-day .text-slate-300, html.sov-theme-day .text-slate-400, html.sov-theme-day [class*='text-slate-400'] { color: #1e293b !important; }" +
    "html.sov-theme-day .text-emerald-300, html.sov-theme-day .text-emerald-400 { color: #047857 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-sky-300, html.sov-theme-day .text-sky-400 { color: #0369a1 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day .text-amber-200, html.sov-theme-day .text-amber-300 { color: #b45309 !important; font-weight: 700 !important; }" +
    "html.sov-theme-day input, html.sov-theme-day select { background: #ffffff !important; color: #0f172a !important; border: 1.5px solid #94a3b8 !important; font-weight: 600 !important; }" +
    "html.sov-theme-day [class*='border-white/'] { border-color: #cbd5e1 !important; }" +

    /* === 👁️ REFINED HIGH-CONTRAST LOW-VISION MODE (WCAG AAA 21:1 Obsidian & Gold) === */
    "html.sov-theme-hc { font-size: 114% !important; }" +
    "html.sov-theme-hc, html.sov-theme-hc body { background: #000000 !important; color: #ffffff !important; line-height: 1.55 !important; letter-spacing: 0.015em !important; }" +
    "html.sov-theme-hc header, html.sov-theme-hc nav, html.sov-theme-hc footer { background: #000000 !important; border-bottom: 2px solid #fbbf24 !important; }" +
    "html.sov-theme-hc article, html.sov-theme-hc section, html.sov-theme-hc [class*='bg-slate-900'], html.sov-theme-hc [class*='bg-slate-950'], html.sov-theme-hc [class*='bg-[#0a0d1c]'] { background-color: #090d16 !important; color: #ffffff !important; border: 2px solid #fbbf24 !important; border-radius: 16px !important; box-shadow: 0 0 0 1px rgba(251,191,36,0.3) !important; }" +
    "html.sov-theme-hc [class*='text-white'], html.sov-theme-hc .text-slate-100, html.sov-theme-hc .text-slate-200, html.sov-theme-hc .text-slate-300, html.sov-theme-hc .text-slate-400 { color: #ffffff !important; }" +
    "html.sov-theme-hc .text-emerald-300, html.sov-theme-hc .text-emerald-400 { color: #6ee7b7 !important; font-weight: 800 !important; }" +
    "html.sov-theme-hc .text-sky-300, html.sov-theme-hc .text-sky-400 { color: #7dd3fc !important; font-weight: 800 !important; }" +
    "html.sov-theme-hc button, html.sov-theme-hc input, html.sov-theme-hc select { min-height: 42px !important; font-weight: 800 !important; border: 2px solid #fbbf24 !important; background: #090d16 !important; color: #ffffff !important; }" +
    "html.sov-theme-hc a { color: #fde68a !important; text-decoration: underline !important; text-underline-offset: 3px !important; font-weight: 800 !important; }" +
    "html.sov-theme-hc *:focus { outline: 3px solid #38bdf8 !important; outline-offset: 3px !important; }";
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
