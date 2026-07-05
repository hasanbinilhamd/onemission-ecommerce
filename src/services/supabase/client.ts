import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { env } from '../../app/config/env';

let supabaseClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl.trim() && env.supabaseAnonKey.trim());
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient !== undefined) {
    return supabaseClient;
  }

  if (!isSupabaseConfigured()) {
    supabaseClient = null;
    return supabaseClient;
  }

  supabaseClient = createClient(env.supabaseUrl.trim(), env.supabaseAnonKey.trim());
  return supabaseClient;
}

export async function getAuthenticatedUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.getUser();
  if (error) {
    throw error;
  }

  return data.user ?? null;
}

export async function signOutAuthenticatedUser(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}
