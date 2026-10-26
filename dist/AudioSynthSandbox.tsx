import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, RotateCcw } from 'lucide-react';

interface AudioSynthSandboxProps {
  accentColor?: string;
}

export const AudioSynthSandbox: React.FC<AudioSynthSandboxProps> = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<OscillatorType>('sawtooth');
  const [cutoffFreq, setCutoffFreq] = useState(1800);
  const [resonance, setResonance] = useState(8);
  const [masterVolume, setMasterVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeVoicesRef = useRef<Map<string, { osc: OscillatorNode; gain: GainNode }>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Note frequency map
  const NOTES: { name: string; freq: number; keyChar: string; isSharp?: boolean }[] = [
    { name: 'C4', freq: 261.63, keyChar: 'A' },
    { name: 'C#4', freq: 277.18, keyChar: 'W', isSharp: true },
    { name: 'D4', freq: 293.66, keyChar: 'S' },
    { name: 'D#4', freq: 311.13, keyChar: 'E', isSharp: true },
    { name: 'E4', freq: 329.63, keyChar: 'D' },
    { name: 'F4', freq: 349.23, keyChar: 'F' },
    { name: 'F#4', freq: 369.99, keyChar: 'T', isSharp: true },
    { name: 'G4', freq: 392.00, keyChar: 'G' },
    { name: 'G#4', freq: 415.30, keyChar: 'Y', isSharp: true },
    { name: 'A4', freq: 440.00, keyChar: 'H' },
    { name: 'A#4', freq: 466.16, keyChar: 'U', isSharp: true },
    { name: 'B4', freq: 493.88, keyChar: 'J' },
    { name: 'C5', freq: 523.25, keyChar: 'K' },
  ];

  // Initialize WebAudio context lazily
  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoffFreq, ctx.currentTime);
      filter.Q.setValueAtTime(resonance, ctx.currentTime);

      const master = ctx.createGain();
      master.gain.setValueAtTime(isMuted ? 0 : masterVolume, ctx.currentTime);

      filter.connect(master);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      filterNodeRef.current = filter;
      masterGainRef.current = master;
    }

    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    if (filterNodeRef.current && audioCtxRef.current) {
      filterNodeRef.current.frequency.setTargetAtTime(cutoffFreq, audioCtxRef.current.currentTime, 0.05);
      filterNodeRef.current.Q.setTargetAtTime(resonance, audioCtxRef.current.currentTime, 0.05);
    }
  }, [cutoffFreq, resonance]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : masterVolume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [masterVolume, isMuted]);

  const startNote = (noteName: string, freq: number) => {
    ensureAudioContext();
    const ctx = audioCtxRef.current;
    const filter = filterNodeRef.current;
    if (!ctx || !filter) return;

    // Stop existing note if already held
    stopNote(noteName);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Soft attack
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(filter);
    osc.start();

    activeVoicesRef.current.set(noteName, { osc, gain });
    setActiveNote(noteName);
    setIsPlaying(true);
  };

  const stopNote = (noteName: string) => {
    const voice = activeVoicesRef.current.get(noteName);
    if (voice && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      voice.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
      setTimeout(() => {
        try {
          voice.osc.stop();
          voice.osc.disconnect();
        } catch {
          // already stopped
        }
      }, 100);
      activeVoicesRef.current.delete(noteName);
    }
    if (activeVoicesRef.current.size === 0) {
      setActiveNote(null);
      setIsPlaying(false);
    }
  };

  // Keyboard trigger support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const match = NOTES.find(n => n.keyChar === key);
      if (match && !activeVoicesRef.current.has(match.name)) {
        startNote(match.name, match.freq);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      const match = NOTES.find(n => n.keyChar === key);
      if (match) {
        stopNote(match.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [waveform, cutoffFreq, resonance]);

  // Clean waveform visualizer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Grid line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Waveform line
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isPlaying ? '#818cf8' : '#334155';
      ctx.beginPath();

      const amp = isPlaying ? (h * 0.32) : 4;
      const freqMultiplier = cutoffFreq / 1200;

      for (let x = 0; x < w; x++) {
        const norm = x / w;
        let y = h / 2;

        if (waveform === 'sine') {
          y += Math.sin(norm * Math.PI * 8 * freqMultiplier + phase) * amp;
        } else if (waveform === 'sawtooth') {
          y += (((norm * 6 * freqMultiplier + phase * 0.4) % 1) - 0.5) * amp * 2;
        } else if (waveform === 'square') {
          y += Math.sign(Math.sin(norm * Math.PI * 6 * freqMultiplier + phase)) * amp * 0.8;
        } else {
          y += (Math.abs(((norm * 6 * freqMultiplier + phase * 0.3) % 1) - 0.5) - 0.25) * amp * 3;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isPlaying ? 0.08 : 0.01;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, waveform, cutoffFreq]);

  // Play a quick test sequence
  const playDemoChord = () => {
    const sequence = [
      { note: 'C4', freq: 261.63, delay: 0 },
      { note: 'E4', freq: 329.63, delay: 180 },
      { note: 'G4', freq: 392.00, delay: 360 },
      { note: 'C5', freq: 523.25, delay: 540 }
    ];

    sequence.forEach(({ note, freq, delay }) => {
      setTimeout(() => {
        startNote(note, freq);
        setTimeout(() => stopNote(note), 400);
      }, delay);
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">DSP Polyphonic Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Live zero-latency WebAudio engine running in-browser</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={playDemoChord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-medium rounded-lg border border-indigo-500/30 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Play Arp</span>
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real-time Oscilloscope */}
      <div className="mt-4 relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950">
        <canvas ref={canvasRef} width={600} height={120} className="w-full h-28 block" />
        <div className="absolute top-2 left-3 text-[11px] font-mono text-slate-400 flex items-center gap-3">
          <span>OSC: {waveform.toUpperCase()}</span>
          <span className="text-slate-600">·</span>
          <span>CUTOFF: {cutoffFreq}Hz</span>
          <span className="text-slate-600">·</span>
          <span>VOICE: {activeNote || 'IDLE'}</span>
        </div>
      </div>

      {/* DSP Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
        {/* Waveform Selector */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <span className="text-slate-400 block mb-2 font-medium">Waveform Generator</span>
          <div className="grid grid-cols-2 gap-1.5">
            {(['sawtooth', 'square', 'sine', 'triangle'] as OscillatorType[]).map(type => (
              <button
                key={type}
                onClick={() => setWaveform(type)}
                className={`py-1 px-2 text-center rounded text-xs capitalize transition-colors ${
                  waveform === type
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Resonant Filter Cutoff */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="font-medium">Filter Cutoff</span>
            <span className="font-mono text-indigo-400">{cutoffFreq} Hz</span>
          </div>
          <input
            type="range"
            min={200}
            max={6000}
            step={50}
            value={cutoffFreq}
            onChange={e => setCutoffFreq(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
          />

          <div className="flex justify-between text-slate-400 mt-2 mb-1">
            <span className="font-medium">Resonance (Q)</span>
            <span className="font-mono text-indigo-400">{resonance}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={0.5}
            value={resonance}
            onChange={e => setResonance(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
          />
        </div>

        {/* Output & Master Level */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="font-medium">Master Level</span>
            <span className="font-mono text-indigo-400">{Math.round(masterVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={masterVolume}
            onChange={e => setMasterVolume(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
          />
          <div className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Touch or click the keys below. You can also use keyboard letters <span className="font-mono text-slate-300">A-S-D-F-G-H-J-K</span>.
          </div>
        </div>
      </div>

      {/* Musical Piano Keyboard */}
      <div className="mt-5 select-none">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex justify-between items-center">
          <span>Virtual 32-Bit Touch Controller</span>
          <span className="text-slate-500">Polyphonic 44.1kHz</span>
        </div>
        
        <div className="relative flex h-28 bg-slate-950 rounded-lg p-1 border border-slate-800 overflow-x-auto">
          {NOTES.filter(n => !n.isSharp).map(note => {
            const isHeld = activeVoicesRef.current.has(note.name);
            return (
              <button
                key={note.name}
                onMouseDown={() => startNote(note.name, note.freq)}
                onMouseUp={() => stopNote(note.name)}
                onMouseLeave={() => stopNote(note.name)}
                onTouchStart={e => { e.preventDefault(); startNote(note.name, note.freq); }}
                onTouchEnd={e => { e.preventDefault(); stopNote(note.name); }}
                className={`flex-1 h-full mx-0.5 rounded-b flex flex-col justify-end items-center pb-2 transition-all ${
                  isHeld
                    ? 'bg-indigo-400 text-slate-950 font-bold shadow-lg shadow-indigo-500/20 translate-y-0.5'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <span className="text-[11px] font-semibold">{note.name}</span>
                <span className="text-[9px] opacity-60 font-mono">[{note.keyChar}]</span>
              </button>
            );
          })}

          {/* Black Keys */}
          {NOTES.map((note) => {
            if (!note.isSharp) return null;
            const isHeld = activeVoicesRef.current.has(note.name);
            
            // Map sharp note positions
            const positionMap: Record<string, string> = {
              'C#4': 'left-[7%]',
              'D#4': 'left-[21%]',
              'F#4': 'left-[49%]',
              'G#4': 'left-[63%]',
              'A#4': 'left-[77%]'
            };

            const leftPos = positionMap[note.name] || 'left-[50%]';

            return (
              <button
                key={note.name}
                onMouseDown={() => startNote(note.name, note.freq)}
                onMouseUp={() => stopNote(note.name)}
                onMouseLeave={() => stopNote(note.name)}
                onTouchStart={e => { e.preventDefault(); startNote(note.name, note.freq); }}
                onTouchEnd={e => { e.preventDefault(); stopNote(note.name); }}
                className={`absolute top-1 ${leftPos} w-[8%] h-[60%] rounded-b z-10 flex flex-col justify-end items-center pb-1 text-white shadow-md transition-all ${
                  isHeld
                    ? 'bg-indigo-600 shadow-indigo-500/40 translate-y-0.5'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <span className="text-[9px] font-mono font-medium">{note.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
