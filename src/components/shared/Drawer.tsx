import { useEffect, useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { Overlay } from './Overlay';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useKeyPress } from '../../hooks/useKeyPress';
import { DURATION, EASING, DRAWER_WIDTHS } from '../../utils/motion';

export type DrawerPosition = 'left' | 'right' | 'bottom';
export type DrawerWidth = keyof typeof DRAWER_WIDTHS;

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: DrawerPosition;
  title?: string;
  width?: DrawerWidth;
  mobileFullScreen?: boolean;
  openMode?: 'animated' | 'instant';
  overlayColor?: string;
  overlayOpacity?: number;
  panelStyleOverrides?: CSSProperties;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// z-index values intentionally above any hero / page content (hero uses ≤ z-60)
const Z_OVERLAY = 100;
const Z_PANEL   = 110;

const PANEL_TRANSITION = `transform ${DURATION.normal}ms ${EASING.standard}`;

/**
 * Off-screen transforms use translate3d so the GPU composites the layer.
 * This avoids layout reflow during animation.
 */
const HIDDEN_TRANSFORM: Record<DrawerPosition, string> = {
  left:   'translate3d(-100%,0,0)',
  right:  'translate3d(100%,0,0)',
  bottom: 'translate3d(0,100%,0)',
};

const VISIBLE_TRANSFORM = 'translate3d(0,0,0)';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function panelStyle(position: DrawerPosition, width: DrawerWidth, mobileFullScreen: boolean): CSSProperties {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  const base: CSSProperties = {
    position: 'fixed',
    zIndex: Z_PANEL,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    transition: PANEL_TRANSITION,
    // Force GPU compositing — avoids paint during slide
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    outline: 'none',
  };

  if (position === 'left') {
    return {
      ...base,
      top: 0,
      left: 0,
      bottom: 0,
      width: DRAWER_WIDTHS[width],
      maxWidth: '100vw',
      boxShadow: '8px 0 48px rgba(0,0,0,0.18)',
    };
  }

  if (position === 'right') {
    return {
      ...base,
      top: 0,
      right: 0,
      bottom: 0,
      width: mobileFullScreen && isMobile ? '100vw' : DRAWER_WIDTHS[width],
      maxWidth: '100vw',
      height: mobileFullScreen && isMobile ? '100dvh' : undefined,
      boxShadow: mobileFullScreen && isMobile ? 'none' : '-8px 0 48px rgba(0,0,0,0.18)',
    };
  }

  // bottom
  return {
    ...base,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '90dvh',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 48px rgba(0,0,0,0.18)',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Drawer
 *
 * Fully accessible, GPU-accelerated slide-in panel.
 *
 * - translate3d transforms → GPU compositing, no layout reflow
 * - z-index 110 / overlay 100 → always above hero content (≤ z-60)
 * - Double-rAF mount pattern → initial position painted off-screen before
 *   the transition fires, making open and close feel identical
 * - Exit transition completes before unmount via setTimeout(DURATION.normal)
 */
export function Drawer({
  open,
  onClose,
  children,
  position = 'right',
  title,
  width = 'md',
  mobileFullScreen = false,
  openMode = 'animated',
  overlayColor,
  overlayOpacity,
  panelStyleOverrides,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const containerRef = useFocusTrap<HTMLDivElement>(open);
  useScrollLock(open);
  useKeyPress('Escape', onClose, open);

  useEffect(() => {
    if (open) {
      setMounted(true);

      if (openMode === 'instant') {
        setVisible(true);
        return undefined;
      }

      // Two frames: first paints off-screen, second triggers the transition.
      // This guarantees opening and closing use the exact same duration.
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), DURATION.normal);
    return () => clearTimeout(timer);
  }, [open, openMode]);

  if (!mounted) return null;

  return (
    <>
      <Overlay
        visible={visible}
        onClick={onClose}
        zIndex={Z_OVERLAY}
        backgroundColor={overlayColor}
        targetOpacity={overlayOpacity}
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Drawer'}
        tabIndex={-1}
        style={{
          ...panelStyle(position, width, mobileFullScreen),
          ...panelStyleOverrides,
          transform: visible ? VISIBLE_TRANSFORM : HIDDEN_TRANSFORM[position],
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid #F3F4F6',
            flexShrink: 0,
          }}
        >
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: '#111827',
                flex: 1,
                minWidth: 0,
                overflowWrap: 'break-word',
              }}
            >
              {title}
            </h2>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              flexShrink: 0,
              transition: `background-color ${DURATION.fast}ms ${EASING.standard}, color ${DURATION.fast}ms ${EASING.standard}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>{children}</div>
      </div>
    </>
  );
}
