import {
  mapPaymentCancellation,
  mapPaymentSession,
  mapPaymentStatus,
} from './mappers';
import type {
  CreatePaymentSessionInput,
  PaymentCancellation,
  PaymentProvider,
  PaymentSession,
} from './types';

/**
 * Application-facing payment service.
 *
 * Future Midtrans Snap support should be implemented by swapping providers in
 * this module without changing Checkout components.
 */
export class PaymentService {
  constructor(private readonly provider: PaymentProvider) {}

  async createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentSession> {
    const response = await this.provider.createPaymentSession(input);
    return mapPaymentSession(response);
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentSession['status']> {
    const response = await this.provider.getPaymentStatus(sessionId);
    return mapPaymentStatus(response);
  }

  async cancelPayment(sessionId: string): Promise<PaymentCancellation> {
    const response = await this.provider.cancelPayment(sessionId);
    return mapPaymentCancellation(response);
  }
}
