// Payment provider enum
export enum PaymentType {
  STRIPE = 'stripe',
  LEMON_SQUEEZY = 'lemon_squeezy'
}

// Checkout mode enum
export enum CheckoutMode {
  Payment = "payment",
  Subscription = "subscription",
}

// Customer interface
export interface PaymentCustomer {
  id: string;
  email: string;
  name: string;
}

// Invoice interface
export interface PaymentInvoice {
  customerId: string;
  planId: string;
  amount: number;
  receiptUrl: string;
}

// Checkout parameters interface
export interface CreateCheckoutParams {
  priceId: string;
  mode: CheckoutMode;
  successUrl: string;
  cancelUrl?: string;
  user?: {
    id?: string;
    email?: string;
    name?: string;
    customerId?: string;
  };
}

// Payment adapter interface
export interface PaymentAdapterInterface {
  verifyWebhookSignature(req: ArrayBuffer): void;
  mapWebhookType(webhook: any): string;
  mapToCheckout(webhook: any): Promise<any>;
  mapToSubscription(webhook: any): Promise<any>;
  mapToRefund(webhook: any): Promise<any>;
  createCheckoutSessionUrl(checkoutParams: CreateCheckoutParams): Promise<string>;
  createCustomerPortalUrl(customerId: string, returnUrl: string): Promise<string>;
}