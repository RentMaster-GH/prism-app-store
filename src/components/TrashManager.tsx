import React, { useState, useEffect } from 'react';

interface TrashItem {
  id: string;
  name: string;
  icon?: string;
  deletedAt: number;
  reason: string;
  deletedBy: string;
  originalData: any;
}

const TRASH_KEY = 'prism_trash_bin';
const TRASH_DAYS = 30;

export const getTrash = (): TrashItem[] => {
  try {
    const raw = localStorage.getItem(TRASH_KEY);
    const items: TrashItem[] = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const valid = items.filter(i => now - i.deletedAt < TRASH_DAYS * 86400000);
    if (valid.length !== items.length) localStorage.setItem(TRASH_KEY, JSON.stringify(valid));
    return valid;
  } catch { return []; }
};

export const addToTrash = (app: any, reason: string, deletedBy: string) => {
  const trash = getTrash();
  trash.unshift({
    id: app.id,
    name: app.name,
    icon: app.icon,
    deletedAt: Date.now(),
    reason,
    deletedBy,
    originalData: app
  });
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
};

export const restoreFromTrash = (id: string) => {
  const trash = getTrash();
  const item = trash.find(t => t.id === id);
  if (!item) return null;
  const filtered = trash.filter(t => t.id !== id);
  localStorage.setItem(TRASH_KEY, JSON.stringify(filtered));
  return item.originalData;
};

export const TrashModal: React.FC<{ isOpen: boolean; onClose: () => void; onRestore: (app:any)=>void }> = ({ isOpen, onClose, onRestore }) => {
  const [trash, setTrash] = useState<TrashItem[]>([]);

  useEffect(()=>{ if(isOpen) setTrash(getTrash()); }, [isOpen]);

  if (!isOpen) return null;

  const daysLeft = (deletedAt: number) => {
    const left = TRASH_DAYS - Math.floor((Date.now() - deletedAt)/86400000);
    return left;
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#12132a] border border-white/10 p-6 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Trash — Undo Delete ({trash.length})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {trash.length===0 ? <p className="text-slate-500 text-sm text-center py-10">Trash is empty</p> : trash.map(item=>(
            <div key={item.id+item.deletedAt} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b18] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">{item.icon?.slice(0,2) || '🗑️'}</div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.reason} • {daysLeft(item.deletedAt)}d left • by {item.deletedBy}</p>
                </div>
              </div>
              <button onClick={()=>{ const restored = restoreFromTrash(item.id); if(restored){ onRestore(restored); setTrash(getTrash()); } }} className="px-3 py-1.5 rounded-full bg-white text-black text-[11px] font-bold hover:bg-slate-200">Restore</button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>{ localStorage.removeItem(TRASH_KEY); setTrash([]); }} className="flex-1 h-9 rounded-full bg-white/10 text-white text-[12px]">Empty Trash</button>
          <button onClick={onClose} className="flex-1 h-9 rounded-full bg-white text-black text-[12px] font-bold">Close</button>
        </div>
      </div>
    </div>
  );
};
