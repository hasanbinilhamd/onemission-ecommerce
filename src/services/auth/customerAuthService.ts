import type { Session, User } from '@supabase/supabase-js';
import { ensureCustomerRecord } from '../api/customerService';
import { getSupabaseClient } from '../supabase/client';

export interface LoginCustomerInput {
  email: string;
  password: string;
}

export interface RegisterCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

interface CustomerAuthResult {
  user: User;
  session: Session | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.trim();
}

function mapSupabaseAuthError(error: unknown, fallbackMessage: string) {
  if (!(error instanceof Error)) {
    return new Error(fallbackMessage);
  }

  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return new Error('Invalid email or password.');
  }

  if (message.includes('user already registered') || message.includes('already registered')) {
    return new Error('An account with this email already exists.');
  }

  if (message.includes('password should be at least')) {
    return new Error(error.message);
  }

  if (message.includes('email not confirmed')) {
    return new Error('Your account email has not been confirmed yet.');
  }

  return new Error(error.message || fallbackMessage);
}

function resolveUserMetadataValue(user: User, key: string) {
  return String(user.user_metadata?.[key] || '').trim();
}

async function persistCustomerProfile(user: User, overrides: { fullName?: string; phone?: string } = {}) {
  const client = getSupabaseClient();
  if (!client || !user.email) {
    return user;
  }

  const fullName = (overrides.fullName || resolveUserMetadataValue(user, 'fullName') || resolveUserMetadataValue(user, 'full_name')).trim();
  const phone = normalizePhone(overrides.phone || resolveUserMetadataValue(user, 'phone'));
  const existingCustomerId = resolveUserMetadataValue(user, 'customerId') || resolveUserMetadataValue(user, 'customer_id');

  if (!fullName || !phone) {
    return user;
  }

  const customer = await ensureCustomerRecord({
    fullName,
    email: user.email,
    phone,
  });

  const nextMetadata = {
    ...user.user_metadata,
    fullName,
    phone,
    customerId: customer.id,
  };

  if (
    fullName === resolveUserMetadataValue(user, 'fullName')
    && phone === resolveUserMetadataValue(user, 'phone')
    && customer.id === existingCustomerId
  ) {
    return user;
  }

  const { data, error } = await client.auth.updateUser({ data: nextMetadata });
  if (error) {
    throw new Error('Your account is active, but the customer profile could not be synchronized.');
  }

  return data.user ?? user;
}

export async function loginCustomerAccount(input: LoginCustomerInput): Promise<CustomerAuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Customer authentication is not configured.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password,
  });

  if (error) {
    throw mapSupabaseAuthError(error, 'Unable to login right now.');
  }

  if (!data.user) {
    throw new Error('Unable to login right now.');
  }

  const user = await persistCustomerProfile(data.user);
  return {
    user,
    session: data.session,
  };
}

export async function registerCustomerAccount(input: RegisterCustomerInput): Promise<CustomerAuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Customer authentication is not configured.');
  }

  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = normalizePhone(input.phone);
  const fullName = input.fullName.trim();

  const signUpResponse = await client.auth.signUp({
    email: normalizedEmail,
    password: input.password,
    options: {
      data: {
        fullName,
        phone: normalizedPhone,
      },
    },
  });

  if (signUpResponse.error) {
    throw mapSupabaseAuthError(signUpResponse.error, 'Unable to create your account right now.');
  }

  let user = signUpResponse.data.user;
  let session = signUpResponse.data.session;

  if (!user) {
    throw new Error('Unable to create your account right now.');
  }

  if (!session) {
    const signInResponse = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password: input.password,
    });

    if (signInResponse.error) {
      throw mapSupabaseAuthError(signInResponse.error, 'Your account was created, but automatic login could not be completed.');
    }

    user = signInResponse.data.user ?? user;
    session = signInResponse.data.session;
  }

  const syncedUser = await persistCustomerProfile(user, {
    fullName,
    phone: normalizedPhone,
  });

  return {
    user: syncedUser,
    session,
  };
}
