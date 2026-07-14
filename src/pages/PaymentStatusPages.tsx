import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, LoadingSkeleton } from '../components/shared';
import { OrderDetailView, useAuthenticatedCustomer } from '../features/customer';
import { createPaymentAttempt, generateSnapToken } from '../services/api/checkoutService';
import { cancelCustomerOrder, getOrderByCheckoutSessionId } from '../services/api/orderService';
import { openMidtransSnap } from '../services/payment/midtransSnap';
import { useCartStore } from '../stores';
import type { CommerceOrderDetail } from '../types';
import { formatCurrency } from '../utils/formatting';

const CLEARED_CHECKOUT_SESSION_STORAGE_KEY = 'onemission-cleared-checkout-session-id';

function isSuccessfulPaymentStatus(value: string | null): boolean {
  const normalized = String(value || '').trim().toUpperCase();
  return normalized === 'PAID' || normalized === 'SETTLEMENT';
}

interface PaymentStatusPageProps {
  title: string;
  description: string;
  tone: 'success' | 'pending' | 'failed';
}

function PaymentStatusPage({ title, description, tone }: PaymentStatusPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = query.get('order_id') || '-';
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
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Order Reference</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{orderId}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Transaction Status</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{status}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
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
        const order = await getOrderByCheckoutSessionId(checkoutSessionId);
        if (isMounted) {
          setPublicOrderNumber(order.publicOrderNumber || '');
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
        <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
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
          <Button type="button" onClick={() => navigate('/')}>
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
  const { getValidAccessToken } = useAuthenticatedCustomer();
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const checkoutSessionId = query.get('checkout_session_id') || '';

  const loadOrder = useCallback(async () => {
    if (!checkoutSessionId) return;

    setIsLoadingOrder(true);
    try {
      const nextOrder = await getOrderByCheckoutSessionId(checkoutSessionId);
      setOrder(nextOrder);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Waiting payment order could not be loaded.');
      setOrder(null);
    } finally {
      setIsLoadingOrder(false);
    }
  }, [checkoutSessionId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleContinuePayment = useCallback(async () => {
    if (!checkoutSessionId) return;

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
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'settlement'));
          params.set('status_code', String(result.status_code || '200'));
          params.set('payment_attempt_id', nextAttempt.id);
          params.set('checkout_session_id', checkoutSessionId);
          params.set('payment_method', String(result.payment_type || result.payment_method || 'Midtrans'));
          params.set('paid_amount', String(result.gross_amount || order?.grandTotal || 0));
          navigate(`/payment/success?${params.toString()}`);
        },
        onPending: (result) => {
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'pending'));
          params.set('status_code', String(result.status_code || '201'));
          params.set('payment_attempt_id', nextAttempt.id);
          params.set('checkout_session_id', checkoutSessionId);
          navigate(`/payment/pending?${params.toString()}`);
        },
        onError: (result) => {
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'failed'));
          params.set('status_code', String(result.status_code || '500'));
          params.set('payment_attempt_id', nextAttempt.id);
          params.set('checkout_session_id', checkoutSessionId);
          navigate(`/payment/failed?${params.toString()}`);
        },
        onClose: () => {
          setIsSubmitting(false);
          setStatusMessage('Payment window closed. You can continue payment later using the same order.');
        },
      });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to continue payment right now.');
      setIsSubmitting(false);
    }
  }, [checkoutSessionId, navigate, order?.grandTotal]);

  const handleCancelOrder = useCallback(async ({ reason }: { reason: string }) => {
    if (!order) return;

    setIsSubmitting(true);
    try {
      const accessToken = await getValidAccessToken();
      const updatedOrder = await cancelCustomerOrder(order.id, reason, {
        accessToken: accessToken || '',
        email: order.customerEmail,
      });
      setOrder(updatedOrder);
      setStatusMessage('Order cancelled successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Order could not be cancelled right now.');
    } finally {
      setIsSubmitting(false);
    }
  }, [getValidAccessToken, order]);

  if (isLoadingOrder) {
    return (
      <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <LoadingSkeleton rows={5} />
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!order) {
    return (
      <PaymentStatusPage
        title="Waiting Payment"
        description={statusMessage || 'Your payment is still pending. Please complete the payment or cancel the order.'}
        tone="pending"
      />
    );
  }

  return (
    <div className="space-y-4">
      {statusMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {statusMessage}
        </div>
      ) : null}
      <OrderDetailView
        order={order}
        backLabel="Back to Home"
        onBack={() => navigate('/')}
        onCancelOrder={handleCancelOrder}
        isMutating={isSubmitting}
      />
      <div className="flex justify-end">
        <Button type="button" onClick={() => void handleContinuePayment()} disabled={isSubmitting}>
          Continue Payment
        </Button>
      </div>
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
