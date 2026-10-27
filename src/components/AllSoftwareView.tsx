import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AllSoftwareView({ onOpenDetails }: any) {
  const [apps, setApps] = useState<any[]>([])
  useEffect(()=>{
    supabase.from('apps').select('*').eq('status','approved').order('created_at',{ascending:false}).then(({data})=>{ if(data) setApps(data) })
  },[])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {apps.map((app:any)=>(
        <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-white font-bold">{app.title}</h3>
          <p className="text-white/50 text-xs">{app.tagline}</p>
          <p className="text-white/30 text-xs mt-1">{app.live_web_url}</p>
          <button onClick={()=>onOpenDetails?.(app)} className="mt-3 bg-white text-black px-3 py-1 rounded-full text-xs">Open</button>
        </div>
      ))}
      {apps.length===0 && <p className="text-white/40">No approved apps - check Supabase RLS</p>}
    </div>
  )
}
