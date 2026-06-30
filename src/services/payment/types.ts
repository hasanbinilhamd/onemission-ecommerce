export type PaymentStatus = 'pending' | 'authorized' | 'cancelled';

export interface CreatePaymentSessionInput {
  amount: number;
  currency: string;
  orderReference: string;
  customerEmail?: string;
}

export interface PaymentSession {
  id: string;
  provider: string;
  checkoutToken: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  redirectUrl?: string;
  createdAt: string;
}

export interface PaymentCancellation {
  id: string;
  status: PaymentStatus;
  cancelledAt: string;
}

export interface PaymentProviderSessionDto {
  session_id: string;
  provider_name: string;
  session_token: string;
  gross_amount: number;
  currency_code: string;
  payment_status: PaymentStatus;
  redirect_url?: string;
  created_at: string;
}

export interface PaymentProviderStatusDto {
  session_id: string;
  payment_status: PaymentStatus;
}

export interface PaymentProviderCancellationDto {
  session_id: string;
  payment_status: PaymentStatus;
  cancelled_at: string;
}

export interface PaymentProvider {
  createPaymentSession(input: CreatePaymentSessionInput): Promise<PaymentProviderSessionDto>;
  getPaymentStatus(sessionId: string): Promise<PaymentProviderStatusDto>;
  cancelPayment(sessionId: string): Promise<PaymentProviderCancellationDto>;
}
