import { CheckCircle2, Mail, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { loadStoredPendingRegistration } from '../services/auth/customerAuthStorage';

type OtpDigits = [string, string, string, string, string, string];

const OTP_LENGTH = 6;
const initialOtpDigits: OtpDigits = ['', '', '', '', '', ''];

function normalizeCountdown(targetIso: string) {
  const targetTimestamp = new Date(targetIso || '').getTime();
  if (!targetTimestamp) {
    return 0;
  }

  return Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
}

function formatCountdown(totalSeconds: number) {
  const seconds = Math.max(0, totalSeconds);
  const minutesPart = Math.floor(seconds / 60);
  const secondsPart = String(seconds % 60).padStart(2, '0');
  return `${minutesPart}:${secondsPart}`;
}

function VerifyEmailPageContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isConfigured,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    getPendingRegistrationEmail,
  } = useAuthenticatedCustomer();

  const locationState = location.state as {
    email?: string;
    resendAvailableAt?: string;
    expiresAt?: string;
  } | null;

  const storedPendingRegistration = loadStoredPendingRegistration();
  const email = locationState?.email || storedPendingRegistration.email || getPendingRegistrationEmail();
  const [resendAvailableAt, setResendAvailableAt] = useState(locationState?.resendAvailableAt || storedPendingRegistration.resendAvailableAt || '');
  const [expiresAt, setExpiresAt] = useState(locationState?.expiresAt || storedPendingRegistration.expiresAt || '');
  const [otpDigits, setOtpDigits] = useState<OtpDigits>(initialOtpDigits);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(() => normalizeCountdown(locationState?.resendAvailableAt || ''));
  const [expirySeconds, setExpirySeconds] = useState(() => normalizeCountdown(locationState?.expiresAt || ''));

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) {
      return;
    }

    inputRefs.current[0]?.focus();
  }, [email]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCooldownSeconds(normalizeCountdown(resendAvailableAt));
      setExpirySeconds(normalizeCountdown(expiresAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt, resendAvailableAt]);

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);
  const canResend = email && cooldownSeconds <= 0 && !isResending;
  const canVerify = otpValue.length === OTP_LENGTH && !isSubmitting && Boolean(email);

  const handleOtpChange = (index: number, value: string) => {
    const normalizedValue = value.replace(/\D/g, '').slice(-1);
    setOtpDigits((current) => {
      const next = [...current] as OtpDigits;
      next[index] = normalizedValue;
      return next;
    });
    setFormError('');

    if (normalizedValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedValue = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedValue) {
      return;
    }

    event.preventDefault();
    const nextDigits = [...initialOtpDigits] as OtpDigits;
    for (let index = 0; index < pastedValue.length; index += 1) {
      nextDigits[index] = pastedValue[index];
    }
    setOtpDigits(nextDigits);
    setFormError('');

    const focusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!email) {
      setFormError('Registration email was not found. Please register again.');
      return;
    }

    if (otpValue.length !== OTP_LENGTH) {
      setFormError('Enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await verifyRegistrationOtp({ email, otp: otpValue });
      setSuccessMessage('Email verified successfully. Redirecting...');
      window.setTimeout(() => {
        navigate(ROUTES.HOME, { replace: true });
      }, 800);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to verify your email right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) {
      return;
    }

    setIsResending(true);
    setFormError('');

    try {
      const response = await resendRegistrationOtp({ email });
      setResendAvailableAt(response.resendAvailableAt);
      setExpiresAt(response.expiresAt);
      setCooldownSeconds(normalizeCountdown(response.resendAvailableAt));
      setExpirySeconds(normalizeCountdown(response.expiresAt));
      setOtpDigits(initialOtpDigits);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to resend your verification code right now.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="720px">
      <CustomerPageHeader
        sectionLabel="Customer Account"
        title="Verify your Email"
        description="We have sent a 6-digit verification code to your email. Enter the code below to complete your registration."
      />

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {!isConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Customer authentication is not configured in this environment yet.
          </div>
        ) : null}

        {!email ? (
          <div className="grid gap-5">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Registration email was not found. Please start the registration process again.
            </div>
            <Button type="button" onClick={() => navigate(ROUTES.REGISTER)}>
              Back to Register
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-900 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Verification Email</p>
                  <p className="mt-1 font-medium text-neutral-900">{email}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={`otp-digit-${index}`}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={handleOtpPaste}
                    className="h-14 w-12 rounded-2xl border border-neutral-300 text-center text-xl font-semibold text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 sm:h-16 sm:w-14"
                  />
                ))}
              </div>

              <div className="text-center text-sm text-neutral-500">
                <p className="m-0">Code expires in {formatCountdown(expirySeconds)}</p>
                <p className="mt-1">You can request a new code in {formatCountdown(cooldownSeconds)}</p>
              </div>
            </div>

            {formError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" onClick={() => void handleVerify()} disabled={!canVerify} className="sm:flex-1">
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void handleResend()} disabled={!canResend} className="sm:flex-1 gap-2">
                <RotateCcw size={16} />
                {isResending ? 'Sending...' : 'Resend Code'}
              </Button>
            </div>

            <div className="text-center text-sm text-neutral-600">
              Need to change your email?{' '}
              <Link to={ROUTES.REGISTER} className="font-medium text-neutral-900 underline-offset-4 hover:underline">
                Back to Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}

export function VerifyEmailPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <VerifyEmailPageContent />
    </NavigationThemeProvider>
  );
}
