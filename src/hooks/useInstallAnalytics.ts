import { useEffect } from 'react';

export function useInstallAnalytics() {
  useEffect(() => {
    const log = (event: string, data: any = {}) => {
      console.log('[PWA Analytics]', event, data);
      // Future: send to your analytics
      // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event, ...data }) })
      localStorage.setItem(`analytics_${event}`, String(Date.now()));
      // Count
      const count = Number(localStorage.getItem(`count_${event}`) || 0) + 1;
      localStorage.setItem(`count_${event}`, String(count));
    };

    window.addEventListener('pwa-install-available', () => log('install_prompt_available'));
    window.addEventListener('appinstalled', () => log('installed'));
    window.addEventListener('online', () => log('online'));
    window.addEventListener('offline', () => log('offline'));

    // Track page view
    log('page_view', { path: window.location.pathname });

    // Expose for debugging
    (window as any).__prismAnalytics = {
      getCounts: () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('count_'));
        return Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)]));
      }
    };
  }, []);
}