import { useEffect, useState } from 'react';
import { donationService, type DonatePayload } from '../../services/api/donationService';
import { ACTIVE_CAMPAIGN, type ActiveCampaign } from './donateData';

/**
 * Shared Donate data hook.
 *
 * Fetches the public HQ Donate payload once and maps it into the SAME shape
 * the existing Donate pages consume. When the API is unavailable, the
 * previously approved static content (ACTIVE_CAMPAIGN) renders as fallback —
 * the page remains visually equivalent.
 */

export interface DonateCmsMapped {
  isFallback: boolean;
  payload: DonatePayload | null;
  campaign: ActiveCampaign;
}

function mapPayloadToCampaign(payload: DonatePayload): ActiveCampaign | null {
  const summary = payload.campaign;
  if (!summary) return null;

  const partner = payload.partners[0] ?? null;
  const story = payload.story ?? null;

  return {
    id: summary.id,
    statusLabel: summary.status === 'CLOSED' ? 'CLOSED' : 'URGENT',
    title: summary.title,
    description: summary.shortDescription,
    image: summary.coverImage,
    imageAlt: summary.title,
    partner: partner
      ? { name: partner.name, tagline: partner.tagline, statement: partner.statement }
      : { name: '', tagline: '', statement: '' },
    raised: summary.raised,
    target: summary.targetAmount,
    progressPercent: summary.progressPercent,
    donors: summary.donorCount,
    beneficiaries: 0,
    daysLeft: 0,
    story: story
      ? {
          title: story.title || 'CERITA PENGGALANGAN DANA',
          image: summary.coverImage,
          imageAlt: summary.title,
          content: String(story.content || '')
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean),
        }
      : { title: '', image: summary.coverImage, imageAlt: summary.title, content: [] },
    updates: (payload.updates ?? []).map((update) => ({
      id: update.id,
      date: new Date(update.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      title: update.title,
      image: update.image,
      imageAlt: update.imageAlt,
    })),
    disbursements: (payload.disbursements ?? []).map((item) => ({
      id: item.id,
      date: new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      title: item.title,
      amount: item.amount,
      partnerName: item.partnerName,
      image: item.image,
      imageAlt: item.imageAlt,
    })),
    donorsList: (payload.highlights ?? []).map((donation) => ({
      id: donation.id,
      name: donation.donorName,
      amount: donation.amount,
      timeAgo: new Date(donation.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      dateTimestamp: new Date(donation.createdAt).getTime(),
    })),
  };
}

export function useDonateCms(): DonateCmsMapped {
  const [payload, setPayload] = useState<DonatePayload | null>(null);

  useEffect(() => {
    let isActive = true;
    donationService
      .getDonate()
      .then((result) => {
        if (isActive) setPayload(result);
      })
      .catch(() => {
        // API unavailable → approved fallback stays rendered.
      });
    return () => {
      isActive = false;
    };
  }, []);

  const mapped = payload ? mapPayloadToCampaign(payload) : null;
  return {
    isFallback: !mapped,
    payload,
    campaign: mapped ?? ACTIVE_CAMPAIGN,
  };
}
