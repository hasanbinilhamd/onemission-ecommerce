import { env } from '../../app/config/env';

interface CustomerRecord {
  id: string;
}

interface SalesChannelRecord {
  id: string;
  channelName?: string;
  isDefault?: boolean;
  status?: string;
}

export interface CheckoutSessionPayload {
  customerId: string;
  salesChannelId: string;
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

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Checkout request failed.');
  }

  return payload as T;
}

let cachedSalesChannelId = '';

export async function findOrCreateCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<string> {
  const customerName = `${input.firstName} ${input.lastName}`.trim();
  const customer = await fetchJson<CustomerRecord>('/customers/find-or-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName,
      email: input.email,
      phone: input.phone,
      customerType: 'Individual',
    }),
  });

  return customer.id;
}

export async function getDefaultSalesChannelId(): Promise<string> {
  if (cachedSalesChannelId) {
    return cachedSalesChannelId;
  }

  const channels = await fetchJson<SalesChannelRecord[]>('/saleschannels?status=Active');
  const selected = channels.find((channel) => channel.isDefault)
    || channels.find((channel) => String(channel.channelName || '').toLowerCase() === 'website')
    || channels[0];

  if (!selected?.id) {
    throw new Error('No active sales channel is available for checkout.');
  }

  cachedSalesChannelId = selected.id;
  return selected.id;
}

export async function createCheckoutSession(payload: CheckoutSessionPayload): Promise<CheckoutSessionResponse> {
  return fetchJson<CheckoutSessionResponse>('/checkout/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
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
