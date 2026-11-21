import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Activity } from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://credibleartisans.com'
    : 'http://localhost:3000');

export const EdgeStatusAndAlerts: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'degraded'>('checking');
  const [latency, setLatency] = useState<number>(0);
  const [notifPerm, setNotifPerm] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const seenRef = useRef<Set<string>>(new Set());

  const firePush = (key: string, title: string, body: string) => {
    if (seenRef.current.has(key)) return;
    seenRef.current.add(key);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/icon.svg' });
      } catch {}
    }
  };

  const checkPulse = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/store/edge-pulse`);
      const d = await r.json();
      if (r.ok && d.status === 'online') {
        setStatus('online');
        setLatency(Number(d.dbLatencyMs || 0));

        (d.alerts?.incomingCalls || []).forEach((c: any) =>
          firePush(`call-${c.id}`, '📞 Incoming Masked Voice Call', `Session ${c.session_id} is ringing on Digital Remote Services`)
        );
        (d.alerts?.pendingApps || []).forEach((a: any) =>
          firePush(`app-${a.id}`, '📱 New App Submitted on Prism Store', `"${a.title}" is awaiting Manager review`)
        );
        (d.alerts?.pendingEscrowsOrMints || []).forEach((t: any) =>
          firePush(`tx-${t.id}`, '🪙 New SoulPay Escrow / Mint Alert', `${t.tx_type}: ${t.amount_soul} SOUL (${t.to_handle})`)
        );
        (d.alerts?.pendingAds || []).forEach((ad: any) =>
          firePush(`ad-${ad.id}`, '📢 New Ad Campaign Submitted', `${ad.advertiser_name}: "${ad.headline}"`)
        );
      } else {
        setStatus('degraded');
      }
    } catch {
      setStatus('degraded');
    }
  };

  useEffect(() => {
    checkPulse();
    const timer = setInterval(checkPulse, 15000);
    return () => clearInterval(timer);
  }, []);

  const requestPushPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported on this device.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === 'granted') {
      new Notification('🔔 Sovereign Live Alerts Enabled', {
        body: 'You will receive instant OS alerts for incoming calls, new apps, and SOUL escrows.',
      });
    }
  };

  return (
    <div className="hidden lg:inline-flex items-center gap-1.5">
      <span
        title="HP EliteBook Sovereign Edge Health & DB Latency"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
          status === 'online'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : status === 'checking'
            ? 'bg-slate-800 text-slate-400 border-slate-700'
            : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
        }`}
      >
        <Activity className="w-3 h-3" />
        {status === 'online' ? `Edge Online • ${latency}ms` : status === 'checking' ? 'Syncing Edge...' : 'Edge Reconnecting'}
      </span>

      <button
        type="button"
        onClick={requestPushPermission}
        title="Enable OS-Level Live Push Notifications"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
          notifPerm === 'granted'
            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/35'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
        }`}
      >
        {notifPerm === 'granted' ? <BellRing className="w-3 h-3 text-indigo-400" /> : <Bell className="w-3 h-3 text-amber-400" />}
        <span>{notifPerm === 'granted' ? 'Alerts ON' : 'Enable Alerts'}</span>
      </button>
    </div>
  );
};
