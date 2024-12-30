import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Niche {
  id: string;
  name: string;
  description: string;
}

interface NicheState {
  niches: Niche[];
  loading: boolean;
  error: string | null;
  fetchNiches: () => Promise<void>;
}

export const useNicheStore = create<NicheState>((set) => ({
  niches: [],
  loading: false,
  error: null,
  fetchNiches: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('niches')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ niches: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));