import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useWebhookDomain() {
  const [domain, setDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDomain();
  }, []);

  const fetchDomain = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('value')
        .eq('name', 'stripe_webhook_domain')
        .single();

      if (error) throw error;
      setDomain(data?.value || null);
    } catch (err) {
      console.error('Error fetching webhook domain:', err);
      setError(err as Error);
    }
  };

  const updateDomain = async (newDomain: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('update-webhook-domain', {
        body: { domain: newDomain }
      });

      if (error) throw error;
      setDomain(newDomain);
    } catch (err) {
      console.error('Error updating webhook domain:', err);
      throw new Error('Failed to update webhook domain');
    } finally {
      setLoading(false);
    }
  };

  const refreshEndpoints = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('refresh-webhook-endpoints');
      if (error) throw error;
    } catch (err) {
      console.error('Error refreshing webhook endpoints:', err);
      throw new Error('Failed to refresh webhook endpoints');
    } finally {
      setLoading(false);
    }
  };

  return {
    domain,
    loading,
    error,
    updateDomain,
    refreshEndpoints
  };
}