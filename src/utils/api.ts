import { supabase } from '../lib/supabase';
import type { Article, Post } from '../types';

export async function fetchArticles(nicheId: string, page = 1, limit = 12) {
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('niche_id', nicheId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;
  return data as Article[];
}

export async function createPost(postData: {
  article_id: string;
  platform: Post['platform'];
  content: string;
  scheduled_for: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('posts')
    .insert([{ ...postData, user_id: user.id }]);

  if (error) throw error;
}

export async function fetchUserPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Post[];
}