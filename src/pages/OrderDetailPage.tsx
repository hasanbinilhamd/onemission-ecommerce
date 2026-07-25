import { PackageSearch } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { OrderDetailView, useAuthenticatedCustomer } from '../features/customer';
import { cancelCustomerOrder, createReturnRequest, getOrderByNumber } from '../services/api/orderService';
import type { CommerceOrderDetail } from '../types';
import { ROUTES } from '../app/config/routes';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const {
    user,
    isLoading: isAuthLoading,
    errorMessage: authErrorMessage,
    isConfigured,
    getValidAccessToken,
  } = useAuthenticatedCustomer();
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isMutatingOrder, setIsMutatingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const authenticatedEmail = useMemo(() => normalizeEmail(user?.email || ''), [user?.email]);

  const loadOrder = useCallback(async () => {
    if (!orderNumber || !authenticatedEmail) {
      return;
    }

    setIsLoadingOrder(true);
    setErrorMessage(null);

    try {
      const accessToken = await getValidAccessToken();
      const nextOrder = await getOrderByNumber(orderNumber, accessToken || '');

      if (normalizeEmail(nextOrder.customerEmail) !== authenticatedEmail) {
        setOrder(null);
        setErrorMessage('This order could not be found for your signed-in account.');
        return;
      }

      setOrder(nextOrder);
    } catch (error) {
      setOrder(null);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load this order right now.');
    } finally {
      setIsLoadingOrder(false);
    }
  }, [authenticatedEmail, getValidAccessToken, orderNumber]);

  useEffect(() => {
    if (isAuthLoading || !orderNumber || !authenticatedEmail) {
      return;
    }

    void loadOrder();
  }, [authenticatedEmail, isAuthLoading, loadOrder, orderNumber]);

  const handleCancelOrder = useCallback(async ({ reason }: { reason: string }) => {
    if (!order) return;

    setIsMutatingOrder(true);
    try {
      const accessToken = await getValidAccessToken();
      const updatedOrder = await cancelCustomerOrder(order.id, reason, {
        accessToken: accessToken || '',
        email: order.customerEmail,
      });
      setOrder(updatedOrder);
      setActionFeedback({ tone: 'success', message: 'Order cancelled successfully.' });
    } catch (error) {
      setActionFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Order could not be cancelled right now.' });
    } finally {
      setIsMutatingOrder(false);
    }
  }, [getValidAccessToken, order]);

  const handleRequestReturn = useCallback(async (input: { reason: string; description: string; attachments: string[] }) => {
    if (!order) return;

    setIsMutatingOrder(true);
    try {
      const accessToken = await getValidAccessToken();
      const updatedOrder = await createReturnRequest(order.id, {
        ...input,
        email: order.customerEmail,
      }, accessToken || '');
      setOrder(updatedOrder);
      setActionFeedback({ tone: 'success', message: 'Return request submitted successfully.' });
    } catch (error) {
      setActionFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Return request could not be submitted right now.' });
    } finally {
      setIsMutatingOrder(false);
    }
  }, [getValidAccessToken, order]);

  const showLoadingState = isAuthLoading || isLoadingOrder;

  if (authErrorMessage) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{authErrorMessage}</div>;
  }

  if (!user?.email) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <EmptyState
          icon={<PackageSearch size={36} />}
          title={isConfigured ? 'Sign in to view this order' : 'Authentication is not configured'}
          description={isConfigured
            ? 'A signed-in customer session is required before we can display this order detail page.'
            : 'Customer authentication is not configured in this environment, so this page is unavailable right now.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => navigate(ROUTES.LOGIN)}>Login</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TRACK_ORDER)}>Track Order</Button>
            </div>
          }
        />
      </div>
    );
  }

  if (showLoadingState) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={5} /></div>
        <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={8} /></div>
      </div>
    );
  }

  if (!order || errorMessage) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <EmptyState
          icon={<PackageSearch size={36} />}
          title="Order not available"
          description={errorMessage || 'We could not load the requested order.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => navigate(ROUTES.ACCOUNT_ORDERS)}>My Orders</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TRACK_ORDER)}>Track Order</Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionFeedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${actionFeedback.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {actionFeedback.message}
        </div>
      ) : null}
      <OrderDetailView
        order={order}
        backLabel="Back to My Orders"
        onBack={() => navigate(ROUTES.ACCOUNT_ORDERS)}
        onCancelOrder={handleCancelOrder}
        onRequestReturn={handleRequestReturn}
        isMutating={isMutatingOrder}
      />
    </div>
  );
}
