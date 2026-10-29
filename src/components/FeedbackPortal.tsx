import React, { useState, useEffect } from 'react';
import { MessageSquare, Lightbulb, Bug, AlertTriangle, Send, Loader2, CheckCircle, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabase';

type FeedbackType = 'suggestion' | 'complaint' | 'bug' | 'feature' | 'other';

export function FeedbackPortal({ userUID, onBack }: { userUID: string, onBack: () => void }) {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [myFeedback, setMyFeedback] = useState<any[]>([]);

  useEffect(() => {
    const loadMine = async () => {
      if (!supabase || !userUID) {
        const local = JSON.parse(localStorage.getItem('prism_feedback_local') || '[]');
        setMyFeedback(local.filter((f:any)=>f.owner_uid===userUID).slice(0,20));
        return;
      }
      const { data } = await supabase.from('public_feedback').select('*').eq('owner_uid', userUID).order('created_at', { ascending: false }).limit(20);
      if (data) setMyFeedback(data);
    };
    loadMine();
  }, [userUID, sent]);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) { alert('Title and message required'); return; }
    setSending(true);
    try {
      if (supabase) {
        const { error } = await supabase.from('public_feedback').insert({
          owner_uid: userUID, type, title: title.trim(), message: message.trim(), contact: contact.trim() || null, status: 'open'
        });
        if (error) throw error;
      } else {
        const local = JSON.parse(localStorage.getItem('prism_feedback_local') || '[]');
        local.unshift({ id: Date.now(), owner_uid: userUID, type, title, message, contact, status: 'open', created_at: new Date().toISOString() });
        localStorage.setItem('prism_feedback_local', JSON.stringify(local));
      }
      setTitle(''); setMessage(''); setContact('');
      setSent(true);
      setTimeout(()=>setSent(false), 3000);
    } catch (e:any) { alert('Failed: ' + e.message); }
    finally { setSending(false); }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 px-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-base sm:text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Public Feedback Portal</h2>
        <button onClick={onBack} className="h-10 px-4 bg-white/10 border border-white/10 rounded-full text-xs shrink-0">Back</button>
      </div>

      {/* STACKS 1-col on mobile, 2-col on md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 bg-white/[0.04] border border-white/10 rounded-2xl space-y-4 w-full min-w-0">
          <h3 className="font-bold text-sm">Send Suggestion / Complaint</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id:'suggestion', label:'Suggestion', icon: Lightbulb },
              { id:'feature', label:'Feature', icon: Inbox },
              { id:'bug', label:'Bug', icon: Bug },
              { id:'complaint', label:'Complaint', icon: AlertTriangle },
              { id:'other', label:'Other', icon: MessageSquare },
            ].map(t => (
              <button key={t.id} onClick={()=>setType(t.id as any)} className={`min-h-[36px] h-auto py-2 px-3 rounded-full text-xs flex items-center gap-1.5 border ${type===t.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60'}`}>
                <t.icon className="w-3.5 h-3.5 shrink-0"/> <span className="whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </div>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title - e.g. Add dark mode..." className="w-full h-12 px-4 bg-black/50 border border-white/10 rounded-xl text-sm outline-none focus:border-indigo-500" />
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe in detail... What happened? What would you like to see?" rows={5} className="w-full p-4 bg-black/50 border border-white/10 rounded-2xl text-sm outline-none focus:border-indigo-500 resize-none" />
          <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contact email (optional)" className="w-full h-12 px-4 bg-black/50 border border-white/10 rounded-xl text-sm outline-none" />
          <button onClick={handleSubmit} disabled={sending} className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin"/> Sending...</> : sent ? <><CheckCircle className="w-4 h-4"/> Sent!</> : <><Send className="w-4 h-4"/> Submit Feedback</>}
          </button>
          <p className="text-[10px] text-white/30 text-center break-words">Your UID is attached automatically. No passkey needed.</p>
        </div>

        <div className="p-4 sm:p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3 w-full min-w-0">
          <h3 className="font-bold text-sm">My Recent Submissions ({myFeedback.length})</h3>
          {myFeedback.length === 0 ? (
            <p className="text-xs text-white/40 py-10 text-center">No feedback yet. Be the first to suggest!</p>
          ) : (
            <div className="space-y-2 max-h-[420px] sm:max-h-[520px] overflow-auto pr-1">
              {myFeedback.map(f => (
                <div key={f.id} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${f.type==='bug'?'bg-red-500/20 text-red-300': f.type==='complaint'?'bg-amber-500/20 text-amber-300':'bg-indigo-500/20 text-indigo-300'}`}>{f.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${f.status==='open'?'bg-white/10': f.status==='resolved'?'bg-emerald-500/20 text-emerald-300':'bg-white/10'}`}>{f.status}</span>
                    <span className="text-[10px] text-white/20 ml-auto">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-bold mt-2 break-words">{f.title}</p>
                  <p className="text-[11px] text-white/50 mt-1 break-words line-clamp-3">{f.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ManagerFeedbackView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'open'|'resolved'>('all');

  const load = async () => {
    setLoading(true);
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('prism_feedback_local') || '[]');
      setList(filter==='all' ? local : local.filter((f:any)=>f.status===filter));
      setLoading(false);
      return;
    }
    let q = supabase.from('public_feedback').select('*').order('created_at', { ascending: false }).limit(100);
    if (filter !== 'all') q = q.eq('status', filter);
    const { data } = await q;
    if (data) setList(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id:string, status:string) => {
    if (!supabase) return;
    await supabase.from('public_feedback').update({ status }).eq('id', id);
    load();
  };

  if (loading) return <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin"/></div>;

  return (
    <div className="space-y-3 w-full">
      <div className="flex gap-2 flex-wrap">
        {(['all','open','resolved'] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 h-9 rounded-full text-xs capitalize ${filter===f?'bg-white text-black':'bg-white/10'}`}>{f}</button>
        ))}
        <button onClick={load} className="ml-auto px-3 h-9 rounded-full text-xs bg-white/10">Refresh</button>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {list.map(item => (
          <div key={item.id} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex flex-col sm:flex-row gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center flex-wrap"><span className="text-xs font-bold break-words">{item.title}</span><span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full shrink-0">{item.type}</span><span className="text-[10px] text-white/30 break-all">{item.owner_uid?.slice(0,12)}</span></div>
              <p className="text-xs text-white/60 mt-1 break-words whitespace-pre-wrap">{item.message}</p>
              {item.contact && <p className="text-[11px] text-indigo-300 mt-1 break-all">Contact: {item.contact}</p>}
            </div>
            <select value={item.status} onChange={e=>updateStatus(item.id, e.target.value)} className="h-10 sm:h-8 px-3 bg-black border border-white/10 rounded-full text-xs shrink-0 w-full sm:w-auto">
              <option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option>
            </select>
          </div>
        ))}
        {list.length===0 && <p className="text-xs text-white/40 py-6 text-center">No feedback for this filter.</p>}
      </div>
    </div>
  );
}
