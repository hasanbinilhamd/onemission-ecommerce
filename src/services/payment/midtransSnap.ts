import { env } from '../../app/config/env';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

function getSnapScriptUrl() {
  return env.midtransIsProduction
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
}

let midtransScriptPromise: Promise<void> | null = null;

export function loadMidtransSnapScript(): Promise<void> {
  if (window.snap) {
    return Promise.resolve();
  }

  if (midtransScriptPromise) {
    return midtransScriptPromise;
  }

  const clientKey = env.midtransClientKey.trim();
  if (!clientKey) {
    return Promise.reject(new Error('Midtrans client key is not configured.'));
  }

  midtransScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-midtrans-snap="true"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Unable to load Midtrans Snap.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = getSnapScriptUrl();
    script.async = true;
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('data-midtrans-snap', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Midtrans Snap.'));
    document.body.appendChild(script);
  });

  return midtransScriptPromise;
}

export interface OpenMidtransSnapOptions {
  token: string;
  onSuccess: (result: Record<string, unknown>) => void;
  onPending: (result: Record<string, unknown>) => void;
  onError: (result: Record<string, unknown>) => void;
  onClose?: () => void;
}

export async function openMidtransSnap(options: OpenMidtransSnapOptions) {
  await loadMidtransSnapScript();

  if (!window.snap) {
    throw new Error('Midtrans Snap is unavailable.');
  }

  window.snap.pay(options.token, {
    onSuccess: options.onSuccess,
    onPending: options.onPending,
    onError: options.onError,
    onClose: options.onClose,
  });
}
