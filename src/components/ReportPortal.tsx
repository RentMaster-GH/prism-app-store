import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, Bug, Lightbulb, Wrench, Star } from 'lucide-react';

export default function ReportPortal({ isOpen, onClose, appContext, currentUserId }: any) {
  const [type, setType] = useState<'issue'|'change'|'suggestion'|'feature'>('issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim()) return alert('Fill title & description');
    setSubmitting(true);
    const { error } = await supabase.from('store_reports').insert({
      type, title: title.trim(), description: description.trim(),
      app_id: appContext?.id || null, app_title: appContext?.title || null,
      reporter_id: currentUserId || localStorage.getItem('prism_user_uid') || 'anon',
      reporter_name: localStorage.getItem('prism_user_display') || 'Anonymous'
    });
    setSubmitting(false);
    if (error) return alert(error.message);
    setDone(true);
    setTimeout(()=>{ setDone(false); setTitle(''); setDescription(''); onClose(); }, 1500);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Send className="w-5 h-5"/> Report to Manager</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        {done ? <div className="py-12 text-center text-green-600 font-semibold">Sent to manager! Only owner can see it.</div> : <>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button onClick={()=>setType('issue')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium ${type==='issue'?'border-black bg-red-100 text-red-700':'border-zinc-200'}`}><Bug className="w-5 h-5"/>Issue</button>
          <button onClick={()=>setType('change')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium ${type==='change'?'border-black bg-blue-100 text-blue-700':'border-zinc-200'}`}><Wrench className="w-5 h-5"/>Change</button>
          <button onClick={()=>setType('suggestion')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium ${type==='suggestion'?'border-black bg-amber-100 text-amber-700':'border-zinc-200'}`}><Lightbulb className="w-5 h-5"/>Idea</button>
          <button onClick={()=>setType('feature')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-xs font-medium ${type==='feature'?'border-black bg-purple-100 text-purple-700':'border-zinc-200'}`}><Star className="w-5 h-5"/>Feature</button>
        </div>
        {appContext && <div className="mb-3 text-xs px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">Regarding: <b>{appContext.title}</b></div>}
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief title..." className="w-full p-3 rounded-xl border mb-3 bg-transparent" />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe issue / suggestion..." rows={5} className="w-full p-3 rounded-xl border mb-4 bg-transparent resize-none" />
        <div className="text-[11px] text-zinc-500 mb-3">🔒 Only store owner (soulreal200682) can see reports.</div>
        <button onClick={submit} disabled={submitting} className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-semibold hover:opacity-90 disabled:opacity-50">{submitting?'Sending...':'Send to Manager'}</button>
        </>}
      </div>
    </div>
  );
}
