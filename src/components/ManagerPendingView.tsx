import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Star, Loader2, ExternalLink } from 'lucide-react';

function getOpenUrl(app: any): string {
  const candidates = [
    app.live_web_url,
    app.live_app_url,
    app.download_url,
    app.websiteUrl,
    app.hero_image,
    app.thumbnail_url,
  ];
  for (const u of candidates) {
    if (u && typeof u === 'string' && u.trim().startsWith('http')) return u.trim();
  }
  return '';
}

export function ManagerPendingView({ managerKey }: { managerKey: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase.from('apps').select('*').order('created_at', { ascending: false }).limit(100);
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('load apps failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (uuid: string, status: string) => {
    if (!supabase) return;
    try {
      await supabase.from('apps').update({ status, updated_at: new Date().toISOString() }).eq('uuid', uuid);
    } catch {}
    load();
  };

  const toggleFeatured = async (uuid: string, current: boolean) => {
    if (!supabase) return;
    try {
      await supabase.from('apps').update({ is_featured: !current } as any).eq('uuid', uuid);
    } catch {}
    load();
  };

  const handleOpen = (app: any) => {
    const url = getOpenUrl(app);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback: still show feedback instead of disabled grey
      alert(`No live URL for ${app.title || app.jamz || 'this app'}. Ask owner to add live_web_url.`);
    }
  };

  if (loading) return <div className="flex gap-2 text-xs text-white/50"><Loader2 className="w-4 h-4 animate-spin"/> Loading apps...</div>;

  return (
    <div className="space-y-3">
      <div className="text-xs text-white/50">{apps.length} total • {apps.filter(a=>a.status==='approved').length} approved • {apps.filter(a=>a.status==='pending').length} pending</div>
      <div className="grid gap-2 max-h-[500px] overflow-auto pr-2">
        {apps.map(app => {
          const openUrl = getOpenUrl(app);
          const hasUrl = !!openUrl;
          return (
            <div key={app.uuid} className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-xl">
              <img 
                src={app.thumbnail_url || app.download_url || `https://picsum.photos/seed/${encodeURIComponent(app.uuid)}/100/100`} 
                className="w-12 h-12 rounded-lg object-cover bg-white/5" 
                alt=""
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate text-white">{app.title || app.jamz || 'Untitled'}</p>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${app.status==='approved'?'bg-emerald-400 text-black':app.status==='pending'?'bg-amber-300 text-black':'bg-white/10 text-white/50'}`}>{app.status}</span>
                  {app.is_featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-[11px] text-white/40 truncate">{app.studio || app.owner_uid} • {openUrl ? new URL(openUrl).hostname : 'no-url'}</p>
              </div>
              
              <div className="flex gap-1.5 items-center shrink-0">
                {/* FIXED: Open button always active, white, never greyed/disabled */}
                <button 
                  onClick={()=>handleOpen(app)} 
                  title={hasUrl ? openUrl : 'No URL yet'}
                  className={`h-7 px-3 rounded-full flex items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95 cursor-pointer
                    ${hasUrl 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-white text-black hover:bg-white/90 opacity-90' // still white/active even if no url, shows alert
                    }`}
                >
                  <ExternalLink className="w-3 h-3"/> Open
                </button>

                <button onClick={()=>toggleFeatured(app.uuid, !!app.is_featured)} className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer ${app.is_featured?'bg-amber-400 text-black':'bg-white/10 text-white hover:bg-white/20'}`} title="Feature">
                  <Star className="w-3.5 h-3.5"/>
                </button>
                <button onClick={()=>updateStatus(app.uuid,'approved')} className="w-7 h-7 bg-emerald-400 text-black rounded-full flex items-center justify-center hover:bg-emerald-300 transition cursor-pointer" title="Approve">
                  <Check className="w-3.5 h-3.5"/>
                </button>
                <button onClick={()=>updateStatus(app.uuid,'rejected')} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition cursor-pointer" title="Reject">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}