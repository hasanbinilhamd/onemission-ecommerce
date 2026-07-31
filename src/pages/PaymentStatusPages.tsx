import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, LoadingSkeleton, Modal } from '../components/shared';
import {
  cancelPaymentAttempt,
  createPaymentAttempt,
  generateSnapToken,
  getCheckoutSessionById,
  getPaymentAttemptById,
} from '../services/api/checkoutService';
import { openMidtransSnap } from '../services/payment/midtransSnap';
import { useCartStore } from '../stores';
import type { CommerceCheckoutSessionDetail, CommercePaymentAttemptDetail } from '../types';
import { formatCurrency } from '../utils/formatting';

const CLEARED_CHECKOUT_SESSION_STORAGE_KEY = 'onemission-cleared-checkout-session-id';
const WAITING_PAYMENT_POLL_INTERVAL_MS = 5_000;

function isSuccessfulPaymentStatus(value: string | null): boolean {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === 'PAID' || normalized === 'SUCCESS' || normalized === 'SETTLEMENT';
}

function isPendingPaymentStatus(value: string | null): boolean {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === 'CREATED' || normalized === 'PENDING';
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatCountdown(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function buildPendingPageQuery(params: {
  checkoutSessionId: string;
  paymentAttemptId: string;
}) {
  const query = new URLSearchParams();
  query.set('checkout_session_id', params.checkoutSessionId);
  query.set('payment_attempt_id', params.paymentAttemptId);
  return query.toString();
}

function buildSuccessPageQuery(params: {
  checkoutSessionId: string;
  paymentAttempt: CommercePaymentAttemptDetail | null;
  checkoutSession: CommerceCheckoutSessionDetail | null;
}) {
  const query = new URLSearchParams();
  query.set('order_id', params.paymentAttempt?.providerReference || params.checkoutSession?.checkoutNumber || '');
  query.set('transaction_status', params.paymentAttempt?.status || 'settlement');
  query.set('status_code', '200');
  query.set('payment_attempt_id', params.paymentAttempt?.id || '');
  query.set('checkout_session_id', params.checkoutSessionId);
  query.set('payment_method', params.paymentAttempt?.paymentType || params.paymentAttempt?.provider || 'Midtrans Snap');
  query.set('paid_amount', String(params.paymentAttempt?.grossAmount || params.checkoutSession?.totals?.grandTotal || 0));
  return query.toString();
}

function buildFailedPageQuery(params: {
  checkoutSessionId: string;
  paymentAttempt: CommercePaymentAttemptDetail | null;
}) {
  const query = new URLSearchParams();
  query.set('order_id', params.paymentAttempt?.providerReference || '');
  query.set('transaction_status', params.paymentAttempt?.status || 'failed');
  query.set('status_code', '500');
  query.set('payment_attempt_id', params.paymentAttempt?.id || '');
  query.set('checkout_session_id', params.checkoutSessionId);
  return query.toString();
}

function buildCancelledOrExpiredQuery(params: {
  checkoutSessionId: string;
  paymentAttemptId: string;
  checkoutNumber: string;
  status: string;
}) {
  const query = new URLSearchParams();
  query.set('checkout_session_id', params.checkoutSessionId);
  query.set('payment_attempt_id', params.paymentAttemptId);
  query.set('reference', params.checkoutNumber || params.checkoutSessionId);
  query.set('transaction_status', params.status);
  return query.toString();
}

function navigateToHome(navigate: ReturnType<typeof useNavigate>) {
  navigate('/');
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    });
  }
}

interface PaymentStatusPageProps {
  title: string;
  description: string;
  tone: 'success' | 'pending' | 'failed';
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

function PaymentStatusPage({
  title,
  description,
  tone,
  primaryActionLabel = 'Continue Shopping',
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: PaymentStatusPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const reference = query.get('reference') || query.get('order_id') || query.get('checkout_session_id') || '-';
  const status = query.get('transaction_status') || '-';

  const icon = tone === 'success'
    ? <CheckCircle2 size={42} />
    : tone === 'pending'
      ? <Clock3 size={42} />
      : <XCircle size={42} />;

  const iconColor = tone === 'success'
    ? '#15803D'
    : tone === 'pending'
      ? '#B45309'
      : '#B91C1C';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '9999px', backgroundColor: `${iconColor}14`, color: iconColor, marginBottom: '24px' }}>
          {icon}
        </div>
        <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
          Payment Status
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827', lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ margin: '0 auto 28px', maxWidth: '520px', fontSize: '15px', lineHeight: 1.7, color: '#6B7280' }}>
          {description}
        </p>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '20px', padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Reference</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{reference}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Status</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{status}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={onPrimaryAction || (() => navigateToHome(navigate))}>
            {primaryActionLabel}
          </Button>
          {secondaryActionLabel && onSecondaryAction ? (
            <Button type="button" variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, isCartReady } = useCartStore();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderReference = query.get('order_id') || '-';
  const transactionStatus = query.get('transaction_status') || 'settlement';
  const paymentMethod = query.get('payment_method') || 'Midtrans';
  const paidAmount = Number.parseFloat(query.get('paid_amount') || '0');
  const checkoutSessionId = query.get('checkout_session_id') || '';
  const [publicOrderNumber, setPublicOrderNumber] = useState('');

  useEffect(() => {
    if (!isCartReady || !isSuccessfulPaymentStatus(transactionStatus)) {
      return;
    }

    if (typeof window === 'undefined') {
      clearCart();
      return;
    }

    const lastClearedCheckoutSessionId = window.sessionStorage.getItem(CLEARED_CHECKOUT_SESSION_STORAGE_KEY);
    if (checkoutSessionId && lastClearedCheckoutSessionId === checkoutSessionId) {
      return;
    }

    clearCart();

    if (checkoutSessionId) {
      window.sessionStorage.setItem(CLEARED_CHECKOUT_SESSION_STORAGE_KEY, checkoutSessionId);
    }
  }, [checkoutSessionId, clearCart, isCartReady, transactionStatus]);

  useEffect(() => {
    if (!checkoutSessionId) {
      setPublicOrderNumber('');
      return;
    }

    let isMounted = true;

    const loadPublicOrderNumber = async () => {
      try {
        const response = await fetch(`/api/orders/by-checkout-session/${encodeURIComponent(checkoutSessionId)}`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || 'Order was not found.');
        }
        if (isMounted) {
          setPublicOrderNumber(payload.publicOrderNumber || '');
        }
      } catch {
        if (isMounted) {
          setPublicOrderNumber('');
        }
      }
    };

    void loadPublicOrderNumber();

    return () => {
      isMounted = false;
    };
  }, [checkoutSessionId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '9999px', backgroundColor: '#15803D14', color: '#15803D', marginBottom: '24px' }}>
          <CheckCircle2 size={42} />
        </div>
        <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
          Payment Successful
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827', lineHeight: 1.1 }}>
          Payment Successful
        </h1>
        <p style={{ margin: '0 auto 6px', maxWidth: '520px', fontSize: '15px', lineHeight: 1.7, color: '#6B7280' }}>
          Your payment has been received successfully.
        </p>
        <p style={{ margin: '0 auto 28px', maxWidth: '520px', fontSize: '15px', lineHeight: 1.7, color: '#6B7280' }}>
          We are preparing your order.
        </p>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '20px', padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>{publicOrderNumber ? 'Order Number' : 'Payment Reference'}</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{publicOrderNumber || orderReference}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Payment Method</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{paymentMethod}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Transaction Status</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{transactionStatus}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Paid Amount</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatCurrency(Number.isFinite(paidAmount) ? paidAmount : 0)}</p>
            </div>
            <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Estimated next step</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                We&apos;ll notify you once your order is processed.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => navigateToHome(navigate)}>
            Continue Shopping
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>
            View My Orders
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PaymentPendingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutSession, setCheckoutSession] = useState<CommerceCheckoutSessionDetail | null>(null);
  const [paymentAttempt, setPaymentAttempt] = useState<CommercePaymentAttemptDetail | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [remainingTimeMs, setRemainingTimeMs] = useState(0);
  const redirectingRef = useRef(false);

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkoutSessionId = query.get('checkout_session_id') || '';
  const paymentAttemptId = query.get('payment_attempt_id') || '';

  const handleStatusRedirect = useCallback((nextCheckoutSession: CommerceCheckoutSessionDetail | null, nextPaymentAttempt: CommercePaymentAttemptDetail | null) => {
    if (redirectingRef.current || !nextPaymentAttempt) {
      return true;
    }

    if (isSuccessfulPaymentStatus(nextPaymentAttempt.status)) {
      redirectingRef.current = true;
      navigate(`/payment/success?${buildSuccessPageQuery({
        checkoutSessionId,
        paymentAttempt: nextPaymentAttempt,
        checkoutSession: nextCheckoutSession,
      })}`, { replace: true });
      return true;
    }

    const normalizedStatus = String(nextPaymentAttempt.status || '').trim().toUpperCase();
    if (normalizedStatus === 'EXPIRED') {
      redirectingRef.current = true;
      navigate(`/payment/expired?${buildCancelledOrExpiredQuery({
        checkoutSessionId,
        paymentAttemptId: nextPaymentAttempt.id,
        checkoutNumber: nextCheckoutSession?.checkoutNumber || '',
        status: normalizedStatus,
      })}`, { replace: true });
      return true;
    }

    if (normalizedStatus === 'CANCELLED') {
      redirectingRef.current = true;
      navigate(`/payment/cancelled?${buildCancelledOrExpiredQuery({
        checkoutSessionId,
        paymentAttemptId: nextPaymentAttempt.id,
        checkoutNumber: nextCheckoutSession?.checkoutNumber || '',
        status: normalizedStatus,
      })}`, { replace: true });
      return true;
    }

    if (normalizedStatus === 'FAILED') {
      redirectingRef.current = true;
      navigate(`/payment/failed?${buildFailedPageQuery({
        checkoutSessionId,
        paymentAttempt: nextPaymentAttempt,
      })}`, { replace: true });
      return true;
    }

    return false;
  }, [checkoutSessionId, navigate]);

  const loadWaitingPaymentState = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!checkoutSessionId || !paymentAttemptId) {
      setIsLoadingState(false);
      return;
    }

    if (!options.silent) {
      setIsLoadingState(true);
    }

    try {
      const [nextCheckoutSession, nextPaymentAttempt] = await Promise.all([
        getCheckoutSessionById(checkoutSessionId),
        getPaymentAttemptById(paymentAttemptId),
      ]);

      if (handleStatusRedirect(nextCheckoutSession, nextPaymentAttempt)) {
        return;
      }

      setCheckoutSession(nextCheckoutSession);
      setPaymentAttempt(nextPaymentAttempt);
      setStatusMessage('');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Waiting payment information could not be loaded.');
      setCheckoutSession(null);
      setPaymentAttempt(null);
    } finally {
      if (!options.silent) {
        setIsLoadingState(false);
      }
    }
  }, [checkoutSessionId, handleStatusRedirect, paymentAttemptId]);

  useEffect(() => {
    void loadWaitingPaymentState();
  }, [loadWaitingPaymentState]);

  useEffect(() => {
    if (!paymentAttempt || !isPendingPaymentStatus(paymentAttempt.status) || redirectingRef.current) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void loadWaitingPaymentState({ silent: true });
    }, WAITING_PAYMENT_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadWaitingPaymentState, paymentAttempt]);

  useEffect(() => {
    const expiresAt = paymentAttempt?.expiresAt || checkoutSession?.expiresAt;
    if (!expiresAt) {
      setRemainingTimeMs(0);
      return undefined;
    }

    const updateCountdown = () => {
      const milliseconds = new Date(expiresAt).getTime() - Date.now();
      setRemainingTimeMs(Math.max(0, milliseconds));
      if (milliseconds <= 0 && !redirectingRef.current) {
        void loadWaitingPaymentState({ silent: true });
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1_000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkoutSession?.expiresAt, loadWaitingPaymentState, paymentAttempt?.expiresAt]);

  const handleContinuePayment = useCallback(async () => {
    if (!checkoutSessionId || !checkoutSession) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Preparing your payment session...');

    try {
      const nextAttempt = await createPaymentAttempt(checkoutSessionId);
      const snapAttempt = await generateSnapToken(nextAttempt.id);
      if (!snapAttempt.snapToken) {
        throw new Error('Midtrans Snap token was not returned.');
      }

      await openMidtransSnap({
        token: snapAttempt.snapToken,
        onSuccess: (result) => {
          navigate(`/payment/success?${buildSuccessPageQuery({
            checkoutSessionId,
            paymentAttempt: {
              ...(paymentAttempt || {} as CommercePaymentAttemptDetail),
              id: nextAttempt.id,
              providerReference: String(result.order_id || snapAttempt.providerReference || ''),
              status: String(result.transaction_status || 'PAID'),
              grossAmount: Number(result.gross_amount || checkoutSession.totals.grandTotal),
              paymentType: String(result.payment_type || result.payment_method || paymentAttempt?.paymentType || ''),
              provider: paymentAttempt?.provider || 'MIDTRANS',
              checkoutSessionId,
              attemptNumber: paymentAttempt?.attemptNumber || '',
              currency: checkoutSession.currency,
              issuer: paymentAttempt?.issuer || '',
              acquirer: paymentAttempt?.acquirer || '',
              fraudStatus: paymentAttempt?.fraudStatus || '',
              orderId: paymentAttempt?.orderId || '',
              createdAt: paymentAttempt?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            checkoutSession,
          })}`);
        },
        onPending: () => {
          navigate(`/payment/pending?${buildPendingPageQuery({
            checkoutSessionId,
            paymentAttemptId: nextAttempt.id,
          })}`);
        },
        onError: () => {
          navigate(`/payment/failed?${buildFailedPageQuery({
            checkoutSessionId,
            paymentAttempt: paymentAttempt,
          })}`);
        },
        onClose: () => {
          setIsSubmitting(false);
          setStatusMessage('Payment window closed. You can continue payment again before it expires.');
          void loadWaitingPaymentState();
        },
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to continue payment right now.');
      setIsSubmitting(false);
    }
  }, [checkoutSession, checkoutSessionId, loadWaitingPaymentState, navigate, paymentAttempt]);

  const handleCancelCheckout = useCallback(async () => {
    if (!paymentAttempt?.id || !checkoutSessionId) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Cancelling your checkout...');

    try {
      await cancelPaymentAttempt(paymentAttempt.id);
      navigate(`/payment/cancelled?${buildCancelledOrExpiredQuery({
        checkoutSessionId,
        paymentAttemptId: paymentAttempt.id,
        checkoutNumber: checkoutSession?.checkoutNumber || '',
        status: 'CANCELLED',
      })}`, { replace: true });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Checkout could not be cancelled right now.');
      setIsSubmitting(false);
    } finally {
      setIsCancelModalOpen(false);
    }
  }, [checkoutSession?.checkoutNumber, checkoutSessionId, navigate, paymentAttempt?.id]);

  const canContinuePayment = Boolean(paymentAttempt && isPendingPaymentStatus(paymentAttempt.status));
  const countdownLabel = formatCountdown(remainingTimeMs);

  if (isLoadingState) {
    return (
      <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <LoadingSkeleton rows={5} />
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!checkoutSession || !paymentAttempt) {
    return (
      <PaymentStatusPage
        title="Waiting Payment"
        description={statusMessage || 'Your payment is still pending. Please continue payment or check back in a moment.'}
        tone="pending"
        primaryActionLabel="Back to Home"
        onPrimaryAction={() => navigateToHome(navigate)}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '9999px', backgroundColor: '#B4530914', color: '#B45309', marginBottom: '24px' }}>
            <Clock3 size={42} />
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
            Waiting Payment
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827', lineHeight: 1.1 }}>
            Complete your payment before it expires
          </h1>
          <p style={{ margin: '0 auto', maxWidth: '560px', fontSize: '15px', lineHeight: 1.7, color: '#6B7280' }}>
            Your checkout is still active. Continue payment with Midtrans Snap or cancel this checkout before the timer ends.
          </p>
        </div>

        {statusMessage ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {statusMessage}
          </div>
        ) : null}

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '24px', padding: '24px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Checkout Reference</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{checkoutSession.checkoutNumber}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Status</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{paymentAttempt.status}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Payment</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{paymentAttempt.paymentType || paymentAttempt.provider || 'Midtrans Snap'}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Total Amount</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatCurrency(checkoutSession.totals.grandTotal)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Created At</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatDateTime(paymentAttempt.createdAt || checkoutSession.createdAt)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Expired At</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatDateTime(paymentAttempt.expiresAt || checkoutSession.expiresAt)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '6px', borderTop: '1px solid #F3F4F6' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Countdown</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: remainingTimeMs <= 60_000 ? '#B91C1C' : '#111827', textAlign: 'right' }}>{countdownLabel}</p>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '24px', padding: '24px', backgroundColor: '#FFFFFF', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#111827' }}>Checkout Summary</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {checkoutSession.items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.productName}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{item.variantName} · Qty {item.quantity}</p>
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button type="button" onClick={() => void handleContinuePayment()} disabled={!canContinuePayment || isSubmitting}>
            {isSubmitting ? 'Preparing Payment...' : 'Continue Payment'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsCancelModalOpen(true)} disabled={!canContinuePayment || isSubmitting}>
            Cancel Checkout
          </Button>
        </div>
      </div>

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Checkout?">
        <div className="grid gap-4">
          <p className="m-0 text-sm leading-6 text-neutral-600">
            Are you sure you want to cancel this checkout?
          </p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Keep Waiting
            </Button>
            <Button type="button" onClick={() => void handleCancelCheckout()} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function PaymentFailedPage() {
  return (
    <PaymentStatusPage
      title="Payment Failed"
      description="We could not complete your payment. Please try again from checkout when you are ready."
      tone="failed"
    />
  );
}

export function PaymentCancelledPage() {
  const navigate = useNavigate();

  return (
    <PaymentStatusPage
      title="Payment Cancelled"
      description="This checkout has been cancelled. No order was created, and you can start a new checkout anytime."
      tone="failed"
      primaryActionLabel="Checkout Again"
      onPrimaryAction={() => navigate('/checkout')}
      secondaryActionLabel="Continue Shopping"
      onSecondaryAction={() => navigateToHome(navigate)}
    />
  );
}

export function PaymentExpiredPage() {
  const navigate = useNavigate();

  return (
    <PaymentStatusPage
      title="Payment Expired"
      description="This checkout has expired before payment was completed. No order was created."
      tone="failed"
      primaryActionLabel="Checkout Again"
      onPrimaryAction={() => navigate('/checkout')}
      secondaryActionLabel="Continue Shopping"
      onSecondaryAction={() => navigateToHome(navigate)}
    />
  );
}
