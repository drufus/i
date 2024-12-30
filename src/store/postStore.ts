import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';

interface CreatePostData {
  article_id: string;
  platform: Post['platform'];
  content: string;
  scheduled_for: string;
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  createPost: (data: CreatePostData) => Promise<void>;
  fetchUserPosts: () => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  loading: false,
  error: null,
  createPost: async (data) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);
      
      if (error) throw error;
      
      // Refresh posts after creation
      const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      set({ posts, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  fetchUserPosts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ posts: data, error: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));