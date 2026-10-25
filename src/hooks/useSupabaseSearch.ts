import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useSupabaseSearch(query: string, localAppsCount: number) {
  const [supabaseResults, setSupabaseResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!supabase || query.trim().length < 2) {
      setSupabaseResults([]);
      return;
    }
    const debounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('marketplace_apps')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
          .limit(20);
        setSupabaseResults(data || []);
      } catch {} finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, localAppsCount]);

  return { supabaseResults, isSearching };
}