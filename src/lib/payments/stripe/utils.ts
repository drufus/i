import { StripeError } from './errors';
import { getStripeConfig } from './config';

export async function verifyStripeSignature(rawBody: ArrayBuffer) {
  try {
    const config = await getStripeConfig();
    const stripe = require('stripe')(config.secretKey);
    const signature = getSignatureFromRequest();
    
    return stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      signature,
      config.webhookSecret
    );
  } catch (err) {
    throw new StripeError(
      'Invalid webhook signature',
      'INVALID_SIGNATURE'
    );
  }
}

function getSignatureFromRequest() {
  // Get signature from custom header since we're not in Next.js
  return document.querySelector('meta[name="stripe-signature"]')?.getAttribute('content') || '';
}