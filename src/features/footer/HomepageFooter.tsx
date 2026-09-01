import { AlertCircle, CheckCircle2, ChevronDown, Instagram, Loader2, Music2, Youtube } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { NewsletterSubscribeError, subscribeNewsletter } from '../../services/api/newsletterService';

type FooterLinkItem = {
  label: string;
  href: string;
  isExternal?: boolean;
};

type FooterCommunityItem = FooterLinkItem & {
  icon: typeof Instagram;
};

type NewsletterToastState = {
  type: 'success' | 'error';
  title: string;
  message: string;
  details?: string[];
} | null;

const FOOTER_BACKGROUND = '#0A0A0A';
const FOOTER_TEXT = '#FFFFFF';
const FOOTER_MUTED = 'rgba(255,255,255,0.78)';
const FOOTER_DESCRIPTION = 'rgba(255,255,255,0.55)';
const FOOTER_SUBTLE = 'rgba(255,255,255,0.42)';
const FOOTER_BORDER = 'rgba(255,255,255,0.12)';
const FOOTER_HOVER = 'rgba(255,255,255,0.08)';
const FOOTER_LOGO = 'https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942';
const FOOTER_NEWSLETTER_SUCCESS_TITLE = 'Welcome to ONEMISSION.';
const FOOTER_NEWSLETTER_SUCCESS_DESCRIPTION = 'Thank you for joining our movement.';
const FOOTER_NEWSLETTER_SUCCESS_POINTS = [
  'New collections',
  'Product launches',
  'Stories',
  'Exclusive releases',
  'Community events',
] as const;

const NAVIGATION_LINKS: readonly FooterLinkItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Shop', href: ROUTES.SHOP },
  { label: 'Mission', href: ROUTES.MISSION },
  { label: 'Impact', href: ROUTES.IMPACT },
  { label: 'Donate', href: ROUTES.DONATE },
  { label: 'About', href: `${ROUTES.HOME}#onemission-vision` },
  { label: 'Contact', href: 'http://wa.me/6285798097779', isExternal: true },
] as const;

const SUPPORT_LINKS: readonly FooterLinkItem[] = [
  { label: 'FAQ', href: ROUTES.FAQ },
  { label: 'Track Order', href: ROUTES.TRACK_ORDER },
  // { label: 'Returns', href: 'mailto:hello@onemissionclo.com?subject=Returns', isExternal: true },
  { label: 'Privacy Policy', href: ROUTES.PRIVACY },
  { label: 'Terms & Conditions', href: ROUTES.TERMS },
] as const;

const COMMUNITY_LINKS: readonly FooterCommunityItem[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/onemissionclo/', isExternal: true, icon: Instagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/@hasanbinilhamd', isExternal: true, icon: Music2 },
  { label: 'YouTube', href: 'https://www.youtube.com/@onemissionworld', isExternal: true, icon: Youtube },
] as const;

function FooterLink({ item }: { item: FooterLinkItem }) {
  const sharedStyle: CSSProperties = {
    color: FOOTER_MUTED,
    fontSize: '14px',
    lineHeight: 1.6,
    textDecoration: 'none',
    transition: 'opacity 180ms ease, color 180ms ease',
  };

  if (item.isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        style={sharedStyle}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = FOOTER_TEXT;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = FOOTER_MUTED;
        }}
      >
        {item.label}
      </a>
    );
  }

  if (item.href.startsWith('/#')) {
    return (
      <a
        href={item.href}
        style={sharedStyle}
        onMouseEnter={(event) => {
          event.currentTarget.style.color = FOOTER_TEXT;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.color = FOOTER_MUTED;
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      style={sharedStyle}
      onMouseEnter={(event) => {
        event.currentTarget.style.color = FOOTER_TEXT;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = FOOTER_MUTED;
      }}
    >
      {item.label}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <p
        style={{
          margin: 0,
          color: FOOTER_SUBTLE,
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </p>
      <div style={{ display: 'grid', gap: '12px' }}>{children}</div>
    </div>
  );
}

function MobileFooterAccordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div style={{ borderTop: `1px solid ${FOOTER_BORDER}` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          minHeight: '48px',
          border: 'none',
          background: 'transparent',
          color: FOOTER_TEXT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '14px 0',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: FOOTER_SUBTLE }}>{title}</span>
        <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease', color: FOOTER_MUTED, flexShrink: 0 }} />
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 220ms ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gap: '12px', padding: '2px 0 18px' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

function NewsletterToast({ toastState }: { toastState: NewsletterToastState }) {
  if (!toastState) return null;

  const isSuccess = toastState.type === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 120,
        width: 'min(100vw - 40px, 360px)',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF',
        color: '#111827',
        border: '1px solid rgba(17,24,39,0.08)',
        boxShadow: '0 24px 56px rgba(17,24,39,0.16)',
        padding: '18px 18px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: isSuccess ? '#059669' : '#DC2626',
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{toastState.title}</p>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: 'rgba(17,24,39,0.74)' }}>{toastState.message}</p>
          {Array.isArray(toastState.details) && toastState.details.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '4px', color: 'rgba(17,24,39,0.72)', fontSize: '13px', lineHeight: 1.6 }}>
              {toastState.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function normalizeNewsletterEmail(value: string): string {
  return String(value || '').trim().toLowerCase();
}

function isValidNewsletterEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function HomepageFooter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastState, setToastState] = useState<NewsletterToastState>(null);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);

  const newsletterDescription = useMemo(() => (
    'Receive product launches, stories, and exclusive updates.'
  ), []);

  useEffect(() => {
    if (!toastState) return undefined;
    const timeoutId = window.setTimeout(() => {
      setToastState(null);
    }, 5200);
    return () => window.clearTimeout(timeoutId);
  }, [toastState]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = normalizeNewsletterEmail(email);
    if (!normalizedEmail || normalizedEmail.length > 255 || !isValidNewsletterEmail(normalizedEmail)) {
      setToastState({
        type: 'error',
        title: 'Subscription unavailable.',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeNewsletter(normalizedEmail);
      setToastState({
        type: 'success',
        title: FOOTER_NEWSLETTER_SUCCESS_TITLE,
        message: FOOTER_NEWSLETTER_SUCCESS_DESCRIPTION,
        details: [...FOOTER_NEWSLETTER_SUCCESS_POINTS],
      });
      setEmail('');
    } catch (error) {
      const message = error instanceof NewsletterSubscribeError
        ? error.message
        : 'Something went wrong. Please try again later.';
      setToastState({
        type: 'error',
        title: message === 'You are already part of the ONEMISSION community.'
          ? 'Already subscribed.'
          : 'Subscription unavailable.',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting]);

  return (
    <footer
      aria-label="Homepage footer"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: FOOTER_BACKGROUND,
        color: FOOTER_TEXT,
      }}
    >
      <style>
        {`
          .homepage-footer-newsletter-input::placeholder {
            color: rgba(255,255,255,0.45);
            opacity: 1;
          }
          .homepage-footer-shell {
            min-height: clamp(700px, 78vw, 850px);
            padding: clamp(72px, 10vw, 116px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 72px);
          }
          .homepage-footer-desktop-links {
            display: grid;
          }
          .homepage-footer-mobile-links {
            display: none;
          }
          @media (max-width: 767px) {
            .homepage-footer-shell {
              min-height: auto;
              padding: 40px 20px 28px;
              gap: 34px !important;
            }
            .homepage-footer-desktop-links {
              display: none !important;
            }
            .homepage-footer-mobile-links {
              display: grid !important;
              gap: 0;
            }
            .homepage-footer-main-grid,
            .homepage-footer-left {
              gap: 0 !important;
            }
            .homepage-footer-brand,
            .homepage-footer-newsletter {
              display: none !important;
            }
            .homepage-footer-bottom {
              padding-top: 20px !important;
            }
          }
        `}
      </style>
      <NewsletterToast toastState={toastState} />
      <div
        className="homepage-footer-shell"
        style={{
          position: 'relative',
          maxWidth: '1520px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'grid',
          alignContent: 'space-between',
          gap: 'clamp(56px, 8vw, 96px)',
        }}
      >
        <div
          className="homepage-footer-main-grid grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start"
          style={{ gap: 'clamp(48px, 6vw, 88px)' }}
        >
          <div className="homepage-footer-left" style={{ display: 'grid', gap: 'clamp(32px, 4vw, 48px)' }}>
            <div className="homepage-footer-brand" style={{ display: 'grid'}}>
              <img
                src={FOOTER_LOGO}
                alt="ONEMISSION"
                className="homepage-footer-logo"
                style={{
                  width: 'min(100%, 420px)',
                  height: 'auto',
                }}
              />
              <p
                style={{
                  margin: 0,
                  maxWidth: '420px',
                  color: FOOTER_DESCRIPTION,
                  fontSize: 'clamp(16px, 1.8vw, 20px)',
                  lineHeight: 1.7,
                  letterSpacing: '-0.01em',
                }}
              >
                {/* Values Matter. Built for movement. Guided by purpose. */}
                So, Let's Bring Back The Value, Because Muslim Values Matter. Barakallahu fiikum.
              </p>
            </div>

            <div className="homepage-footer-desktop-links gap-12 sm:grid-cols-2 xl:grid-cols-3" style={{ alignItems: 'start' }}>
              <FooterColumn title="Navigation">
                {NAVIGATION_LINKS.map((item) => <FooterLink key={item.label} item={item} />)}
              </FooterColumn>

              <FooterColumn title="Support">
                {SUPPORT_LINKS.map((item) => <FooterLink key={item.label} item={item} />)}
              </FooterColumn>

              <FooterColumn title="Community">
                {COMMUNITY_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: FOOTER_DESCRIPTION,
                        fontSize: '14px',
                        lineHeight: 1.6,
                        textDecoration: 'none',
                        transition: 'color 180ms ease, opacity 180ms ease',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.color = FOOTER_TEXT;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.color = FOOTER_MUTED;
                      }}
                    >
                      <Icon size={16} strokeWidth={1.9} />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </FooterColumn>
            </div>

            <div className="homepage-footer-mobile-links">
              <MobileFooterAccordion title="Navigation" open={mobileNavigationOpen} onToggle={() => setMobileNavigationOpen((current) => !current)}>
                {NAVIGATION_LINKS.map((item) => <FooterLink key={item.label} item={item} />)}
              </MobileFooterAccordion>
              <MobileFooterAccordion title="Support" open={mobileSupportOpen} onToggle={() => setMobileSupportOpen((current) => !current)}>
                {SUPPORT_LINKS.map((item) => <FooterLink key={item.label} item={item} />)}
              </MobileFooterAccordion>
              <div style={{ borderTop: `1px solid ${FOOTER_BORDER}`, paddingTop: '16px', display: 'grid', gap: '14px' }}>
                <p style={{ margin: 0, color: FOOTER_SUBTLE, fontSize: '12px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Community</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {COMMUNITY_LINKS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '999px',
                          border: `1px solid ${FOOTER_BORDER}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: FOOTER_MUTED,
                          textDecoration: 'none',
                        }}
                      >
                        <Icon size={18} strokeWidth={1.9} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div
            className="homepage-footer-newsletter"
            style={{
              width: '100%',
              maxWidth: '420px',
              justifySelf: 'end',
              display: 'grid',
              gap: '20px',
            }}
          >
            <div style={{ display: 'grid', gap: '12px' }}>
              <p
                style={{
                  margin: 0,
                  color: FOOTER_TEXT,
                  fontFamily: "'SF-Pro-Display', sans-serif",
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  lineHeight: 1,
                  letterSpacing: '-0.04em',
                  fontWeight: 400,
                }}
              >
                Stay connected.
              </p>
              <p
                style={{
                  margin: 0,
                  color: FOOTER_DESCRIPTION,
                  fontSize: '15px',
                  lineHeight: 1.75,
                  maxWidth: '32ch',
                }}
              >
                {newsletterDescription}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '10px' }}>
                <span
                  style={{
                    color: FOOTER_SUBTLE,
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  Email Address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="homepage-footer-newsletter-input"
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '0 18px',
                    borderRadius: '16px',
                    border: `1px solid ${FOOTER_BORDER}`,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: FOOTER_TEXT,
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = 'rgba(248,246,242,0.54)';
                    event.currentTarget.style.boxShadow = '0 0 0 3px rgba(248,246,242,0.10)';
                    event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = FOOTER_BORDER;
                    event.currentTarget.style.boxShadow = 'none';
                    event.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  }}
                  disabled={isSubmitting}
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  minHeight: '52px',
                  padding: '0 20px',
                  borderRadius: '999px',
                  border: `1px solid ${FOOTER_BORDER}`,
                  backgroundColor: 'transparent',
                  color: FOOTER_TEXT,
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'transform 180ms ease, background-color 180ms ease, border-color 180ms ease',
                  opacity: isSubmitting ? 0.72 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(event) => {
                  if (isSubmitting) return;
                  event.currentTarget.style.transform = 'translate3d(0, -2px, 0)';
                  event.currentTarget.style.backgroundColor = FOOTER_HOVER;
                  event.currentTarget.style.borderColor = 'rgba(248,246,242,0.38)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = 'translate3d(0, 0, 0)';
                  event.currentTarget.style.backgroundColor = 'transparent';
                  event.currentTarget.style.borderColor = FOOTER_BORDER;
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                <span>{isSubmitting ? 'Subscribing…' : 'Subscribe'}</span>
              </button>
            </form>
          </div>
        </div>

        <div
          className="homepage-footer-bottom flex flex-col border-t pt-6 sm:flex-row sm:items-end justify-between"
          style={{ borderColor: FOOTER_BORDER }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <p style={{ margin: 0, color: FOOTER_MUTED, fontSize: '13px', lineHeight: 1.7 }}>
              © 2026 ONEMISSION.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* <span style={{ color: FOOTER_MUTED, fontSize: '13px', lineHeight: 1.7 }}>Indonesia</span> */}
            <span style={{ color: FOOTER_SUBTLE, fontSize: '13px', lineHeight: 1.7 }}>Built with purpose.</span>
          </div>
        </div>

        {/* <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '8px',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center',
            pointerEvents: 'none',

            color: 'rgba(255,255,255,0.04)',

            fontFamily: "'SF-Pro-Display', sans-serif",

            // Responsive
            fontSize: 'clamp(56px, 11vw, 260px)',

            lineHeight: 0.9,

            letterSpacing: 'clamp(-2px, -0.35vw, -18px)',

            fontWeight: 500,

            textTransform: 'uppercase',

            userSelect: 'none',

            whiteSpace: 'nowrap',

            paddingInline: 'clamp(12px, 4vw, 48px)',

            boxSizing: 'border-box',
          }}
        >
          ONEMISSION
        </div> */}
      </div>
    </footer>
  );
}
