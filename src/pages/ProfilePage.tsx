import { Save, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/config/routes';
import { Button, Input, LoadingSkeleton } from '../components/shared';
import { useAuthenticatedCustomer } from '../features/customer';
import { updateCustomerProfile } from '../services/api/customerService';
import { formatDate } from '../utils/formatting';
import { isRequired } from '../utils/validation';

interface ProfileFormState {
  fullName: string;
  phone: string;
}

interface ProfileFormErrors {
  fullName?: string;
  phone?: string;
}

function validateProfileForm(values: ProfileFormState): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!isRequired(values.fullName)) {
    errors.fullName = 'Full Name is required.';
  }

  if (!isRequired(values.phone)) {
    errors.phone = 'Phone Number is required.';
  }

  return errors;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isLoading,
    errorMessage,
    getValidAccessToken,
    reloadAuthenticatedCustomer,
  } = useAuthenticatedCustomer();
  const [form, setForm] = useState<ProfileFormState>({ fullName: '', phone: '' });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isLoading, navigate, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      fullName: user.customerName || '',
      phone: user.phone || '',
    });
  }, [user?.customerName, user?.phone, user]);

  const joinedDate = useMemo(() => (user?.createdAt ? formatDate(user.createdAt) : '—'), [user?.createdAt]);
  const customerIdentifier = useMemo(() => user?.customerCode || user?.id || '', [user?.customerCode, user?.id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateProfileForm(form);
    setErrors(nextErrors);
    setStatusMessage('');

    if (Object.keys(nextErrors).length > 0 || !user?.email) {
      return;
    }

    setIsSaving(true);

    try {
      const accessToken = await getValidAccessToken();
      await updateCustomerProfile({
        customerName: form.fullName,
        email: user.email,
        phone: form.phone,
        accessToken: accessToken || '',
      });
      await reloadAuthenticatedCustomer();
      setStatusMessage('Profile updated successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update your profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-400">My Profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-950">Profile Settings</h2>
        <p className="mt-2 text-sm leading-7 text-neutral-500">Update your customer profile and keep your checkout autofill accurate.</p>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white">
            <UserRound size={24} />
          </div>
          <div>
            <p className="m-0 text-lg font-semibold text-neutral-950">{profile.fullName || user.customerName}</p>
            <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Full Name"
                autoComplete="name"
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                error={errors.fullName}
                disabled={isSaving}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={user.email}
              readOnly
              disabled
            />

            <Input
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              error={errors.phone}
              disabled={isSaving}
            />
          </div>

          <div className="grid gap-4 rounded-2xl bg-neutral-50 px-4 py-4 text-sm text-neutral-600 sm:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Registration Date</p>
              <p className="mt-1 font-medium text-neutral-900">{joinedDate}</p>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Customer Number</p>
              <p className="mt-1 font-medium text-neutral-900">{customerIdentifier || '—'}</p>
            </div>
          </div>

          {statusMessage ? (
            <div className={`rounded-2xl px-4 py-3 text-sm ${statusMessage.toLowerCase().includes('successfully') ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
              {statusMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
