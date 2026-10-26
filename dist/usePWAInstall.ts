import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__pwaDeferredPrompt) {
      return window.__pwaDeferredPrompt;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed & running from home screen or standalone URL param)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isUrlStandalone = urlParams?.get('standalone') === 'true';

    const standaloneMode =
      isUrlStandalone ||
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsStandalone(standaloneMode);
    if (standaloneMode) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Pick up globally cached event if it was caught before this hook mounted
    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser mini-infobar
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      // Stash event for true Direct Install button
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== 'undefined') {
        window.__pwaDeferredPrompt = null;
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger Native Install on Click: Invoke the saved prompt directly without downloading any file
  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaDeferredPrompt : null);
    
    if (!promptEvent) {
      return false;
    }

    try {
      // 1. Show the browser's native install prompt
      await promptEvent.prompt();
      
      // 2. Wait for the user to respond to the prompt
      const { outcome } = await promptEvent.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__pwaDeferredPrompt = null;
        }
        return true;
      }
    } catch (err) {
      console.warn('Native PWA install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  // Launches app in an isolated standalone window without downloading any file
  const launchStandaloneWindow = useCallback(() => {
    const width = Math.min(window.screen.availWidth, 1280);
    const height = Math.min(window.screen.availHeight, 860);
    const left = Math.max(0, (window.screen.availWidth - width) / 2);
    const top = Math.max(0, (window.screen.availHeight - height) / 2);
    
    const targetUrl = new URL(window.location.href);
    targetUrl.searchParams.set('standalone', 'true');

    window.open(
      targetUrl.toString(),
      'PrismAppStoreStandalone',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  }, []);

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__pwaDeferredPrompt)),
    isInstalled,
    isIOS,
    isStandalone,
    deferredPrompt,
    install,
    launchStandaloneWindow,
  };
}
