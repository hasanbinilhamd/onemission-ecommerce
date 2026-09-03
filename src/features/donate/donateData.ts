/**
 * Donate — UI constants only.
 *
 * Donation content (campaigns, totals, donors) comes exclusively from the
 * HQ Donate CMS/public API — no static campaign data lives here anymore.
 * These preset amounts are part of the approved donation form UI.
 */

export const SUPPORT_PRESET_AMOUNTS = [25_000, 50_000, 100_000, 250_000] as const;

export const CUSTOM_AMOUNT_KEY = 'custom' as const;
