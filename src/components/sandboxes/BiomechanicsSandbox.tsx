import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, Mountain, Heart, Compass } from 'lucide-react';

export const BiomechanicsSandbox: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [distanceKm, setDistanceKm] = useState(14.2);
  const [cadence, setCadence] = useState(174);
  const [heartRate, setHeartRate] = useState(158);
  const [elevationGain, setElevationGain] = useState(480);
  const [trailGradient, setTrailGradient] = useState(7); // % grade
  const [showTopoOverlay, setShowTopoOverlay] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setDistanceKm(prev => +(prev + 0.02).toFixed(2));
        setHeartRate(prev => Math.min(185, Math.max(145, prev + Math.floor(Math.random() * 5) - 2)));
        setCadence(prev => Math.min(182, Math.max(168, prev + Math.floor(Math.random() * 3) - 1)));
        setElevationGain(prev => prev + (trailGradient > 0 ? 1 : 0));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isRunning, trailGradient]);

  const paceMinKm = (5.2 - (cadence - 170) * 0.05 + trailGradient * 0.1).toFixed(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Alpine Telemetry & Gait Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Test real-time sensor processing and offline vector topo rendering</p>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            isRunning
              ? 'bg-amber-600/30 text-amber-300 border-amber-500/30 hover:bg-amber-600/40'
              : 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/40'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'Pause Telemetry' : 'Simulate Run'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Pace (min/km)</span>
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">{paceMinKm}</div>
          <span className="text-[10px] text-slate-500">Zone 3 Aerobic</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Heart Rate</span>
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">{heartRate} <span className="text-xs font-normal text-slate-400">bpm</span></div>
          <span className="text-[10px] text-emerald-400">HRV 68ms (High)</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Cadence</span>
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">{cadence} <span className="text-xs font-normal text-slate-400">spm</span></div>
          <span className="text-[10px] text-slate-500">Ground Contact 218ms</span>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
            <Mountain className="w-3 h-3 text-amber-400" />
            <span>Elevation Gain</span>
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums">+{elevationGain} <span className="text-xs font-normal text-slate-400">m</span></div>
          <span className="text-[10px] text-slate-500">{distanceKm} km total</span>
        </div>
      </div>

      {/* Simulated Topo Profile Chart */}
      <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 relative">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-mono">CHALET RIDGE LOOP — 2,480m PEAK</span>
          <button
            onClick={() => setShowTopoOverlay(!showTopoOverlay)}
            className="text-xs text-emerald-400 hover:underline"
          >
            {showTopoOverlay ? 'Hide Isolines' : 'Show Isolines'}
          </button>
        </div>

        <div className="h-32 w-full relative overflow-hidden flex items-end">
          <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
            {/* Offline Topographic Contour Lines */}
            {showTopoOverlay && (
              <>
                <path d="M0,40 Q120,20 250,50 T500,30" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />
                <path d="M0,60 Q130,45 270,70 T500,55" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />
                <path d="M0,80 Q100,70 240,90 T500,75" fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />
              </>
            )}

            {/* Gradient profile */}
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Elevation curve */}
            <path
              d="M0,110 Q80,95 150,70 T300,35 Q390,45 500,80 L500,120 L0,120 Z"
              fill="url(#elevationGrad)"
            />
            <path
              d="M0,110 Q80,95 150,70 T300,35 Q390,45 500,80"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Current Runner Marker */}
            <circle cx="280" cy="40" r="5" fill="#34d399" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* Grade Control */}
      <div className="mt-4 flex items-center justify-between bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400">Trail Incline Simulation:</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={-5}
            max={20}
            value={trailGradient}
            onChange={e => setTrailGradient(Number(e.target.value))}
            className="w-36 accent-emerald-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
          />
          <span className="font-mono text-emerald-400 w-12 text-right">{trailGradient}% grade</span>
        </div>
      </div>
    </div>
  );
};
