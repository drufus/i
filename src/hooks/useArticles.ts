import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError, ValidationError } from '../lib/errors';
import type { Post, PaginationParams, PaginatedResponse } from '../types';

interface UseArticlesOptions {
  userId?: string;
  nicheId?: string;
  status?: Post['status'];
  initialPage?: number;
  pageSize?: number;
  onError?: (error: AppError) => void;
  autoFetch?: boolean;
}

interface CreateArticleData {
  title: string;
  content: string;
  niche_id: string;
  status?: Post['status'];
}

export function useArticles(options: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: options.initialPage || 1,
    limit: options.pageSize || 10,
    orderBy: 'created_at',
    orderDirection: 'desc'
  });

  const fetchArticles = useCallback(async (
    searchTerm?: string,
    params: PaginationParams = pagination
  ) => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to fetch articles');
    }

    setLoading(true);
    setError(null);

    try {
      const { from, to } = getPaginationRange(params);
      
      let query = supabase
        .from('posts')
        .select('*, niches(name)', { count: 'exact' })
        .eq('user_id', options.userId);

      if (options.nicheId) {
        query = query.eq('niche_id', options.nicheId);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      const { data, error: queryError, count } = await query
        .order(params.orderBy || 'created_at', { ascending: params.orderDirection === 'asc' })
        .range(from, to);

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      if (!data) {
        throw new DatabaseError('No articles found', 'NO_DATA');
      }

      const paginatedResponse: PaginatedResponse<Post> = {
        data,
        total: count || 0,
        page: params.page,
        limit: params.limit,
        hasMore: (count || 0) > to
      };

      setArticles(data);
      setPagination(params);
      return paginatedResponse;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to fetch articles',
            'FETCH_ARTICLES_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.nicheId, options.status, pagination, options.onError]);

  const createArticle = useCallback(async (articleData: CreateArticleData) => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to create article');
    }

    validateArticleData(articleData);

    try {
      const { data, error: queryError } = await supabase
        .from('posts')
        .insert([{
          ...articleData,
          user_id: options.userId,
          status: articleData.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setArticles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to create article',
            'CREATE_ARTICLE_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.userId, options.onError]);

  const updateArticle = useCallback(async (
    articleId: string,
    updates: Partial<Omit<Post, 'id' | 'user_id' | 'created_at'>>
  ) => {
    try {
      if (updates.title || updates.content) {
        validateArticleData({
          title: updates.title || '',
          content: updates.content || '',
          niche_id: updates.niche_id || ''
        });
      }

      const { data, error: queryError } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setArticles(prev => prev.map(article => 
        article.id === articleId ? data : article
      ));
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to update article',
            'UPDATE_ARTICLE_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  const deleteArticle = useCallback(async (articleId: string) => {
    try {
      const { error: queryError } = await supabase
        .from('posts')
        .delete()
        .eq('id', articleId);

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to delete article',
            'DELETE_ARTICLE_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  // Initial fetch if autoFetch is enabled and userId is provided
  useEffect(() => {
    if (options.autoFetch !== false && options.userId) {
      fetchArticles();
    }
  }, [fetchArticles, options.autoFetch, options.userId]);

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    setPage: (page: number) => fetchArticles(undefined, { ...pagination, page }),
    setPageSize: (limit: number) => fetchArticles(undefined, { ...pagination, limit }),
    sort: (orderBy: string, orderDirection: 'asc' | 'desc' = 'asc') => 
      fetchArticles(undefined, { ...pagination, orderBy, orderDirection })
  };
}

function validateArticleData(data: Partial<CreateArticleData>) {
  if (!data.title?.trim()) {
    throw new ValidationError('Article title is required');
  }

  if (data.title.length < 3) {
    throw new ValidationError('Article title must be at least 3 characters long');
  }

  if (!data.content?.trim()) {
    throw new ValidationError('Article content is required');
  }

  if (data.content.length < 10) {
    throw new ValidationError('Article content must be at least 10 characters long');
  }

  if (!data.niche_id) {
    throw new ValidationError('Article niche is required');
  }
}

function getPaginationRange(params: PaginationParams) {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  return { from, to };
}