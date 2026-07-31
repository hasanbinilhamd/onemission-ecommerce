import { env } from '../../app/config/env';
import type { PromotionValidationResponse } from '../../types';

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new Error('Commerce API base URL is not configured.');
  }

  return apiBaseUrl;
}

export async function validatePromotion(
  payload: {
    code: string;
    customerEmail?: string;
    subtotal: number;
    shippingCost: number;
  },
  accessToken = '',
): Promise<PromotionValidationResponse> {
  const response = await fetch(`${getApiBaseUrl()}/promotions/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error || 'Promotion could not be validated.');
  }

  return result as PromotionValidationResponse;
}
