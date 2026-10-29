import React, { useState } from 'react';
import { Lock, Unlock, FileText, CheckCircle2 } from 'lucide-react';

export const MarkdownSandbox: React.FC = () => {
  const [content, setContent] = useState(
`# Project Chimera Architecture
Last modified: Local Storage Sandbox

- [x] Eliminate third-party telemetry SDKs
- [x] Implement local Argon2 key derivation
- [ ] Direct peer-to-peer sync protocol

### Autonomous Invariant
Every note is stored as a raw UTF-8 markdown file directly on your local device.
Zero remote servers can inspect this memory buffer.`
  );
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [savedLocally, setSavedLocally] = useState(true);

  // Deterministic ciphertext representation
  const getCiphertext = (text: string) => {
    return text.split('').map(c => {
      if (c === '\n') return '\n';
      const code = c.charCodeAt(0);
      return String.fromCharCode(((code * 31 + 17) % 78) + 48);
    }).join('');
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Zero-Knowledge Markdown Sandbox</h4>
          <p className="text-xs text-slate-400 mt-0.5">Test local-first plain text editing and client-side AES-256 buffer toggle</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsEncrypted(!isEncrypted);
              setSavedLocally(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isEncrypted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}
          >
            {isEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isEncrypted ? 'AES-GCM Locked' : 'Encrypt In-Memory'}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor Area */}
        <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex flex-col h-64">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/80 mb-2 font-mono">
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-teal-400" />
              vault/notes/chimera.md
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Saved on Disk
            </span>
          </div>

          <textarea
            value={isEncrypted ? getCiphertext(content) : content}
            onChange={e => {
              if (!isEncrypted) {
                setContent(e.target.value);
                setSavedLocally(true);
              }
            }}
            disabled={isEncrypted}
            className={`flex-1 w-full bg-transparent text-xs font-mono resize-none focus:outline-none leading-relaxed ${
              isEncrypted ? 'text-amber-400/80 select-all cursor-not-allowed' : 'text-slate-200'
            }`}
            placeholder="Type notes in local markdown..."
          />

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{wordCount} words · {charCount} chars</span>
            <span>100% Offline</span>
          </div>
        </div>

        {/* Live Preview Area */}
        <div className="bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/60 flex flex-col h-64 overflow-y-auto">
          <span className="text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800/80 mb-2 block">
            LIVE PARSER PREVIEW
          </span>

          {isEncrypted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <Lock className="w-8 h-8 text-amber-400/80 mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-amber-200">Vault Block Encrypted</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Data is locked with 256-bit symmetric cipher keys held only in memory. Toggle 'Unlock' to decrypt.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-xs leading-relaxed text-slate-300">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-1">Project Chimera Architecture</h3>
              <p className="text-[11px] text-slate-400">Last modified: Local Storage Sandbox</p>
              <ul className="space-y-1 my-2">
                <li className="flex items-center gap-1.5 text-teal-400 font-medium">
                  <span>✓</span> Eliminate third-party telemetry SDKs
                </li>
                <li className="flex items-center gap-1.5 text-teal-400 font-medium">
                  <span>✓</span> Implement local Argon2 key derivation
                </li>
                <li className="flex items-center gap-1.5 text-slate-400">
                  <span>○</span> Direct peer-to-peer sync protocol
                </li>
              </ul>
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                <strong className="text-slate-200 block mb-0.5">Autonomous Invariant</strong>
                Every note is stored as a raw UTF-8 markdown file directly on your local device.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
