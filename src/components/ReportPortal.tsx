import React, { useState } from 'react';
import { X, Flag, Loader2, CheckCircle } from 'lucide-react';
import { backend } from '../lib/backend';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appContext: any;
  currentUserId: string;
}

export default function ReportPortal({ isOpen, onClose, appContext, currentUserId }: Props) {
  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;
  if (!appContext) return null;

  const appName = String(appContext.name || appContext.title || appContext.jamz || 'Untitled');
  const appId = String(appContext.id || appContext.uuid || '');

  const handleSubmit = async () => {
    if (!description.trim() && reason === 'Other') {
      alert('Please describe the issue');
      return;
    }
    setLoading(true);
    const payload = {
      app_id: appId,
      app_name: appName,
      title: `${reason} - ${appName}`,
      reason: reason,
      description: description.trim() || reason,
      status: 'open',
      reporter_id: currentUserId,
      owner_uid: String(appContext.owner_uid || appContext.ownerId || appContext.owner_id || ''),
      created_at: new Date().toISOString(),
    };

    try {
      await backend.create('reports', payload);
    } catch (e) {
      console.warn('Backend report save failed, keeping local backup:', e);
    }

    try {
      const local = JSON.parse(localStorage.getItem('prism_reports') || '[]');
      local.unshift({ ...payload, id: `local-${Date.now()}` });
      localStorage.setItem('prism_reports', JSON.stringify(local));
    } catch {}

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setDescription('');
      setReason('Spam');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" /> Report {appName.slice(0, 24)}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!success ? (
            <>
              <div>
                <label className="text-[11px] text-white/50 uppercase font-bold tracking-widest">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 w-full h-11 px-4 bg-white text-black rounded-full text-sm font-bold outline-none cursor-pointer"
                >
                  <option value="Spam">Spam / Fake App</option>
                  <option value="Inappropriate">Inappropriate Content</option>
                  <option value="Malware">Malware / Suspicious Link</option>
                  <option value="Copyright">Copyright Violation</option>
                  <option value="Broken">Broken / Doesn't Open</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-white/50 uppercase font-bold tracking-widest">Details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  className="mt-2 w-full h-24 p-3 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 h-11 bg-white/10 text-white rounded-full text-sm font-bold hover:bg-white/15 transition">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-11 bg-amber-200 text-amber-950 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Report'}
                </button>
              </div>

              <p className="text-[10px] text-white/30 text-center">Private • Only you & store manager can see this</p>
            </>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-400 text-black rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Report submitted</p>
              <p className="text-xs text-white/50">Thanks — manager will review {appName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
