import { fadeTransition, DURATION } from '../../utils/motion';

interface OverlayProps {
  visible: boolean;
  onClick?: () => void;
  className?: string;
  zIndex?: number;
  backgroundColor?: string;
  targetOpacity?: number;
}

/**
 * Overlay
 *
 * Full-screen semi-transparent backdrop with fade in/out.
 *
 * Opacity is intentionally kept low (0.25) when used alongside the
 * App-level blur/dim effect on the hero — the two layers combine to
 * create the right visual depth without over-darkening.
 */
export function Overlay({
  visible,
  onClick,
  className = '',
  zIndex = 100,
  backgroundColor = 'rgba(0, 0, 0, 0.28)',
  targetOpacity = 1,
}: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        backgroundColor,
        opacity: visible ? targetOpacity : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: fadeTransition(DURATION.normal),
        // GPU layer so the fade doesn't trigger paint
        willChange: 'opacity',
      }}
    />
  );
}
