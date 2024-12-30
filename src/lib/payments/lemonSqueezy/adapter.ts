import crypto from "crypto";
import {
  PaymentEvent,
  PaymentRefund,
  PaymentCheckout,
  PaymentSubscription,
} from "../webhook.types";
import {
  createCheckout,
  lemonSqueezySetup,
  NewCheckout,
  NewWebhook,
  Order,
  getCustomer,
} from "@lemonsqueezy/lemonsqueezy.js";
import {
  PaymentAdapterInterface,
  CreateCheckoutParams,
} from "../payment.types";
import { headers } from "next/headers";

declare type WebhookType = NewWebhook["events"][number];
interface CustomData {
  client_reference_id: string;
  plan_id: string;
}

interface LemonSqueezeOrderWebhook extends Order {
  meta: { custom_data: CustomData };
}

export class LemonSqueezeAdapter implements PaymentAdapterInterface {
  constructor() {
    lemonSqueezySetup({
      apiKey: process.env.LEMON_SQUEEZY_API_KEY,
      onError: (error) => console.error("Error!", error),
    });
  }

  verifyWebhookSignature(rawBody: ArrayBuffer) {
    const signature = headers().get("x-signature");
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "";

    if (!verifySignature(rawBody, signature, secret)) {
      throw new Error("Invalid signature.");
    }
  }

  /*  
  /  Checkout all webook types and explanations at
  /  https://docs.lemonsqueezy.com/help/webhooks#event-types
  */
  mapWebhookType(webhook: any): PaymentEvent {
    const webhookType = webhook.meta.event_name as WebhookType;

    switch (webhookType) {
      case "order_created":
        return PaymentEvent.CHECKOUT_COMPLETED;
      case "order_refunded":
        return PaymentEvent.FULL_OR_PARTIAL_REFUND;
      case "subscription_updated":
        return PaymentEvent.SUBSCRIPTION_UPDATED;
      case "subscription_expired":
        return PaymentEvent.SUBSCRIPTION_ENDED;
      default:
        return PaymentEvent.NOT_MAPPED;
    }
  }

  async mapToCheckout(
    webhook: LemonSqueezeOrderWebhook
  ): Promise<PaymentCheckout> {
    return Promise.resolve({
      customerId: webhook.data.attributes.customer_id.toString(),
      customerEmail: webhook.data.attributes.user_email,
      customerName: webhook.data.attributes.user_name,
      userId: webhook.meta.custom_data.client_reference_id,
      planId: webhook.meta.custom_data.plan_id,
      purchasedAt: webhook.data.attributes.created_at,
      productName: webhook.data.attributes.first_order_item.product_name,
      amount: webhook.data.attributes.total,
      receiptUrl: webhook.data.attributes.urls.receipt,
    });
  }

  async mapToSubscription(
    webhook: LemonSqueezeOrderWebhook
  ): Promise<PaymentSubscription> {
    return {
      customerId: webhook.data.attributes.customer_id.toString(),
      planId: webhook.meta.custom_data.plan_id,
      amount: webhook.data.attributes.total,
      receiptUrl: webhook.data.attributes.urls.receipt,
    };
  }

  mapToRefund(webhook: LemonSqueezeOrderWebhook): Promise<PaymentRefund> {
    return Promise.resolve({
      amount: webhook.data.attributes.total,
      refundDate: webhook.data.attributes.refunded_at as unknown as string,
      receiptUrl: webhook.data.attributes.urls.receipt,
    });
  }

  async createCheckoutSessionUrl(
    checkoutParams: CreateCheckoutParams
  ): Promise<string> {
    const { successUrl, user, priceId } = checkoutParams;
    const [storeId, variantId] = priceId.split("-");
    const customData: CustomData = {
      client_reference_id: user?.id,
      plan_id: priceId,
    };

    const newCheckout: NewCheckout = {
      productOptions: {
        redirectUrl: successUrl,
      },
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
      },
      checkoutData: {
        email: user?.email,
        name: user?.name,

        // Need to be snake_case
        custom: customData as any,
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      preview: true,
      testMode: true,
    };
    const {
      statusCode,
      error,
      data: checkoutResponse,
    } = await createCheckout(storeId, variantId, newCheckout);

    if (error) {
      throw new Error(`Error creating checkout: ${error}`);
    }

    return checkoutResponse.data.attributes.url;
  }

  async createCustomerPortalUrl(
    customerId: string,
    returnUrl: string
  ): Promise<string> {
    const response = await getCustomer(customerId);
    if (!response.data?.data) {
      throw new Error(`Error creating LemonSqeezy portal: ${response.error}`);
    }

    return response.data.data.attributes.urls.customer_portal;
  }
}

function verifySignature(
  rawBody: ArrayBuffer,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const buffer = Buffer.from(new Uint8Array(rawBody));
  const digest = Buffer.from(hmac.update(buffer).digest("hex"), "utf8");
  const receivedSignature = Buffer.from(signature, "utf8");

  return crypto.timingSafeEqual(digest, receivedSignature);
}
