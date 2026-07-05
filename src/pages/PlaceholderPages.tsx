import { NavigationThemeProvider } from '../features/navigation';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

function ComingSoonPageContent({ title, description }: ComingSoonPageProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '104px 24px 60px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div className="rounded-3xl border border-neutral-200 bg-white px-6 py-12 text-center sm:px-10 sm:py-16">
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600 }}>
            Account
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.1, color: '#111827' }}>
            {title}
          </h1>
          <p className="mx-auto max-w-[520px] text-sm leading-7 text-neutral-500 sm:text-base">
            {description}
          </p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage(props: ComingSoonPageProps) {
  return (
    <NavigationThemeProvider theme="dark">
      <ComingSoonPageContent {...props} />
    </NavigationThemeProvider>
  );
}

export function LoginPage() {
  return (
    <PlaceholderPage
      title="Login"
      description="Customer authentication entry will be available here once the account login flow is released."
    />
  );
}

export function AddressBookPage() {
  return (
    <PlaceholderPage
      title="Address Book"
      description="Saved delivery addresses will be managed here once the address book module is released."
    />
  );
}

export function WishlistPage() {
  return (
    <PlaceholderPage
      title="Wishlist"
      description="Your saved favorite products will appear here once the wishlist module is released."
    />
  );
}

export function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Customer profile settings will be managed here once the profile module is released."
    />
  );
}
