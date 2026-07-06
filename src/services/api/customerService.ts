import type { Customer } from '../../types';
import { env } from '../../app/config/env';

interface EnsureCustomerRecordInput {
  fullName: string;
  email: string;
  phone: string;
}

interface CustomerRecordResponse {
  id: string;
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
    throw new Error(payload?.error || 'Customer request failed.');
  }

  return payload as T;
}

export async function ensureCustomerRecord(input: EnsureCustomerRecordInput): Promise<Customer> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  const payload = await fetchJson<CustomerRecordResponse>('/customers/find-or-create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: fullName,
      email,
      phone,
      customerType: 'Individual',
    }),
  });

  return {
    id: payload.id,
    name: fullName,
    email,
    phone,
  };
}

export async function getCustomer(id: string): Promise<Customer | null> {
  void id;
  return Promise.resolve(null);
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>,
): Promise<Customer | null> {
  void id;
  void data;
  return Promise.resolve(null);
}
