import { env } from '../../app/config/env';

export interface CheckoutSessionPayload {
  customerId?: string;
  customer?: {
    customerName: string;
    email: string;
    phone: string;
    customerType?: string;
  };
  salesChannelId?: string;
  currency: string;
  discount: number;
  tax: number;
  courier: string;
  items: Array<{
    productId: string;
    variantId: string;
    qty: number;
    weight: number;
  }>;
  shipping: {
    originDistrict: string;
    destinationDistrict: string;
    weight: number;
    cost: number;
    service: string;
    description: string;
    estimatedDelivery: string;
  };
  address: {
    recipientName: string;
    phone: string;
    provinceId: string;
    cityId: string;
    districtId: string;
    postalCode: string;
    streetAddress: string;
  };
}

export interface CheckoutSessionResponse {
  id: string;
}

export interface PaymentAttemptResponse {
  id: string;
  status: string;
  providerReference?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new Error('Commerce API base URL is not configured.');
  }

  return apiBaseUrl;
}

async function fetchJson<T>(path: string, init?: RequestInit, accessToken = ''): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  headers.set('Accept', 'application/json');

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Checkout request failed.');
  }

  return payload as T;
}

export async function createCheckoutSession(
  payload: CheckoutSessionPayload,
  accessToken = '',
): Promise<CheckoutSessionResponse> {
  return fetchJson<CheckoutSessionResponse>('/checkout/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function createPaymentAttempt(checkoutSessionId: string): Promise<PaymentAttemptResponse> {
  return fetchJson<PaymentAttemptResponse>('/payment-attempt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ checkoutSessionId }),
  });
}

export async function generateSnapToken(paymentAttemptId: string): Promise<PaymentAttemptResponse> {
  return fetchJson<PaymentAttemptResponse>(`/payment-attempt/${paymentAttemptId}/snap`, {
    method: 'POST',
  });
}
