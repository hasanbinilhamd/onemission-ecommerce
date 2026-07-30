import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { env } from '../../app/config/env';
import {
  type CustomerAuthCustomer,
  type CustomerAuthSessionPayload,
  getCurrentAuthenticatedCustomer,
  loginCustomerAccount,
  loginCustomerWithGoogle,
  logoutAllCustomerSessions,
  logoutCustomerSession,
  refreshCustomerSession,
  requestCustomerRegistration,
  resendCustomerRegistrationOtp,
  verifyCustomerRegistrationOtp,
} from '../../services/auth/customerAuthService';
import {
  clearStoredCustomerAuthTokens,
  clearStoredPendingRegistration,
  loadStoredCustomerAuthTokens,
  loadStoredPendingRegistration,
  persistCustomerAuthTokens,
  persistStoredPendingRegistration,
} from '../../services/auth/customerAuthStorage';
import { isGoogleIdentityConfigured } from '../../services/auth/googleIdentity';
import { getAuthenticatedCustomerProfile, type AuthenticatedCustomerProfile } from './customerSession';
import { CustomerAuthContext, type CustomerAuthContextValue } from './CustomerAuthContext';

function buildClientDeviceLabel() {
  if (typeof window === 'undefined') {
    return 'Web Browser';
  }

  const platform = window.navigator.platform || 'Unknown Platform';
  const language = window.navigator.language || 'Unknown Language';
  return `${platform} / ${language}`;
}

function getTokenExpirationTimestamp(token: string) {
  try {
    const [, payload = ''] = token.split('.');
    const parsed = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return Number(parsed.exp || 0) * 1000;
  } catch {
    return 0;
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerAuthCustomer | null>(null);
  const [profile, setProfile] = useState<AuthenticatedCustomerProfile | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshTimerRef = useRef<number | null>(null);
  const accessTokenRef = useRef('');
  const refreshTokenRef = useRef('');
  const refreshSessionRef = useRef<() => Promise<string | null>>(async () => null);

  const isConfigured = Boolean(env.apiBaseUrl.trim());
  const isGoogleConfigured = isConfigured && isGoogleIdentityConfigured();

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    setProfile(null);
    setAccessToken('');
    setRefreshToken('');
    accessTokenRef.current = '';
    refreshTokenRef.current = '';
    clearStoredCustomerAuthTokens();
  }, [clearRefreshTimer]);

  const scheduleRefresh = useCallback((token: string) => {
    clearRefreshTimer();

    if (typeof window === 'undefined' || !token) {
      return;
    }

    const expirationTimestamp = getTokenExpirationTimestamp(token);
    if (!expirationTimestamp) {
      return;
    }

    const refreshDelayMs = Math.max(expirationTimestamp - Date.now() - 60_000, 15_000);
    refreshTimerRef.current = window.setTimeout(() => {
      void refreshSessionRef.current();
    }, refreshDelayMs);
  }, [clearRefreshTimer]);

  const applySession = useCallback((payload: CustomerAuthSessionPayload) => {
    setUser(payload.customer);
    setProfile(getAuthenticatedCustomerProfile(payload.customer));
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    accessTokenRef.current = payload.accessToken;
    refreshTokenRef.current = payload.refreshToken;
    persistCustomerAuthTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });
    scheduleRefresh(payload.accessToken);
  }, [scheduleRefresh]);

  const refreshSessionInternal = useCallback(async () => {
    const currentRefreshToken = refreshTokenRef.current || loadStoredCustomerAuthTokens().refreshToken;
    if (!currentRefreshToken) {
      clearSession();
      return null;
    }

    try {
      const payload = await refreshCustomerSession({
        refreshToken: currentRefreshToken,
        device: buildClientDeviceLabel(),
      });
      applySession(payload);
      setErrorMessage(null);
      return payload.accessToken;
    } catch (error) {
      clearSession();
      setErrorMessage(error instanceof Error ? error.message : 'Your session could not be refreshed.');
      return null;
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    refreshSessionRef.current = refreshSessionInternal;
  }, [refreshSessionInternal]);

  const getValidAccessToken = useCallback(async () => {
    const currentAccessToken = accessTokenRef.current || loadStoredCustomerAuthTokens().accessToken;
    if (!currentAccessToken) {
      return refreshSessionInternal();
    }

    const expirationTimestamp = getTokenExpirationTimestamp(currentAccessToken);
    if (!expirationTimestamp || expirationTimestamp - Date.now() <= 30_000) {
      return refreshSessionInternal();
    }

    return currentAccessToken;
  }, [refreshSessionInternal]);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      if (!isConfigured) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const storedTokens = loadStoredCustomerAuthTokens();
      accessTokenRef.current = storedTokens.accessToken;
      refreshTokenRef.current = storedTokens.refreshToken;

      if (!storedTokens.accessToken && !storedTokens.refreshToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const nextAccessToken = storedTokens.accessToken || await refreshSessionInternal();
        if (!nextAccessToken) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        const payload = await getCurrentAuthenticatedCustomer(nextAccessToken);
        if (!isMounted) {
          return;
        }

        setUser(payload.customer);
        setProfile(getAuthenticatedCustomerProfile(payload.customer));
        setAccessToken(nextAccessToken);
        accessTokenRef.current = nextAccessToken;
        setErrorMessage(null);
        scheduleRefresh(nextAccessToken);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const refreshedToken = await refreshSessionInternal();
        if (refreshedToken) {
          try {
            const payload = await getCurrentAuthenticatedCustomer(refreshedToken);
            if (!isMounted) {
              return;
            }

            setUser(payload.customer);
            setProfile(getAuthenticatedCustomerProfile(payload.customer));
            setAccessToken(refreshedToken);
            accessTokenRef.current = refreshedToken;
            setErrorMessage(null);
          } catch (innerError) {
            clearSession();
            setErrorMessage(innerError instanceof Error ? innerError.message : 'Unable to restore your customer session.');
          }
        } else {
          clearSession();
          setErrorMessage(error instanceof Error ? error.message : 'Unable to restore your customer session.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, clearSession, isConfigured, refreshSessionInternal, scheduleRefresh]);

  const login = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const payload = await loginCustomerAccount({
      email,
      password,
      device: buildClientDeviceLabel(),
    });
    applySession(payload);
    setErrorMessage(null);
  }, [applySession]);

  const register = useCallback(async ({ customerName, email, phone, password }: { customerName: string; email: string; phone: string; password: string }) => {
    const payload = await requestCustomerRegistration({
      customerName,
      email,
      phone,
      password,
      device: buildClientDeviceLabel(),
    });

    persistStoredPendingRegistration({
      email: payload.email,
      resendAvailableAt: payload.resendAvailableAt,
      expiresAt: payload.expiresAt,
    });
    setErrorMessage(null);
    return payload;
  }, []);

  const verifyRegistrationOtp = useCallback(async ({ email, otp }: { email: string; otp: string }) => {
    const payload = await verifyCustomerRegistrationOtp({
      email,
      otp,
      device: buildClientDeviceLabel(),
    });
    applySession(payload);
    clearStoredPendingRegistration();
    setErrorMessage(null);
  }, [applySession]);

  const resendRegistrationOtp = useCallback(async ({ email }: { email: string }) => {
    const payload = await resendCustomerRegistrationOtp({ email });
    persistStoredPendingRegistration({
      email: payload.email,
      resendAvailableAt: payload.resendAvailableAt,
      expiresAt: payload.expiresAt,
    });
    setErrorMessage(null);
    return payload;
  }, []);

  const getPendingRegistrationEmail = useCallback(() => loadStoredPendingRegistration().email, []);

  const loginWithGoogleToken = useCallback(async (idToken: string) => {
    const payload = await loginCustomerWithGoogle({
      idToken,
      device: buildClientDeviceLabel(),
    });
    applySession(payload);
    setErrorMessage(null);
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      const currentAccessToken = accessTokenRef.current;
      const currentRefreshToken = refreshTokenRef.current;

      if (currentAccessToken || currentRefreshToken) {
        await logoutCustomerSession({
          accessToken: currentAccessToken,
          refreshToken: currentRefreshToken,
        });
      }
    } finally {
      clearSession();
      setErrorMessage(null);
    }
  }, [clearSession]);

  const logoutAll = useCallback(async () => {
    try {
      if (accessTokenRef.current) {
        await logoutAllCustomerSessions(accessTokenRef.current);
      }
    } finally {
      clearSession();
      setErrorMessage(null);
    }
  }, [clearSession]);

  const reloadAuthenticatedCustomer = useCallback(async () => {
    const nextAccessToken = await getValidAccessToken();
    if (!nextAccessToken) {
      return;
    }

    const payload = await getCurrentAuthenticatedCustomer(nextAccessToken);
    setUser(payload.customer);
    setProfile(getAuthenticatedCustomerProfile(payload.customer));
    setAccessToken(nextAccessToken);
    accessTokenRef.current = nextAccessToken;
    setErrorMessage(null);
    scheduleRefresh(nextAccessToken);
  }, [getValidAccessToken, scheduleRefresh]);

  const contextValue = useMemo<CustomerAuthContextValue>(() => ({
    user,
    profile,
    accessToken,
    refreshToken,
    isLoading,
    errorMessage,
    isConfigured,
    isGoogleConfigured,
    login,
    register,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    getPendingRegistrationEmail,
    loginWithGoogleToken,
    logout,
    logoutAll,
    refreshSession: refreshSessionInternal,
    getValidAccessToken,
    reloadAuthenticatedCustomer,
  }), [
    accessToken,
    errorMessage,
    getPendingRegistrationEmail,
    getValidAccessToken,
    isConfigured,
    isGoogleConfigured,
    isLoading,
    login,
    loginWithGoogleToken,
    logout,
    logoutAll,
    profile,
    refreshSessionInternal,
    refreshToken,
    register,
    reloadAuthenticatedCustomer,
    resendRegistrationOtp,
    user,
    verifyRegistrationOtp,
  ]);

  return (
    <CustomerAuthContext.Provider value={contextValue}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

