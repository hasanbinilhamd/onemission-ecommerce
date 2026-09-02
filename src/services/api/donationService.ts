import { env } from '../../app/config/env';

/**
 * Movement Donate API client.
 *
 * Consumes the public HQ Donate endpoints through the existing ecommerce
 * proxy (/api/movement/donate). Donations are GUEST transactions — no auth
 * required. Payment reuses the existing Midtrans Snap integration.
 *
 * Privacy: the public API only ever returns display name (or "Anonymous"),
 * amount, and date — never email/phone/payment references.
 */

export type DonationCampaignStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type DonationTransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export interface DonateCampaignSummary {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  status: DonationCampaignStatus;
  targetAmount: number;
  raised: number;
  donorCount: number;
  progressPercent: number;
  startedAt: string | null;
  endedAt: string | null;
}

export interface DonateHighlight {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string;
}

export interface DonatePartner {
  id: string;
  name: string;
  tagline: string;
  statement: string;
}

export interface DonatePayload {
  campaign: DonateCampaignSummary | null;
  story: { title: string; content: string } | null;
  updates: CampaignUpdateItem[];
  disbursements: CampaignDisbursementItem[];
  highlights: DonateHighlight[];
  partners: DonatePartner[];
  pastCampaigns: DonateCampaignSummary[];
  /** CMS section availability: AVAILABLE | COMING_SOON. */
  pageAvailability: 'AVAILABLE' | 'COMING_SOON';
}

export interface DonationListItem {
  id: string;
  donorName: string;
  amount: number;
  createdAt: string;
}

export interface DonationsPayload {
  items: DonationListItem[];
  total: number;
  hasMore: boolean;
}

export interface CampaignUpdateItem {
  id: string;
  title: string;
  date: string;
  image: string;
  imageAlt: string;
  displayOrder: number;
}

export interface CampaignDisbursementItem {
  id: string;
  title: string;
  date: string;
  amount: number;
  partnerName: string;
  image: string;
  imageAlt: string;
  displayOrder: number;
}

export interface CampaignDetailPayload {
  campaign: DonateCampaignSummary;
  story: { title: string; content: string };
  updates: CampaignUpdateItem[];
  disbursements: CampaignDisbursementItem[];
  partners: DonatePartner[];
  isActive: boolean;
  /** CMS section availability: AVAILABLE | COMING_SOON. */
  pageAvailability: 'AVAILABLE' | 'COMING_SOON';
}

export interface CreateDonationInput {
  amount: number;
  donorName?: string;
  anonymous?: boolean;
  donorEmail?: string;
  donorPhone?: string;
}

export interface CreateDonationResult {
  transactionNumber: string;
  snapToken: string;
  amount: number;
  status: DonationTransactionStatus;
}

export class DonationServiceError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = 'DonationServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getBaseUrl(): string {
  const apiBaseUrl = env.apiBaseUrl.trim().replace(/\/$/, '');
  return apiBaseUrl ? `${apiBaseUrl}/movement/donate` : '';
}

async function fetchJson<T>(path = '', init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new DonationServiceError('Donation API base URL is not configured.', 'DONATION_API_CONFIGURATION_MISSING', 500);
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
      throw new DonationServiceError(
        payload?.error || 'The donation request could not be completed.',
        payload?.code || 'DONATION_API_ERROR',
        response.status,
      );
    }

    return await response.json() as T;
  } catch (error) {
    if (error instanceof DonationServiceError) {
      throw error;
    }

    throw new DonationServiceError('Unable to connect to the Donation API.', 'DONATION_NETWORK_ERROR', 503);
  }
}

export const donationService = {
  async getDonate(): Promise<DonatePayload> {
    return fetchJson<DonatePayload>();
  },

  async getDonations(sort: 'LATEST' | 'LARGEST', offset = 0, limit = 10): Promise<DonationsPayload> {
    const query = new URLSearchParams({ sort, offset: String(offset), limit: String(limit) });
    return fetchJson<DonationsPayload>(`donations?${query.toString()}`);
  },

  async getCampaign(slug: string): Promise<CampaignDetailPayload> {
    return fetchJson<CampaignDetailPayload>(`campaigns/${encodeURIComponent(slug)}`);
  },

  async createDonation(input: CreateDonationInput): Promise<CreateDonationResult> {
    return fetchJson<CreateDonationResult>('transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },
};
