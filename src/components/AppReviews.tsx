import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star } from 'lucide-react';

export function AppReviews({ appId, isManager }: { appId: string, isManager: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [avg, setAvg] = useState(0);

  const load = async () => {
    const { data } = await supabase.from('app_reviews').select('*').eq('app_id', appId).eq('is_hidden', false).order('created_at', {ascending:false});
    setReviews(data||[]);
    if(data && data.length) setAvg(data.reduce((s,r)=>s+r.rating,0)/data.length);
  };
  useEffect(()=>{load()}, [appId]);

  const submit = async () => {
    const uid = localStorage.getItem('prism_user_uid') || 'anon';
    const uname = localStorage.getItem('prism_user_display') || 'User';
    const { error } = await supabase.from('app_reviews').upsert({ app_id: appId, user_id: uid, user_name: uname, rating, comment }, {onConflict:'app_id,user_id'});
    if(error) alert(error.message); else { setComment(''); load(); }
  };
  const hide = async (id:string) => {
    await supabase.from('app_reviews').update({is_hidden:true}).eq('id', id); load();
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-bold flex items-center gap-2">⭐ Reviews {avg>0 && `(${avg.toFixed(1)} avg - ${reviews.length})`}</h3>
      <div className="flex gap-1 my-2">
        {[1,2,3,4,5].map(n=><Star key={n} onClick={()=>setRating(n)} className={`w-6 h-6 cursor-pointer ${n<=rating?'fill-amber-400 text-amber-400':'text-zinc-300'}`} />)}
      </div>
      <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Your opinion about this app..." className="w-full p-2 border rounded-lg bg-transparent" rows={2}/>
      <button onClick={submit} className="mt-2 px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm">Post Review</button>
      <div className="mt-4 space-y-3">
        {reviews.map(r=>(
          <div key={r.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-sm">
            <div className="flex justify-between"><span className="font-semibold">{r.user_name} - {'⭐'.repeat(r.rating)}</span><span className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</span></div>
            <p className="mt-1">{r.comment}</p>
            {isManager && <button onClick={()=>hide(r.id)} className="text-xs text-red-600 mt-1">Hide (Owner only)</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
