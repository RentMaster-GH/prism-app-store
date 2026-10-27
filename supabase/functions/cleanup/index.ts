import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString()
  const { data, error } = await supabase.from('marketplace_apps').delete().eq('status','deleted').lt('deleted_at', thirtyDaysAgo).select('id')
  return new Response(JSON.stringify({ cleaned: data?.length || 0, ids: data?.map((d:any)=>d.id), error, at: new Date().toISOString() }), { headers: { 'Content-Type':'application/json' } })
})
