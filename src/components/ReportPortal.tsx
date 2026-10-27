import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Send, Bug, Lightbulb, Wrench, Star, CheckCircle, AlertTriangle } from 'lucide-react';

type ReportType = 'issue'|'change'|'suggestion'|'feature';

export default function ReportPortal({ isOpen, onClose, appContext, currentUserId }: any) {
  const [type, setType] = useState<ReportType>('issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const types: {k: ReportType, l:string, i:any, desc:string, color:string, active:string}[] = [
    {k:'issue', l:'Issue', i:Bug, desc:'Bug, crash, spam', color:'text-red-400', active:'bg-red-500/20 border-red-500 text-red-300'},
    {k:'change', l:'Change', i:Wrench, desc:'Improve existing', color:'text-blue-400', active:'bg-blue-500/20 border-blue-500 text-blue-300'},
    {k:'suggestion', l:'Idea', i:Lightbulb, desc:'New suggestion', color:'text-amber-400', active:'bg-amber-500/20 border-amber-500 text-amber-300'},
    {k:'feature', l:'Feature', i:Star, desc:'Feature request', color:'text-purple-400', active:'bg-purple-500/20 border-purple-500 text-purple-300'},
  ];

  const submit = async () => {
    setErrorMsg('');
    if (!title.trim()) return setErrorMsg('Title is required');
    if (title.trim().length < 5) return setErrorMsg('Title too short (min 5 chars)');
    if (!description.trim()) return setErrorMsg('Description is required');
    if (description.trim().length < 10) return setErrorMsg('Describe more (min 10 chars)');
    setSubmitting(true);
    try {
      const { error } = await supabase.from('store_reports').insert({
        type, title: title.trim(), description: description.trim(),
        app_id: appContext?.id || null, app_title: appContext?.title || appContext?.name || null,
        reporter_id: currentUserId || localStorage.getItem('prism_user_uid') || 'anon',
        reporter_name: localStorage.getItem('prism_user_display') || localStorage.getItem('prism_user_uid') || 'Anonymous',
        status: 'open'
      });
      if (error) throw error;
      setDone(true);
      setTimeout(()=>{ setDone(false); setTitle(''); setDescription(''); setType('issue'); onClose(); }, 1800);
    } catch (e:any) { setErrorMsg(e.message || 'Failed to send'); }
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f0f14] border border-white/15 w-full max-w-lg rounded-[20px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-[16px] font-bold text-white flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center"><Send className="w-4 h-4"/></div> Report to Manager</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"><X className="w-4 h-4"/></button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"><CheckCircle className="w-8 h-8 text-green-400"/></div>
              <div className="text-white font-bold">Sent to Manager!</div>
              <div className="text-xs text-white/50">Only owner <b className="text-white">soulreal200682</b> can see it. Private.</div>
            </div>
          ) : (
            <>
              {/* Type Selector - NOT greyed */}
              <div className="mb-1 text-[11px] font-bold tracking-widest text-white/40 uppercase">Type</div>
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                {types.map(o=>{
                  const active = type===o.k;
                  return (
                    <button key={o.k} onClick={()=>setType(o.k)} className={`group relative p-3 rounded-xl border text-left transition-all ${active ? o.active + ' border-2' : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white/60'}`}>
                      <o.i className={`w-5 h-5 mb-1.5 ${active ? '' : 'text-white/40 group-hover:text-white/80'} ${o.color}`} />
                      <div className={`text-[12px] font-bold leading-none ${active?'text-white':'text-white/70'}`}>{o.l}</div>
                      <div className="text-[10px] mt-1 leading-tight text-white/40">{o.desc}</div>
                      {active && <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center"><CheckCircle className="w-3 h-3"/></div>}
                    </button>
                  );
                })}
              </div>

              {appContext && (
                <div className="mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">{(appContext.title||appContext.name||'A')[0]}</div>
                  <div><div className="text-xs text-blue-300">Reporting about</div><div className="text-sm font-bold text-white">{appContext.title||appContext.name}</div></div>
                  <button onClick={()=>setReportAppContext(null)} className="ml-auto text-xs text-white/40 hover:text-white">Clear</button>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Title *</label>
                  <input value={title} onChange={e=>{setTitle(e.target.value); setErrorMsg('');}} placeholder="e.g. Spam apps with ECOSYSTEM-CORE" className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 focus:bg-white/[0.08] focus:border-white/30 focus:outline-none text-sm transition" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Details *</label>
                  <textarea value={description} onChange={e=>{setDescription(e.target.value); setErrorMsg('');}} placeholder="Describe the issue, steps to reproduce, what should happen..." rows={5} className="w-full p-4 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder:text-white/30 focus:bg-white/[0.08] focus:border-white/30 focus:outline-none text-sm resize-none transition" />
                  <div className="text-[10px] text-white/30 mt-1.5 text-right">{description.length} chars (min 10)</div>
                </div>

                {errorMsg && <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0"/>{errorMsg}</div>}

                <div className="flex items-center gap-2 text-[11px] text-white/30 bg-white/[0.03] p-2.5 rounded-xl border border-white/5"><div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">🔒</div>Private report • Only owner <span className="text-white font-bold">soulreal200682</span> can see • Not public</div>

                <div className="flex gap-2.5 pt-1">
                  <button onClick={onClose} className="flex-1 h-11 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition">Cancel</button>
                  <button onClick={submit} disabled={submitting} className="flex-[2] h-11 rounded-full bg-white text-black hover:bg-zinc-200 text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{submitting ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Sending...</> : <><Send className="w-4 h-4"/> Send to Manager</>}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
