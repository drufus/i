import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SubscriptionPlan } from '../types/subscription';

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      if (error) throw error;
      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const createPlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([planData])
        .select()
        .single();

      if (error) throw error;
      setPlans(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  };

  const updatePlan = async (planId: string, planData: Partial<SubscriptionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(planData)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      setPlans(prev => prev.map(p => p.id === planId ? data : p));
      return data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  };

  return {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan
  };
}