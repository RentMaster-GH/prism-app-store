import React, { useEffect, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppCard } from './AppCard';
const MOCK_APPS = [{ id: '1', title: 'Prism Synth', studio: 'Prism Labs', tagline: 'Synth', thumbnail_url: '', live_web_url: 'https://example.com', category: 'Synth', rating: 4.9, package_size: '36.4 MB', monetization: 'Free', installs: 1200, status: 'approved' }];
export const AllSoftwareView: React.FC<{ onInstall: (app: any) => void; onOpen: (app: any) => void }> = ({ onInstall, onOpen }) => {
  const [apps, setApps] = useState<any[]>(MOCK_APPS);
  const [query, setQuery] = useState('');
  useEffect(()=>{(async()=>{const {data}=await supabase.from('apps').select('*').eq('status','approved'); if(data?.length) setApps(data)})()},[]);
  const filtered = useMemo(()=> apps.filter((a:any)=> a.title.toLowerCase().includes(query.toLowerCase())), [apps, query]);
  return (<div className="space-y-4"><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search all software..." className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white outline-none"/></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{filtered.map((app:any)=><AppCard key={app.id} app={app} onInstall={()=>onInstall(app)} onOpen={()=>onOpen(app)} />)}</div></div>);
};
