import { supabase } from '../supabase';
import { StripeError } from './errors';

export async function syncStripePlans(): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('sync-stripe-plans');
    if (error) throw error;
  } catch (error) {
    throw new StripeError(
      'Failed to sync plans with Stripe',
      'SYNC_ERROR'
    );
  }
}