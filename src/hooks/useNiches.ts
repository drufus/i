import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Niche } from '../types';

export function useNiches(userId: string | null) {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchNiches() {
      try {
        const { data, error } = await supabase
          .from('niches')
          .select('*')
          .order('name');

        if (error) throw error;
        setNiches(data || []);

        if (userId) {
          const { data: userNiches, error: userNichesError } = await supabase
            .from('user_niches')
            .select('niche_id')
            .eq('user_id', userId);

          if (userNichesError) throw userNichesError;
          setSelectedNiches(userNiches.map(un => un.niche_id));
        }
      } catch (err) {
        console.error('Error fetching niches:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchNiches();
  }, [userId]);

  return {
    niches,
    selectedNiches,
    loading,
    error
  };
}