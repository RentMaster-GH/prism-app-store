import { NextResponse } from 'next/server';
// use your supabase client
export async function POST(req: Request) {
  const { uid, type, category, message } = await req.json();
  // save to supabase table 'prism_feedback'
  // await supabase.from('prism_feedback').insert({ uid, type, category, message });
  return NextResponse.json({ ok: true });
}