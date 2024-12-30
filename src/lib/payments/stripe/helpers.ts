import { User } from "@/libs/database/types";
import { CheckoutMode } from "../payment.types";

export const getExtraParams = (user: User, mode: CheckoutMode): any => {
  const extraParams: any = {};

  if (user?.customerId) {
    extraParams.customer = user.customerId;
  } else {
    if (mode === CheckoutMode.Payment) {
      extraParams.customer_creation = "always";
      extraParams.payment_intent_data = { setup_future_usage: "on_session" };
    }
    if (user?.email) {
      extraParams.customer_email = user.email;
    }
    extraParams.tax_id_collection = { enabled: true };
  }

  return extraParams;
};
