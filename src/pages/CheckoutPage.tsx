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
  CheckoutErrorState,
  CheckoutFieldSkeleton,
  CheckoutOptionsSkeleton,
  CheckoutOrderSummary,
  CheckoutPlaceholderCard,
  CheckoutSection,
  CheckoutSelectionCard,
} from '../features/checkout';
import { useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import {
  useCartStore,
  useCheckoutStore,
  type CheckoutContactField,
  type CheckoutContactInformation,
  type CheckoutShippingAddress,
  type ShippingRate,
} from '../stores';
import type { PromotionValidationResponse } from '../types';
import {
  createCheckoutSession,
  createPaymentAttempt,
  generateSnapToken,
} from '../services/api/checkoutService';
import {
  getShippingServiceErrorMessage,
  shippingService,
} from '../services/shipping';
import { openMidtransSnap } from '../services/payment/midtransSnap';
import { validatePromotion } from '../services/api/promotionService';
import { formatCurrency } from '../utils/formatting';
import { isEmail, isRequired } from '../utils/validation';

type CheckoutSectionKey = 'contact' | 'shipping' | 'delivery';
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
  const fieldValueMap: Record<ShippingValidationField, string> = {
    province: shippingAddress.provinceId,
    city: shippingAddress.cityId,
    district: shippingAddress.districtId,
    postalCode: shippingAddress.postalCode,
    streetAddress: shippingAddress.streetAddress,
  };

  return SHIPPING_FIELDS.reduce<ShippingValidationErrors>((errors, field) => {
    const error = validateShippingField(field, fieldValueMap[field]);

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

function splitCustomerName(fullName: string) {
  const normalizedName = fullName.trim();
  if (!normalizedName) {
    return { firstName: '', lastName: '' };
  }

  const parts = normalizedName.split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || normalizedName;
  const lastName = parts.join(' ');

  return { firstName, lastName };
}

function getAutofillContactInformation(fullName: string, email: string, phone: string): Partial<CheckoutContactInformation> {
  const { firstName, lastName } = splitCustomerName(fullName);

  return {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phoneNumber: phone } : {}),
  };
}

function getAutofillShippingAddress(profile: {
  country?: string;
  provinceId?: string;
  province?: string;
  cityId?: string;
  city?: string;
  districtId?: string;
  district?: string;
  postalCode?: string;
  streetAddress?: string;
}): Partial<CheckoutShippingAddress> {
  return {
    ...(profile.country ? { country: profile.country } : {}),
    ...(profile.provinceId ? { provinceId: profile.provinceId } : {}),
    ...(profile.province ? { province: profile.province } : {}),
    ...(profile.cityId ? { cityId: profile.cityId } : {}),
    ...(profile.city ? { city: profile.city } : {}),
    ...(profile.districtId ? { districtId: profile.districtId } : {}),
    ...(profile.district ? { district: profile.district } : {}),
    ...(profile.postalCode ? { postalCode: profile.postalCode } : {}),
    ...(profile.streetAddress ? { streetAddress: profile.streetAddress } : {}),
  };
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
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    getValidAccessToken,
  } = useAuthenticatedCustomer();
  const {
    cart,
    cartItems,
    subtotal,
    hasInvalidItems,
    isCartRefreshing,
    refreshCartItems,
  } = useCartStore();
  const {
    checkout,
    updateContactField,
    updateContactInformation,
    updateShippingField,
    updateShippingAddress,
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
  } = useCheckoutStore();

  const [expandedSection, setExpandedSection] = useState<CheckoutSectionKey | null>('contact');
  const [sectionCompletion, setSectionCompletion] = useState<SectionCompletionState>(initialSectionCompletionState);
  const [contactTouched, setContactTouched] = useState<ContactTouchedState>(initialContactTouchedState);
  const [shippingTouched, setShippingTouched] = useState<ShippingTouchedState>(initialShippingTouchedState);
  const [contactErrors, setContactErrors] = useState<ContactValidationErrors>({});
  const [shippingErrors, setShippingErrors] = useState<ShippingValidationErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<PromotionValidationResponse['promotion'] | null>(null);
  const [promotionPricing, setPromotionPricing] = useState<PromotionValidationResponse['pricing'] | null>(null);
  const [promotionError, setPromotionError] = useState('');
  const [isApplyingPromotion, setIsApplyingPromotion] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSnapFocusMode, setIsSnapFocusMode] = useState(false);

  const provinceLoadedRef = useRef(false);
  const hasAutofilledCustomerRef = useRef(false);
  const cityRequestKeyRef = useRef('');
  const districtRequestKeyRef = useRef('');
  const ratesRequestKeyRef = useRef('');
  const citySelectRef = useRef<HTMLSelectElement | null>(null);
  const districtSelectRef = useRef<HTMLSelectElement | null>(null);
  const postalCodeInputRef = useRef<HTMLInputElement | null>(null);
  const streetAddressInputRef = useRef<HTMLInputElement | null>(null);

  const isCartEmpty = cart.items.length === 0;
  const contactInformation = checkout.contactInformation;
  const shippingAddress = checkout.shippingAddress;
  const shippingState = checkout.shipping;
  const estimatedShippingWeightGrams = useMemo(
    () => Math.max(1000, cartItems.reduce((sum, item) => sum + (item.quantity * Math.max(item.weight ?? 0, 500)), 0)),
    [cartItems],
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
  const visibleShippingRates = useMemo(
    () => [...shippingState.rates].sort((left, right) => left.cost - right.cost).slice(0, 5),
    [shippingState.rates],
  );
  const canContinueToPayment = isContactValid
    && isShippingValid
    && Boolean(shippingState.selectedRate)
    && cartItems.length === cart.items.length
    && cartItems.length > 0
    && !hasInvalidItems
    && !isCartRefreshing
    && !isSubmittingPayment;
  const canRequestShippingRates = shippingUnlocked && Boolean(
    shippingAddress.provinceId
    && shippingAddress.cityId
    && shippingAddress.districtId
    && shippingAddress.postalCode
    && isRequired(shippingAddress.streetAddress),
  );
  const shippingCostPreview = promotionPricing?.shippingCost ?? shippingState.selectedRate?.cost ?? 0;
  const grandTotalPreview = promotionPricing?.grandTotal ?? (subtotal + (shippingState.selectedRate?.cost ?? 0));

  const resetDeliveryCompletion = useCallback(() => {
    setSectionCompletion((previous) => ({
      ...previous,
      delivery: false,
    }));
  }, []);

  const applyPromotionCode = useCallback(async (overrideCode = '') => {
    const nextCode = String(overrideCode || voucherCode).trim().toUpperCase();
    if (!nextCode) {
      setPromotionError('Enter a voucher code first.');
      return;
    }

    setIsApplyingPromotion(true);
    setPromotionError('');

    try {
      const accessToken = user ? await getValidAccessToken() : '';
      const response = await validatePromotion({
        code: nextCode,
        customerEmail: contactInformation.email,
        subtotal,
        shippingCost: shippingState.selectedRate?.cost ?? 0,
        courier: shippingState.selectedRate?.courierCode ?? '',
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          category: item.categoryName,
        })),
      }, accessToken || '');
      setVoucherCode(nextCode);
      setAppliedPromotion(response.promotion ?? response.promotions?.[0] ?? null);
      setPromotionPricing(response.pricing);
      setStatusMessage(`Promotion ${(response.promotion ?? response.promotions?.[0])?.code || nextCode} applied.`);
    } catch (error) {
      setAppliedPromotion(null);
      setPromotionPricing(null);
      setPromotionError(error instanceof Error ? error.message : 'Promotion could not be applied.');
    } finally {
      setIsApplyingPromotion(false);
    }
  }, [cartItems, contactInformation.email, getValidAccessToken, shippingState.selectedRate?.cost, shippingState.selectedRate?.courierCode, subtotal, user, voucherCode]);

  const removePromotionCode = useCallback(() => {
    setAppliedPromotion(null);
    setPromotionPricing(null);
    setVoucherCode('');
    setPromotionError('');
    setStatusMessage('Promotion removed.');
  }, []);

  const previewAutomaticPromotions = useCallback(async () => {
    if (!shippingState.selectedRate || subtotal <= 0 || voucherCode.trim()) {
      return;
    }

    try {
      const accessToken = user ? await getValidAccessToken() : '';
      const response = await validatePromotion({
        code: '',
        customerEmail: contactInformation.email,
        subtotal,
        shippingCost: shippingState.selectedRate.cost,
        courier: shippingState.selectedRate.courierCode,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          category: item.categoryName,
        })),
      }, accessToken || '');

      if ((response.pricing?.totalSavings || 0) > 0) {
        setAppliedPromotion(response.promotion ?? response.promotions?.[0] ?? null);
        setPromotionPricing(response.pricing);
      } else {
        setAppliedPromotion(null);
        setPromotionPricing(null);
      }
      setPromotionError('');
    } catch {
      setAppliedPromotion(null);
      setPromotionPricing(null);
    }
  }, [cartItems, contactInformation.email, getValidAccessToken, shippingState.selectedRate, subtotal, user, voucherCode]);

  useEffect(() => {
    if (!appliedPromotion?.code || appliedPromotion.promotionType !== 'VOUCHER') {
      return;
    }

    void applyPromotionCode(appliedPromotion.code);
  }, [appliedPromotion?.code, appliedPromotion?.promotionType, applyPromotionCode, subtotal, shippingState.selectedRate?.cost, contactInformation.email]);

  useEffect(() => {
    void previewAutomaticPromotions();
  }, [previewAutomaticPromotions]);

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

  const loadCities = useCallback(async (provinceId: string) => {
    setShippingLoading('cities', true);
    setShippingError('cities', null);

    try {
      const cities = await shippingService.getCities(provinceId);
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

  const loadDistricts = useCallback(async (cityId: string) => {
    setShippingLoading('districts', true);
    setShippingError('districts', null);

    try {
      const districts = await shippingService.getDistricts(cityId);
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

    if (!shippingAddress.provinceId || !shippingAddress.cityId || !shippingAddress.districtId) {
      setShippingRates([]);
      setShippingError('rates', 'Please complete your address before loading shipping rates.');
      setShippingLoading('rates', false);
      return;
    }

    try {
      const rates = await shippingService.getShippingRates({
        country: shippingAddress.country,
        province: shippingAddress.province,
        provinceId: shippingAddress.provinceId,
        city: shippingAddress.city,
        cityId: shippingAddress.cityId,
        district: shippingAddress.district,
        districtId: shippingAddress.districtId,
        postalCode: shippingAddress.postalCode,
        weightGrams: estimatedShippingWeightGrams,
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
    estimatedShippingWeightGrams,
    setShippingError,
    setShippingLoading,
    setShippingRates,
    shippingAddress.city,
    shippingAddress.cityId,
    shippingAddress.country,
    shippingAddress.district,
    shippingAddress.districtId,
    shippingAddress.postalCode,
    shippingAddress.province,
    shippingAddress.provinceId,
  ]);

  useEffect(() => {
    if (hasAutofilledCustomerRef.current || isAuthLoading || !user?.email || !profile) {
      return;
    }

    const autofillContact = getAutofillContactInformation(profile.fullName, profile.email, profile.phone);
    const autofillShipping = getAutofillShippingAddress(profile);

    if (Object.keys(autofillContact).length > 0) {
      updateContactInformation({
        ...(checkout.contactInformation.firstName ? {} : { firstName: autofillContact.firstName || '' }),
        ...(checkout.contactInformation.lastName ? {} : { lastName: autofillContact.lastName || '' }),
        ...(checkout.contactInformation.email ? {} : { email: autofillContact.email || '' }),
        ...(checkout.contactInformation.phoneNumber ? {} : { phoneNumber: autofillContact.phoneNumber || '' }),
      });
    }

    if (Object.keys(autofillShipping).length > 0) {
      updateShippingAddress({
        ...(checkout.shippingAddress.country ? {} : { country: autofillShipping.country || '' }),
        ...(checkout.shippingAddress.provinceId ? {} : { provinceId: autofillShipping.provinceId || '' }),
        ...(checkout.shippingAddress.province ? {} : { province: autofillShipping.province || '' }),
        ...(checkout.shippingAddress.cityId ? {} : { cityId: autofillShipping.cityId || '' }),
        ...(checkout.shippingAddress.city ? {} : { city: autofillShipping.city || '' }),
        ...(checkout.shippingAddress.districtId ? {} : { districtId: autofillShipping.districtId || '' }),
        ...(checkout.shippingAddress.district ? {} : { district: autofillShipping.district || '' }),
        ...(checkout.shippingAddress.postalCode ? {} : { postalCode: autofillShipping.postalCode || '' }),
        ...(checkout.shippingAddress.streetAddress ? {} : { streetAddress: autofillShipping.streetAddress || '' }),
      });
    }

    hasAutofilledCustomerRef.current = true;
  }, [
    checkout.contactInformation.email,
    checkout.contactInformation.firstName,
    checkout.contactInformation.lastName,
    checkout.contactInformation.phoneNumber,
    checkout.shippingAddress.city,
    checkout.shippingAddress.cityId,
    checkout.shippingAddress.country,
    checkout.shippingAddress.district,
    checkout.shippingAddress.districtId,
    checkout.shippingAddress.postalCode,
    checkout.shippingAddress.province,
    checkout.shippingAddress.provinceId,
    checkout.shippingAddress.streetAddress,
    isAuthLoading,
    profile,
    updateContactInformation,
    updateShippingAddress,
    user?.email,
  ]);

  useEffect(() => {
    if (!shippingUnlocked || provinceLoadedRef.current) {
      return;
    }

    provinceLoadedRef.current = true;
    void loadProvinces();
  }, [loadProvinces, shippingUnlocked]);

  useEffect(() => {
    if (!shippingUnlocked || !shippingAddress.provinceId) {
      cityRequestKeyRef.current = '';
      return;
    }

    if (cityRequestKeyRef.current === shippingAddress.provinceId) {
      return;
    }

    cityRequestKeyRef.current = shippingAddress.provinceId;
    void loadCities(shippingAddress.provinceId);
  }, [loadCities, shippingAddress.provinceId, shippingUnlocked]);

  useEffect(() => {
    if (!shippingUnlocked || !shippingAddress.cityId) {
      districtRequestKeyRef.current = '';
      return;
    }

    if (districtRequestKeyRef.current === shippingAddress.cityId) {
      return;
    }

    districtRequestKeyRef.current = shippingAddress.cityId;
    void loadDistricts(shippingAddress.cityId);
  }, [loadDistricts, shippingAddress.cityId, shippingUnlocked]);

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
      shippingAddress.provinceId,
      shippingAddress.cityId,
      shippingAddress.districtId,
      shippingAddress.postalCode,
      estimatedShippingWeightGrams,
    ].join('|');

    if (ratesRequestKeyRef.current === requestKey) {
      return;
    }

    ratesRequestKeyRef.current = requestKey;
    void loadShippingRates();
  }, [
    canRequestShippingRates,
    estimatedShippingWeightGrams,
    loadShippingRates,
    setSelectedShippingRate,
    setShippingError,
    setShippingRates,
    shippingAddress.cityId,
    shippingAddress.districtId,
    shippingAddress.postalCode,
    shippingAddress.provinceId,
    shippingState.errors.rates,
    shippingState.rates.length,
    shippingState.selectedRate,
  ]);

  useEffect(() => {
    if (shippingState.selectedRate) {
      return;
    }

    setSectionCompletion((previous) => (
      previous.delivery
        ? { ...previous, delivery: false }
        : previous
    ));
  }, [shippingState.selectedRate]);

  useEffect(() => {
    if (!isCartEmpty) {
      void refreshCartItems();
    }
  }, [isCartEmpty, refreshCartItems]);

  useEffect(() => {
    if (!isSnapFocusMode) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSnapFocusMode]);

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

  const handlePostalCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    updateShippingField('postalCode', nextValue);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryCompletion();
    setStatusMessage('');

    if (!isRequired(nextValue)) {
      ratesRequestKeyRef.current = '';
      setShippingRates([]);
      setSelectedShippingRate(null);
    }

    if (shippingTouched.postalCode) {
      setShippingErrors((previous) => ({
        ...previous,
        postalCode: validateShippingField('postalCode', nextValue),
      }));
    }

    if (nextValue.trim().length >= 5) {
      requestAnimationFrame(() => {
        streetAddressInputRef.current?.focus();
      });
    }
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
      resetDeliveryCompletion();
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
      const fieldValueMap: Record<ShippingValidationField, string> = {
        province: shippingAddress.provinceId,
        city: shippingAddress.cityId,
        district: shippingAddress.districtId,
        postalCode: shippingAddress.postalCode,
        streetAddress: shippingAddress.streetAddress,
      };

      setShippingTouched((previous) => ({ ...previous, [field]: true }));
      setShippingErrors((previous) => ({
        ...previous,
        [field]: validateShippingField(field, fieldValueMap[field]),
      }));
    };

  const handleProvinceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextProvinceId = event.target.value;
    const selectedProvince = shippingState.provinces.find((province) => province.id === nextProvinceId) ?? null;

    cityRequestKeyRef.current = '';
    districtRequestKeyRef.current = '';
    ratesRequestKeyRef.current = '';
    selectShippingProvince(selectedProvince);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryCompletion();
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
      province: validateShippingField('province', nextProvinceId),
      city: undefined,
      district: undefined,
      postalCode: undefined,
    }));

    requestAnimationFrame(() => {
      citySelectRef.current?.focus();
    });
  };

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextCityId = event.target.value;
    const selectedCity = shippingState.cities.find((city) => city.id === nextCityId) ?? null;

    districtRequestKeyRef.current = '';
    ratesRequestKeyRef.current = '';
    selectShippingCity(selectedCity);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryCompletion();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      city: true,
      district: false,
      postalCode: false,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      city: validateShippingField('city', nextCityId),
      district: undefined,
      postalCode: undefined,
    }));

    requestAnimationFrame(() => {
      districtSelectRef.current?.focus();
    });
  };

  const handleDistrictChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDistrictId = event.target.value;
    const selectedDistrict = shippingState.districts.find((district) => district.id === nextDistrictId) ?? null;

    ratesRequestKeyRef.current = '';
    selectShippingDistrict(selectedDistrict);
    setSectionCompletion((previous) => ({ ...previous, shipping: false }));
    resetDeliveryCompletion();
    setStatusMessage('');
    setShippingTouched((previous) => ({
      ...previous,
      district: true,
    }));
    setShippingErrors((previous) => ({
      ...previous,
      district: validateShippingField('district', nextDistrictId),
    }));

    requestAnimationFrame(() => {
      postalCodeInputRef.current?.focus();
    });
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
    setExpandedSection(null);
    setStatusMessage('');
  };

  const handleRetryProvinces = () => {
    provinceLoadedRef.current = true;
    void loadProvinces();
  };

  const handleRetryCities = () => {
    if (!shippingAddress.provinceId) {
      return;
    }

    cityRequestKeyRef.current = shippingAddress.provinceId;
    void loadCities(shippingAddress.provinceId);
  };

  const handleRetryDistricts = () => {
    if (!shippingAddress.cityId) {
      return;
    }

    districtRequestKeyRef.current = shippingAddress.cityId;
    void loadDistricts(shippingAddress.cityId);
  };

  const handleRetryRates = () => {
    if (!canRequestShippingRates) {
      return;
    }

    ratesRequestKeyRef.current = [
      shippingAddress.provinceId,
      shippingAddress.cityId,
      shippingAddress.districtId,
      shippingAddress.postalCode,
      estimatedShippingWeightGrams,
    ].join('|');
    void loadShippingRates();
  };

  const handleContinueToPayment = async () => {
    if (!canContinueToPayment || !shippingState.selectedRate) {
      return;
    }

    setIsSubmittingPayment(true);
    setStatusMessage('Validating your cart before payment...');

    try {
      const refreshedCartItems = await refreshCartItems();

      if (refreshedCartItems.length !== cart.items.length || refreshedCartItems.some((item) => item.isInvalid)) {
        setStatusMessage('Some products are no longer available. Please update your cart before continuing.');
        setIsSubmittingPayment(false);
        return;
      }

      const selectedProvince = shippingState.provinces.find((province) => province.id === shippingAddress.provinceId) ?? null;
      const selectedCity = shippingState.cities.find((city) => city.id === shippingAddress.cityId) ?? null;
      const selectedDistrict = shippingState.districts.find((district) => district.id === shippingAddress.districtId) ?? null;

      if (!selectedProvince || !selectedCity || !selectedDistrict) {
        setStatusMessage('Please complete your shipping address before continuing to payment.');
        setIsSubmittingPayment(false);
        return;
      }

      if (refreshedCartItems.some((item) => !item.variantId)) {
        setStatusMessage('Please reselect your product variant before continuing to payment.');
        setIsSubmittingPayment(false);
        return;
      }

      setStatusMessage('Preparing your secure payment session...');

      const checkoutAccessToken = user ? await getValidAccessToken() : null;
      const checkoutSession = await createCheckoutSession({
        customer: {
          customerName: `${contactInformation.firstName} ${contactInformation.lastName}`.trim(),
          email: contactInformation.email.trim().toLowerCase(),
          phone: contactInformation.phoneNumber.trim(),
          customerType: 'Individual',
        },
        currency: 'IDR',
        promotionCode: appliedPromotion?.promotionType === 'VOUCHER' ? appliedPromotion.code : '',
        discount: promotionPricing?.discountAmount || 0,
        tax: 0,
        courier: shippingState.selectedRate.courierCode,
        items: refreshedCartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId!,
          qty: item.quantity,
          weight: Math.max(item.weight ?? 0, 0),
        })),
        shipping: {
          originDistrict: '471',
          destinationDistrict: selectedDistrict.id,
          weight: estimatedShippingWeightGrams,
          cost: shippingState.selectedRate.cost,
          service: shippingState.selectedRate.serviceName,
          description: `${shippingState.selectedRate.courierName} ${shippingState.selectedRate.serviceName}`,
          estimatedDelivery: shippingState.selectedRate.estimatedDelivery,
        },
        address: {
          recipientName: `${contactInformation.firstName} ${contactInformation.lastName}`.trim(),
          phone: contactInformation.phoneNumber,
          provinceId: selectedProvince.id,
          cityId: selectedCity.id,
          districtId: selectedDistrict.id,
          postalCode: shippingAddress.postalCode,
          streetAddress: shippingAddress.streetAddress,
        },
      }, checkoutAccessToken || '');

      window.sessionStorage.setItem('onemission-checkout-session-id', checkoutSession.id);

      const paymentAttempt = await createPaymentAttempt(checkoutSession.id);
      window.sessionStorage.setItem('onemission-payment-attempt-id', paymentAttempt.id);

      const snapAttempt = await generateSnapToken(paymentAttempt.id);
      if (!snapAttempt.snapToken) {
        throw new Error('Midtrans Snap token was not returned.');
      }

      const paidAmountFallback = shippingState.selectedRate.cost + refreshedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      setStatusMessage('Opening payment window...');
      setIsSnapFocusMode(true);

      await openMidtransSnap({
        token: snapAttempt.snapToken,
        onSuccess: (result) => {
          setIsSnapFocusMode(false);
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'settlement'));
          params.set('status_code', String(result.status_code || '200'));
          params.set('payment_attempt_id', paymentAttempt.id);
          params.set('checkout_session_id', checkoutSession.id);
          params.set('payment_method', String(result.payment_type || result.payment_method || 'Midtrans'));
          params.set('paid_amount', String(result.gross_amount || paidAmountFallback));
          navigate(`/payment/success?${params.toString()}`);
        },
        onPending: (result) => {
          setIsSnapFocusMode(false);
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'pending'));
          params.set('status_code', String(result.status_code || '201'));
          params.set('payment_attempt_id', paymentAttempt.id);
          params.set('checkout_session_id', checkoutSession.id);
          navigate(`/payment/pending?${params.toString()}`);
        },
        onError: (result) => {
          setIsSnapFocusMode(false);
          const params = new URLSearchParams();
          params.set('order_id', String(result.order_id || snapAttempt.providerReference || ''));
          params.set('transaction_status', String(result.transaction_status || 'failed'));
          params.set('status_code', String(result.status_code || '500'));
          params.set('payment_attempt_id', paymentAttempt.id);
          params.set('checkout_session_id', checkoutSession.id);
          navigate(`/payment/failed?${params.toString()}`);
        },
        onClose: () => {
          setIsSnapFocusMode(false);
          setIsSubmittingPayment(false);
          const params = new URLSearchParams();
          params.set('payment_attempt_id', paymentAttempt.id);
          params.set('checkout_session_id', checkoutSession.id);
          navigate(`/payment/pending?${params.toString()}`);
        },
      });
    } catch (error) {
      setIsSnapFocusMode(false);
      const message = error instanceof Error ? error.message : 'Unable to continue to payment. Please try again.';
      if (message.toLowerCase().includes('requested quantity exceeds available inventory')) {
        await refreshCartItems();
        setStatusMessage('The stock of one or more products has changed. Please review your cart.');
      } else {
        setStatusMessage(message);
      }
      setIsSubmittingPayment(false);
      return;
    }

    setIsSubmittingPayment(false);
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
                Go to Cart
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', position: 'relative' }}>
      <div
        style={{
          padding: '104px 24px 60px',
          filter: isSnapFocusMode ? 'blur(6px)' : 'none',
          pointerEvents: isSnapFocusMode ? 'none' : 'auto',
          transition: 'filter 180ms ease',
        }}
      >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px', maxWidth: '720px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
            Checkout
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: '#111827' }}>
            Complete your checkout details
          </h1>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
            Complete each checkout section progressively on this page. Delivery Method is the final editable step before reviewing the order summary and continuing to payment.
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
              description="Select Province, City and District from the shipping service to load live-ready courier options."
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
                        value={shippingAddress.provinceId}
                        onChange={handleProvinceChange}
                        onBlur={handleShippingBlur('province')}
                        error={shippingTouched.province ? shippingErrors.province : undefined}
                      >
                        <option value="">Select province</option>
                        {shippingState.provinces.map((province) => (
                          <option key={province.id} value={province.id}>
                            {province.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    {shippingState.loading.cities ? (
                      <CheckoutFieldSkeleton />
                    ) : (
                      <Select
                        ref={citySelectRef}
                        label="City"
                        name="city"
                        required
                        value={shippingAddress.cityId}
                        onChange={handleCityChange}
                        onBlur={handleShippingBlur('city')}
                        disabled={!shippingAddress.provinceId || Boolean(shippingState.errors.cities)}
                        error={shippingTouched.city ? shippingErrors.city : undefined}
                      >
                        <option value="">Select city</option>
                        {shippingState.cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    {shippingState.loading.districts ? (
                      <CheckoutFieldSkeleton />
                    ) : (
                      <Select
                        ref={districtSelectRef}
                        label="District"
                        name="district"
                        required
                        value={shippingAddress.districtId}
                        onChange={handleDistrictChange}
                        onBlur={handleShippingBlur('district')}
                        disabled={!shippingAddress.cityId || Boolean(shippingState.errors.districts)}
                        error={shippingTouched.district ? shippingErrors.district : undefined}
                      >
                        <option value="">Select district</option>
                        {shippingState.districts.map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.name}
                          </option>
                        ))}
                      </Select>
                    )}

                    <Input
                      ref={postalCodeInputRef}
                      label="Postal Code"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      required
                      hint="Enter the postal code manually."
                      onChange={handlePostalCodeChange}
                      onBlur={handleShippingBlur('postalCode')}
                      error={shippingTouched.postalCode ? shippingErrors.postalCode : undefined}
                    />
                    <Input
                      ref={streetAddressInputRef}
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
              description="Courier options are loaded dynamically through the shipping service after the address is complete."
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
                  {visibleShippingRates.map((option) => (
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
              stepLabel="Optional"
              title="Voucher"
              description="Apply a voucher or promotion code before continuing to payment."
            >
              <div style={{ display: 'grid', gap: '12px' }}>
                <div className="sm:grid sm:grid-cols-[minmax(0,1fr)_auto]" style={{ display: 'grid', gap: '12px', alignItems: 'end' }}>
                  <Input
                    label="Voucher Code"
                    name="voucherCode"
                    value={voucherCode}
                    onChange={(event) => {
                      setVoucherCode(event.target.value.toUpperCase());
                      setPromotionError('');
                    }}
                    placeholder="SAVE20"
                  />
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Button type="button" variant="secondary" onClick={() => void applyPromotionCode()} disabled={isApplyingPromotion || !voucherCode.trim()}>
                      {isApplyingPromotion ? 'Applying...' : 'Apply'}
                    </Button>
                    {appliedPromotion ? (
                      <Button type="button" variant="ghost" onClick={removePromotionCode}>
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>

                {promotionError ? (
                  <CheckoutErrorState message={promotionError} />
                ) : null}

                {appliedPromotion && promotionPricing ? (
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{appliedPromotion.title}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>{appliedPromotion.code} · {appliedPromotion.discountType.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge variant="success">Applied</Badge>
                    </div>
                    <div style={{ display: 'grid', gap: '6px', marginTop: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Discount</p>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#15803D' }}>- {formatCurrency(promotionPricing.totalSavings || 0)}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Shipping After Promotion</p>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#111827' }}>{formatCurrency(promotionPricing.shippingCost || 0)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </CheckoutSection>

            <div style={{ display: 'grid', gap: '12px' }}>
              {hasInvalidItems && (
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#B91C1C' }}>
                  Some products are no longer available. Please update your cart before continuing.
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button type="button" onClick={() => void handleContinueToPayment()} disabled={!canContinueToPayment}>
                  {isSubmittingPayment ? 'Preparing Payment...' : 'Continue to Payment'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                  Continue Shopping
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
                {statusMessage || 'Review your order summary and continue to payment when you are ready.'}
              </p>
            </div>
          </div>

          <CheckoutOrderSummary className="lg:sticky lg:top-24" discountAmount={promotionPricing?.discountAmount || 0} shippingCostOverride={promotionPricing ? shippingCostPreview : undefined} totalOverride={promotionPricing ? grandTotalPreview : undefined} promotionTitle={appliedPromotion?.title || ""} totalSavings={promotionPricing?.totalSavings || 0} />
        </div>
      </div>
      </div>

      {isSnapFocusMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            backgroundColor: 'rgba(17, 24, 39, 0.32)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.96)',
              border: '1px solid #E5E7EB',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 24px 48px rgba(17,24,39,0.16)',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Chakra Petch', sans-serif" }}>
              Payment Window Open
            </p>
            <h2 style={{ margin: '0 0 10px', fontSize: '22px', color: '#111827' }}>
              Complete your payment securely
            </h2>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: '#6B7280' }}>
              Please complete the Midtrans payment flow. Interaction with the checkout page is temporarily disabled until the payment window is closed.
            </p>
          </div>
        </div>
      )}
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
