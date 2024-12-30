import { useState } from 'react';
import { StripeError } from './errors';
import { supabase } from '../../../lib/supabase';
import { PaymentAdapter } from '../index';
import { CheckoutMode } from '../types';

const paymentAdapter = new PaymentAdapter();

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const checkout = async (params: {
    priceId: string;
    successUrl: string;
    cancelUrl?: string;
    userId?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const url = await paymentAdapter.createCheckoutSessionUrl({
        ...params,
        mode: CheckoutMode.Subscription
      });
      window.location.href = url;
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError('Checkout failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}

export function useStripeSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const syncPlans = async () => {
    setSyncing(true);
    setError(null);
    try {
      const { error: syncError } = await supabase.functions.invoke('sync-stripe-plans');
      if (syncError) throw syncError;
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError('Sync failed');
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return { syncPlans, syncing, error };
}