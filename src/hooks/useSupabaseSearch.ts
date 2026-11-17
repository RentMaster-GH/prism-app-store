import { useState, useEffect, useRef } from 'react';
import { backend } from '../lib/backend';

const cache = new Map<string, { data: any[]; ts: number }>();
const CACHE_TTL = 60_000;

export function useSupabaseSearch(query: string, _appsLength: number) {
  const [supabaseResults, setSupabaseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const lastQueryRef = useRef('');

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSupabaseResults([]);
      setIsSearching(false);
      return;
    }
    const trimmed = query.trim().toLowerCase();
    if (trimmed === lastQueryRef.current && cache.has(trimmed)) {
      const cached = cache.get(trimmed)!;
      if (Date.now() - cached.ts < CACHE_TTL) {
        setSupabaseResults(cached.data);
        return;
      }
    }

    const timer = setTimeout(async () => {
      lastQueryRef.current = trimmed;
      if (cache.has(trimmed)) {
        const c = cache.get(trimmed)!;
        if (Date.now() - c.ts < CACHE_TTL) {
          setSupabaseResults(c.data);
          return;
        }
      }
      setIsSearching(true);
      try {
        const records = await backend.list<any>('apps');
        const matches = records
          .map((r) => ({ id: r.id, uuid: r.id, ...r.data }))
          .filter((row) => {
            if (row.status === 'deleted') return false;
            const hay = `${row.title || ''} ${row.name || ''} ${row.description || ''} ${row.tagline || ''} ${row.studio || ''}`.toLowerCase();
            return hay.includes(trimmed);
          })
          .slice(0, 20);

        cache.set(trimmed, { data: matches, ts: Date.now() });
        setSupabaseResults(matches);
      } catch (e) {
        console.warn('Search failed', e);
        setSupabaseResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return { supabaseResults, isSearching };
}
