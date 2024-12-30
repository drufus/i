import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppError, DatabaseError } from '../lib/errors';
import type { SubscriptionPlan, PaginationParams, PaginatedResponse } from '../types';

interface UseSubscriptionPlansOptions {
  initialPage?: number;
  pageSize?: number;
  onError?: (error: AppError) => void;
}

export function useSubscriptionPlans(options: UseSubscriptionPlansOptions = {}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: options.initialPage || 1,
    limit: options.pageSize || 10,
    orderBy: 'price',
    orderDirection: 'asc'
  });

  const fetchPlans = useCallback(async (params: PaginationParams = pagination) => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getPaginationRange(params);
      
      const { data, error, count } = await supabase
        .from('subscription_plans')
        .select('*, features(*)', { count: 'exact' })
        .order(params.orderBy || 'price', { ascending: params.orderDirection === 'asc' })
        .range(from, to);

      if (error) {
        throw new DatabaseError(error.message, error.code);
      }

      if (!data) {
        throw new DatabaseError('No data returned from query', 'NO_DATA');
      }

      const paginatedResponse: PaginatedResponse<SubscriptionPlan> = {
        data,
        total: count || 0,
        page: params.page,
        limit: params.limit,
        hasMore: (count || 0) > to
      };

      setPlans(data);
      setPagination(params);
      return paginatedResponse;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to fetch subscription plans',
            'FETCH_PLANS_ERROR'
          );
      
      setError(appError);
      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [pagination, options.onError]);

  const createPlan = useCallback(async (planData: Partial<SubscriptionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([planData])
        .select()
        .single();

      if (error) {
        throw new DatabaseError(error.message, error.code);
      }

      setPlans(prev => [...prev, data]);
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to create subscription plan',
            'CREATE_PLAN_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  const updatePlan = useCallback(async (
    planId: string,
    planData: Partial<SubscriptionPlan>
  ) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(error.message, error.code);
      }

      setPlans(prev => prev.map(p => p.id === planId ? data : p));
      return data;
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to update subscription plan',
            'UPDATE_PLAN_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  const deletePlan = useCallback(async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        throw new DatabaseError(error.message, error.code);
      }

      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      const appError = err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : 'Failed to delete subscription plan',
            'DELETE_PLAN_ERROR'
          );
      
      options.onError?.(appError);
      throw appError;
    }
  }, [options.onError]);

  // Initial fetch
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    pagination,
    createPlan,
    updatePlan,
    deletePlan,
    fetchPlans,
    setPage: (page: number) => fetchPlans({ ...pagination, page }),
    setPageSize: (limit: number) => fetchPlans({ ...pagination, limit }),
    sort: (orderBy: string, orderDirection: 'asc' | 'desc' = 'asc') => 
      fetchPlans({ ...pagination, orderBy, orderDirection })
  };
}

function getPaginationRange(params: PaginationParams) {
  const from = (params.page - 1) * params.limit;
  const to = from + params.limit - 1;
  return { from, to };
}