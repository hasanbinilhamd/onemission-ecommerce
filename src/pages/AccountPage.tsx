import { CalendarDays, Mail, MapPinned, Package2, Phone, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, orderDetailPath } from '../app/config/routes';
import { Button, EmptyState, LoadingSkeleton } from '../components/shared';
import { OrderPaymentStatusBadge, OrderStatusBadge, useAuthenticatedCustomer } from '../features/customer';
import { listCustomerAddresses } from '../services/api/customerService';
import { getOrdersByCustomerEmail } from '../services/api/orderService';
import type { CommerceOrderListItem, CustomerAddress } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AccountPage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isLoading,
    errorMessage,
    getValidAccessToken,
  } = useAuthenticatedCustomer();

  const [orders, setOrders] = useState<CommerceOrderListItem[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setAddresses([]);
      setIsLoadingOverview(false);
      return;
    }

    let isMounted = true;

    const loadOverview = async () => {
      setIsLoadingOverview(true);

      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) {
          return;
        }

        const [nextOrders, nextAddresses] = await Promise.all([
          getOrdersByCustomerEmail(normalizeEmail(user.email), accessToken),
          listCustomerAddresses(accessToken),
        ]);

        if (!isMounted) {
          return;
        }

        setOrders(nextOrders);
        setAddresses(nextAddresses);
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isMounted = false;
    };
  }, [getValidAccessToken, user?.email]);

  const joinedDate = useMemo(() => (user?.createdAt ? formatDate(user.createdAt) : '—'), [user?.createdAt]);
  const completedOrders = useMemo(() => orders.filter((order) => String(order.status || '').toUpperCase() === 'COMPLETED').length, [orders]);
  const pendingOrders = useMemo(() => orders.filter((order) => String(order.status || '').toUpperCase() !== 'COMPLETED').length, [orders]);
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <LoadingSkeleton rows={4} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={3} /></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={3} /></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={3} /></div>
          <div className="rounded-3xl bg-white p-6 shadow-sm"><LoadingSkeleton rows={3} /></div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 text-2xl font-semibold uppercase text-white">
            {profile.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-2xl font-semibold text-neutral-950">{profile.fullName || user.customerName}</h2>
            <div className="mt-4 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
              <p className="m-0 inline-flex items-center gap-2"><Package2 size={16} /> {user.customerCode || user.id}</p>
              <p className="m-0 inline-flex items-center gap-2"><Mail size={16} /> {user.email}</p>
              <p className="m-0 inline-flex items-center gap-2"><Phone size={16} /> {user.phone || '—'}</p>
              <p className="m-0 inline-flex items-center gap-2"><CalendarDays size={16} /> Joined {joinedDate}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package2 },
          { label: 'Completed Orders', value: completedOrders, icon: ShoppingBag },
          { label: 'Pending Orders', value: pendingOrders, icon: Package2 },
          { label: 'Saved Addresses', value: addresses.length, icon: MapPinned },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-neutral-950">{isLoadingOverview ? '—' : card.value}</p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700">
                  <Icon size={18} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5">
            <h3 className="m-0 text-xl font-semibold text-neutral-950">Recent Orders</h3>
            <p className="mt-1 text-sm text-neutral-500">Your 5 most recent orders.</p>
          </div>

          {isLoadingOverview ? (
            <LoadingSkeleton rows={5} />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={<span className="text-4xl">📦</span>}
              title="No Orders Yet"
              description="Start shopping to see your purchases here."
              action={<Button type="button" onClick={() => navigate(ROUTES.HOME)}>Shop Now</Button>}
            />
          ) : (
            <div className="grid gap-4">
              {recentOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => navigate(orderDetailPath(order.publicOrderNumber))}
                  className="flex flex-col gap-3 rounded-2xl bg-neutral-50 px-4 py-4 text-left transition-colors hover:bg-neutral-100"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Order Number</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-neutral-900">{order.publicOrderNumber}</p>
                    </div>
                    <OrderStatusBadge status={order.status || order.fulfillmentStatusLabel || order.fulfillmentStatus} />
                  </div>
                  <div className="grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Created Date</p>
                      <p className="mt-1 text-neutral-900">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Total</p>
                      <p className="mt-1 text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Payment</p>
                      <div className="mt-1"><OrderPaymentStatusBadge status={order.paymentStatus} /></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
