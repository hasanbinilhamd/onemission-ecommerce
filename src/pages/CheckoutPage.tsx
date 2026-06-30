import { ShoppingCart } from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, Input } from '../components/shared';
import {
  CheckoutOrderSummary,
  CheckoutPlaceholderCard,
  CheckoutSection,
} from '../features/checkout';
import { NavigationThemeProvider } from '../features/navigation';
import {
  useCartStore,
  useCheckoutStore,
  type CheckoutContactField,
  type CheckoutContactInformation,
} from '../stores';
import { isEmail, isRequired } from '../utils/validation';

type ContactValidationErrors = Partial<Record<CheckoutContactField, string>>;
type ContactTouchedState = Record<CheckoutContactField, boolean>;

const CONTACT_FIELDS: CheckoutContactField[] = ['firstName', 'lastName', 'email', 'phoneNumber'];

const initialTouchedState: ContactTouchedState = {
  firstName: false,
  lastName: false,
  email: false,
  phoneNumber: false,
};

function validateContactField(field: CheckoutContactField, value: string): string | undefined {
  switch (field) {
    case 'firstName':
      return isRequired(value) ? undefined : 'First name is required.';
    case 'lastName':
      return isRequired(value) ? undefined : 'Last name is required.';
    case 'email':
      if (!isRequired(value)) return 'Email is required.';
      return isEmail(value) ? undefined : 'Enter a valid email address.';
    case 'phoneNumber':
      return isRequired(value) ? undefined : 'Phone number is required.';
    default:
      return undefined;
  }
}

function validateContactInformation(
  contactInformation: CheckoutContactInformation,
): ContactValidationErrors {
  return CONTACT_FIELDS.reduce<ContactValidationErrors>((errors, field) => {
    const error = validateContactField(field, contactInformation[field]);

    if (error) {
      errors[field] = error;
    }

    return errors;
  }, {});
}

function CheckoutPageContent() {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const { checkout, updateContactField } = useCheckoutStore();
  const [touched, setTouched] = useState<ContactTouchedState>(initialTouchedState);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const contactInformation = checkout.contactInformation;
  const isCartEmpty = cart.items.length === 0;

  const hasValidationErrors = useMemo(
    () => Object.values(errors).some(Boolean),
    [errors],
  );

  const handleContactChange =
    (field: CheckoutContactField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      updateContactField(field, nextValue);
      setStatusMessage('');

      if (touched[field] || hasAttemptedSubmit) {
        setErrors(previous => ({
          ...previous,
          [field]: validateContactField(field, nextValue),
        }));
      }
    };

  const handleContactBlur =
    (field: CheckoutContactField) =>
    () => {
      setTouched(previous => ({ ...previous, [field]: true }));
      setErrors(previous => ({
        ...previous,
        [field]: validateContactField(field, contactInformation[field]),
      }));
    };

  const handleContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateContactInformation(contactInformation);
    const nextTouchedState = CONTACT_FIELDS.reduce<ContactTouchedState>((fields, field) => ({
      ...fields,
      [field]: true,
    }), initialTouchedState);

    setHasAttemptedSubmit(true);
    setTouched(nextTouchedState);
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setStatusMessage('');
      return;
    }

    setStatusMessage('Shipping selection will be available in the next sprint.');
  };

  if (isCartEmpty) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <EmptyState
            icon={<ShoppingCart size={40} />}
            title="Your cart is empty."
            description="Add products to your cart before continuing to checkout."
            action={
              <Button type="button" onClick={() => navigate('/cart')}>
                Return to Cart
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', maxWidth: '720px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
            Checkout
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: '#111827' }}>
            Complete your checkout details
          </h1>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
            This sprint prepares the checkout foundation. Shipping, delivery and payment will be activated progressively in future sprints.
          </p>
        </div>

        <div
          className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10"
          style={{ display: 'grid', gap: '32px', alignItems: 'start' }}
        >
          <form onSubmit={handleContinue} noValidate style={{ display: 'grid', gap: '24px' }}>
            <CheckoutSection
              stepLabel="Section 1"
              title="Contact Information"
              description="Enter the contact details we will use for your upcoming order communication."
            >
              <div className="sm:grid sm:grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                <Input
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  value={contactInformation.firstName}
                  onChange={handleContactChange('firstName')}
                  onBlur={handleContactBlur('firstName')}
                  error={touched.firstName || hasAttemptedSubmit ? errors.firstName : undefined}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  value={contactInformation.lastName}
                  onChange={handleContactChange('lastName')}
                  onBlur={handleContactBlur('lastName')}
                  error={touched.lastName || hasAttemptedSubmit ? errors.lastName : undefined}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={contactInformation.email}
                  onChange={handleContactChange('email')}
                  onBlur={handleContactBlur('email')}
                  error={touched.email || hasAttemptedSubmit ? errors.email : undefined}
                />
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={contactInformation.phoneNumber}
                  onChange={handleContactChange('phoneNumber')}
                  onBlur={handleContactBlur('phoneNumber')}
                  error={touched.phoneNumber || hasAttemptedSubmit ? errors.phoneNumber : undefined}
                />
              </div>
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 2"
              title="Shipping Address"
              description="Address fields are prepared here and will become interactive in the next sprint."
            >
              <div className="sm:grid sm:grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                <Input label="Country" placeholder="Select country" disabled />
                <Input label="Province" placeholder="Select province" disabled />
                <Input label="City" placeholder="Select city" disabled />
                <Input label="District" placeholder="Select district" disabled />
                <Input label="Postal Code" placeholder="Enter postal code" disabled />
                <Input label="Street Address" placeholder="Enter street address" disabled />
              </div>
              <p style={{ margin: '16px 0 0', fontSize: '12px', lineHeight: 1.6, color: '#6B7280' }}>
                Shipping options will become available after completing your address.
              </p>
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 3"
              title="Delivery Method"
              description="Delivery logic is intentionally held for a future sprint."
            >
              <CheckoutPlaceholderCard message="Delivery options will be available in the next sprint.">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', opacity: 0.75 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      Delivery selection is temporarily disabled
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                      Shipping carrier choices will appear here.
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  />
                </div>
              </CheckoutPlaceholderCard>
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 4"
              title="Payment Method"
              description="Payment architecture is reserved for the next sprint without changing this layout."
            >
              <CheckoutPlaceholderCard message="Payment will be available in the next sprint.">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', opacity: 0.75 }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                      Payment selection is temporarily disabled
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                      Your payment choices will appear here in a future sprint.
                    </p>
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '9999px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  />
                </div>
              </CheckoutPlaceholderCard>
            </CheckoutSection>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button type="submit">
                  Continue
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/cart')}>
                  Return to Cart
                </Button>
              </div>

              <p
                aria-live="polite"
                role={statusMessage ? 'status' : undefined}
                style={{
                  margin: 0,
                  minHeight: '24px',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: statusMessage ? '#111827' : hasValidationErrors ? '#DC2626' : '#6B7280',
                }}
              >
                {statusMessage || (hasValidationErrors ? 'Please complete the required contact fields.' : 'Complete your contact information to continue.')}
              </p>
            </div>
          </form>

          <CheckoutOrderSummary className="lg:sticky lg:top-24" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <CheckoutPageContent />
    </NavigationThemeProvider>
  );
}
