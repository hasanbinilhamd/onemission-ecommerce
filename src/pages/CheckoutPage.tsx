import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState, Input, Select } from '../components/shared';
import {
  CheckoutOrderSummary,
  CheckoutPlaceholderCard,
  CheckoutSection,
  CheckoutSelectionCard,
} from '../features/checkout';
import { NavigationThemeProvider } from '../features/navigation';
import {
  useCartStore,
  useCheckoutStore,
  type CheckoutContactField,
  type CheckoutContactInformation,
  type CheckoutDeliveryOption,
  type CheckoutPaymentOption,
  type CheckoutShippingAddress,
  type CheckoutShippingField,
} from '../stores';
import {
  MOCK_CHECKOUT_LOCATIONS,
  MOCK_DELIVERY_OPTIONS,
  MOCK_PAYMENT_OPTIONS,
} from '../mocks/checkout';
import { formatCurrency } from '../utils/formatting';
import { isEmail, isRequired } from '../utils/validation';

type CheckoutSectionKey = 'contact' | 'shipping' | 'delivery' | 'payment';
type ContactValidationErrors = Partial<Record<CheckoutContactField, string>>;
type ShippingValidationErrors = Partial<Record<CheckoutShippingField, string>>;
type ContactTouchedState = Record<CheckoutContactField, boolean>;
type ShippingTouchedState = Record<CheckoutShippingField, boolean>;
type SectionCompletionState = Record<CheckoutSectionKey, boolean>;

const CONTACT_FIELDS: CheckoutContactField[] = ['firstName', 'lastName', 'email', 'phoneNumber'];
const SHIPPING_FIELDS: CheckoutShippingField[] = ['country', 'province', 'city', 'district', 'postalCode', 'streetAddress'];

const initialContactTouchedState: ContactTouchedState = {
  firstName: false,
  lastName: false,
  email: false,
  phoneNumber: false,
};

const initialShippingTouchedState: ShippingTouchedState = {
  country: false,
  province: false,
  city: false,
  district: false,
  postalCode: false,
  streetAddress: false,
};

const initialSectionCompletionState: SectionCompletionState = {
  contact: false,
  shipping: false,
  delivery: false,
  payment: false,
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

function validateShippingField(field: CheckoutShippingField, value: string): string | undefined {
  switch (field) {
    case 'country':
      return isRequired(value) ? undefined : 'Country is required.';
    case 'province':
      return isRequired(value) ? undefined : 'Province is required.';
    case 'city':
      return isRequired(value) ? undefined : 'City is required.';
    case 'district':
      return isRequired(value) ? undefined : 'District is required.';
    case 'postalCode':
      return isRequired(value) ? undefined : 'Postal code is required.';
    case 'streetAddress':
      return isRequired(value) ? undefined : 'Street address is required.';
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

function validateShippingAddress(
  shippingAddress: CheckoutShippingAddress,
): ShippingValidationErrors {
  return SHIPPING_FIELDS.reduce<ShippingValidationErrors>((errors, field) => {
    const error = validateShippingField(field, shippingAddress[field]);

    if (error) {
      errors[field] = error;
    }

    return errors;
  }, {});
}

function hasErrors<T extends string>(errors: Partial<Record<T, string>>): boolean {
  return Object.values(errors).some(Boolean);
}

function buildContactSummary(contactInformation: CheckoutContactInformation) {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        {contactInformation.firstName} {contactInformation.lastName}
      </p>
      <a href={`mailto:${contactInformation.email}`} style={{ fontSize: '14px', color: '#111827', textDecoration: 'none' }}>
        {contactInformation.email}
      </a>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        {contactInformation.phoneNumber}
      </p>
    </div>
  );
}

function buildShippingSummary(shippingAddress: CheckoutShippingAddress) {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        {shippingAddress.streetAddress}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        {shippingAddress.district}, {shippingAddress.city}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        {shippingAddress.province}, {shippingAddress.country} {shippingAddress.postalCode}
      </p>
    </div>
  );
}

function buildDeliverySummary(deliveryMethod: CheckoutDeliveryOption) {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        {deliveryMethod.serviceName}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        {deliveryMethod.courierName}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        Estimated delivery {deliveryMethod.estimatedDelivery} · {formatCurrency(deliveryMethod.price)}
      </p>
    </div>
  );
}

function buildPaymentSummary(paymentMethod: CheckoutPaymentOption) {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        {paymentMethod.label}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        {paymentMethod.description}
      </p>
    </div>
  );
}

function getCompletionBadge() {
  return (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 size={12} aria-hidden="true" />
      Completed
    </Badge>
  );
}

function CheckoutPageContent() {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const {
    checkout,
    updateContactField,
    updateShippingAddress,
    updateShippingField,
    setDeliveryMethod,
    setPaymentMethod,
  } = useCheckoutStore();

  const [expandedSection, setExpandedSection] = useState<CheckoutSectionKey | null>('contact');
  const [sectionCompletion, setSectionCompletion] = useState<SectionCompletionState>(initialSectionCompletionState);
  const [contactTouched, setContactTouched] = useState<ContactTouchedState>(initialContactTouchedState);
  const [shippingTouched, setShippingTouched] = useState<ShippingTouchedState>(initialShippingTouchedState);
  const [contactErrors, setContactErrors] = useState<ContactValidationErrors>({});
  const [shippingErrors, setShippingErrors] = useState<ShippingValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState('');

  const isCartEmpty = cart.items.length === 0;
  const contactInformation = checkout.contactInformation;
  const shippingAddress = checkout.shippingAddress;

  const selectedCountry = useMemo(
    () => MOCK_CHECKOUT_LOCATIONS.find((country) => country.name === shippingAddress.country) ?? null,
    [shippingAddress.country],
  );
  const provinceOptions = useMemo(
    () => selectedCountry?.provinces ?? [],
    [selectedCountry],
  );
  const selectedProvince = useMemo(
    () => provinceOptions.find((province) => province.name === shippingAddress.province) ?? null,
    [provinceOptions, shippingAddress.province],
  );
  const cityOptions = useMemo(
    () => selectedProvince?.cities ?? [],
    [selectedProvince],
  );
  const selectedCity = useMemo(
    () => cityOptions.find((city) => city.name === shippingAddress.city) ?? null,
    [cityOptions, shippingAddress.city],
  );
  const districtOptions = useMemo(
    () => selectedCity?.districts ?? [],
    [selectedCity],
  );

  const nextContactErrors = useMemo(
    () => validateContactInformation(contactInformation),
    [contactInformation],
  );
  const nextShippingErrors = useMemo(
    () => validateShippingAddress(shippingAddress),
    [shippingAddress],
  );

  const isContactValid = !hasErrors(nextContactErrors);
  const isShippingValid = !hasErrors(nextShippingErrors);
  const shippingUnlocked = isContactValid;
  const deliveryUnlocked = isShippingValid;
  const paymentUnlocked = Boolean(checkout.deliveryMethod);
  const canPlaceOrder = isContactValid && isShippingValid && Boolean(checkout.deliveryMethod) && Boolean(checkout.paymentMethod);

  const resetDeliveryAndPayment = () => {
    setDeliveryMethod(null);
    setPaymentMethod(null);
    setSectionCompletion((previous) => ({
      ...previous,
      delivery: false,
      payment: false,
    }));
  };

  const handleContactChange =
    (field: CheckoutContactField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      updateContactField(field, nextValue);
      setSectionCompletion((previous) => ({ ...previous, contact: false }));
      setStatusMessage('');

      if (contactTouched[field]) {
        setContactErrors((previous) => ({
          ...previous,
          [field]: validateContactField(field, nextValue),
        }));
      }
    };

  const handleContactBlur =
    (field: CheckoutContactField) =>
    () => {
      setContactTouched((previous) => ({ ...previous, [field]: true }));
      setContactErrors((previous) => ({
        ...previous,
        [field]: validateContactField(field, contactInformation[field]),
      }));
    };

  const handleShippingTextChange =
    (field: CheckoutShippingField) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      updateShippingField(field, nextValue);
      setSectionCompletion((previous) => ({ ...previous, shipping: false }));
      resetDeliveryAndPayment();
      setStatusMessage('');

      if (shippingTouched[field]) {
        setShippingErrors((previous) => ({
          ...previous,
          [field]: validateShippingField(field, nextValue),
        }));
      }
    };

  const handleShippingBlur =
    (field: CheckoutShippingField) =>
    () => {
      setShippingTouched((previous) => ({ ...previous, [field]: true }));
      setShippingErrors((previous) => ({
        ...previous,
        [field]: validateShippingField(field, shippingAddress[field]),
      }));
    };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCountry = event.target.value;

    updateShippingAddress({
      country: nextCountry,
      province: '',
      city: '',
      district: '',
      postalCode: '',
    });
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPayment();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      country: true,
      province: false,
      city: false,
      district: false,
      postalCode: false,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      country: validateShippingField('country', nextCountry),
      province: undefined,
      city: undefined,
      district: undefined,
      postalCode: undefined,
    }));
  };

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextProvince = event.target.value;

    updateShippingAddress({
      province: nextProvince,
      city: '',
      district: '',
      postalCode: '',
    });
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPayment();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      province: true,
      city: false,
      district: false,
      postalCode: false,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      province: validateShippingField('province', nextProvince),
      city: undefined,
      district: undefined,
      postalCode: undefined,
    }));
  };

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCity = event.target.value;

    updateShippingAddress({
      city: nextCity,
      district: '',
      postalCode: '',
    });
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPayment();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      city: true,
      district: false,
      postalCode: false,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      city: validateShippingField('city', nextCity),
      district: undefined,
      postalCode: undefined,
    }));
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDistrict = event.target.value;
    const matchingDistrict = districtOptions.find((district) => district.name === nextDistrict) ?? null;
    const nextPostalCode = matchingDistrict?.postalCode ?? '';

    updateShippingAddress({
      district: nextDistrict,
      postalCode: nextPostalCode,
    });
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPayment();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      district: true,
      postalCode: true,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      district: validateShippingField('district', nextDistrict),
      postalCode: validateShippingField('postalCode', nextPostalCode),
    }));
  };

  const handleSaveContact = () => {
    setContactTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    });
    setContactErrors(nextContactErrors);
    setStatusMessage('');

    if (hasErrors(nextContactErrors)) {
      return;
    }

    setSectionCompletion((previous) => ({ ...previous, contact: true }));
    setExpandedSection(sectionCompletion.shipping ? null : 'shipping');
  };

  const handleSaveShipping = () => {
    setShippingTouched({
      country: true,
      province: true,
      city: true,
      district: true,
      postalCode: true,
      streetAddress: true,
    });
    setShippingErrors(nextShippingErrors);
    setStatusMessage('');

    if (hasErrors(nextShippingErrors)) {
      return;
    }

    setSectionCompletion((previous) => ({ ...previous, shipping: true }));
    setExpandedSection(sectionCompletion.delivery ? null : 'delivery');
  };

  const handleDeliverySelection = (option: CheckoutDeliveryOption) => {
    setDeliveryMethod(option);
    setSectionCompletion((previous) => ({ ...previous, delivery: true }));
    setExpandedSection(sectionCompletion.payment ? null : 'payment');
    setStatusMessage('');
  };

  const handlePaymentSelection = (option: CheckoutPaymentOption) => {
    setPaymentMethod(option);
    setSectionCompletion((previous) => ({ ...previous, payment: true }));
    setExpandedSection(null);
    setStatusMessage('');
  };

  const handlePlaceOrder = () => {
    if (!canPlaceOrder) {
      return;
    }

    setStatusMessage('Payment integration will be available in the next sprint.');
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
            Complete each checkout section progressively on this page. The next section becomes available as soon as the current details are valid.
          </p>
        </div>

        <div
          className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10"
          style={{ display: 'grid', gap: '32px', alignItems: 'start' }}
        >
          <div style={{ display: 'grid', gap: '24px' }}>
            <CheckoutSection
              stepLabel="Section 1"
              title="Contact Information"
              description="Enter the contact details we will use for your upcoming order communication."
              statusBadge={sectionCompletion.contact ? getCompletionBadge() : undefined}
              action={
                sectionCompletion.contact ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedSection('contact')}>
                    Edit
                  </Button>
                ) : undefined
              }
            >
              {sectionCompletion.contact && expandedSection !== 'contact' ? (
                buildContactSummary(contactInformation)
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div className="sm:grid sm:grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                    <Input
                      label="First Name"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      value={contactInformation.firstName}
                      onChange={handleContactChange('firstName')}
                      onBlur={handleContactBlur('firstName')}
                      error={contactTouched.firstName ? contactErrors.firstName : undefined}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      value={contactInformation.lastName}
                      onChange={handleContactChange('lastName')}
                      onBlur={handleContactBlur('lastName')}
                      error={contactTouched.lastName ? contactErrors.lastName : undefined}
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
                      error={contactTouched.email ? contactErrors.email : undefined}
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
                      error={contactTouched.phoneNumber ? contactErrors.phoneNumber : undefined}
                    />
                  </div>

                  {isContactValid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D' }}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                        Contact information is valid. Shipping Address is now available.
                      </p>
                    </div>
                  )}

                  <div>
                    <Button type="button" onClick={handleSaveContact}>
                      Save Contact Information
                    </Button>
                  </div>
                </div>
              )}
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 2"
              title="Shipping Address"
              description="Enter your shipping address with realistic mock location data."
              statusBadge={sectionCompletion.shipping ? getCompletionBadge() : undefined}
              action={
                sectionCompletion.shipping && shippingUnlocked ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedSection('shipping')}>
                    Edit
                  </Button>
                ) : undefined
              }
            >
              {!shippingUnlocked ? (
                <CheckoutPlaceholderCard message="Shipping Address will unlock after valid contact information is completed." />
              ) : sectionCompletion.shipping && expandedSection !== 'shipping' ? (
                buildShippingSummary(shippingAddress)
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div className="sm:grid sm:grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                    <Select
                      label="Country"
                      name="country"
                      required
                      value={shippingAddress.country}
                      onChange={handleCountryChange}
                      error={shippingTouched.country ? shippingErrors.country : undefined}
                    >
                      <option value="">Select country</option>
                      {MOCK_CHECKOUT_LOCATIONS.map((country) => (
                        <option key={country.id} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="Province"
                      name="province"
                      required
                      value={shippingAddress.province}
                      onChange={handleProvinceChange}
                      disabled={!shippingAddress.country}
                      error={shippingTouched.province ? shippingErrors.province : undefined}
                    >
                      <option value="">Select province</option>
                      {provinceOptions.map((province) => (
                        <option key={province.id} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="City"
                      name="city"
                      required
                      value={shippingAddress.city}
                      onChange={handleCityChange}
                      disabled={!shippingAddress.province}
                      error={shippingTouched.city ? shippingErrors.city : undefined}
                    >
                      <option value="">Select city</option>
                      {cityOptions.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </Select>
                    <Select
                      label="District"
                      name="district"
                      required
                      value={shippingAddress.district}
                      onChange={handleDistrictChange}
                      disabled={!shippingAddress.city}
                      error={shippingTouched.district ? shippingErrors.district : undefined}
                    >
                      <option value="">Select district</option>
                      {districtOptions.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Postal Code"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      readOnly
                      required
                      hint="Automatically filled after selecting a district."
                      error={shippingTouched.postalCode ? shippingErrors.postalCode : undefined}
                    />
                    <Input
                      label="Street Address"
                      name="streetAddress"
                      autoComplete="street-address"
                      required
                      value={shippingAddress.streetAddress}
                      onChange={handleShippingTextChange('streetAddress')}
                      onBlur={handleShippingBlur('streetAddress')}
                      error={shippingTouched.streetAddress ? shippingErrors.streetAddress : undefined}
                    />
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.6, color: '#6B7280' }}>
                    Shipping options will become available after completing your address.
                  </p>

                  {isShippingValid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D' }}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                        Shipping address is valid. Delivery Method is now available.
                      </p>
                    </div>
                  )}

                  <div>
                    <Button type="button" onClick={handleSaveShipping}>
                      Save Shipping Address
                    </Button>
                  </div>
                </div>
              )}
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 3"
              title="Delivery Method"
              description="Choose one delivery option from local mock data."
              statusBadge={sectionCompletion.delivery ? getCompletionBadge() : undefined}
              action={
                sectionCompletion.delivery && deliveryUnlocked ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedSection('delivery')}>
                    Edit
                  </Button>
                ) : undefined
              }
            >
              {!deliveryUnlocked ? (
                <CheckoutPlaceholderCard message="Delivery Method will unlock after your shipping address is valid." />
              ) : sectionCompletion.delivery && expandedSection !== 'delivery' && checkout.deliveryMethod ? (
                buildDeliverySummary(checkout.deliveryMethod)
              ) : (
                <div style={{ display: 'grid', gap: '14px' }} role="radiogroup" aria-label="Delivery Method options">
                  {MOCK_DELIVERY_OPTIONS.map((option) => (
                    <CheckoutSelectionCard
                      key={option.id}
                      label={option.serviceName}
                      description={option.courierName}
                      meta={`Estimated delivery ${option.estimatedDelivery}`}
                      priceText={formatCurrency(option.price)}
                      selected={checkout.deliveryMethod?.id === option.id}
                      onSelect={() => handleDeliverySelection(option)}
                    />
                  ))}
                </div>
              )}
            </CheckoutSection>

            <CheckoutSection
              stepLabel="Section 4"
              title="Payment Method"
              description="Choose one payment method placeholder for the current sprint."
              statusBadge={sectionCompletion.payment ? getCompletionBadge() : undefined}
              action={
                sectionCompletion.payment && paymentUnlocked ? (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setExpandedSection('payment')}>
                    Edit
                  </Button>
                ) : undefined
              }
            >
              {!paymentUnlocked ? (
                <CheckoutPlaceholderCard message="Payment Method will unlock after you select a delivery option." />
              ) : sectionCompletion.payment && expandedSection !== 'payment' && checkout.paymentMethod ? (
                buildPaymentSummary(checkout.paymentMethod)
              ) : (
                <div style={{ display: 'grid', gap: '14px' }} role="radiogroup" aria-label="Payment Method options">
                  {MOCK_PAYMENT_OPTIONS.map((option) => (
                    <CheckoutSelectionCard
                      key={option.id}
                      label={option.label}
                      description={option.description}
                      selected={checkout.paymentMethod?.id === option.id}
                      onSelect={() => handlePaymentSelection(option)}
                    />
                  ))}

                  {checkout.paymentMethod && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D' }}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                        Payment method selected. You can place the order after reviewing the summary.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CheckoutSection>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button type="button" onClick={handlePlaceOrder} disabled={!canPlaceOrder}>
                  Place Order
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
                  color: statusMessage ? '#111827' : '#6B7280',
                }}
              >
                {statusMessage || 'Complete all sections to place the order. Payment integration will be activated in the next sprint.'}
              </p>
            </div>
          </div>

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
