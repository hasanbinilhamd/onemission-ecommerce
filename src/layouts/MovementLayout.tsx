import { Outlet } from 'react-router-dom';
import { PrimaryNavigation } from '../features/navigation';

/**
 * MovementLayout — layout for the movement/marketing destinations.
 *
 * Renders the primary navigation (HOME | MISSION | SHOP | JOURNAL | DONATE)
 * above the routed page. The navigation is fixed-positioned, so it does not
 * affect page flow (the Home hero keeps its full-viewport sticky behavior).
 *
 * Focused flows (/cart, /checkout, /account/*, auth, /track-order) are
 * intentionally NOT wrapped by this layout.
 */
export function MovementLayout() {
  return (
    <>
      <PrimaryNavigation />
      <Outlet />
    </>
  );
}
