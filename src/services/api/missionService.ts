import { env } from '../../app/config/env';
import { loadStoredCustomerAuthTokens } from '../auth/customerAuthStorage';

/**
 * Movement Mission API client.
 *
 * Consumes the public HQ Mission endpoints through the existing ecommerce
 * proxy (/api/movement/mission). Voting goes through the server-side API —
 * the server determines the open mission, option validity, and duplicate
 * votes; the client only sends the selected option id.
 */

export interface MissionPageContent {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  startDate: string | null;
  endDate: string | null;
}

export interface MissionOptionPayload {
  id: string;
  title: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive?: boolean;
}

export interface MissionResultRow {
  optionId: string;
  votes: number;
  percentage: number;
}

export interface MissionPayload {
  mission: MissionPageContent;
  options: MissionOptionPayload[];
  results: MissionResultRow[];
  totalVotes: number;
}

export class MissionServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'MissionServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getBaseUrl(): string {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  return apiBaseUrl ? `${apiBaseUrl}/movement/mission` : '';
}

async function fetchJson<T>(path = '', init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new MissionServiceError('Mission API base URL is not configured.', 'MISSION_API_CONFIGURATION_MISSING', 500);
  }

  const normalizedPath = String(path || '').trim().replace(/^\/+/, '');
  const url = normalizedPath ? `${baseUrl}/${normalizedPath}` : baseUrl;

  try {
    const response = await fetch(url, {
      ...init,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    });

    if (!response.ok) {
      let payload: { error?: string; code?: string } | null = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      throw new MissionServiceError(
        payload?.error || 'The mission request could not be completed.',
        payload?.code || 'MISSION_API_ERROR',
        response.status,
      );
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof MissionServiceError) {
      throw error;
    }

    throw new MissionServiceError('Unable to connect to the Mission API.', 'MISSION_NETWORK_ERROR', 503);
  }
}

export const missionService = {
  async getMission(): Promise<MissionPayload> {
    return fetchJson<MissionPayload>();
  },

  async vote(missionOptionId: string): Promise<MissionPayload> {
    const tokens = loadStoredCustomerAuthTokens();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (tokens.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    return fetchJson<MissionPayload>('vote', {
      method: 'POST',
      headers,
      body: JSON.stringify({ missionOptionId }),
    });
  },
};
