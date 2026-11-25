
(function initPrismEyeComfort() {
  const TKEY = "sov_eye_theme_v1";
  const st = document.createElement("style");
  st.id = "prism-eye-comfort-css";
  st.textContent =
    "html.sov-theme-day, html.sov-theme-day body { background: #f8fafc !important; color: #0f172a !important; }" +
    "html.sov-theme-day header, html.sov-theme-day nav, html.sov-theme-day footer, html.sov-theme-day .bg-slate-950, html.sov-theme-day .bg-slate-900, html.sov-theme-day .bg-slate-900\/80, html.sov-theme-day .bg-slate-950\/90 { background: #ffffff !important; color: #0f172a !important; border-color: #cbd5e1 !important; }" +
    "html.sov-theme-day .text-white, html.sov-theme-day .text-slate-100, html.sov-theme-day .text-slate-200 { color: #0f172a !important; }" +
    "html.sov-theme-day .text-slate-300, html.sov-theme-day .text-slate-400 { color: #334155 !important; }" +
    "html.sov-theme-day input, html.sov-theme-day select { background: #f1f5f9 !important; color: #0f172a !important; border-color: #94a3b8 !important; }" +
    "html.sov-theme-hc { font-size: 118% !important; }" +
    "html.sov-theme-hc, html.sov-theme-hc body, html.sov-theme-hc header, html.sov-theme-hc div, html.sov-theme-hc section, html.sov-theme-hc article { background: #ffffff !important; color: #000000 !important; border-color: #000000 !important; }" +
    "html.sov-theme-hc .text-white, html.sov-theme-hc .text-slate-100, html.sov-theme-hc .text-slate-200, html.sov-theme-hc .text-slate-300, html.sov-theme-hc .text-slate-400, html.sov-theme-hc .text-sky-300, html.sov-theme-hc .text-emerald-300 { color: #000000 !important; }" +
    "html.sov-theme-hc button, html.sov-theme-hc a, html.sov-theme-hc input, html.sov-theme-hc select { min-height: 42px !important; font-weight: 800 !important; border: 2px solid #000000 !important; background: #ffffff !important; color: #000000 !important; }" +
    "html.sov-theme-hc *:focus { outline: 3px solid #d97706 !important; outline-offset: 2px !important; }";
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
  <ThemeProvider>
    <App />
  </ThemeProvider>
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
