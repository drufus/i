import { PaymentAdapter } from '../payments';

const paymentAdapter = new PaymentAdapter();

export const getStripe = () => {
  // This is now handled by the PaymentAdapter
  return null;
};