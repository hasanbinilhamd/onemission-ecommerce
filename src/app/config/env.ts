// ─── Environment configuration ────────────────────────────────────────────────
// Centralised access to Vite environment variables.
// Add VITE_* variables to .env and reference them here — never inline them.

export const env = {
  apiBaseUrl: (import.meta.env['VITE_API_BASE_URL'] as string | undefined) ?? '',
  supabaseUrl: (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ?? '',
  supabaseAnonKey: (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ?? '',
  rajaOngkirApiKey: (import.meta.env['VITE_RAJAONGKIR_API_KEY'] as string | undefined) ?? '',
  rajaOngkirBaseUrl: (import.meta.env['VITE_RAJAONGKIR_BASE_URL'] as string | undefined) ?? '',
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
