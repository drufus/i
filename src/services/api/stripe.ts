import { supabase } from '../../lib/supabase';
import { STRIPE_CONFIG } from '../../config/stripe';
import { StripeError } from '../errors';

export async function getStripeConfig(environment = STRIPE_CONFIG.ENVIRONMENTS.PRODUCTION) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('name, value')
      .eq('environment', environment)
      .in('name', STRIPE_CONFIG.REQUIRED_KEYS);

    if (error) throw error;

    const missingKeys = STRIPE_CONFIG.REQUIRED_KEYS
      .filter(key => !data?.find(k => k.name === key)?.value);

    if (missingKeys.length > 0) {
      throw new StripeError(
        `Missing Stripe configuration: ${missingKeys.join(', ')}`,
        'STRIPE_CONFIG_INCOMPLETE'
      );
    }

    return data.reduce((acc, { name, value }) => ({
      ...acc,
      [name]: value
    }), {});
  } catch (error) {
    if (error instanceof StripeError) throw error;
    throw new StripeError(
      'Failed to fetch Stripe configuration',
      'STRIPE_CONFIG_ERROR'
    );
  }
}

export async function updateStripeConfig(config: {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}, environment = STRIPE_CONFIG.ENVIRONMENTS.PRODUCTION) {
  try {
    const { error } = await supabase.rpc('update_api_keys', {
      p_environment: environment,
      p_public_key: config.publicKey,
      p_secret_key: config.secretKey,
      p_webhook_secret: config.webhookSecret
    });

    if (error) throw error;
  } catch (error) {
    throw new StripeError(
      'Failed to update Stripe configuration',
      'STRIPE_CONFIG_UPDATE_ERROR'
    );
  }
}