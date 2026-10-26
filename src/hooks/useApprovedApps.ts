import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useApprovedApps = () => {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('apps').select('*').eq('status','approved').order('installs',{ascending:false})
      if (data && data.length > 0) setApps(data)
      setLoading(false)
    })()
  }, [])
  return { apps, loading }
}
