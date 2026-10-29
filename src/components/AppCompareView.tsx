import React, { useState } from 'react';
import { AppItem } from '../types';
import { ArrowLeftRight, Check, X, ShieldCheck, Zap, HardDrive, Lock, HeartHandshake } from 'lucide-react';

interface AppCompareViewProps {
  apps: AppItem[];
  initialAppAId?: string;
  initialAppBId?: string;
  onOpenDetails: (app: AppItem) => void;
}

export const AppCompareView: React.FC<AppCompareViewProps> = ({
  apps,
  initialAppAId,
  initialAppBId,
  onOpenDetails
}) => {
  const [appAId, setAppAId] = useState<string>(initialAppAId || apps[0]?.id || '');
  const [appBId, setAppBId] = useState<string>(initialAppBId || apps[1]?.id || '');

  const appA = apps.find(a => a.id === appAId) || apps[0];
  const appB = apps.find(a => a.id === appBId) || apps[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="max-w-3xl">
          <span className="text-[11px] font-mono text-indigo-400 tracking-wider uppercase block mb-1">
            System Benchmark & Spec Inspection
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Side-by-Side App Comparator
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Neither Google Play nor Apple App Store let you compare competing software directly. Compare package size, tracker count, offline resilience, and pricing models before downloading.
          </p>
        </div>

        {/* App Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Select Application A</label>
            <select
              value={appAId}
              onChange={e => setAppAId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {apps.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category}) — {a.priceFormatted}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">Select Application B</label>
            <select
              value={appBId}
              onChange={e => setAppBId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              {apps.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category}) — {a.priceFormatted}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-3 p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="text-slate-400 font-medium">Benchmark Metric</div>
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="truncate">{appA.name}</span>
          </div>
          <div className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="truncate">{appB.name}</span>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
          {/* Price & Monetization */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Monetization Model</span>
              <span className="text-[11px] text-slate-500">Long-term licensing</span>
            </div>
            <div>
              <span className="font-semibold text-white text-base block">{appA.priceFormatted}</span>
              <span className="text-xs text-indigo-400">{appA.priceModel}</span>
            </div>
            <div>
              <span className="font-semibold text-white text-base block">{appB.priceFormatted}</span>
              <span className="text-xs text-sky-400">{appB.priceModel}</span>
            </div>
          </div>

          {/* Privacy Score & Trackers */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Privacy & Trackers</span>
              <span className="text-[11px] text-slate-500">Independent audit</span>
            </div>
            <div>
              <span className="text-base font-bold font-mono text-emerald-400 block">Grade {appA.privacyGrade}</span>
              <span className="text-xs text-slate-400">0 third-party trackers</span>
            </div>
            <div>
              <span className="text-base font-bold font-mono text-emerald-400 block">Grade {appB.privacyGrade}</span>
              <span className="text-xs text-slate-400">0 third-party trackers</span>
            </div>
          </div>

          {/* Disk Footprint */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Package Footprint</span>
              <span className="text-[11px] text-slate-500">Initial download size</span>
            </div>
            <div>
              <span className="font-mono text-base font-bold text-white block tabular-nums">{appA.sizeMB} MB</span>
              <span className="text-xs text-slate-400">Low device impact</span>
            </div>
            <div>
              <span className="font-mono text-base font-bold text-white block tabular-nums">{appB.sizeMB} MB</span>
              <span className="text-xs text-slate-400">Low device impact</span>
            </div>
          </div>

          {/* Offline Capability */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Offline Usability</span>
              <span className="text-[11px] text-slate-500">Operates without internet</span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>100% Offline Ready</span>
              </span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>100% Offline Ready</span>
              </span>
            </div>
          </div>

          {/* Permissions Count */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Hardware Permissions</span>
              <span className="text-[11px] text-slate-500">Sensors, mic, location</span>
            </div>
            <div>
              <span className="font-mono text-white font-medium block">
                {appA.permissions.length} permission(s)
              </span>
              <span className="text-xs text-slate-400">
                {appA.permissions.map(p => p.name).join(', ') || 'Hermetic sandbox'}
              </span>
            </div>
            <div>
              <span className="font-mono text-white font-medium block">
                {appB.permissions.length} permission(s)
              </span>
              <span className="text-xs text-slate-400">
                {appB.permissions.map(p => p.name).join(', ') || 'Hermetic sandbox'}
              </span>
            </div>
          </div>

          {/* Open Source Status */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
            <div className="text-slate-400 font-medium">
              <span className="text-slate-200 block">Open Source License</span>
              <span className="text-[11px] text-slate-500">Auditable source code</span>
            </div>
            <div>
              {appA.openSource ? (
                <span className="text-teal-400 font-mono text-xs block">{appA.license || 'Open Source'}</span>
              ) : (
                <span className="text-slate-400 text-xs">Proprietary (Independent Audit)</span>
              )}
            </div>
            <div>
              {appB.openSource ? (
                <span className="text-teal-400 font-mono text-xs block">{appB.license || 'Open Source'}</span>
              ) : (
                <span className="text-slate-400 text-xs">Proprietary (Independent Audit)</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 p-4 sm:p-6 items-center bg-slate-950/40">
            <div className="text-slate-400 font-medium">Deep Dive Details</div>
            <div>
              <button
                onClick={() => onOpenDetails(appA)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Inspect {appA.name}
              </button>
            </div>
            <div>
              <button
                onClick={() => onOpenDetails(appB)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Inspect {appB.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
