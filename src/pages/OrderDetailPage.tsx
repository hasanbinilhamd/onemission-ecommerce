import { PackageSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, OrderDetailView, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { getOrderByNumber } from '../services/api/orderService';
import type { CommerceOrderDetail } from '../types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function OrderDetailPageContent() {
  const navigate = useNavigate();
  const { orderNumber = '' } = useParams<{ orderNumber: string }>();
  const { user, isLoading: isAuthLoading, errorMessage: authErrorMessage, isConfigured } = useAuthenticatedCustomer();
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authenticatedEmail = useMemo(() => normalizeEmail(user?.email || ''), [user?.email]);

  useEffect(() => {
    if (isAuthLoading || !orderNumber || !authenticatedEmail) {
      return;
    }

    let isMounted = true;

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setErrorMessage(null);

      try {
        const nextOrder = await getOrderByNumber(orderNumber);
        if (!isMounted) {
          return;
        }

        if (normalizeEmail(nextOrder.customerEmail) !== authenticatedEmail) {
          setOrder(null);
          setErrorMessage('This order could not be found for your signed-in account.');
          return;
        }

        setOrder(nextOrder);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOrder(null);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this order right now.');
      } finally {
        if (isMounted) {
          setIsLoadingOrder(false);
        }
      }
    };

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [authenticatedEmail, isAuthLoading, orderNumber]);

  const showLoadingState = isAuthLoading || isLoadingOrder;

  return (
    <CustomerPageShell maxWidth="1200px">
      <CustomerPageHeader
        sectionLabel="Orders"
        title={orderNumber || 'Order Detail'}
        description="Review your order details, shipping progress, and fulfillment timeline."
      />

      {authErrorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {authErrorMessage}
          </div>
        ) : !user?.email ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <EmptyState
              icon={<PackageSearch size={36} />}
              title={isConfigured ? 'Sign in to view this order' : 'Authentication is not configured'}
              description={isConfigured
                ? 'A signed-in customer session is required before we can display this order detail page.'
                : 'Supabase authentication is not configured in this environment, so this page is unavailable right now.'}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => navigate(ROUTES.LOGIN)}>
                    Login
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TRACK_ORDER)}>
                    Track Order
                  </Button>
                </div>
              }
            />
          </div>
        ) : showLoadingState ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={5} />
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={8} />
            </div>
          </div>
        ) : !order || errorMessage ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <EmptyState
              icon={<PackageSearch size={36} />}
              title="Order not available"
              description={errorMessage || 'We could not load the requested order.'}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => navigate(ROUTES.ORDERS)}>
                    Back to My Orders
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TRACK_ORDER)}>
                    Track Order as Guest
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <OrderDetailView
            order={order}
            backLabel="Back to My Orders"
            onBack={() => navigate(ROUTES.ORDERS)}
          />
        )}
    </CustomerPageShell>
  );
}

export function OrderDetailPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <OrderDetailPageContent />
    </NavigationThemeProvider>
  );
}
