import { ArrowLeft, MapPinned, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, EmptyState, Input, LoadingSkeleton, Select } from '../components/shared';
import { CustomerPageHeader, CustomerPageShell, useAuthenticatedCustomer } from '../features/customer';
import { NavigationThemeProvider } from '../features/navigation';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  setDefaultCustomerAddress,
  type CustomerAddressInput,
  updateCustomerAddress,
} from '../services/api/customerService';
import { getShippingServiceErrorMessage, shippingService } from '../services/shipping';
import type { CustomerAddress, ShippingCity, ShippingDistrict, ShippingProvince } from '../types';
import { isRequired } from '../utils/validation';

interface AddressFormState {
  recipientName: string;
  phoneNumber: string;
  provinceId: string;
  province: string;
  cityId: string;
  city: string;
  districtId: string;
  district: string;
  postalCode: string;
  streetAddress: string;
  notes: string;
  isDefault: boolean;
}

interface AddressFormErrors {
  recipientName?: string;
  phoneNumber?: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  postalCode?: string;
  streetAddress?: string;
}

const initialAddressFormState: AddressFormState = {
  recipientName: '',
  phoneNumber: '',
  provinceId: '',
  province: '',
  cityId: '',
  city: '',
  districtId: '',
  district: '',
  postalCode: '',
  streetAddress: '',
  notes: '',
  isDefault: false,
};

function validateAddressForm(values: AddressFormState): AddressFormErrors {
  const errors: AddressFormErrors = {};

  if (!isRequired(values.recipientName)) errors.recipientName = 'Recipient Name is required.';
  if (!isRequired(values.phoneNumber)) errors.phoneNumber = 'Phone Number is required.';
  if (!isRequired(values.provinceId)) errors.provinceId = 'Province is required.';
  if (!isRequired(values.cityId)) errors.cityId = 'City is required.';
  if (!isRequired(values.districtId)) errors.districtId = 'District is required.';
  if (!isRequired(values.postalCode)) errors.postalCode = 'Postal Code is required.';
  if (!isRequired(values.streetAddress)) errors.streetAddress = 'Street Address is required.';

  return errors;
}

function mapAddressToForm(address: CustomerAddress): AddressFormState {
  return {
    recipientName: address.recipientName,
    phoneNumber: address.phoneNumber,
    provinceId: address.provinceId,
    province: address.province,
    cityId: address.cityId,
    city: address.city,
    districtId: address.districtId,
    district: address.district,
    postalCode: address.postalCode,
    streetAddress: address.streetAddress,
    notes: address.notes || '',
    isDefault: address.isDefault,
  };
}

function buildAddressPayload(form: AddressFormState): CustomerAddressInput {
  return {
    recipientName: form.recipientName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    provinceId: form.provinceId,
    province: form.province,
    cityId: form.cityId,
    city: form.city,
    districtId: form.districtId,
    district: form.district,
    postalCode: form.postalCode.trim(),
    streetAddress: form.streetAddress.trim(),
    notes: form.notes.trim(),
    isDefault: form.isDefault,
  };
}

function formatAddressSummary(address: CustomerAddress) {
  return [
    address.streetAddress,
    address.district,
    address.city,
    address.province,
    address.postalCode,
  ].filter(Boolean).join(', ');
}

function AddressesPageContent() {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    errorMessage,
    getValidAccessToken,
    reloadAuthenticatedCustomer,
  } = useAuthenticatedCustomer();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingDefaultId, setIsSettingDefaultId] = useState('');
  const [deletingAddressId, setDeletingAddressId] = useState('');
  const [editingAddressId, setEditingAddressId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(initialAddressFormState);
  const [formErrors, setFormErrors] = useState<AddressFormErrors>({});
  const [statusMessage, setStatusMessage] = useState('');

  const [provinces, setProvinces] = useState<ShippingProvince[]>([]);
  const [cities, setCities] = useState<ShippingCity[]>([]);
  const [districts, setDistricts] = useState<ShippingDistrict[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoading, navigate, user]);

  const loadAddresses = useCallback(async () => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return;
    }

    setIsLoadingAddresses(true);
    try {
      const nextAddresses = await listCustomerAddresses(accessToken);
      setAddresses(nextAddresses);
      setStatusMessage('');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to load your addresses right now.');
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [getValidAccessToken]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    void loadAddresses();
  }, [isLoading, loadAddresses, user]);

  useEffect(() => {
    if (!showForm) {
      return;
    }

    let isMounted = true;

    const loadProvinceOptions = async () => {
      setIsLoadingProvinces(true);
      try {
        const nextProvinces = await shippingService.getProvinces();
        if (isMounted) {
          setProvinces(nextProvinces);
        }
      } catch (error) {
        if (isMounted) {
          setStatusMessage(getShippingServiceErrorMessage(error, 'Unable to load provinces.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    void loadProvinceOptions();

    return () => {
      isMounted = false;
    };
  }, [showForm]);

  useEffect(() => {
    if (!showForm || !form.provinceId) {
      setCities([]);
      return;
    }

    let isMounted = true;
    const loadCityOptions = async () => {
      setIsLoadingCities(true);
      try {
        const nextCities = await shippingService.getCities(form.provinceId);
        if (isMounted) {
          setCities(nextCities);
        }
      } catch (error) {
        if (isMounted) {
          setStatusMessage(getShippingServiceErrorMessage(error, 'Unable to load cities.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingCities(false);
        }
      }
    };

    void loadCityOptions();
    return () => {
      isMounted = false;
    };
  }, [form.provinceId, showForm]);

  useEffect(() => {
    if (!showForm || !form.cityId) {
      setDistricts([]);
      return;
    }

    let isMounted = true;
    const loadDistrictOptions = async () => {
      setIsLoadingDistricts(true);
      try {
        const nextDistricts = await shippingService.getDistricts(form.cityId);
        if (isMounted) {
          setDistricts(nextDistricts);
        }
      } catch (error) {
        if (isMounted) {
          setStatusMessage(getShippingServiceErrorMessage(error, 'Unable to load districts.'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingDistricts(false);
        }
      }
    };

    void loadDistrictOptions();
    return () => {
      isMounted = false;
    };
  }, [form.cityId, showForm]);

  const openCreateForm = () => {
    setEditingAddressId('');
    setForm(initialAddressFormState);
    setFormErrors({});
    setStatusMessage('');
    setShowForm(true);
  };

  const openEditForm = (address: CustomerAddress) => {
    setEditingAddressId(address.id);
    setForm(mapAddressToForm(address));
    setFormErrors({});
    setStatusMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAddressId('');
    setForm(initialAddressFormState);
    setFormErrors({});
  };

  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provinces.find((province) => province.id === provinceId) || null;
    setForm((current) => ({
      ...current,
      provinceId,
      province: selectedProvince?.name || '',
      cityId: '',
      city: '',
      districtId: '',
      district: '',
      postalCode: '',
    }));
  };

  const handleCityChange = (cityId: string) => {
    const selectedCity = cities.find((city) => city.id === cityId) || null;
    setForm((current) => ({
      ...current,
      cityId,
      city: selectedCity?.name || '',
      districtId: '',
      district: '',
      postalCode: '',
    }));
  };

  const handleDistrictChange = (districtId: string) => {
    const selectedDistrict = districts.find((district) => district.id === districtId) || null;
    setForm((current) => ({
      ...current,
      districtId,
      district: selectedDistrict?.name || '',
      postalCode: current.postalCode || selectedDistrict?.postalCode || '',
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateAddressForm(form);
    setFormErrors(nextErrors);
    setStatusMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, buildAddressPayload(form), accessToken);
      } else {
        await createCustomerAddress(buildAddressPayload(form), accessToken);
      }

      await loadAddresses();
      await reloadAuthenticatedCustomer();
      setStatusMessage(editingAddressId ? 'Address updated successfully.' : 'Address added successfully.');
      closeForm();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to save your address right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this address?')) {
      return;
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return;
    }

    setDeletingAddressId(addressId);
    setStatusMessage('');

    try {
      await deleteCustomerAddress(addressId, accessToken);
      await loadAddresses();
      await reloadAuthenticatedCustomer();
      setStatusMessage('Address deleted successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to delete this address right now.');
    } finally {
      setDeletingAddressId('');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      return;
    }

    setIsSettingDefaultId(addressId);
    setStatusMessage('');

    try {
      await setDefaultCustomerAddress(addressId, accessToken);
      await loadAddresses();
      await reloadAuthenticatedCustomer();
      setStatusMessage('Default address updated successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update the default address right now.');
    } finally {
      setIsSettingDefaultId('');
    }
  };

  const emptyStateAction = useMemo(() => (
    <Button type="button" onClick={openCreateForm}>
      Add Address
    </Button>
  ), []);

  if (isLoading) {
    return (
      <CustomerPageShell maxWidth="1120px">
        <CustomerPageHeader
          sectionLabel="My Account"
          title="Address Book"
          description="Manage your saved delivery addresses and default checkout destination."
        />
        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <LoadingSkeleton rows={6} />
        </div>
      </CustomerPageShell>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <CustomerPageShell maxWidth="1120px">
      <CustomerPageHeader
        sectionLabel="My Account"
        title="Address Book"
        description="Manage your saved delivery addresses and default checkout destination."
        action={
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate(ROUTES.ACCOUNT)}>
              <ArrowLeft size={16} />
              Back to Account
            </Button>
            <Button type="button" onClick={openCreateForm} className="gap-2">
              <Plus size={16} />
              Add Address
            </Button>
          </div>
        }
      />

      {errorMessage ? (
        <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {statusMessage ? (
        <div className={`mb-6 rounded-3xl p-4 text-sm ${statusMessage.toLowerCase().includes('success') ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-4">
          {isLoadingAddresses ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <EmptyState
                icon={<MapPinned size={36} />}
                title="You don't have any saved addresses yet."
                description="Save your most-used delivery addresses so checkout can autofill them automatically."
                action={emptyStateAction}
              />
            </div>
          ) : (
            addresses.map((address) => (
              <article key={address.id} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="m-0 text-lg font-semibold text-neutral-950">{address.recipientName}</h2>
                      {address.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                          <Star size={12} />
                          Default Address
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium text-neutral-700">{address.phoneNumber}</p>
                    <p className="mt-2 text-sm leading-7 text-neutral-600">{formatAddressSummary(address)}</p>
                    {address.notes ? (
                      <p className="mt-2 text-sm text-neutral-500">{address.notes}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={() => openEditForm(address)}>
                      <Pencil size={14} />
                      Edit
                    </Button>
                    {!address.isDefault ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => void handleSetDefault(address.id)}
                        disabled={isSettingDefaultId === address.id}
                      >
                        <Star size={14} />
                        {isSettingDefaultId === address.id ? 'Saving...' : 'Set Default'}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => void handleDelete(address.id)}
                      disabled={deletingAddressId === address.id}
                    >
                      <Trash2 size={14} />
                      {deletingAddressId === address.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <MapPinned size={20} />
            </div>
            <div>
              <h2 className="m-0 text-xl font-semibold text-neutral-950">
                {editingAddressId ? 'Edit Address' : 'Add Address'}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Save delivery details for faster checkout next time.
              </p>
            </div>
          </div>

          {!showForm ? (
            <EmptyState
              icon={<MapPinned size={32} />}
              title="No form opened"
              description="Select an address to edit or add a new one to manage your address book."
              action={<Button type="button" onClick={openCreateForm}>Add Address</Button>}
            />
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Input
                label="Recipient Name"
                value={form.recipientName}
                onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
                error={formErrors.recipientName}
                disabled={isSaving}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={form.phoneNumber}
                onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                error={formErrors.phoneNumber}
                disabled={isSaving}
              />

              <Select
                label="Province"
                value={form.provinceId}
                onChange={(event) => handleProvinceChange(event.target.value)}
                error={formErrors.provinceId}
                disabled={isSaving || isLoadingProvinces}
              >
                <option value="">{isLoadingProvinces ? 'Loading provinces...' : 'Select province'}</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </Select>

              <Select
                label="City"
                value={form.cityId}
                onChange={(event) => handleCityChange(event.target.value)}
                error={formErrors.cityId}
                disabled={isSaving || !form.provinceId || isLoadingCities}
              >
                <option value="">{isLoadingCities ? 'Loading cities...' : 'Select city'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </Select>

              <Select
                label="District"
                value={form.districtId}
                onChange={(event) => handleDistrictChange(event.target.value)}
                error={formErrors.districtId}
                disabled={isSaving || !form.cityId || isLoadingDistricts}
              >
                <option value="">{isLoadingDistricts ? 'Loading districts...' : 'Select district'}</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>{district.name}</option>
                ))}
              </Select>

              <Input
                label="Postal Code"
                value={form.postalCode}
                onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))}
                error={formErrors.postalCode}
                disabled={isSaving}
              />

              <Input
                label="Street Address"
                value={form.streetAddress}
                onChange={(event) => setForm((current) => ({ ...current, streetAddress: event.target.value }))}
                error={formErrors.streetAddress}
                disabled={isSaving}
              />

              <Input
                label="Notes"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                disabled={isSaving}
                placeholder="Optional notes for this address"
              />

              <label className="flex items-center gap-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
                  disabled={isSaving}
                />
                Set as Default Address
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? 'Saving...' : editingAddressId ? 'Save Address' : 'Add Address'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </CustomerPageShell>
  );
}

export function AddressesPage() {
  return (
    <NavigationThemeProvider theme="dark">
      <AddressesPageContent />
    </NavigationThemeProvider>
  );
}
