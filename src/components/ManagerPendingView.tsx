import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ManagerPendingView({ managerKey }: { managerKey?: string }) {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending'|'deleted'|'all'>('pending')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    let query = supabase.from('apps').select('*').order('created_at',{ascending:false})
    if(tab==='pending') query = query.eq('status','pending')
    if(tab==='deleted') query = query.eq('status','deleted')
    if(tab==='all') query = query.neq('status','deleted')
    
    const { data } = await query
    setApps(data||[])
    setLoading(false)
  }

  useEffect(()=>{ load(); setSelected(new Set()) }, [tab])

  const toggle = (id:string) => {
    const n = new Set(selected)
    if(n.has(id)) n.delete(id); else n.add(id)
    setSelected(n)
  }
  const toggleAll = () => {
    if(selected.size===filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(a=>a.id)))
  }

  const bulkUpdate = async (status:string) => {
    if(selected.size===0) return
    if(!confirm(`${status} ${selected.size} apps?`)) return
    await supabase.from('apps').update({ status }).in('id', Array.from(selected))
    setSelected(new Set())
    load()
  }
  const bulkDelete = async () => {
    if(selected.size===0) return
    if(!confirm(`Soft-delete ${selected.size} apps? They go to Deleted tab.`)) return
    await supabase.from('apps').update({ 
      status:'deleted', 
      deleted_at: new Date().toISOString(),
      deleted_by: 'manager:'+ (managerKey||'soulreal200682')
    }).in('id', Array.from(selected))
    setSelected(new Set())
    load()
  }

  const filtered = apps.filter(a => 
    !search || a.title?.toLowerCase().includes(search.toLowerCase()) || 
    a.owner_uid?.toLowerCase().includes(search.toLowerCase())
  )

  if(loading) return <div className="text-white/60 text-sm p-4">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={()=>setTab('pending')} className={`px-4 py-2 rounded-full text-xs ${tab==='pending'?'bg-white text-black':'bg-white/10 text-white'}`}>Pending ({apps.length})</button>
          <button onClick={()=>setTab('deleted')} className={`px-4 py-2 rounded-full text-xs ${tab==='deleted'?'bg-white text-black':'bg-white/10 text-white'}`}>Deleted</button>
          <button onClick={()=>setTab('all')} className={`px-4 py-2 rounded-full text-xs ${tab==='all'?'bg-white text-black':'bg-white/10 text-white'}`}>All Software</button>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or owner UID (e.g. ECOSYSTEM-CORE)" className="bg-white/5 border border-white/10 rounded-full px-3 py-2 text-xs text-white" />
      </div>

      {selected.size>0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 items-center">
          <span className="text-amber-300 text-xs">{selected.size} selected</span>
          <button onClick={()=>bulkUpdate('approved')} className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold">Approve</button>
          <button onClick={()=>bulkUpdate('rejected')} className="px-3 py-1 bg-white/10 text-white rounded-full text-xs">Reject</button>
          <button onClick={bulkDelete} className="px-3 py-1 bg-rose-600 text-white rounded-full text-xs">Soft Delete</button>
          {tab==='deleted' && <button onClick={()=>bulkUpdate('approved')} className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs">Restore</button>}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-white/40 text-xs px-2">
          <input type="checkbox" checked={selected.size===filtered.length && filtered.length>0} onChange={toggleAll} />
          <span>Select all ({filtered.length})</span>
        </div>
        {filtered.map((app:any)=>(
          <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-center">
            <input type="checkbox" checked={selected.has(app.id)} onChange={()=>toggle(app.id)} />
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{app.title}</div>
              <div className="text-white/40 text-xs">{app.id} • {app.owner_uid} • {app.status}</div>
              {app.deleted_at && <div className="text-rose-400/60 text-xs">Deleted: {new Date(app.deleted_at).toLocaleString()} by {app.deleted_by}</div>}
            </div>
            <div className="flex gap-2">
              {tab!=='deleted' && <>
                <button onClick={async()=>{ await supabase.from('apps').update({status:'rejected'}).eq('id',app.id); load() }} className="px-3 py-1 bg-white/10 text-white rounded-full text-xs">Reject</button>
                <button onClick={async()=>{ await supabase.from('apps').update({status:'approved'}).eq('id',app.id); load() }} className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold">Approve</button>
              </>}
              {tab==='deleted' && <button onClick={async()=>{ await supabase.from('apps').update({status:'approved', deleted_at:null}).eq('id',app.id); load() }} className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs">Restore</button>}
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-white/30 text-sm p-8 text-center border border-dashed border-white/10 rounded-xl">No apps in {tab}</div>}
      </div>
    </div>
  )
}