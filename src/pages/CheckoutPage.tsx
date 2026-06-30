import { CheckCircle2, ShoppingCart } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState, Input, Select } from '../components/shared';
import {
  CHECKOUT_PAYMENT_OPTIONS,
  CheckoutErrorState,
  CheckoutFieldSkeleton,
  CheckoutOptionsSkeleton,
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
  type CheckoutPaymentOption,
  type CheckoutShippingAddress,
  type ShippingRate,
} from '../stores';
import {
  getShippingServiceErrorMessage,
  shippingService,
} from '../services/shipping';
import { formatCurrency } from '../utils/formatting';
import { isEmail, isRequired } from '../utils/validation';

type CheckoutSectionKey = 'contact' | 'shipping' | 'delivery' | 'payment';
type ShippingValidationField = 'province' | 'city' | 'district' | 'postalCode' | 'streetAddress';
type ContactValidationErrors = Partial<Record<CheckoutContactField, string>>;
type ShippingValidationErrors = Partial<Record<ShippingValidationField, string>>;
type ContactTouchedState = Record<CheckoutContactField, boolean>;
type ShippingTouchedState = Record<ShippingValidationField, boolean>;
type SectionCompletionState = Record<CheckoutSectionKey, boolean>;

const CONTACT_FIELDS: CheckoutContactField[] = ['firstName', 'lastName', 'email', 'phoneNumber'];
const SHIPPING_FIELDS: ShippingValidationField[] = ['province', 'city', 'district', 'postalCode', 'streetAddress'];

const initialContactTouchedState: ContactTouchedState = {
  firstName: false,
  lastName: false,
  email: false,
  phoneNumber: false,
};

const initialShippingTouchedState: ShippingTouchedState = {
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

function validateShippingField(field: ShippingValidationField, value: string): string | undefined {
  switch (field) {
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

function buildDeliverySummary(selectedRate: ShippingRate) {
  return (
    <div style={{ display: 'grid', gap: '6px' }}>
      <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>
        {selectedRate.courierName} {selectedRate.serviceName}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        Estimated delivery {selectedRate.estimatedDelivery}
      </p>
      <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
        Shipping cost {formatCurrency(selectedRate.cost)}
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
    updateShippingField,
    selectShippingProvince,
    selectShippingCity,
    selectShippingDistrict,
    setShippingProvinces,
    setShippingCities,
    setShippingDistricts,
    setShippingRates,
    setSelectedShippingRate,
    setShippingLoading,
    setShippingError,
    setPaymentMethod,
  } = useCheckoutStore();

  const [expandedSection, setExpandedSection] = useState<CheckoutSectionKey | null>('contact');
  const [sectionCompletion, setSectionCompletion] = useState<SectionCompletionState>(initialSectionCompletionState);
  const [contactTouched, setContactTouched] = useState<ContactTouchedState>(initialContactTouchedState);
  const [shippingTouched, setShippingTouched] = useState<ShippingTouchedState>(initialShippingTouchedState);
  const [contactErrors, setContactErrors] = useState<ContactValidationErrors>({});
  const [shippingErrors, setShippingErrors] = useState<ShippingValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState('');

  const provinceLoadedRef = useRef(false);
  const cityRequestKeyRef = useRef('');
  const districtRequestKeyRef = useRef('');
  const ratesRequestKeyRef = useRef('');

  const isCartEmpty = cart.items.length === 0;
  const contactInformation = checkout.contactInformation;
  const shippingAddress = checkout.shippingAddress;
  const shippingState = checkout.shipping;

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
  const paymentUnlocked = Boolean(shippingState.selectedRate);
  const canPlaceOrder = isContactValid && isShippingValid && Boolean(shippingState.selectedRate) && Boolean(checkout.paymentMethod);
  const canRequestShippingRates = shippingUnlocked && Boolean(
    shippingAddress.province
    && shippingAddress.city
    && shippingAddress.district
    && shippingAddress.postalCode
    && isRequired(shippingAddress.streetAddress),
  );

  const resetDeliveryAndPaymentCompletion = useCallback(() => {
    setSectionCompletion((previous) => ({
      ...previous,
      delivery: false,
      payment: false,
    }));
  }, []);

  const loadProvinces = useCallback(async () => {
    setShippingLoading('provinces', true);
    setShippingError('provinces', null);

    try {
      const provinces = await shippingService.getProvinces();
      setShippingProvinces(provinces);
    } catch (error) {
      setShippingProvinces([]);
      setShippingError(
        'provinces',
        getShippingServiceErrorMessage(error, 'Unable to load provinces.'),
      );
    } finally {
      setShippingLoading('provinces', false);
    }
  }, [setShippingError, setShippingLoading, setShippingProvinces]);

  const loadCities = useCallback(async (province: string) => {
    setShippingLoading('cities', true);
    setShippingError('cities', null);

    try {
      const cities = await shippingService.getCities(province);
      setShippingCities(cities);
    } catch (error) {
      setShippingCities([]);
      setShippingError(
        'cities',
        getShippingServiceErrorMessage(error, 'Unable to load cities for the selected province.'),
      );
    } finally {
      setShippingLoading('cities', false);
    }
  }, [setShippingCities, setShippingError, setShippingLoading]);

  const loadDistricts = useCallback(async (city: string) => {
    setShippingLoading('districts', true);
    setShippingError('districts', null);

    try {
      const districts = await shippingService.getDistricts(city);
      setShippingDistricts(districts);
    } catch (error) {
      setShippingDistricts([]);
      setShippingError(
        'districts',
        getShippingServiceErrorMessage(error, 'Unable to load districts for the selected city.'),
      );
    } finally {
      setShippingLoading('districts', false);
    }
  }, [setShippingDistricts, setShippingError, setShippingLoading]);

  const loadShippingRates = useCallback(async () => {
    setShippingLoading('rates', true);
    setShippingError('rates', null);

    try {
      const rates = await shippingService.getShippingRates({
        country: shippingAddress.country,
        province: shippingAddress.province,
        city: shippingAddress.city,
        district: shippingAddress.district,
        postalCode: shippingAddress.postalCode,
      });
      setShippingRates(rates);
    } catch (error) {
      setShippingRates([]);
      setShippingError(
        'rates',
        getShippingServiceErrorMessage(error, 'Unable to load shipping rates.'),
      );
    } finally {
      setShippingLoading('rates', false);
    }
  }, [
    setShippingError,
    setShippingLoading,
    setShippingRates,
    shippingAddress.city,
    shippingAddress.country,
    shippingAddress.district,
    shippingAddress.postalCode,
    shippingAddress.province,
  ]);

  useEffect(() => {
    if (!shippingUnlocked || provinceLoadedRef.current) {
      return;
    }

    provinceLoadedRef.current = true;
    void loadProvinces();
  }, [loadProvinces, shippingUnlocked]);

  useEffect(() => {
    if (!shippingUnlocked || !shippingAddress.province) {
      cityRequestKeyRef.current = '';
      return;
    }

    if (cityRequestKeyRef.current === shippingAddress.province) {
      return;
    }

    cityRequestKeyRef.current = shippingAddress.province;
    void loadCities(shippingAddress.province);
  }, [loadCities, shippingAddress.province, shippingUnlocked]);

  useEffect(() => {
    if (!shippingUnlocked || !shippingAddress.city) {
      districtRequestKeyRef.current = '';
      return;
    }

    if (districtRequestKeyRef.current === shippingAddress.city) {
      return;
    }

    districtRequestKeyRef.current = shippingAddress.city;
    void loadDistricts(shippingAddress.city);
  }, [loadDistricts, shippingAddress.city, shippingUnlocked]);

  useEffect(() => {
    if (!canRequestShippingRates) {
      ratesRequestKeyRef.current = '';

      if (shippingState.rates.length > 0) {
        setShippingRates([]);
      }
      if (shippingState.selectedRate) {
        setSelectedShippingRate(null);
      }
      if (shippingState.errors.rates) {
        setShippingError('rates', null);
      }

      return;
    }

    const requestKey = [
      shippingAddress.province,
      shippingAddress.city,
      shippingAddress.district,
      shippingAddress.postalCode,
    ].join('|');

    if (ratesRequestKeyRef.current === requestKey) {
      return;
    }

    ratesRequestKeyRef.current = requestKey;
    void loadShippingRates();
  }, [
    canRequestShippingRates,
    loadShippingRates,
    setSelectedShippingRate,
    setShippingError,
    setShippingRates,
    shippingAddress.city,
    shippingAddress.district,
    shippingAddress.postalCode,
    shippingAddress.province,
    shippingState.errors.rates,
    shippingState.rates.length,
    shippingState.selectedRate,
  ]);

  useEffect(() => {
    if (shippingState.selectedRate) {
      return;
    }

    setSectionCompletion((previous) => (
      previous.delivery || previous.payment
        ? { ...previous, delivery: false, payment: false }
        : previous
    ));
  }, [shippingState.selectedRate]);

  useEffect(() => {
    if (checkout.paymentMethod) {
      return;
    }

    setSectionCompletion((previous) => (
      previous.payment
        ? { ...previous, payment: false }
        : previous
    ));
  }, [checkout.paymentMethod]);

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

  const handleStreetAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    updateShippingField('streetAddress', nextValue);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    setStatusMessage('');

    if (!isRequired(nextValue)) {
      ratesRequestKeyRef.current = '';
      setShippingRates([]);
      setSelectedShippingRate(null);
      setPaymentMethod(null);
      resetDeliveryAndPaymentCompletion();
    }

    if (shippingTouched.streetAddress) {
      setShippingErrors((previous) => ({
        ...previous,
        streetAddress: validateShippingField('streetAddress', nextValue),
      }));
    }
  };

  const handleShippingBlur =
    (field: ShippingValidationField) =>
    () => {
      setShippingTouched((previous) => ({ ...previous, [field]: true }));
      setShippingErrors((previous) => ({
        ...previous,
        [field]: validateShippingField(field, shippingAddress[field]),
      }));
    };

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextProvince = event.target.value;

    cityRequestKeyRef.current = '';
    districtRequestKeyRef.current = '';
    ratesRequestKeyRef.current = '';
    selectShippingProvince(nextProvince);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPaymentCompletion();
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

    districtRequestKeyRef.current = '';
    ratesRequestKeyRef.current = '';
    selectShippingCity(nextCity);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPaymentCompletion();
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

    ratesRequestKeyRef.current = '';
    selectShippingDistrict(nextDistrict);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryAndPaymentCompletion();
    setStatusMessage('');
    const nextPostalCode = shippingState.districts.find((district) => district.name === nextDistrict)?.postalCode ?? '';
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

  const handleDeliverySelection = (option: ShippingRate) => {
    setSelectedShippingRate(option);
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

  const handleRetryProvinces = () => {
    provinceLoadedRef.current = true;
    void loadProvinces();
  };

  const handleRetryCities = () => {
    if (!shippingAddress.province) {
      return;
    }

    cityRequestKeyRef.current = shippingAddress.province;
    void loadCities(shippingAddress.province);
  };

  const handleRetryDistricts = () => {
    if (!shippingAddress.city) {
      return;
    }

    districtRequestKeyRef.current = shippingAddress.city;
    void loadDistricts(shippingAddress.city);
  };

  const handleRetryRates = () => {
    if (!canRequestShippingRates) {
      return;
    }

    ratesRequestKeyRef.current = [
      shippingAddress.province,
      shippingAddress.city,
      shippingAddress.district,
      shippingAddress.postalCode,
    ].join('|');
    void loadShippingRates();
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
            Complete each checkout section progressively on this page. Shipping data now loads through a dedicated service layer so future courier integrations can replace the service without changing the layout.
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
              description="Select Province, City and District from the shipping service to load realistic local delivery rates."
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
                  {shippingState.errors.provinces && (
                    <CheckoutErrorState
                      message={shippingState.errors.provinces}
                      onRetry={handleRetryProvinces}
                    />
                  )}

                  <div className="sm:grid sm:grid-cols-2" style={{ display: 'grid', gap: '16px' }}>
                    <Input
                      label="Country"
                      name="country"
                      value={shippingAddress.country}
                      readOnly
                      disabled
                    />

                    {shippingState.loading.provinces ? (
                      <CheckoutFieldSkeleton />
                    ) : (
                      <Select
                        label="Province"
                        name="province"
                        required
                        value={shippingAddress.province}
                        onChange={handleProvinceChange}
                        onBlur={handleShippingBlur('province')}
                        error={shippingTouched.province ? shippingErrors.province : undefined}
                      >
                        <option value="">Select province</option>
                        {shippingState.provinces.map((province) => (
                          <option key={province.id} value={province.name}>
                            {province.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    {shippingState.loading.cities ? (
                      <CheckoutFieldSkeleton />
                    ) : (
                      <Select
                        label="City"
                        name="city"
                        required
                        value={shippingAddress.city}
                        onChange={handleCityChange}
                        onBlur={handleShippingBlur('city')}
                        disabled={!shippingAddress.province || Boolean(shippingState.errors.cities)}
                        error={shippingTouched.city ? shippingErrors.city : undefined}
                      >
                        <option value="">Select city</option>
                        {shippingState.cities.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    {shippingState.loading.districts ? (
                      <CheckoutFieldSkeleton />
                    ) : (
                      <Select
                        label="District"
                        name="district"
                        required
                        value={shippingAddress.district}
                        onChange={handleDistrictChange}
                        onBlur={handleShippingBlur('district')}
                        disabled={!shippingAddress.city || Boolean(shippingState.errors.districts)}
                        error={shippingTouched.district ? shippingErrors.district : undefined}
                      >
                        <option value="">Select district</option>
                        {shippingState.districts.map((district) => (
                          <option key={district.id} value={district.name}>
                            {district.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    <Input
                      label="Postal Code"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      readOnly
                      required
                      hint="Automatically filled after selecting a district."
                      onBlur={handleShippingBlur('postalCode')}
                      error={shippingTouched.postalCode ? shippingErrors.postalCode : undefined}
                    />
                    <Input
                      label="Street Address"
                      name="streetAddress"
                      autoComplete="street-address"
                      required
                      value={shippingAddress.streetAddress}
                      onChange={handleStreetAddressChange}
                      onBlur={handleShippingBlur('streetAddress')}
                      error={shippingTouched.streetAddress ? shippingErrors.streetAddress : undefined}
                    />
                  </div>

                  {shippingState.errors.cities && (
                    <CheckoutErrorState
                      message={shippingState.errors.cities}
                      onRetry={handleRetryCities}
                    />
                  )}

                  {shippingState.errors.districts && (
                    <CheckoutErrorState
                      message={shippingState.errors.districts}
                      onRetry={handleRetryDistricts}
                    />
                  )}

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
              description="Courier options are loaded from the shipping service after the address is complete."
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
              ) : sectionCompletion.delivery && expandedSection !== 'delivery' && shippingState.selectedRate ? (
                buildDeliverySummary(shippingState.selectedRate)
              ) : shippingState.loading.rates ? (
                <CheckoutOptionsSkeleton />
              ) : shippingState.errors.rates ? (
                <CheckoutErrorState
                  message={shippingState.errors.rates}
                  onRetry={handleRetryRates}
                />
              ) : canRequestShippingRates && shippingState.rates.length === 0 ? (
                <CheckoutErrorState message="No shipping available for this address." />
              ) : (
                <div style={{ display: 'grid', gap: '14px' }} role="radiogroup" aria-label="Delivery Method options">
                  {shippingState.rates.map((option) => (
                    <CheckoutSelectionCard
                      key={option.id}
                      badgeText={option.logoText}
                      label={option.courierName}
                      description={option.serviceName}
                      meta={`Estimated delivery ${option.estimatedDelivery}`}
                      priceText={formatCurrency(option.cost)}
                      selected={shippingState.selectedRate?.id === option.id}
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
                  {CHECKOUT_PAYMENT_OPTIONS.map((option) => (
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
