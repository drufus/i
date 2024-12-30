import { User } from "@/libs/database/types";
import {
  PaymentEvent,
  PaymentRefund,
  PaymentCheckout,
  PaymentSubscription,
} from "./webhook.types";

export interface CreateCheckoutParams {
  priceId: string;
  mode: CheckoutMode;
  successUrl: string;
  cancelUrl?: string;
  user?: User;
}

export enum CheckoutMode {
  Payment = "payment",
  Subscription = "subscription",
}

export interface PaymentCustomer {
  id: string;
  email: string;
  name: string;
}

export interface PaymentInvoice extends PaymentSubscription {}

export interface PaymentAdapterInterface {
  verifyWebhookSignature(req: ArrayBuffer): void;
  mapWebhookType(webhook: any): PaymentEvent;
  mapToCheckout(webhook: any): Promise<PaymentCheckout>;
  mapToSubscription(webhook: any): Promise<PaymentSubscription>;
  mapToRefund(webhook: any): Promise<PaymentRefund>;

  createCheckoutSessionUrl(
    checkoutParams: CreateCheckoutParams
  ): Promise<string>;
  createCustomerPortalUrl(
    customerId: string,
    returnUrl: string
  ): Promise<string>;
}
