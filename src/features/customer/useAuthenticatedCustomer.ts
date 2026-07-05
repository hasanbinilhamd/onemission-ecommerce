import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient, getAuthenticatedUser, isSupabaseConfigured } from '../../services/supabase/client';

interface AuthenticatedCustomerState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string | null;
  isConfigured: boolean;
}

const initialState: AuthenticatedCustomerState = {
  user: null,
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

      setState({
        user: session?.user ?? null,
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
