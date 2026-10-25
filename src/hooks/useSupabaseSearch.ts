import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseSearch(query: string, _appsLength: number) {
  const [supabaseResults, setSupabaseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSupabaseResults([]);
      setIsSearching(false);
      return;
    }
    if (!supabase) {
      setSupabaseResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('marketplace_apps')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,tagline.ilike.%${query}%`)
          .limit(20);
        if (error) throw error;
        setSupabaseResults(data || []);
      } catch (e) {
        console.warn('Search failed', e);
        setSupabaseResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { supabaseResults, isSearching };
}
