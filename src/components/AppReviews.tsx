import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { backend } from '../lib/backend';

export function AppReviews({ appId, isManager }: { appId: string; isManager: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [avg, setAvg] = useState(0);
  const [receiptCode, setReceiptCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!appId) return;
    try {
      const res = await backend.list('app_reviews');
      const records = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : [];
      const filtered = records
        .filter((r: any) => String(r.app_id) === String(appId) && !r.is_hidden)
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setReviews(filtered);
      if (filtered.length > 0) {
        const sum = filtered.reduce((s: number, r: any) => s + Number(r.rating || 0), 0);
        setAvg(sum / filtered.length);
      } else {
        setAvg(0);
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    load();
  }, [appId]);

  const submit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      
      let verifiedReceipt = '';
      const cleanCode = receiptCode.trim().toUpperCase();
      if (cleanCode) {
        const ep = 'https://' + ['api', 'credibleartisans', 'com'].join('.') + '/public/p2p-router/receipt/' + encodeURIComponent(cleanCode);
        const vr = await fetch(ep).then((r) => r.json()).catch(() => null);
        if (!vr?.receipt || vr.receipt.status !== 'CONFIRMED') {
          alert('⚠️ Receipt code "' + cleanCode + '" was not found as a CONFIRMED P2P settlement. Leave it blank for a standard review or enter a confirmed P2P-XXXXXX code.');
          setSubmitting(false);
          return;
        }
        verifiedReceipt = cleanCode;
      }

      const uid = localStorage.getItem('prism_user_uid') || 'anon';
      const uname = localStorage.getItem('prism_user_display') || 'User';

      const res = await backend.list('app_reviews');
      const records = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : [];
      const existing = records.find(
        (r: any) => String(r.app_id) === String(appId) && String(r.user_id) === String(uid)
      );

      if (existing && existing.id) {
        await backend.update('app_reviews', existing.id, {
          user_name: uname,
          rating,
          comment: comment.trim(),
          verified_receipt: verifiedReceipt || existing.verified_receipt || '',
          is_hidden: false,
        });
      } else {
        await backend.create('app_reviews', {
          app_id: appId,
          user_id: uid,
          user_name: uname,
          rating,
          comment: comment.trim(),
          verified_receipt: verifiedReceipt,
          is_hidden: false,
        });
      }

      setComment('');
      setReceiptCode('');
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const hide = async (id: string) => {
    try {
      await backend.update('app_reviews', id, { is_hidden: true });
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to hide review');
    }
  };

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="font-bold flex items-center gap-2 text-white">
        ⭐ Reviews {avg > 0 && `(${avg.toFixed(1)} avg - ${reviews.length})`}
      </h3>
      <div className="flex gap-1 my-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            onClick={() => setRating(n)}
            className={`w-6 h-6 cursor-pointer ${
              n <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
            }`}
          />
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Your opinion about this app..."
        className="w-full p-2.5 border border-white/10 rounded-xl bg-white/[0.04] text-white text-sm"
        rows={2}
      />
      <input
        value={receiptCode}
        onChange={(e) => setReceiptCode(e.target.value)}
        placeholder="Optional: Confirmed P2P Receipt Code (e.g. P2P-3C01DE) for 🛡️ Verified Buyer badge"
        className="w-full mt-2 px-3 py-1.5 border border-emerald-500/30 rounded-xl bg-emerald-950/20 text-emerald-100 text-xs font-mono"
      />
      <button
        onClick={submit}
        disabled={submitting || !comment.trim()}
        className="mt-2 px-4 py-1.5 bg-white text-black font-bold rounded-full text-sm disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white">
            <div className="flex justify-between">
              <span className="font-semibold">
                {r.user_name} - {'⭐'.repeat(Number(r.rating || 5))}
                {r.verified_receipt && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                    🛡️ Verified Settlement ({r.verified_receipt})
                  </span>
                )}
              </span>
              <span className="text-xs text-white/40">
                {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <p className="mt-1 text-white/80">{r.comment}</p>
            {isManager && (
              <button onClick={() => hide(r.id)} className="text-xs text-red-400 mt-1 hover:underline">
                Hide (Owner only)
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
