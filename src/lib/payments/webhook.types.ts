export enum PaymentEvent {
  CHECKOUT_COMPLETED = "CHECKOUT_SUCCESSFUL",
  CHECKOUT_EXPIRED = "CHECKOUT_EXPIRED",
  SUBSCRIPTION_UPDATED = "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_ENDED = "SUBSCRIPTION_DELETED",
  FULL_OR_PARTIAL_REFUND = "REFUNDED",
  NOT_MAPPED = "NOT_MAPPED",
}

interface WebhookEvent<T, D> {
  type: T;
  data: D;
}

export type PaymentWebhookEvent =
  | WebhookEvent<PaymentEvent.CHECKOUT_COMPLETED | PaymentEvent.CHECKOUT_EXPIRED, PaymentCheckout>
  | WebhookEvent<PaymentEvent.SUBSCRIPTION_UPDATED | PaymentEvent.SUBSCRIPTION_ENDED, PaymentSubscription>
  | WebhookEvent<PaymentEvent.FULL_OR_PARTIAL_REFUND, PaymentRefund>
  | WebhookEvent<PaymentEvent.NOT_MAPPED, {}>;

export interface PaymentCheckout {
  customerId: string;
  customerEmail: string;
  customerName: string;
  userId: string;
  planId: string;
  purchasedAt: string;
  productName: string;
}

export interface PaymentSubscription extends Receipt {
  customerId: string;
  planId: string;
}

export interface PaymentRefund extends Receipt {
  refundDate: string;
}

interface Receipt {
  receiptUrl: string;
  amount: number;
}

export { PaymentEvent as default };