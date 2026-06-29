// ─── Environment configuration ────────────────────────────────────────────────
// Centralised access to Vite environment variables.
// Add VITE_* variables to .env and reference them here — never inline them.

export const env = {
  supabaseUrl: (import.meta.env['VITE_SUPABASE_URL'] as string | undefined) ?? '',
  supabaseAnonKey: (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined) ?? '',
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;
