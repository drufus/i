export const STRIPE_CONFIG = {
  REQUIRED_KEYS: [
    'stripe_public_key',
    'stripe_secret_key',
    'stripe_webhook_secret'
  ],
  ENVIRONMENTS: {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development'
  }
} as const;

export function validateStripeKey(key: string | undefined): boolean {
  return typeof key === 'string' && key.length > 0;
}

export function getStripePublicKey(): string {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!validateStripeKey(key)) {
    throw new Error('Missing Stripe public key');
  }
  return key;
}