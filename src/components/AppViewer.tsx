import React, { useState } from 'react';
import { X, Shield, ExternalLink, AlertTriangle } from 'lucide-react';

interface Props {
  app: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AppViewer: React.FC<Props> = ({ app, isOpen, onClose }) => {
  const [failed, setFailed] = useState(false);
  if (!isOpen || !app) return null;

  // Security: validate https
  const isValidHttps = app.live_web_url?.startsWith('https://');
  
  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex flex-col">
      {/* Top bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#0a0b18] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">{app.title?.[0]}</div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{app.title} <span className="text-slate-500 font-normal">by {app.studio}</span></p>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate"><Shield className="w-3 h-3"/>Sandboxed • No access to your Prism data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={app.live_web_url} target="_blank" rel="noopener noreferrer" className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] flex items-center gap-1"><ExternalLink className="w-3 h-3"/>Open in new tab</a>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><X className="w-4 h-4"/></button>
        </div>
      </div>

      {/* Secure iframe */}
      <div className="flex-1 bg-black relative">
        {!isValidHttps || failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-3"/>
            <p className="text-white font-bold text-[14px]">{!isValidHttps ? "Invalid app URL" : "App failed to load"}</p>
            <p className="text-slate-400 text-[12px] mt-1 max-w-md">This app URL is not valid HTTPS or blocks embedding. For safety, we sandbox all apps — they cannot access your Prism UID, Library, or localStorage.</p>
            <a href={app.live_web_url} target="_blank" rel="noopener noreferrer" className="mt-4 h-9 px-5 rounded-full bg-white text-black text-[12px] font-bold">Open securely in new tab</a>
          </div>
        ) : (
          <iframe
            title={app.title}
            src={app.live_web_url}
            className="w-full h-full border-0 bg-white"
            // CRITICAL SECURITY: sandbox prevents evil apps from stealing Prism data
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-presentation"
            allow="clipboard-read; clipboard-write; autoplay; encrypted-media"
            referrerPolicy="no-referrer"
            onError={()=>setFailed(true)}
          />
        )}
      </div>
    </div>
  );
};