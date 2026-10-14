import React, { useState } from 'react';
import { Download, Sliders, Type, Layers, Check } from 'lucide-react';

export const VectorCanvasSandbox: React.FC = () => {
  const [headline, setHeadline] = useState('TYPOGRAPHIC EXPLORATIONS');
  const [subline, setSubline] = useState('INTERNATIONAL SWISS STYLE — ISSUE 2026');
  const [fontWeight, setFontWeight] = useState(800);
  const [letterSpacing, setLetterSpacing] = useState(2);
  const [selectedPalette, setSelectedPalette] = useState<'bauhaus' | 'minimal' | 'cyber'>('bauhaus');
  const [shapeCount, setShapeCount] = useState<'minimal' | 'bold' | 'complex'>('bold');
  const [copied, setCopied] = useState(false);

  const palettes = {
    bauhaus: {
      bg: '#0f172a',
      accent1: '#f43f5e',
      accent2: '#38bdf8',
      accent3: '#eab308',
      textColor: '#f8fafc',
      name: 'Bauhaus Modern'
    },
    minimal: {
      bg: '#18181b',
      accent1: '#10b981',
      accent2: '#64748b',
      accent3: '#d4d4d8',
      textColor: '#fafafa',
      name: 'Swiss Monolith'
    },
    cyber: {
      bg: '#020617',
      accent1: '#818cf8',
      accent2: '#c084fc',
      accent3: '#f472b6',
      textColor: '#f1f5f9',
      name: 'Neo Indigo'
    }
  };

  const currentTheme = palettes[selectedPalette];

  const handleExportSVG = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Interactive Vector Studio Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Test variable typographic axis and procedural vector layout</p>
        </div>
        <button
          onClick={handleExportSVG}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 text-xs font-medium rounded-lg border border-sky-500/30 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copied ? 'SVG Generated!' : 'Export SVG'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Interactive Poster Canvas */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            className="w-full max-w-[360px] aspect-[3/4] rounded-lg p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between transition-colors border border-slate-700/60"
            style={{ backgroundColor: currentTheme.bg }}
          >
            {/* Background geometric shapes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" viewBox="0 0 300 400">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentTheme.accent1} />
                  <stop offset="100%" stopColor={currentTheme.accent2} />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="30" y1="0" x2="30" y2="400" stroke={currentTheme.accent2} strokeWidth="0.5" strokeOpacity="0.25" />
              <line x1="270" y1="0" x2="270" y2="400" stroke={currentTheme.accent2} strokeWidth="0.5" strokeOpacity="0.25" />
              <line x1="0" y1="200" x2="300" y2="200" stroke={currentTheme.accent2} strokeWidth="0.5" strokeOpacity="0.25" />

              {/* Shapes based on complexity */}
              {shapeCount !== 'minimal' && (
                <circle cx="210" cy="120" r="70" fill="url(#grad1)" fillOpacity="0.85" />
              )}
              
              <rect x="30" y="160" width="110" height="110" fill={currentTheme.accent3} fillOpacity="0.75" />
              
              {shapeCount === 'complex' && (
                <>
                  <polygon points="180,240 280,360 140,360" fill={currentTheme.accent2} fillOpacity="0.6" />
                  <circle cx="65" cy="80" r="25" stroke={currentTheme.accent1} strokeWidth="4" fill="none" />
                </>
              )}
            </svg>

            {/* Poster Header */}
            <div className="relative z-10">
              <div className="text-[10px] tracking-widest font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>VOL. 04 / EDITION A</span>
                <span className="font-semibold" style={{ color: currentTheme.accent1 }}>VERIFIED LOCAL</span>
              </div>
              <h2
                className="text-2xl leading-none tracking-tight transition-all"
                style={{
                  fontWeight,
                  letterSpacing: `${letterSpacing}px`,
                  color: currentTheme.textColor
                }}
              >
                {headline}
              </h2>
            </div>

            {/* Poster Footer */}
            <div className="relative z-10 pt-4 border-t border-slate-700/50">
              <p className="text-[11px] font-mono tracking-wider mb-2" style={{ color: currentTheme.textColor }}>
                {subline}
              </p>
              <div className="flex justify-between items-end text-[9px] font-mono text-slate-400">
                <span>LOCAL SANDBOX RENDERING</span>
                <span>300 DPI VECTOR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Typography Inputs */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-2.5">
              <Type className="w-3.5 h-3.5 text-sky-400" />
              <span>Typographic Parameters</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Headline Text</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Subline Caption</label>
                <input
                  type="text"
                  value={subline}
                  onChange={e => setSubline(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Variable Weight Axis</span>
                  <span className="font-mono text-sky-400">{fontWeight}</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={900}
                  step={50}
                  value={fontWeight}
                  onChange={e => setFontWeight(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Tracking / Kerning</span>
                  <span className="font-mono text-sky-400">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={8}
                  step={1}
                  value={letterSpacing}
                  onChange={e => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-2.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Palette Harmony</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(palettes) as ('bauhaus' | 'minimal' | 'cyber')[]).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedPalette(key)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedPalette === key
                      ? 'border-sky-500 bg-sky-950/30'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex gap-1 mb-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palettes[key].accent1 }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palettes[key].accent2 }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: palettes[key].accent3 }} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 block">{palettes[key].name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shape Density */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Composition Geometry</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['minimal', 'bold', 'complex'] as const).map(density => (
                <button
                  key={density}
                  onClick={() => setShapeCount(density)}
                  className={`py-1.5 px-2 rounded text-center capitalize transition-colors ${
                    shapeCount === density
                      ? 'bg-sky-600 text-white font-medium'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
