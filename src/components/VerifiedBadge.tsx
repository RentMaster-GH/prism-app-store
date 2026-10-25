import { ShieldCheck } from 'lucide-react';
import React from 'react';

export const VerifiedBadge: React.FC<{ size?: 'sm' | 'md'; verified?: boolean }> = ({ size = 'sm', verified = true }) => {
  if (!verified) return null;
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border font-mono font-bold animate-[pulse_2s_ease-in-out_infinite] ${size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'} bg-indigo-950/60 text-indigo-300 border-indigo-700/50`}>
      <ShieldCheck className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-indigo-400`} />
      <span>VERIFIED</span>
    </div>
  );
};