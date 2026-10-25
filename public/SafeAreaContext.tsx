import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type ScreenBracket = 'phone' | 'tablet' | 'desktop';
export type DevicePlatformOS = 'ios' | 'android' | 'desktop';
export type DevicePreviewMode = 'auto' | 'ios-phone' | 'android-phone' | 'tablet' | 'desktop';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface SafeAreaContextType {
  deviceMode: DevicePreviewMode;
  setDeviceMode: (mode: DevicePreviewMode) => void;
  screenBracket: ScreenBracket;
  platform: DevicePlatformOS;
  insets: SafeAreaInsets;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasHardwareCutout: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

const SafeAreaContext = createContext<SafeAreaContextType | undefined>(undefined);

export const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>(() => {
    try {
      const saved = localStorage.getItem('prism_device_preview_mode');
      if (saved && ['auto', 'ios-phone', 'android-phone', 'tablet', 'desktop'].includes(saved)) {
        return saved as DevicePreviewMode;
      }
    } catch {}
    return 'auto';
  });

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('prism_device_preview_mode', deviceMode);
    } catch {}
  }, [deviceMode]);

  // Detect real hardware OS
  const realOS = useMemo<DevicePlatformOS>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    if (/android/.test(ua)) {
      return 'android';
    }
    return 'desktop';
  }, []);

  // Compute active screen bracket and platform based on real window or preview mode
  const { screenBracket, platform, insets, hasHardwareCutout, isMobile, isTablet, isDesktop } = useMemo<{
    screenBracket: ScreenBracket;
    platform: DevicePlatformOS;
    insets: SafeAreaInsets;
    hasHardwareCutout: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  }>(() => {
    if (deviceMode === 'ios-phone') {
      return {
        screenBracket: 'phone' as ScreenBracket,
        platform: 'ios' as DevicePlatformOS,
        // iPhone 16 Pro Dynamic Island & Home indicator insets
        insets: { top: 48, bottom: 34, left: 0, right: 0 },
        hasHardwareCutout: true,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      };
    }

    if (deviceMode === 'android-phone') {
      return {
        screenBracket: 'phone' as ScreenBracket,
        platform: 'android' as DevicePlatformOS,
        // Pixel 9 / Samsung camera punch hole cutout & gesture pill insets
        insets: { top: 40, bottom: 24, left: 0, right: 0 },
        hasHardwareCutout: true,
        isMobile: true,
        isTablet: false,
        isDesktop: false
      };
    }

    if (deviceMode === 'tablet') {
      return {
        screenBracket: 'tablet' as ScreenBracket,
        platform: (realOS === 'ios' ? 'ios' : 'desktop') as DevicePlatformOS,
        insets: { top: 24, bottom: 20, left: 0, right: 0 },
        hasHardwareCutout: false,
        isMobile: false,
        isTablet: true,
        isDesktop: false
      };
    }

    if (deviceMode === 'desktop') {
      return {
        screenBracket: 'desktop' as ScreenBracket,
        platform: 'desktop' as DevicePlatformOS,
        insets: { top: 0, bottom: 0, left: 0, right: 0 },
        hasHardwareCutout: false,
        isMobile: false,
        isTablet: false,
        isDesktop: true
      };
    }

    // Auto-detect based on real device window width & UA
    const width = windowDimensions.width;
    let bracket: ScreenBracket = 'desktop';
    if (width < 640) {
      bracket = 'phone';
    } else if (width <= 1024) {
      bracket = 'tablet';
    } else {
      bracket = 'desktop';
    }

    const hasCutout = (realOS === 'ios' || realOS === 'android') && bracket === 'phone';

    return {
      screenBracket: bracket,
      platform: realOS,
      insets: {
        top: hasCutout ? (realOS === 'ios' ? 44 : 36) : 0,
        bottom: hasCutout ? (realOS === 'ios' ? 34 : 20) : 0,
        left: 0,
        right: 0
      },
      hasHardwareCutout: hasCutout,
      isMobile: bracket === 'phone',
      isTablet: bracket === 'tablet',
      isDesktop: bracket === 'desktop'
    };
  }, [deviceMode, windowDimensions.width, realOS]);

  const value = useMemo<SafeAreaContextType>(() => ({
    deviceMode,
    setDeviceMode,
    screenBracket,
    platform,
    insets,
    isMobile,
    isTablet,
    isDesktop,
    hasHardwareCutout,
    viewportWidth: windowDimensions.width,
    viewportHeight: windowDimensions.height
  }), [deviceMode, screenBracket, platform, insets, isMobile, isTablet, isDesktop, hasHardwareCutout, windowDimensions]);

  return (
    <SafeAreaContext.Provider value={value}>
      {children}
    </SafeAreaContext.Provider>
  );
};

export function useSafeArea(): SafeAreaContextType {
  const context = useContext(SafeAreaContext);
  if (!context) {
    throw new Error('useSafeArea must be used within a SafeAreaProvider');
  }
  return context;
}
