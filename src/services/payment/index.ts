import { serviceLayerConfig } from '../config';
import { PaymentService } from './PaymentService';
import { FutureMidtransProvider } from './providers/FutureMidtransProvider';
import { MockPaymentProvider } from './providers/MockPaymentProvider';
import type { PaymentProvider } from './types';

function createPaymentProvider(): PaymentProvider {
  if (serviceLayerConfig.providers.payment === 'future-midtrans') {
    return new FutureMidtransProvider();
  }

  return new MockPaymentProvider();
}

export const paymentService = new PaymentService(createPaymentProvider());

export { PaymentService } from './PaymentService';
export type {
  CreatePaymentSessionInput,
  PaymentCancellation,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
} from './types';
