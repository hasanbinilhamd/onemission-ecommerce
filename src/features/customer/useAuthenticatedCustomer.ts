import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, getAuthenticatedUser, isSupabaseConfigured } from '../../services/supabase/client';
import { getAuthenticatedCustomerProfile, type AuthenticatedCustomerProfile } from './customerSession';

interface AuthenticatedCustomerState {
  user: User | null;
  profile: AuthenticatedCustomerProfile | null;
  isLoading: boolean;
  errorMessage: string | null;
  isConfigured: boolean;
}

const initialState: AuthenticatedCustomerState = {
  user: null,
  profile: null,
  isLoading: true,
  errorMessage: null,
  isConfigured: isSupabaseConfigured(),
};

export function useAuthenticatedCustomer(): AuthenticatedCustomerState {
  const [state, setState] = useState<AuthenticatedCustomerState>(initialState);

  useEffect(() => {
    const client = getSupabaseClient();

    if (!client) {
      setState({
        user: null,
        profile: null,
        isLoading: false,
        errorMessage: null,
        isConfigured: false,
      });
      return undefined;
    }

    let isMounted = true;

    const loadUser = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (!isMounted) {
          return;
        }

        setState({
          user,
          profile: getAuthenticatedCustomerProfile(user),
          isLoading: false,
          errorMessage: null,
          isConfigured: true,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          user: null,
          profile: null,
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : 'Unable to load your account session.',
          isConfigured: true,
        });
      }
    };

    void loadUser();

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      const nextUser = session?.user ?? null;

      setState({
        user: nextUser,
        profile: getAuthenticatedCustomerProfile(nextUser),
        isLoading: false,
        errorMessage: null,
        isConfigured: true,
      });
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
