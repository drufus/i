import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError, ValidationError } from '../lib/errors';
import type { ApiKey } from '../types';

interface UseApiKeysOptions {
  userId?: string;
  onError?: (error: AppError) => void;
  autoFetch?: boolean;
}

export function useApiKeys(options: UseApiKeysOptions = {}) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchKeys = useCallback(async () => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to fetch API keys');
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', options.userId)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      if (!data) {
        throw new DatabaseError('No API keys found', 'NO_DATA');
      }

      setKeys(data);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to fetch API keys',
            'FETCH_KEYS_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.onError]);

  const createKey = useCallback(async (name: string) => {
    if (!options.userId) {
      throw new ValidationError('User ID is required to create an API key');
    }

    if (!name.trim()) {
      throw new ValidationError('API key name is required');
    }

    try {
      const newKey: Partial<ApiKey> = {
        user_id: options.userId,
        name: name.trim(),
        key: generateApiKey(),
        created_at: new Date().toISOString()
      };

      const { data, error: queryError } = await supabase
        .from('api_keys')
        .insert([newKey])
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setKeys(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to create API key',
            'CREATE_KEY_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.userId, options.onError]);

  const deleteKey = useCallback(async (keyId: string) => {
    try {
      const { error: queryError } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setKeys(prev => prev.filter(key => key.id !== keyId));
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to delete API key',
            'DELETE_KEY_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  // Initial fetch if autoFetch is enabled and userId is provided
  useEffect(() => {
    if (options.autoFetch !== false && options.userId) {
      fetchKeys();
    }
  }, [fetchKeys, options.autoFetch, options.userId]);

  return {
    keys,
    loading,
    error,
    fetchKeys,
    createKey,
    deleteKey
  };
}

// Helper function to generate a secure API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = 4;
  const segmentLength = 8;
  
  const segments_arr = Array.from({ length: segments }, () =>
    Array.from({ length: segmentLength }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
  );

  return segments_arr.join('-');
}