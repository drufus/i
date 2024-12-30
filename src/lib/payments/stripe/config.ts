import { supabase } from '../../supabase';
import { StripeConfig } from './types';
import { StripeError } from './errors';

export async function getStripeConfig(): Promise<StripeConfig> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('name, value')
      .eq('environment', 'production')
      .in('name', [
        'stripe_public_key',
        'stripe_secret_key',
        'stripe_webhook_secret'
      ]);

    if (error) throw error;

    const config = data.reduce((acc, { name, value }) => ({
      ...acc,
      [name.replace('stripe_', '').replace('_key', '')]: value
    }), {} as StripeConfig);

    validateConfig(config);
    return config;
  } catch (error) {
    throw new StripeError(
      'Failed to load Stripe configuration',
      'CONFIG_ERROR'
    );
  }
}

function validateConfig(config: Partial<StripeConfig>): asserts config is StripeConfig {
  const required = ['publicKey', 'secretKey', 'webhookSecret'];
  const missing = required.filter(key => !config[key as keyof StripeConfig]);

  if (missing.length > 0) {
    throw new StripeError(
      `Missing required Stripe configuration: ${missing.join(', ')}`,
      'INVALID_CONFIG'
    );
  }
}