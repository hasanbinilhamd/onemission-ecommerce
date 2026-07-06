import { env } from '../../app/config/env';

export interface CustomerAuthCustomer {
  id: string;
  customerCode: string;
  customerName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  emailVerified: boolean;
  authProvider: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  country?: string;
  provinceId?: string;
  province?: string;
  cityId?: string;
  city?: string;
  districtId?: string;
  district?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface CustomerAuthSessionPayload {
  customer: CustomerAuthCustomer;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface CustomerAuthMePayload {
  customer: CustomerAuthCustomer;
  session: {
    id: string;
    customerId: string;
    device: string;
    browser: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: string;
    lastUsedAt: string;
    createdAt: string;
  };
}

export interface CustomerAuthRegisterInput {
  customerName: string;
  email: string;
  phone: string;
  password: string;
  device?: string;
}

export interface CustomerAuthLoginInput {
  email: string;
  password: string;
  device?: string;
}

export class CustomerAuthApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'CustomerAuthApiError';
    this.statusCode = statusCode;
  }
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
    throw new CustomerAuthApiError(payload?.error || 'Customer authentication request failed.', response.status);
  }

  return payload as T;
}

export async function registerCustomerAccount(input: CustomerAuthRegisterInput): Promise<CustomerAuthSessionPayload> {
  return fetchJson<CustomerAuthSessionPayload>('/customer/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function loginCustomerAccount(input: CustomerAuthLoginInput): Promise<CustomerAuthSessionPayload> {
  return fetchJson<CustomerAuthSessionPayload>('/customer/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function loginCustomerWithGoogle(input: { idToken: string; device?: string }): Promise<CustomerAuthSessionPayload> {
  return fetchJson<CustomerAuthSessionPayload>('/customer/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function refreshCustomerSession(input: { refreshToken: string; device?: string }): Promise<CustomerAuthSessionPayload> {
  return fetchJson<CustomerAuthSessionPayload>('/customer/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function logoutCustomerSession(input: { accessToken?: string; refreshToken?: string }): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>('/customer/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: input.refreshToken || '' }),
  }, input.accessToken || '');
}

export async function logoutAllCustomerSessions(accessToken: string): Promise<{ ok: true }> {
  return fetchJson<{ ok: true }>('/customer/auth/logout-all', {
    method: 'POST',
  }, accessToken);
}

export async function getCurrentAuthenticatedCustomer(accessToken: string): Promise<CustomerAuthMePayload> {
  return fetchJson<CustomerAuthMePayload>('/customer/auth/me', {
    method: 'GET',
  }, accessToken);
}
