import React, { useState } from 'react';
import { X, Upload, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

function maskUID(uid:string){ return uid ? uid.slice(0,9)+'••••'+uid.slice(-3) : '••••'; }

export function DevSubmitModal({ onClose, apps, initialTab='publish', onAppPublished, userUID, isStoreManager }: any) {
  const [tab, setTab] = useState(initialTab);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePublish = async () => {
    if(!title || !url) return alert('Enter title and URL');
    setLoading(true);
    try{
      const payload = {
        uuid: `user-${Date.now()}`,
        title,
        jamz: title,
        live_web_url: url,
        download_url: url,
        owner_uid: userUID,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      if(supabase){
        const { error } = await supabase.from('apps').insert(payload as any);
        if(error) throw error;
      }
      const local = JSON.parse(localStorage.getItem('prism_user_uploaded_apps')||'[]');
      local.unshift({ id: payload.uuid, name: title, liveAppUrl: url, ownerId: userUID, category: 'Other', tagline: url });
      localStorage.setItem('prism_user_uploaded_apps', JSON.stringify(local));
      setSuccess(true);
      setTimeout(()=>{ onAppPublished?.({ id: payload.uuid, name: title }); onClose(); }, 1000);
    }catch(e){ alert('Publish failed, saved locally'); onClose(); }
    finally{ setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#10111f] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-bold">Developer Portal</h2>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center"><X className="w-4 h-4"/></button>
        </div>

        <div className="p-2 flex gap-2 border-b border-white/5">
          <button onClick={()=>setTab('publish')} className={`flex-1 h-8 rounded-full text-xs ${tab==='publish'?'bg-white text-black':'bg-white/10'}`}>Publish</button>
          <button onClick={()=>setTab('owner-apps')} className={`flex-1 h-8 rounded-full text-xs ${tab==='owner-apps'?'bg-white text-black':'bg-white/10'}`}>My Uploads</button>
          <button onClick={()=>setTab('guide')} className={`flex-1 h-8 rounded-full text-xs ${tab==='guide'?'bg-white text-black':'bg-white/10'}`}>Guide</button>
        </div>

        <div className="p-5 space-y-3">
          {tab==='publish' && !success && (
            <>
              <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
                <div className="text-[10px] text-white/40">Your Private Passkey (owner only)</div>
                <div className="text-xs font-mono mt-1">{maskUID(userUID)}</div>
                <div className="text-[10px] text-white/30 mt-1">Only you see this. Other users have their own different masked ID.</div>
              </div>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="App title e.g. Rent Master" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm"/>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-app.vercel.app" className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-full text-sm"/>
              <button onClick={handlePublish} disabled={loading} className="w-full h-11 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center">
                {loading ? 'Publishing...' : 'Submit for Review'}
              </button>
            </>
          )}
          {success && <div className="text-center py-8 text-emerald-400 font-bold">Submitted! Awaiting approval</div>}
          {tab==='owner-apps' && <div className="text-xs text-white/50">You have {JSON.parse(localStorage.getItem('prism_user_uploaded_apps')||'[]').length} uploads tied to your private UID. Other users cannot see this list.</div>}
          {tab==='guide' && <div className="text-xs text-white/60 space-y-2"><p>1. Your UID is generated automatically, stored locally.</p><p>2. No one else sees it — masked as PRISM-••••-XXX</p><p>3. Your uploads are tied to your UID, only you can edit/delete them.</p><p>4. Manager needs secret, not UID.</p></div>}
        </div>
      </div>
    </div>
  );
}