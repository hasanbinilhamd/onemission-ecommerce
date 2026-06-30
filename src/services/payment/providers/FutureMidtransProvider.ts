import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentProviderCancellationDto,
  PaymentProviderSessionDto,
  PaymentProviderStatusDto,
} from '../types';

/**
 * Future Midtrans Snap integration point.
 *
 * Implement vendor-specific payloads, Snap token creation, status polling and
 * cancellation handling inside this provider only.
 */
export class FutureMidtransProvider implements PaymentProvider {
  async createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentProviderSessionDto> {
    void input;
    throw new Error('FutureMidtransProvider is not implemented in this sprint.');
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentProviderStatusDto> {
    void sessionId;
    throw new Error('FutureMidtransProvider is not implemented in this sprint.');
  }

  async cancelPayment(sessionId: string): Promise<PaymentProviderCancellationDto> {
    void sessionId;
    throw new Error('FutureMidtransProvider is not implemented in this sprint.');
  }
}
