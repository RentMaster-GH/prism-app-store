import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function ManagerPendingView({ managerKey }: { managerKey?: string }) {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('apps').select('*').eq('status','pending').order('created_at',{ascending:false})
    setPending(data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const approve = async (id: string) => {
    await supabase.from('apps').update({ status: 'approved' }).eq('id', id)
    load()
  }
  const reject = async (id: string) => {
    await supabase.from('apps').update({ status: 'rejected' }).eq('id', id)
    load()
  }

  if (loading) return <div className="text-white/60 text-sm p-4">Loading pending...</div>
  if (pending.length===0) return <div className="text-white/40 text-sm p-4 bg-white/[0.04] rounded-xl border border-white/10">No pending apps. All approved.</div>

  return (
    <div className="space-y-3">
      <h2 className="text-white font-bold">Pending Approvals ({pending.length})</h2>
      {pending.map((app:any)=>(
        <div key={app.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
          <div>
            <div className="text-white font-medium">{app.title}</div>
            <div className="text-white/40 text-xs">{app.id} • {app.owner_uid}</div>
            <div className="text-white/30 text-xs mt-1">{app.live_web_url || app.original_url}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>reject(app.id)} className="px-4 py-2 bg-white/10 text-white rounded-full text-xs">Reject</button>
            <button onClick={()=>approve(app.id)} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold">Approve</button>
          </div>
        </div>
      ))}
    </div>
  )
}
