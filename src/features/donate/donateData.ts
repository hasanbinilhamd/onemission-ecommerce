/**
 * Donate — static campaign content.
 *
 * The architecture is campaign-first: the active cause is a swappable data
 * object, NOT a hard-coded page concept. Any future verified need (flood
 * relief, pesantren equipment, athlete support, ...) can replace
 * ACTIVE_CAMPAIGN without changing the page structure.
 *
 * All values are static MVP presentation data — no fundraising backend
 * exists. Numbers are placeholders until verified by real mission reports.
 *
 * Imagery constraint: all human imagery is full-silhouette composition —
 * no visible human faces or eyes.
 */

import { Building2, Dumbbell, Shirt, Users, type LucideIcon } from 'lucide-react';

export interface DonatePartner {
  name: string;
  tagline: string;
  statement: string;
}

export interface ActiveCampaign {
  id: string;
  statusLabel: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  partner: DonatePartner;
  raised: number;
  target: number;
  progressPercent: number;
  donors: number;
  beneficiaries: number;
  daysLeft: number;
}

export const ACTIVE_CAMPAIGN: ActiveCampaign = {
  id: 'flood-kalimantan',
  statusLabel: 'URGENT',
  title: 'SUPPORT FLOOD VICTIMS IN KALIMANTAN',
  description:
    "We're working with AkSiL to provide essential needs for families affected by the flood.",
  image: '/images/donate/donate-campaign.jpg',
  imageAlt: 'Silhouettes of relief volunteers carrying aid boxes through floodwater.',
  partner: {
    name: 'AKSIL',
    tagline: 'Bersama, Peduli, Beraksi.',
    statement: 'Working with trusted partners to deliver support where it is needed.',
  },
  raised: 127_450_000,
  target: 250_000_000,
  progressPercent: 51,
  donors: 1245,
  beneficiaries: 2350,
  daysLeft: 5,
};

export const SUPPORT_PRESET_AMOUNTS = [25_000, 50_000, 100_000, 250_000] as const;

export const CUSTOM_AMOUNT_KEY = 'custom' as const;

export const SUPPORT_AREAS: readonly { id: string; icon: LucideIcon; title: string; description: string }[] = [
  { id: 'sportswear', icon: Shirt, title: 'SPORTSWEAR', description: 'Providing appropriate sportswear.' },
  { id: 'facilities', icon: Building2, title: 'FACILITIES', description: 'Supporting training facilities.' },
  { id: 'training', icon: Dumbbell, title: 'TRAINING', description: 'Supporting training programs.' },
  { id: 'community', icon: Users, title: 'COMMUNITY', description: 'Supporting community development.' },
];

/** Static MVP placeholders — verified numbers will replace these over time. */
export const IMPACT_CARDS: readonly { image: string; alt: string; label: string }[] = [
  {
    image: '/images/donate/donate-equip.jpg',
    alt: 'Silhouettes of two people passing a folded garment at dawn.',
    label: '50 SANTRI EQUIPPED',
  },
  {
    image: '/images/journal/journal-featured.jpg',
    alt: 'Silhouettes of Muslim athletes in a huddle on a pitch at dawn.',
    label: '100 ATHLETES SUPPORTED',
  },
  {
    image: '/images/journal/journal-community.jpg',
    alt: 'Silhouettes of a football team in a huddle at dusk.',
    label: '1 COMMUNITY BUILT',
  },
];

export const TRANSPARENCY_STATS: readonly { label: string; value: string }[] = [
  { label: 'TOTAL RAISED', value: 'Rp25.000.000' },
  { label: 'USED', value: 'Rp23.500.000' },
  { label: 'REMAINING', value: 'Rp1.500.000' },
];

export const COMPLETED_CAMPAIGNS: readonly {
  image: string;
  alt: string;
  number: string;
  title: string;
  description: string;
}[] = [
  {
    image: '/images/journal/journal-santri.jpg',
    alt: 'Silhouettes of santri walking across a pesantren courtyard at dusk.',
    number: 'MISSION 001',
    title: '50 SANTRI EQUIPPED',
    description: 'Sportswear and training support delivered to santri.',
  },
  {
    image: '/images/journal/journal-featured.jpg',
    alt: 'Silhouettes of Muslim athletes in a huddle on a pitch at dawn.',
    number: 'MISSION 002',
    title: '100 ATHLETES SUPPORTED',
    description: 'One hundred Muslim athletes moving with purpose.',
  },
];
