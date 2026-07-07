import { CircleUserRound, LogOut, Package2, UserRound, ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { useNavigationTheme } from '../navigation';
import { useAuthenticatedCustomer } from './useAuthenticatedCustomer';

interface MenuItem {
  label: string;
  onSelect: () => void | Promise<void>;
  icon: typeof Package2;
  tone?: 'default' | 'danger';
}

function getMenuItemClassName(tone: 'default' | 'danger' = 'default') {
  return tone === 'danger'
    ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
    : 'text-neutral-700 hover:bg-neutral-50 focus:bg-neutral-50';
}

export function AccountMenu() {
  const navigate = useNavigate();
  const { colors } = useNavigationTheme();
  const { user, profile, isLoading, logout } = useAuthenticatedCustomer();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const focusMenuItem = useCallback((index: number) => {
    requestAnimationFrame(() => {
      itemRefs.current[index]?.focus();
    });
  }, []);

  const menuItems = useMemo<MenuItem[]>(() => {
    if (user?.email) {
      return [
        {
          label: 'My Profile',
          icon: UserRound,
          onSelect: () => navigate(ROUTES.ACCOUNT_PROFILE),
        },
        {
          label: 'My Orders',
          icon: Package2,
          onSelect: () => navigate(ROUTES.ORDERS),
        },
        {
          label: 'Logout',
          icon: LogOut,
          tone: 'danger',
          onSelect: async () => {
            setIsSigningOut(true);
            try {
              await logout();
              navigate(ROUTES.HOME);
            } finally {
              setIsSigningOut(false);
            }
          },
        },
      ];
    }

    return [
      {
        label: 'Login',
        icon: UserRound,
        onSelect: () => navigate(ROUTES.LOGIN),
      },
      {
        label: 'Track Order',
        icon: Package2,
        onSelect: () => navigate(ROUTES.TRACK_ORDER),
      },
    ];
  }, [logout, navigate, user?.email]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || containerRef.current?.contains(target)) {
        return;
      }

      closeMenu();
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      closeMenu();
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeMenu, isOpen]);

  const openMenu = useCallback((focusIndex = 0) => {
    setIsOpen(true);
    focusMenuItem(focusIndex);
  }, [focusMenuItem]);

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(0);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(Math.max(menuItems.length - 1, 0));
    }
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const activeIndex = itemRefs.current.findIndex((item) => item === document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % menuItems.length;
      focusMenuItem(nextIndex);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = activeIndex <= 0 ? menuItems.length - 1 : activeIndex - 1;
      focusMenuItem(nextIndex);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusMenuItem(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusMenuItem(Math.max(menuItems.length - 1, 0));
      return;
    }

    if (event.key === 'Tab') {
      closeMenu();
    }
  };

  const handleSelect = async (item: MenuItem) => {
    closeMenu();
    await item.onSelect();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        style={{
          border: 'none',
          background: 'none',
          color: colors.foreground,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '8px',
          lineHeight: 1,
          gap: '2px',
        }}
      >
        {profile ? (
          <>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold uppercase text-white">
              {profile.initials}
            </span>
            <span className="hidden max-w-[110px] truncate text-sm font-medium sm:inline-block">
              {profile.fullName || profile.email}
            </span>
          </>
        ) : (
          <>
            <CircleUserRound size={typeof window !== 'undefined' && window.innerWidth < 640 ? 18 : 20} strokeWidth={2} />
            <span className="hidden text-sm font-medium sm:inline-block">Account</span>
          </>
        )}
        <ChevronDown size={14} strokeWidth={2} style={{ opacity: 0.8 }} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Account menu"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-[calc(100%+10px)] min-w-[216px] rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_20px_48px_rgba(17,24,39,0.14)]"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-neutral-500">
              Loading account...
            </div>
          ) : (
            <>
              {profile ? (
                <div className="mb-2 rounded-xl bg-neutral-50 px-3 py-2">
                  <p className="m-0 text-sm font-semibold text-neutral-900">
                    {profile.fullName || 'Customer Account'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {profile.email}
                  </p>
                </div>
              ) : null}

              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isLogoutItem = item.label === 'Logout';

                return (
                  <button
                    key={item.label}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    disabled={isSigningOut && isLogoutItem}
                    onClick={() => void handleSelect(item)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none ${getMenuItemClassName(item.tone)}`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{isSigningOut && isLogoutItem ? 'Logging out...' : item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
