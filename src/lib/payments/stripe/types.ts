import { User } from '../../../types';

export interface StripeConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface CheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl?: string;
  user?: User;
  mode?: 'payment' | 'subscription';
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}