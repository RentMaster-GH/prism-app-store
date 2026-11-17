import React, { useState } from 'react';
import { Flag, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { backend } from '../lib/backend';

export interface ReportPortalProps {
  isOpen?: boolean;
  onClose?: () => void;
  appId?: string;
  appTitle?: string;
  reporterUid?: string;
}

export const ReportPortal: React.FC<ReportPortalProps> = ({
  isOpen = true,
  onClose,
  appId,
  appTitle,
  reporterUid,
}) => {
  const [reason, setReason] = useState('Broken link or non-functional app');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const uid =
        reporterUid ||
        (typeof window !== 'undefined' ? localStorage.getItem('prism_user_uid') : null) ||
        'anonymous';

      const payload = {
        app_id: appId || null,
        app_title: appTitle || 'Storefront Report',
        reason,
        details: details.trim(),
        reporter_uid: uid,
        status: 'open',
        created_at: new Date().toISOString(),
      };

      await backend.create('reports', payload);

      try {
        const existing = JSON.parse(localStorage.getItem('prism_reports_cache') || '[]');
        localStorage.setItem('prism_reports_cache', JSON.stringify([payload, ...existing]));
      } catch {
        // Ignore storage quota errors
      }

      setSubmitted(true);
      setDetails('');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report Issue or Abuse</h3>
              {appTitle && <p className="text-xs text-slate-400">{appTitle}</p>}
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
            <h4 className="mb-1 text-base font-semibold text-white">Report Received</h4>
            <p className="mb-5 text-sm text-slate-400">
              Thank you. The store moderator will review your report shortly.
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Done
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Broken link or non-functional app">Broken link or non-functional app</option>
                <option value="Misleading description or metadata">Misleading description or metadata</option>
                <option value="Malicious or unsafe content">Malicious or unsafe content</option>
                <option value="Copyright or intellectual property issue">Copyright or intellectual property issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Additional Details (optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportPortal;
