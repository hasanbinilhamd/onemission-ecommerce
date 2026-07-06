const ACCESS_TOKEN_STORAGE_KEY = 'onemission-customer-access-token';
const REFRESH_TOKEN_STORAGE_KEY = 'onemission-customer-refresh-token';

export interface StoredCustomerAuthTokens {
  accessToken: string;
  refreshToken: string;
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
