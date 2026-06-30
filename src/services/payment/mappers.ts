import type {
  PaymentCancellation,
  PaymentProviderCancellationDto,
  PaymentProviderSessionDto,
  PaymentProviderStatusDto,
  PaymentSession,
} from './types';

export function mapPaymentSession(dto: PaymentProviderSessionDto): PaymentSession {
  return {
    id: dto.session_id,
    provider: dto.provider_name,
    checkoutToken: dto.session_token,
    amount: dto.gross_amount,
    currency: dto.currency_code,
    status: dto.payment_status,
    redirectUrl: dto.redirect_url,
    createdAt: dto.created_at,
  };
}

export function mapPaymentStatus(dto: PaymentProviderStatusDto): PaymentSession['status'] {
  return dto.payment_status;
}

export function mapPaymentCancellation(dto: PaymentProviderCancellationDto): PaymentCancellation {
  return {
    id: dto.session_id,
    status: dto.payment_status,
    cancelledAt: dto.cancelled_at,
  };
}
