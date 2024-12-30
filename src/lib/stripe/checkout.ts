import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../supabase';
import { CheckoutParams, CheckoutSession } from './types';
import { StripeError } from './errors';

export async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession> {
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: params
    });

    if (error) throw error;

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    if (!stripe) {
      throw new StripeError('Failed to initialize Stripe', 'INIT_ERROR');
    }

    return {
      sessionId: data.id,
      url: data.url
    };
  } catch (error) {
    throw new StripeError(
      'Failed to create checkout session',
      'CHECKOUT_ERROR'
    );
  }
}

export async function createCustomerPortal(customerId: string, returnUrl: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { customerId, returnUrl }
    });

    if (error) throw error;
    return data.url;
  } catch (error) {
    throw new StripeError(
      'Failed to create customer portal',
      'PORTAL_ERROR'
    );
  }
}