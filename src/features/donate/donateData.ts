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

export interface DonatePartner {
  name: string;
  tagline: string;
  statement: string;
}

export interface CampaignUpdate {
  id: string;
  date: string;
  title: string;
  image?: string;
  imageAlt?: string;
}

export interface CampaignDisbursement {
  id: string;
  date: string;
  title: string;
  amount: number;
  partnerName: string;
  image?: string;
  imageAlt?: string;
}

export interface CampaignDonor {
  id: string;
  name: string; // use "Anonymous" for anonymous
  amount: number;
  timeAgo: string; // e.g. "5 menit lalu"
  dateTimestamp: number; // for sorting
}

export interface CampaignStory {
  title: string;
  image: string;
  imageAlt: string;
  content: string[];
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
  story: CampaignStory;
  updates: CampaignUpdate[];
  disbursements: CampaignDisbursement[];
  donorsList: CampaignDonor[];
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
  story: {
    title: 'CERITA PENGGALANGAN DANA',
    image: '/images/donate/donate-hero.jpg',
    imageAlt: 'Silhouettes of a community working together in flood relief.',
    content: [
      'Bencana banjir yang melanda beberapa wilayah di Kalimantan telah menyebabkan ribuan keluarga harus mengungsi. Rumah-rumah terendam air, dan banyak fasilitas umum yang rusak parah.',
      'One Mission bersama AKSIL berkomitmen untuk menyalurkan bantuan kepada mereka yang paling membutuhkan. Bantuan ini akan difokuskan pada penyediaan bahan makanan pokok, air bersih, pakaian layak pakai, dan perlengkapan medis darurat.',
      'Melalui gerakan ini, kita ingin memastikan bahwa saudara-saudara kita di Kalimantan tidak merasa sendirian. Setiap donasi yang diberikan akan sangat berarti bagi mereka untuk kembali bangkit dan menata kehidupan pasca bencana.',
      'Mari bergerak bersama, tunjukkan kepedulian kita, dan jadikan bantuan ini sebagai wujud nyata dari ukhuwah islamiyah. Your support, their hope.'
    ]
  },
  updates: [
    {
      id: 'update-2',
      date: '28 AUG 2026',
      title: 'Bantuan tahap pertama telah disalurkan melalui partner kami.',
      image: '/images/donate/donate-campaign.jpg',
      imageAlt: 'Volunteers distributing aid'
    },
    {
      id: 'update-1',
      date: '26 AUG 2026',
      title: 'Pengumpulan bantuan telah mencapai 51% dari target.',
      image: '/images/donate/donate-equip.jpg',
      imageAlt: 'Volunteers preparing packages'
    }
  ],
  disbursements: [
    {
      id: 'disbursement-1',
      date: '24 AUG 2026',
      title: 'TAHAP 01',
      amount: 50_000_000,
      partnerName: 'AKSIL',
      image: '/images/donate/donate-equip.jpg',
      imageAlt: 'Aid package distribution'
    }
  ],
  donorsList: [
    { id: 'd1', name: 'Orang Baik', amount: 50_000, timeAgo: '5 menit lalu', dateTimestamp: 1693180000000 },
    { id: 'd2', name: 'Anonymous', amount: 25_000, timeAgo: '12 menit lalu', dateTimestamp: 1693179000000 },
    { id: 'd3', name: 'Ahmad', amount: 100_000, timeAgo: '18 menit lalu', dateTimestamp: 1693178000000 },
    { id: 'd4', name: 'Fachri', amount: 50_000, timeAgo: '24 menit lalu', dateTimestamp: 1693177000000 },
    { id: 'd5', name: 'Anonymous', amount: 500_000, timeAgo: '1 jam lalu', dateTimestamp: 1693175000000 },
    { id: 'd6', name: 'Budi', amount: 2_500_000, timeAgo: '3 jam lalu', dateTimestamp: 1693165000000 },
    { id: 'd7', name: 'Anonymous', amount: 5_000_000, timeAgo: '5 jam lalu', dateTimestamp: 1693155000000 },
    { id: 'd8', name: 'Zaki', amount: 1_000_000, timeAgo: '1 hari lalu', dateTimestamp: 1693055000000 },
    { id: 'd9', name: 'Orang Baik', amount: 10_000, timeAgo: '2 hari lalu', dateTimestamp: 1692955000000 },
    { id: 'd10', name: 'Fatimah', amount: 75_000, timeAgo: '2 hari lalu', dateTimestamp: 1692950000000 },
  ]
};

export const SUPPORT_PRESET_AMOUNTS = [25_000, 50_000, 100_000, 250_000] as const;

export const CUSTOM_AMOUNT_KEY = 'custom' as const;


