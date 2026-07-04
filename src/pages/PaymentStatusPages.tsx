import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/shared';

interface PaymentStatusPageProps {
  title: string;
  description: string;
  tone: 'success' | 'pending' | 'failed';
}

function PaymentStatusPage({ title, description, tone }: PaymentStatusPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = query.get('order_id') || '-';
  const status = query.get('transaction_status') || '-';
  const statusCode = query.get('status_code') || '-';

  const icon = tone === 'success'
    ? <CheckCircle2 size={42} />
    : tone === 'pending'
      ? <Clock3 size={42} />
      : <XCircle size={42} />;

  const iconColor = tone === 'success'
    ? '#15803D'
    : tone === 'pending'
      ? '#B45309'
      : '#B91C1C';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '9999px', backgroundColor: `${iconColor}14`, color: iconColor, marginBottom: '24px' }}>
          {icon}
        </div>
        <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
          Payment Status
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', color: '#111827', lineHeight: 1.1 }}>
          {title}
        </h1>
        <p style={{ margin: '0 auto 28px', maxWidth: '520px', fontSize: '15px', lineHeight: 1.7, color: '#6B7280' }}>
          {description}
        </p>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: '20px', padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Order Reference</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{orderId}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Transaction Status</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right', textTransform: 'capitalize' }}>{status}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Status Code</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#111827', textAlign: 'right' }}>{statusCode}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/cart')}>
            View Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  return (
    <PaymentStatusPage
      title="Payment Successful"
      description="Your payment has been received successfully. We are now processing your order confirmation from ONEMISSION HQ."
      tone="success"
    />
  );
}

export function PaymentPendingPage() {
  return (
    <PaymentStatusPage
      title="Payment Pending"
      description="Your payment is still pending. Please complete the payment from Midtrans or wait for the provider confirmation."
      tone="pending"
    />
  );
}

export function PaymentFailedPage() {
  return (
    <PaymentStatusPage
      title="Payment Failed"
      description="We could not complete your payment. Please try again from checkout when you are ready."
      tone="failed"
    />
  );
}
