import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError, NetworkError } from '../lib/errors';
import type { User } from '../types';

interface UseSupabaseOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export function useSupabaseMutation<T = unknown>(
  query: () => Promise<{ data: T | null; error: Error | null }>,
  options: UseSupabaseOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    onSuccess,
    onError
  } = options;

  useEffect(() => {
    return () => {
      // Cleanup: abort any pending requests when component unmounts
      abortControllerRef.current?.abort();
    };
  }, []);

  const mutate = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    let lastError: AppError | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check if request was aborted
        if (abortControllerRef.current.signal.aborted) {
          throw new NetworkError('Request was cancelled');
        }

        const { data, error: queryError } = await query();
        
        if (queryError) {
          throw new DatabaseError(
            queryError.message || 'Database operation failed',
            'SUPABASE_ERROR'
          );
        }
        
        if (data) {
          onSuccess?.(data);
          return data;
        }
        
        throw new DatabaseError('No data returned from query', 'NO_DATA');
      } catch (err) {
        lastError = err instanceof AppError
          ? err
          : new AppError(
              err instanceof Error ? err.message : 'Unknown error occurred',
              'UNKNOWN_ERROR'
            );

        // Don't retry if it's not a network error or we're out of retries
        if (!(lastError instanceof NetworkError) || attempt === retries) {
          setError(lastError);
          onError?.(lastError);
          throw lastError;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    // This should never be reached due to the throw in the loop
    throw lastError || new AppError('Unknown error occurred', 'UNKNOWN_ERROR');
  }, [query, retries, retryDelay, onSuccess, onError]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { mutate, loading, error, cancel };
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new DatabaseError(authError.message, 'AUTH_ERROR');
      }

      if (authUser) {
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          throw new DatabaseError(profileError.message, 'PROFILE_ERROR');
        }

        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to fetch user',
            'USER_FETCH_ERROR'
          );
      setError(appError);
      console.error('Error fetching user:', appError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}