import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { AppCard } from './AppCard';
import { useApprovedApps } from '../hooks/useApprovedApps'

const MOCK_APPS = [
  { id: '1', title: 'Prism Synth', studio: 'Prism Labs', tagline: 'The DAW-grade synthesizer', thumbnail_url: '', live_web_url: 'https://example.com', category: 'Synth', rating: 4.9, package_size: '36.4 MB', monetization: 'Free', installs: 1200, status: 'approved' },
  { id: '2', title: 'Cipher Note Studio', studio: 'Prism Labs', tagline: 'Secure notes', thumbnail_url: '', live_web_url: 'https://example.com', category: 'Notes', rating: 4.8, package_size: '12.4 MB', monetization: 'Free', installs: 900, status: 'approved' },
];

export const AllSoftwareView: React.FC<{ onInstall: (app: any) => void; onOpen: (app: any) => void }> = ({ onInstall, onOpen }) => {
  const { apps: realApps } = useApprovedApps();
  const apps = realApps.length > 0 ? realApps : MOCK_APPS;
  const [query, setQuery] = useState('');
  const filtered = useMemo(()=> apps.filter((a:any)=> a.title.toLowerCase().includes(query.toLowerCase()) || a.tagline?.toLowerCase().includes(query.toLowerCase())), [apps, query]);
  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search all software..." className="w-full h-11 pl-10 pr-4 rounded-full bg-[#12132a] border border-white/10 text-[13px] text-white outline-none" />
      </div>
      <div className="text-[11px] text-slate-500">{filtered.length} apps</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((app:any)=> <AppCard key={app.id} app={app} onInstall={()=>onInstall(app)} onOpen={()=>onOpen(app)} />)}
      </div>
    </div>
  );
};
