import { ChevronLeft, Mail, MapPin, Package, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../components/shared';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import type { CommerceOrderDetail } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { OrderPaymentStatusBadge, OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailViewProps {
  order: CommerceOrderDetail;
  backLabel?: string;
  onBack?: () => void;
}

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
        {label}
      </p>
      <div className="text-sm font-medium text-neutral-900 sm:max-w-[65%] sm:text-right">
        {value}
      </div>
    </div>
  );
}

function SectionCard({ icon, title, children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
          {icon}
        </div>
        <div>
          <h2 className="m-0 text-lg font-semibold text-neutral-950">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function buildShippingAddress(order: CommerceOrderDetail) {
  return [
    order.shipping.streetAddress,
    order.shipping.districtName,
    order.shipping.cityName,
    order.shipping.provinceName,
    order.shipping.postalCode,
  ].filter(Boolean).join(', ');
}

export function OrderDetailView({ order, backLabel = 'Back', onBack }: OrderDetailViewProps) {
  const sortedTimeline = [...order.timeline].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          {onBack && (
            <Button type="button" variant="ghost" size="sm" className="w-fit gap-2" onClick={onBack}>
              <ChevronLeft size={16} />
              {backLabel}
            </Button>
          )}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Order Detail
            </p>
            <h1 className="m-0 text-3xl font-semibold text-neutral-950 sm:text-4xl">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OrderPaymentStatusBadge status={order.payment?.status || 'UNKNOWN'} />
          <OrderStatusBadge status={order.fulfillmentStatusLabel || order.fulfillmentStatus} />
        </div>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Grand Total
            </p>
            <p className="m-0 text-2xl font-semibold text-neutral-950">
              {formatCurrency(order.grandTotal, order.currency)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Courier
            </p>
            <p className="m-0 text-base font-medium text-neutral-900">
              {order.shipment.courier || order.shipping.courier || '—'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Service
            </p>
            <p className="m-0 text-base font-medium text-neutral-900">
              {order.shipment.service || order.shipping.courierService || '—'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Tracking Number
            </p>
            <p className="m-0 text-base font-medium text-neutral-900 break-all">
              {order.shipment.trackingNumber || '—'}
            </p>
          </div>
        </div>
      </section>

      <SectionCard icon={<Package size={18} />} title="Products">
        <div className="hidden md:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-[0.12em] text-neutral-400">
                <th className="w-[36%] px-0 py-3 font-semibold">Product</th>
                <th className="w-[18%] px-3 py-3 font-semibold">Variant</th>
                <th className="w-[14%] px-3 py-3 font-semibold">SKU</th>
                <th className="w-[10%] px-3 py-3 text-right font-semibold">Quantity</th>
                <th className="w-[11%] px-3 py-3 text-right font-semibold">Unit Price</th>
                <th className="w-[11%] px-0 py-3 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-b-0 align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage || IMAGE_PLACEHOLDER}
                        alt={item.productName}
                        className="h-14 w-14 rounded-2xl border border-neutral-200 bg-neutral-50 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="m-0 break-words font-semibold text-neutral-950">{item.productName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-neutral-600">
                    <span className="block break-words">{item.variantName || '—'}</span>
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-neutral-500">
                    <span className="block break-all">{item.sku || '—'}</span>
                  </td>
                  <td className="px-3 py-4 text-right font-medium text-neutral-900">{item.quantity}</td>
                  <td className="px-3 py-4 text-right font-medium text-neutral-700">
                    {formatCurrency(item.price, item.currency)}
                  </td>
                  <td className="py-4 text-right font-semibold text-neutral-950">
                    {formatCurrency(item.subtotal, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 md:hidden">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex items-start gap-4">
                <img
                  src={item.productImage || IMAGE_PLACEHOLDER}
                  alt={item.productName}
                  className="h-20 w-20 rounded-2xl border border-neutral-200 bg-neutral-50 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-semibold text-neutral-950">{item.productName}</p>
                  <p className="mt-1 text-sm text-neutral-500">{item.variantName || '—'}</p>
                  <p className="mt-1 font-mono text-xs text-neutral-500">{item.sku || '—'}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Quantity</p>
                  <p className="mt-1 font-medium text-neutral-900">{item.quantity}</p>
                </div>
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Subtotal</p>
                  <p className="mt-1 font-medium text-neutral-900">{formatCurrency(item.subtotal, item.currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="md:hidden">
        <SectionCard icon={<Truck size={18} />} title="Order Timeline">
          {sortedTimeline.length === 0 ? (
            <p className="m-0 text-sm text-neutral-500">No order timeline is available yet.</p>
          ) : (
            <div className="relative ml-2 grid gap-5">
              {sortedTimeline.map((entry, index) => (
                <div key={entry.id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-black" />
                  {index < sortedTimeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-neutral-200" />
                  )}
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="m-0 text-sm font-semibold text-neutral-950">{entry.eventName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-400">
                          Updated by {entry.updatedBy || 'System'}
                        </p>
                      </div>
                      <p className="m-0 text-sm text-neutral-500">
                        {formatDateTime(entry.createdAt || entry.timestamp)}
                      </p>
                    </div>
                    {entry.notes ? (
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{entry.notes}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard icon={<Mail size={18} />} title="Customer">
          <DetailRow label="Name" value={order.customerName || '—'} />
          <DetailRow label="Email" value={order.customerEmail || '—'} />
          <DetailRow label="Phone" value={order.customerPhone || '—'} />
        </SectionCard>

        <SectionCard icon={<MapPin size={18} />} title="Shipping Address">
          <DetailRow label="Recipient" value={order.shipping.recipientName || '—'} />
          <DetailRow label="Recipient Phone" value={order.shipping.recipientPhone || '—'} />
          <DetailRow label="Address" value={buildShippingAddress(order) || order.shipping.address || '—'} />
          <DetailRow label="Courier" value={order.shipment.courier || order.shipping.courier || '—'} />
          <DetailRow label="Service" value={order.shipment.service || order.shipping.courierService || '—'} />
          <DetailRow label="Tracking Number" value={order.shipment.trackingNumber || '—'} />
          <DetailRow label="Shipping Date" value={formatDateTime(order.shipment.shippingDate)} />
          <DetailRow label="Estimated Delivery" value={order.shipping.estimatedDelivery || '—'} />
        </SectionCard>
      </div>

      <div className="hidden md:block">
        <SectionCard icon={<Truck size={18} />} title="Order Timeline">
          {sortedTimeline.length === 0 ? (
            <p className="m-0 text-sm text-neutral-500">No order timeline is available yet.</p>
          ) : (
            <div className="relative ml-2 grid gap-5">
              {sortedTimeline.map((entry, index) => (
                <div key={entry.id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-black" />
                  {index < sortedTimeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-neutral-200" />
                  )}
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="m-0 text-sm font-semibold text-neutral-950">{entry.eventName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-400">
                          Updated by {entry.updatedBy || 'System'}
                        </p>
                      </div>
                      <p className="m-0 text-sm text-neutral-500">
                        {formatDateTime(entry.createdAt || entry.timestamp)}
                      </p>
                    </div>
                    {entry.notes ? (
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{entry.notes}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
