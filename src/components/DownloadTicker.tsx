import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export const DownloadTicker: React.FC<{ baseCount: string }> = ({ baseCount }) => {
  const [count, setCount] = useState(() => parseInt(baseCount.replace(/[^0-9]/g, '')) || 1200);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount(c => c + Math.floor(Math.random() * 3) + 1);
        setBump(true);
        setTimeout(() => setBump(false), 600);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatted = count > 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}`;

  return (
    <div className={`flex items-center gap-1 text-[11px] font-mono text-slate-300 transition-all ${bump ? 'scale-110 text-emerald-300' : ''}`}>
      <Download className="w-3 h-3 text-slate-500" />
      <span className="tabular-nums">{formatted}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" title="Live installs" />
    </div>
  );
};