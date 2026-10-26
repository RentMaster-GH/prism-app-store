import React from 'react';
import { useSafeArea } from '../context/SafeAreaContext';

interface AdaptiveDeviceWrapperProps {
  children: React.ReactNode;
}

export const AdaptiveDeviceWrapper: React.FC<AdaptiveDeviceWrapperProps> = ({ children }) => {
  const { 
    deviceMode, 
    insets,
  } = useSafeArea();

  // If in auto mode, render directly WITHOUT debug banner
  if (deviceMode === 'auto') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="flex-1 flex flex-col w-full">
          {children}
        </div>
      </div>
    );
  }

  // Preview Mode stays same but for testing only
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-4 px-2 sm:px-4 antialiased">
      <div className="flex-1 flex items-center justify-center w-full">
        {deviceMode === 'ios-phone' && (
          <div className="relative w-[393px] h-[852px] max-h-[90vh] rounded-[52px] bg-slate-900 border-[10px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 pointer-events-none" />
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full z-50 pointer-events-none" />
          </div>
        )}

        {deviceMode === 'android-phone' && (
          <div className="relative w-[400px] h-[860px] max-h-[90vh] rounded-[44px] bg-slate-900 border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 pointer-events-none" />
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>
          </div>
        )}

        {deviceMode === 'tablet' && (
          <div className="relative w-[820px] h-[920px] max-h-[90vh] rounded-[36px] bg-slate-900 border-[12px] border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative" style={{ paddingTop: insets.top }}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};