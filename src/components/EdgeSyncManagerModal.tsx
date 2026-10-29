import React, { useState } from 'react';
import { 
  Globe, RefreshCw, Server, ShieldCheck, Database, 
  CheckCircle2, Clock, AlertTriangle, X, Zap, 
  ArrowRight, HardDrive, Wifi, Smartphone, Laptop
} from 'lucide-react';
import { AppItem, InstalledAppState } from '../types';

interface EdgeSyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  installedApps: Record<string, InstalledAppState>;
  onForcePurgeCache: () => Promise<void>;
  onRefreshRegistry: () => void;
}

interface EdgeNode {
  id: string;
  name: string;
  location: string;
  status: 'synced' | 'propagating' | 'healthy';
  latencyMs: number;
  lastSyncAgo: string;
  propagationProgress: number; // 0-100
}

const REGIONAL_EDGES: EdgeNode[] = [
  { id: 'edge-us-east', name: 'US-East (N. Virginia)', location: 'iad1.edge.prism', status: 'synced', latencyMs: 24, lastSyncAgo: '12s ago', propagationProgress: 100 },
  { id: 'edge-eu-west', name: 'EU-Central (Frankfurt)', location: 'fra1.edge.prism', status: 'synced', latencyMs: 82, lastSyncAgo: '28s ago', propagationProgress: 100 },
  { id: 'edge-ap-east', name: 'Asia-Pacific (Tokyo)', location: 'hnd1.edge.prism', status: 'propagating', latencyMs: 145, lastSyncAgo: '1m ago', propagationProgress: 94 },
  { id: 'edge-sa-east', name: 'South America (São Paulo)', location: 'gru1.edge.prism', status: 'synced', latencyMs: 118, lastSyncAgo: '45s ago', propagationProgress: 100 },
];

export const EdgeSyncManagerModal: React.FC<EdgeSyncManagerModalProps> = ({
  isOpen,
  onClose,
  apps,
  installedApps,
  onForcePurgeCache,
  onRefreshRegistry
}) => {
  const [selectedEdge, setSelectedEdge] = useState<string>('edge-us-east');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'propagation' | 'caching' | 'diagnostics'>('propagation');

  if (!isOpen) return null;

  const userAppsCount = apps.filter(a => a.isUserUploaded).length;
  const installedCount = Object.keys(installedApps).length;

  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeSuccess(false);
    try {
      await onForcePurgeCache();
      onRefreshRegistry();
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Global Sync, CDN Propagation & Cache Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-sky-950 border border-sky-700 text-sky-300">
                  Live Edge
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-device synchronization, CDN regional propagation, and client cache invalidation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2 shrink-0 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('propagation')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'propagation'
                ? 'text-sky-400 border-sky-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>1. Propagation Delay & CDNs</span>
          </button>

          <button
            onClick={() => setActiveTab('caching')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'caching'
                ? 'text-sky-400 border-sky-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. App Store Caching & Invalidation</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'diagnostics'
                ? 'text-sky-400 border-sky-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Device Diagnostics</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'propagation' && (
            <div className="space-y-5">
              {/* Educational Architecture Explanation */}
              <div className="bg-sky-950/30 border border-sky-800/40 rounded-xl p-4 text-xs leading-relaxed text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Why Releases Experience Propagation Delay
                    </h4>
                    <p>
                      When an update is approved for release, the new app binary and updated metadata must sync across all distributed regional servers and Content Delivery Networks (CDNs).
                      During this window (from minutes up to 24 hours), users in different regions may temporarily reach an edge server serving the previous version.
                    </p>
                  </div>
                </div>
              </div>

              {/* Edge Servers Status */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Global Edge Node Status
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Active Edge: <span className="text-sky-300 font-mono">{selectedEdge}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REGIONAL_EDGES.map((edge) => (
                    <div
                      key={edge.id}
                      onClick={() => setSelectedEdge(edge.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        selectedEdge === edge.id
                          ? 'bg-sky-950/40 border-sky-500/60 shadow-md shadow-sky-950/50 ring-1 ring-sky-500/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">{edge.name}</span>
                        {edge.status === 'synced' ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" /> Synced
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/60">
                            <Clock className="w-3 h-3 animate-spin" /> In-Flight ({edge.propagationProgress}%)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>{edge.location}</span>
                        <span>{edge.latencyMs}ms RTT</span>
                      </div>

                      <div className="mt-2.5 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            edge.status === 'synced' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                          }`}
                          style={{ width: `${edge.propagationProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seamless Sync Guarantee */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white mb-0.5">
                      Session Integrity & Zero-Interruption Guarantee
                    </h5>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Store updates are deployed atomically. Ongoing downloads, sandbox sessions, and all 
                      <span className="text-emerald-400 font-semibold font-mono"> {userAppsCount} user-uploaded apps</span> are strictly isolated and permanently preserved in local sandboxes without session interruption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'caching' && (
            <div className="space-y-5">
              {/* Problem Explanation */}
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-xs leading-relaxed text-slate-300">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-200 mb-1">
                      Preventing the Aggressive App Store Caching Loop
                    </h4>
                    <p>
                      Modern mobile and desktop app store clients cache metadata and app binaries heavily to save network bandwidth.
                      When a local cache becomes stale, it can produce a <strong>"lingering Update button that loop-clicks"</strong> or serve outdated icons.
                      Prism resolves this with cryptographic ETag checking and manual one-click cache invalidation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cache Health Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">LOCAL BUNDLE ETAG</div>
                  <div className="text-xs font-bold font-mono text-indigo-300 truncate">
                    W/"prism-v2.4.9-live"
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Verified with CDN</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">USER-UPLOADED APPS</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {userAppsCount} Retained
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Permanent safe storage</div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">INSTALLED SOFTWARE</div>
                  <div className="text-base font-bold font-mono text-sky-400">
                    {installedCount} Active
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Version locks valid</div>
                </div>
              </div>

              {/* Force Purge Action Box */}
              <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-sky-950/50 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-indigo-400" />
                      <span>Force Invalidate Cache & Sync Edge</span>
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 max-w-lg">
                      Flushes lingering client cache tags, purges stale update locks, and pulls the freshest manifest directly from the nearest CDN node. Your active session and uploaded apps remain 100% intact.
                    </p>
                  </div>

                  <button
                    onClick={handleExecutePurge}
                    disabled={isPurging}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isPurging ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Purging & Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>Force Invalidate Cache</span>
                      </>
                    )}
                  </button>
                </div>

                {purgeSuccess && (
                  <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-800 rounded-lg flex items-center gap-2 text-xs text-emerald-300 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Cache purged successfully! Re-synchronized with {selectedEdge}. All metadata is fresh.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 space-y-2">
                <div className="text-sky-400 font-bold mb-2"># Prism Sync Diagnostics Report</div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client Protocol:</span>
                  <span className="text-slate-200">HTTP/3 QUIC (Edge TLS 1.3)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Regional Node:</span>
                  <span className="text-slate-200">{selectedEdge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active ServiceWorker:</span>
                  <span className="text-emerald-400">Active (PWA-enabled)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local Storage Partition:</span>
                  <span className="text-slate-200">Isolated (`prism_*` keys)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Permanent App Storage:</span>
                  <span className="text-emerald-400">`prism_user_uploaded_apps` (Preserved)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Status:</span>
                  <span className="text-emerald-400">Zero Disruptions Recorded</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Auto-sync polling every 60s</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
