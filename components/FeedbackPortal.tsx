'use client';
import { useState } from 'react';

export function FeedbackPortal({ uid }: { uid?: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'issue'|'suggestion'>('issue');

  return (
    <>
      <button onClick={()=>setOpen(true)} className="h-8 px-3 rounded-full bg-transparent border border-white/20 text-xs hover:bg-white/10">
        Report / Suggest
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[20px] bg-[#12131f] border border-white/10 p-6">
            <div className="flex justify-between">
              <h3 className="font-bold">Feedback Center</h3>
              <button onClick={()=>setOpen(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">✕</button>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={()=>setType('issue')} className={`h-8 px-4 rounded-full text-xs font-bold ${type==='issue'?'bg-white text-black':'bg-white/10'}`}>Report Issue</button>
              <button onClick={()=>setType('suggestion')} className={`h-8 px-4 rounded-full text-xs font-bold ${type==='suggestion'?'bg-white text-black':'bg-white/10'}`}>Suggestion</button>
            </div>

            <form onSubmit={async (e)=>{
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              // POST to /api/feedback
              await fetch('/api/feedback', { method:'POST', body: JSON.stringify(Object.fromEntries(data)) });
              alert('Thanks! Received.');
              setOpen(false);
            }} className="mt-4 space-y-3">
              <input type="hidden" name="uid" value={uid || localStorage.getItem('prism_uid') || 'GUEST'} />
              <input type="hidden" name="type" value={type} />
              <select name="category" className="w-full h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm">
                <option>App Installation</option>
                <option>App Not Opening</option>
                <option>Store UI</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
              <textarea name="message" required placeholder={type==='issue' ? "Describe the issue..." : "What should we improve?"} className="w-full min-h-[100px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm" />
              <button className="w-full h-11 rounded-full bg-white text-black font-bold text-sm">Submit {type}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}