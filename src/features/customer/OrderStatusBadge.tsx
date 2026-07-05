import { Badge } from '../../components/shared';
import type {
  CommerceOrderFulfillmentStatus,
  CommerceOrderPaymentStatus,
} from '../../types';

interface OrderStatusBadgeProps {
  status: CommerceOrderFulfillmentStatus;
}

interface OrderPaymentStatusBadgeProps {
  status: CommerceOrderPaymentStatus;
}

function normalizeStatusLabel(value: string) {
  return value.trim().toUpperCase() || 'UNKNOWN';
}

function getFulfillmentBadgeVariant(status: CommerceOrderFulfillmentStatus) {
  switch (normalizeStatusLabel(String(status || ''))) {
    case 'READY_FOR_FULFILLMENT':
      return 'default';
    case 'PROCESSING':
      return 'info';
    case 'PACKED':
      return 'warning';
    case 'SHIPPED':
      return 'info';
    case 'COMPLETED':
      return 'success';
    default:
      return 'default';
  }
}

function getPaymentBadgeVariant(status: CommerceOrderPaymentStatus) {
  switch (normalizeStatusLabel(String(status || ''))) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    case 'EXPIRED':
      return 'default';
    case 'CREATED':
      return 'info';
    default:
      return 'default';
  }
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = normalizeStatusLabel(String(status || 'UNKNOWN'));

  return (
    <Badge
      variant={getFulfillmentBadgeVariant(status)}
      className="gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-[0.08em]"
    >
      {label}
    </Badge>
  );
}

export function OrderPaymentStatusBadge({ status }: OrderPaymentStatusBadgeProps) {
  const label = normalizeStatusLabel(String(status || 'UNKNOWN'));

  return (
    <Badge
      variant={getPaymentBadgeVariant(status)}
      className="gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-[0.08em]"
    >
      {label}
    </Badge>
  );
}
