import React, { useEffect, useState } from 'react';
import { backend } from '../lib/backend';

export function AnnouncementBanner() {
  const [ann, setAnn] = useState<any>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await backend.list('store_announcements');
        const records = Array.isArray(res?.records) ? res.records : Array.isArray(res) ? res : [];
        const activeList = records
          .filter((r: any) => r.is_active !== false)
          .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        if (active && activeList.length > 0) {
          setAnn(activeList[0]);
        }
      } catch (err) {
        console.warn('Failed to load store announcements:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!ann) return null;

  return (
    <div
      className={`p-2 text-center text-sm ${
        ann.type === 'warning'
          ? 'bg-amber-100 text-amber-800'
          : ann.type === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-blue-100 text-blue-800'
      }`}
    >
      {ann.message}
    </div>
  );
}

export function AnnouncementManager({ isManager }: { isManager: boolean }) {
  const [msg, setMsg] = useState('');
  const [posting, setPosting] = useState(false);

  if (!isManager) return null;

  const post = async () => {
    if (!msg.trim() || posting) return;
    setPosting(true);
    try {
      await backend.create('store_announcements', {
        message: msg.trim(),
        is_active: true,
        type: 'info',
        created_by: localStorage.getItem('prism_user_uid') || 'manager',
      });
      setMsg('');
      alert('Posted');
    } catch (err: any) {
      alert('Failed to post announcement: ' + (err?.message || err));
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-4 p-3 border border-white/10 rounded-xl flex gap-2">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Store announcement..."
        className="flex-1 p-2 border border-white/10 rounded-lg bg-transparent text-sm text-white"
      />
      <button
        onClick={post}
        disabled={posting}
        className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm disabled:opacity-50"
      >
        {posting ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
}
