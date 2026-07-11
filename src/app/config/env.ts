// ─── Environment configuration ────────────────────────────────────────────────
// Centralised access to Vite environment variables.
// Add VITE_* variables to .env and reference them here — never inline them.

export const env = {
  apiBaseUrl: '/api',
  midtransClientKey: (import.meta.env['VITE_MIDTRANS_CLIENT_KEY'] as string | undefined) ?? '',
  midtransIsProduction: ((import.meta.env['VITE_MIDTRANS_IS_PRODUCTION'] as string | undefined) ?? '').trim().toLowerCase() === 'true',
  googleClientId: (import.meta.env['VITE_GOOGLE_CLIENT_ID'] as string | undefined) ?? '',
  rajaOngkirApiKey: (import.meta.env['VITE_RAJAONGKIR_API_KEY'] as string | undefined) ?? '',
  rajaOngkirBaseUrl: (import.meta.env['VITE_RAJAONGKIR_BASE_URL'] as string | undefined) ?? '',
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
