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
      if (!supabase || !userUID) return;
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
          owner_uid: userUID,
          type,
          title: title.trim(),
          message: message.trim(),
          contact: contact.trim() || null,
          status: 'open'
        });
        if (error) throw error;
      } else {
        // local fallback
        const local = JSON.parse(localStorage.getItem('prism_feedback_local') || '[]');
        local.unshift({ id: Date.now(), owner_uid: userUID, type, title, message, contact, status: 'open', created_at: new Date().toISOString() });
        localStorage.setItem('prism_feedback_local', JSON.stringify(local));
      }
      setTitle(''); setMessage(''); setContact('');
      setSent(true);
      setTimeout(()=>setSent(false), 3000);
    } catch (e:any) {
      alert('Failed: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Public Feedback Portal</h2>
        <button onClick={onBack} className="h-8 px-3 bg-white/10 rounded-full text-xs">Back to Store</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="p-5 bg-white/[0.04] border border-white/10 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm">Send Suggestion / Complaint</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id:'suggestion', label:'Suggestion', icon: Lightbulb },
              { id:'feature', label:'Feature Request', icon: Inbox },
              { id:'bug', label:'Bug', icon: Bug },
              { id:'complaint', label:'Complaint', icon: AlertTriangle },
              { id:'other', label:'Other', icon: MessageSquare },
            ].map(t => (
              <button key={t.id} onClick={()=>setType(t.id as any)} className={`h-8 px-3 rounded-full text-xs flex items-center gap-1.5 border ${type===t.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/60'}`}>
                <t.icon className="w-3.5 h-3.5"/> {t.label}
              </button>
            ))}
          </div>

          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title - e.g. Add dark mode for..." className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-full text-sm outline-none focus:border-indigo-500" />
          <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe in detail... What happened? What would you like to see?" rows={5} className="w-full p-4 bg-black/50 border border-white/10 rounded-2xl text-sm outline-none focus:border-indigo-500 resize-none" />
          <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contact (email / optional) - for follow-up" className="w-full h-11 px-4 bg-black/50 border border-white/10 rounded-full text-sm outline-none" />

          <button onClick={handleSubmit} disabled={sending} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin"/> Sending...</> : sent ? <><CheckCircle className="w-4 h-4"/> Sent!</> : <><Send className="w-4 h-4"/> Submit Feedback</>}
          </button>
          <p className="text-[10px] text-white/30 text-center">Your UID is attached automatically for tracking. No passkey needed.</p>
        </div>

        {/* My submissions */}
        <div className="p-5 bg-white/[0.03] border border-white/10 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm">My Recent Submissions ({myFeedback.length})</h3>
          {myFeedback.length === 0 ? (
            <p className="text-xs text-white/40 py-10 text-center">No feedback yet. Be the first to suggest!</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {myFeedback.map(f => (
                <div key={f.id} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${f.type==='bug'?'bg-red-500/20 text-red-300': f.type==='complaint'?'bg-amber-500/20 text-amber-300':'bg-indigo-500/20 text-indigo-300'}`}>{f.type}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] ${f.status==='open'?'bg-white/10': f.status==='resolved'?'bg-emerald-500/20 text-emerald-300':'bg-white/10'}`}>{f.status}</span>
                  </div>
                  <p className="text-xs font-bold mt-2">{f.title}</p>
                  <p className="text-[11px] text-white/50 mt-1 line-clamp-2">{f.message}</p>
                  <p className="text-[10px] text-white/20 mt-1">{new Date(f.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Manager view for console
export function ManagerFeedbackView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'open'|'resolved'>('all');

  const load = async () => {
    setLoading(true);
    if (!supabase) {
      const local = JSON.parse(localStorage.getItem('prism_feedback_local') || '[]');
      setList(local);
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
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['all','open','resolved'] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 rounded-full text-xs capitalize ${filter===f?'bg-white text-black':'bg-white/10'}`}>{f}</button>
        ))}
        <button onClick={load} className="ml-auto px-3 py-1 rounded-full text-xs bg-white/10">Refresh</button>
      </div>
      <div className="grid gap-2">
        {list.map(item => (
          <div key={item.id} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl flex gap-3">
            <div className="flex-1">
              <div className="flex gap-2 items-center"><span className="text-xs font-bold">{item.title}</span><span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full">{item.type}</span><span className="text-[10px] text-white/30">{item.owner_uid?.slice(0,12)}</span></div>
              <p className="text-xs text-white/60 mt-1">{item.message}</p>
              {item.contact && <p className="text-[11px] text-indigo-300 mt-1">Contact: {item.contact}</p>}
            </div>
            <select value={item.status} onChange={e=>updateStatus(item.id, e.target.value)} className="h-8 px-2 bg-black border border-white/10 rounded-full text-xs">
              <option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
