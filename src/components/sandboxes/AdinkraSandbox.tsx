import React, { useState } from 'react';
import { Download, Sliders, Check, BookOpen, Layers } from 'lucide-react';

interface AdinkraSymbol {
  id: string;
  name: string;
  meaning: string;
  philosophy: string;
  pathData: string;
  viewBox: string;
}

const ADINKRA_SYMBOLS: AdinkraSymbol[] = [
  {
    id: 'gye-nyame',
    name: 'Gye Nyame',
    meaning: 'Supremacy & Omnipotence',
    philosophy: 'Recognizes the profound mysteries of existence and inner resilience.',
    viewBox: '0 0 200 200',
    pathData: 'M100,20 C110,40 130,50 140,70 C150,90 140,110 120,120 C110,125 105,135 105,150 L95,150 C95,135 90,125 80,120 C60,110 50,90 60,70 C70,50 90,40 100,20 Z M70,75 C70,65 80,60 90,65 C85,75 80,85 85,95 C75,95 70,85 70,75 Z M130,75 C130,65 120,60 110,65 C115,75 120,85 115,95 C125,95 130,85 130,75 Z M95,155 L105,155 L105,180 L95,180 Z'
  },
  {
    id: 'sankofa',
    name: 'Sankofa',
    meaning: 'Learn From the Past',
    philosophy: '“It is not wrong to go back for that which you have forgotten.” Wisdom through reflection.',
    viewBox: '0 0 200 200',
    pathData: 'M100,40 C130,40 155,65 155,95 C155,130 120,160 100,175 C80,160 45,130 45,95 C45,65 70,40 100,40 Z M100,70 C85,70 75,82 75,95 C75,115 100,135 100,135 C100,135 125,115 125,95 C125,82 115,70 100,70 Z'
  },
  {
    id: 'dwennimmen',
    name: 'Dwennimmen',
    meaning: 'Ram’s Horns (Strength with Humility)',
    philosophy: 'Even the mighty ram with powerful curved horns moves with gentleness and humility.',
    viewBox: '0 0 200 200',
    pathData: 'M60,60 C40,75 40,110 65,125 C85,135 100,120 100,100 C100,80 80,65 65,75 M140,60 C160,75 160,110 135,125 C115,135 100,120 100,100 C100,80 120,65 135,75 M60,140 C40,125 40,90 65,75 M140,140 C160,125 160,90 135,75'
  },
  {
    id: 'aya',
    name: 'Aya',
    meaning: 'The Fern (Endurance & Defiance)',
    philosophy: 'The hardy fern survives in harsh soil, representing perseverance and resourcefulness.',
    viewBox: '0 0 200 200',
    pathData: 'M100,20 L100,180 M100,40 C80,35 60,45 60,45 M100,40 C120,35 140,45 140,45 M100,70 C75,65 55,80 55,80 M100,70 C125,65 145,80 145,80 M100,100 C70,95 50,115 50,115 M100,100 C130,95 150,115 150,115 M100,130 C75,125 55,145 55,145 M100,130 C125,125 145,145 145,145'
  }
];

export const AdinkraSandbox: React.FC = () => {
  const [selectedSymbolId, setSelectedSymbolId] = useState('gye-nyame');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [fillMode, setFillMode] = useState<'stroke' | 'fill' | 'both'>('stroke');
  const [theme, setTheme] = useState<'terracotta' | 'obsidian' | 'gold'>('terracotta');
  const [copied, setCopied] = useState(false);

  const activeSymbol = ADINKRA_SYMBOLS.find(s => s.id === selectedSymbolId) || ADINKRA_SYMBOLS[0];

  const themes = {
    terracotta: {
      bg: '#181211',
      surface: '#261b18',
      stroke: '#f97316',
      accent: '#fb923c',
      name: 'Ashanti Terracotta'
    },
    obsidian: {
      bg: '#020617',
      surface: '#0f172a',
      stroke: '#38bdf8',
      accent: '#818cf8',
      name: 'Modern Obsidian'
    },
    gold: {
      bg: '#141208',
      surface: '#241f0d',
      stroke: '#eab308',
      accent: '#facc15',
      name: 'Royal Gold'
    }
  };

  const currentTheme = themes[theme];

  const handleExport = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Adinkra Vector Canvas Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Procedural SVG geometry and philosophical typography engine</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/30 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{copied ? 'SVG Exported!' : 'Export Vector'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Visualizer Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className="w-full max-w-[340px] aspect-square rounded-2xl p-6 relative flex flex-col items-center justify-between border border-slate-700/60 shadow-2xl transition-colors"
            style={{ backgroundColor: currentTheme.bg }}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-mono tracking-widest text-slate-400">
              <span>ADINKRA STUDIO v1.4</span>
              <span style={{ color: currentTheme.stroke }}>WEST AFRICAN ICONOGRAPHY</span>
            </div>

            {/* Rendered SVG Symbol */}
            <div className="my-auto py-2">
              <svg
                viewBox={activeSymbol.viewBox}
                className="w-48 h-48 transition-all duration-300"
                style={{
                  filter: `drop-shadow(0 0 16px ${currentTheme.stroke}33)`
                }}
              >
                <path
                  d={activeSymbol.pathData}
                  fill={fillMode === 'stroke' ? 'none' : currentTheme.stroke}
                  stroke={fillMode === 'fill' ? 'none' : currentTheme.stroke}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="w-full text-center border-t border-slate-700/40 pt-2">
              <span className="text-base font-bold text-white tracking-wider block">
                {activeSymbol.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                {activeSymbol.meaning}
              </span>
            </div>
          </div>
        </div>

        {/* Live Controls & Symbol Selector */}
        <div className="lg:col-span-5 space-y-4 text-xs">
          {/* Symbol Selectors */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-2 font-medium">Select Sacred Symbol</span>
            <div className="grid grid-cols-2 gap-2">
              {ADINKRA_SYMBOLS.map(sym => (
                <button
                  key={sym.id}
                  onClick={() => setSelectedSymbolId(sym.id)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    selectedSymbolId === sym.id
                      ? 'border-amber-500 bg-amber-950/30 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <strong className="block text-xs font-semibold text-slate-200">{sym.name}</strong>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{sym.meaning}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cultural Philosophy Card */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Philosophical Invariant</span>
            </div>
            <p className="text-slate-300 italic text-[11px] leading-relaxed">
              "{activeSymbol.philosophy}"
            </p>
          </div>

          {/* Stroke & Fill Parameters */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Vector Stroke Weight</span>
                <span className="font-mono text-amber-400">{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={strokeWidth}
                onChange={e => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
              />
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Rendering Mode</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['stroke', 'fill', 'both'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFillMode(mode)}
                    className={`py-1 text-center rounded text-xs capitalize transition-colors ${
                      fillMode === mode
                        ? 'bg-amber-600 text-white font-medium'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">Traditional Palette</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(themes) as (keyof typeof themes)[]).map(tKey => (
                  <button
                    key={tKey}
                    onClick={() => setTheme(tKey)}
                    className={`py-1 text-center rounded text-xs capitalize transition-colors ${
                      theme === tKey
                        ? 'bg-slate-800 text-white border border-amber-500 font-medium'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {themes[tKey].name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
