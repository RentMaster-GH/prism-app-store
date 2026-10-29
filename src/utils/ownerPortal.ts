export function generateOwnerPasskey() {
  const raw = 'PRISM-' + crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase() 
            + '-' + Math.random().toString(36).slice(2,8).toUpperCase();
  const slug = 'p-' + Math.random().toString(36).slice(2,9).toLowerCase();
  return { raw, slug };
}

export async function hashPasskey(raw: string) {
  const enc = new TextEncoder().encode(raw);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
