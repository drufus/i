import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useUser(userId: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            role,
            subscription_tier,
            created_at,
            auth_user_details!inner(email)
          `)
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        const { data: niches } = await supabase
          .from('user_niches')
          .select('niche_id')
          .eq('user_id', userId)
          .single();

        setUser({
          id: profile.id,
          email: profile.auth_user_details?.email || '',
          role: profile.role || 'user',
          subscription_tier: profile.subscription_tier,
          created_at: profile.created_at,
          niche: niches?.niche_id || null
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const updateUserNiche = async (nicheId: string) => {
    if (!userId) return;

    try {
      // Remove existing niche
      await supabase
        .from('user_niches')
        .delete()
        .eq('user_id', userId);

      // Add new niche if provided
      if (nicheId) {
        const { error } = await supabase
          .from('user_niches')
          .insert([{ user_id: userId, niche_id: nicheId }]);

        if (error) throw error;
      }

      // Update local state
      setUser(prev => prev ? { ...prev, niche: nicheId || null } : null);
    } catch (error) {
      console.error('Error updating user niche:', error);
      throw error;
    }
  };

  return { user, loading, error, updateUserNiche };
}