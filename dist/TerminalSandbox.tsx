import React, { useState } from 'react';
import { Terminal, CornerDownLeft, PlayCircle } from 'lucide-react';

export const TerminalSandbox: React.FC = () => {
  const [history, setHistory] = useState<Array<{ cmd: string; output: string[] }>>([
    {
      cmd: 'hyperkite --version',
      output: ['HyperKite GPU Terminal Engine v4.4.0 (x86_64-unknown-linux-gnu)', 'OpenGL 4.6 Core / Vulkan 1.3 backend active']
    },
    {
      cmd: 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"',
      output: [
        'NAMES              STATUS          PORTS',
        'redis-cache-01     Up 4 days       6379/tcp',
        'postgres-replica   Up 12 days      5432/tcp',
        'prism-gateway      Up 18 hours     80/tcp, 443/tcp'
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    let output: string[] = [];
    if (trimmed === 'help') {
      output = [
        'Available interactive commands:',
        '  docker ps     - List running containers',
        '  ssh node-01   - Test FIDO2 SSH handshake simulation',
        '  top           - Inspect simulated memory & CPU load',
        '  clear         - Wipe terminal screen',
        '  ping edge-01  - Test ICMP latency probe'
      ];
    } else if (trimmed === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (trimmed.startsWith('ssh')) {
      output = [
        'Connecting to node-01 via port 22...',
        'Handshake: ECDSA-SK with YubiKey 5C NFC FIDO2 token verified.',
        'Authenticated to user@node-01 [Last login: Today 18:22 UTC from local-vault]'
      ];
    } else if (trimmed === 'top') {
      output = [
        'Tasks: 142 total, 1 running, 141 sleeping',
        '%Cpu(s):  2.1 us,  0.8 sy,  0.0 ni, 97.1 id',
        'MiB Mem :  32140 total,  18420 free,   7120 used',
        'PID USER   %CPU %MEM   COMMAND',
        '1042 root   0.4  0.8   hyperkite-engine'
      ];
    } else if (trimmed.startsWith('ping')) {
      output = [
        'PING edge-01 (10.0.4.12): 56 data bytes',
        '64 bytes from 10.0.4.12: icmp_seq=0 ttl=64 time=1.42 ms',
        '64 bytes from 10.0.4.12: icmp_seq=1 ttl=64 time=1.38 ms',
        '--- edge-01 ping statistics: 2 packets, 0% loss, rtt avg = 1.40ms'
      ];
    } else if (trimmed.startsWith('docker')) {
      output = [
        'CONTAINER ID   IMAGE           COMMAND                  CREATED         STATUS',
        'a4f91b72e18    redis:7-alpine  "docker-entrypoint.s…"   4 days ago      Up 4 days',
        '8b11c03e994    postgres:16     "docker-entrypoint.s…"   12 days ago     Up 12 days'
      ];
    } else {
      output = [`hyperkite: command not found: ${trimmed}. Type 'help' for available test commands.`];
    }

    setHistory(prev => [...prev, { cmd: trimmed, output }]);
    setInputVal('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">GPU Terminal & Container Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Test fast shell rendering and simulated container inspection</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setHistory(prev => [...prev, {
                cmd: 'ssh node-01',
                output: [
                  'Connecting to node-01 via port 22...',
                  'Handshake: ECDSA-SK with YubiKey 5C NFC token verified.',
                  'Authenticated to user@node-01'
                ]
              }]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg border border-amber-500/30 transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Simulate SSH</span>
          </button>
        </div>
      </div>

      {/* Terminal Shell Screen */}
      <div className="mt-4 bg-slate-950 rounded-lg p-4 font-mono text-xs border border-slate-800 h-64 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-3">
          <div className="text-slate-500 text-[11px]">
            Try typing <span className="text-amber-400">help</span>, <span className="text-amber-400">docker ps</span>, <span className="text-amber-400">ssh node-01</span>, or <span className="text-amber-400">top</span>.
          </div>

          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-emerald-400 font-semibold">user@box:~$</span>
                <span>{item.cmd}</span>
              </div>
              <div className="text-slate-400 pl-4 space-y-0.5 text-[11px] leading-relaxed">
                {item.output.map((line, lIdx) => (
                  <div key={lIdx}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Input prompt */}
        <form onSubmit={handleCommand} className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2">
          <span className="text-emerald-400 font-semibold shrink-0">user@box:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Type a command (try 'help')..."
            className="flex-1 bg-transparent text-slate-200 focus:outline-none text-xs font-mono"
            autoFocus={false}
          />
          <button type="submit" className="text-slate-500 hover:text-slate-300">
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
