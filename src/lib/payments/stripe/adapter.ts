import { loadStripe } from '@stripe/stripe-js';
import { PaymentEvent } from '../webhook.types';
import { PaymentAdapterInterface, CreateCheckoutParams } from '../types';
import { getStripeConfig } from './config';
import { verifyStripeSignature } from './utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export class StripeAdapter implements PaymentAdapterInterface {
  verifyWebhookSignature(rawBody: ArrayBuffer) {
    return verifyStripeSignature(rawBody);
  }

  mapWebhookType(webhook: any): PaymentEvent {
    switch (webhook.type) {
      case 'checkout.session.completed':
        return PaymentEvent.CHECKOUT_COMPLETED;
      case 'checkout.session.expired':
        return PaymentEvent.CHECKOUT_EXPIRED;
      case 'customer.subscription.updated':
        return PaymentEvent.SUBSCRIPTION_UPDATED;
      case 'customer.subscription.deleted':
        return PaymentEvent.SUBSCRIPTION_ENDED;
      case 'charge.refunded':
        return PaymentEvent.FULL_OR_PARTIAL_REFUND;
      default:
        return PaymentEvent.NOT_MAPPED;
    }
  }

  async mapToCheckout(webhook: any) {
    const session = webhook.data.object;
    return {
      customerId: session.customer,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      planId: session.metadata?.planId,
      userId: session.client_reference_id,
      purchasedAt: new Date(session.created * 1000).toISOString(),
      productName: session.metadata?.productName,
    };
  }

  async mapToSubscription(webhook: any) {
    const subscription = webhook.data.object;
    return {
      customerId: subscription.customer,
      planId: subscription.items.data[0]?.price.id,
      amount: subscription.items.data[0]?.price.unit_amount,
      receiptUrl: subscription.latest_invoice_url,
    };
  }

  async mapToRefund(webhook: any) {
    const charge = webhook.data.object;
    return {
      amount: charge.amount_refunded,
      refundDate: new Date(charge.created * 1000).toISOString(),
      receiptUrl: charge.receipt_url,
    };
  }

  async createCheckoutSessionUrl(params: CreateCheckoutParams) {
    const config = await getStripeConfig();
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error('Failed to initialize Stripe');
    }

    const { sessionId } = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(res => res.json());

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) throw error;

    return sessionId;
  }

  async createCustomerPortalUrl(customerId: string, returnUrl: string) {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, returnUrl }),
    });

    const { url } = await response.json();
    if (!url) {
      throw new Error('Failed to create customer portal');
    }

    return url;
  }
}