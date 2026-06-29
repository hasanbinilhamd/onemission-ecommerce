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
  /** Controls open/close state. */
  open: boolean;
  /** Called when the user dismisses the drawer (ESC, overlay click, close button). */
  onClose: () => void;
  children: ReactNode;
  /** Which edge the drawer slides in from. Default: 'right'. */
  position?: DrawerPosition;
  /** Optional header title. */
  title?: string;
  /** Panel width preset (ignored for bottom position). Default: 'md'. */
  width?: DrawerWidth;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PANEL_TRANSITION = `transform ${DURATION.normal}ms ${EASING.standard}`;

/** Off-screen transform applied when the drawer is closed. */
const HIDDEN_TRANSFORM: Record<DrawerPosition, string> = {
  left: 'translateX(-100%)',
  right: 'translateX(100%)',
  bottom: 'translateY(100%)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function panelStyle(position: DrawerPosition, width: DrawerWidth): CSSProperties {
  const base: CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    transition: PANEL_TRANSITION,
    willChange: 'transform',
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
      boxShadow: '8px 0 32px rgba(0,0,0,0.12)',
    };
  }

  if (position === 'right') {
    return {
      ...base,
      top: 0,
      right: 0,
      bottom: 0,
      width: DRAWER_WIDTHS[width],
      maxWidth: '100vw',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
    };
  }

  // bottom
  return {
    ...base,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '90vh',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Drawer
 *
 * A fully accessible, animated slide-in panel.
 *
 * Features:
 * - Smooth CSS transform enter / exit animations
 * - Overlay backdrop with fade
 * - Body scroll lock (restores scroll position on close)
 * - ESC key to close
 * - Click outside (overlay) to close
 * - Focus trap with Tab / Shift+Tab cycling
 * - Focus restoration to previously focused element
 * - Responsive: configurable width, full-width on mobile via CSS max-width
 * - Positions: left | right | bottom
 */
export function Drawer({
  open,
  onClose,
  children,
  position = 'right',
  title,
  width = 'md',
}: DrawerProps) {
  // `mounted` gates DOM presence; `visible` drives the CSS animation.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const containerRef = useFocusTrap<HTMLDivElement>(open);
  useScrollLock(open);
  useKeyPress('Escape', onClose, open);

  useEffect(() => {
    if (open) {
      // Mount first, then trigger the enter animation in the next two frames
      // so the browser has time to paint the initial (off-screen) position.
      setMounted(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      // Trigger exit animation, then unmount after the transition completes.
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), DURATION.normal);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <Overlay visible={visible} onClick={onClose} zIndex={40} />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Drawer'}
        tabIndex={-1}
        style={{
          ...panelStyle(position, width),
          transform: visible ? 'translate(0)' : HIDDEN_TRANSFORM[position],
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
        <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
      </div>
    </>
  );
}
