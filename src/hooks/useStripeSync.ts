import { useState } from 'react';
import { syncStripePlans, validateStripeConfig } from '../services/stripe';
import { StripeError } from '../services/errors';

export function useStripeSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<StripeError | null>(null);

  const syncPlans = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      // Validate config before attempting sync
      await validateStripeConfig();
      await syncStripePlans();
    } catch (err) {
      const error = err instanceof StripeError ? err : new StripeError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR'
      );
      setError(error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncPlans,
    syncing,
    error,
    clearError: () => setError(null)
  };
}