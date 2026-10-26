import React from 'react';

export const AdaptiveDeviceWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {children}
    </div>
  );
};