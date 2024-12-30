import { PaymentType } from './types';
import { StripeAdapter } from './stripe/adapter';
import type { PaymentAdapterInterface } from './types';

export class PaymentAdapter {
  private adapter: PaymentAdapterInterface;

  constructor(type: PaymentType = PaymentType.STRIPE) {
    switch (type) {
      case PaymentType.STRIPE:
        this.adapter = new StripeAdapter();
        break;
      default:
        throw new Error(`Unsupported payment provider: ${type}`);
    }
  }

  verifyWebhookSignature(req: ArrayBuffer) {
    return this.adapter.verifyWebhookSignature(req);
  }

  mapWebhookEvent(webhook: any) {
    return this.adapter.mapWebhookEvent(webhook);
  }

  createCheckoutSessionUrl(params: any) {
    return this.adapter.createCheckoutSessionUrl(params);
  }

  createCustomerPortalUrl(customerId: string, returnUrl: string) {
    return this.adapter.createCustomerPortalUrl(customerId, returnUrl);
  }
}