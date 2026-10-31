import { X, Download } from 'lucide-react';
export const DirectInstallBanner = ({ onDirectInstall, onDismiss }: any) => (
  <div className="relative rounded-xl bg-[#12132a] border border-white/[0.06] px-4 py-3 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0"><Download className="w-3.5 h-3.5 text-white"/></div>
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-white truncate">Install Prism Store Directly To Your Device</p>
        <p className="text-[10px] text-slate-500 truncate hidden sm:block">Add Prism App straight from this page with native PWA integration.</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <button onClick={onDirectInstall} className="h-7 px-3 rounded-full bg-white text-black text-[11px] font-bold hover:bg-slate-100 transition inline-flex items-center justify-center text-center leading-none">Direct Install Now</button>
      <button onClick={onDismiss} className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-slate-400"><X className="w-3.5 h-3.5"/></button>
    </div>
  </div>
);