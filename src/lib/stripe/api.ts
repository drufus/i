import { PaymentAdapter } from '../payments';
import { CheckoutMode } from '../payments/payment.types';
import { supabase } from '../supabase';

const paymentAdapter = new PaymentAdapter();

export async function createCheckoutSession(planId: string) {
  try {
    const checkoutUrl = await paymentAdapter.createCheckoutSessionUrl({
      priceId: planId,
      mode: CheckoutMode.Subscription,
      successUrl: `${window.location.origin}/settings?success=true`,
      cancelUrl: `${window.location.origin}/settings?canceled=true`
    });

    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function createCustomerPortal(customerId: string, returnUrl: string) {
  try {
    const portalUrl = await paymentAdapter.createCustomerPortalUrl(
      customerId,
      returnUrl
    );
    
    window.location.href = portalUrl;
  } catch (error) {
    console.error('Error creating customer portal:', error);
    throw error;
  }
}

export async function syncStripePlans() {
  try {
    const { error } = await supabase.functions.invoke('sync-stripe-plans');
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing Stripe plans:', error);
    throw error;
  }
}

export async function verifyWebhookSignature(request: Request) {
  const rawBody = await request.arrayBuffer();
  return paymentAdapter.verifyWebhookSignature(rawBody);
}

export async function handleWebhookEvent(webhook: any) {
  return paymentAdapter.mapWebhookEvent(webhook);
}