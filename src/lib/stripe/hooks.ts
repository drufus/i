import { useState } from 'react';
import { createCheckoutSession, createCustomerPortal } from './checkout';
import { syncStripePlans } from './sync';
import type { CheckoutParams } from './types';
import { StripeError } from './errors';

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const checkout = async (params: CheckoutParams) => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(params);
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

export function useStripePortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const redirect = async (customerId: string, returnUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = await createCustomerPortal(customerId, returnUrl);
      window.location.href = url;
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError('Portal redirect failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { redirect, loading, error };
}

export function useStripeSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const syncPlans = async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncStripePlans();
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