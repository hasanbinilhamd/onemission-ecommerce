import { PackageSearch } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { OrderDetailView, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { getOrderById } from '../services/api/orderService';
import type { CommerceOrderDetail } from '../types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function OrderDetailPageContent() {
  const navigate = useNavigate();
  const { orderId = '' } = useParams<{ orderId: string }>();
  const { user, isLoading: isAuthLoading, errorMessage: authErrorMessage, isConfigured } = useAuthenticatedCustomer();
  const [order, setOrder] = useState<CommerceOrderDetail | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authenticatedEmail = useMemo(() => normalizeEmail(user?.email || ''), [user?.email]);

  useEffect(() => {
    if (isAuthLoading || !orderId || !authenticatedEmail) {
      return;
    }

    let isMounted = true;

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setErrorMessage(null);

      try {
        const nextOrder = await getOrderById(orderId);
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
  }, [authenticatedEmail, isAuthLoading, orderId]);

  const showLoadingState = isAuthLoading || isLoadingOrder;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                  <Button type="button" onClick={() => navigate('/track-order')}>
                    Track Order as Guest
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate('/account/orders')}>
                    Back to My Orders
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
                  <Button type="button" onClick={() => navigate('/account/orders')}>
                    Back to My Orders
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate('/track-order')}>
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
            onBack={() => navigate('/account/orders')}
          />
        )}
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <OrderDetailPageContent />
    </NavigationThemeProvider>
  );
}
