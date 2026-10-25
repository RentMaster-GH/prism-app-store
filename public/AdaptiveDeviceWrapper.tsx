import React from 'react';
import { Smartphone, Tablet, Monitor, Sparkles, Sliders, Shield, Zap, Laptop } from 'lucide-react';
import { useSafeArea, DevicePreviewMode } from '../context/SafeAreaContext';

interface AdaptiveDeviceWrapperProps {
  children: React.ReactNode;
}

export const AdaptiveDeviceWrapper: React.FC<AdaptiveDeviceWrapperProps> = ({ children }) => {
  const { 
    deviceMode, 
    setDeviceMode, 
    screenBracket, 
    platform, 
    insets, 
    hasHardwareCutout,
    viewportWidth
  } = useSafeArea();

  // If in auto mode, render directly with full responsive container and safe area insets
  if (deviceMode === 'auto') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Device preview toolbar toggle banner for testing cross-platform layouts */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 text-[11px] py-1.5 px-4 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">Layout Engine:</span>
            <span className="font-semibold text-white capitalize">{screenBracket}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 capitalize">{platform} Native</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{viewportWidth}px width</span>
            {hasHardwareCutout && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800/60">
                Safe Area Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 font-sans">
            <span className="hidden sm:inline mr-1 text-slate-500">Preview:</span>
            <button
              onClick={() => setDeviceMode('auto')}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-600 text-white"
              title="Native Responsive Auto Mode"
            >
              Auto
            </button>
            <button
              onClick={() => setDeviceMode('ios-phone')}
              className="px-2 py-0.5 rounded text-[10px] font-medium hover:bg-slate-800 text-slate-300"
              title="Simulate iPhone 16 Pro (Dynamic Island & Safe Area)"
            >
              iOS
            </button>
            <button
              onClick={() => setDeviceMode('android-phone')}
              className="px-2 py-0.5 rounded text-[10px] font-medium hover:bg-slate-800 text-slate-300"
              title="Simulate Google Pixel 9 Pro (Punch Hole Cutout)"
            >
              Android
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className="px-2 py-0.5 rounded text-[10px] font-medium hover:bg-slate-800 text-slate-300"
              title="Simulate Tablet / iPad Split Layout"
            >
              Tablet
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    );
  }

  // Preview Mode with Hardware Mockup & Safe Area Cutouts
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 antialiased">
      {/* Top Controller Bar */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-white">Cross-Platform Simulator</span>
          <span className="text-slate-500">·</span>
          <span className="text-indigo-400 font-mono text-[11px]">Safe Area Context</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {deviceMode === 'ios-phone' && 'iPhone 16 Pro (Dynamic Island & Insets)'}
            {deviceMode === 'android-phone' && 'Pixel 9 Pro (Camera Cutout & Gesture Bar)'}
            {deviceMode === 'tablet' && 'iPad Pro / Android Tablet (Adaptive Grid)'}
            {deviceMode === 'desktop' && 'Desktop / Ultrawide Viewport'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDeviceMode('auto')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            Exit Simulator (Auto)
          </button>
          <button
            onClick={() => setDeviceMode('ios-phone')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'ios-phone' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            iPhone (iOS)
          </button>
          <button
            onClick={() => setDeviceMode('android-phone')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'android-phone' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Pixel (Android)
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              deviceMode === 'tablet' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Tablet
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center w-full">
        {deviceMode === 'ios-phone' && (
          <div className="relative w-[393px] h-[852px] max-h-[90vh] rounded-[52px] bg-slate-900 border-[10px] border-slate-800 shadow-2xl shadow-indigo-950/60 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
            {/* Dynamic Island Cutout */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-between px-3 pointer-events-none shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2 h-2 rounded-full bg-slate-800 ring-1 ring-indigo-950/40" />
            </div>

            {/* Content inside safe area */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full z-50 pointer-events-none" />
          </div>
        )}

        {deviceMode === 'android-phone' && (
          <div className="relative w-[400px] h-[860px] max-h-[90vh] rounded-[44px] bg-slate-900 border-[8px] border-slate-800 shadow-2xl shadow-sky-950/60 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
            {/* Camera Punch Hole Cutout */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 ring-2 ring-slate-950 pointer-events-none" />

            {/* Content inside safe area */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>

            {/* Android Navigation Pill */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
          </div>
        )}

        {deviceMode === 'tablet' && (
          <div className="relative w-[820px] h-[920px] max-h-[90vh] rounded-[36px] bg-slate-900 border-[12px] border-slate-800 shadow-2xl shadow-indigo-950/60 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
            {/* Tablet Camera Cutout */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50 pointer-events-none" />

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>

            {/* Tablet Home Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-44 h-1 bg-white/30 rounded-full z-50 pointer-events-none" />
          </div>
        )}
      </div>
    </div>
  );
};
