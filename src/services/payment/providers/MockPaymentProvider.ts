import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentProviderCancellationDto,
  PaymentProviderSessionDto,
  PaymentProviderStatusDto,
} from '../types';

export class MockPaymentProvider implements PaymentProvider {
  async createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentProviderSessionDto> {
    return Promise.resolve({
      session_id: `mock-session-${input.orderReference}`,
      provider_name: 'Mock Payment Provider',
      session_token: `mock-token-${input.orderReference}`,
      gross_amount: input.amount,
      currency_code: input.currency,
      payment_status: 'pending',
      redirect_url: '/checkout',
      created_at: new Date().toISOString(),
    });
  }

  async getPaymentStatus(sessionId: string): Promise<PaymentProviderStatusDto> {
    return Promise.resolve({
      session_id: sessionId,
      payment_status: 'pending',
    });
  }

  async cancelPayment(sessionId: string): Promise<PaymentProviderCancellationDto> {
    return Promise.resolve({
      session_id: sessionId,
      payment_status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  }
}
