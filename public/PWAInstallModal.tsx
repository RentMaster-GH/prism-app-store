import React, { useState } from 'react';
import { 
  X, Download, Smartphone, Monitor, Apple, Check, 
  Share2, ArrowUpRight, Copy, CheckCircle2, Sparkles,
  ExternalLink, ShieldCheck, Info
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    install, 
    launchStandaloneWindow 
  } = usePWAInstall();

  const [copiedLink, setCopiedLink] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [showManualSteps, setShowManualSteps] = useState(false);
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    return 'android';
  });

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2500);
        return;
      } else {
        setPromptMessage('Install prompt was dismissed. You can click Direct Install anytime or launch standalone mode.');
        setTimeout(() => setPromptMessage(null), 5000);
        return;
      }
    }

    // If native prompt is not currently available from browser
    if (isIOS) {
      setSelectedDeviceTab('ios');
      setShowManualSteps(true);
      setPromptMessage('iOS Safari requires tapping Share -> "Add to Home Screen" below.');
    } else {
      setShowManualSteps(true);
      setPromptMessage('Native browser install event pending. You can also click the install icon (+) directly in your browser address bar.');
    }
    setTimeout(() => setPromptMessage(null), 6000);
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-full border border-slate-800 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <img src="/icon.svg" alt="Prism Store Icon" className="w-9 h-9" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-400 tracking-wider uppercase mb-1">
              <span>DIRECT PWA INSTALLATION</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold">NATIVE PROMPT</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Install Prism App Store Directly
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Add directly to your device apps with native Progressive Web App execution.
            </p>
          </div>
        </div>

        {/* Primary Direct Actions Section */}
        <div className="space-y-4 mb-6">
          {isInstalled || installSuccess ? (
            <div className="bg-emerald-950/50 border border-emerald-800/80 p-5 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-white">Prism App Store is Installed!</h4>
              <p className="text-xs text-slate-300">
                You can now launch the store directly from your mobile home screen, dock, or desktop application list.
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/30 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                  RECOMMENDED: DIRECT 1-CLICK ACTION
                </span>
                <h4 className="text-sm font-bold text-white">
                  Add Directly to Your Phone or Desktop
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Trigger the native browser install dialog directly or launch in an isolated standalone window.
                </p>
              </div>

              {promptMessage && (
                <div className="p-3 bg-indigo-950/60 border border-indigo-700/60 rounded-lg text-xs text-indigo-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{promptMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Direct Install Prompt</span>
                </button>

                <button
                  onClick={launchStandaloneWindow}
                  className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <span>Launch Standalone App</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Offline Ready · Zero Downloads</span>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy App URL'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Manual Browser Instructions Guide */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowManualSteps(!showManualSteps)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <span>{showManualSteps ? 'Hide device-specific instructions' : 'Need device-specific browser instructions? (Click to view)'}</span>
            <span className="text-indigo-400 font-mono text-[11px]">{showManualSteps ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showManualSteps && (
            <div className="mt-3 space-y-3">
              {/* Device Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedDeviceTab('android')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedDeviceTab === 'android'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setSelectedDeviceTab('ios')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedDeviceTab === 'ios'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  iPhone & iPad
                </button>
                <button
                  onClick={() => setSelectedDeviceTab('desktop')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedDeviceTab === 'desktop'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {/* Steps for Android */}
              {selectedDeviceTab === 'android' && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Smartphone className="w-4 h-4" />
                    <span>Android Chrome / Samsung Internet</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Click the <strong>Direct Install Prompt</strong> button above.</li>
                    <li>Or click the <strong>Install App</strong> banner if prompted by Chrome.</li>
                    <li>If manual menu is needed: tap the three dots <strong>(⋮)</strong> and tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.</li>
                  </ol>
                </div>
              )}

              {/* Steps for iOS */}
              {selectedDeviceTab === 'ios' && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Apple className="w-4 h-4" />
                    <span>iOS Safari (iPhone & iPad)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Open this page in <strong>Apple Safari</strong>.</li>
                    <li>Tap the <strong>Share</strong> button (box with upward arrow <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-indigo-400" />) in the Safari toolbar.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Tap <strong>Add</strong> in the top-right corner. Prism Store will appear on your home screen.</li>
                  </ol>
                </div>
              )}

              {/* Steps for Desktop */}
              {selectedDeviceTab === 'desktop' && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-2.5">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <Monitor className="w-4 h-4" />
                    <span>Desktop Chrome / Edge / Brave</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                    <li>Click <strong>Direct Install Prompt</strong> above to invoke the install prompt.</li>
                    <li>Look at your browser address bar on the right side: click the <strong>Install icon (+)</strong>.</li>
                    <li>Click <strong>Install</strong> when the dialog appears. Prism Store will open in its own standalone window with taskbar/dock integration.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
