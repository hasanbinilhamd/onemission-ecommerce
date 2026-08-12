import { Mail, MapPin, Package, Truck } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button, Modal } from '../../components/shared';
import { IMAGE_PLACEHOLDER } from '../../app/constants';
import type { CommerceOrderDetail, CommerceOrderProduct, CommerceOrderReturnRequest, CommerceOrderTimelineEntry } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatting';
import { productService } from '../../services/product';
import { TopBackNavigation } from '../navigation';
import { OrderPaymentStatusBadge, OrderStatusBadge } from './OrderStatusBadge';

interface OrderDetailViewProps {
  order: CommerceOrderDetail;
  backLabel?: string;
  onBack?: () => void;
  onCancelOrder?: (input: { reason: string }) => Promise<void>;
  onRequestReturn?: (input: { reason: string; description: string; attachments: string[]; resolution: 'REFUND' | 'REPLACEMENT'; items: Array<{ orderItemId: string; quantity: number }>; replacementItems?: Array<{ originalOrderItemId: string; replacementProductId: string; replacementVariantId: string; replacementQuantity: number; replacementNote?: string }> }) => Promise<void>;
  onOpenReview?: (item: CommerceOrderProduct) => void;
  reviewSubmittingItemId?: string;
  isMutating?: boolean;
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

interface CustomerTimelinePresentation {
  title: string;
  description: string;
  noteLines: string[];
  visible: boolean;
}

function splitTimelineNotes(notes: string) {
  return String(notes || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

async function readFilesAsDataUrls(files: FileList | File[]): Promise<string[]> {
  const items = Array.from(files || []);
  return Promise.all(items.map((file) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Photo evidence could not be read.'));
    reader.readAsDataURL(file);
  })));
}

function getReturnStatusLabel(returnRequest: CommerceOrderReturnRequest | null) {
  if (!returnRequest) {
    return 'None';
  }

  if (returnRequest.status === 'COMPLETED') return 'Completed';
  if (returnRequest.refundStatus === 'PAID') return 'Refund Paid';
  if (returnRequest.status === 'REFUND_PENDING') return 'Refund Pending';
  if (returnRequest.status === 'REPLACEMENT_PENDING') return 'Replacement Pending';
  if (returnRequest.status === 'REPLACEMENT_SENT') return 'Replacement Sent';
  if (returnRequest.status === 'INSPECTION_FAILED') return 'Inspection Failed';
  if (returnRequest.status === 'INSPECTING') return 'Inspection';
  if (returnRequest.status === 'RECEIVED') return 'Item Received';
  if (returnRequest.status === 'AWAITING_RETURN') return 'Please Return Item';
  if (returnRequest.status === 'REJECTED' || returnRequest.refundStatus === 'REJECTED') return 'Rejected';
  if (returnRequest.status === 'REQUESTED' || returnRequest.refundStatus === 'REQUESTED') return 'Return Requested';
  return 'Pending Review';
}

function getCustomerTimelinePresentation(entry: CommerceOrderTimelineEntry): CustomerTimelinePresentation {
  const eventName = String(entry.eventName || '').trim();
  const noteLines = splitTimelineNotes(entry.notes || '');

  switch (eventName) {
    case 'Order Created':
      return {
        title: 'Order Created',
        description: 'Order has been successfully created.',
        noteLines: [],
        visible: true,
      };
    case 'Payment Received':
      return {
        title: 'Payment Received',
        description: 'Your payment has been successfully confirmed.',
        noteLines: [],
        visible: true,
      };
    case 'WAITING_PAYMENT':
      return {
        title: 'Waiting Payment',
        description: 'Waiting for your payment confirmation.',
        noteLines,
        visible: true,
      };
    case 'PACKING_STARTED':
    case 'PICKING_STARTED':
      return {
        title: 'Packing Started',
        description: 'Our warehouse has started preparing your order.',
        noteLines,
        visible: true,
      };
    case 'READY_TO_SHIP':
      return {
        title: 'Ready to Ship',
        description: 'Your package has been packed and is waiting for courier pickup.',
        noteLines,
        visible: true,
      };
    case 'ORDER_SHIPPED':
      return {
        title: 'Shipment Dispatched',
        description: 'Your package has been handed over to the courier.',
        noteLines,
        visible: true,
      };
    case 'ORDER_DELIVERED':
      return {
        title: 'Delivered',
        description: 'Your order has been delivered successfully.',
        noteLines,
        visible: true,
      };
    case 'CANCELLED':
      return {
        title: 'Cancelled',
        description: 'Your order has been cancelled.',
        noteLines,
        visible: true,
      };
    case 'FULFILLMENT_CANCELLED':
      return {
        title: 'Fulfillment Cancelled',
        description: 'Fulfillment has been synchronized with the cancelled order.',
        noteLines,
        visible: true,
      };
    case 'ORDER_RESTORED':
      return {
        title: 'Order Restored',
        description: 'Your order has been restored after the refund request was rejected.',
        noteLines,
        visible: true,
      };
    case 'REFUNDED':
      return {
        title: 'Refunded',
        description: 'Your refund has been completed.',
        noteLines,
        visible: true,
      };
    case 'RETURN_REQUESTED':
      return {
        title: 'Return Requested',
        description: 'Your return request has been submitted for review.',
        noteLines,
        visible: true,
      };
    case 'RETURN_PENDING_REVIEW':
      return {
        title: 'Pending Review',
        description: 'Your return request is pending seller review.',
        noteLines,
        visible: true,
      };
    case 'RETURN_APPROVED':
    case 'REFUND_APPROVED':
      return {
        title: 'Refund Approved',
        description: 'Your refund request has been approved by HQ.',
        noteLines,
        visible: true,
      };
    case 'RETURN_REJECTED':
    case 'REFUND_REJECTED':
      return {
        title: 'Refund Rejected',
        description: 'Your refund request has been rejected by HQ.',
        noteLines,
        visible: true,
      };
    case 'REFUND_REQUESTED':
      return {
        title: 'Refund Requested',
        description: 'Your refund request is waiting HQ approval.',
        noteLines,
        visible: true,
      };
    case 'REFUND_PROCESSING':
      return {
        title: 'Refund Processing',
        description: 'Your refund is currently being processed by the payment gateway.',
        noteLines,
        visible: true,
      };
    case 'REFUND_COMPLETED':
      return {
        title: 'Refund Completed',
        description: 'The payment gateway has returned your funds successfully.',
        noteLines,
        visible: true,
      };
    case 'REFUND_FAILED':
      return {
        title: 'Refund Failed',
        description: 'The refund request could not be processed yet. Our team may retry it.',
        noteLines,
        visible: true,
      };
    default:
      if (eventName.startsWith('ORDER_STATUS_')) {
        return {
          title: '',
          description: '',
          noteLines: [],
          visible: false,
        };
      }

      return {
        title: '',
        description: '',
        noteLines: [],
        visible: false,
      };
  }
}

export function OrderDetailView({
  order,
  backLabel = 'Back',
  onBack,
  onCancelOrder,
  onRequestReturn,
  onOpenReview,
  reviewSubmittingItemId = '',
  isMutating = false,
}: OrderDetailViewProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Wrong Size');
  const [returnResolution, setReturnResolution] = useState<'REFUND' | 'REPLACEMENT'>('REFUND');
  const [returnItemQuantities, setReturnItemQuantities] = useState<Record<string, number>>({});
  const [replacementSelections, setReplacementSelections] = useState<Record<string, string>>({});
  const [replacementVariantOptions, setReplacementVariantOptions] = useState<Record<string, Array<{ id: string; label: string; productId: string }>>>({});
  const [returnDescription, setReturnDescription] = useState('');
  const [returnAttachments, setReturnAttachments] = useState<string[]>([]);
  const [returnAttachmentNames, setReturnAttachmentNames] = useState<string[]>([]);
  const [returnFormError, setReturnFormError] = useState('');

  useEffect(() => {
    if (!isReturnModalOpen) return;
    setReturnItemQuantities(
      Object.fromEntries((order.items || []).map((item) => [item.id, item.quantity > 0 ? 1 : 0])),
    );
    setReplacementSelections(
      Object.fromEntries((order.items || []).map((item) => [item.id, item.variantId])),
    );
  }, [isReturnModalOpen, order.items]);

  useEffect(() => {
    if (!isReturnModalOpen || returnResolution !== 'REPLACEMENT') return;
    let mounted = true;
    const loadReplacementVariants = async () => {
      const productIds = Array.from(new Set((order.items || []).map((item) => item.productId).filter(Boolean)));
      await productService.ensureProductDetailsLoadedByIds(productIds);
      if (!mounted) return;
      const nextOptions: Record<string, Array<{ id: string; label: string; productId: string }>> = {};
      productIds.forEach((productId) => {
        const product = productService.getCachedProductById(productId);
        nextOptions[productId] = (product?.variants || []).map((variant) => ({
          id: variant.id,
          productId,
          label: [variant.color, variant.size].filter(Boolean).join(' / ') || variant.variantName || variant.sku,
        }));
      });
      setReplacementVariantOptions(nextOptions);
    };
    void loadReplacementVariants();
    return () => { mounted = false; };
  }, [isReturnModalOpen, order.items, returnResolution]);

  const sortedTimeline = [...order.timeline]
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
    .map((entry) => ({
      entry,
      presentation: getCustomerTimelinePresentation(entry),
    }))
    .filter(({ presentation }) => presentation.visible);

  const handleSubmitCancelOrder = async () => {
    if (!cancelReason.trim() || !onCancelOrder) {
      return;
    }

    await onCancelOrder({ reason: cancelReason.trim() });
    setIsCancelModalOpen(false);
    setCancelReason('');
  };

  const handleAttachmentChange = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setReturnAttachments([]);
      setReturnAttachmentNames([]);
      return;
    }

    const nextFiles = Array.from(files).slice(0, 5);
    const invalidFile = nextFiles.find((file) => !file.type.startsWith('image/'));
    if (invalidFile) {
      setReturnFormError('Only image files are allowed for photo evidence.');
      return;
    }

    const dataUrls = await readFilesAsDataUrls(nextFiles);
    setReturnAttachments(dataUrls);
    setReturnAttachmentNames(nextFiles.map((file) => file.name));
    setReturnFormError('');
  };

  const handleSubmitReturnRequest = async () => {
    if (!onRequestReturn) return;

    if (!returnDescription.trim()) {
      setReturnFormError('Please describe your return request.');
      return;
    }

    const selectedItems = Object.entries(returnItemQuantities)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity: Number(quantity || 0) }))
      .filter((item) => item.quantity > 0);

    if (selectedItems.length === 0) {
      setReturnFormError('Please select at least one item to return.');
      return;
    }

    await onRequestReturn({
      reason: returnReason,
      description: returnDescription.trim(),
      attachments: returnAttachments,
      resolution: returnResolution,
      items: selectedItems,
      replacementItems: returnResolution === 'REPLACEMENT'
        ? selectedItems.map((item) => {
            const originalOrderItem = order.items.find((entry) => entry.id === item.orderItemId);
            return {
              originalOrderItemId: item.orderItemId,
              replacementProductId: originalOrderItem?.productId || '',
              replacementVariantId: replacementSelections[item.orderItemId] || originalOrderItem?.variantId || '',
              replacementQuantity: item.quantity,
              replacementNote: '',
            };
          })
        : [],
    });

    setIsReturnModalOpen(false);
    setReturnReason('Wrong Size');
    setReturnResolution('REFUND');
    setReturnItemQuantities({});
    setReplacementSelections({});
    setReturnDescription('');
    setReturnAttachments([]);
    setReturnAttachmentNames([]);
    setReturnFormError('');
  };


  const renderReviewAction = (item: CommerceOrderProduct) => {
    if (item.review?.isReviewed) {
      return (
        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Reviewed
        </span>
      );
    }

    if (!item.review?.canReview || !onOpenReview) {
      return null;
    }

    return (
      <Button
        type="button"
        variant="secondary"
        className="gap-2"
        disabled={isMutating || reviewSubmittingItemId === item.id}
        onClick={() => onOpenReview(item)}
      >
        {reviewSubmittingItemId === item.id ? 'Submitting...' : 'Write Review'}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          {onBack ? <TopBackNavigation label={backLabel} onBack={onBack} /> : null}
          <div>
            <h1 className="m-0 text-3xl font-semibold text-neutral-950 sm:text-4xl">
              Order Details
            </h1>
            <p className="mt-2 text-sm font-medium text-neutral-700">
              {order.publicOrderNumber}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Created on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <OrderPaymentStatusBadge status={order.payment?.status || 'UNKNOWN'} />
            <OrderStatusBadge status={order.status || order.fulfillmentStatusLabel || order.fulfillmentStatus} />
          </div>
          <div className="flex flex-wrap gap-2">
            {order.actions?.canCancel && onCancelOrder ? (
              <Button type="button" variant="secondary" onClick={() => setIsCancelModalOpen(true)} disabled={isMutating}>
                Cancel Order
              </Button>
            ) : null}
            {order.actions?.canRequestReturn && onRequestReturn ? (
              <Button type="button" variant="secondary" onClick={() => setIsReturnModalOpen(true)} disabled={isMutating}>
                Request Return
              </Button>
            ) : null}
          </div>
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
                {onOpenReview ? <th className="w-[14%] px-0 py-3 text-right font-semibold">Action</th> : null}
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
                  {onOpenReview ? (
                    <td className="py-4 text-right">
                      <div className="flex justify-end">{renderReviewAction(item)}</div>
                    </td>
                  ) : null}
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
              {onOpenReview ? (
                <div className="mt-4 flex justify-end">
                  {renderReviewAction(item)}
                </div>
              ) : null}
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
              {sortedTimeline.map(({ entry, presentation }, index) => (
                <div key={entry.id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-black" />
                  {index < sortedTimeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-neutral-200" />
                  )}
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="m-0 text-sm font-semibold text-neutral-950">{presentation.title}</p>
                      </div>
                      <p className="m-0 text-sm text-neutral-500">
                        {formatDateTime(entry.createdAt || entry.timestamp)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{presentation.description}</p>
                    {presentation.noteLines.length > 0 ? (
                      <div className="mt-3 grid gap-1 text-sm leading-6 text-neutral-600">
                        {presentation.noteLines.map((line, lineIndex) => (
                          <p key={`${entry.id}-mobile-note-${lineIndex}`} className="m-0">{line}</p>
                        ))}
                      </div>
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

      {order.returnRequest ? (
        <SectionCard icon={<Package size={18} />} title="Return">
          <DetailRow label="Status" value={getReturnStatusLabel(order.returnRequest)} />
          <DetailRow label="Request Type" value={order.returnRequest.requestType || 'PRODUCT_RETURN'} />
          <DetailRow label="Resolution" value={order.returnRequest.resolution || 'REFUND'} />
          <DetailRow label="Reason" value={order.returnRequest.reason || '—'} />
          <DetailRow label="Description" value={order.returnRequest.description || '—'} />
          {order.returnRequest.items?.length ? (
            <div className="rounded-2xl border border-neutral-200 p-4">
              <p className="m-0 mb-3 text-sm font-semibold text-neutral-950">Return Items</p>
              <div className="grid gap-2">
                {order.returnRequest.items.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                    <span>{entry.orderItem?.productName || entry.orderItemId}</span>
                    <span className="font-semibold">Qty {entry.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DetailRow label="Refund Status" value={order.returnRequest.refundStatus || 'NONE'} />
          {order.returnRequest.resolution !== 'REPLACEMENT' ? (
            <DetailRow label="Refund Amount" value={Number(order.returnRequest.refundAmount || 0) > 0 ? formatCurrency(order.returnRequest.refundAmount, order.currency) : '—'} />
          ) : null}
          <DetailRow label="Requested At" value={formatDateTime(order.returnRequest.refundRequestedAt || order.returnRequest.requestedAt)} />
          <DetailRow label="Approved At" value={formatDateTime(order.returnRequest.refundApprovedAt || order.returnRequest.approvedAt)} />
          <DetailRow label="Processing At" value={formatDateTime(order.returnRequest.refundProcessingAt)} />
          <DetailRow label="Completed At" value={formatDateTime(order.returnRequest.refundCompletedAt || order.returnRequest.completedAt)} />
          {order.returnRequest.rejectReason ? (
            <DetailRow label="Reject Reason" value={order.returnRequest.rejectReason} />
          ) : null}
          {order.returnRequest.refundStatus === 'PROCESSING' ? (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
Refund is being reviewed by our team.
            </div>
          ) : null}
          {order.returnRequest.refundStatus === 'COMPLETED' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
Refund has been paid successfully.
            </div>
          ) : null}
          {order.returnRequest.refundStatus === 'FAILED' ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
Refund could not be processed yet. Our team will follow up manually.
            </div>
          ) : null}
          {order.returnRequest.timeline?.length ? (
            <div className="grid gap-3 pt-3">
              {order.returnRequest.timeline.map((entry) => (
                <div key={`${entry.status}-${entry.timestamp}`} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="m-0 text-sm font-semibold text-neutral-950">{entry.label}</p>
                    <p className="m-0 text-sm text-neutral-500">{formatDateTime(entry.timestamp)}</p>
                  </div>
                  {entry.notes ? (
                    <div className="mt-3 grid gap-1 text-sm leading-6 text-neutral-600">
                      {String(entry.notes).split('\n').filter(Boolean).map((line, lineIndex) => (
                        <p key={`${entry.status}-note-${lineIndex}`} className="m-0">{line}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          {order.returnRequest.attachments?.length ? (
            <div className="grid gap-3 pt-3 sm:grid-cols-2 lg:grid-cols-3">
              {order.returnRequest.attachments.map((attachment, index) => (
                <a
                  key={`${order.returnRequest?.id}-attachment-${index}`}
                  href={attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50"
                >
                  <img src={attachment} alt={`Return evidence ${index + 1}`} className="h-40 w-full object-cover" />
                </a>
              ))}
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      <div className="hidden md:block">
        <SectionCard icon={<Truck size={18} />} title="Order Timeline">
          {sortedTimeline.length === 0 ? (
            <p className="m-0 text-sm text-neutral-500">No order timeline is available yet.</p>
          ) : (
            <div className="relative ml-2 grid gap-5">
              {sortedTimeline.map(({ entry, presentation }, index) => (
                <div key={entry.id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-black" />
                  {index < sortedTimeline.length - 1 && (
                    <span className="absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-neutral-200" />
                  )}
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="m-0 text-sm font-semibold text-neutral-950">{presentation.title}</p>
                      </div>
                      <p className="m-0 text-sm text-neutral-500">
                        {formatDateTime(entry.createdAt || entry.timestamp)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{presentation.description}</p>
                    {presentation.noteLines.length > 0 ? (
                      <div className="mt-3 grid gap-1 text-sm leading-6 text-neutral-600">
                        {presentation.noteLines.map((line, lineIndex) => (
                          <p key={`${entry.id}-desktop-note-${lineIndex}`} className="m-0">{line}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <Modal open={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Order?">
        <div className="grid gap-4">
          <p className="m-0 text-sm leading-6 text-neutral-600">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900" htmlFor="cancel-order-reason">
              Reason for cancellation
            </label>
            <textarea
              id="cancel-order-reason"
              rows={4}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button type="button" onClick={() => void handleSubmitCancelOrder()} disabled={isMutating || !cancelReason.trim()}>
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title="Request Return">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900">
              Resolution
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setReturnResolution('REFUND')}
                className={`rounded-2xl border px-4 py-3 text-left text-sm ${returnResolution === 'REFUND' ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-700'}`}
              >
                <span className="block font-semibold">Refund</span>
                <span className="block text-xs opacity-75">Request money back.</span>
              </button>
              <button
                type="button"
                onClick={() => setReturnResolution('REPLACEMENT')}
                className={`rounded-2xl border px-4 py-3 text-left text-sm ${returnResolution === 'REPLACEMENT' ? 'border-neutral-950 bg-neutral-950 text-white' : 'border-neutral-200 text-neutral-700'}`}
              >
                <span className="block font-semibold">Replacement</span>
                <span className="block text-xs opacity-75">Request item exchange/replacement.</span>
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900">
              Items to Return
            </label>
            <div className="grid gap-2">
              {(order.items || []).map((item) => (
                <div key={item.id} className="grid gap-3 rounded-2xl border border-neutral-200 p-3 sm:grid-cols-[1fr_120px] sm:items-center">
                  <div>
                    <p className="m-0 text-sm font-semibold text-neutral-950">{item.productName}</p>
                    <p className="m-0 text-xs text-neutral-500">{item.variantName} · Purchased {item.quantity}</p>
                  </div>
                  <div className="grid gap-2">
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={returnItemQuantities[item.id] ?? 0}
                      onChange={(event) => {
                        const nextQuantity = Math.max(0, Math.min(item.quantity, Number(event.target.value || 0)));
                        setReturnItemQuantities((current) => ({ ...current, [item.id]: nextQuantity }));
                      }}
                      className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                    />
                    {returnResolution === 'REPLACEMENT' ? (
                      <>
                      <select
                        value={replacementSelections[item.id] || item.variantId}
                        onChange={(event) => setReplacementSelections((current) => ({ ...current, [item.id]: event.target.value }))}
                        className="w-full rounded-2xl border border-neutral-200 px-4 py-2 text-sm outline-none focus:border-neutral-900"
                      >
                        {(replacementVariantOptions[item.productId]?.length ? replacementVariantOptions[item.productId] : [{ id: item.variantId, productId: item.productId, label: item.variantName }]).map((replacementOption) => (
                          <option key={replacementOption.id} value={replacementOption.id}>
                            Replace with {item.productName} / {replacementOption.label}
                          </option>
                        ))}
                      </select>
                      <p className="m-0 text-xs text-neutral-500">Replacement Qty: {returnItemQuantities[item.id] ?? 0}</p>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900" htmlFor="return-reason-select">
              Reason
            </label>
            <select
              id="return-reason-select"
              value={returnReason}
              onChange={(event) => setReturnReason(event.target.value)}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            >
              {['Wrong Size', 'Wrong Item', 'Damaged Product', 'Defect', 'Other'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900" htmlFor="return-description">
              Description
            </label>
            <textarea
              id="return-description"
              rows={4}
              value={returnDescription}
              onChange={(event) => setReturnDescription(event.target.value)}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-900" htmlFor="return-photo-evidence">
              Photo Evidence (max 5)
            </label>
            <input
              id="return-photo-evidence"
              type="file"
              accept="image/*"
              multiple
              onChange={async (event) => {
                try {
                  await handleAttachmentChange(event.target.files);
                } catch (error) {
                  setReturnFormError(error instanceof Error ? error.message : 'Photo evidence could not be processed.');
                }
              }}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm"
            />
            {returnAttachmentNames.length > 0 ? (
              <p className="m-0 text-xs text-neutral-500">{returnAttachmentNames.join(', ')}</p>
            ) : null}
          </div>
          {returnFormError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {returnFormError}
            </div>
          ) : null}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsReturnModalOpen(false)}>
              Keep Order
            </Button>
            <Button type="button" onClick={() => void handleSubmitReturnRequest()} disabled={isMutating}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
