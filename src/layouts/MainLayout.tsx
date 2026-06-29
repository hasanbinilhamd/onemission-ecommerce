import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout — root application shell.
 *
 * Currently renders children directly so the Hero section occupies the full
 * viewport without modification. As the app grows, add a persistent Navbar,
 * Footer, Toast container, etc. here.
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      {/* TODO: <Navbar /> */}
      <main>{children}</main>
      {/* TODO: <Footer /> */}
    </>
  );
}
