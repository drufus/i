import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setNiche: (nicheId: string) => Promise<void>;
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        set({ user: null, loading: false });
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        // Fetch user's selected niches
        const { data: userNiches } = await supabase
          .from('user_niches')
          .select('niche_id')
          .eq('user_id', authUser.id);

        set({
          user: {
            ...profile,
            email: authUser.email!,
            niche: userNiches?.[0]?.niche_id || null
          },
          loading: false
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ user: null, loading: false });
    }
  },
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await get().fetchUser();
  },
  signUp: async (data) => {
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (signUpError) throw signUpError;

    // Get the newly created user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Failed to create user');

    // Update user profile with additional information
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country
      })
      .eq('id', user.id);

    if (profileError) throw profileError;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
  setNiche: async (nicheId: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_niches')
        .upsert([{ user_id: user.id, niche_id: nicheId }], {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update local state
      set(state => ({
        user: state.user ? { ...state.user, niche: nicheId } : null
      }));
    } catch (error) {
      console.error('Error setting niche:', error);
      throw error;
    }
  },
  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        country: data.country
      })
      .eq('id', user.id);

    if (error) throw error;
    await get().fetchUser();
  },
  updatePassword: async (currentPassword: string, newPassword: string) => {
    // First verify current password by attempting to sign in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error('No user logged in');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }
  }
}));