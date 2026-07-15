import { Clock3, PackageSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, LoadingSkeleton, Select } from '../components/shared';
import { ROUTES } from '../app/config/routes';
import { useAuthenticatedCustomer } from '../features/customer';
import { listCheckoutHistory } from '../services/api/checkoutService';
import type { CommerceCheckoutHistoryItem } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';

const CHECKOUT_STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'CANCELLED', label: 'CANCELLED' },
  { value: 'EXPIRED', label: 'EXPIRED' },
];

function getCheckoutStatusValue(item: CommerceCheckoutHistoryItem) {
  return String(item.status || '').trim().toUpperCase();
}

function canContinuePayment(item: CommerceCheckoutHistoryItem) {
  const checkoutStatus = getCheckoutStatusValue(item);
  const paymentStatus = String(item.paymentAttemptStatus || '').trim().toUpperCase();
  return (checkoutStatus === 'DRAFT' || checkoutStatus === 'PENDING') && (paymentStatus === 'CREATED' || paymentStatus === 'PENDING');
}

export function CheckoutHistoryPage() {
  const navigate = useNavigate();
  const {
    user,
    isLoading: isAuthLoading,
    errorMessage: authErrorMessage,
    isConfigured,
    getValidAccessToken,
  } = useAuthenticatedCustomer();
  const [history, setHistory] = useState<CommerceCheckoutHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (isAuthLoading || !user?.email) {
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setErrorMessage(null);

      try {
        const accessToken = await getValidAccessToken();
        const response = await listCheckoutHistory(accessToken || '', 1, 100);
        if (!isMounted) {
          return;
        }

        setHistory(response.data || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setHistory([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load your checkout history right now.');
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [getValidAccessToken, isAuthLoading, user?.email]);

  const filteredHistory = useMemo(() => (
    history.filter((item) => statusFilter === 'all' || getCheckoutStatusValue(item) === statusFilter)
  ), [history, statusFilter]);

  const showLoadingState = isAuthLoading || isLoadingHistory;

  if (showLoadingState) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <LoadingSkeleton rows={4} />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (authErrorMessage) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{authErrorMessage}</div>;
  }

  if (!user?.email) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <EmptyState
          icon={<Clock3 size={36} />}
          title={isConfigured ? 'Sign in to view your checkout history' : 'Authentication is not configured'}
          description={isConfigured
            ? 'A signed-in customer session is required before we can display your checkout history.'
            : 'Customer authentication is not configured in this environment, so Checkout History is unavailable right now.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => navigate(ROUTES.LOGIN)}>Login</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.HOME)}>Continue Shopping</Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400">Checkout History</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Pending, Cancelled, and Expired Checkouts</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Continue payment for active checkouts or start a new checkout when a session is cancelled or expired.</p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[260px]">
          <Select label="Filter Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {CHECKOUT_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{errorMessage}</div>
      ) : filteredHistory.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <EmptyState
            icon={<PackageSearch size={36} />}
            title="No checkout history found."
            description="Your active or unfinished checkout sessions will appear here automatically."
            action={<Button type="button" onClick={() => navigate(ROUTES.HOME)}>Start Shopping</Button>}
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredHistory.map((item) => {
            const pending = canContinuePayment(item);
            return (
              <article key={item.id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Checkout Reference</p>
                      <p className="mt-2 font-mono text-sm font-semibold text-neutral-900">{item.checkoutNumber}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Created Date</p>
                      <p className="mt-2 text-sm text-neutral-900">{formatDate(item.createdAt)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Grand Total</p>
                      <p className="mt-2 text-sm font-semibold text-neutral-900">{formatCurrency(item.grandTotal)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Items</p>
                      <p className="mt-2 text-sm text-neutral-900">{item.itemCount}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[260px] lg:items-end">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700">
                        {item.status}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-700">
                        {item.paymentAttemptStatus || 'NO ATTEMPT'}
                      </span>
                    </div>
                    <div className="text-right text-sm text-neutral-500">
                      <p className="m-0">Payment: {item.paymentMethod || 'Midtrans Snap'}</p>
                      <p className="mt-1">Expires: {formatDate(item.expiresAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {pending && item.paymentAttemptId ? (
                        <Button type="button" variant="secondary" onClick={() => navigate(`/payment/pending?checkout_session_id=${encodeURIComponent(item.id)}&payment_attempt_id=${encodeURIComponent(item.paymentAttemptId)}`)}>
                          Continue Payment
                        </Button>
                      ) : null}
                      <Button type="button" onClick={() => navigate(ROUTES.CHECKOUT)}>
                        Checkout Again
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
