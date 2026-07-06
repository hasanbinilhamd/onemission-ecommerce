import { useEffect, useRef, useState } from 'react';
import { env } from '../../app/config/env';
import { loadGoogleIdentityScript } from '../../services/auth/googleIdentity';

interface GoogleLoginButtonProps {
  onCredential: (idToken: string) => Promise<void> | void;
  disabled?: boolean;
}

export function GoogleLoginButton({ onCredential, disabled = false }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const initializeGoogleButton = async () => {
      if (!containerRef.current || disabled || !env.googleClientId.trim()) {
        return;
      }

      try {
        await loadGoogleIdentityScript();

        if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: env.googleClientId.trim(),
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setErrorMessage('Google login did not return a valid identity token.');
              return;
            }

            setErrorMessage('');
            await onCredential(response.credential);
          },
          ux_mode: 'popup',
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          text: 'continue_with',
          shape: 'pill',
          size: 'large',
          width: 320,
          logo_alignment: 'left',
        });
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load Google login right now.');
        }
      }
    };

    void initializeGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [disabled, onCredential]);

  if (!env.googleClientId.trim()) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <div ref={containerRef} className="flex justify-center sm:justify-start" />
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </div>
  );
}
