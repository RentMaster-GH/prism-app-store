import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const cache = new Map<string, { data: any[], ts: number }>();
const CACHE_TTL = 60_000; // 60s

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
    if (!supabase) return;

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
        const { data, error } = await supabase
          .from('marketplace_apps')
          .select('*').neq('status','deleted').textSearch('search_tsv', searchQuery)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%`)
          .limit(20);
        if (error) throw error;
        cache.set(trimmed, { data: data || [], ts: Date.now() });
        setSupabaseResults(data || []);
      } catch (e) {
        console.warn('Search failed', e);
        setSupabaseResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200); // 200ms debounce, faster

    return () => clearTimeout(timer);
  }, [query]);

  return { supabaseResults, isSearching };
}
