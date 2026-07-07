import type { Customer, CustomerAddress } from '../../types';
import { env } from '../../app/config/env';
import type { CustomerAuthCustomer } from '../auth/customerAuthService';

interface EnsureCustomerRecordInput {
  fullName: string;
  email: string;
  phone: string;
}

interface CustomerRecordResponse {
  id: string;
}

interface UpdateCustomerProfileInput {
  customerName: string;
  email: string;
  phone: string;
  accessToken?: string;
}

export interface CustomerAddressInput {
  recipientName: string;
  phoneNumber: string;
  provinceId: string;
  province: string;
  cityId: string;
  city: string;
  districtId: string;
  district: string;
  postalCode: string;
  streetAddress: string;
  notes?: string;
  isDefault?: boolean;
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) {
    throw new Error('Commerce API base URL is not configured.');
  }

  return apiBaseUrl;
}

function buildHeaders(accessToken = '', headers: HeadersInit = {}) {
  const resolvedHeaders = new Headers(headers);
  resolvedHeaders.set('Accept', 'application/json');

  if (accessToken) {
    resolvedHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  return resolvedHeaders;
}

async function fetchJson<T>(path: string, init?: RequestInit, accessToken = ''): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(accessToken, init?.headers),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Customer request failed.');
  }

  return payload as T;
}

function mapCustomerAuthCustomer(payload: Record<string, unknown>): CustomerAuthCustomer {
  return {
    id: String(payload.id || ''),
    customerCode: String(payload.customerCode || ''),
    customerName: String(payload.customerName || ''),
    email: String(payload.email || ''),
    phone: String(payload.phone || ''),
    avatarUrl: String(payload.avatarUrl || ''),
    emailVerified: Boolean(payload.emailVerified),
    authProvider: String(payload.authProvider || 'LOCAL'),
    lastLoginAt: payload.lastLoginAt ? String(payload.lastLoginAt) : null,
    createdAt: String(payload.createdAt || ''),
    updatedAt: String(payload.updatedAt || ''),
    country: payload.country ? String(payload.country) : '',
    provinceId: payload.provinceId ? String(payload.provinceId) : '',
    province: payload.province ? String(payload.province) : '',
    cityId: payload.cityId ? String(payload.cityId) : '',
    city: payload.city ? String(payload.city) : '',
    districtId: payload.districtId ? String(payload.districtId) : '',
    district: payload.district ? String(payload.district) : '',
    postalCode: payload.postalCode ? String(payload.postalCode) : '',
    streetAddress: payload.streetAddress ? String(payload.streetAddress) : '',
  };
}

function mapCustomerAddress(payload: Record<string, unknown>): CustomerAddress {
  return {
    id: String(payload.id || ''),
    customerId: String(payload.customerId || ''),
    recipientName: String(payload.recipientName || ''),
    phoneNumber: String(payload.phoneNumber || ''),
    provinceId: String(payload.provinceId || ''),
    province: String(payload.province || ''),
    cityId: String(payload.cityId || ''),
    city: String(payload.city || ''),
    districtId: String(payload.districtId || ''),
    district: String(payload.district || ''),
    postalCode: String(payload.postalCode || ''),
    streetAddress: String(payload.streetAddress || ''),
    notes: String(payload.notes || ''),
    isDefault: Boolean(payload.isDefault),
    createdAt: String(payload.createdAt || ''),
    updatedAt: String(payload.updatedAt || ''),
  };
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

export async function getCustomerProfile(accessToken = ''): Promise<CustomerAuthCustomer> {
  const payload = await fetchJson<Record<string, unknown>>('/customer/profile', {
    method: 'GET',
  }, accessToken);

  return mapCustomerAuthCustomer(payload);
}

export async function updateCustomerProfile(
  data: UpdateCustomerProfileInput,
): Promise<CustomerAuthCustomer> {
  const payload = await fetchJson<Record<string, unknown>>('/customer/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
    }),
  }, data.accessToken || '');

  return mapCustomerAuthCustomer(payload);
}

export async function listCustomerAddresses(accessToken = ''): Promise<CustomerAddress[]> {
  const payload = await fetchJson<Record<string, unknown>[]>('/customer/addresses', {
    method: 'GET',
  }, accessToken);

  return payload.map(mapCustomerAddress);
}

export async function createCustomerAddress(input: CustomerAddressInput, accessToken = ''): Promise<CustomerAddress> {
  const payload = await fetchJson<Record<string, unknown>>('/customer/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }, accessToken);

  return mapCustomerAddress(payload);
}

export async function updateCustomerAddress(addressId: string, input: CustomerAddressInput, accessToken = ''): Promise<CustomerAddress> {
  const payload = await fetchJson<Record<string, unknown>>(`/customer/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }, accessToken);

  return mapCustomerAddress(payload);
}

export async function deleteCustomerAddress(addressId: string, accessToken = ''): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>(`/customer/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
  }, accessToken);
}

export async function setDefaultCustomerAddress(addressId: string, accessToken = ''): Promise<CustomerAddress> {
  const payload = await fetchJson<Record<string, unknown>>(`/customer/addresses/${encodeURIComponent(addressId)}/default`, {
    method: 'POST',
  }, accessToken);

  return mapCustomerAddress(payload);
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
