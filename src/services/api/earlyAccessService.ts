import { env } from '../../app/config/env';

export interface EarlyAccessStatus {
  enabled: boolean;
  chapter: string;
  authenticated: boolean;
}

function getApiBaseUrl() {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  if (!apiBaseUrl) throw new Error('Commerce API base URL is not configured.');
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
    throw new Error(payload?.error || 'Early Access request failed.');
  }
  return payload as T;
}

export async function getEarlyAccessStatus(): Promise<EarlyAccessStatus> {
  return fetchJson<EarlyAccessStatus>('/early-access/status');
}

export async function verifyEarlyAccessPassword(password: string): Promise<{ success: boolean; chapter: string }> {
  return fetchJson<{ success: boolean; chapter: string }>('/early-access/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}
