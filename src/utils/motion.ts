// ─── Motion System ────────────────────────────────────────────────────────────
// Centralised animation constants.
// All components should reference these values instead of hardcoding durations
// or easing curves.

export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 450,
} as const;

export type MotionDuration = keyof typeof DURATION;

export const EASING = {
  /** General-purpose: accelerate then decelerate. */
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Enters: decelerates into place. */
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Exits: accelerates out. */
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Snappy transitions (modals, alerts). */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

export type MotionEasing = keyof typeof EASING;

/** Width presets for Drawer panels. */
export const DRAWER_WIDTHS = {
  sm: '280px',
  md: '380px',
  lg: '480px',
  full: '100%',
} as const;

export type DrawerWidth = keyof typeof DRAWER_WIDTHS;

// ─── CSS transition string builders ──────────────────────────────────────────

/** Slide (transform) transition — used by Drawer. */
export function drawerTransition(duration = DURATION.normal): string {
  return `transform ${duration}ms ${EASING.standard}`;
}

/** Opacity transition — used by Overlay and Fade. */
export function fadeTransition(duration: number = DURATION.fast): string {
  return `opacity ${duration}ms ${EASING.standard}`;
}

/** Generic transform transition — used by Slide-in elements. */
export function slideTransition(duration = DURATION.normal): string {
  return `transform ${duration}ms ${EASING.decelerate}`;
}

/** Scale transition — reserved for future Modal/Popover. */
export function scaleTransition(duration = DURATION.fast): string {
  return `transform ${duration}ms ${EASING.decelerate}, opacity ${duration}ms ${EASING.decelerate}`;
}
