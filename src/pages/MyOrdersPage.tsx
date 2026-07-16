import { PackageSearch, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, Input, LoadingSkeleton, Select } from '../components/shared';
import { orderDetailPath, ROUTES } from '../app/config/routes';
import { OrderPaymentStatusBadge, OrderStatusBadge, useAuthenticatedCustomer } from '../features/customer';
import { getOrdersByCustomerEmail } from '../services/api/orderService';
import type { CommerceOrderListItem } from '../types';
import { formatCurrency, formatDate } from '../utils/formatting';

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'READY_FOR_FULFILLMENT', label: 'READY_FOR_FULFILLMENT' },
  { value: 'PROCESSING', label: 'PROCESSING' },
  { value: 'SHIPPED', label: 'SHIPPED' },
  { value: 'DELIVERED', label: 'DELIVERED' },
  { value: 'COMPLETED', label: 'COMPLETED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
  { value: 'REFUND_REQUESTED', label: 'REFUND_REQUESTED' },
  { value: 'REFUND_APPROVED', label: 'REFUND_APPROVED' },
  { value: 'REFUND_PROCESSING', label: 'REFUND_PROCESSING' },
  { value: 'REFUND_COMPLETED', label: 'REFUND_COMPLETED' },
  { value: 'REFUND_REJECTED', label: 'REFUND_REJECTED' },
  { value: 'REFUND_FAILED', label: 'REFUND_FAILED' },
];

const PAGE_SIZE = 10;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getOrderStatusValue(order: CommerceOrderListItem) {
  return String(order.status || order.fulfillmentStatusLabel || order.fulfillmentStatus || '').trim().toUpperCase();
}

function getRefundStatusValue(order: CommerceOrderListItem) {
  const refundStatus = String(order.returnRequest?.refundStatus || '').trim().toUpperCase();
  return refundStatus ? `REFUND_${refundStatus}` : '';
}

export function MyOrdersPage() {
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = !searchTerm.trim() || order.publicOrderNumber.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all'
        || getOrderStatusValue(order) === statusFilter
        || getRefundStatusValue(order) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, page]);

  const showLoadingState = isAuthLoading || isLoadingOrders;

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
          icon={<ShoppingBag size={36} />}
          title={isConfigured ? 'Sign in to view your orders' : 'Authentication is not configured'}
          description={isConfigured
            ? 'A signed-in customer session is required before we can display your order history.'
            : 'Customer authentication is not configured in this environment, so My Orders is unavailable right now.'}
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

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400">My Orders</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Order History</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Track your public order numbers, payment status, and shipping progress.</p>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <Input
            label="Search Order"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by public order number"
          />
          <Select label="Filter Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {ORDER_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{errorMessage}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <EmptyState
            icon={<PackageSearch size={36} />}
            title="You don't have any orders yet."
            description="Orders connected to your signed-in email will appear here automatically after payment is completed."
            action={<Button type="button" onClick={() => navigate(ROUTES.HOME)}>Start Shopping</Button>}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedOrders.map((order) => (
              <article key={order.id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Order Number</p>
                      <p className="mt-2 font-mono text-sm font-semibold text-neutral-900">{order.publicOrderNumber}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Created Date</p>
                      <p className="mt-2 text-sm text-neutral-900">{formatDate(order.orderDate)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Grand Total</p>
                      <p className="mt-2 text-sm font-semibold text-neutral-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Total Items</p>
                      <p className="mt-2 text-sm text-neutral-900">{order.totalItems}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[220px] lg:items-end">
                    <div className="flex flex-wrap gap-2">
                      <OrderPaymentStatusBadge status={order.paymentStatus} />
                      <OrderStatusBadge status={order.status || order.fulfillmentStatusLabel || order.fulfillmentStatus} />
                      {order.returnRequest?.refundStatus && order.returnRequest.refundStatus !== 'NONE' ? (
                        <OrderStatusBadge status={`REFUND_${order.returnRequest.refundStatus}`} />
                      ) : null}
                    </div>
                    <Button type="button" variant="secondary" onClick={() => navigate(orderDetailPath(order.publicOrderNumber))}>
                      View Details
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm text-neutral-500">Showing page {page} of {totalPages} — {filteredOrders.length} matching orders</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
