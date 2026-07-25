import { Badge } from '../../components/shared';
import type { CommerceOrderPaymentStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: string;
}

interface OrderPaymentStatusBadgeProps {
  status: CommerceOrderPaymentStatus;
}

function normalizeStatusLabel(value: string) {
  return value.trim().toUpperCase() || 'UNKNOWN';
}

function getFulfillmentBadgeVariant(status: string) {
  switch (normalizeStatusLabel(String(status || ''))) {
    case 'WAITING_PAYMENT':
      return 'warning';
    case 'READY_FOR_FULFILLMENT':
      return 'default';
    case 'PROCESSING':
      return 'info';
    case 'PACKED':
    case 'READY_TO_SHIP':
      return 'warning';
    case 'SHIPPED':
      return 'info';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    case 'RETURN_REJECTED':
    case 'REFUND_REJECTED':
      return 'error';
    case 'RETURN_REQUESTED':
    case 'REFUND_REQUESTED':
      return 'warning';
    case 'RETURN_APPROVED':
    case 'REFUND_APPROVED':
      return 'info';
    case 'REFUND_PROCESSING':
      return 'info';
    case 'REFUND_COMPLETED':
    case 'RETURNED':
      return 'success';
    case 'REFUND_FAILED':
      return 'error';
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
