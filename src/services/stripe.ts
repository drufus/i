import { supabase } from '../lib/supabase';
import { StripeError } from './errors';

export async function syncStripePlans() {
  try {
    const { error } = await supabase.functions.invoke('sync-stripe-plans', {
      body: { timestamp: Date.now() }
    });

    if (error) {
      throw new StripeError(
        'Failed to sync plans with Stripe',
        error.message
      );
    }
  } catch (error) {
    if (error instanceof StripeError) {
      throw error;
    }
    throw new StripeError(
      'Failed to connect to Stripe service',
      'STRIPE_CONNECTION_ERROR'
    );
  }
}

export async function validateStripeConfig() {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('name, value')
      .eq('environment', 'production')
      .in('name', ['stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret']);

    if (error) throw error;

    const missingKeys = ['stripe_public_key', 'stripe_secret_key', 'stripe_webhook_secret']
      .filter(key => !data?.find(k => k.name === key)?.value);

    if (missingKeys.length > 0) {
      throw new StripeError(
        'Missing required Stripe configuration',
        'STRIPE_CONFIG_MISSING'
      );
    }
  } catch (error) {
    if (error instanceof StripeError) {
      throw error;
    }
    throw new StripeError(
      'Failed to validate Stripe configuration',
      'STRIPE_CONFIG_ERROR'
    );
  }
}