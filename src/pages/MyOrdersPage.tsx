import { PackageSearch, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { orderDetailPath, ROUTES } from '../app/config/routes';
import { CustomerPageHeader, CustomerPageShell, OrderPaymentStatusBadge, OrderStatusBadge, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import { getOrdersByCustomerEmail } from '../services/api/orderService';
import type { CommerceOrderListItem } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function MyOrdersPageContent() {
  const navigate = useNavigate();
  const {
    user,
    isLoading: isAuthLoading,
    errorMessage: authErrorMessage,
    isConfigured,
    getValidAccessToken,
  } = useAuthenticatedCustomer();
  const [orders, setOrders] = useState<CommerceOrderListItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authenticatedEmail = useMemo(() => normalizeEmail(user?.email || ''), [user?.email]);

  useEffect(() => {
    if (isAuthLoading || !authenticatedEmail) {
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      setErrorMessage(null);

      try {
        const accessToken = await getValidAccessToken();
        const nextOrders = await getOrdersByCustomerEmail(authenticatedEmail, accessToken || '');
        if (!isMounted) {
          return;
        }

        setOrders(nextOrders);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOrders([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load your orders right now.');
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [authenticatedEmail, getValidAccessToken, isAuthLoading]);

  const showLoadingState = isAuthLoading || isLoadingOrders;

  return (
    <CustomerPageShell>
      <CustomerPageHeader
        sectionLabel="Orders"
        title="My Orders"
        description="Review your most recent orders first and follow each fulfillment update."
      />

        {authErrorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {authErrorMessage}
          </div>
        ) : !user?.email ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <EmptyState
              icon={<ShoppingBag size={36} />}
              title={isConfigured ? 'Sign in to view your orders' : 'Authentication is not configured'}
              description={isConfigured
                ? 'A signed-in customer session is required before we can display your order history.'
                : 'Customer authentication is not configured in this environment, so My Orders is unavailable right now.'}
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
          <div className="space-y-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={5} />
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={5} />
            </div>
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
            <EmptyState
              title="Unable to load your orders"
              description={errorMessage}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button type="button" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.TRACK_ORDER)}>
                    Track Order
                  </Button>
                </div>
              }
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <EmptyState
              icon={<PackageSearch size={36} />}
              title="You don't have any orders yet."
              description="Orders connected to your signed-in email will appear here automatically after payment is completed."
              action={<Button type="button" onClick={() => navigate(ROUTES.HOME)}>Start Shopping</Button>}
            />
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-3xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-600">
              Signed in as <span className="font-semibold text-neutral-950">{user.email}</span>
            </div>

            <section className="hidden overflow-hidden rounded-3xl border border-neutral-200 bg-white md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-[0.12em] text-neutral-400">
                      <th className="px-6 py-4 font-semibold">Order Number</th>
                      <th className="px-6 py-4 font-semibold">Created Date</th>
                      <th className="px-6 py-4 font-semibold">Grand Total</th>
                      <th className="px-6 py-4 font-semibold">Payment Status</th>
                      <th className="px-6 py-4 font-semibold">Fulfillment Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-100 last:border-b-0">
                        <td className="px-6 py-5 font-mono text-xs text-neutral-600">{order.orderNumber}</td>
                        <td className="px-6 py-5 text-neutral-600">{formatDate(order.orderDate)}</td>
                        <td className="px-6 py-5 font-semibold text-neutral-950">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-6 py-5"><OrderPaymentStatusBadge status={order.paymentStatus} /></td>
                        <td className="px-6 py-5"><OrderStatusBadge status={order.fulfillmentStatusLabel || order.fulfillmentStatus} /></td>
                        <td className="px-6 py-5 text-right">
                          <Button type="button" variant="ghost" size="sm" onClick={() => navigate(orderDetailPath(order.orderNumber))}>
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid gap-4 md:hidden">
              {orders.map((order) => (
                <article key={order.id} className="rounded-3xl border border-neutral-200 bg-white p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Order Number</p>
                      <p className="mt-1 font-mono text-xs text-neutral-600">{order.orderNumber}</p>
                    </div>
                    <OrderStatusBadge status={order.fulfillmentStatusLabel || order.fulfillmentStatus} />
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Created Date</p>
                      <p className="mt-1 text-neutral-700">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Grand Total</p>
                      <p className="mt-1 font-semibold text-neutral-950">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Payment Status</p>
                      <div className="mt-1">
                        <OrderPaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </div>
                  </div>
                  <Button type="button" className="mt-5 w-full" onClick={() => navigate(orderDetailPath(order.orderNumber))}>
                    View Details
                  </Button>
                </article>
              ))}
            </div>
          </>
        )}
    </CustomerPageShell>
  );
}

export function MyOrdersPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <MyOrdersPageContent />
    </NavigationThemeProvider>
  );
}
