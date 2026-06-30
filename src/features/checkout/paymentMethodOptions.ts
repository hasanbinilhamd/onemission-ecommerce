import type { CheckoutPaymentOption } from '../../types';

export const CHECKOUT_PAYMENT_OPTIONS: CheckoutPaymentOption[] = [
  {
    id: 'credit-card',
    label: 'Credit Card',
    description: 'Visa, Mastercard and JCB will be connected in a future sprint.',
  },
  {
    id: 'virtual-account',
    label: 'Virtual Account',
    description: 'Bank transfer confirmation will be activated in the next sprint.',
  },
  {
    id: 'qris',
    label: 'QRIS',
    description: 'QR payment confirmation will be connected in the next sprint.',
  },
  {
    id: 'e-wallet',
    label: 'E-Wallet',
    description: 'Digital wallet authorization will be available in the next sprint.',
  },
];
