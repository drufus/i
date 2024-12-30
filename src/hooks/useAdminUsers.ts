import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError, ValidationError } from '../lib/errors';
import type { User, PaginationParams, PaginatedResponse } from '../types';

interface UseAdminUsersOptions {
  initialPage?: number;
  pageSize?: number;
  onError?: (error: AppError) => void;
}

interface CreateUserData {
  email: string;
  password: string;
  role: 'user' | 'admin';
  subscription_tier: 'basic' | 'pro' | 'premium';
  first_name?: string;
  last_name?: string;
}

export function useAdminUsers(options: UseAdminUsersOptions = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: options.initialPage || 1,
    limit: options.pageSize || 10,
    orderBy: 'created_at',
    orderDirection: 'desc'
  });

  const searchUsers = useCallback(async (
    searchTerm: string,
    params: PaginationParams = pagination
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getPaginationRange(params);
      
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Apply search filters if search term is provided
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error: queryError, count } = await query
        .order(params.orderBy || 'created_at', { ascending: params.orderDirection === 'asc' })
        .range(from, to);

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      if (!data) {
        throw new DatabaseError('No users found', 'NO_DATA');
      }

      const paginatedResponse: PaginatedResponse<User> = {
        data,
        total: count || 0,
        page: params.page,
        limit: params.limit,
        hasMore: (count || 0) > to
      };

      setUsers(data);
      setPagination(params);
      return paginatedResponse;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to search users',
            'SEARCH_USERS_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [pagination, options.onError]);

  const createUser = useCallback(async (userData: CreateUserData) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!userData.email || !userData.password) {
        throw new ValidationError('Email and password are required');
      }

      if (userData.password.length < 6) {
        throw new ValidationError('Password must be at least 6 characters long');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        throw new DatabaseError(authError.message, 'AUTH_ERROR');
      }

      if (!authData.user) {
        throw new DatabaseError('Failed to create user', 'CREATE_USER_ERROR');
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          email: userData.email,
          role: userData.role,
          subscription_tier: userData.subscription_tier,
          first_name: userData.first_name,
          last_name: userData.last_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (profileError) {
        // Cleanup: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new DatabaseError(profileError.message, profileError.code);
      }

      setUsers(prev => [profileData, ...prev]);
      return profileData;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to create user',
            'CREATE_USER_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.onError]);

  const updateUser = useCallback(async (
    userId: string,
    userData: Partial<Omit<User, 'id' | 'email' | 'created_at'>>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('user_profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (queryError) {
        throw new DatabaseError(queryError.message, queryError.code);
      }

      setUsers(prev => prev.map(user => user.id === userId ? data : user));
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to update user',
            'UPDATE_USER_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.onError]);

  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Delete auth user (this will cascade to profile due to RLS policies)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        throw new DatabaseError(authError.message, 'AUTH_ERROR');
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to delete user',
            'DELETE_USER_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [options.onError]);

  return {
    users,
    loading,
    error,
    pagination,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    setPage: (page: number) => searchUsers('', { ...pagination, page }),
    setPageSize: (limit: number) => searchUsers('', { ...pagination, limit }),
    sort: (orderBy: string, orderDirection: 'asc' | 'desc' = 'asc') => 
      searchUsers('', { ...pagination, orderBy, orderDirection })
  };
}

function getPaginationRange(params: PaginationParams) {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  return { from, to };
}