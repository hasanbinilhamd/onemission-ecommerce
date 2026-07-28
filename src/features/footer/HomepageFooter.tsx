import { Instagram, Music2, Youtube } from 'lucide-react';
import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import {
  HERO_GRADIENT_BOTTOM,
  HERO_GRADIENT_MIDDLE,
  HERO_GRADIENT_TOP,
} from '../hero/theme';

type FooterLinkItem = {
  label: string;
  href: string;
  isExternal?: boolean;
};

type FooterCommunityItem = FooterLinkItem & {
  icon: typeof Instagram;
};

const FOOTER_GRADIENT = `linear-gradient(180deg, ${HERO_GRADIENT_BOTTOM} 0%, ${HERO_GRADIENT_MIDDLE} 52%, ${HERO_GRADIENT_TOP} 100%)`;
const FOOTER_TEXT = '#F8F6F2';
const FOOTER_MUTED = 'rgba(248,246,242,0.72)';
const FOOTER_SUBTLE = 'rgba(248,246,242,0.52)';
const FOOTER_BORDER = 'rgba(248,246,242,0.22)';
const FOOTER_HOVER = 'rgba(248,246,242,0.08)';
const FOOTER_LOGO = 'https://ik.imagekit.io/edyl3oplm/Onemission/logos/AMAN_ONEMISSION.png?updatedAt=1782542636942';
const FOOTER_NEWSLETTER_SUCCESS = 'Thank you. You are now connected to ONEMISSION updates.';
const FOOTER_NEWSLETTER_ERROR = 'Please enter a valid email address.';

const NAVIGATION_LINKS: readonly FooterLinkItem[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Collection', href: ROUTES.COLLECTION },
  { label: 'About', href: `${ROUTES.HOME}#onemission-vision` },
  { label: 'Contact', href: 'http://wa.me/6285798097779', isExternal: true },
] as const;

const SUPPORT_LINKS: readonly FooterLinkItem[] = [
  { label: 'FAQ', href: 'mailto:hello@onemissionclo.com?subject=FAQ', isExternal: true },
  { label: 'Track Order', href: ROUTES.TRACK_ORDER, isExternal: false },
  { label: 'Returns', href: 'mailto:hello@onemissionclo.com?subject=Returns', isExternal: true },
  { label: 'Privacy Policy', href: 'mailto:hello@onemissionclo.com?subject=Privacy%20Policy', isExternal: true },
  { label: 'Terms & Conditions', href: 'mailto:hello@onemissionclo.com?subject=Terms%20and%20Conditions', isExternal: true },
] as const;

const COMMUNITY_LINKS: readonly FooterCommunityItem[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/onemissionclo/', isExternal: true, icon: Instagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/@onemissionclo', isExternal: true, icon: Music2 },
  { label: 'YouTube', href: 'https://www.youtube.com/@onemissionclo', isExternal: true, icon: Youtube },
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

export function HomepageFooter() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const newsletterDescription = useMemo(() => (
    'Receive product launches, stories, and exclusive updates.'
  ), []);

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

    if (!isValidEmail) {
      setStatusMessage(FOOTER_NEWSLETTER_ERROR);
      return;
    }

    setStatusMessage(FOOTER_NEWSLETTER_SUCCESS);
    setEmail('');
  }, [email]);

  return (
    <footer
      aria-label="Homepage footer"
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: FOOTER_GRADIENT,
        color: FOOTER_TEXT,
      }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: 'clamp(700px, 78vw, 850px)',
          padding: 'clamp(72px, 10vw, 116px) clamp(20px, 4vw, 48px) clamp(56px, 8vw, 72px)',
          maxWidth: '1520px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'grid',
          alignContent: 'space-between',
          gap: 'clamp(56px, 8vw, 96px)',
        }}
      >
        <div
          className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start"
          style={{ gap: 'clamp(48px, 6vw, 88px)' }}
        >
          <div style={{ display: 'grid', gap: 'clamp(32px, 4vw, 48px)' }}>
            <div style={{ display: 'grid', gap: '24px' }}>
              <img
                src={FOOTER_LOGO}
                alt="ONEMISSION"
                style={{
                  width: 'min(100%, 420px)',
                  height: 'auto',
                }}
              />
              <p
                style={{
                  margin: 0,
                  maxWidth: '420px',
                  color: FOOTER_MUTED,
                  fontSize: 'clamp(16px, 1.8vw, 20px)',
                  lineHeight: 1.7,
                  letterSpacing: '-0.01em',
                }}
              >
                Values Matter. Built for movement. Guided by purpose.
              </p>
            </div>

            <div className="grid gap-12 sm:grid-cols-2 xl:grid-cols-3" style={{ alignItems: 'start' }}>
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
                        color: FOOTER_MUTED,
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
          </div>

          <div
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
                  color: FOOTER_MUTED,
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
                  style={{
                    width: '100%',
                    minHeight: '52px',
                    padding: '0 18px',
                    borderRadius: '16px',
                    border: `1px solid ${FOOTER_BORDER}`,
                    backgroundColor: 'rgba(255,255,255,0.08)',
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
                />
              </label>

              <button
                type="submit"
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
                  cursor: 'pointer',
                  transition: 'transform 180ms ease, background-color 180ms ease, border-color 180ms ease',
                }}
                onMouseEnter={(event) => {
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
                Subscribe
              </button>
            </form>

            {statusMessage ? (
              <p
                style={{
                  margin: 0,
                  color: FOOTER_MUTED,
                  fontSize: '13px',
                  lineHeight: 1.7,
                }}
              >
                {statusMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div
          className="flex flex-col gap-5 border-t pt-6 sm:flex-row sm:items-end sm:justify-between"
          style={{ borderColor: FOOTER_BORDER }}
        >
          <div style={{ display: 'grid', gap: '6px' }}>
            <p style={{ margin: 0, color: FOOTER_MUTED, fontSize: '13px', lineHeight: 1.7 }}>
              © 2026 ONEMISSION.
            </p>
            <p style={{ margin: 0, color: FOOTER_SUBTLE, fontSize: '13px', lineHeight: 1.7 }}>
              Built with purpose.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ color: FOOTER_MUTED, fontSize: '13px', lineHeight: 1.7 }}>Indonesia</span>
            <span style={{ color: FOOTER_SUBTLE, fontSize: '13px', lineHeight: 1.7 }}>English</span>
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '8px',
            transform: 'translateX(-50%)',
            width: '100%',
            textAlign: 'center',
            pointerEvents: 'none',
            color: 'rgba(248,246,242,0.06)',
            fontFamily: "'SF-Pro-Display', sans-serif",
            fontSize: 'clamp(84px, 18vw, 280px)',
            lineHeight: 0.86,
            letterSpacing: '-0.08em',
            fontWeight: 500,
            textTransform: 'uppercase',
            userSelect: 'none',
          }}
        >
          ONEMISSION
        </div>
      </div>
    </footer>
  );
}
