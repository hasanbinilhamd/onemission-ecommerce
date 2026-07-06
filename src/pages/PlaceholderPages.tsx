import { NavigationThemeProvider } from '../features/navigation';
import { CustomerPageHeader, CustomerPageShell } from '../features/customer/CustomerPageLayout';

interface ComingSoonPageProps {
  sectionLabel: string;
  title: string;
  description: string;
}

function ComingSoonPageContent({ sectionLabel, title, description }: ComingSoonPageProps) {
  return (
    <CustomerPageShell maxWidth="760px">
      <CustomerPageHeader
        sectionLabel={sectionLabel}
        title={title}
        description={description}
      />

      <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
          Coming Soon
        </p>
      </div>
    </CustomerPageShell>
  );
}

function PlaceholderPage(props: ComingSoonPageProps) {
  return (
    <NavigationThemeProvider theme="dark">
      <ComingSoonPageContent {...props} />
    </NavigationThemeProvider>
  );
}

export function ForgotPasswordPage() {
  return (
    <PlaceholderPage
      sectionLabel="Customer Account"
      title="Forgot Password"
      description="Password reset will be available here once the customer recovery flow is released."
    />
  );
}

export function AddressBookPage() {
  return (
    <PlaceholderPage
      sectionLabel="Customer Account"
      title="Address Book"
      description="Saved delivery addresses will be managed here once the address book module is released."
    />
  );
}

export function WishlistPage() {
  return (
    <PlaceholderPage
      sectionLabel="Customer Account"
      title="Wishlist"
      description="Your saved favorite products will appear here once the wishlist module is released."
    />
  );
}

export function ProfilePage() {
  return (
    <PlaceholderPage
      sectionLabel="Customer Account"
      title="Profile"
      description="Customer profile settings will be managed here once the profile module is released."
    />
  );
}
