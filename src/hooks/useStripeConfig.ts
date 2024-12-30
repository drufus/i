import { useState, useCallback } from 'react';
import { getStripeConfig, updateStripeConfig } from '../services/api/stripe';
import { StripeError } from '../services/errors';
import { STRIPE_CONFIG } from '../config/stripe';

export function useStripeConfig(environment = STRIPE_CONFIG.ENVIRONMENTS.PRODUCTION) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await getStripeConfig(environment);
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError(
        'Failed to fetch configuration',
        'UNKNOWN_ERROR'
      );
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [environment]);

  const updateConfig = useCallback(async (config: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await updateStripeConfig(config, environment);
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError(
        'Failed to update configuration',
        'UNKNOWN_ERROR'
      );
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [environment]);

  return {
    loading,
    error,
    fetchConfig,
    updateConfig,
    clearError: () => setError(null)
  };
}