const ACCESS_TOKEN_STORAGE_KEY = 'onemission-customer-access-token';
const REFRESH_TOKEN_STORAGE_KEY = 'onemission-customer-refresh-token';
const PENDING_REGISTRATION_STORAGE_KEY = 'onemission-pending-registration';

export interface StoredCustomerAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface StoredPendingRegistration {
  email: string;
  resendAvailableAt: string;
  expiresAt: string;
}

export function loadStoredCustomerAuthTokens(): StoredCustomerAuthTokens {
  if (typeof window === 'undefined') {
    return { accessToken: '', refreshToken: '' };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || '',
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || '',
  };
}

export function persistCustomerAuthTokens(tokens: StoredCustomerAuthTokens) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearStoredCustomerAuthTokens() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function loadStoredPendingRegistration(): StoredPendingRegistration {
  if (typeof window === 'undefined') {
    return { email: '', resendAvailableAt: '', expiresAt: '' };
  }

  const rawValue = window.sessionStorage.getItem(PENDING_REGISTRATION_STORAGE_KEY) || '';
  if (!rawValue) {
    return { email: '', resendAvailableAt: '', expiresAt: '' };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredPendingRegistration>;
    return {
      email: String(parsed.email || ''),
      resendAvailableAt: String(parsed.resendAvailableAt || ''),
      expiresAt: String(parsed.expiresAt || ''),
    };
  } catch {
    return { email: '', resendAvailableAt: '', expiresAt: '' };
  }
}

export function persistStoredPendingRegistration(input: StoredPendingRegistration) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(PENDING_REGISTRATION_STORAGE_KEY, JSON.stringify(input));
}

export function clearStoredPendingRegistration() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
}
