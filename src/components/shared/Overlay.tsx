import { fadeTransition, DURATION } from '../../utils/motion';

interface OverlayProps {
  /** Controls opacity and pointer-events — the overlay stays mounted during exit. */
  visible: boolean;
  onClick?: () => void;
  className?: string;
  zIndex?: number;
}

/**
 * Overlay
 *
 * A full-screen semi-transparent backdrop with a fade in/out transition.
 * Reused by Drawer, Modal, and any future sheet-style components.
 *
 * The caller controls mounting — keep the Overlay in the DOM during the exit
 * animation so the fade-out plays before the parent unmounts.
 */
export function Overlay({ visible, onClick, className = '', zIndex = 40 }: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: fadeTransition(DURATION.normal),
      }}
    />
  );
}
