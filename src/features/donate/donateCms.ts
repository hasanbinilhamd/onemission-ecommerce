import { useCallback, useEffect, useState } from 'react';
import { donationService, type DonatePayload } from '../../services/api/donationService';

/**
 * Shared Donate data hook — CMS is the single source of truth.
 *
 *   loading → skeleton
 *   success  → real API payload (campaign may legitimately be null)
 *   error    → honest error state
 *
 * No static campaign content is ever used as a fallback.
 */

export type DonateCmsStatus = 'loading' | 'success' | 'error';

export interface DonateCmsState {
  status: DonateCmsStatus;
  payload: DonatePayload | null;
}

export function useDonateCms(): DonateCmsState & { reload: () => void } {
  const [state, setState] = useState<DonateCmsState>({ status: 'loading', payload: null });

  const reload = useCallback(async () => {
    setState({ status: 'loading', payload: null });
    try {
      const payload = await donationService.getDonate();
      setState({ status: 'success', payload });
    } catch {
      setState({ status: 'error', payload: null });
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload: () => void reload() };
}
